/**
 * Delegated Asset Creation API
 *
 * Investor requests an advisor → admin approves → a single-use grant lets that
 * advisor create ONE asset on the investor's behalf.
 *
 * Backend is snake_case; everything below returns camelCase for the UI.
 *
 * Envelope note (verified live 2026-08-12). `client.js` unwraps a response only
 * when it carries BOTH `success` and `status_code`. These endpoints return
 * `{ success, data }` with no `status_code`, so the client leaves them alone and
 * the payload is `res.data`. (Legacy endpoints like /admin/users DO carry
 * `status_code`, get unwrapped once, and land at `res.data` too — same access
 * path, different reason. Don't "simplify" either one to match the other.)
 *
 * Spec: docs/superpowers/specs/2026-08-12-delegated-asset-creation-design.md
 */

import { API_ENDPOINTS } from '@/config/api';
import { apiDelete, apiGet, apiPost } from '@/lib/api/client';

const buildQuery = (params) => {
  const clean = Object.fromEntries(
    Object.entries(params).filter(([, v]) => v !== undefined && v !== null && v !== '')
  );
  if (!Object.keys(clean).length) return '';
  return `?${new URLSearchParams(clean)}`;
};

const mapPerson = (p) => (p ? { id: p.id, name: p.name, email: p.email } : null);

const mapRequest = (r) => ({
  id: r.id,
  investorId: r.investor_id,
  requestedAdvisorId: r.requested_advisor_id,
  requestedAdvisor: mapPerson(r.requested_advisor),
  investor: mapPerson(r.investor),
  note: r.note,
  status: r.status,
  decisionReason: r.decision_reason,
  decidedAt: r.decided_at,
  createdAt: r.created_at,
});

const mapGrant = (g) => ({
  id: g.id,
  investorId: g.investor_id,
  advisorId: g.advisor_id,
  investor: mapPerson(g.investor),
  advisor: mapPerson(g.advisor),
  status: g.status,
  assetId: g.asset_id,
  expiresAt: g.expires_at,
  consumedAt: g.consumed_at,
  revokedAt: g.revoked_at,
  createdAt: g.created_at,
  isUsable: g.is_usable ?? false,
});

// ── Investor ─────────────────────────────────────────────────────────────────

/** POST /advisor-requests — ask an admin to allot an advisor. */
export const requestAdvisor = async ({ advisorId, note } = {}) => {
  const res = await apiPost(API_ENDPOINTS.DELEGATION.REQUESTS, {
    requested_advisor_id: advisorId || null,
    note: note || null,
  });
  return mapRequest(res?.data ?? {});
};

/** GET /advisor-requests/me — request history + the investor's current advisor. */
export const getMyAdvisorRequests = async () => {
  const res = await apiGet(API_ENDPOINTS.DELEGATION.MY_REQUESTS);
  const data = res?.data ?? {};
  return {
    requests: (data.requests || []).map(mapRequest),
    currentAdvisor: mapPerson(data.current_advisor),
  };
};

/** DELETE /advisor-requests/{id} — withdraw a pending request. */
export const cancelAdvisorRequest = async (requestId) => {
  const res = await apiDelete(API_ENDPOINTS.DELEGATION.CANCEL_REQUEST(requestId));
  return mapRequest(res?.data ?? {});
};

/** GET /advisor-requests/directory — advisors the investor can name. */
export const getAdvisorDirectory = async () => {
  const res = await apiGet(API_ENDPOINTS.DELEGATION.ADVISOR_DIRECTORY);
  return (res?.data || []).map(mapPerson);
};

// ── Grants (investor + advisor) ──────────────────────────────────────────────

/** GET /delegation-grants?as=investor|advisor */
export const listDelegationGrants = async (as = 'investor') => {
  const res = await apiGet(`${API_ENDPOINTS.DELEGATION.GRANTS}${buildQuery({ as })}`);
  return (res?.data || []).map(mapGrant);
};

/** POST /delegation-grants/{id}/revoke — investor or admin only. */
export const revokeDelegationGrant = async (grantId) => {
  const res = await apiPost(API_ENDPOINTS.DELEGATION.REVOKE_GRANT(grantId), {});
  return mapGrant(res?.data ?? {});
};

// ── Admin ────────────────────────────────────────────────────────────────────

/** GET /admin/advisor-requests — the approval queue. */
export const listAdvisorRequests = async ({ status, page = 1, pageSize = 50 } = {}) => {
  const res = await apiGet(
    `${API_ENDPOINTS.ADMIN.ADVISOR_REQUESTS}${buildQuery({ status, page, page_size: pageSize })}`
  );
  return {
    requests: (res?.data || []).map(mapRequest),
    total: res?.total ?? 0,
    page: res?.page ?? page,
  };
};

/** POST /admin/advisor-requests/{id}/approve — assigns the advisor + issues the grant. */
export const approveAdvisorRequest = async (requestId, advisorId) => {
  const res = await apiPost(API_ENDPOINTS.ADMIN.APPROVE_ADVISOR_REQUEST(requestId), {
    advisor_id: advisorId,
  });
  const data = res?.data ?? {};
  return {
    request: mapRequest(data.request || {}),
    grant: data.grant ? mapGrant(data.grant) : null,
    conversationId: data.conversation_id ?? null,
  };
};

/** POST /admin/advisor-requests/{id}/reject */
export const rejectAdvisorRequest = async (requestId, reason) => {
  const res = await apiPost(API_ENDPOINTS.ADMIN.REJECT_ADVISOR_REQUEST(requestId), {
    reason: reason || null,
  });
  return mapRequest(res?.data ?? {});
};
