import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { setCookie, deleteCookie } from 'cookies-next';
import apiClient from '../../lib/apiClient';

export const loginUser = createAsyncThunk(
  'auth/loginUser',
  async (credentials, { rejectWithValue }) => {
    try {
      const data = await apiClient.post('/auth-api/login', credentials);
      
      const role = data?.user?.role || data?.role;
      if (role) {
        setCookie('user_role', role, { maxAge: 60 * 60 * 24 * 7, path: '/' });
      }
      
      return data?.user || data;
    } catch (err) {
      return rejectWithValue(err?.message || 'Login failed');
    }
  }
);

export const registerUser = createAsyncThunk(
  'auth/registerUser',
  async (userData, { rejectWithValue }) => {
    try {
      const data = await apiClient.post('/auth-api/register', userData);
      
      const role = data?.user?.role || data?.role;
      if (role) {
        setCookie('user_role', role, { maxAge: 60 * 60 * 24 * 7, path: '/' });
      }
      
      return data?.user || data;
    } catch (err) {
      return rejectWithValue(err?.message || 'Registration failed');
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
    } finally {
      deleteCookie('user_role');
    }
  }
);

// `/auth-api/users/me` returns the authenticated admin's profile
// (id, firstName, lastName, email, role, avatarUrl, isActive, timestamps)
// wrapped in the standard ApiResponse envelope; `apiClient` already
// unwraps `.data` for us. Used to populate the dashboard's profile menu.
export const fetchCurrentUser = createAsyncThunk(
  'auth/fetchCurrentUser',
  async (_, { rejectWithValue }) => {
    try {
      const data = await apiClient.get('/auth-api/users/me');
      return data;
    } catch (err) {
      return rejectWithValue(err);
    }
  }
);

const initialState = {
  user: null,
  status: 'idle',
  isInitialized: false,
  error: null,
};

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    setRoleFromCookie(state, action) {
      if (!state.user) {
        state.user = { role: action.payload };
      } else {
        state.user.role = action.payload;
      }
      state.isInitialized = true;
    }
  },
  extraReducers: (builder) => {
    builder
      .addCase(loginUser.pending, (state) => {
        state.status = 'loading';
        state.error = null;
      })
      .addCase(loginUser.fulfilled, (state, action) => {
        state.status = 'succeeded';
        state.user = action.payload;
        state.isInitialized = true;
      })
      .addCase(loginUser.rejected, (state, action) => {
        state.status = 'failed';
        state.error = action.payload || 'Login failed';
      })
      .addCase(registerUser.pending, (state) => {
        state.status = 'loading';
        state.error = null;
      })
      .addCase(registerUser.fulfilled, (state, action) => {
        state.status = 'succeeded';
        state.user = action.payload;
        state.isInitialized = true;
      })
      .addCase(registerUser.rejected, (state, action) => {
        state.status = 'failed';
        state.error = action.payload || 'Registration failed';
      })
      .addCase(logoutUser.fulfilled, (state) => {
        state.user = null;
        state.status = 'idle';
        state.error = null;
        state.isInitialized = true;
      })
      .addCase(fetchCurrentUser.pending, (state) => {
        state.status = 'loading';
      })
      .addCase(fetchCurrentUser.fulfilled, (state, action) => {
        state.status = 'succeeded';
        state.user = action.payload;
        state.isInitialized = true;
      })
      .addCase(fetchCurrentUser.rejected, (state, action) => {
        state.status = 'failed';
        // Only clear user if the API explicitly rejected with 401/403.
        // Since /auth-api/users/me doesn't exist yet (returns 404), we shouldn't clear the user
        // and ruin the optimistic cookie auth.
        if (action.payload?.status === 401 || action.payload?.status === 403) {
            state.user = null;
        }
        state.isInitialized = true;
      });
  },
});

export const { setRoleFromCookie } = authSlice.actions;
export default authSlice.reducer;