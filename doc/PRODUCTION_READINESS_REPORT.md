# Production Readiness Report

**Project:** Fullego (Akunuba) Frontend  
**Date:** March 2026  
**Scope:** Test files, environment configuration, error handling, logging, rate limiting, security middleware, validation, Docker/deployment.

---

## Executive summary

| Area | Status | Notes |
|------|--------|------|
| Test files | ❌ Missing | No tests, no test runner |
| Environment configuration | ⚠️ Partial | No .env.example; API URL hardcoded |
| Error handling | ✅ Ready | App/global error boundaries; API client errors |
| Logging | ⚠️ Partial | Console-only; no levels or production strategy |
| Rate limiting | ❌ N/A (frontend) | Expected on backend only |
| Security middleware | ⚠️ Minimal | Middleware exists but no auth/headers |
| Validation | ⚠️ Partial | Ad-hoc only; no schema lib |
| Docker / deployment | ⚠️ Partial | Static export + Wrangler; no Docker |

**Verdict:** Not production-ready without addressing tests, env config, security headers, validation, and logging strategy. Error handling and basic deployment path are in place.

---

## 1. Test files

### Status: ❌ Missing

**Findings:**
- No `*.test.js`, `*.spec.js`, or `__tests__/` files.
- No Jest, Vitest, or React Testing Library in `package.json`.
- No test-related scripts (e.g. `test`, `test:watch`).

**Impact:** No regression safety; refactors and deployments are risky.

**Recommendations:**
1. Add a test runner (e.g. Jest or Vitest) and React Testing Library.
2. Add `"test": "jest"` (or equivalent) and optionally `"test:watch"` in `package.json`.
3. Start with: auth flows (login/signup), API client error handling, and a few critical dashboard pages.
4. Add CI step to run tests on push/PR.

---

## 2. Environment configuration

### Status: ⚠️ Partial

**Findings:**
- **`src/config/api.js`:** `API_BASE_URL` is **hardcoded** to `'http://localhost:8000/'`. The intended override `process.env.NEXT_PUBLIC_API_BASE_URL` is commented out.
- **`.env*`:** Correctly listed in `.gitignore`; no `.env.example` or `.env.sample` in the repo.
- **`next.config.mjs`:** Uses `process.env.NODE_ENV` for `output: 'export'` in production only.
- **Docs:** `src/lib/api/README.md` mentions setting `NEXT_PUBLIC_API_BASE_URL` in `.env.local`, but the app does not read it at runtime.

**Impact:** Production builds will call `http://localhost:8000/` unless code is changed. No single place documents required env vars for deploy.

**Recommendations:**
1. Restore env-based API URL in `src/config/api.js`, e.g.  
   `export const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:8000/';`
2. Add `.env.example` with:
   - `NEXT_PUBLIC_API_BASE_URL=https://api.example.com`
   - Any other public vars (e.g. Persona, analytics).
3. Document in README or deploy runbook: set `NEXT_PUBLIC_API_BASE_URL` (and others) in the host (e.g. Cloudflare Pages env).

---

## 3. Error handling

### Status: ✅ Ready (with minor gaps)

**Findings:**
- **Route-level:** `src/app/error.js` – client component, catches errors in segment, renders `ErrorPage` with “Take me Home”.
- **Root-level:** `src/app/global-error.js` – catches errors in root layout; minimal UI with “Take me Home”.
- **404:** `src/app/not-found.js` – uses same `ErrorPage` pattern.
- **API client (`src/lib/api/client.js`):** Centralized handling: parses JSON/non-JSON, normalizes FastAPI-style `detail` (array/string), attaches `error.status` and `error.data`, and rethrows. Treats 401/403/404 (asset) and 422 UUID errors with less noisy logging.
- **Pages/components:** Widespread `try/catch` and `.catch()`; toasts used for user-facing messages (e.g. `toast.error(...)`).

**Gaps:**
- `error.js` and `global-error.js` do not call `reset()` (Next.js recovery).
- No explicit error reporting (e.g. Sentry) for production.

**Recommendations:**
1. Use the `reset` prop in `error.js` (and optionally in `global-error.js`) to allow “Try again” without full reload.
2. Add a production error-reporting service (e.g. Sentry) and hook into `error.js`, `global-error.js`, and API client catch paths.

---

## 4. Logging

### Status: ⚠️ Partial

**Findings:**
- **API client:** `apiLogger` with `info`, `error`, `success` – all backed by `console.log` / `console.error`. Every request and response is logged (including body).
- **Elsewhere:** Many direct `console.log`, `console.error`, `console.warn` across pages and utils.
- **No:** Log levels, environment-based toggling, structured (JSON) logs, or external log aggregation.

**Impact:** In production, all API payloads may appear in the browser console (sensitive data risk). No way to reduce verbosity or ship logs to a backend.

**Recommendations:**
1. In production, avoid logging request/response bodies (or log only in development).
2. Introduce a small logger that respects `NODE_ENV` or a flag (e.g. `NEXT_PUBLIC_LOG_LEVEL`) and drops or redacts sensitive fields in production.
3. Optionally add a lightweight integration to send error logs to your backend or a log/APM service.

---

## 5. Rate limiting

### Status: ❌ N/A (frontend)

**Findings:**
- No rate limiting or throttling in the frontend codebase.
- This is expected: rate limiting is normally implemented on the backend and/or API gateway.

**Recommendations:**
1. Ensure the **backend** (or gateway) rate-limits by IP and/or token for auth and sensitive endpoints.
2. Optionally throttle or debounce high-frequency UI actions (e.g. search, autosave) to reduce unnecessary API calls; this is UX/performance, not security.

---

## 6. Security middleware

### Status: ⚠️ Minimal

