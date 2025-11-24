import type { LoginData, RegisterData, TokenResponse, User } from '@/types';

import { fetchApi } from './fetch';

export const authApi = {
  register: async (data: RegisterData): Promise<User> =>
    fetchApi<User>('/auth/jwt/register', {
      method: 'POST',
      body: JSON.stringify(data),
    }),

  login: async (data: LoginData): Promise<TokenResponse> =>
    fetchApi<TokenResponse>('/auth/jwt/login', {
      method: 'POST',
      body: JSON.stringify(data),
    }),

  refresh: async (refreshToken: string): Promise<TokenResponse> =>
    fetchApi<TokenResponse>('/auth/jwt/refresh', {
      method: 'POST',
      body: JSON.stringify({ refreshToken }),
    }),

  me: async (accessToken: string): Promise<{ user: User }> =>
    fetchApi<{ user: User }>('/auth/jwt/me', {}, accessToken),
};
