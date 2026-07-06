---
name: developing-akunuba-features
description: Use when building, changing, or debugging anything in the Akunuba frontend (this repo) — adding an API-backed feature, wiring a new endpoint, fixing an empty list/failed fetch, or investigating "Something went wrong. Please try again." toasts, 401 loops, or KYC redirects.
---

# Developing Akunuba Features

## Overview

Every feature is the same three-layer sandwich. Copy the recipe below instead of exploring — the exemplar files listed here are the canonical templates.

```
Page (src/app/**/page.js)  →  Util (src/utils/<feature>Api.js)  →  Client (src/lib/api/client.js) + endpoints (src/config/api.js)
```

JavaScript only (no TypeScript). Pages start with `'use client'`. Static export — no server code, no Next API routes.

## The #1 Trap: the envelope is ALREADY unwrapped

`apiGet/apiPost/apiPut/apiPatch/apiDelete` (from `@/lib/api/client`) already unwrap the backend's `{ success, status_code, message, data }` envelope and **return the `data` payload directly**.

- ❌ `const res = await apiGet(ep); return res.data;` — `res.data` is usually `undefined`
- ❌ `if (response.data) response.data = transformKeys(response.data)`
- ✅ `const res = await apiGet(ep); return transformKeys(res);`
- ✅ Defensive shape-probe when the payload wraps a list: `const list = Array.isArray(res) ? res : res?.notifications || res?.items || [];`

On failure the client **throws** `Error` with `.status`, `.statusCode`, `.code`, `.details`, `.data`, `.isNetworkError` — utils re-throw; pages catch and `toast.error(...)`.

## Recipe: add an API-backed feature (do these 3 steps in order)

**Step 1 — endpoint constant** in `src/config/api.js` under the right `API_ENDPOINTS.<DOMAIN>` block (paths are relative to `/api/v1`, no prefix):

```javascript
ARCHIVE: (id) => `/notifications/${id}/archive`,
ARCHIVED: '/notifications/archived',
```

**Step 2 — util function** in the matching `src/utils/<feature>Api.js`. Backend is snake_case, UI is camelCase; convert **only in this layer**. Each util file defines its **own local** `transformKeys` (snake→camel) and `transformToSnake` (camel→snake) helpers — there is no shared import; copy them from `src/utils/tasksApi.js` when creating a new util file.

```javascript
export const archiveNotification = async (notificationId) => {
  try {
    const response = await apiPost(API_ENDPOINTS.NOTIFICATIONS.ARCHIVE(notificationId));
    return transformKeys(response); // response is the payload, NOT an envelope
  } catch (error) {
    console.error('Error archiving notification:', error);
    throw error;
  }
};
```

Query params: build with `URLSearchParams`, converting names to snake_case by hand (`filters.dueDateFrom` → `params.append('due_date_from', ...)`).
Request bodies: `apiPost(endpoint, transformToSnake(data))`.
File uploads: pass a `FormData` instance directly — the client strips `Content-Type` so the browser sets the multipart boundary. Generic uploads go to `API_ENDPOINTS.FILES.UPLOAD`.

**Step 3 — wire the page**: `useState` + `useEffect` calling the util, `setLoading` in `finally`, `toast.error` from `react-toastify` in `catch`, theme via `const { isDarkMode } = useTheme()`. Exemplar: `src/app/dashboard/notifications/page.js`. Roles/permissions: `const { isAdmin, can } = useAuth()` from `@/hooks/useAuth` (matrix in `src/utils/permissions.js`).

**Never** call `fetch` directly in a page or util, and never hardcode URL strings outside `src/config/api.js`.

## Debugging playbook (in order — don't skip to code changes)

1. **Read the console tags first.** The client logs every call: `[API REQUEST]`, `[API RESPONSE]`, `[API ERROR RESPONSE]`, `[API PERMISSION]` (401/403), `[API NETWORK ERROR]` (backend unreachable/CORS — not a code bug).
2. **"Something went wrong. Please try again."** = the backend error body had no usable message. Origin: `errorMessage` default in `src/lib/api/client.js` (search that string). Check the Network tab for the real status/body.
3. **401s:** the client silently refreshes the token once and retries (`refreshAccessToken` in client.js). If refresh fails it clears `access_token`/`refresh_token`/`user_info` and route guards send the user to `/login`. A "random logout" usually means an expired refresh token, not a frontend bug.
4. **Unexpected redirect to `/choose-profile`:** backend returned error code `KYC_REQUIRED`; the client redirects globally. Not a routing bug.
5. **Empty list but no error:** almost always a payload-shape mismatch — the page expected `response.data` / wrong key. Log the raw util return; remember the envelope is already unwrapped (see trap above).
6. **Data looks right in Network tab but undefined in UI:** missing `transformKeys` (UI reading `is_read` as `isRead` or vice versa). Some legacy items carry both `read` and `isRead` — normalize with `n.read ?? n.isRead ?? false`.

## Quick reference

| Need | File |
|---|---|
| Endpoint constants (all domains) | `src/config/api.js` (`API_ENDPOINTS`) |
| HTTP helpers, envelope, auth, refresh, error shape | `src/lib/api/client.js` |
| Cleanest util template (CRUD + case mapping) | `src/utils/tasksApi.js` |
| Page template (tabs, loading, toasts, live updates) | `src/app/dashboard/notifications/page.js` |
| Roles & permissions | `src/hooks/useAuth.js`, `src/utils/permissions.js` |
| Route guard (client-side only) | `src/components/auth/SecureRoute.jsx` |
| UI primitives | `src/components/ui/` (Button, Modal, Select, GlassCard, StatusBadge) |
| Feature → route → util map | `CLAUDE.md` §5 |

## Common mistakes

| Mistake | Fix |
|---|---|
| `response.data.x` in a util | Client already unwrapped; use `response.x` |
| Importing transformKeys from another util | Each util has local copies; duplicate them |
| camelCase keys in request body / query params | `transformToSnake(body)`; snake_case param names |
| `fetch()` in a page | Route through util + `apiGet/apiPost/...` |
| Setting `Content-Type` for FormData | Pass FormData as-is; client handles it |
| Adding TS, SSR, or an API route | JS only; static export — client-side data fetching after mount |
| Treating `[API NETWORK ERROR]` as a code bug | Backend down/CORS; degrade gracefully |
