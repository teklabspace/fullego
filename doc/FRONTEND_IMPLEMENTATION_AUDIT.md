# Frontend Implementation Audit — Full Report

**Generated:** March 2026  
**Scope:** Entire frontend codebase (all folders, pages, components, services, hooks, API utilities).  
**Goal:** Determine how much of the platform is functional vs UI-only and production readiness.

---

## PART 1 — FEATURE IMPLEMENTATION STATUS

| Feature | Pages/components implementing it | API endpoints used | Status | Missing pieces |
|--------|----------------------------------|---------------------|--------|----------------|
| **Auth** | `login/page.js`, `signup/page.js`, `forgot-password/page.js`, `reset-password/page.js`, `verify-email/page.js`, `SecureRoute.jsx`, `ProfileDropdown.jsx`, `Sidebar.jsx` | `/auth/register`, `/auth/login`, `/auth/refresh`, `/auth/request-otp`, `/auth/verify-otp`, `/auth/request-password-reset`, `/auth/reset-password`, `/auth/verify-email`, `/auth/resend-verification`, `/users/me` (GET/PUT), `/users/notifications`, `/users/privacy`, `/users/two-factor-auth/*`, `/users/change-password`, `/users/deactivate`, `/users/delete` | **Functional** (backend-dependent) | Automatic token refresh on 401 not implemented; middleware does not enforce auth server-side |
| **Dashboard** | `dashboard/page.js`, `DashboardLayout.jsx` | `/users/me`, `/portfolio/summary`, `/portfolio/performance`, `/portfolio/history`, `/accounts/me`, `/accounts/stats`, `/banking/accounts`, `/market/benchmarks` | **Functional** | Graceful empty/error states when APIs fail; no dummy values |
| **Assets** | `dashboard/assets/page.js`, `dashboard/assets/add/page.js`, `dashboard/assets/detail/page.js`, `dashboard/assets/[id]/AssetDetailClient.js` | `/assets` (GET/POST), `/assets/{id}` (GET/PUT/DELETE), `/assets/categories`, `/assets/category-groups`, `/assets/{id}/photos`, `/assets/{id}/documents`, `/assets/{id}/value-history`, `/assets/{id}/appraisals`, `/assets/{id}/sale-requests`, `/assets/{id}/transfer`, `/assets/{id}/share`, `/assets/summary`, `/files/upload` | **Functional** | Detail page uses `?id=` (assets/detail) and dynamic route (assets/[id]); both use AssetDetailClient |
| **Portfolio** | `dashboard/portfolio/Overview/page.js`, `dashboard/portfolio/crypto/page.js`, `dashboard/portfolio/cash-flow/page.js`, `dashboard/portfolio/trade-engine/page.js` | `/portfolio/*`, `/portfolio/crypto/*`, `/portfolio/cash-flow/*`, `/portfolio/trade-engine/*` (summary, performance, allocation, holdings, activity, history, risk, benchmark, accounts, search, orders) | **Functional** | Backend must implement trade-engine and cash-flow endpoints |
| **Investment** | `dashboard/investment/overview/page.js`, `dashboard/investment/goals-tracker/page.js`, `dashboard/investment/crypto-marketplace/page.js`, `dashboard/investment/strategies/page.js`, `dashboard/investment/strategies/[id]/page.js` | `/investment/overview*`, `/investment/goals*`, `/investment/strategies*`, `/investment/watchlist`, `/portfolio/trade-engine/search` (goals-tracker) | **Functional** | Strategy detail uses API; chart fallback `[{ value: 0 }]` for empty history |
| **Trading** | `dashboard/transactions/page.js` | `/trading/account`, `/trading/assets`, `/trading/transactions` | **Functional** | Combined with banking/payments on transactions page |
| **Marketplace** | `dashboard/marketplace/page.js`, `dashboard/marketplace/[id]/page.js`, `InvestmentDetailClient.js`, `marketplace/page.js` (public) | `/marketplace/listings`, `/marketplace/listings/{id}`, `/marketplace/search`, `/marketplace/offers`, `/marketplace/offers/my`, `/marketplace/market-highlights`, `/marketplace/market-trends`, `/marketplace/watchlist` | **Functional** | Public marketplace uses API; no fallback to dummy data. Unused `allInvestmentFunds` array in `marketplace/page.js` (dead code) |
| **Banking** | `dashboard/page.js`, `dashboard/transactions/page.js`, `dashboard/settings/page.js` | `/banking/link-token`, `/banking/link`, `/banking/accounts`, `/banking/accounts/{id}`, `/banking/accounts/{id}/transactions`, `/banking/accounts/{id}/balance`, `/banking/accounts/{id}/refresh`, `/banking/sync/{id}` | **Functional** | Plaid link flow depends on backend |
| **Payments** | `dashboard/transactions/page.js`, `dashboard/settings/page.js` | `/payments/create-intent`, `/payments/history`, `/payments/stats`, `/payments/payment-methods`, `/payments/invoices` | **Functional** | Webhook is backend-only |
| **Subscriptions** | `dashboard/settings/page.js` | `/subscriptions/plans`, `/subscriptions`, `/subscriptions/cancel`, `/subscriptions/renew`, `/subscriptions/upgrade`, `/subscriptions/history`, `/subscriptions/permissions`, `/subscriptions/limits` | **Functional** | — |
| **Documents** | `dashboard/documents/page.js`, `ShareDocumentModal.jsx`, `DocumentUploadModal.jsx` | `/documents`, `/documents/{id}`, `/documents/{id}/download`, `/documents/{id}/share`, `/documents/statistics`, `/documents/{id}/preview`, `/files/upload` | **Functional** | — |
| **Support** | `dashboard/support/page.js`, `dashboard/support-dashboard/page.js`, `NewTicketModal.jsx`, `dashboard/reports/crm/page.js` | `/support/tickets` (CRUD), `/support/tickets/{id}/assign`, `/support/tickets/{id}/documents`, `/support/tickets/{id}/comments`, `/support/tickets/{id}/history`, `/support/statistics` | **Functional** | Support dashboard uses tickets + chat APIs; no mock data |
| **Chat** | `dashboard/support-dashboard/page.js` | `/chat/conversations`, `/chat/conversations/{id}/messages`, `/chat/conversations/{id}/read`, `/chat/conversations/{id}` | **Functional** | Used only in support-dashboard context |
| **Notifications** | `dashboard/notifications/page.js` | `/notifications`, `/notifications/unread`, `/notifications/unread-count`, `/notifications/{id}/read`, `/notifications/read-all`, `/notifications/settings` | **Functional** | **NotificationDropdown** in header uses empty `useState([])` — UI only; no API call for bell dropdown |
| **Admin** | — | No dedicated admin routes in frontend | **Not Implemented** | No admin UI or admin-specific endpoints called |
| **CRM** | `dashboard/reports/crm/page.js`, `TasksView.jsx`, `AssignmentModal.jsx` | `/crm/users`, `/crm/dashboard/overview`, `/crm/updates` | **Functional** | Assignment modal uses CRM users for assignee list |
| **Compliance** | `dashboard/compliance/page.js` | `/compliance/dashboard`, `/compliance/tasks`, `/compliance/audits`, `/compliance/alerts`, `/compliance/score/history`, `/compliance/metrics`, `/compliance/reports/*`, `/compliance/policies` | **Functional** | — |
| **Reports** | `dashboard/reports/page.js`, `dashboard/reports/crm/page.js`, `TasksView.jsx`, `ScheduleView.jsx` | `/reports/generate`, `/reports`, `/reports/{id}`, `/reports/{id}/download`, `/reports/statistics` | **Functional** | Reports page has Tasks + Schedule tabs; TasksView uses reportsApi + crmApi; ScheduleView not audited for API |
| **Analytics** | `dashboard/analytics/page.js` | `/analytics/portfolio`, `/analytics/performance`, `/analytics/risk` | **Functional** | — |

