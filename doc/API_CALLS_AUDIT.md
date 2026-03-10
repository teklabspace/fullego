# Frontend API Calls Audit

**Generated:** March 2026  
**Scope:** All API calls from the frontend codebase; config endpoints; mock data usage.

---

## 1. All API Endpoints Being Called

All requests go through `src/lib/api/client.js`, which builds the URL as:  
`${API_BASE_URL}${API_BASE_PATH}${endpoint}` → e.g. `http://localhost:8000/api/v1/auth/login`.

### Auth & Users (`src/utils/authApi.js`)

| Endpoint path | Method | Used from |
|---------------|--------|-----------|
| `/auth/register` | POST | `src/app/signup/page.js` |
| `/auth/login` | POST | `src/app/login/page.js` |
| `/auth/refresh` | POST | authApi (token refresh) |
| `/auth/request-otp` | POST | `src/app/forgot-password/page.js` |
| `/auth/verify-otp` | POST | `src/app/forgot-password/page.js` |
| `/auth/request-password-reset` | POST | authApi |
| `/auth/reset-password` | POST | `src/app/reset-password/page.js` |
| `/auth/verify-email` | POST | `src/app/verify-email/page.js` |
| `/auth/resend-verification` | POST | `src/app/verify-email/page.js` |
| `/users/me` | GET | dashboard, ProfileDropdown, settings |
| `/users/me` | PUT | settings |
| `/users/notifications` | GET/PUT | settings |
| `/users/privacy` | GET/PUT | settings |
| `/users/two-factor-auth/status` | GET | settings |
| `/users/two-factor-auth/setup` | POST | settings |
| `/users/two-factor-auth/verify` | POST | settings |
| `/users/two-factor-auth` | PUT | settings |
| `/users/change-password` | PUT | settings |
| `/users/deactivate` | POST | settings |
| `/users/delete` | POST | settings |

**Files using authApi:** `src/app/login/page.js`, `src/app/signup/page.js`, `src/app/forgot-password/page.js`, `src/app/reset-password/page.js`, `src/app/verify-email/page.js`, `src/app/dashboard/page.js`, `src/app/dashboard/settings/page.js`, `src/components/dashboard/ProfileDropdown.jsx`, `src/components/dashboard/Sidebar.jsx`, `src/components/auth/SecureRoute.jsx`.

---

### KYC / KYB (`src/utils/kycApi.js`)

| Endpoint path | Method | Used from |
|---------------|--------|-----------|
| `/kyc/start` | POST | kyc-verification, identity-verification |
| `/kyc/status` | GET | kyc-verification, kyc/verification-complete, dashboard/kyc |
| `/kyc/submit` | POST | kyc-verification, identity-verification |
| `/kyc/upload-document` | POST | document-verification |
| `/kyc/documents` | GET | kycApi |
| `/kyc/resubmit` | POST | dashboard/kyc |
| `/kyc/rejection-reason` | GET | dashboard/kyc |
| `/kyc/sync-status` | POST | kyc/verification-complete |
| `/kyb/start` | POST | kycApi |
| `/kyb/status` | GET | kycApi |
| `/kyb/upload-document` | POST | kycApi |
| `/kyb/submit` | POST | kycApi |

**Files using kycApi:** `src/app/kyc-verification/page.js`, `src/app/kyc/verification-complete/page.js`, `src/app/document-verification/page.js`, `src/app/identity-verification/page.js`, `src/app/dashboard/kyc/page.js`.

---

### Accounts (`src/utils/accountsApi.js`)

| Endpoint path | Method |
|---------------|--------|
| `/accounts` | GET (list), POST (create) |
| `/accounts/me` | GET, PUT |
| `/accounts/me` | DELETE |
| `/accounts` (query) | GET |
| `/accounts/verify` | POST |
| `/accounts/stats` | GET |
| `/accounts/settings` | GET, PUT |
| `/accounts/joint-users` | GET |
| `/accounts/joint-users/invite` | POST |
| `/accounts/joint-users/accept-invitation` | POST |
| `/accounts/joint-users/{id}` | DELETE |
| `/accounts/admin/{id}/suspend` | POST |
| `/accounts/admin/{id}/activate` | POST |

