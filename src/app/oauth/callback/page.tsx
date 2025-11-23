'use client';

import { useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useAppDispatch } from '@/store/hooks';
import { setTokens, fetchMe } from '@/store/authSlice';
import { MESSAGES, ERRORS } from '@/lib/constants';

export default function OAuthCallbackPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const dispatch = useAppDispatch();

  useEffect(() => {
    const urlError = searchParams.get('error');
    if (urlError) {
      const timeoutId = setTimeout(() => {
        router.push(`/login?error=${ERRORS.AUTH_FAILED}`);
      }, 2000);
      return () => clearTimeout(timeoutId);
    }

    const accessToken = searchParams.get('accessToken');
    const refreshToken = searchParams.get('refreshToken');

    if (accessToken) {
      dispatch(setTokens({ accessToken, refreshToken: refreshToken || undefined }));
      dispatch(fetchMe())
        .unwrap()
        .then(() => {
          router.push('/tasks');
        })
        .catch(() => {
          router.push(`/login?error=${ERRORS.AUTH_FAILED}`);
        });
    } else {
      router.push(`/login?error=${ERRORS.AUTH_FAILED}`);
    }
  }, [searchParams, router, dispatch]);

  return (
    <div className="max-w-md mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <div className="text-center">
        <p className="text-lg">{MESSAGES.COMPLETING_AUTH}</p>
      </div>
    </div>
  );
}