**Summary:** All listed features except **Admin** have pages and are wired to real backend APIs. No feature relies on mock list data for primary content. **NotificationDropdown** is the only notable UI-only piece (empty state, no notifications API).

---

## PART 2 — BACKEND API USAGE

### How the frontend calls the backend

- **Base:** `src/lib/api/client.js` — `apiRequest`, `apiGet`, `apiPost`, `apiPut`, `apiPatch`, `apiDelete`.
- **URL:** `API_BASE_URL + API_BASE_PATH + endpoint` → e.g. `http://localhost:8000/api/v1/...`.
- **Config:** `src/config/api.js` defines `API_ENDPOINTS`; most utils use these; `portfolioApi.js` and trade-engine use hardcoded paths that match config.
- **Auth:** `getDefaultHeaders()` adds `Authorization: Bearer <access_token>` from `localStorage`.

### Total backend API endpoints used by the frontend

**Approximate count:** 180+ distinct endpoint paths (including parameterized ones like `/assets/{id}`). All under `/api/v1/...`.

### Endpoints grouped by module

| Module | Endpoints (representative) |
|--------|----------------------------|
| **auth** | `/auth/register`, `/auth/login`, `/auth/refresh`, `/auth/request-otp`, `/auth/verify-otp`, `/auth/request-password-reset`, `/auth/reset-password`, `/auth/verify-email`, `/auth/resend-verification` |
| **users** | `/users/me`, `/users/notifications`, `/users/privacy`, `/users/two-factor-auth/*`, `/users/change-password`, `/users/deactivate`, `/users/delete` |
| **accounts** | `/accounts`, `/accounts/me`, `/accounts/verify`, `/accounts/stats`, `/accounts/settings`, `/accounts/joint-users*` |
| **assets** | `/assets`, `/assets/{id}`, `/assets/categories`, `/assets/category-groups`, `/assets/{id}/photos`, `/assets/{id}/documents`, `/assets/{id}/value-history`, `/assets/{id}/appraisals`, `/assets/{id}/sale-requests`, `/assets/{id}/transfer`, `/assets/{id}/share`, `/assets/summary`, `/files/upload` |
| **portfolio** | `/portfolio`, `/portfolio/summary`, `/portfolio/performance`, `/portfolio/allocation`, `/portfolio/holdings/top`, `/portfolio/activity/recent`, `/portfolio/market-summary`, `/portfolio/alerts`, `/portfolio/history`, `/portfolio/risk`, `/portfolio/benchmark`, `/portfolio/crypto/*`, `/portfolio/cash-flow/*`, `/portfolio/trade-engine/*` |
| **investment** | `/investment/overview*`, `/investment/goals*`, `/investment/strategies*`, `/investment/watchlist`, `/investment/performance`, `/investment/analytics`, `/investment/recommendations` (in utils; usage may be partial) |
| **trading** | `/trading/account`, `/trading/assets`, `/trading/transactions` |
| **marketplace** | `/marketplace/listings*`, `/marketplace/search`, `/marketplace/offers*`, `/marketplace/escrow/*`, `/marketplace/market-highlights`, `/marketplace/market-trends`, `/marketplace/market-summary`, `/marketplace/watchlist*` |
| **banking** | `/banking/link-token`, `/banking/link`, `/banking/accounts`, `/banking/accounts/{id}`, `/banking/accounts/{id}/transactions`, `/banking/accounts/{id}/balance`, `/banking/accounts/{id}/refresh`, `/banking/sync/{id}` |
| **payments** | `/payments/create-intent`, `/payments/history`, `/payments/stats`, `/payments/payment-methods*`, `/payments/invoices*`, `/payments/payments/{id}/refund` |
| **subscriptions** | `/subscriptions/plans`, `/subscriptions`, `/subscriptions/cancel`, `/subscriptions/renew`, `/subscriptions/upgrade`, `/subscriptions/history`, `/subscriptions/permissions`, `/subscriptions/limits` |
| **documents** | `/documents`, `/documents/{id}`, `/documents/{id}/download`, `/documents/{id}/share`, `/documents/statistics`, `/documents/{id}/preview` |
| **support** | `/support/tickets*`, `/support/tickets/{id}/assign`, `/support/tickets/{id}/documents`, `/support/tickets/{id}/comments`, `/support/tickets/{id}/history`, `/support/statistics` |
| **chat** | `/chat/conversations`, `/chat/conversations/{id}/messages`, `/chat/conversations/{id}/read`, `/chat/conversations/{id}` |
| **notifications** | `/notifications`, `/notifications/unread`, `/notifications/unread-count`, `/notifications/{id}/read`, `/notifications/read-all`, `/notifications/settings` |
| **admin** | None (no admin-only endpoints called) |
| **crm** | `/crm/users`, `/crm/dashboard/overview`, `/crm/updates` |
| **compliance** | `/compliance/dashboard`, `/compliance/tasks*`, `/compliance/audits*`, `/compliance/alerts*`, `/compliance/score/history`, `/compliance/metrics`, `/compliance/reports/*`, `/compliance/policies*` |
| **reports** | `/reports/generate`, `/reports`, `/reports/{id}`, `/reports/{id}/download`, `/reports/statistics` |
| **analytics** | `/analytics/portfolio`, `/analytics/performance`, `/analytics/risk` |

