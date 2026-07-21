# CLAUDE.md — Project Context for Akunuba

> Read this first every session. It's the map of the codebase so you can jump
> straight to the right files for any feature without re-exploring the whole repo.
> For deep detail see `front-end-doc.md` and the `doc/` audit folder.

---

## 1. What this is

**Akunuba** — a luxury wealth & lifestyle management platform (frontend only,
package name `akunuba`). High-net-worth investors, advisors, and admins manage
assets, portfolios, investments, a marketplace, compliance, KYC, and more from
one dashboard.

This repo is the **frontend SPA**. The backend is a separate FastAPI service at
`https://akunuba-backend.onrender.com/` (API base `/api/v1`). There is **no
backend code here** — every feature talks to that remote API over HTTP.

## 2. Tech stack

| Area | Choice |
|------|--------|
| Framework | Next.js 15 (App Router), **static export** (`output: 'export'` → `out/`) |
| UI | React 19, Tailwind CSS 4, Framer Motion, GSAP |
| Charts | Recharts |
| Data fetching | SWR (`SWRProvider`) + plain `useState`/`useEffect` calling util modules |
| KYC | Persona (`persona` npm pkg) |
| Toasts | react-toastify (`ToastProvider`) |
| Hosting | Cloudflare Pages (Wrangler, `out/` dir) |
| Language | **JavaScript only** (no TypeScript). `.js`/`.jsx`. |
| Path alias | `@/` → `src/` |

Node >= 20.9, npm >= 10. Scripts: `npm run dev`, `npm run build`,
`npm run cf:deploy` (build + deploy to Cloudflare).

> ⚠️ README badges say Next 16 — actual `package.json` is Next `^15.2.6`. Trust
> `package.json`.

## 3. The one architectural rule: how data flows

Everything goes through **three layers**, top to bottom:

```
Page / Component  (src/app/**, src/components/**)
      │ imports a feature util
      ▼
Feature API util  (src/utils/<feature>Api.js)   ← snake_case⇄camelCase mapping lives here
      │ uses endpoint constants + apiGet/apiPost/...
      ▼
Shared client     (src/lib/api/client.js)  +  endpoint map (src/config/api.js)
      │ fetch() to API_BASE_URL + /api/v1 + endpoint, attaches Bearer token
      ▼
Remote FastAPI backend
```

**When adding/fixing a feature, work in this order:**
1. Find the endpoint in `src/config/api.js` (`API_ENDPOINTS.<DOMAIN>`). Add it there if missing.
2. Add/edit the call in the matching `src/utils/<feature>Api.js`.
3. Wire it into the page/component.

**Do not** call `fetch` directly in pages — always go through a util + the
`apiGet/apiPost/apiPut/apiPatch/apiDelete` helpers from `src/lib/api/client.js`.

### Key conventions
- **Auth:** Bearer token from `localStorage.access_token`, auto-attached by
  `getDefaultHeaders()`. Also stored: `refresh_token`, `user_info`.
- **Case mapping:** Backend is snake_case; utils convert to camelCase for the UI
  and back for requests. Keep this in the util layer, not the page.
- **FormData uploads:** omit `Content-Type` (the client deletes it so the browser
  sets the multipart boundary). File uploads generally POST to `/files/upload`.
- **Errors:** client throws `Error` with `error.status` and `error.data`; FastAPI
  `detail` arrays are flattened to a message. Network failures set
  `error.isNetworkError`.

## 4. Auth, roles & route protection

- **Roles:** `admin` | `advisor` | `investor`. Permission matrix in
  `src/utils/permissions.js`; use the `useAuth()` hook (`src/hooks/useAuth.js`)
  for `isAdmin/isAdvisor/isInvestor` and `can('permission:name')`.
- **Protection is client-side.** Everything under `/dashboard/*` is wrapped by
  `DashboardLayout` → `SecureRoute` (`src/components/auth/SecureRoute.jsx`), which
  redirects to `/login` if no token. `src/middleware.js` does **not** gate routes.
