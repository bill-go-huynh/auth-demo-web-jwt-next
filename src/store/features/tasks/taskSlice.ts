import { type Action, createAsyncThunk, createSlice } from '@reduxjs/toolkit';

import { ERRORS } from '@/constants';
import { tasksApi } from '@/services';

import type { RootState } from '../../index';
import { handleFulfilled, handlePending, handleRejected } from '../../utils/reducers';
import { getAccessToken, hasAccessToken } from '../../utils/thunk';
import type { CreateTaskPayload, TaskState, UpdateTaskPayload } from './types';

const initialState: TaskState = {
  items: [],
  loading: false,
  error: '',
};

export const fetchTasks = createAsyncThunk(
  'tasks/fetchTasks',
  async (_, { getState, rejectWithValue }) => {
    try {
      const accessToken = getAccessToken(getState as () => RootState);
      if (!hasAccessToken(getState as () => RootState)) {
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
  async (data: CreateTaskPayload, { getState, rejectWithValue }) => {
    try {
      const accessToken = getAccessToken(getState as () => RootState);
      if (!hasAccessToken(getState as () => RootState)) {
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
  async ({ id, data }: UpdateTaskPayload, { getState, rejectWithValue }) => {
    try {
      const accessToken = getAccessToken(getState as () => RootState);
      if (!hasAccessToken(getState as () => RootState)) {
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
      const accessToken = getAccessToken(getState as () => RootState);
      if (!hasAccessToken(getState as () => RootState)) {
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
      state.error = '';
    },
  },
  extraReducers: (builder) => {
    builder
      // fetchTasks
      .addCase(fetchTasks.pending, handlePending)
      .addCase(fetchTasks.fulfilled, (state, action) => {
        handleFulfilled(state);
        state.items = action.payload;
      })
      .addCase(fetchTasks.rejected, (state, action) => {
        handleRejected(state, action as Action<string> & { payload?: unknown }, ERRORS.LOAD_TASKS);
      })
      // createTask
      .addCase(createTask.pending, handlePending)
      .addCase(createTask.fulfilled, (state, action) => {
        handleFulfilled(state);
        state.items = [action.payload, ...state.items];
      })
      .addCase(createTask.rejected, (state, action) => {
        handleRejected(state, action as Action<string> & { payload?: unknown }, ERRORS.CREATE_TASK);
      })
      // updateTask
      .addCase(updateTask.pending, handlePending)
      .addCase(updateTask.fulfilled, (state, action) => {
        handleFulfilled(state);
        state.items = state.items.map((task) =>
          task.id === action.payload.id ? action.payload : task,
        );
      })
      .addCase(updateTask.rejected, (state, action) => {
        handleRejected(state, action as Action<string> & { payload?: unknown }, ERRORS.UPDATE_TASK);
      })
      // deleteTask
      .addCase(deleteTask.pending, handlePending)
      .addCase(deleteTask.fulfilled, (state, action) => {
        handleFulfilled(state);
        state.items = state.items.filter((task) => task.id !== action.payload);
      })
      .addCase(deleteTask.rejected, (state, action) => {
        handleRejected(state, action as Action<string> & { payload?: unknown }, ERRORS.DELETE_TASK);
      });
  },
});

export const { clearError } = taskSlice.actions;
export default taskSlice.reducer;
