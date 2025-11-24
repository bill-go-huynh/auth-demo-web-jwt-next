import type { Action } from '@reduxjs/toolkit';

export interface AsyncState {
  loading: boolean;
  error: string;
}

const extractErrorMessage = (payload: unknown, defaultError: string): string => {
  if (!payload) return defaultError;
  if (typeof payload === 'string') return payload;
  if (payload instanceof Error) return payload.message;
  return defaultError;
};

export const handlePending = <T extends AsyncState>(state: T): void => {
  state.loading = true;
  state.error = '';
};

export const handleRejected = <T extends AsyncState>(
  state: T,
  action: Action<string> & { payload?: unknown },
  defaultError: string,
): void => {
  state.loading = false;
  state.error = extractErrorMessage(action.payload, defaultError);
};

export const handleFulfilled = <T extends AsyncState>(state: T): void => {
  state.loading = false;
};
