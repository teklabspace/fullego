'use client';

import { SWRConfig } from 'swr';

const swrOptions = {
  revalidateOnFocus: true,
  dedupingInterval: 5000,
  revalidateIfStale: true,
  errorRetryCount: 2,
};

export default function SWRProvider({ children }) {
  return <SWRConfig value={swrOptions}>{children}</SWRConfig>;
}
