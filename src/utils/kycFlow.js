/**
 * Persona hosted flow helpers.
 * Backend may return persona_inquiry_id: null at start; use verification_url as-is.
 */

import {
  PERSONA_HOSTED_VERIFY_URL,
  PERSONA_INQUIRY_TEMPLATE_ID,
  isPersonaHostedFallbackConfigured,
} from '@/config/persona';
import { getKYCStatus, startKYC, KYC_STATUS } from '@/utils/kycApi';
import { isPersonaInquiryCreateDisabledError } from '@/utils/kycErrors';

export { isPersonaInquiryCreateDisabledError } from '@/utils/kycErrors';

export function getPersonaReferenceId() {
  if (typeof window === 'undefined') {
    return `KYC-${Date.now()}`;
  }
  try {
    const raw = localStorage.getItem('user_info');
    if (raw) {
      const user = JSON.parse(raw);
      if (user?.id) return `KYC-${user.id}`;
      if (user?.email) return `KYC-${encodeURIComponent(user.email)}`;
    }
  } catch {
    // ignore
  }
  const email = localStorage.getItem('pending_verification_email');
  if (email) return `KYC-${encodeURIComponent(email)}`;
  return `KYC-${Date.now()}`;
}

/** Build Persona hosted URL (same shape as backend hosted-flow fallback). */
export function buildPersonaHostedVerificationUrl(
  templateId = PERSONA_INQUIRY_TEMPLATE_ID,
  referenceId = getPersonaReferenceId()
) {
  if (!templateId) return null;
  const params = new URLSearchParams({
    'inquiry-template-id': templateId,
    'reference-id': referenceId,
  });
  const base = PERSONA_HOSTED_VERIFY_URL.replace(/\?.*$/, '');
  return `${base}?${params.toString()}`;
}

/**
 * Redirect using env template when POST /kyc/start fails with inquiries.create disabled.
 * @returns {boolean} true if redirect was triggered
 */
export function tryClientHostedPersonaFallback() {
  if (!isPersonaHostedFallbackConfigured()) {
    return false;
  }
  const url = buildPersonaHostedVerificationUrl();
  if (!url) return false;
  if (typeof window !== 'undefined') {
    sessionStorage.setItem('kyc_hosted_fallback', '1');
  }
  window.location.href = url;
  return true;
}

export function getKycUserFacingError(err) {
  if (isPersonaInquiryCreateDisabledError(err)) {
    if (isPersonaHostedFallbackConfigured()) {
      return 'Redirecting you to Persona verification…';
    }
    return 'Could not start identity verification. Please try again.';
  }
  if (typeof err?.data?.detail === 'string') return err.data.detail;
  if (typeof err?.message === 'string') return err.message;
  return 'Could not start identity verification. Please try again.';
}

export function getKycErrorMessage(
  response,
  fallback = 'Could not start identity verification'
) {
  if (!response) return fallback;
  if (typeof response.detail === 'string') return response.detail;
  if (typeof response.message === 'string') return response.message;
  return fallback;
}

/** Redirect to backend-hosted Persona URL. Returns true if redirect was triggered. */
export function redirectToVerificationUrl(response) {
  const url = response?.verification_url;
  if (url) {
    window.location.href = url;
    return true;
  }
  return false;
}

/**
 * Handle POST /kyc/start (or status) response.
 * @returns {'redirected' | 'embedded' | 'error'}
 */
export function handleKycStartResponse(response, { onEmbeddedInquiryId } = {}) {
  if (redirectToVerificationUrl(response)) {
    return 'redirected';
  }
  if (response?.persona_inquiry_id && onEmbeddedInquiryId) {
    onEmbeddedInquiryId(response.persona_inquiry_id);
    return 'embedded';
  }
  return 'error';
}

/**
 * Prefer verification_url from GET /kyc/status before POST /kyc/start.
 * On inquiries.create API errors, optional client hosted redirect via env template.
 */
export async function startKycWithHostedFlowFirst({
  verificationLevel = null,
  verificationType = null,
  onEmbeddedInquiryId,
} = {}) {
  try {
    const status = await getKYCStatus();
    if (status?.status === KYC_STATUS.APPROVED) {
      return { outcome: 'approved', data: status };
    }
    const fromStatus = handleKycStartResponse(status, { onEmbeddedInquiryId });
    if (fromStatus !== 'error') {
      return { outcome: fromStatus, data: status };
    }
  } catch (err) {
    if (err?.status !== 404) {
      throw err;
    }
  }

  try {
    const started = await startKYC(verificationLevel, verificationType);
    const fromStart = handleKycStartResponse(started, { onEmbeddedInquiryId });
    if (fromStart === 'error') {
      const err = new Error(getKycErrorMessage(started));
      err.status = 502;
      err.data = { detail: getKycErrorMessage(started) };
      throw err;
    }
    return { outcome: fromStart, data: started };
  } catch (err) {
    if (isPersonaInquiryCreateDisabledError(err) && tryClientHostedPersonaFallback()) {
      return { outcome: 'redirected', data: { verification_url: 'client-fallback' } };
    }
    throw err;
  }
}
