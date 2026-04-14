# Frontend Technical Documentation

**Project:** Akunuba (Fullego)  
**Framework:** Next.js 15 (App Router)  
**Last updated:** March 2025

This document describes how the frontend is structured, how it communicates with the backend, and how key flows and deployment work. It is intended for technical stakeholders and developers.

---

## 1. Systems Connecting to APIs

### Overview

The frontend talks to the backend over HTTP/HTTPS. All API calls go through a single **API client** (`src/lib/api/client.js`) that:

- Builds the full URL from `API_BASE_URL` + `API_BASE_PATH` + endpoint path
- Sends the **Bearer token** from `localStorage` (`access_token`) on every request
- Handles JSON and FormData, error parsing (including FastAPI-style `detail`), and logging

**Backend base URL** is set in `src/config/api.js`:  
`process.env.NEXT_PUBLIC_API_BASE_URL || 'https://akunuba-backend.onrender.com/'`  
API path: `/api/v1`.

### API Modules and Where They Are Used

| API Module | Path | Purpose | Used From (Pages/Components) |
|------------|------|---------|------------------------------|
| **authApi** | `src/utils/authApi.js` | Login, register, refresh, OTP, password reset, verify email, user profile, 2FA, preferences | Login, Signup, Forgot/Reset Password, Verify Email, Dashboard Settings, ProfileDropdown, SecureRoute, Sidebar (logout) |
| **assetsApi** | `src/utils/assetsApi.js` | Assets CRUD, categories, photos, documents, valuations, appraisals, sale requests, transfers, reports, summary | Dashboard Assets (list, add, detail) |
| **portfolioApi** | `src/utils/portfolioApi.js` | Portfolio summary/performance/history, allocation, holdings, activity, crypto, cash flow, trade engine (search, orders, recent trades), accounts | Dashboard (main), Portfolio Overview, Trade Engine, Cash Flow, Crypto, Transactions, Goals Tracker |
| **marketplaceApi** | `src/utils/marketplaceApi.js` | Listings, offers, escrow, watchlist, market highlights/trends | Marketplace (public), Dashboard Marketplace, Listing Detail (InvestmentDetailClient) |
| **documentsApi** | `src/utils/documentsApi.js` | Upload (via `/files/upload`), list/get/delete/share documents, statistics, preview | Dashboard Documents |
| **notificationsApi** | `src/utils/notificationsApi.js` | List, unread, unread count, mark read, delete, settings | Dashboard Notifications, NotificationDropdown |
| **kycApi** | `src/utils/kycApi.js` | KYC/KYB start, status, submit, upload document, resubmit, rejection reason, sync status | KYC Verification, Identity Verification, Document Verification, Dashboard KYC, Verification Complete |
| **investmentApi** | `src/utils/investmentApi.js` | Investment overview, goals, strategies, watchlist, crypto prices, trader profile, comments, boost, apply, share | Dashboard Investment (overview, goals, strategies, crypto marketplace), Strategy Detail |
| **accountsApi** | `src/utils/accountsApi.js` | Account (me), stats | Dashboard (main) |
| **bankingApi** | `src/utils/bankingApi.js` | Bank accounts, transactions, balance, link (Plaid) | Dashboard (main), Transactions, LinkedAccounts (settings) |
| **marketApi** | `src/utils/marketApi.js` | Benchmarks | Dashboard (main) |
| **tradingApi** | `src/utils/tradingApi.js` | Trading transactions | Dashboard Transactions |
| **paymentsApi** | `src/utils/paymentsApi.js` | Payment methods, history, invoices | Dashboard Transactions, PaymentBilling (settings) |
| **referralsApi** | `src/utils/referralsApi.js` | Referral code, list, rewards, leaderboard | Dashboard Referral |
| **crmApi** | `src/utils/crmApi.js` | CRM users, dashboard overview, updates | Dashboard Reports CRM, AssignmentModal, TasksView |
| **supportTicketsApi** | `src/utils/supportTicketsApi.js` | Tickets CRUD, assign, documents | Dashboard Support, Support Dashboard, NewTicketModal, Reports CRM |
| **chatApi** | `src/utils/chatApi.js` | Conversations, messages, send | Dashboard Support Dashboard |
| **conciergeApi** | `src/utils/conciergeApi.js` | Appraisals, status, assign, documents, valuation, report, statistics | Dashboard Concierge |
| **complianceApi** | `src/utils/complianceApi.js` | Compliance dashboard, tasks, audits, alerts, score, metrics, reports, policies | Dashboard Compliance |
| **entityApi** | `src/utils/entityApi.js` | Entities CRUD, types, hierarchy, compliance, people, audit, documents | Dashboard Entity Structure |
| **analyticsApi** | `src/utils/analyticsApi.js` | Portfolio/performance/risk analytics | Dashboard Analytics |
| **reportsApi** | `src/utils/reportsApi.js` | Generate, list, get, download, statistics | Dashboard Reports, Reports CRM, TasksView |
| **subscriptionsApi** | `src/utils/subscriptionsApi.js` | Plans, current subscription, limits | PaymentBilling (settings) |
| **tasksApi** | `src/utils/tasksApi.js` | Tasks list, create, complete | Settings (tasks) |
| **remindersApi** | `src/utils/remindersApi.js` | Reminders list, create | Settings (reminders) |