Additional modules used: **KYC/KYB** (`/kyc/*`, `/kyb/*`), **market** (`/market/benchmarks`), **tasks** (`/tasks*`), **reminders** (`/reminders*`), **referrals** (`/referrals/*`), **concierge** (`/concierge/appraisals*`), **entities** (`/entities*`).

### Backend endpoints in config but NOT used by the frontend

- **CHAT.GET_CONVERSATION(id)** — single conversation by ID; frontend uses list + messages only.
- Various **BASE** keys (e.g. `AUTH.BASE`, `KYC.BASE`) — redundant; actual calls use specific endpoints.
- **PORTFOLIO** / **TRADE_ENGINE** — config keys not referenced; `portfolioApi.js` uses hardcoded paths that match the same URLs.

(Full list of unused config keys is in `doc/API_CALLS_AUDIT.md`.)

---

## PART 3 — ROUTING & PAGE STRUCTURE

### Total frontend routes (App Router)

- **~60** `page.js`/`page.jsx` files under `src/app/`.

### Key routes

| Route | Exists | In sidebar/nav | Notes |
|-------|--------|----------------|-------|
| `/` | Yes | — | Landing |
| `/login` | Yes | — | Auth |
| `/signup` | Yes | — | Auth |
| `/forgot-password`, `/reset-password` | Yes | — | Auth |
| `/verify-email` | Yes | — | Auth |
| `/kyc-verification`, `/kyc/verification-complete` | Yes | — | KYC |
| `/document-verification`, `/identity-verification` | Yes | — | KYC |
| `/dashboard` | Yes | Yes | Main dashboard |
| `/dashboard/assets` | Yes | Yes | Assets list |
| `/dashboard/assets/add` | Yes | Yes (via add flow) | Add asset |
| `/dashboard/assets/detail` | Yes | — | Query `?id=`; uses AssetDetailClient |
| `/dashboard/portfolio/Overview` | Yes | Yes | Portfolio overview |
| `/dashboard/portfolio/crypto` | Yes | Yes | Crypto portfolio |
| `/dashboard/portfolio/cash-flow` | Yes | Yes | Cash flow |
| `/dashboard/portfolio/trade-engine` | Yes | Yes | Trade engine |
| `/dashboard/investment/overview` | Yes | Yes | Investment overview |
| `/dashboard/investment/goals-tracker` | Yes | Yes | Goals |
| `/dashboard/investment/strategies` | Yes | Yes | Strategies list |
| `/dashboard/investment/strategies/[id]` | Yes | — | Strategy detail |
| `/dashboard/investment/crypto-marketplace` | Yes | — | Crypto marketplace (under investment) |
| `/dashboard/marketplace` | Yes | Yes | Marketplace list |
| `/dashboard/marketplace/[id]` | Yes | — | Listing detail |
| `/dashboard/marketplace/active-offers` | Yes | Yes (sidebar) | Active offers |
| `/dashboard/transactions` | Yes | Yes (via nav) | Transactions |
| `/dashboard/notifications` | Yes | Yes | Notifications |
| `/dashboard/referral` | Yes | Yes | Referral |
| `/dashboard/analytics` | Yes | Yes | Analytics |
| `/dashboard/reports` | Yes | — | Reports (Tasks + Schedule) |
| `/dashboard/reports/crm` | Yes | Yes | CRM dashboard |
| `/dashboard/documents` | Yes | Yes (submenu) | Documents |
| `/dashboard/support` | Yes | Yes (submenu) | Support |
| `/dashboard/support-dashboard` | Yes | — | Support dashboard (tickets + chat) |
| `/dashboard/concierge` | Yes | Yes (submenu) | Concierge |
| `/dashboard/entity-structure` | Yes | Yes | Entity structure |
| `/dashboard/compliance` | Yes | Yes | Compliance |
| `/dashboard/settings` | Yes | Yes | Settings |
| `/dashboard/kyc` | Yes | — | KYC status (dashboard) |
| `/marketplace` | Yes | — | Public marketplace |
| `/settings` | Yes | — | Standalone settings (tasks/reminders) |
| `/plans`, `/about`, `/terms`, `/privacy`, `/cookies`, `/security`, `/careers`, `/press`, `/help-center`, `/contact`, `/welcome`, `/akunuba`, `/verification-success`, `/choose-profile` | Yes | — | Marketing/legal/onboarding |

