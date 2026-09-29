import { configureStore } from '@reduxjs/toolkit';
import authReducer from './slices/authSlice';
import attemptReducer from '../features/attempt/store/attemptSlice';
import { apiSlice } from './apiSlice';

export const makeStore = (preloadedState) => configureStore({
  reducer: {
    auth: authReducer,
    attempt: attemptReducer,
    [apiSlice.reducerPath]: apiSlice.reducer,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware().concat(apiSlice.middleware),
  preloadedState,
});

export const store = makeStore(); // Keep for potential backward compatibility or CLI tools
