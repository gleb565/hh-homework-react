import { createSlice, type PayloadAction } from '@reduxjs/toolkit';

export interface Reviewer {
    login: string;
    avatar_url: string;
    html_url: string;
}

interface ReviewerState {
    candidates: Reviewer[];
    winner: Reviewer | null;
    status: 'idle' | 'loading' | 'shuffling' | 'done' | 'error';
    error: string;
}

const initialState: ReviewerState = {
    candidates: [],
    winner: null,
    status: 'idle',
    error: '',
};

const reviewerSlice = createSlice({
    name: 'reviewer',
    initialState,
    reducers: {
        fetchStarted(state) {
            state.status = 'loading';
            state.error = '';
            state.winner = null;
            state.candidates = [];
        },
        candidatesLoaded(state, action: PayloadAction<Reviewer[]>) {
            state.candidates = action.payload;
            state.status = 'shuffling';
        },
        winnerSelected(state, action: PayloadAction<Reviewer>) {
            state.winner = action.payload;
            state.status = 'done';
        },
        fetchFailed(state, action: PayloadAction<string>) {
            state.error = action.payload;
            state.status = 'error';
        },
    },
});

export const { fetchStarted, candidatesLoaded, winnerSelected, fetchFailed } = reviewerSlice.actions;
export default reviewerSlice.reducer;
