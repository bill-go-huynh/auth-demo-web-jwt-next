import type { Middleware } from '@reduxjs/toolkit';
import { isAnyOf } from '@reduxjs/toolkit';

import {
  fetchMe,
  loginWithPassword,
  logout,
  refreshAccessToken,
  setTokens,
} from '../features/auth';
import type { RootState } from '../index';
import { saveTokensToStorage } from '../utils/storage';

export const tokenStorageMiddleware: Middleware = (store) => (next) => (action) => {
  const result = next(action);

  // Handle synchronous actions
  if (setTokens.match(action)) {
    saveTokensToStorage(action.payload.accessToken, action.payload.refreshToken || null);
  } else if (logout.match(action)) {
    saveTokensToStorage(null, null);
  }
  // Handle async thunk fulfilled actions that return tokens
  else if (loginWithPassword.fulfilled.match(action)) {
    const payload = action.payload as { accessToken: string; refreshToken?: string };
    saveTokensToStorage(payload.accessToken, payload.refreshToken || null);
  } else if (refreshAccessToken.fulfilled.match(action)) {
    const payload = action.payload as { accessToken: string; refreshToken?: string };
    saveTokensToStorage(payload.accessToken, payload.refreshToken || null);
  }
  // Handle async thunk rejected actions that should clear tokens
  else if (
    isAnyOf(fetchMe.rejected, refreshAccessToken.rejected)(action) &&
    (store.getState() as RootState).auth.accessToken === null
  ) {
    // Clear tokens when auth failures result in token removal
    saveTokensToStorage(null, null);
  }

  return result;
};