**Files using accountsApi:** `src/app/dashboard/page.js`.

---

### Banking (`src/utils/bankingApi.js`)

| Endpoint path | Method |
|---------------|--------|
| `/banking/link-token` | POST |
| `/banking/link` | POST |
| `/banking/accounts` | GET |
| `/banking/accounts/{id}` | GET, DELETE |
| `/banking/accounts/{id}/refresh` | POST |
| `/banking/sync/{id}` | POST |
| `/banking/accounts/{id}/transactions` | GET |
| `/banking/accounts/{id}/balance` | GET |

**Files using bankingApi:** `src/app/dashboard/page.js`, `src/app/dashboard/transactions/page.js`, `src/app/dashboard/settings/page.js`.

---

### Portfolio & Trade Engine (`src/utils/portfolioApi.js`)

**Note:** This file uses **hardcoded paths** (e.g. `/portfolio/summary`), not `API_ENDPOINTS.PORTFOLIO`. Paths align with `/api/v1` and with the PORTFOLIO section in config.

| Endpoint path | Method |
|---------------|--------|
| `/portfolio/summary` | GET |
| `/portfolio/performance` | GET |
| `/portfolio/allocation` | GET |
| `/portfolio/holdings/top` | GET |
| `/portfolio/activity/recent` | GET |
| `/portfolio/market-summary` | GET |
| `/portfolio/alerts` | GET |
| `/portfolio` | GET |
| `/portfolio/history` | GET |
| `/portfolio/risk` | GET |
| `/portfolio/benchmark` | GET |
| `/portfolio/crypto/summary` | GET |
| `/portfolio/crypto/performance` | GET |
| `/portfolio/crypto/breakdown` | GET |
| `/portfolio/crypto/holdings` | GET |
| `/portfolio/cash-flow/summary` | GET |
| `/portfolio/cash-flow/trends` | GET |
| `/portfolio/cash-flow/transactions` | GET |
| `/portfolio/cash-flow/accounts` | GET |
| `/portfolio/cash-flow/transfers` | POST, GET |
| `/portfolio/cash-flow/transfers/{id}` | GET |
| `/portfolio/trade-engine/search` | GET |
| `/portfolio/trade-engine/assets/{symbol}` | GET |
| `/portfolio/trade-engine/recent-trades` | GET |
| `/portfolio/trade-engine/assets/{symbol}/history` | GET |
| `/portfolio/trade-engine/accounts` | GET |
| `/portfolio/trade-engine/orders` | POST |
| `/portfolio/trade-engine/orders/{id}` | GET, DELETE |
| `/accounts` (type query) | GET (brokerage accounts) |

**Files using portfolioApi:** `src/app/dashboard/page.js`, `src/app/dashboard/portfolio/Overview/page.js`, `src/app/dashboard/portfolio/cash-flow/page.js`, `src/app/dashboard/portfolio/trade-engine/page.js`, `src/app/dashboard/portfolio/crypto/page.js`, `src/app/dashboard/transactions/page.js`, `src/app/dashboard/investment/goals-tracker/page.js`.

---

### Trading (`src/utils/tradingApi.js`)

| Endpoint path | Method |
|---------------|--------|
| `/trading/account` | GET |
| `/trading/assets` | GET |
| `/trading/transactions` | GET |

**Files using tradingApi:** `src/app/dashboard/transactions/page.js`.

---

### Payments (`src/utils/paymentsApi.js`)

| Endpoint path | Method |
|---------------|--------|
| `/payments/create-intent` | POST |
| `/payments/webhook` | POST |
| `/payments/history` | GET |
| `/payments/stats` | GET |
| `/payments/payment-methods` | GET, POST |
| `/payments/payment-methods/{id}` | DELETE |
| `/payments/payments/{id}/refund` | POST |
| `/payments/payments/{id}/refunds` | GET |
| `/payments/invoices` | POST, GET |
| `/payments/invoices/{id}` | GET |
| `/payments/invoices/{id}/pay` | POST |

