import type { User } from '@/types';

import { fetchApi } from './fetch';

export const userApi = {
  getMe: async (accessToken: string): Promise<{ user: User }> =>
    fetchApi<{ user: User }>('/users/me', {}, accessToken),
};
