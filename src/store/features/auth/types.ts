import type { User } from '@/types';

export interface AuthState {
  user: User | null;
  accessToken: string | null;
  refreshToken: string | null;
  loading: boolean;
  error: string;
}

export interface TokenPayload {
  accessToken: string;
  refreshToken?: string;
}