**Files using paymentsApi:** `src/app/dashboard/transactions/page.js`, `src/app/dashboard/settings/page.js`.

---

### Subscriptions (`src/utils/subscriptionsApi.js`)

| Endpoint path | Method |
|---------------|--------|
| `/subscriptions/plans` | GET |
| `/subscriptions` | GET, POST |
| `/subscriptions/cancel` | POST |
| `/subscriptions/renew` | POST |
| `/subscriptions/upgrade` | POST |
| `/subscriptions/history` | GET |
| `/subscriptions/permissions` | GET |
| `/subscriptions/limits` | GET |

**Files using subscriptionsApi:** `src/app/dashboard/settings/page.js`.

---

### Investment (`src/utils/investmentApi.js`)

| Endpoint path | Method |
|---------------|--------|
| `/investment/overview` | GET |
| `/investment/overview/assets` | GET |
| `/investment/overview/activity` | GET |
| `/investment/overview/crypto-prices` | GET |
| `/investment/overview/trader-profile` | GET |
| `/investment/goals` | GET, POST |
| `/investment/goals/{id}` | GET, PUT, DELETE |
| `/investment/goals/{id}/progress` | GET |
| `/investment/goals/{id}/completion` | POST |
| `/investment/strategies` | GET, POST |
| `/investment/strategies/{id}` | GET, PUT, DELETE |
| `/investment/strategies/{id}/save` | POST |
| `/investment/strategies/{id}/comments` | GET, POST |
| `/investment/strategies/{id}/boost` | POST |
| `/investment/strategies/{id}/apply` | POST |
| `/investment/strategies/{id}/share` | POST |
| `/investment/performance` | GET |
| `/investment/analytics` | GET |
| `/investment/recommendations` | GET |
| `/investment/goals/{id}/adjust` | PUT |
| `/investment/strategies/{id}/backtest` | POST |
| `/investment/strategies/{id}/performance` | GET |
| `/investment/strategies/{id}/clone` | POST |
| `/investment/watchlist` | GET, POST |
| `/investment/watchlist/{id}` | DELETE |

**Files using investmentApi:** `src/app/dashboard/investment/overview/page.js`, `src/app/dashboard/investment/goals-tracker/page.js`, `src/app/dashboard/investment/crypto-marketplace/page.js`, `src/app/dashboard/investment/strategies/page.js`, `src/app/dashboard/investment/strategies/[id]/page.js`.

---

### Marketplace (`src/utils/marketplaceApi.js`)

| Endpoint path | Method |
|---------------|--------|
| `/marketplace/listings` | GET, POST |
| `/marketplace/listings/{id}` | GET, PUT, DELETE |
| `/marketplace/listings/{id}/approve` | POST |
| `/marketplace/listings/{id}/activate` | POST |
| `/marketplace/listings/{id}/pay-fee` | POST |
| `/marketplace/listings/{id}/offers` | GET |
| `/marketplace/search` | GET |
| `/marketplace/listings/{listingId}/offers` | POST |
| `/marketplace/offers/{id}` | GET |
| `/marketplace/offers/{id}/accept` | POST |
| `/marketplace/offers/{id}/reject` | POST |
| `/marketplace/offers/{id}/counter` | POST |
| `/marketplace/offers/{id}/withdraw` | POST |
| `/marketplace/offers/my` | GET |
| `/marketplace/escrow/{id}` | GET |
| `/marketplace/escrow/{id}/fund` | POST |
| `/marketplace/escrow/{id}/release` | POST |
| `/marketplace/escrow/{id}/dispute` | POST |
| `/marketplace/escrow/{id}/refund` | POST |
| `/marketplace/market-highlights` | GET |
| `/marketplace/market-trends` | GET |
| `/marketplace/market-summary` | GET |
| `/marketplace/watchlist` | GET, POST |
| `/marketplace/watchlist/check/{listingId}` | GET |
| `/marketplace/watchlist/{watchlistItemId}` | DELETE, PUT |

