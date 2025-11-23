'use client';

import { ReactNode, useEffect } from 'react';
import { Provider } from 'react-redux';
import { store } from '@/store';
import { useAppDispatch, useAppSelector } from '@/store/hooks';
import { fetchMe } from '@/store/authSlice';

function AuthInitializer({ children }: { children: ReactNode }) {
  const dispatch = useAppDispatch();
  const { accessToken, user, loading } = useAppSelector((state) => state.auth);
  const hasTriedFetchRef = useRef(false);

  useEffect(() => {
    // If we have accessToken but no user, and we haven't tried fetching yet, fetch user info
    if (accessToken && !user && !loading && !hasTriedFetchRef.current) {
      hasTriedFetchRef.current = true;
      dispatch(fetchMe()).catch(() => {
        // Ignore errors, they're handled by the slice
      });
    }
    // Reset hasTriedFetch if accessToken changes
    if (!accessToken) {
      hasTriedFetchRef.current = false;
    }
  }, [accessToken, user, loading, dispatch]);

  return <>{children}</>;
}

export function StoreProvider({ children }: { children: ReactNode }) {
  return (
    <Provider store={store}>
      <AuthInitializer>{children}</AuthInitializer>
    </Provider>
  );
}
