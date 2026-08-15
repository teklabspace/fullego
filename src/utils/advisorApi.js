/**
 * Advisor (self) API. The advisor's assigned clients, each with the
 * conversation id of their auto-created chat.
 */
import { API_ENDPOINTS } from '@/config/api';
import { apiGet } from '@/lib/api/client';

/** GET /advisor/clients — { data: [{ client_id, name, email, kyc_status, plan, conversation_id }], total } */
export const getAdvisorClients = () => apiGet(API_ENDPOINTS.ADVISOR.CLIENTS);

/** snake→camel, local copy by repo convention. */
const snakeToCamel = (str) => str.replace(/_([a-z])/g, (_, c) => c.toUpperCase());
const transformKeys = (obj) => {
  if (obj === null || obj === undefined) return obj;
  if (Array.isArray(obj)) return obj.map(transformKeys);
  if (typeof obj === 'object' && !(obj instanceof Date)) {
    const out = {};
    for (const [k, v] of Object.entries(obj)) out[snakeToCamel(k)] = transformKeys(v);
    return out;
  }
  return obj;
};

/**
 * Aggregated book view for the advisor dashboard charts.
 * GET /advisor/book → { totalValue, clientCount,
 *   clients: [{clientId, name, totalValue, classes: [{assetType, value}]}],
 *   allocation: [{assetType, value, count}] }
 */
export const getAdvisorBook = async () => {
  const response = await apiGet(API_ENDPOINTS.ADVISOR.BOOK);
  return transformKeys(response?.data ?? response ?? {});
};

// ── Client-scoped reads ──────────────────────────────────────────────────────
// Backend gates these on `advisor_clients`; a non-client returns 403 with
// code NOT_YOUR_CLIENT. Every call is recorded in the client's activity log.
// These endpoints emit {success, data} without `status_code`, so client.js
// leaves the envelope intact and the payload is `res.data` (same rule as
// delegationApi.js — see the envelope note there).

const clientPayload = async (endpoint) => {
  const res = await apiGet(endpoint);
  return transformKeys(res?.data ?? {});
};

/** GET /advisor/clients/{id} → { client, kycStatus, plan, netWorth, assetCount, allocation } */
export const getClientDetail = (clientId) =>
  clientPayload(API_ENDPOINTS.ADVISOR.CLIENT_DETAIL(clientId));

/** GET /advisor/clients/{id}/assets */
export const getClientAssets = async (clientId) =>
  (await clientPayload(API_ENDPOINTS.ADVISOR.CLIENT_ASSETS(clientId))) || [];

/** GET /advisor/clients/{id}/documents — metadata only, no storage paths. */
export const getClientDocuments = async (clientId) =>
  (await clientPayload(API_ENDPOINTS.ADVISOR.CLIENT_DOCUMENTS(clientId))) || [];

/** GET /advisor/clients/{id}/goals — includes progressPct. */
export const getClientGoals = async (clientId) =>
  (await clientPayload(API_ENDPOINTS.ADVISOR.CLIENT_GOALS(clientId))) || [];

/** GET /advisor/clients/{id}/requests — appraisals + sale requests, newest first. */
export const getClientRequests = async (clientId) =>
  (await clientPayload(API_ENDPOINTS.ADVISOR.CLIENT_REQUESTS(clientId))) || [];

/** GET /advisor/clients/{id}/activity — who did what to this client, when. */
export const getClientActivity = async (clientId) =>
  (await clientPayload(API_ENDPOINTS.ADVISOR.CLIENT_ACTIVITY(clientId))) || [];
