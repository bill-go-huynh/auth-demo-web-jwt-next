'use client';

import { ReactNode, useEffect, useRef } from 'react';
import { Provider } from 'react-redux';

import { store } from '@/store';
import { fetchMe } from '@/store/features/auth';
import { useAppDispatch, useAppSelector } from '@/store/hooks';

function AuthInitializer({ children }: { children: ReactNode }) {
  const dispatch = useAppDispatch();
  const { accessToken, user } = useAppSelector((state) => state.auth);
  const hasTriedFetchRef = useRef(false);

  useEffect(() => {
    // If we have accessToken but no user, fetch user info
    if (accessToken && !user && !hasTriedFetchRef.current) {
      hasTriedFetchRef.current = true;
      dispatch(fetchMe()).catch(() => {
        // Ignore errors, they're handled by the slice
      });
    }

    // Reset hasTriedFetch if accessToken is removed
    if (!accessToken) {
      hasTriedFetchRef.current = false;
    }
  }, [accessToken, user, dispatch]);

  return <>{children}</>;
}

export function StoreProvider({ children }: { children: ReactNode }) {
  return (
    <Provider store={store}>
      <AuthInitializer>{children}</AuthInitializer>
    </Provider>
  );
}
