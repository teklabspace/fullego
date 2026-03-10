# Platform Completion Estimate & Launch Blockers

**Date:** March 2026  
**Basis:** Frontend codebase analysis; backend inferred from API contract and integration docs.  
**Scope:** Fullego (Akunuba) – wealth/investment platform.

---

## 1. Completion estimates

| Area | Estimate | Rationale |
|------|----------|------------|
| **Backend completion** | **78–85%** | Inferred from frontend: 25+ API domains are called (auth, KYC, accounts, banking, portfolio, trading, payments, subscriptions, investment, marketplace, assets, analytics, reports, documents, support, concierge, CRM, entity, compliance, notifications, referrals, chat, market, tasks, reminders). Frontend is built against a full contract; either backend exists for most of it or those flows show empty/error. Gap % allows for: possible missing or stub endpoints (e.g. chat, market benchmarks), rate limiting, hardening, and production config. **Note:** Backend codebase was not reviewed; this is an inference from the frontend and docs. |
| **Frontend completion** | **88–92%** | ~58 distinct route-level screens; all major feature areas have pages (auth, KYC, dashboard, portfolio, investment, marketplace, assets, documents, reports/CRM, support, concierge, compliance, entity, settings, public). Missing: Add Entity modal/flow, Add Person modal/flow, strategy action UIs (backtest, clone, adjust goal), optional dedicated watchlist page. One redirect and one legacy page (investments) with mock data. |
| **Integration completion** | **90–94%** | API client used consistently; no active mock list data in UI; payment/invoice APIs fixed; concierge and support use APIs with fallback only on error. Minor: one hardcoded path in assetsApi; portfolioApi uses string paths instead of config; some config endpoints unused. |
| **Production readiness** | **38–45%** | Error boundaries and API error handling in place; static export and Cloudflare deploy path exist. Missing or weak: no tests, API URL hardcoded, no security headers, console-only logging (including request/response bodies), no schema-based validation, ESLint disabled on build, no Docker or .env.example. |

**Overall platform (launch-ready):** Backend and frontend feature completeness are high; integration is strong. **Production readiness is the main blocker** (env, security, logging, tests, validation). Addressing the items below would bring the platform to a launch-ready state.

---

## 2. Top 15 missing items before launch

Prioritized by impact on **launch safety, security, and core product**. Order is approximate; some can be done in parallel.

| # | Item | Area | Why it blocks launch |
|---|------|------|----------------------|
| **1** | **Use environment variable for API base URL** | Config | Production build currently points at `http://localhost:8000/`. Uncomment/use `NEXT_PUBLIC_API_BASE_URL` in `src/config/api.js` and set it in production so the app talks to the real backend. |
| **2** | **Add `.env.example` and document production env vars** | Config / Ops | No single source of truth for what must be set (e.g. `NEXT_PUBLIC_API_BASE_URL`). Required for correct and repeatable deploys. |
| **3** | **Add security headers** | Security | No CSP, X-Frame-Options, or X-Content-Type-Options. Needed to reduce clickjacking, MIME sniffing, and injection risk before public launch. |
| **4** | **Stop logging request/response bodies in production** | Security / Compliance | API client logs every request and response; can expose tokens and PII in browser and logs. Gate body logging by environment or disable in production. |
| **5** | **Implement Add Entity flow** | Product | Entity structure has “Add Entity” but shows “coming soon”. Backend `createEntity` exists. Users cannot create entities without this (modal or small flow). |
| **6** | **Implement Add Person flow** | Product | Same for “Add Person” on entity structure. Required for full entity management. |
| **7** | **Introduce form validation (e.g. Zod)** | Quality / Security | No schema-based validation; forms rely on backend errors. Add validation for auth (login, signup, reset), KYC, and payment-related forms to improve UX and reduce invalid submissions. |
| **8** | **Add automated tests** | Quality | No tests or test runner. At minimum: smoke tests and critical paths (e.g. login, API client error handling, one dashboard load). Needed to catch regressions before launch. |
| **9** | **Add production error reporting** | Ops | No Sentry (or similar). Errors only in console. Need visibility into production failures and user impact. |
| **10** | **Re-enable ESLint during build** | Quality | `eslint.ignoreDuringBuilds: true` hides lint errors. Fix critical lint and re-enable so production builds enforce basic quality. |
| **11** | **Remove or replace legacy `/dashboard/investments` page** | Product / Hygiene | Page uses hardcoded mock data and duplicates investment/overview. Either remove or make it redirect to the real investment overview. |
| **12** | **Remove dead mock data in public marketplace** | Hygiene | `allInvestmentFunds` in `src/app/marketplace/page.js` is unused. Remove to avoid confusion and keep codebase clean. |
| **13** | **Confirm 2FA setup flow** | Security | Backend has 2FA; ensure dashboard/settings has a clear “Enable 2FA” flow (e.g. QR + code). If missing, implement. |
| **14** | **Strategy actions UI or explicit defer** | Product | Backend supports adjust goal, backtest, clone strategy. Either add UI (modals/flows on strategy detail) or explicitly document as post-launch and hide/disable entry points. |
| **15** | **Document deployment and env for production** | Ops | Clear runbook: how to build, which env vars to set (e.g. on Cloudflare Pages), and how to verify the app uses the production API. Prevents misconfiguration at launch. |

---

## 3. Optional but recommended (post-launch or in parallel)

- **Dedicated investment watchlist page** – Add/remove exists elsewhere; a single “My watchlist” screen improves discoverability.
- **Dockerfile** – Only needed if you deploy outside Cloudflare (e.g. containerized host or CI).
- **Rate limiting** – Implement on backend (and optionally at gateway); frontend can add debounce/throttle for heavy UI actions.
- **Use `reset()` in error boundaries** – Improves recovery UX (“Try again” without full reload).
- **Banking link flow** – If “Link bank account” is not obvious in settings, add a clear entry point or short flow.

---

## 4. Summary table

| Metric | Range | Comment |
|--------|--------|--------|
| Backend completion | 78–85% | Inferred; backend not audited. |
| Frontend completion | 88–92% | Screens and features largely done; a few flows/modals missing. |
| Integration completion | 90–94% | API-driven; no active mock data. |
| Production readiness | 38–45% | Deploy path exists; config, security, logging, tests, validation missing or weak. |

**Conclusion:** Feature-wise the platform is largely complete; **production readiness and a few core product flows (Add Entity, Add Person, env/config, security, logging, tests)** are the main gaps. Addressing the top 15 items above would bring the platform to a launch-ready state.
