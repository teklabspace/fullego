'use client';
import { useRouter } from 'next/navigation';
import ErrorPage from '@/components/error/ErrorPage';

export default function NotFound() {
  const router = useRouter();

  return (
    <ErrorPage 
      title="Oops!"
      buttonText="Take me Home"
      onAction={() => router.push('/')}
    />
  );
}
