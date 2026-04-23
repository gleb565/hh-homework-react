import { configureStore } from '@reduxjs/toolkit';
import reviewerReducer from './review';

export const store = configureStore({
    reducer: {
        reviewer: reviewerReducer,
    },
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
