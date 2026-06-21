# Auth Token Security — Hardening & httpOnly-Cookie Migration Handoff

**Audience:** backend (FastAPI) + frontend maintainers
**Status:** Phase 1 (frontend hardening) done in this repo; Phase 2 (cookie migration) needs backend work
**Related:** `public/_headers` (CSP), `src/lib/api/client.js` (auto-refresh), `src/utils/authApi.js` (token storage)

---

## 1. Current state (as of this change)

Tokens are stored in **`localStorage`**:

| Item | Key | Set by | Read by |
|------|-----|--------|---------|
| Access token | `access_token` | `authApi.login/register/refresh` | `client.js` `getDefaultHeaders()` → `Authorization: Bearer …` |
| Refresh token | `refresh_token` | same | `client.js` `refreshAccessToken()` |
| User info | `user_info` | `authApi.login` | UI |

**Why this is a risk:** `localStorage` is readable by any JavaScript running on the origin. A single XSS foothold (a compromised npm dependency, an injection bug, a malicious third-party script) can exfiltrate a long-lived, persisted credential. For a wealth/finance product this is the dominant auth threat.

### What Phase 1 already did (frontend-only, shipped in this repo)
1. **Content-Security-Policy + security headers** (`public/_headers`, Cloudflare Pages) — reduces the XSS attack surface (the root cause of token theft) and blocks clickjacking / MIME-sniffing. Note: static export can't do nonce-based script CSP, so inline-script XSS isn't fully closed — that's what Phase 2 fixes.
2. **Silent access-token refresh on 401** (`client.js`) — transparently exchanges the refresh token for a new access token and retries once; on failure it clears tokens and lets route guards redirect to `/login`. This makes a **short access-token TTL** viable, shrinking the stolen-token window.
3. **Graceful 401 handling** in `ProfileDropdown` (and the existing pattern in `assets`, `crmApi`, `settings`).

### Recommended immediate backend change (low effort, high value)
- **Shorten the access-token TTL** to ~15 minutes (or less). The frontend now auto-refreshes, so users won't notice. This is the single cheapest security win and requires no API contract change.

---

## 2. Target architecture (Phase 2)

Industry-standard for SPAs — **split the two tokens by storage medium**:

| Token | Stored where | Lifetime | XSS-readable? |
|-------|--------------|----------|---------------|
| **Access token** | In **memory** only (a JS variable / React state), never persisted | short (~15 min) | Only transiently; never persisted |
| **Refresh token** | **`httpOnly` `Secure` `SameSite` cookie**, set by backend | longer (days), **rotated** on each use | ❌ No — JS cannot read it |

On page load/refresh, the SPA has no access token in memory, so it calls `POST /auth/refresh` (cookie sent automatically by the browser) to mint a fresh access token into memory. This removes the persisted, JS-readable credential entirely.

---

## 3. Required BACKEND changes

### 3.1 Refresh-token cookie
- On `POST /auth/login`, `POST /auth/register`, and `POST /auth/refresh`, set the refresh token as a cookie instead of (or in addition to, during migration) returning it in the JSON body:
  ```
  Set-Cookie: refresh_token=<token>; HttpOnly; Secure; SameSite=None; Path=/api/v1/auth; Max-Age=<seconds>
  ```
  - `HttpOnly` — JS can't read it (the whole point).
  - `Secure` — HTTPS only.
  - `SameSite=None` is required **only** if the API stays on a different site than the frontend (see 3.4). If you move the API to a first-party subdomain, use `SameSite=Lax` (stronger, no CSRF token needed for top-level nav).
  - `Path=/api/v1/auth` — the cookie is only sent to auth endpoints, not every API call.
- **Rotate** the refresh token on every `/auth/refresh` (issue a new one, invalidate the old) and support server-side revocation (logout, password change, "log out all devices").

### 3.2 Refresh endpoint reads the cookie
- `POST /auth/refresh` should read the refresh token from the cookie (fallback to JSON body during migration), validate + rotate it, and return **only** the new access token in the JSON body:
  ```json
  { "access_token": "…", "token_type": "bearer", "expires_in": 900 }
  ```

