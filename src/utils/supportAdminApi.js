/**
 * Admin Support Dashboard API (admin-only, dedicated endpoints).
 * Powers /dashboard/support-dashboard: tickets, asset requests, all chats, and
 * analytics. The shared API client unwraps the response envelope, so these
 * resolve to the payload directly (e.g. `{ data: [...], total }`).
 */
import { API_ENDPOINTS } from '@/config/api';
import { apiGet, apiPost } from '@/lib/api/client';

const qs = (params = {}) => {
  const q = new URLSearchParams();
  Object.entries(params).forEach(([k, v]) => {
    if (v !== undefined && v !== null && v !== '') q.append(k, String(v));
  });
  const s = q.toString();
  return s ? `?${s}` : '';
};

/** GET /admin/support/tickets — all tickets across users/advisors. */
export const listAdminSupportTickets = ({ status, search, limit = 50 } = {}) =>
  apiGet(`${API_ENDPOINTS.ADMIN.SUPPORT_TICKETS}${qs({ status, search, limit })}`);

/** GET /admin/asset-requests — appraisal + sale requests combined. */
export const listAssetRequests = ({ type, status, search, page = 1, pageSize = 50 } = {}) =>
  apiGet(`${API_ENDPOINTS.ADMIN.ASSET_REQUESTS}${qs({ type, status, search, page, page_size: pageSize })}`);

/** POST /admin/asset-requests/{type}/{id}/assign — assign an advisor. */
export const assignAssetRequest = (requestType, requestId, advisorId) =>
  apiPost(API_ENDPOINTS.ADMIN.ASSIGN_ASSET_REQUEST(requestType, requestId), { advisor_id: advisorId });

/** GET /admin/support/conversations — ALL conversations (incl. advisor↔investor). */
export const listAdminConversations = ({ status = 'all', search, limit = 20, offset = 0 } = {}) =>
  apiGet(`${API_ENDPOINTS.ADMIN.SUPPORT_CONVERSATIONS}${qs({ status, search, limit, offset })}`);

/** GET /admin/support/conversations/{id}/messages — read any thread. */
export const getAdminConversationMessages = (conversationId, limit = 50) =>
  apiGet(`${API_ENDPOINTS.ADMIN.SUPPORT_CONVERSATION_MESSAGES(conversationId)}${qs({ limit })}`);

/** GET /admin/support/analytics?range=7d|30d|90d — Reports tab data. */
export const getSupportAnalytics = (range = '30d') =>
  apiGet(`${API_ENDPOINTS.ADMIN.SUPPORT_ANALYTICS}${qs({ range })}`);
