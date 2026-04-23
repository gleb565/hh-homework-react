import { useState } from 'react';
import './Settings.less';

function Settings() {
    const [isVisible, setIsVisible] = useState(false);
    const [formData, setFormData] = useState({
        login: '',
        repo: '',
        blacklist: '',
    });

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setFormData({
            ...formData,
            [e.target.name]: e.target.value,
        });
    };

    const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        localStorage.setItem('githubSettings', JSON.stringify(formData));
    };

    return (
        <div className="container">
            <button type="button" onClick={() => setIsVisible(!isVisible)} className="settings-button">
                {isVisible ? 'Скрыть' : 'Настройки'}
            </button>

            {isVisible && (
                <form className="settings-field" onSubmit={handleSubmit}>
                    <div className="field-group">
                        <label>Логин:</label>
                        <input
                            name="login"
                            placeholder="gleb565"
                            value={formData.login}
                            onChange={handleChange}
                            className="field"
                        />
                    </div>
                    <div className="field-group">
                        <label>Репозиторий (owner/repo):</label>
                        <input
                            name="repo"
                            placeholder="gleb565/hh-homework-react"
                            value={formData.repo}
                            onChange={handleChange}
                            className="field"
                        />
                    </div>
                    <div className="field-group">
                        <label>Blacklist (через запятую):</label>
                        <input
                            name="blacklist"
                            placeholder="user1,user2,user3"
                            value={formData.blacklist}
                            onChange={handleChange}
                            className="field"
                        />
                    </div>
                    <button type="submit" className="settings-button">
                        Сохранить
                    </button>
                </form>
            )}
        </div>
    );
}

export default Settings;
