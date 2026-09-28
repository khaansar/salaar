import { configureStore } from '@reduxjs/toolkit';
import authReducer from './slices/authSlice';
import attemptReducer from '../features/attempt/store/attemptSlice';

export const makeStore = (preloadedState) => configureStore({
  reducer: {
    auth: authReducer,
    attempt: attemptReducer,
  },
  preloadedState,
});

export const store = makeStore(); // Keep for potential backward compatibility or CLI tools