All of these modules use the shared client (`apiGet`, `apiPost`, `apiPut`, `apiPatch`, `apiDelete`, `apiRequest`) and the endpoint constants from `src/config/api.js` (`API_ENDPOINTS`).

---

## 2. Frontend Architecture

### Framework

- **Next.js 15** with **App Router** (`src/app/`)
- **React 19**
- **Node:** >=20.9.0

### Routing Structure

- **App Router:** All routes are under `src/app/` as `page.js` (or `page.jsx`) files.
- **Public routes (examples):** `/`, `/login`, `/signup`, `/forgot-password`, `/reset-password`, `/verify-email`, `/marketplace`, `/about`, `/contact`, `/terms`, `/privacy`, `/cookies`, `/help-center`, `/plans`, `/fullego`, `/kyc-verification`, `/identity-verification`, `/document-verification`, `/choose-profile`, `/welcome`, `/verification-success`, `/kyc/verification-complete`, etc.
- **Protected routes:** Everything under `/dashboard/*` is wrapped by `DashboardLayout`, which uses **SecureRoute**. SecureRoute checks `isAuthenticated()` (token in `localStorage`); if not authenticated, it redirects to `/login`.
- **Dynamic segments:** e.g. `dashboard/assets/[id]`, `dashboard/marketplace/[id]`, `dashboard/investment/strategies/[id]`.
- **Path alias:** `@/` maps to `src/` (e.g. `@/utils/authApi`, `@/config/api`).

### Component Structure

- **Layout:** Root layout in `src/app/layout.js` (ThemeProvider, SWRProvider, ToastProvider). Dashboard layout in `src/components/dashboard/DashboardLayout.jsx` (SecureRoute, Sidebar, Navbar).
- **UI:** Reusable pieces under `src/components/ui/` (Button, Modal, Select, Container, StatusBadge, OutlineButton).
- **Feature components:** Under `src/components/` by area: `dashboard/`, `auth/`, `verification/`, `documents/`, `sections/`, `skeletons/`, `providers/`, `layout/`, `reports/`, `settings/`, `error/`.
- **No dedicated `hooks/` folder** in the scanned structure; shared logic lives in context and utils.

### Global State Management

- **No Redux/Zustand.** State is:
  - **Auth:** Token and user info in `localStorage` (access_token, refresh_token, user_info). Read via `authApi` helpers (`getAccessToken`, `isAuthenticated`, `getUserProfile`).
  - **Theme:** `ThemeContext` (`src/context/ThemeContext.js`) for dark/light mode; persisted in `localStorage` and applied to `document.documentElement`.
  - **Data fetching:** **SWR** (via `SWRProvider` in layout) for caching/revalidation; many pages also use local `useState` + `useEffect` and call the utils directly.

