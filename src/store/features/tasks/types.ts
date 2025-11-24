import type { CreateTaskData, Task, UpdateTaskData } from '@/types';

export interface TaskState {
  items: Task[];
  loading: boolean;
  error: string;
}

export type CreateTaskPayload = CreateTaskData;
export type UpdateTaskPayload = { id: string; data: UpdateTaskData };
