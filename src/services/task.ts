import type { CreateTaskData, Task, UpdateTaskData } from '@/types';

import { fetchApi } from './fetch';

export const tasksApi = {
  getAll: async (accessToken: string): Promise<Task[]> =>
    fetchApi<Task[]>('/tasks', {}, accessToken),

  getOne: async (id: string, accessToken: string): Promise<Task> =>
    fetchApi<Task>(`/tasks/${id}`, {}, accessToken),

  create: async (data: CreateTaskData, accessToken: string): Promise<Task> =>
    fetchApi<Task>(
      '/tasks',
      {
        method: 'POST',
        body: JSON.stringify(data),
      },
      accessToken,
    ),

  update: async (id: string, data: UpdateTaskData, accessToken: string): Promise<Task> =>
    fetchApi<Task>(
      `/tasks/${id}`,
      {
        method: 'PATCH',
        body: JSON.stringify(data),
      },
      accessToken,
    ),

  delete: async (id: string, accessToken: string): Promise<{ message: string } | null> =>
    fetchApi<{ message: string } | null>(
      `/tasks/${id}`,
      {
        method: 'DELETE',
      },
      accessToken,
    ),
};
