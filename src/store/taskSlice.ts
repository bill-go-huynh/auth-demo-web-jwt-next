import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { tasksApi } from '@/lib/api';
import type { Task, CreateTaskData, UpdateTaskData } from '@/types';
import { ERRORS } from '@/lib/constants';

interface TaskState {
  items: Task[];
  loading: boolean;
  error: string | null;
}

const initialState: TaskState = {
  items: [],
  loading: false,
  error: null,
};

const getAccessToken = (getState: () => unknown): string | null => {
  const state = getState() as { auth: { accessToken: string | null } };
  return state.auth.accessToken;
};

export const fetchTasks = createAsyncThunk(
  'tasks/fetchTasks',
  async (_, { getState, rejectWithValue }) => {
    try {
      const accessToken = getAccessToken(getState);
      if (!accessToken) {
        return rejectWithValue(ERRORS.UNAUTHORIZED);
      }
      const tasks = await tasksApi.getAll(accessToken);
      return tasks;
    } catch (error) {
      return rejectWithValue(error instanceof Error ? error.message : ERRORS.LOAD_TASKS);
    }
  },
);

export const createTask = createAsyncThunk(
  'tasks/createTask',
  async (data: CreateTaskData, { getState, rejectWithValue }) => {
    try {
      const accessToken = getAccessToken(getState);
      if (!accessToken) {
        return rejectWithValue(ERRORS.UNAUTHORIZED);
      }
      const task = await tasksApi.create(data, accessToken);
      return task;
    } catch (error) {
      return rejectWithValue(error instanceof Error ? error.message : ERRORS.CREATE_TASK);
    }
  },
);

export const updateTask = createAsyncThunk(
  'tasks/updateTask',
  async ({ id, data }: { id: string; data: UpdateTaskData }, { getState, rejectWithValue }) => {
    try {
      const accessToken = getAccessToken(getState);
      if (!accessToken) {
        return rejectWithValue(ERRORS.UNAUTHORIZED);
      }
      const task = await tasksApi.update(id, data, accessToken);
      return task;
    } catch (error) {
      return rejectWithValue(error instanceof Error ? error.message : ERRORS.UPDATE_TASK);
    }
  },
);

export const deleteTask = createAsyncThunk(
  'tasks/deleteTask',
  async (id: string, { getState, rejectWithValue }) => {
    try {
      const accessToken = getAccessToken(getState);
      if (!accessToken) {
        return rejectWithValue(ERRORS.UNAUTHORIZED);
      }
      await tasksApi.delete(id, accessToken);
      return id;
    } catch (error) {
      return rejectWithValue(error instanceof Error ? error.message : ERRORS.DELETE_TASK);
    }
  },
);

const taskSlice = createSlice({
  name: 'tasks',
  initialState,
  reducers: {
    clearError: (state) => {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      // fetchTasks
      .addCase(fetchTasks.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchTasks.fulfilled, (state, action) => {
        state.loading = false;
        state.items = action.payload;
      })
      .addCase(fetchTasks.rejected, (state, action) => {
        state.loading = false;
        state.error = (action.payload as string) || ERRORS.LOAD_TASKS;
      })
      // createTask
      .addCase(createTask.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(createTask.fulfilled, (state, action) => {
        state.loading = false;
        state.items = [action.payload, ...state.items];
      })
      .addCase(createTask.rejected, (state, action) => {
        state.loading = false;
        state.error = (action.payload as string) || ERRORS.CREATE_TASK;
      })
      // updateTask
      .addCase(updateTask.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(updateTask.fulfilled, (state, action) => {
        state.loading = false;
        state.items = state.items.map((task) =>
          task.id === action.payload.id ? action.payload : task,
        );
      })
      .addCase(updateTask.rejected, (state, action) => {
        state.loading = false;
        state.error = (action.payload as string) || ERRORS.UPDATE_TASK;
      })
      // deleteTask
      .addCase(deleteTask.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(deleteTask.fulfilled, (state, action) => {
        state.loading = false;
        state.items = state.items.filter((task) => task.id !== action.payload);
      })
      .addCase(deleteTask.rejected, (state, action) => {
        state.loading = false;
        state.error = (action.payload as string) || ERRORS.DELETE_TASK;
      });
  },
});

export const { clearError } = taskSlice.actions;
export default taskSlice.reducer;
