import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import apiClient from '../../lib/apiClient';

const getErrorMessage = (error, fallback) => {
  if (!error) {
    return fallback;
  }

  if (typeof error === 'string') {
    return error;
  }

  // Axios/API error after apiClient processing
  if (typeof error.message === 'string') {
    return error.message;
  }

  // Our API error object
  if (typeof error.message?.message === 'string') {
    return error.message.message;
  }

  if (Array.isArray(error.errors) && error.errors.length > 0) {
    return error.errors
      .map((item) => {
        if (typeof item === 'string') {
          return item;
        }

        if (item?.message) {
          return item.message;
        }

        return JSON.stringify(item);
      })
      .join(', ');
  }

  if (typeof error.errors === 'object' && error.errors !== null) {
    return Object.values(error.errors)
      .flat()
      .map((item) => {
        if (typeof item === 'string') {
          return item;
        }

        if (item?.message) {
          return item.message;
        }

        return String(item);
      })
      .join(', ');
  }

  return fallback;
};

export const loginUser = createAsyncThunk(
  'auth/loginUser',
  async (credentials, { rejectWithValue }) => {
    try {
      const data = await apiClient.post('/auth-api/login', credentials);

      return data;
    } catch (err) {
      return rejectWithValue(
        getErrorMessage(err, 'Login failed')
      );
    }
  }
);

export const registerUser = createAsyncThunk(
  'auth/registerUser',
  async (userData, { rejectWithValue }) => {
    try {
      const data = await apiClient.post('/auth-api/register', userData);

      return data;
    } catch (err) {
      return rejectWithValue(
        getErrorMessage(err, 'Registration failed')
      );
    }
  }
);

export const verifyEmail = createAsyncThunk(
  'auth/verifyEmail',
  async (token, { rejectWithValue }) => {
    try {
      const data = await apiClient.post('/auth-api/verify-email', {
        token,
      });

      return data;
    } catch (err) {
      return rejectWithValue(
        getErrorMessage(
          err,
          'The verification link is invalid or has expired'
        )
      );
    }
  }
);

export const logoutUser = createAsyncThunk(
  'auth/logoutUser',
  async (_, { rejectWithValue }) => {
    try {
      await apiClient.post('/auth-api/logout');
    } catch (err) {
      console.error('Logout failed on server', err);

      return rejectWithValue(
        getErrorMessage(err, 'Logout failed')
      );
    }
  }
);

export const fetchCurrentUser = createAsyncThunk(
  'auth/fetchCurrentUser',
  async (_, { rejectWithValue }) => {
    try {
      const data = await apiClient.get('/auth-api/users/me');

      return data;
    } catch (err) {
      return rejectWithValue(
        getErrorMessage(err, 'Unable to restore session')
      );
    }
  }
);

export const forgotPassword = createAsyncThunk(
  'auth/forgotPassword',
  async (email, { rejectWithValue }) => {
    try {
      const data = await apiClient.post('/auth-api/forgot-password', { email });
      return data;
    } catch (err) {
      return rejectWithValue(getErrorMessage(err, 'Forgot password request failed'));
    }
  }
);

export const resetPassword = createAsyncThunk(
  'auth/resetPassword',
  async ({ token, newPassword }, { rejectWithValue }) => {
    try {
      const data = await apiClient.post('/auth-api/reset-password', { token, newPassword });
      return data;
    } catch (err) {
      return rejectWithValue(getErrorMessage(err, 'Reset password failed'));
    }
  }
);

export const initialAuthState = {
  user: null,
  status: 'idle',
  loginStatus: 'idle',
  registrationStatus: 'idle',
  forgotPasswordStatus: 'idle',
  resetPasswordStatus: 'idle',
  isRestoringSession: false,
  isInitialized: false,
  error: null,
};

