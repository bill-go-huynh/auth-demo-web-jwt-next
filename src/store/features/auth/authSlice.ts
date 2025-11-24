import { createAsyncThunk, createSlice, PayloadAction } from '@reduxjs/toolkit';

import { ERRORS } from '@/constants';
import { authApi } from '@/services';
import type { LoginData } from '@/types';

import type { RootState } from '../../index';
import { handleFulfilled, handlePending, handleRejected } from '../../utils/reducers';
import { loadTokensFromStorage } from '../../utils/storage';
import type { AuthState, TokenPayload } from './types';

const initialState: AuthState = {
  user: null,
  ...loadTokensFromStorage(),
  loading: false,
  error: '',
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
      const state = getState() as RootState;
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
      const state = getState() as RootState;
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
      state.error = '';
    },
    setTokens: (state, action: PayloadAction<TokenPayload>) => {
      state.accessToken = action.payload.accessToken;
      state.refreshToken = action.payload.refreshToken || null;
    },
    clearError: (state) => {
      state.error = '';
    },
  },
  extraReducers: (builder) => {
    builder
      // loginWithPassword
      .addCase(loginWithPassword.pending, handlePending)
      .addCase(loginWithPassword.fulfilled, (state, action) => {
        handleFulfilled(state);
        state.accessToken = action.payload.accessToken;
        state.refreshToken = action.payload.refreshToken || null;
      })
      .addCase(loginWithPassword.rejected, (state, action) => {
        handleRejected(state, action, ERRORS.LOGIN_FAILED);
      })
      // fetchMe
      .addCase(fetchMe.pending, handlePending)
      .addCase(fetchMe.fulfilled, (state, action) => {
        handleFulfilled(state);
        state.user = action.payload;
      })
      .addCase(fetchMe.rejected, (state, action) => {
        handleRejected(state, action, ERRORS.UNAUTHORIZED);
        state.accessToken = null;
        state.refreshToken = null;
        state.user = null;
      })
      // refreshAccessToken
      .addCase(refreshAccessToken.pending, handlePending)
      .addCase(refreshAccessToken.fulfilled, (state, action) => {
        handleFulfilled(state);
        state.accessToken = action.payload.accessToken;
        if (action.payload.refreshToken) {
          state.refreshToken = action.payload.refreshToken;
        }
      })
      .addCase(refreshAccessToken.rejected, (state, action) => {
        handleRejected(state, action, ERRORS.UNAUTHORIZED);
        state.accessToken = null;
        state.refreshToken = null;
        state.user = null;
      });
  },
});

export const { logout, setTokens, clearError } = authSlice.actions;
export default authSlice.reducer;
