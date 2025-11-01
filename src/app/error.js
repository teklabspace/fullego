'use client';
import ErrorPage from '@/components/error/ErrorPage';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';

export default function Error({ error, reset }) {
  const router = useRouter();

  useEffect(() => {
    console.error('Application Error:', error);
  }, [error]);

  return (
    <ErrorPage
      title='Oops!'
      buttonText='Take me Home'
      onAction={() => router.push('/')}
    />
  );
}
