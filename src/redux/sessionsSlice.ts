import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import { StudySession, CreateSessionPayload, SessionStats } from '../api/types';
import * as sessionsService from '../api/services/sessions';
import { toggleTask } from './tasksSlice';
import { handleApiError } from '../api/error';

interface SessionsState {
    items: StudySession[];
    stats: SessionStats;
    loading: boolean;
    error: string | null;
}

const initialStats: SessionStats = {
    dailyTotalMinutes: 0,
    weeklyTotalMinutes: 0,
    totalQuestionsSolved: 0,
    totalCorrect: 0,
    totalIncorrect: 0,
    accuracyRate: 0,
    totalSessionsCount: 0,
    subjectDistribution: [],
};

const initialState: SessionsState = {
    items: [],
    stats: initialStats,
    loading: false,
    error: null,
};

export const fetchSessions = createAsyncThunk(
    'sessions/fetchSessions',
    async (_, { rejectWithValue }) => {
        try {
            const data = await sessionsService.getSessions();
            return data;
        } catch (error: unknown) {
            const appError = handleApiError(error);
            return rejectWithValue(appError.message);
        }
    }
);

export const recordSession = createAsyncThunk(
    'sessions/recordSession',
    async (payload: CreateSessionPayload, { dispatch, rejectWithValue }) => {
        try {
            const newSession = await sessionsService.createStudySession(payload);

            // If user checked "Mark task as completed" and taskId exists
            if (payload.markTaskCompleted && payload.taskId) {
                dispatch(toggleTask({ taskId: payload.taskId, completed: true }));
            }

            return newSession;
        } catch (error: unknown) {
            const appError = handleApiError(error);
            return rejectWithValue(appError.message);
        }
    }
);

const sessionsSlice = createSlice({
    name: 'sessions',
    initialState,
    reducers: {
        clearSessionError: (state) => {
            state.error = null;
        },
    },
    extraReducers: (builder) => {
        builder
            // fetchSessions
            .addCase(fetchSessions.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(fetchSessions.fulfilled, (state, action: PayloadAction<StudySession[]>) => {
                state.loading = false;
                state.items = action.payload;
                state.stats = sessionsService.calculateStats(action.payload);
            })
            .addCase(fetchSessions.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload as string;
            })

            // recordSession
            .addCase(recordSession.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(recordSession.fulfilled, (state, action: PayloadAction<StudySession>) => {
                state.loading = false;
                state.items.unshift(action.payload);
                state.stats = sessionsService.calculateStats(state.items);
            })
            .addCase(recordSession.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload as string;
            });
    },
});

export const { clearSessionError } = sessionsSlice.actions;
export default sessionsSlice.reducer;
