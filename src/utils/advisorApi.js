/**
 * Advisor (self) API. The advisor's assigned clients, each with the
 * conversation id of their auto-created chat.
 */
import { API_ENDPOINTS } from '@/config/api';
import { apiGet } from '@/lib/api/client';

/** GET /advisor/clients — { data: [{ client_id, name, email, kyc_status, plan, conversation_id }], total } */
export const getAdvisorClients = () => apiGet(API_ENDPOINTS.ADVISOR.CLIENTS);
