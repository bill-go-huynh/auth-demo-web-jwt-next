'use client';

import toast from 'react-hot-toast';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

import { Button } from '@/components/ui';
import { MESSAGES } from '@/constants';
import { useTheme } from '@/contexts/theme';
import { logout } from '@/store/features/auth';
import { useAppDispatch, useAppSelector } from '@/store/hooks';

export function Header() {
  const router = useRouter();
  const dispatch = useAppDispatch();
  const { user, loading } = useAppSelector((state) => state.auth);
  const { theme, toggleTheme, mounted } = useTheme();

  const handleLogout = () => {
    dispatch(logout());
    toast.success(MESSAGES.LOGOUT_SUCCESS);
    router.push('/login');
  };

  return (
    <header className="border-b border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <div className="flex items-center">
            <Link
              href="/"
              className="text-xl font-semibold text-gray-900 dark:text-gray-100 cursor-pointer"
            >
              Auth Demo - JWT Client
            </Link>
          </div>

          <div className="flex items-center gap-4">
            {loading ? (
              <span className="text-sm text-gray-500 dark:text-gray-400">{MESSAGES.LOADING}</span>
            ) : user ? (
              <>
                <Link href="/user" className="cursor-pointer">
                  <span className="text-sm text-gray-700 dark:text-gray-300 hover:text-gray-900 dark:hover:text-gray-100">
                    {user.name} ({user.email})
                  </span>
                </Link>
                <Button variant="outline" onClick={handleLogout}>
                  Logout
                </Button>
              </>
            ) : (
              <>
                <Link href="/login">
                  <Button variant="primary">Login</Button>
                </Link>
                <Link href="/register">
                  <Button variant="outline">Register</Button>
                </Link>
              </>
            )}

            <Button
              variant="ghost"
              onClick={() => {
                console.log('[Header] Theme button clicked, current theme:', theme);
                toggleTheme();
              }}
              aria-label="Toggle theme"
              suppressHydrationWarning
            >
              {mounted ? (theme === 'light' ? '🌙' : '☀️') : '🌙'}
            </Button>
          </div>
        </div>
      </div>
    </header>
  );
}
