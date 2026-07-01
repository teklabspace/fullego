'use client';
import { useEffect, useState } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { isAuthenticated } from '@/utils/authApi';
import { getStoredRole, getStoredUser } from '@/utils/permissions';
import { resolveOnboardingRoute } from '@/utils/onboarding';
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
    let cancelled = false;

    const checkAuth = async () => {
      if (typeof window === 'undefined') return;

      // 1. Must be logged in
      if (!isAuthenticated()) {
        toast.error('Please login to access this page');
        router.push('/login');
        return;
      }

      // 2. Enforce the onboarding order (email → KYC → subscription) for all
      // /dashboard routes. resolveOnboardingRoute returns the step the user still
      // needs, or null when they're fully onboarded.
      if (pathname.startsWith('/dashboard')) {
        const user = getStoredUser();
        if (user) {
          const dest = await resolveOnboardingRoute(user);
          if (cancelled) return;
          if (dest && dest !== pathname) {
            router.push(dest);
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

      if (cancelled) return;
      setIsAuthorized(true);
      setIsLoading(false);
    };

    checkAuth();
    return () => {
      cancelled = true;
    };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [router, pathname, JSON.stringify(allowedRoles)]);

  if (isLoading) {
    // The auth check is synchronous (reads localStorage), so don't paint a
    // full-screen loader here — it would be a generic placeholder that doesn't
    // match the target page. Render nothing for the brief check; each page shows
    // its own matching skeleton once it mounts.
    return null;
  }

  if (!isAuthorized) {
    return null;
  }

  return <>{children}</>;
}