const authSlice = createSlice({
  name: 'auth',
  initialState: initialAuthState,

  reducers: {
    clearAuth(state) {
      state.user = null;
      state.status = 'idle';
      state.loginStatus = 'idle';
      state.registrationStatus = 'idle';
      state.isRestoringSession = false;
      state.error = null;
      state.isInitialized = true;
    },
  },

  extraReducers: (builder) => {
    builder

      // --------------------------------------------------
      // LOGIN
      // --------------------------------------------------

      .addCase(loginUser.pending, (state) => {
        state.status = 'loading';
        state.loginStatus = 'loading';
        state.error = null;
      })

      .addCase(loginUser.fulfilled, (state, action) => {
        state.status = 'succeeded';
        state.loginStatus = 'succeeded';
        state.user = action.payload;
        state.error = null;
        state.isInitialized = true;
      })

      .addCase(loginUser.rejected, (state, action) => {
        state.status = 'failed';
        state.loginStatus = 'failed';
        state.error =
          typeof action.payload === 'string'
            ? action.payload
            : 'Login failed';
      })

      // --------------------------------------------------
      // REGISTER
      // --------------------------------------------------

      .addCase(registerUser.pending, (state) => {
        state.status = 'loading';
        state.registrationStatus = 'loading';
        state.error = null;
      })

      .addCase(registerUser.fulfilled, (state) => {
        state.status = 'succeeded';
        state.registrationStatus = 'succeeded';

        // Registration does not authenticate the user.
        // Email verification must happen before login.
        state.user = null;

        state.error = null;
        state.isInitialized = true;
      })

      .addCase(registerUser.rejected, (state, action) => {
        state.status = 'failed';
        state.registrationStatus = 'failed';
        state.error =
          typeof action.payload === 'string'
            ? action.payload
            : 'Registration failed';
      })

      // --------------------------------------------------
      // VERIFY EMAIL
      // --------------------------------------------------

      .addCase(verifyEmail.pending, (state) => {
        state.error = null;
      })

      .addCase(verifyEmail.fulfilled, (state) => {
        state.error = null;
      })

      .addCase(verifyEmail.rejected, (state, action) => {
        state.error =
          typeof action.payload === 'string'
            ? action.payload
            : 'Email verification failed';
      })

      // --------------------------------------------------
      // LOGOUT
      // --------------------------------------------------

      .addCase(logoutUser.fulfilled, (state) => {
        state.user = null;
        state.status = 'idle';
        state.isRestoringSession = false;
        state.error = null;
        state.isInitialized = true;
      })

      .addCase(logoutUser.rejected, (state) => {
        // Even if the backend logout fails, the browser should
        // consider the local session logged out.
        state.user = null;
        state.status = 'idle';
        state.isRestoringSession = false;
        state.error = null;
        state.isInitialized = true;
      })

      // --------------------------------------------------
      // RESTORE CURRENT USER
      // --------------------------------------------------

      .addCase(fetchCurrentUser.pending, (state) => {
        state.isRestoringSession = true;
        state.error = null;
      })

      .addCase(fetchCurrentUser.fulfilled, (state, action) => {
        state.status = 'succeeded';
        state.isRestoringSession = false;
        state.user = action.payload;
        state.error = null;
        state.isInitialized = true;
      })

      .addCase(fetchCurrentUser.rejected, (state) => {
        state.status = 'idle';
        state.isRestoringSession = false;
        state.user = null;

        state.error = null;

        state.isInitialized = true;
      })

      // --------------------------------------------------
      // FORGOT PASSWORD
      // --------------------------------------------------
      
      .addCase(forgotPassword.pending, (state) => {
        state.forgotPasswordStatus = 'loading';
        state.error = null;
      })
      .addCase(forgotPassword.fulfilled, (state) => {
        state.forgotPasswordStatus = 'succeeded';
        state.error = null;
      })
      .addCase(forgotPassword.rejected, (state, action) => {
        state.forgotPasswordStatus = 'failed';
        state.error = typeof action.payload === 'string' ? action.payload : 'Forgot password request failed';
      })

      // --------------------------------------------------
      // RESET PASSWORD
      // --------------------------------------------------
      
      .addCase(resetPassword.pending, (state) => {
        state.resetPasswordStatus = 'loading';
        state.error = null;
      })
      .addCase(resetPassword.fulfilled, (state) => {
        state.resetPasswordStatus = 'succeeded';
        state.error = null;
      })
      .addCase(resetPassword.rejected, (state, action) => {
        state.resetPasswordStatus = 'failed';
        state.error = typeof action.payload === 'string' ? action.payload : 'Reset password failed';
      });
  },
});

export const { clearAuth } = authSlice.actions;

export default authSlice.reducer;