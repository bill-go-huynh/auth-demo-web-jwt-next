import { configureStore } from '@reduxjs/toolkit';

import { env } from '@/config';

import { authReducer } from './features/auth';
import { taskReducer } from './features/tasks';
import { tokenStorageMiddleware } from './middleware/tokenStorage';

export const store = configureStore({
  reducer: {
    auth: authReducer,
    tasks: taskReducer,
  },
  middleware: (getDefaultMiddleware) => getDefaultMiddleware().concat(tokenStorageMiddleware),
  devTools: env.nodeEnv === 'development',
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