- **Login redirect logic:** email+KYC verified → `/dashboard`; email only →
  `/choose-profile`; otherwise → signup/onboarding.

## 5. Where features live (the map)

Routes are `src/app/<route>/page.js(x)`. Each feature pairs a route with a util
in `src/utils/` and endpoint constants in `src/config/api.js`.

### Public / pre-auth
| Route | Purpose | Util(s) |
|-------|---------|---------|
| `/`, `/about`, `/contact`, `/careers`, `/press`, `/plans`, `/security`, `/terms`, `/privacy`, `/cookies`, `/help-center`, `/akunuba` | Marketing/static | — |
| `/login`, `/signup`, `/forgot-password`, `/reset-password`, `/verify-email` | Auth | `authApi` |
| `/marketplace`, `/marketplace/[id]` | Public marketplace | `marketplaceApi` |
| `/kyc-verification`, `/identity-verification`, `/document-verification`, `/kyc/complete`, `/kyc/verification-complete`, `/verification-success`, `/choose-profile`, `/welcome` | KYC/onboarding | `kycApi` |
| `/auth/google/callback` | Google OAuth | `oauthNext`, `authApi` |

### Dashboard (`/dashboard/*`, protected)
| Route | Feature | Util(s) |
|-------|---------|---------|
| `/dashboard` | Main overview (net worth, perf chart) | `portfolioApi`, `accountsApi`, `bankingApi`, `marketApi`, `authApi` |
| `/dashboard/assets`, `/add`, `/[id]`, `/detail` | Asset management | `assetsApi`, `config/assetConfig`, `utils/categoryIcons` |
| `/dashboard/portfolio/*` (Overview, cash-flow, crypto, trade-engine) | Portfolio | `portfolioApi` |
| `/dashboard/investment/*` (overview, goals-tracker, strategies, strategies/[id], crypto-marketplace) | Investment | `investmentApi`, `portfolioApi` |
| `/dashboard/investments` | Investments list | `investmentApi` |
| `/dashboard/marketplace/*` (`[id]`, active-offers, approve) | Marketplace | `marketplaceApi` |
| `/dashboard/documents` | Documents | `documentsApi` |
| `/dashboard/notifications` | Notifications | `notificationsApi` |
| `/dashboard/transactions` | Transactions | `tradingApi`, `paymentsApi`, `portfolioApi`, `bankingApi` |
| `/dashboard/referral` | Referrals | `referralsApi` |
| `/dashboard/reports`, `/reports/crm` | Reports + CRM | `reportsApi`, `crmApi`, `supportTicketsApi` |
| `/dashboard/support`, `/support-dashboard` | Support tickets / chat | `supportTicketsApi`, `chatApi` |
| `/dashboard/concierge` | Appraisals | `conciergeApi` |
| `/dashboard/compliance`, `/compliance/[id]` | Compliance center | `complianceApi` |
| `/dashboard/entity-structure` | Entity structure | `entityApi` |
| `/dashboard/analytics` | Analytics | `analyticsApi` |
| `/dashboard/kyc` | KYC status/resubmit | `kycApi` |
| `/dashboard/settings` | Profile, 2FA, billing, linked accts, tasks/reminders | `authApi`, `subscriptionsApi`, `paymentsApi`, `bankingApi`, `tasksApi`, `remindersApi` |
| `/dashboard/admin/users` | Admin: users | `adminApi` |
| `/dashboard/admin/subscriptions` | Admin: subscriptions | `adminApi`, `subscriptionsApi` |
| `/dashboard/admin/verifications` | Admin: KYC/KYB approve/reject | `adminApi` |
| `/dashboard/admin/disputes` | Admin: escrow disputes | `adminApi` |