**Findings:**
- **`src/middleware.js`:** Exists and runs on all routes except `api`, `_next/static`, `_next/image`, `favicon.ico`. It only calls `NextResponse.next()`; no auth check, no security headers.
- **Auth:** Protection is entirely client-side via `SecureRoute` (checks `isAuthenticated()` and redirects to `/login`). No server-side auth in middleware (comment notes localStorage is used, so server cannot read token).
- **Headers:** No `Content-Security-Policy`, `X-Frame-Options`, `X-Content-Type-Options`, etc. in `next.config.mjs` or middleware.

**Impact:** Dashboard can be briefly visible before client redirect; no defense-in-depth. Missing security headers increase risk of clickjacking, MIME sniffing, etc.

**Recommendations:**
1. Add security headers in `next.config.mjs` (e.g. `headers()` returning `X-Frame-Options: DENY`, `X-Content-Type-Options: nosniff`, and a sensible CSP if feasible).
2. Keep middleware for future use (e.g. redirect by path or set headers). If auth moves to cookies, add server-side auth check in middleware.
3. Do not rely solely on client-side checks for sensitive routes; document that backend must enforce authorization.

---

## 7. Validation

### Status: ⚠️ Partial

**Findings:**
- No validation library (no Zod, Yup, Joi, or similar) in dependencies.
- **Ad-hoc checks:** Login (TOTP length), AssetDetailClient (email format), assets add (backend error message mapping). Forms often rely on backend validation and display `err.data.detail` in toasts.
- **API client:** Does not validate response shape; assumes backend contract.

**Impact:** Invalid input can be sent to the API; user sees errors only after round-trip. No single schema for forms or API boundaries.

**Recommendations:**
1. Add a schema-based validator (e.g. Zod) for critical forms (login, signup, KYC, payment, entity/person create).
2. Validate on submit and show field-level errors before calling the API where possible.
3. Optionally validate critical API responses (e.g. auth, profile) to fail fast if backend contract changes.

---

## 8. Docker / deployment configuration

### Status: ⚠️ Partial

**Findings:**
- **Build:** Next.js with `output: 'export'` in production → static export. No server; suitable for static hosting.
- **Deploy:** `package.json` has `pages:build`, `pages:deploy`, and `cf:deploy` using **Wrangler** (Cloudflare Pages). No Dockerfile or docker-compose in the repo.
- **Config:** `next.config.mjs` has `images: { unoptimized: true }`, `trailingSlash: true`, `productionBrowserSourceMaps: false`, and `eslint.ignoreDuringBuilds: true`.
- **Node:** `engines` in package.json: `node: ">=20.9.0"`, `npm: ">=10.0.0"`.

**What’s ready:**
- Static export and Cloudflare Pages deploy path are configured.
- Node/npm engines are specified.

**What’s missing:**
- No Dockerfile for containerized builds or runs (e.g. for non-Cloudflare environments).
- No `.env.example` or deploy docs for required env (e.g. `NEXT_PUBLIC_API_BASE_URL`).
- No health or readiness endpoint (not required for static site, but useful if you add a server later).
- ESLint is ignored during builds – consider re-enabling and fixing lint so production builds enforce quality.

**Recommendations:**
1. Add `.env.example` and document env vars for Cloudflare (and any other host).
2. If you need Docker (e.g. for CI or alternate hosting), add a multi-stage Dockerfile that runs `npm run build` and serves the `out` directory (e.g. with nginx or a tiny static server).
3. Consider turning `eslint.ignoreDuringBuilds` off and fixing lint errors so `next build` fails on lint.
4. Ensure production builds use the correct `NEXT_PUBLIC_*` values (e.g. set in Cloudflare Pages env).

---

## 9. Additional observations

- **ESLint:** Disabled during builds (`ignoreDuringBuilds: true`). Reduces confidence in code quality for production.
- **Source maps:** Disabled in production (`productionBrowserSourceMaps: false`). Good for size/security; consider enabling for a staging environment if you need to debug production-like builds.
- **Token storage:** Auth uses `localStorage` (mentioned in middleware and client). Document that HTTPS is required in production and consider refresh/expiry and secure logout (clear storage, redirect).

---

## 10. Checklist before production

| Item | Priority | Status |
|------|----------|--------|
| Use `NEXT_PUBLIC_API_BASE_URL` (no hardcoded API URL) | High | ❌ |
| Add `.env.example` and document env vars | High | ❌ |
| Add security headers (CSP, X-Frame-Options, etc.) | High | ❌ |
| Reduce or gate API request/response logging in production | High | ❌ |
| Introduce form/validation for critical flows (e.g. auth, KYC) | Medium | ❌ |
| Add error reporting (e.g. Sentry) | Medium | ❌ |
| Add tests (smoke + critical paths) | Medium | ❌ |
| Re-enable ESLint during build (and fix lint) | Medium | ❌ |
| Add Dockerfile if deploying outside Cloudflare | Low | ❌ |
| Use `reset()` in error boundaries | Low | ❌ |

---

## Summary: what is ready vs missing

**Ready for production (with current scope):**
- Error boundaries at app and root level; not-found handling.
- Centralized API error handling and user-facing toasts.
- Static export and Cloudflare Pages deploy path.
- Node/npm engine requirements.

**Missing or insufficient for production:**
- **Tests:** None.
- **Environment:** No .env.example; API base URL hardcoded.
- **Logging:** Console-only; full request/response logging in production is a concern.
- **Security:** No security headers; middleware does nothing; auth is client-only.
- **Validation:** No schema-based validation; ad-hoc only.
- **Deployment:** No Docker; no documented env for production; ESLint disabled on build.

Addressing the high-priority items (env, security headers, logging, and optionally validation and tests) will materially improve production readiness.
