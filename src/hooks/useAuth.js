'use client';

import { useState, useEffect } from 'react';
import { can as checkPermission, getStoredUser } from '@/utils/permissions';
import { getUserProfile } from '@/utils/authApi';

/**
 * Hook that exposes the current user's identity and permission helpers.
 * Reads from localStorage — role never changes mid-session.
 */
export function useAuth() {
  const [user, setUser] = useState(null);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    const stored = getStoredUser();
    setUser(stored);

    // Some auth paths (Google OAuth, 2FA, older sessions) don't always persist
    // `role` into user_info. Without it, every role-gated UI (sidebar, routes)
    // falls back to the most-restricted role and every account looks identical.
    // If we have a session but no stored role, recover it from /users/me.
    const hasToken =
      typeof window !== 'undefined' && !!localStorage.getItem('access_token');
    if (hasToken && !stored?.role) {
      getUserProfile()
        .then((profile) => {
          if (profile?.role) {
            const merged = { ...(stored || {}), ...profile };
            localStorage.setItem('user_info', JSON.stringify(merged));
            setUser(merged);
          }
        })
        .catch(() => {});
    }
  }, []);

  const role = user?.role ?? null;

  return {
    user,
    role,
    mounted,
    isAdmin: role === 'admin',
    isAdvisor: role === 'advisor',
    isInvestor: role === 'investor',
    isKycVerified: user?.is_kyc_verified ?? false,
    isEmailVerified: user?.is_email_verified ?? false,
    /** can('create:marketplace_listings') etc. */
    can: (permission) => checkPermission(role, permission),
  };
}
