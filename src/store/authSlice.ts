import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import { authApi } from '@/lib/api';
import type { User, LoginData } from '@/types';
import { ERRORS } from '@/lib/constants';

const TOKEN_STORAGE_KEY = 'jwt_tokens';

interface AuthState {
  user: User | null;
  accessToken: string | null;
  refreshToken: string | null;
  loading: boolean;
  error: string | null;
}

const loadTokensFromStorage = (): { accessToken: string | null; refreshToken: string | null } => {
  if (typeof window === 'undefined') {
    return { accessToken: null, refreshToken: null };
  }
  try {
    const stored = localStorage.getItem(TOKEN_STORAGE_KEY);
    if (stored) {
      const tokens = JSON.parse(stored) as { accessToken: string; refreshToken?: string };
      return {
        accessToken: tokens.accessToken || null,
        refreshToken: tokens.refreshToken || null,
      };
    }
  } catch {
    // Ignore parse errors
  }
  return { accessToken: null, refreshToken: null };
};

const saveTokensToStorage = (accessToken: string | null, refreshToken: string | null): void => {
  if (typeof window === 'undefined') return;
  try {
    if (accessToken) {
      localStorage.setItem(
        TOKEN_STORAGE_KEY,
        JSON.stringify({ accessToken, refreshToken: refreshToken || null }),
      );
    } else {
      localStorage.removeItem(TOKEN_STORAGE_KEY);
    }
  } catch {
    // Ignore storage errors
  }
};

const initialState: AuthState = {
  user: null,
  ...loadTokensFromStorage(),
  loading: false,
  error: null,
};

export const loginWithPassword = createAsyncThunk(
  'auth/loginWithPassword',
  async (data: LoginData, { rejectWithValue }) => {
    try {
      const response = await authApi.login(data);
      return response;
    } catch (error) {
      return rejectWithValue(error instanceof Error ? error.message : ERRORS.LOGIN_FAILED);
    }
  },
);

export const fetchMe = createAsyncThunk(
  'auth/fetchMe',
  async (_, { getState, rejectWithValue }) => {
    try {
      const state = getState() as { auth: AuthState };
      const accessToken = state.auth.accessToken;
      if (!accessToken) {
        return rejectWithValue(ERRORS.UNAUTHORIZED);
      }
      const response = await authApi.me(accessToken);
      return response.user;
    } catch (error) {
      return rejectWithValue(error instanceof Error ? error.message : ERRORS.UNAUTHORIZED);
    }
  },
);

export const refreshAccessToken = createAsyncThunk(
  'auth/refreshAccessToken',
  async (_, { getState, rejectWithValue }) => {
    try {
      const state = getState() as { auth: AuthState };
      const refreshToken = state.auth.refreshToken;
      if (!refreshToken) {
        return rejectWithValue(ERRORS.UNAUTHORIZED);
      }
      const response = await authApi.refresh(refreshToken);
      return response;
    } catch (error) {
      return rejectWithValue(error instanceof Error ? error.message : ERRORS.UNAUTHORIZED);
    }
  },
);

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    logout: (state) => {
      state.user = null;
      state.accessToken = null;
      state.refreshToken = null;
      state.error = null;
      saveTokensToStorage(null, null);
    },
    setTokens: (state, action: PayloadAction<{ accessToken: string; refreshToken?: string }>) => {
      state.accessToken = action.payload.accessToken;
      state.refreshToken = action.payload.refreshToken || null;
      saveTokensToStorage(action.payload.accessToken, action.payload.refreshToken);
    },
    clearError: (state) => {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      // loginWithPassword
      .addCase(loginWithPassword.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(loginWithPassword.fulfilled, (state, action) => {
        state.loading = false;
        state.accessToken = action.payload.accessToken;
        state.refreshToken = action.payload.refreshToken || null;
        saveTokensToStorage(action.payload.accessToken, action.payload.refreshToken);
      })
      .addCase(loginWithPassword.rejected, (state, action) => {
        state.loading = false;
        state.error = (action.payload as string) || ERRORS.LOGIN_FAILED;
      })
      // fetchMe
      .addCase(fetchMe.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchMe.fulfilled, (state, action) => {
        state.loading = false;
        state.user = action.payload;
      })
      .addCase(fetchMe.rejected, (state, action) => {
        state.loading = false;
        state.error = (action.payload as string) || ERRORS.UNAUTHORIZED;
        // Clear tokens on auth failure
        state.accessToken = null;
        state.refreshToken = null;
        state.user = null;
        saveTokensToStorage(null, null);
      })
      // refreshAccessToken
      .addCase(refreshAccessToken.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(refreshAccessToken.fulfilled, (state, action) => {
        state.loading = false;
        state.accessToken = action.payload.accessToken;
        if (action.payload.refreshToken) {
          state.refreshToken = action.payload.refreshToken;
        }
        saveTokensToStorage(state.accessToken, state.refreshToken);
      })
      .addCase(refreshAccessToken.rejected, (state, action) => {
        state.loading = false;
        state.error = (action.payload as string) || ERRORS.UNAUTHORIZED;
        // Clear tokens on refresh failure
        state.accessToken = null;
        state.refreshToken = null;
        state.user = null;
        saveTokensToStorage(null, null);
      });
  },
});

export const { logout, setTokens, clearError } = authSlice.actions;
export default authSlice.reducer;