### Util ↔ endpoint domains (in `src/config/api.js` `API_ENDPOINTS`)
`AUTH, KYC, KYB, USERS, ASSETS, FILES, INVESTMENT, PORTFOLIO, TRADING,
TRADE_ENGINE, MARKETPLACE, ACCOUNTS, BANKING, SUBSCRIPTIONS, PAYMENTS, ANALYTICS,
REPORTS, DOCUMENTS, SUPPORT, CONCIERGE, CRM, ENTITIES, COMPLIANCE, ADMIN,
NOTIFICATIONS, REFERRALS, CHAT, MARKET, TASKS, REMINDERS`.

## 6. Shared building blocks

- **UI primitives:** `src/components/ui/` — `Button`, `GradientButton`,
  `OutlineButton`, `Modal`, `Select`, `Container`, `GlassCard`, `StatusBadge`.
- **Dashboard chrome:** `src/components/dashboard/` — `DashboardLayout`, `Sidebar`,
  `Navbar`, `ProfileDropdown`, `NotificationDropdown`, plus modals
  (`NewTicketModal`, `AssignmentModal`, `DocumentUploadModal`), `DashboardSkeleton`.
- **Verification:** `src/components/verification/` — `PersonaVerification`,
  `Stepper`, `UploadArea`, `VerificationLayout`.
- **Documents:** `src/components/documents/` — preview/upload/share/success modals.
- **Marketing sections:** `src/components/sections/` — Hero, FAQ, etc.
- **Providers:** `src/components/providers/` — `SWRProvider`, `ToastProvider`
  (wired in `src/app/layout.js` alongside `ThemeProvider`).
- **Theme:** `src/context/ThemeContext.js` (dark/light, persisted to localStorage).
- **Config:** `src/config/api.js` (endpoints), `assetConfig.js`, `persona.js`.
- **Constants:** `src/constants/verification.js`.
- **Storage helper:** `src/utils/storage.js`.

## 7. Environment

- `NEXT_PUBLIC_API_BASE_URL` — overrides backend base URL. Defaults: localhost →
  `http://localhost:8000`, otherwise production Render URL. (See `src/config/api.js`.)
- `NEXT_PUBLIC_PERSONA_INQUIRY_TEMPLATE_ID` — Persona hosted KYC template.
- `NEXT_PUBLIC_PERSONA_HOSTED_VERIFY_URL` — optional Persona verify URL.

Copy `.env.local.example` → `.env.local` for local dev.

## 8. Gotchas & active context

- **Static export:** No server runtime. No Next API routes for app logic, no SSR
  data fetching — all data loads client-side after mount. (`src/app/api/proxy/`
  exists but the client calls the backend directly; CORS must allow the origin.)
- **ESLint is disabled during builds** (`next.config.mjs`) so lint errors won't
  block deploys — run `npm run lint` manually.
- **Recent work** has been bug fixes tagged `BUG-0x` (see git log and inline
  comments, e.g. `ASSETS.GET_SHARED` for public shared links BUG-02, and
  `SUPPORT.TICKET_REPLIES` replacing deprecated `TICKET_COMMENTS` BUG-09).
- **Admin pages** (`/dashboard/admin/*`) are the newest feature area
  (users, subscriptions, verifications, disputes) backed by `adminApi`.

## 9. Reference docs in this repo

- `front-end-doc.md` — full technical doc: API module table, flows (login, KYC,
  asset creation, marketplace, uploads), data models, deployment. **Most detailed.**
- `doc/PAGES_AND_COMPONENTS_INVENTORY.md` — exhaustive page/component list.
- `doc/API_CALLS_AUDIT.md` — API usage audit.
- `doc/FRONTEND_IMPLEMENTATION_AUDIT.md`, `PRODUCTION_READINESS_REPORT.md`,
  `PLATFORM_COMPLETION_ESTIMATE.md`, `WHAT_IS_DONE_CLIENT_SUMMARY.md` — status.
- `README.md` — setup & deployment (note the Next version discrepancy above).