### Authentication Handling

- **Login:** `authApi.login()` → backend returns `access_token`, `refresh_token`, and optionally `user`. Tokens and `user` are stored in `localStorage`. If backend returns `requires_2fa`, the login page shows 2FA form and calls `login(email, password, totpCode)`.
- **Protected UI:** `SecureRoute` (used by `DashboardLayout`) runs on the client, checks `isAuthenticated()` (presence of `access_token`). If false, redirects to `/login`.
- **Middleware:** `src/middleware.js` runs for all routes except api/_next/static/_next/image/favicon; it does not block dashboard access; protection is client-side via SecureRoute.
- **Logout:** `authApi.clearTokens()` (e.g. from Sidebar) clears `localStorage`; user is then redirected to login when hitting dashboard again.

### API Client Implementation

- **Location:** `src/lib/api/client.js`
- **Config:** `src/config/api.js` exports `API_BASE_URL`, `API_VERSION`, `API_BASE_PATH`, and a large `API_ENDPOINTS` map for all backend paths.
- **Helpers:** `getDefaultHeaders()` adds `Content-Type: application/json` and `Authorization: Bearer <access_token>` when in browser. `apiRequest(endpoint, options)` builds URL as `API_BASE_URL + API_BASE_PATH + endpoint`, handles JSON/FormData, parses errors (including FastAPI `detail`), and throws with `error.status` and `error.data`. Exported: `apiGet`, `apiPost`, `apiPut`, `apiPatch`, `apiDelete`.
- **Conventions:** Request bodies are usually sent as JSON; multipart (e.g. file uploads) use FormData and omit `Content-Type` so the browser sets the boundary. Many utils transform backend **snake_case** to **camelCase** (and vice versa for requests).

---

## 3. Data Models Used on Frontend

Backend data is consumed as JSON; the frontend does not define formal TypeScript/Flow types but uses the following shapes in practice.

- **User:** From auth and `/users/me`: `id`, `email`, `first_name`, `last_name`, `role`, `is_verified`, `is_kyc_verified`, `is_email_verified`, etc. Stored in `localStorage` as `user_info` and fetched via `getUserProfile()`.
- **Account:** From accounts API: current account (e.g. `/accounts/me`), stats; used for dashboard “account” and stats (e.g. portfolio value).
- **Assets:** From assets API: list item and detail with `id`, `name`, `category`, `currentValue`, `currency`, `photos`, `documents`, valuations, appraisals, sale requests; often normalized to camelCase in `assetsApi`.
- **Portfolio:** From portfolio API: summary (e.g. `totalPortfolioValue`, `totalAssets`, `totalDebts`, `cashAvailable`, `returnPercentage`), performance (e.g. `totalReturn`, `totalReturnPercentage`), history (array of `{ date, value }`), allocation, top holdings, recent activity, crypto summary/breakdown/holdings, cash flow summary/transactions/accounts/transfers.
- **Marketplace listings:** Listing object with id, status, pricing, asset info; used on marketplace list and listing detail pages.
- **Offers:** Offer object for a listing; created/fetched via marketplace offers APIs; used in listing detail and “my offers” flows.
- **Documents:** From documents API and file upload: list/detail with id, name, category, tags, etc.; also asset-level documents and KYC uploads.
- **Notifications:** From notifications API: list items with id, title, message, read status, created date; unread count for navbar.
- **KYC/KYB:** Status (e.g. `not_started`, `in_progress`, `pending_review`, `approved`, `rejected`), `persona_inquiry_id`, rejection reason; used on KYC and verification-complete pages.
- **Investment:** Goals, strategies, overview (assets, activity, crypto prices, trader profile); strategy detail with comments; watchlist items (symbol, assetType, etc.).
- **Support:** Tickets (list, detail, assign, documents); used in dashboard support and CRM reports.
- **Concierge:** Appraisals (list, detail, status, valuation, report).
- **Compliance:** Dashboard, tasks, audits, alerts, score, metrics, reports, policies.
- **Entities:** Entity list/detail, types, hierarchy, people, compliance, audit trail, documents.

