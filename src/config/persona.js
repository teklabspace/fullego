/**
 * Persona hosted verification (client fallback when backend still uses inquiries.create).
 * Set in .env.local:
 *   NEXT_PUBLIC_PERSONA_INQUIRY_TEMPLATE_ID=itmpl_xxxx
 */

export const PERSONA_INQUIRY_TEMPLATE_ID =
  process.env.NEXT_PUBLIC_PERSONA_INQUIRY_TEMPLATE_ID?.trim() || '';

export const PERSONA_HOSTED_VERIFY_URL =
  process.env.NEXT_PUBLIC_PERSONA_HOSTED_VERIFY_URL?.trim() ||
  'https://inquiry.withpersona.com/verify';

export function isPersonaHostedFallbackConfigured() {
  return Boolean(PERSONA_INQUIRY_TEMPLATE_ID);
}