**Files using marketplaceApi:** `src/app/dashboard/marketplace/page.js`, `src/app/dashboard/marketplace/[id]/page.js`, `src/app/dashboard/marketplace/[id]/InvestmentDetailClient.js`, `src/app/marketplace/page.js`.

---

### Assets (`src/utils/assetsApi.js`)

| Endpoint path | Method |
|---------------|--------|
| `/assets` | GET, POST |
| `/assets/{id}` | GET, PUT, DELETE |
| `/assets/categories` | GET |
| `/assets/category-groups` | GET |
| `/assets/{id}/photos` | POST |
| `/assets/{id}/photos/{photoId}` | DELETE |
| `/assets/{id}/documents` | POST, GET |
| `/assets/{id}/documents/{documentId}` | DELETE |
| `/assets/{id}/value-history` | GET |
| `/assets/{id}/appraisals` | POST, GET |
| `/assets/{id}/appraisals/{appraisalId}` | GET |
| `/assets/{id}/valuation` | PATCH |
| `/assets/{id}/valuations` | GET *(hardcoded in assetsApi; not in config)* |
| `/assets/{id}/sale-requests` | POST, GET |
| `/assets/{id}/sale-requests/{requestId}` | GET, DELETE |
| `/assets/{id}/transfer` | POST |
| `/assets/{id}/share` | POST |
| `/assets/{id}/reports` | POST |
| `/assets/{id}/reports/{reportId}` | GET |
| `/assets/summary` | GET |
| `/assets/value-trends` | GET |
| `/files/upload` | POST (multipart) |

**Files using assetsApi:** `src/app/dashboard/assets/page.js`, `src/app/dashboard/assets/[id]/AssetDetailClient.js`, `src/app/dashboard/assets/add/page.js`.

---

### Analytics (`src/utils/analyticsApi.js`)

| Endpoint path | Method |
|---------------|--------|
| `/analytics/portfolio` | GET |
| `/analytics/performance` | GET |
| `/analytics/risk` | GET |

**Files using analyticsApi:** `src/app/dashboard/analytics/page.js`.

---

### Reports (`src/utils/reportsApi.js`)

| Endpoint path | Method |
|---------------|--------|
| `/reports/generate` | POST |
| `/reports` | GET |
| `/reports/{id}` | GET |
| `/reports/{id}/download` | GET |
| `/reports/statistics` | GET |

**Files using reportsApi:** `src/app/dashboard/reports/crm/page.js`, `src/components/reports/TasksView.jsx`.

---

### Documents (`src/utils/documentsApi.js`)

| Endpoint path | Method |
|---------------|--------|
| `/files/upload` | POST (multipart) |
| `/documents` | GET |
| `/documents/{id}` | GET |
| `/documents/{id}/download` | GET |
| `/documents/{id}` | DELETE |
| `/documents/{id}/share` | POST |
| `/documents/statistics` | GET |
| `/documents/{id}/preview` | GET |

**Files using documentsApi:** `src/app/dashboard/documents/page.js`.

---

### Support Tickets (`src/utils/supportTicketsApi.js`)

| Endpoint path | Method |
|---------------|--------|
| `/support/tickets` | POST, GET |
| `/support/tickets/{id}` | GET, PUT |
| `/support/tickets/{id}/assign` | POST |
| `/support/tickets/{id}/documents` | GET, POST |
| `/support/tickets/{id}/comments` | GET, POST |
| `/support/tickets/{id}/history` | GET |
| `/support/statistics` | GET |

**Files using supportTicketsApi:** `src/app/dashboard/support-dashboard/page.js`, `src/app/dashboard/support/page.js`, `src/app/dashboard/reports/crm/page.js`, `src/components/dashboard/NewTicketModal.jsx`.

---

### Concierge (`src/utils/conciergeApi.js`)

