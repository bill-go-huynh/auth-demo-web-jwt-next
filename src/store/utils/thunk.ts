import type { RootState } from '../index';

type GetStateFn = () => RootState;

export const getAccessToken = (getState: GetStateFn): string => {
  const state = getState();
  return state.auth.accessToken || '';
};

export const hasAccessToken = (getState: GetStateFn): boolean => {
  const token = getAccessToken(getState);
  return token.length > 0;
};
