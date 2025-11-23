import { env } from './env';
import type { User, Task, LoginData, CreateTaskData, UpdateTaskData, TokenResponse } from '@/types';

const apiBaseUrl = env.apiBaseUrl;

async function fetchApi<T>(
  endpoint: string,
  options: RequestInit = {},
  accessToken?: string | null,
): Promise<T> {
  const url = `${apiBaseUrl}${endpoint}`;
  const headers: HeadersInit = {
    'Content-Type': 'application/json',
    ...options.headers,
  };

  if (accessToken) {
    headers.Authorization = `Bearer ${accessToken}`;
  }

  const response = await fetch(url, {
    ...options,
    headers,
  });

  if (!response.ok) {
    let errorMessage = `HTTP error! status: ${response.status}`;
    try {
      const error = await response.json();
      errorMessage = error.message || errorMessage;
    } catch {
      errorMessage = response.statusText || errorMessage;
    }
    throw new Error(errorMessage);
  }

  return response.json();
}

// Auth API
export const authApi = {
  login: async (data: LoginData): Promise<TokenResponse> => {
    return fetchApi<TokenResponse>('/auth/jwt/login', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },

  refresh: async (refreshToken: string): Promise<TokenResponse> => {
    return fetchApi<TokenResponse>('/auth/jwt/refresh', {
      method: 'POST',
      body: JSON.stringify({ refreshToken }),
    });
  },

  me: async (accessToken: string): Promise<{ user: User }> => {
    return fetchApi<{ user: User }>('/auth/jwt/me', {}, accessToken);
  },
};

// Tasks API
export const tasksApi = {
  getAll: async (accessToken: string): Promise<Task[]> => {
    return fetchApi<Task[]>('/jwt/tasks', {}, accessToken);
  },

  getOne: async (id: string, accessToken: string): Promise<Task> => {
    return fetchApi<Task>(`/jwt/tasks/${id}`, {}, accessToken);
  },

  create: async (data: CreateTaskData, accessToken: string): Promise<Task> => {
    return fetchApi<Task>(
      '/jwt/tasks',
      {
        method: 'POST',
        body: JSON.stringify(data),
      },
      accessToken,
    );
  },

  update: async (id: string, data: UpdateTaskData, accessToken: string): Promise<Task> => {
    return fetchApi<Task>(
      `/jwt/tasks/${id}`,
      {
        method: 'PATCH',
        body: JSON.stringify(data),
      },
      accessToken,
    );
  },

  delete: async (id: string, accessToken: string): Promise<void> => {
    await fetchApi<void>(
      `/jwt/tasks/${id}`,
      {
        method: 'DELETE',
      },
      accessToken,
    );
  },
};
