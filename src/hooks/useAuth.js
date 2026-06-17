'use client';

import { useState, useEffect } from 'react';
import { can as checkPermission, getStoredUser } from '@/utils/permissions';

/**
 * Hook that exposes the current user's identity and permission helpers.
 * Reads from localStorage — role never changes mid-session.
 */
export function useAuth() {
  const [user, setUser] = useState(null);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    setUser(getStoredUser());
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