---

## 4. Environment Variables

| Variable | Purpose |
|----------|---------|
| **NEXT_PUBLIC_API_BASE_URL** | Backend base URL (e.g. `https://akunuba-backend.onrender.com/`). Used in `src/config/api.js`. If unset, the default production backend URL above is used. Must be public so the browser can call the API. |

No other environment variables were found in the codebase. There is no `.env` or `.env.example` in the repo; for local development, set `NEXT_PUBLIC_API_BASE_URL` as needed (e.g. in `.env.local`).

---

## 5. Infrastructure

- **Build output:** Next.js build (`next build`). The config in `next.config.mjs` does **not** set `output: 'export'`; the app can run with a Node server (`next start`) or be adapted for static export if required later. `wrangler.toml` references `pages_build_output_dir = "out"`, which implies a static export build is used for Cloudflare Pages (see Deployment).
- **CDN / Hosting:** Cloudflare Pages is configured via **Wrangler** (`wrangler.toml`): project name `akunuba`, `pages_build_output_dir = "out"`. Production and preview environments are named accordingly.
- **Connection to backend:** Browser-origin requests go directly to `API_BASE_URL` (no Next.js API route proxy in use). Backend must allow the frontend origin in CORS.
- **Images and files:** Next.js config sets `images: { unoptimized: true }` for Cloudflare Pages. Image and file loading use normal `next/image` and fetch/upload to backend (e.g. `/files/upload`, asset photos, KYC documents).

---

## 6. Deployment Process

1. **Build:**  
   - `npm run build` → `next build`  
   - For Cloudflare Pages: build must produce static output in `out` (e.g. via `output: 'export'` in Next.js config if not already set elsewhere, or a custom build script).
2. **Deploy to Cloudflare Pages:**  
   - `npm run pages:deploy` → `npx wrangler pages deploy out`  
   - One-step: `npm run cf:deploy` → `npm run pages:build && npm run pages:deploy`
3. **Environment:** Set `NEXT_PUBLIC_API_BASE_URL` in the Cloudflare Pages project so the deployed app points to the correct backend.

---

## 7. API Usage Reference (Pages/Components → Endpoints)

Mapping is derived from which **utils** each page/component imports; the utils in turn call the endpoints defined in `src/config/api.js`. Actual backend paths are under `/api/v1/...`.

