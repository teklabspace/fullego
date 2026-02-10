/**
 * API Configuration
 * Centralized configuration for all API endpoints and base URLs
 */

/**
 * API Base URL
 * Can be overridden by environment variable NEXT_PUBLIC_API_BASE_URL
 * Defaults to production backend if no env variable is set
 */
export const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:8000/';
/**
 * API Version
 */
export const API_VERSION = 'v1';

/**
 * API Base Path
 */
export const API_BASE_PATH = `/api/${API_VERSION}`;

/**
 * Full API Base URL with path
 */
export const API_FULL_BASE_URL = `${API_BASE_URL}${API_BASE_PATH}`;

/**
 * API Endpoints
 */
export const API_ENDPOINTS = {
  // Authentication endpoints
  AUTH: {
    BASE: '/auth',
    REGISTER: '/auth/register',
    LOGIN: '/auth/login',
    REFRESH: '/auth/refresh',
    REQUEST_OTP: '/auth/request-otp',
    VERIFY_OTP: '/auth/verify-otp',
    REQUEST_PASSWORD_RESET: '/auth/request-password-reset',
    RESET_PASSWORD: '/auth/reset-password',
    VERIFY_EMAIL: '/auth/verify-email',
    RESEND_VERIFICATION: '/auth/resend-verification',
  },
  // KYC (Know Your Customer) endpoints
  KYC: {
    BASE: '/kyc',
    START: '/kyc/start',
    STATUS: '/kyc/status',
    SUBMIT: '/kyc/submit',
    SYNC_STATUS: '/kyc/sync-status',
    UPLOAD_DOCUMENT: '/kyc/upload-document',
    DOCUMENTS: '/kyc/documents',
    RESUBMIT: '/kyc/resubmit',
    REJECTION_REASON: '/kyc/rejection-reason',
  },
  // KYB (Know Your Business) endpoints
  KYB: {
    BASE: '/kyb',
    START: '/kyb/start',
    STATUS: '/kyb/status',
    UPLOAD_DOCUMENT: '/kyb/upload-document',
    SUBMIT: '/kyb/submit',
  },
  // User endpoints
  USERS: {
    BASE: '/users',
    PROFILE: '/users/me', // Use /me instead of /profile to avoid route conflict with /users/{user_id}
    UPDATE_PROFILE: '/users/me', // Updated to match API documentation
    // Notification Preferences
    NOTIFICATIONS: '/users/notifications',
    // Privacy Preferences
    PRIVACY: '/users/privacy',
    // Two-Factor Authentication
    TWO_FACTOR_AUTH: '/users/two-factor-auth',
    TWO_FACTOR_AUTH_STATUS: '/users/two-factor-auth/status',
    TWO_FACTOR_AUTH_SETUP: '/users/two-factor-auth/setup',
    TWO_FACTOR_AUTH_VERIFY: '/users/two-factor-auth/verify',
    // Password Management
    CHANGE_PASSWORD: '/users/change-password',
    // Account Management
    DEACTIVATE_ACCOUNT: '/users/deactivate',
    DELETE_ACCOUNT: '/users/delete',
  },
  // Assets endpoints
  ASSETS: {
    BASE: '/assets',
    LIST: '/assets',
    GET_BY_ID: (id) => `/assets/${id}`,
    CREATE: '/assets',
    UPDATE: (id) => `/assets/${id}`,
    DELETE: (id) => `/assets/${id}`,
    // Categories
    CATEGORIES: '/assets/categories',
    CATEGORY_GROUPS: '/assets/category-groups',
    // Photos
    UPLOAD_PHOTO: (id) => `/assets/${id}/photos`,
    DELETE_PHOTO: (id, photoId) => `/assets/${id}/photos/${photoId}`,
    // Documents
    UPLOAD_DOCUMENT: (id) => `/assets/${id}/documents`,
    GET_DOCUMENTS: (id) => `/assets/${id}/documents`,
    DELETE_DOCUMENT: (id, documentId) => `/assets/${id}/documents/${documentId}`,
    // Valuation & Appraisal
    VALUE_HISTORY: (id) => `/assets/${id}/value-history`,
    REQUEST_APPRAISAL: (id) => `/assets/${id}/appraisals`,
    GET_APPRAISALS: (id) => `/assets/${id}/appraisals`,
    GET_APPRAISAL: (id, appraisalId) => `/assets/${id}/appraisals/${appraisalId}`,
    UPDATE_VALUATION: (id) => `/assets/${id}/valuation`,
    // Sale Requests
    REQUEST_SALE: (id) => `/assets/${id}/sale-requests`,
    GET_SALE_REQUESTS: (id) => `/assets/${id}/sale-requests`,
    GET_SALE_REQUEST: (id, requestId) => `/assets/${id}/sale-requests/${requestId}`,
    CANCEL_SALE_REQUEST: (id, requestId) => `/assets/${id}/sale-requests/${requestId}`,
    // Asset Actions
    TRANSFER: (id) => `/assets/${id}/transfer`,
    SHARE: (id) => `/assets/${id}/share`,
    GENERATE_REPORT: (id) => `/assets/${id}/reports`,
    GET_REPORT: (id, reportId) => `/assets/${id}/reports/${reportId}`,
    // Analytics
    SUMMARY: '/assets/summary',
    VALUE_TRENDS: '/assets/value-trends',
  },
  // Files endpoints
  FILES: {
    BASE: '/files',
    UPLOAD: '/files/upload',
  },
  // Investment Management endpoints ⭐ INTEGRATED
  INVESTMENT: {
    BASE: '/investment',
    // Overview
    OVERVIEW: '/investment/overview',
    OVERVIEW_ASSETS: '/investment/overview/assets',
    OVERVIEW_ACTIVITY: '/investment/overview/activity',
    OVERVIEW_CRYPTO_PRICES: '/investment/overview/crypto-prices',
    OVERVIEW_TRADER_PROFILE: '/investment/overview/trader-profile',
    // Goals
    GOALS: '/investment/goals',
    GET_GOAL: (id) => `/investment/goals/${id}`,
    CREATE_GOAL: '/investment/goals',
    UPDATE_GOAL: (id) => `/investment/goals/${id}`,
    DELETE_GOAL: (id) => `/investment/goals/${id}`,
    GOAL_PROGRESS: (id) => `/investment/goals/${id}/progress`,
    GOAL_COMPLETION: (id) => `/investment/goals/${id}/completion`,
    // Strategies
    STRATEGIES: '/investment/strategies',
    GET_STRATEGY: (id) => `/investment/strategies/${id}`,
    CREATE_STRATEGY: '/investment/strategies',
    UPDATE_STRATEGY: (id) => `/investment/strategies/${id}`,
    DELETE_STRATEGY: (id) => `/investment/strategies/${id}`,
    SAVE_STRATEGY: (id) => `/investment/strategies/${id}/save`,
    STRATEGY_COMMENTS: (id) => `/investment/strategies/${id}/comments`,
    ADD_COMMENT: (id) => `/investment/strategies/${id}/comments`,
    BOOST_STRATEGY: (id) => `/investment/strategies/${id}/boost`,
    APPLY_STRATEGY: (id) => `/investment/strategies/${id}/apply`,
    SHARE_STRATEGY: (id) => `/investment/strategies/${id}/share`,
    // Extra APIs (Structure only - not integrated)
    PERFORMANCE: '/investment/performance',
    ANALYTICS: '/investment/analytics',
    RECOMMENDATIONS: '/investment/recommendations',
    ADJUST_GOAL: (id) => `/investment/goals/${id}/adjust`,
    STRATEGY_BACKTEST: (id) => `/investment/strategies/${id}/backtest`,
    STRATEGY_PERFORMANCE: (id) => `/investment/strategies/${id}/performance`,
    CLONE_STRATEGY: (id) => `/investment/strategies/${id}/clone`,
    WATCHLIST: '/investment/watchlist',
    ADD_TO_WATCHLIST: '/investment/watchlist',
    REMOVE_FROM_WATCHLIST: (id) => `/investment/watchlist/${id}`,
  },
  // Portfolio Management endpoints (from INVESTMENT_APIS.md)
  PORTFOLIO: {
    BASE: '/portfolio',
    // Overview
    GET_PORTFOLIO: '/portfolio',
    SUMMARY: '/portfolio/summary',
    TOP_HOLDINGS: '/portfolio/holdings/top',
    RECENT_ACTIVITY: '/portfolio/activity/recent',
    MARKET_SUMMARY: '/portfolio/market-summary',
    ALERTS: '/portfolio/alerts',
    // Performance & Analytics
    PERFORMANCE: '/portfolio/performance',
    HISTORY: '/portfolio/history',
    ALLOCATION: '/portfolio/allocation',
    RISK: '/portfolio/risk',
    BENCHMARK: '/portfolio/benchmark',
    // Crypto Portfolio
    CRYPTO_SUMMARY: '/portfolio/crypto/summary',
    CRYPTO_PERFORMANCE: '/portfolio/crypto/performance',
    CRYPTO_BREAKDOWN: '/portfolio/crypto/breakdown',
    CRYPTO_HOLDINGS: '/portfolio/crypto/holdings',
    // Cash Flow Management
    CASH_FLOW_SUMMARY: '/portfolio/cash-flow/summary',
    CASH_FLOW_TRENDS: '/portfolio/cash-flow/trends',
    CASH_FLOW_TRANSACTIONS: '/portfolio/cash-flow/transactions',
    CASH_FLOW_ACCOUNTS: '/portfolio/cash-flow/accounts',
    CASH_FLOW_TRANSFERS: '/portfolio/cash-flow/transfers',
    GET_TRANSFER: (id) => `/portfolio/cash-flow/transfers/${id}`,
  },
  // Trading APIs (from INVESTMENT_APIS.md)
  TRADING: {
    BASE: '/trading',
    ACCOUNT: '/trading/account',
    ASSETS: '/trading/assets',
    TRANSACTIONS: '/trading/transactions',
  },
  // Trade Engine APIs (from INVESTMENT_APIS.md)
  TRADE_ENGINE: {
    BASE: '/portfolio/trade-engine',
    SEARCH: '/portfolio/trade-engine/search',
    GET_ASSET: (symbol) => `/portfolio/trade-engine/assets/${symbol}`,
    RECENT_TRADES: '/portfolio/trade-engine/recent-trades',
    ASSET_HISTORY: (symbol) => `/portfolio/trade-engine/assets/${symbol}/history`,
    ACCOUNTS: '/portfolio/trade-engine/accounts',
    PLACE_ORDER: '/portfolio/trade-engine/orders',
    GET_ORDER: (id) => `/portfolio/trade-engine/orders/${id}`,
    CANCEL_ORDER: (id) => `/portfolio/trade-engine/orders/${id}`,
  },
  // Marketplace APIs (from INVESTMENT_APIS.md)
  MARKETPLACE: {
    BASE: '/marketplace',
    // Listings
    CREATE_LISTING: '/marketplace/listings',
    LIST_LISTINGS: '/marketplace/listings',
    GET_LISTING: (id) => `/marketplace/listings/${id}`,
    UPDATE_LISTING: (id) => `/marketplace/listings/${id}`,
    DELETE_LISTING: (id) => `/marketplace/listings/${id}`,
    APPROVE_LISTING: (id) => `/marketplace/listings/${id}/approve`,
    ACTIVATE_LISTING: (id) => `/marketplace/listings/${id}/activate`,
    PAY_LISTING_FEE: (id) => `/marketplace/listings/${id}/pay-fee`,
    GET_LISTING_OFFERS: (id) => `/marketplace/listings/${id}/offers`,
    SEARCH: '/marketplace/search',
    // Offers
    CREATE_OFFER: (listingId) => `/marketplace/listings/${listingId}/offers`,
    GET_OFFER: (id) => `/marketplace/offers/${id}`,
    ACCEPT_OFFER: (id) => `/marketplace/offers/${id}/accept`,
    REJECT_OFFER: (id) => `/marketplace/offers/${id}/reject`,
    COUNTER_OFFER: (id) => `/marketplace/offers/${id}/counter`,
    WITHDRAW_OFFER: (id) => `/marketplace/offers/${id}/withdraw`,
    MY_OFFERS: '/marketplace/offers/my',
    // Escrow
    GET_ESCROW: (id) => `/marketplace/escrow/${id}`,
    FUND_ESCROW: (id) => `/marketplace/escrow/${id}/fund`,
    RELEASE_ESCROW: (id) => `/marketplace/escrow/${id}/release`,
    DISPUTE_ESCROW: (id) => `/marketplace/escrow/${id}/dispute`,
    REFUND_ESCROW: (id) => `/marketplace/escrow/${id}/refund`,
    // Market Highlights
    MARKET_HIGHLIGHTS: '/marketplace/market-highlights',
    MARKET_TRENDS: '/marketplace/market-trends',
    MARKET_SUMMARY: '/marketplace/market-summary',
    // Watchlist
    WATCHLIST: '/marketplace/watchlist',
    ADD_TO_WATCHLIST: '/marketplace/watchlist',
    CHECK_WATCHLIST: (listingId) => `/marketplace/watchlist/check/${listingId}`,
    REMOVE_FROM_WATCHLIST: (watchlistItemId) => `/marketplace/watchlist/${watchlistItemId}`,
    UPDATE_WATCHLIST_ITEM: (watchlistItemId) => `/marketplace/watchlist/${watchlistItemId}`,
  },
  // Account & Banking APIs (from INVESTMENT_APIS.md)
  ACCOUNTS: {
    BASE: '/accounts',
    CREATE: '/accounts',
    GET_ME: '/accounts/me',
    UPDATE_ME: '/accounts/me',
    DELETE_ME: '/accounts/me',
    LIST: '/accounts',
    VERIFY: '/accounts/verify',
    STATS: '/accounts/stats',
    SETTINGS: '/accounts/settings',
    UPDATE_SETTINGS: '/accounts/settings',
    // Joint Accounts
    JOINT_USERS: '/accounts/joint-users',
    INVITE_JOINT_USER: '/accounts/joint-users/invite',
    ACCEPT_JOINT_INVITATION: '/accounts/joint-users/accept-invitation',
    REMOVE_JOINT_USER: (id) => `/accounts/joint-users/${id}`,
    // Admin
    SUSPEND_ACCOUNT: (id) => `/accounts/admin/${id}/suspend`,
    ACTIVATE_ACCOUNT: (id) => `/accounts/admin/${id}/activate`,
  },
  BANKING: {
    BASE: '/banking',
    LINK_TOKEN: '/banking/link-token',
    LINK: '/banking/link',
    LIST_ACCOUNTS: '/banking/accounts',
    GET_ACCOUNT: (id) => `/banking/accounts/${id}`,
    DELETE_ACCOUNT: (id) => `/banking/accounts/${id}`,
    GET_TRANSACTIONS: (id) => `/banking/accounts/${id}/transactions`,
    GET_BALANCE: (id) => `/banking/accounts/${id}/balance`,
  },
  // Subscription & Billing APIs (Preferences Tab)
  SUBSCRIPTIONS: {
    BASE: '/subscriptions',
    GET_CURRENT: '/subscriptions',
    CREATE: '/subscriptions',
    CANCEL: '/subscriptions/cancel',
    RENEW: '/subscriptions/renew',
    UPGRADE: '/subscriptions/upgrade',
    HISTORY: '/subscriptions/history',
    PERMISSIONS: '/subscriptions/permissions',
    LIMITS: '/subscriptions/limits',
  },
  // Payment APIs (from INVESTMENT_APIS.md)
  PAYMENTS: {
    BASE: '/payments',
    // Payment Processing
    CREATE_INTENT: '/payments/create-intent',
    WEBHOOK: '/payments/webhook',
    HISTORY: '/payments/history',
    STATS: '/payments/stats',
    // Payment Methods
    GET_PAYMENT_METHODS: '/payments/payment-methods',
    ADD_PAYMENT_METHOD: '/payments/payment-methods',
    DELETE_PAYMENT_METHOD: (id) => `/payments/payment-methods/${id}`,
    // Refunds
    CREATE_REFUND: (id) => `/payments/payments/${id}/refund`,
    GET_REFUNDS: (id) => `/payments/payments/${id}/refunds`,
    // Invoices
    CREATE_INVOICE: '/payments/invoices',
    LIST_INVOICES: '/payments/invoices',
    GET_INVOICE: (id) => `/payments/invoices/${id}`,
    PAY_INVOICE: (id) => `/payments/invoices/${id}/pay`,
  },
  // Analytics & Reports APIs (from INVESTMENT_APIS.md)
  ANALYTICS: {
    BASE: '/analytics',
    PORTFOLIO: '/analytics/portfolio',
    PERFORMANCE: '/analytics/performance',
    RISK: '/analytics/risk',
  },
  REPORTS: {
    BASE: '/reports',
    GENERATE: '/reports/generate',
    LIST: '/reports',
    GET_REPORT: (id) => `/reports/${id}`,
    DOWNLOAD_REPORT: (id) => `/reports/${id}/download`,
    STATISTICS: '/reports/statistics',
  },
  // Documents endpoints (CRM Dashboard)
  DOCUMENTS: {
    BASE: '/documents',
    LIST: '/documents',
    GET_DOCUMENT: (id) => `/documents/${id}`,
    DOWNLOAD: (id) => `/documents/${id}/download`,
    DELETE: (id) => `/documents/${id}`,
    SHARE: (id) => `/documents/${id}/share`,
    STATISTICS: '/documents/statistics',
    PREVIEW: (id) => `/documents/${id}/preview`,
  },
  // Support Tickets endpoints (CRM Dashboard)
  SUPPORT: {
    BASE: '/support',
    TICKETS: '/support/tickets',
    CREATE_TICKET: '/support/tickets',
    LIST_TICKETS: '/support/tickets',
    GET_TICKET: (id) => `/support/tickets/${id}`,
    UPDATE_TICKET: (id) => `/support/tickets/${id}`,
    ASSIGN_TICKET: (id) => `/support/tickets/${id}/assign`,
    TICKET_DOCUMENTS: (id) => `/support/tickets/${id}/documents`,
    TICKET_COMMENTS: (id) => `/support/tickets/${id}/comments`,
    TICKET_HISTORY: (id) => `/support/tickets/${id}/history`,
    STATISTICS: '/support/statistics',
  },
  // Concierge/Appraisals endpoints (CRM Dashboard)
  CONCIERGE: {
    BASE: '/concierge',
    APPRAISALS: '/concierge/appraisals',
    LIST_APPRAISALS: '/concierge/appraisals',
    GET_APPRAISAL: (id) => `/concierge/appraisals/${id}`,
    UPDATE_STATUS: (id) => `/concierge/appraisals/${id}/status`,
    ASSIGN_APPRAISAL: (id) => `/concierge/appraisals/${id}/assign`,
    APPRAISAL_DOCUMENTS: (id) => `/concierge/appraisals/${id}/documents`,
    APPRAISAL_COMMENTS: (id) => `/concierge/appraisals/${id}/comments`,
    UPDATE_VALUATION: (id) => `/concierge/appraisals/${id}/valuation`,
    DOWNLOAD_REPORT: (id) => `/concierge/appraisals/${id}/report`,
    STATISTICS: '/concierge/statistics',
  },
  // CRM Dashboard endpoints
  CRM: {
    BASE: '/crm',
    USERS: '/crm/users',
    DASHBOARD_OVERVIEW: '/crm/dashboard/overview',
    UPDATES: '/crm/updates',
  },
  // Entity Structure endpoints
  ENTITIES: {
    BASE: '/entities',
    LIST: '/entities',
    GET_ENTITY: (id) => `/entities/${id}`,
    CREATE: '/entities',
    UPDATE: (id) => `/entities/${id}`,
    DELETE: (id) => `/entities/${id}`,
    // Entity Types
    TYPES: '/entities/types',
    GET_TYPE: (typeId) => `/entities/types/${typeId}`,
    // Hierarchy
    HIERARCHY: (id) => `/entities/${id}/hierarchy`,
    ADD_CHILD: (id) => `/entities/${id}/children`,
    UPDATE_PARENT: (id) => `/entities/${id}/parent`,
    // Compliance
    COMPLIANCE: (id) => `/entities/${id}/compliance`,
    UPDATE_COMPLIANCE: (id) => `/entities/${id}/compliance`,
    COMPLIANCE_PACKAGE: (id) => `/entities/${id}/compliance-package`,
    // People & Roles
    PEOPLE: (id) => `/entities/${id}/people`,
    ADD_PERSON: (id) => `/entities/${id}/people`,
    UPDATE_PERSON: (id, personId) => `/entities/${id}/people/${personId}`,
    DELETE_PERSON: (id, personId) => `/entities/${id}/people/${personId}`,
    // Audit Trail
    AUDIT_TRAIL: (id) => `/entities/${id}/audit-trail`,
    ADD_AUDIT_ENTRY: (id) => `/entities/${id}/audit-trail`,
    UPDATE_AUDIT_ENTRY: (id, entryId) => `/entities/${id}/audit-trail/${entryId}`,
    DELETE_AUDIT_ENTRY: (id, entryId) => `/entities/${id}/audit-trail/${entryId}`,
    // Documents
    DOCUMENTS: (id) => `/entities/${id}/documents`,
    UPLOAD_DOCUMENT: (id) => `/entities/${id}/documents`,
    GET_DOCUMENT: (id, documentId) => `/entities/${id}/documents/${documentId}`,
    DOWNLOAD_DOCUMENT: (id, documentId) => `/entities/${id}/documents/${documentId}/download`,
    UPDATE_DOCUMENT_STATUS: (id, documentId) => `/entities/${id}/documents/${documentId}/status`,
    DELETE_DOCUMENT: (id, documentId) => `/entities/${id}/documents/${documentId}`,
  },
  // Compliance Center endpoints
  COMPLIANCE: {
    BASE: '/compliance',
    // Dashboard
    DASHBOARD: '/compliance/dashboard',
    // Tasks
    TASKS: '/compliance/tasks',
    GET_TASK: (taskId) => `/compliance/tasks/${taskId}`,
    CREATE_TASK: '/compliance/tasks',
    UPDATE_TASK: (taskId) => `/compliance/tasks/${taskId}`,
    REASSIGN_TASK: (taskId) => `/compliance/tasks/${taskId}/reassign`,
    COMPLETE_TASK: (taskId) => `/compliance/tasks/${taskId}/complete`,
    DELETE_TASK: (taskId) => `/compliance/tasks/${taskId}`,
    // Audits
    AUDITS: '/compliance/audits',
    GET_AUDIT: (auditId) => `/compliance/audits/${auditId}`,
    CREATE_AUDIT: '/compliance/audits',
    UPDATE_AUDIT: (auditId) => `/compliance/audits/${auditId}`,
    // Alerts
    ALERTS: '/compliance/alerts',
    GET_ALERT: (alertId) => `/compliance/alerts/${alertId}`,
    ACKNOWLEDGE_ALERT: (alertId) => `/compliance/alerts/${alertId}/acknowledge`,
    RESOLVE_ALERT: (alertId) => `/compliance/alerts/${alertId}/resolve`,
    // Score & Metrics
    SCORE_HISTORY: '/compliance/score/history',
    METRICS: '/compliance/metrics',
    // Reports
    GENERATE_REPORT: '/compliance/reports/generate',
    GET_REPORT: (reportId) => `/compliance/reports/${reportId}`,
    DOWNLOAD_REPORT: (reportId) => `/compliance/reports/${reportId}/download`,
    // Policies
    POLICIES: '/compliance/policies',
    GET_POLICY: (policyId) => `/compliance/policies/${policyId}`,
    CREATE_POLICY: '/compliance/policies',
  },
};

/**
 * Get full URL for an endpoint
 * @param {string} endpoint - The endpoint path (e.g., '/auth/login')
 * @returns {string} Full URL
 */
export const getApiUrl = endpoint => {
  return `${API_BASE_URL}${API_BASE_PATH}${endpoint}`;
};

/**
 * Get authentication endpoint URL
 * @param {string} endpoint - The auth endpoint (e.g., 'LOGIN')
 * @returns {string} Full URL
 */
export const getAuthUrl = endpoint => {
  const endpointPath = API_ENDPOINTS.AUTH[endpoint] || endpoint;
  return getApiUrl(endpointPath);
};

/**
 * API Configuration Object
 */
export const apiConfig = {
  baseUrl: API_BASE_URL,
  version: API_VERSION,
  basePath: API_BASE_PATH,
  fullBaseUrl: API_FULL_BASE_URL,
  endpoints: API_ENDPOINTS,
  getUrl: getApiUrl,
  getAuthUrl: getAuthUrl,
};

export default apiConfig;
