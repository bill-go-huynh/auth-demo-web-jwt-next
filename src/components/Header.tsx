'use client';

import { useAppDispatch, useAppSelector } from '@/store/hooks';
import { logout } from '@/store/authSlice';
import { useTheme } from '@/contexts/ThemeContext';
import { Button } from '@/components/ui';
import { env } from '@/lib/env';
import { MESSAGES } from '@/lib/constants';
import Link from 'next/link';

export function Header() {
  const dispatch = useAppDispatch();
  const { user, loading } = useAppSelector((state) => state.auth);
  const { theme, toggleTheme } = useTheme();

  const handleLogout = () => {
    dispatch(logout());
  };

  return (
    <header className="border-b border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <div className="flex items-center">
            <Link href="/" className="text-xl font-semibold text-gray-900 dark:text-gray-100">
              {env.appName}
            </Link>
          </div>

          <div className="flex items-center gap-4">
            {loading ? (
              <span className="text-sm text-gray-500 dark:text-gray-400">{MESSAGES.LOADING}</span>
            ) : user ? (
              <>
                <span className="text-sm text-gray-700 dark:text-gray-300">
                  {user.name} ({user.email})
                </span>
                <Button variant="outline" onClick={handleLogout}>
                  Logout
                </Button>
              </>
            ) : (
              <Link href="/login">
                <Button variant="primary">Login</Button>
              </Link>
            )}

            <Button variant="ghost" onClick={toggleTheme} aria-label="Toggle theme">
              {theme === 'light' ? '🌙' : '☀️'}
            </Button>
          </div>
        </div>
      </div>
    </header>
  );
}
