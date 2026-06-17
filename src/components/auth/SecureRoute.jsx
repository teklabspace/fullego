'use client';
import { useEffect, useState } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { isAuthenticated } from '@/utils/authApi';
import { getStoredRole, getStoredUser } from '@/utils/permissions';
import { toast } from 'react-toastify';

/**
 * Route guard that:
 *  1. Redirects unauthenticated users to /login
 *  2. Redirects unverified users to the appropriate verification step
 *  3. Optionally gates a route to one or more roles (allowedRoles prop)
 *
 * @param {string|string[]} allowedRoles - Single role or array of roles that may access this route
 */
export default function SecureRoute({ children, allowedRoles }) {
  const router = useRouter();
  const pathname = usePathname();
  const [isAuthorized, setIsAuthorized] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const checkAuth = () => {
      if (typeof window === 'undefined') return;

      // 1. Must be logged in
      if (!isAuthenticated()) {
        toast.error('Please login to access this page');
        router.push('/login');
        return;
      }

      // 2. Check email + KYC verification for all /dashboard routes
      if (pathname.startsWith('/dashboard')) {
        const user = getStoredUser();
        if (user) {
          if (!user.is_email_verified) {
            router.push('/signup');
            return;
          }
          if (!user.is_kyc_verified) {
            router.push('/choose-profile');
            return;
          }
        }
      }

      // 3. Role gate — allowedRoles="admin" or allowedRoles={['admin','advisor']}
      if (allowedRoles) {
        const role = getStoredRole();
        const allowed = Array.isArray(allowedRoles) ? allowedRoles : [allowedRoles];
        if (!allowed.includes(role)) {
          toast.error('You do not have permission to access this page');
          router.push('/dashboard');
          return;
        }
      }

      setIsAuthorized(true);
      setIsLoading(false);
    };

    checkAuth();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [router, pathname, JSON.stringify(allowedRoles)]);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-[#0B0D12] flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#F1CB68] mx-auto mb-4"></div>
          <p className="text-gray-400">Loading...</p>
        </div>
      </div>
    );
  }

  if (!isAuthorized) {
    return null;
  }

  return <>{children}</>;
}