| Page / Component | API Modules Used | Backend Endpoints (Conceptual) |
|------------------|------------------|--------------------------------|
| **Dashboard (main)** | authApi, portfolioApi, accountsApi, bankingApi, marketApi | `/users/me`, `/portfolio/summary`, `/portfolio/performance`, `/portfolio/history`, `/accounts/me`, `/accounts/stats`, `/banking/accounts`, `/market/benchmarks` |
| **Login** | authApi | `POST /auth/login` |
| **Signup** | authApi | `POST /auth/register` |
| **Forgot Password** | authApi | `POST /auth/request-otp`, `POST /auth/verify-otp` |
| **Reset Password** | authApi | `POST /auth/reset-password` |
| **Verify Email** | authApi | `POST /auth/verify-email`, `POST /auth/resend-verification` |
| **KYC Verification** | kycApi | `/kyc/start`, `/kyc/status`, `/kyc/submit`, etc. |
| **Identity / Document Verification** | kycApi | `/kyc/upload-document`, `/kyc/submit`, `/kyc/status` |
| **Dashboard Assets** | assetsApi | `/assets`, `/assets/{id}`, `/assets/categories`, `/assets/category-groups`, etc. |
| **Dashboard Assets Add** | assetsApi, categoryIcons | `POST /assets`, categories |
| **Dashboard Asset Detail** | assetsApi | `/assets/{id}`, documents, valuations, appraisals, etc. |
| **Dashboard Portfolio Overview** | portfolioApi | `/portfolio/*`, `/portfolio/crypto/*`, trade-engine |
| **Dashboard Trade Engine** | portfolioApi | `/portfolio/trade-engine/search`, `/portfolio/trade-engine/orders`, recent-trades, accounts, assets |
| **Dashboard Cash Flow** | portfolioApi | `/portfolio/cash-flow/*` |
| **Dashboard Portfolio Crypto** | portfolioApi | `/portfolio/crypto/*` |
| **Dashboard Marketplace** | marketplaceApi | `/marketplace/listings`, `/marketplace/offers/my`, watchlist, market-highlights, etc. |
| **Dashboard Marketplace [id]** | marketplaceApi | `/marketplace/listings/{id}`, listing offers, create offer |
| **Dashboard Active Offers** | marketplaceApi | `/marketplace/offers/my`, accept/reject/counter/withdraw |
| **Public Marketplace** | marketplaceApi | `/marketplace/listings`, search, market-highlights, market-trends |
| **Dashboard Documents** | documentsApi | `/files/upload`, `/documents/*` |
| **Dashboard Notifications** | notificationsApi | `/notifications/*` |
| **NotificationDropdown** | notificationsApi | `/notifications`, unread count, mark read |
| **Dashboard Investment Overview** | investmentApi | `/investment/overview`, assets, activity, crypto-prices, trader-profile |
| **Dashboard Investment Goals** | investmentApi, portfolioApi | `/investment/goals`, portfolio trade-engine search |
| **Dashboard Investment Strategies** | investmentApi | `/investment/strategies`, strategy detail, save |
| **Dashboard Investment Strategy [id]** | investmentApi | `/investment/strategies/{id}`, save |
| **Dashboard Investment Crypto Marketplace** | investmentApi | investment watchlist add/remove |
| **Dashboard Referral** | referralsApi | `/referrals/*` |
| **Dashboard Transactions** | tradingApi, paymentsApi, portfolioApi, bankingApi | `/trading/transactions`, `/payments/history`, trade-engine recent-trades, banking transactions/accounts |
| **Dashboard Settings** | authApi (profile, 2FA, password, etc.) | `/users/me`, `/users/notifications`, `/users/privacy`, 2FA, change-password, etc. |
| **Dashboard KYC** | kycApi | `/kyc/status`, start, submit, resubmit, rejection-reason |
| **Dashboard Concierge** | conciergeApi | `/concierge/appraisals/*` |
| **Dashboard Compliance** | complianceApi | `/compliance/*` |
| **Dashboard Entity Structure** | entityApi | `/entities/*` |
| **Dashboard Analytics** | analyticsApi | `/analytics/*` |
| **Dashboard Reports** | reportsApi | `/reports/*` |
| **Dashboard Reports CRM** | crmApi, supportTicketsApi, reportsApi | `/crm/*`, `/support/tickets/*`, `/reports/*` |
| **Dashboard Support** | supportTicketsApi | `/support/tickets/*` |
| **Dashboard Support Dashboard** | supportTicketsApi, chatApi | `/support/tickets/*`, `/chat/*` |
| **PaymentBilling (settings)** | paymentsApi, subscriptionsApi | `/payments/*`, `/subscriptions/*` |
| **LinkedAccounts (settings)** | bankingApi | `/banking/accounts`, link, etc. |
| **Tasks/Reminders (settings)** | tasksApi, remindersApi | `/tasks/*`, `/reminders/*` |
| **ProfileDropdown** | authApi | `/users/me`, clearTokens (logout) |
| **SecureRoute** | authApi | isAuthenticated (localStorage only) |

---

## 8. System Flows

