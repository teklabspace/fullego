'use client';

import ErrorPage from '@/components/error/ErrorPage';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';

export default function DashboardError({ error, reset }) {
  const router = useRouter();

  useEffect(() => {
    console.error('Dashboard Error:', error);
  }, [error]);

  return (
    <div className="min-h-screen bg-[#101014] flex items-center justify-center p-6">
      <ErrorPage
        title="Something went wrong"
        buttonText="Back to Dashboard"
        onAction={() => {
          reset?.();
          router.push('/dashboard');
        }}
      />
    </div>
  );
}