| Endpoint path | Method |
|---------------|--------|
| `/concierge/appraisals` | GET |
| `/concierge/appraisals/{id}` | GET |
| `/concierge/appraisals/{id}/status` | PUT |
| `/concierge/appraisals/{id}/assign` | POST |
| `/concierge/appraisals/{id}/documents` | GET, POST |
| `/concierge/appraisals/{id}/comments` | GET, POST |
| `/concierge/appraisals/{id}/valuation` | PUT |
| `/concierge/appraisals/{id}/report` | GET |
| `/concierge/statistics` | GET |

**Files using conciergeApi:** `src/app/dashboard/concierge/page.js`.

---

### CRM (`src/utils/crmApi.js`)

| Endpoint path | Method |
|---------------|--------|
| `/crm/users` | GET |
| `/crm/dashboard/overview` | GET |
| `/crm/updates` | GET |

**Files using crmApi:** `src/app/dashboard/reports/crm/page.js`, `src/components/dashboard/AssignmentModal.jsx`, `src/components/reports/TasksView.jsx`.

---

### Entity (`src/utils/entityApi.js`)

| Endpoint path | Method |
|---------------|--------|
| `/entities` | GET, POST |
| `/entities/{id}` | GET, PUT, DELETE |
| `/entities/types` | GET |
| `/entities/types/{typeId}` | GET |
| `/entities/{id}/hierarchy` | GET |
| `/entities/{id}/children` | POST |
| `/entities/{id}/parent` | PUT |
| `/entities/{id}/compliance` | GET, PUT |
| `/entities/{id}/compliance-package` | GET |
| `/entities/{id}/people` | GET, POST |
| `/entities/{id}/people/{personId}` | PUT, DELETE |
| `/entities/{id}/audit-trail` | GET, POST |
| `/entities/{id}/audit-trail/{entryId}` | PUT, DELETE |
| `/entities/{id}/documents` | GET |
| `/entities/{id}/documents` | POST (upload) |
| `/entities/{id}/documents/{documentId}` | GET, DELETE |
| `/entities/{id}/documents/{documentId}/download` | GET |
| `/entities/{id}/documents/{documentId}/status` | PUT |

**Files using entityApi:** `src/app/dashboard/entity-structure/page.js`.

---

### Compliance (`src/utils/complianceApi.js`)

| Endpoint path | Method |
|---------------|--------|
| `/compliance/dashboard` | GET |
| `/compliance/tasks` | GET, POST |
| `/compliance/tasks/{id}` | GET, PUT, DELETE |
| `/compliance/tasks/{id}/reassign` | POST |
| `/compliance/tasks/{id}/complete` | POST |
| `/compliance/audits` | GET, POST |
| `/compliance/audits/{id}` | GET, PUT |
| `/compliance/alerts` | GET |
| `/compliance/alerts/{id}` | GET |
| `/compliance/alerts/{id}/acknowledge` | POST |
| `/compliance/alerts/{id}/resolve` | POST |
| `/compliance/score/history` | GET |
| `/compliance/metrics` | GET |
| `/compliance/reports/generate` | POST |
| `/compliance/reports/{id}` | GET |
| `/compliance/reports/{id}/download` | GET |
| `/compliance/policies` | GET, POST |
| `/compliance/policies/{id}` | GET |

**Files using complianceApi:** `src/app/dashboard/compliance/page.js`.

---

### Notifications (`src/utils/notificationsApi.js`)

| Endpoint path | Method |
|---------------|--------|
| `/notifications` | GET |
| `/notifications/unread` | GET |
| `/notifications/unread-count` | GET |
| `/notifications/{id}/read` | PUT |
| `/notifications/read-all` | PUT |
| `/notifications/{id}` | DELETE |
| `/notifications/settings` | GET, PUT |

**Files using notificationsApi:** `src/app/dashboard/notifications/page.js` (and header/badge where unread count is used).

---

### Referrals (`src/utils/referralsApi.js`)