### Broken / missing routes

- **No 404 page** found under `src/app/` (Next.js will use default 404).
- **Sidebar “Help Center”** points to `/dashboard/support` (implemented).
- **`/dashboard/reports`** exists but sidebar emphasizes **CRM Dashboard** (`/dashboard/reports/crm`); general Reports page is not in sidebar.
- **Asset detail:** two entry points — `/dashboard/assets/detail?id=` and `/dashboard/assets/[id]`; `[id]` is dynamic. Both work; detail uses query param for static export compatibility.

### Pages implemented but not in sidebar

- `/dashboard/support-dashboard` (tickets + chat).
- `/dashboard/investment/crypto-marketplace`.
- `/dashboard/reports` (generic Reports with Tasks/Schedule).
- Public `/marketplace`, `/settings`, and all marketing/legal routes.

---

## PART 4 — MOCK DATA DETECTION

| Location | Finding |
|----------|--------|
| **NotificationDropdown.jsx** | `const [notifications] = useState([])` — always empty; no API call. UI only. |
| **marketplace/page.js** | Large `allInvestmentFunds` array (lines ~25–200+). **Not used** in render; filtering/display use `listings` from API. Dead code. |
| **dashboard/page.js** | Comments: “don’t show dummy values”; uses API or empty/error state. No mock lists. |
| **dashboard/support-dashboard/page.js** | Comment: “Only use API data - no mock data”. |
| **dashboard/concierge/page.js** | On error, sets empty state; no fallback to mock. |
| **dashboard/marketplace/page.js** | Comment: “Only use API listings - no fallback to dummy data”. |
| **reports/TasksView.jsx**, **reports/crm/page.js** | “Chart data from API - no fallback dummy data”. |
| **investment/overview/page.js** | Chart fallback: `asset.chartData || asset.historyData || [{ value: 0 }]` — minimal placeholder for chart only. |

