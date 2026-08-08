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