| Endpoint path | Method |
|---------------|--------|
| `/referrals` | GET (stats) |
| `/referrals/list` | GET |
| `/referrals/code` | GET |
| `/referrals/generate-code` | POST |
| `/referrals/rewards` | GET |
| `/referrals/leaderboard` | GET |

**Files using referralsApi:** `src/app/dashboard/referral/page.js`.

---

### Chat (`src/utils/chatApi.js`)

| Endpoint path | Method |
|---------------|--------|
| `/chat/conversations` | GET, POST |
| `/chat/conversations/{id}/messages` | GET, POST |
| `/chat/conversations/{id}/read` | PUT |
| `/chat/messages/{id}` | DELETE |
| `/chat/conversations/{id}/participants` | GET |
| `/chat/conversations/{id}` | PUT |

**Files using chatApi:** `src/app/dashboard/support-dashboard/page.js`.

---

### Market (`src/utils/marketApi.js`)

| Endpoint path | Method |
|---------------|--------|
| `/market/benchmarks` | GET |

**Files using marketApi:** `src/app/dashboard/page.js`.

---

### Tasks (`src/utils/tasksApi.js`)

| Endpoint path | Method |
|---------------|--------|
| `/tasks` | GET, POST |
| `/tasks/{id}` | GET, PUT, DELETE |
| `/tasks/{id}/complete` | PUT |
| `/tasks/{id}/remind` | PUT |

**Files using tasksApi:** `src/app/settings/page.js`.

---

### Reminders (`src/utils/remindersApi.js`)

| Endpoint path | Method |
|---------------|--------|
| `/reminders` | GET, POST |
| `/reminders/{id}` | GET, PUT, DELETE |
| `/reminders/{id}/snooze` | PUT |

**Files using remindersApi:** `src/app/settings/page.js`.

---

## 2. Summary: Files Where API Utils Are Used

| Util / area | App / component files |
|-------------|------------------------|
| authApi | login, signup, forgot-password, reset-password, verify-email, dashboard/page, dashboard/settings, ProfileDropdown, Sidebar, SecureRoute |
| kycApi | kyc-verification, kyc/verification-complete, document-verification, identity-verification, dashboard/kyc |
| accountsApi | dashboard/page |
| bankingApi | dashboard/page, dashboard/transactions, dashboard/settings |
| portfolioApi | dashboard/page, portfolio/Overview, portfolio/cash-flow, portfolio/trade-engine, portfolio/crypto, dashboard/transactions, investment/goals-tracker |
| tradingApi | dashboard/transactions |
| paymentsApi | dashboard/transactions, dashboard/settings |
| subscriptionsApi | dashboard/settings |
| investmentApi | investment/overview, investment/goals-tracker, investment/crypto-marketplace, investment/strategies, investment/strategies/[id] |
| marketplaceApi | dashboard/marketplace, dashboard/marketplace/[id], InvestmentDetailClient, marketplace (public) |
| assetsApi | dashboard/assets, dashboard/assets/[id], dashboard/assets/add |
| analyticsApi | dashboard/analytics |
| reportsApi | dashboard/reports/crm, TasksView |
| documentsApi | dashboard/documents |
| supportTicketsApi | dashboard/support-dashboard, dashboard/support, dashboard/reports/crm, NewTicketModal |
| conciergeApi | dashboard/concierge |
| crmApi | dashboard/reports/crm, AssignmentModal, TasksView |
| entityApi | dashboard/entity-structure |
| complianceApi | dashboard/compliance |
| notificationsApi | dashboard/notifications (and header) |
| referralsApi | dashboard/referral |
| chatApi | dashboard/support-dashboard |
| marketApi | dashboard/page |
| tasksApi | settings |
| remindersApi | settings |

---

## 3. Whether the API URL Matches `/api/v1` Endpoints

**Yes.** All requests use the shared client in `src/lib/api/client.js`, which:

- Uses `API_BASE_PATH = '/api/v1'` from `src/config/api.js`.
- Builds the URL as: `baseUrl + basePath + endpoint` (e.g. `http://localhost:8000/api/v1/auth/login`).

