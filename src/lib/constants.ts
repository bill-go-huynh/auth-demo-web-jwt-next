export const MESSAGES = {
  LOADING: 'Loading...',
  LOADING_TASKS: 'Loading tasks...',
  ADDING_TASK: 'Adding...',
  COMPLETING_AUTH: 'Completing authentication...',
  NO_TASKS: 'No tasks yet. Create your first task above!',
  LOGOUT_SUCCESS: 'Logged out successfully',
  LOGIN_SUCCESS: 'Logged in successfully',
  TASK_CREATED: 'Task created successfully',
  TASK_UPDATED: 'Task updated successfully',
  TASK_DELETED: 'Task deleted successfully',
} as const;

export const ERRORS = {
  GENERIC: 'An error occurred',
  LOAD_TASKS: 'Failed to load tasks',
  CREATE_TASK: 'Failed to create task',
  UPDATE_TASK: 'Failed to update task',
  DELETE_TASK: 'Failed to delete task',
  AUTH_FAILED: 'Authentication failed',
  LOGIN_FAILED: 'Login failed',
  LOGOUT_FAILED: 'Logout failed',
  UNAUTHORIZED: 'Unauthorized',
} as const;

export const CONFIRMATIONS = {
  DELETE_TASK: 'Are you sure you want to delete this task?',
} as const;
