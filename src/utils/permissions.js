/**
 * Frontend permission matrix — mirrors backend enforcement.
 * Roles: "admin" | "investor" | "advisor"
 */

const PERMISSIONS = {
  admin: new Set([
    'read:users',
    'write:users',
    'read:assets',
    'write:assets',
    'read:portfolio',
    'write:portfolio',
    'place:trades',
    'create:marketplace_listings',
    'approve:marketplace_listings',
    'manage:subscriptions',
    'view:analytics',
    'manage:support',
    'reply:tickets',
    'post:internal_notes',
    'assign:tickets',
    'update:ticket_status',
    'view:all_tickets',
  ]),
  advisor: new Set([
    'read:users',
    'read:assets',
    'read:portfolio',
    'write:portfolio',
    'place:trades',
    'create:marketplace_listings',
    'approve:marketplace_listings',
    'view:analytics',
    'manage:support',
    'reply:tickets',
    'post:internal_notes',
    'update:ticket_status',
    'view:all_tickets',
  ]),
  investor: new Set([
    'read:users',
    'read:assets',
    // Only investors own and create assets — advisors advise on them and
    // admins manage/review them, so neither gets create:assets.
    'create:assets',
    'read:portfolio',
    'write:portfolio',
    'place:trades',
    'create:marketplace_listings',
    'view:own_tickets',
  ]),
};

/**
 * Check if a role has the given permission.
 * @param {string|null} role
 * @param {string} permission
 * @returns {boolean}
 */
export const can = (role, permission) => {
  if (!role) return false;
  return PERMISSIONS[role]?.has(permission) ?? false;
};

/**
 * Read the current user's role from localStorage (client-side only).
 * @returns {"admin"|"investor"|"advisor"|null}
 */
export const getStoredRole = () => {
  if (typeof window === 'undefined') return null;
  try {
    const user = JSON.parse(localStorage.getItem('user_info') || '{}');
    return user.role || null;
  } catch {
    return null;
  }
};

/**
 * Read the full stored user object.
 * @returns {object|null}
 */
export const getStoredUser = () => {
  if (typeof window === 'undefined') return null;
  try {
    return JSON.parse(localStorage.getItem('user_info') || 'null');
  } catch {
    return null;
  }
};
