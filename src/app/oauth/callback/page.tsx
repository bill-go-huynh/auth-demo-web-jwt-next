'use client';

import { Suspense, useEffect } from 'react';
import toast from 'react-hot-toast';
import { useRouter, useSearchParams } from 'next/navigation';

import { ERRORS, MESSAGES } from '@/constants';
import { fetchMe, setTokens } from '@/store/features/auth';
import { useAppDispatch } from '@/store/hooks';

function OAuthCallbackContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const dispatch = useAppDispatch();

  useEffect(() => {
    const urlError = searchParams.get('error');
    if (urlError) {
      toast.error(ERRORS.AUTH_FAILED);
      router.replace('/login');
      return;
    }

    const accessToken = searchParams.get('accessToken');
    const refreshToken = searchParams.get('refreshToken');

    if (accessToken) {
      dispatch(setTokens({ accessToken, refreshToken: refreshToken || undefined }));
      dispatch(fetchMe())
        .unwrap()
        .then(() => {
          toast.success(MESSAGES.LOGIN_SUCCESS);
          router.replace('/tasks');
        })
        .catch(() => {
          toast.error(ERRORS.AUTH_FAILED);
          router.replace('/login');
        });
    } else {
      toast.error(ERRORS.AUTH_FAILED);
      router.replace('/login');
    }
  }, [searchParams, router, dispatch]);

  return null;
}

export default function OAuthCallbackPage() {
  return (
    <Suspense fallback={null}>
      <OAuthCallbackContent />
    </Suspense>
  );
}