### Login flow

1. User enters email and password on `/login`.
2. Frontend calls `authApi.login(email, password)`.
3. If backend returns `requires_2fa`, UI shows 2FA form; user submits code; frontend calls `login(email, password, totpCode)`.
4. On success, backend returns `access_token`, `refresh_token`, and optionally `user`. Frontend stores them in `localStorage` (and `user_info` from `user`).
5. Redirect: if `is_email_verified` and `is_kyc_verified` → `/dashboard`; if email verified but not KYC → `/choose-profile`; otherwise → `/signup` for account setup.

### Signup flow

1. User fills form on `/signup`; frontend calls `authApi.register({ email, password, firstName, lastName, phone })`.
2. Backend returns tokens; frontend stores them and typically redirects to verify email or onboarding (e.g. `/verify-email` or `/choose-profile` depending on implementation).

### KYC flow

1. User may land on `/kyc-verification` or `/dashboard/kyc` (or after choose-profile).
2. Frontend calls `getKYCStatus()`. If 404 or `not_started`, it may call `startKYC(verificationLevel, verificationType)` (level from profile selection).
3. Backend returns Persona inquiry ID; frontend embeds Persona (e.g. `PersonaVerification`) for document/identity capture.
4. After Persona completion, frontend calls `submitKYC()` (and optionally `uploadKYCDocument` for extra docs).
5. Status is polled or user goes to `/kyc/verification-complete`; `getKYCStatus()` or `syncKYCStatus()` shows approved/rejected. If rejected, `getKYCRejectionReason()` and optionally `resubmitKYC()`.

### Dashboard loading

1. User navigates to `/dashboard`. Middleware allows the request; `DashboardLayout` renders and `SecureRoute` runs.
2. `SecureRoute` checks `isAuthenticated()` (localStorage); if no token, redirect to `/login`.
3. Dashboard page runs; it calls in parallel: `getUserProfile()`, `getPortfolioSummary()`, `getPortfolioPerformance()`, `getPortfolioHistory()`, `getMyAccount()`, `getAccountStats()`, `getBankAccounts()` (and in one card, `getBenchmarks()`). Results are stored in local state and rendered (cards, chart). Errors are handled per call (e.g. toast, empty state).

### Asset creation

1. User goes to `/dashboard/assets/add`, selects category, fills asset form.
2. Frontend calls `assetsApi.createAsset(assetData)` (camelCase → snake_case in util). Backend returns created asset.
3. User can then upload photos/documents via `uploadAssetPhoto`, `uploadAssetDocument`, or general `uploadFile`.

### Marketplace actions

1. **Listings:** Dashboard marketplace and public marketplace use `listListings()`, `searchMarketplace()`, `getMarketHighlights()`, `getMarketTrends()`.
2. **Detail:** Listing detail page uses `getListing(id)`, `getListingOffers(id)`; user can create offer with `createOffer(listingId, offerData)`.
3. **My offers:** Active offers page uses `getMyOffers()`, then `acceptOffer`, `rejectOffer`, `counterOffer`, `withdrawOffer` as needed.
4. **Watchlist:** `addToWatchlist`, `removeFromWatchlist`, `getWatchlist`, `checkWatchlist` (marketplace and/or investment watchlist depending on module).

### Document uploads

1. **Dashboard documents:** User uploads via UI; frontend calls `documentsApi.uploadDocument(file, options)` which POSTs to `/files/upload` with FormData (file, category, tags, etc.). List/delete/share use `listDocuments`, `deleteDocument`, `shareDocument`.
2. **KYC:** `kycApi.uploadKYCDocument(file)` POSTs to `/kyc/upload-document` with FormData.
3. **Asset documents:** `assetsApi.uploadAssetDocument(assetId, file, documentType)` POSTs to `/assets/{id}/documents`.
4. **Support tickets:** `uploadTicketDocuments(ticketId, files)` for ticket attachments.

---

*End of document.*
