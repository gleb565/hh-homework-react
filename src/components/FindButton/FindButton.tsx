import { useState, useEffect, useCallback, useRef } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { type RootState, type AppDispatch } from '../../store/store';
import { fetchStarted, candidatesLoaded, winnerSelected, fetchFailed, type Reviewer } from '../../store/review';
import './FindButton.less';

interface Settings {
    login: string;
    repo: string;
    blacklist: string;
}

const duration = 2000;
const interval = 120;

function getSettings(): Settings | null {
    try {
        const raw = localStorage.getItem('githubSettings');
        return raw ? JSON.parse(raw) : null;
    } catch {
        return null;
    }
}

async function fetchCandidates(repo: string, currentLogin: string, blacklist: string[]): Promise<Reviewer[]> {
    const [owner, repoName] = repo.split('/');
    if (!owner || !repoName) throw new Error('Неверный формат репозитория!');

    const response = await fetch(`https://api.github.com/repos/${owner}/${repoName}/pulls?state=all&per_page=100`, {
        headers: { Accept: 'application/vnd.github+json' },
    });

    if (!response.ok) {
        if (response.status === 404) throw new Error('Репозиторий не найден');
    }

    const pulls = await response.json();
    const seen = new Set<string>();
    const result: Reviewer[] = [];

    const addUser = (user: { login: string; avatar_url: string; html_url: string } | null) => {
        if (!user) return;

        const login = user.login.toLowerCase();
        if (login === currentLogin.toLowerCase()) return;
        if (blacklist.some((b) => b.toLowerCase() === login)) return;
        if (seen.has(login)) return;

        seen.add(login);
        result.push({
            login: user.login,
            avatar_url: user.avatar_url,
            html_url: user.html_url,
        });
    };

    for (const pr of pulls) {
        addUser(pr.user);
        (pr.requested_reviewers ?? []).forEach(addUser);
    }

    return result;
}

function randomFrom<T>(arr: T[]): T {
    return arr[Math.floor(Math.random() * arr.length)];
}

function FindButton() {
    const dispatch = useDispatch<AppDispatch>();
    const { winner, status, error } = useSelector((state: RootState) => state.reviewer);

    const [displayed, setDisplayed] = useState<Reviewer | null>(null);
    const [currentUser, setCurrentUser] = useState('');
    const shuffleRef = useRef<ReturnType<typeof setInterval> | null>(null);

    const stopShuffle = useCallback(() => {
        if (shuffleRef.current) {
            clearInterval(shuffleRef.current);
            shuffleRef.current = null;
        }
    }, []);

    useEffect(() => () => stopShuffle(), [stopShuffle]);

    const handleFind = useCallback(async () => {
        stopShuffle();
        setDisplayed(null);

        const settings = getSettings();
        if (!settings?.login || !settings?.repo) {
            dispatch(fetchFailed('Заполните поля в настройках'));
            return;
        }

        const blacklist = settings.blacklist
            ? settings.blacklist
                  .split(',')
                  .map((s) => s.trim())
                  .filter(Boolean)
            : [];

        setCurrentUser(settings.login);
        dispatch(fetchStarted());

        try {
            const result = await fetchCandidates(settings.repo, settings.login, blacklist);

            if (result.length === 0) {
                dispatch(fetchFailed('Кандидаты не найдены!'));
                return;
            }
            dispatch(candidatesLoaded(result));

            const chosen = randomFrom(result);
            shuffleRef.current = setInterval(() => {
                setDisplayed(randomFrom(result));
            }, duration);

            setTimeout(() => {
                stopShuffle();
                setDisplayed(chosen);
                dispatch(winnerSelected(chosen));
            }, interval);
        } catch (err) {
            dispatch(fetchFailed(err instanceof Error ? err.message : 'Неизвестная ошибка'));
        }
    }, [dispatch, stopShuffle]);

    const isSearching = status === 'loading' || status === 'shuffling';
    const shownReviewer = status === 'done' ? winner : displayed;

    return (
        <div className="find-button-container">
            {currentUser && (status === 'shuffling' || status === 'done') && (
                <div className="current-user">
                    <span className="label">Текущий пользователь:</span>
                    <span className="login">@{currentUser}</span>
                </div>
            )}

            <button
                className={`find-btn ${isSearching ? 'find-btn--searching' : ''}`}
                onClick={handleFind}
                disabled={isSearching}
            >
                {status === 'loading' ? 'Загрузка...' : status === 'shuffling' ? 'Выбираем...' : 'Найти ревьюера'}
            </button>

            {shownReviewer && (status === 'shuffling' || status === 'done') && (
                <div
                    className={`reviewer-card ${status === 'done' ? 'reviewer-card--winner' : 'reviewer-card--shuffling'}`}
                >
                    <img className="reviewer-avatar" src={shownReviewer.avatar_url} alt={shownReviewer.login} />
                    <div className="reviewer-info">
                        <span className="reviewer-label">{status === 'done' ? 'Ревьюер найден!' : 'Поиск...'}</span>
                        <a className="reviewer-login" href={shownReviewer.html_url} target="_blank" rel="noreferrer">
                            @{shownReviewer.login}
                        </a>
                    </div>
                </div>
            )}

            {status === 'error' && error && <p className="find-error">{error}</p>}
        </div>
    );
}

export default FindButton;
