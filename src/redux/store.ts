import * as ReduxToolkit from '@reduxjs/toolkit';
const { configureStore } = ReduxToolkit;
import authReducer from './authSlice';
import dataReducer from './dataSlice';
import tasksReducer from './tasksSlice';
import sessionsReducer from './sessionsSlice';
import roadmapReducer from './roadmapSlice';

export const store = configureStore({
  reducer: {
    auth: authReducer,
    data: dataReducer,
    tasks: tasksReducer,
    sessions: sessionsReducer,
    roadmap: roadmapReducer,
  },
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
export default store;