**Conclusion:** No primary list/table content is driven by mock data. One unused mock array (`allInvestmentFunds`) and one UI-only component (NotificationDropdown with empty array). One minimal chart fallback for empty history.

---

## PART 5 — ERROR HANDLING

| Aspect | Finding |
|--------|--------|
| **API client** | `apiRequest` in `client.js` uses try/catch; parses JSON; extracts `detail`/message from error response; throws Error with `error.status`, `error.data`; logs 4xx/5xx (suppresses noisy log for 401/403/404 in some cases). |
| **Pages** | Widespread use of try/catch, `loading`/`setLoading`, `errors`/`setErrors`; many pages use Promise.allSettled for parallel fetches and set per-endpoint errors. |
| **User-facing messages** | `toast.error()` / `toast.success()` (react-toastify) used on login, signup, settings, and others. |
| **Loading states** | Loading flags and spinners on dashboard, portfolio, assets, marketplace, compliance, etc. |
| **Skeletons** | `TradeEngineSkeleton`, `PortfolioOverviewSkeleton`, `CryptoPortfolioSkeleton`, `CashFlowSkeleton`, `AssetDetailSkeleton`, `AssetCardSkeleton` used where referenced. |
| **Fallback UI** | Empty states when data is empty or fetch fails; no generic error boundary audited. |

**Quality:** Good: centralised error extraction, try/catch and loading states common, toasts for user feedback, skeletons in key areas. Gaps: no global 401 handling/redirect or token refresh in client; no app-level error boundary confirmed.

---

## PART 6 — AUTHENTICATION FLOW

| Item | Status |
|------|--------|
| **Login** | Implemented; calls `/auth/login`; stores `access_token`, `refresh_token`, `user_info` in localStorage. |
| **Token storage** | localStorage only (no httpOnly cookies). |
| **Token refresh** | `refreshToken()` exists in authApi; **not** called automatically on 401 by `client.js`. Expired access token leads to failed requests and redirect by SecureRoute when user navigates. |
| **Protected routes** | All `/dashboard/*` content wrapped in `DashboardLayout` → `SecureRoute`; SecureRoute checks `isAuthenticated()` (presence of access_token) and redirects to `/login` if missing. |
| **Middleware** | `middleware.js` does not block dashboard; allows all requests; protection is client-side only. |
| **Session persistence** | Persists across tabs via localStorage; logout via `clearTokens()` (Sidebar, ProfileDropdown). |

**Verdict:** Login, logout, and client-side route protection are implemented. **Not fully implemented:** automatic token refresh on 401 and server-side auth enforcement (middleware).

---

## PART 7 — STATE MANAGEMENT

| Mechanism | Usage |
|-----------|--------|
| **React Context** | `ThemeContext` (`src/context/ThemeContext.js`) for theme (dark/light). |
| **Redux / Zustand / Recoil** | Not used. |
| **React Query / SWR** | Not used. |
| **API data** | Fetched in components via utils; state held in local `useState` (and some useEffect). No global API cache. |

