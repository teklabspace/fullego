/**
 * Maps backend `oauth_next` query hint to an in-app route after OAuth.
 * Unknown non-empty values → home (/).
 * Empty / missing → dashboard (default success path).
 */
export function getRouteForOauthNext(oauthNext) {
  const raw = String(oauthNext ?? '')
    .trim()
    .toLowerCase();
  if (!raw) {
    return '/dashboard';
  }
  switch (raw) {
    case 'dashboard':
      return '/dashboard';
    case 'persona_wait':
      return '/kyc-verification';
    case 'verify_email':
      return '/verify-email';
    default:
      return '/';
  }
}
