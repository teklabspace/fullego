'use client';

import ErrorPage from '@/components/error/ErrorPage';
import { useRouter } from 'next/navigation';

export default function NotFound() {
  const router = useRouter();

  return (
    <ErrorPage
      title="404"
      buttonText="Take me Home"
      onAction={() => router.push('/')}
    />
  );
}
