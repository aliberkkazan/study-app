import * as ReduxToolkit from '@reduxjs/toolkit';
const { configureStore } = ReduxToolkit;
import authReducer from './authSlice';
import dataReducer from './dataSlice';

export const store = configureStore({
  reducer: {
    auth: authReducer,
    data: dataReducer,
  },
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
export default store;