**Architecture:** Component-level state + ThemeContext. API data is not cached globally; each page fetches on mount (or on dependency change). Refetch-on-focus or cache invalidation not centralized.

---

## PART 8 — PERFORMANCE & OPTIMIZATION

| Check | Result |
|-------|--------|
| **Code splitting / lazy loading** | No `dynamic()` or `React.lazy()` usage found. No route-level lazy loading. |
| **API caching** | No React Query/SWR; no shared cache. Repeated navigations re-fetch. |
| **Memoization** | Not audited file-by-file; no app-wide memoization strategy. |
| **Pagination / infinite scroll** | Used where APIs support it (e.g. lists with limit/offset). |
| **Large components** | Some very large page files (e.g. dashboard/page.js, cash-flow, entity-structure); potential for splitting. |

**Verdict:** Performance readiness is moderate: no lazy loading of routes, no central API cache; pagination present where applicable. Skeleton loaders help perceived performance.

---

## PART 9 — FRONTEND PRODUCTION READINESS

| Criterion | Assessment |
|-----------|------------|
| Error handling | Good per-page and in client; no global 401 refresh. |
| API reliability | Fully dependent on backend availability and correctness. |
| Routing | Complete for existing features; no custom 404. |
| Integration with backend | All main features call real `/api/v1` endpoints. |
| Mock data | Not used for primary content; one dead mock array; NotificationDropdown empty. |
| Security | Tokens in localStorage (XSS exposure); no automatic refresh; middleware does not enforce auth. |

**Estimates:**

- **Frontend completion (feature implementation):** ~85–90%. Most features have UI and API wiring; gaps: admin UI, NotificationDropdown not wired, token refresh flow.
- **Frontend production readiness:** ~70–75%. Works with a compliant backend but needs: token refresh on 401, optional server-side auth, NotificationDropdown API, removal of dead mock data, and consideration of lazy loading and error boundaries.

---

## PART 10 — TOP 10 ISSUES TO FIX BEFORE PRODUCTION

1. **No automatic token refresh on 401** — Intercept 401 in `apiRequest`, call `refreshToken()`, retry once; on failure redirect to login and clear tokens.
2. **NotificationDropdown never loads notifications** — Replace empty `useState([])` with fetch (e.g. `getNotifications()` or `getUnreadCount()`) and wire to notifications API.
3. **Auth only client-side** — Middleware allows all routes. Add server-side check for dashboard (e.g. validate cookie or token) or at least secure critical paths.
4. **Tokens in localStorage** — Prefer httpOnly cookies for tokens to reduce XSS impact; requires backend and login flow changes.
5. **Dead mock data** — Remove unused `allInvestmentFunds` from `src/app/marketplace/page.js`.
6. **No global error boundary** — Add an error boundary at app/layout or dashboard level to catch render errors and show a fallback UI.
7. **No custom 404** — Add `src/app/not-found.js` (and optional global not-found handling) for better UX.
8. **No route-level code splitting** — Use Next.js `dynamic()` for heavy dashboard routes (e.g. compliance, entity-structure, cash-flow) to improve initial load.
9. **Reports page not in sidebar** — Either add “Reports” to sidebar or clarify navigation so users can find Tasks/Schedule.
10. **API base URL hardcoded** — `api.js` sets `API_BASE_URL = 'http://localhost:8000/'`; ensure production uses `NEXT_PUBLIC_API_BASE_URL` and document env for deployments.

---

## Summary Table (Quick Reference)

| Area | Status |
|------|--------|
| Auth | Functional; no auto refresh |
| Dashboard | Functional |
| Assets | Functional |
| Portfolio | Functional |
| Investment | Functional |
| Trading | Functional |
| Marketplace | Functional |
| Banking | Functional |
| Payments | Functional |
| Subscriptions | Functional |
| Documents | Functional |
| Support | Functional |
| Chat | Functional (support-dashboard) |
| Notifications | Page functional; dropdown UI-only |
| Admin | Not implemented |
| CRM | Functional |
| Compliance | Functional |
| Reports | Functional |
| Analytics | Functional |
| Routing | Complete; no custom 404 |
| Mock data | None for main content; 1 dead array |
| Error handling | Good; no global 401 handling |
| State | Component + ThemeContext only |
| Performance | No lazy loading; no API cache |

---

**End of report.**