### 3.3 Logout endpoint
- Add `POST /auth/logout` that **clears the refresh cookie** (`Set-Cookie: refresh_token=; Max-Age=0; …`) and revokes the token server-side. The frontend currently just clears localStorage, which can't clear an httpOnly cookie.

### 3.4 CORS + cookies (critical — this is the usual blocker)
The frontend (Cloudflare Pages) and API (Render) are currently **different sites**, so cookies are cross-site. Two options:

- **Option A — keep cross-site (faster, weaker):**
  - CORS must echo the exact origin (no `*`) and allow credentials:
    ```
    Access-Control-Allow-Origin: https://<frontend-domain>
    Access-Control-Allow-Credentials: true
    ```
  - Cookies need `SameSite=None; Secure`.
  - The frontend must send `credentials: 'include'` on auth requests (see §4).
  - **Requires CSRF protection** (see 3.5).

- **Option B — make the API first-party (recommended):**
  - Serve API as e.g. `api.akunuba.com` and the app as `app.akunuba.com` (or same apex). Cookies become first-party; use `SameSite=Lax`, which alone defeats most CSRF for state-changing top-level requests. Cleaner and more secure long-term.

### 3.5 CSRF protection (required if you use cookies for auth)
Once the browser auto-sends the refresh cookie, you need CSRF defense on cookie-authenticated endpoints:
- **Double-submit token**, or
- `SameSite=Lax/Strict` (Option B) which prevents the cookie from riding cross-site requests, or
- Require a custom header (e.g. `X-Requested-With`) that simple cross-site forms can't set.

> The **access token stays a Bearer header**, not a cookie — so normal API calls remain immune to CSRF. Only `/auth/refresh` and `/auth/logout` (cookie-authenticated) need CSRF handling.

---

## 4. Required FRONTEND changes (Phase 2, not yet done)

These are scoped and centralized thanks to the current layering:
1. **Stop persisting the access token.** Hold it in a module-level variable / context instead of `localStorage`. Update `getDefaultHeaders()` (`client.js`) to read from there.
2. **Stop storing the refresh token at all** — it lives in the httpOnly cookie. Delete the `refresh_token` localStorage reads/writes in `authApi.js` and `client.js`.
3. **Add `credentials: 'include'`** to the `fetch` calls for `/auth/login`, `/auth/register`, `/auth/refresh`, `/auth/logout` so the cookie is sent/received.
4. **Bootstrap on app load:** call `/auth/refresh` once on mount to populate the in-memory access token before rendering protected routes (extend `SecureRoute`).
5. **Logout** calls `POST /auth/logout` (to clear the cookie) in addition to dropping the in-memory token.
6. CSRF token plumbing if Option A is chosen.

Because token access is already funneled through `client.js` + `authApi.js`, steps 1–2 are the only "spread out" part — and they're small. Consider first extracting a single `tokenStore` module to make the swap a one-file change.

---

## 5. Suggested migration order (no big-bang)

1. **Now:** shorten access-token TTL (backend) — works immediately with the new frontend auto-refresh. ✅ cheapest win.
2. Backend adds the refresh **cookie** alongside the existing JSON refresh token (dual-mode) + `/auth/logout` + CORS credentials.
3. Frontend switches to in-memory access token + `credentials: 'include'` + bootstrap refresh, and stops reading the JSON refresh token.
4. Backend **stops returning** the refresh token in the JSON body (cookie-only).
5. Add CSRF protection; ideally move the API to a first-party subdomain (Option B) and downgrade `SameSite=None` → `Lax`.
6. Verify the full CSP in `public/_headers` still passes (no new blocked origins) and tighten if possible.

---

## 6. Acceptance checklist

- [ ] Access-token TTL ≤ 15 min; silent refresh keeps sessions alive with no user-visible logout.
- [ ] Refresh token never appears in `localStorage`, `sessionStorage`, or any JS-readable location.
- [ ] Refresh token cookie is `HttpOnly; Secure; SameSite=…`, scoped to the auth path, and **rotates** on use.
- [ ] `POST /auth/logout` clears the cookie and revokes the token server-side.
- [ ] CORS echoes the exact frontend origin with `Allow-Credentials: true` (no `*`).
- [ ] CSRF protection on cookie-authenticated endpoints.
- [ ] CSP in `public/_headers` enforces with no violations during login + Persona KYC + normal use.
