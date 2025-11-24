'use client';

import { useEffect, useState } from 'react';
import toast from 'react-hot-toast';
import { useRouter } from 'next/navigation';

import { Card } from '@/components/ui';
import { MESSAGES } from '@/constants';
import { userApi } from '@/services';
import { useAppSelector } from '@/store/hooks';
import type { User } from '@/types';
import { formatDate } from '@/utils';

export default function UserPage() {
  const router = useRouter();
  const { accessToken, user: authUser } = useAppSelector((state) => state.auth);
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!accessToken || !authUser) {
      router.push('/login');
      return;
    }

    const fetchUser = async () => {
      try {
        setLoading(true);
        const response = await userApi.getMe(accessToken);
        setUser(response.user);
      } catch (error) {
        const errorMessage = error instanceof Error ? error.message : 'Failed to load user data';
        toast.error(errorMessage);
        router.push('/login');
      } finally {
        setLoading(false);
      }
    };

    fetchUser();
  }, [accessToken, authUser, router]);

  if (!accessToken || !authUser) {
    return (
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="text-center">
          <p className="text-lg">{MESSAGES.LOADING}</p>
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="text-center">
          <p className="text-lg">{MESSAGES.LOADING}</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <Card>
          <p className="text-center text-gray-500 dark:text-gray-400">User not found</p>
        </Card>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <h1 className="text-3xl font-bold mb-8">User Profile</h1>

      <Card>
        <div className="space-y-4">
          <div>
            <label className="text-sm font-medium text-gray-500 dark:text-gray-400">ID</label>
            <p className="mt-1 text-lg text-gray-900 dark:text-gray-100">{user.id}</p>
          </div>

          <div>
            <label className="text-sm font-medium text-gray-500 dark:text-gray-400">Email</label>
            <p className="mt-1 text-lg text-gray-900 dark:text-gray-100">{user.email}</p>
          </div>

          <div>
            <label className="text-sm font-medium text-gray-500 dark:text-gray-400">Name</label>
            <p className="mt-1 text-lg text-gray-900 dark:text-gray-100">{user.name}</p>
          </div>

          {user.googleId && (
            <div>
              <label className="text-sm font-medium text-gray-500 dark:text-gray-400">
                Google ID
              </label>
              <p className="mt-1 text-lg text-gray-900 dark:text-gray-100">{user.googleId}</p>
            </div>
          )}

          {user.createdAt && (
            <div>
              <label className="text-sm font-medium text-gray-500 dark:text-gray-400">
                Created At
              </label>
              <p className="mt-1 text-lg text-gray-900 dark:text-gray-100">
                {formatDate(user.createdAt)}
              </p>
            </div>
          )}

          {user.updatedAt && (
            <div>
              <label className="text-sm font-medium text-gray-500 dark:text-gray-400">
                Updated At
              </label>
              <p className="mt-1 text-lg text-gray-900 dark:text-gray-100">
                {formatDate(user.updatedAt)}
              </p>
            </div>
          )}
        </div>
      </Card>
    </div>
  );
}