So every call targets an `/api/v1/...` path. The only exception is a **hardcoded path** in `assetsApi.js`: `/assets/{id}/valuations` (plural). The config has `UPDATE_VALUATION`: `/assets/{id}/valuation` (singular). So one read-style endpoint in assets is hardcoded and not in config; it still goes through the same client and gets the same `/api/v1` prefix.

---

## 4. Whether Some Pages Are Still Using Mock Data

- **No page uses mock/fake list data for main content.** List data is from APIs or empty state.
- **Concierge:** On error, the page sets empty state (no fallback to mock).
- **Support dashboard:** Uses tickets + chat from APIs; comment says “Only use API data - no mock data”.
- **Public marketplace** (`src/app/marketplace/page.js`): Defines a large **hardcoded array** `allInvestmentFunds` (around lines 25–200+). It is **not used** in the render path; filtering and display use `listings` from the API. So this is **dead code / leftover mock data**, not active mock data.
- **Document verification:** Uses “Identity Card Mockup” as an image label/placeholder only, not as API mock data.

**Conclusion:** No active mock list data. One file has unused hardcoded data: `src/app/marketplace/page.js` (`allInvestmentFunds`). Safe to remove for cleanup.

---

## 5. Backend Endpoints in Config That Are NOT Used by the Frontend

These entries exist in `src/config/api.js` but are **never referenced** by any `src/utils/*Api.js` (and thus never called by the frontend):

### Base / redundant

- **AUTH.BASE** – `/auth`
- **KYC.BASE** – `/kyc`
- **KYB.BASE** – `/kyb`
- **USERS** – all used (no unused user endpoints)
- **ASSETS.BASE** – `/assets`
- **INVESTMENT.BASE** – `/investment`
- **PORTFOLIO.*** – Entire PORTFOLIO block is unused in code; `portfolioApi.js` uses hardcoded `/portfolio/...` strings. Paths match config; only the config reference is unused.
- **TRADING.BASE** – `/trading`
- **TRADE_ENGINE** – Whole block; trade-engine calls are hardcoded in `portfolioApi.js` as `/portfolio/trade-engine/...`.
- **MARKETPLACE.BASE** – `/marketplace`
- **ACCOUNTS.BASE** – `/accounts`
- **BANKING.BASE** – `/banking`
- **SUBSCRIPTIONS.BASE** – `/subscriptions`
- **PAYMENTS.BASE** – `/payments`
- **ANALYTICS.BASE** – `/analytics`
- **REPORTS.BASE** – `/reports`
- **DOCUMENTS.BASE** – `/documents`
- **SUPPORT.BASE** – `/support`
- **SUPPORT.TICKETS** – `/support/tickets` (same path as LIST_TICKETS/CREATE_TICKET; redundant key)
- **CONCIERGE.BASE** – `/concierge`
- **CONCIERGE.APPRAISALS** – `/concierge/appraisals` (same as LIST_APPRAISALS; redundant)
- **CRM.BASE** – `/crm`
- **ENTITIES.BASE** – `/entities`
- **COMPLIANCE.BASE** – `/compliance`
- **NOTIFICATIONS.BASE** – `/notifications`
- **REFERRALS** – all used (BASE is used for stats)
- **CHAT.BASE** – `/chat`
- **CHAT.GET_CONVERSATION(id)** – `/chat/conversations/{id}`; frontend never fetches a single conversation by id (uses list + messages).
- **MARKET.BASE** – `/market`
- **TASKS.BASE** – `/tasks`
- **REMINDERS.BASE** – `/reminders`

### Note on PAYMENTS.WEBHOOK

- **PAYMENTS.WEBHOOK** – `/payments/webhook` is referenced in `paymentsApi.js` (e.g. for a stub or server-side use). Webhooks are normally called by the backend/payment provider, not the browser. So from a “frontend user action” perspective it is unused; from “defined and referenced in frontend code” it is used.

---

**End of audit.**
