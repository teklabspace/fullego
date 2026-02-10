## Backend API Issues Discovered from Dashboard Integration

This document lists API issues that originate from the **backend**, based on errors seen while integrating the dashboard. Each section includes:

- **What fails on the frontend**
- **Exact endpoint and method**
- **Observed backend error**
- **Likely root cause (backend)**
- **Suggested backend fix**

---

### 1. `GET /api/v1/accounts/stats` – 500 Internal Server Error

- **Frontend caller**
  - File: `src/utils/accountsApi.js` → `getAccountStats()`
  - Used in: `src/app/dashboard/page.js` inside `fetchAllData` effect
- **Endpoint**
  - `GET /api/v1/accounts/stats`
- **Observed error (backend stack trace)**
  - Status: **500 Internal Server Error**
  - Trace (from backend logs):
    - `TypeError: can't subtract offset-naive and offset-aware datetimes`
    - Location: `app/api/v1/accounts.py`, line 551:
      - `account_age_days = (datetime.utcnow() - account.created_at).days`
- **Analysis (backend bug)**
  - `datetime.utcnow()` returns a **naive** datetime (no timezone info).
  - `account.created_at` is **offset-aware** (likely timezone-aware, from the DB).
  - Python does not allow subtracting naive and aware datetimes → raises `TypeError`.
- **Suggested backend fix**
  - Make both datetimes timezone-consistent. For example:
    - Use `datetime.now(timezone.utc)` instead of `datetime.utcnow()`:
      - `from datetime import datetime, timezone`
      - `now = datetime.now(timezone.utc)`
      - `account_age_days = (now - account.created_at).days`
    - Or convert `account.created_at` to naive UTC **or** ensure the ORM returns naive UTC consistently.
  - Add a test for `/accounts/stats` to verify it works for existing accounts with `created_at` set.
- **Frontend status**
  - Frontend is calling the endpoint correctly (simple GET, no body).
  - Error is purely backend-side and should be fixed there.

---

### 2. `GET /api/v1/payments/stats` – 405 Method Not Allowed

- **Frontend caller**
  - File: `src/utils/paymentsApi.js` → `getPaymentStats()`
  - Previously used in `src/app/dashboard/page.js` (dashboard data load).
- **Endpoint**
  - `GET /api/v1/payments/stats`
- **Observed error**
  - HTTP **405 Method Not Allowed**
  - Frontend log:
    - `GET /api/proxy/payments/stats 405 (Method Not Allowed)`
- **Analysis (backend issue)**
  - The route `/payments/stats` either:
    - Is not implemented on the backend, or
    - Exists with a different HTTP method (e.g. POST), or
    - Is blocked by router configuration (e.g. path conflict or missing method).
  - The frontend uses **GET**, consistent with `FRONTEND_API_DOCUMENTATION.md`.
- **Suggested backend fix**
  - Confirm route definition in backend (likely `app/api/v1/payments.py`):
    - Ensure there is a `@router.get("/stats")` handler.
  - If the backend is intentionally not exposing this endpoint yet:
    - Either implement it according to `FRONTEND_API_DOCUMENTATION.md`, or
    - Temporarily remove it from the public API docs so frontend doesn’t rely on it.
- **Frontend status**
  - Dashboard has been updated once to avoid depending on this endpoint.
  - If backend decides to fully support `/payments/stats`, frontend can re-enable it safely.

---

### 3. `GET /api/v1/assets/summary` – 422 Unprocessable Entity (UUID validation)

- **Frontend caller**
  - File: `src/utils/assetsApi.js` → `getAssetsSummary()`
  - Sometimes wired into dashboard data load.
- **Endpoint**
  - `GET /api/v1/assets/summary`
- **Observed error**
  - HTTP **422 Unprocessable Entity**
  - Validation error:
    - `path.asset_id: Input should be a valid UUID, invalid character: expected an optional prefix of 'urn:uuid:' followed by [0-9a-fA-F-], found 's' at 1`
- **Analysis (backend routing conflict)**
  - The error means the backend thinks the path segment `"summary"` is an `asset_id` parameter.
  - This usually happens when routing is defined like:
    - `GET /assets/{asset_id}`  (with `asset_id` as UUID)
    - **and** `/assets/summary` is either missing or registered *after* the param route.
  - FastAPI/Starlette will match `/assets/summary` against `/assets/{asset_id}`, then the UUID validator fails.
- **Suggested backend fix**
  - Ensure a dedicated route for summary exists and is registered **before** the parameterized route:
    - Example:
      - `@router.get("/assets/summary")`  → summary handler
      - `@router.get("/assets/{asset_id}")` → single asset handler
  - Alternatively:
    - Expose summary under a clearly separate path, e.g. `/assets/analytics/summary`.
  - Update OpenAPI / docs to reflect the actual supported endpoint.
- **Frontend status**
  - The frontend expects `GET /assets/summary` following `FRONTEND_API_DOCUMENTATION.md`.
  - Until backend routing is fixed, dashboard should avoid depending on this call (or handle 422 gracefully).

---

### 4. `GET /api/v1/portfolio/history` – HTML Error Page / Unexpected Response

- **Frontend caller**
  - File: `src/utils/portfolioApi.js` → `getPortfolioHistory(days)`
  - Used in `src/app/dashboard/page.js` to populate `HistoricalPerformanceGraph`.
- **Endpoint**
  - `GET /api/v1/portfolio/history?days=365`
- **Observed error**
  - Frontend receives an **HTML error page** instead of JSON:
    - The error contains the full HTML of the Akunuba global error page.
  - In logs:
    - `Failed to fetch portfolio history: Error: <!DOCTYPE html><html ...>`
- **Analysis (backend / proxy issue)**
  - The frontend expects JSON (per API docs), but the proxy (`/api/proxy/portfolio/history`) is getting HTML.
  - Likely causes:
    - Backend raised an unhandled exception and returned the global error page instead of a JSON error.
    - Or the proxy route is misconfigured and returns the Next.js error page instead of forwarding the backend response.
- **Suggested backend fix**
  - Verify that `/portfolio/history` is implemented and:
    - Returns **JSON** with history data or a structured error payload.
    - Does not return HTML on errors; use FastAPI `HTTPException` or a custom error handler that returns JSON.
  - Check whether `days` query param is validated correctly and not causing a 500.
  - Add tests for `/portfolio/history` to ensure:
    - 200 for valid requests.
    - Proper 4xx/5xx JSON error responses for invalid input or server errors.
- **Frontend status**
  - Frontend already wraps this call in `Promise.allSettled` and logs the error.
  - Once backend behavior is corrected (returning JSON), the dashboard chart will be able to use it directly.

---

### 5. Summary of Backend vs Frontend Responsibility

**Backend-side issues (require backend changes):**

1. **`GET /accounts/stats` 500**
   - Naive vs aware datetime subtraction in `get_account_stats`.
2. **`GET /payments/stats` 405**
   - Endpoint/method not implemented or misconfigured.
3. **`GET /assets/summary` 422**
   - Route conflict: `/assets/{asset_id}` vs `/assets/summary`.
4. **`GET /portfolio/history` returning HTML error page**
   - Backend/proxy should return JSON error; likely an unhandled exception or route misconfig.

---

### 6. `GET /api/v1/compliance/dashboard` – 500 / 503 Errors (Enum + Connectivity)

- **Frontend caller**
  - File: `src/utils/complianceApi.js` → `getComplianceDashboard()`
  - Used in: `src/app/dashboard/compliance/page.js` in `useEffect(fetchDashboard)`
- **Endpoint**
  - `GET /api/v1/compliance/dashboard`
- **Observed errors**
  1. **500 Internal Server Error** with Postgres/SQLAlchemy stack trace:
     - `asyncpg.exceptions.InvalidTextRepresentationError: invalid input value for enum auditstatus: "PENDING"`
     - Propagated as:
       - `sqlalchemy.exc.DBAPIError: ... invalid input value for enum auditstatus: "PENDING"`
     - Query shown in trace:
       - `SELECT count(compliance_audits.id) AS count_1 FROM compliance_audits WHERE compliance_audits.account_id = $1::UUID AND compliance_audits.status = $2::auditstatus`
       - Parameters: `(UUID('...'), 'PENDING')`
  2. **503 Service Unavailable** from the frontend proxy:
     - Proxy error JSON:
       - `{ error: 'Proxy request failed', message: 'Failed to connect to backend at http://localhost:8000. Check if the server is running and accessible.' }`
- **Analysis (backend issues)**
  - **Enum mismatch:**
    - The `compliance_audits.status` column is defined as a Postgres enum `auditstatus`.
    - The database enum values likely use lowercase (e.g. `'pending'`, `'completed'`), but the query is sending uppercase `"PENDING"`.
    - Postgres enums are case-sensitive, so `"PENDING"` is not a valid `auditstatus` value → `InvalidTextRepresentationError`.
  - **Connectivity / availability:**
    - The 503 from the proxy indicates the backend at `http://localhost:8000` is not reachable (server down or wrong port) at times.
- **Suggested backend fixes**
  1. **Fix enum value handling:**
     - Ensure the query uses the exact enum values defined in Postgres:
       - either change the enum definition to include `"PENDING"`, or
       - normalize status strings before querying, e.g. `.upper()` or `.lower()` consistently, and match the DB enum:
         - If DB enum is lowercase: use `'pending'` instead of `'PENDING'`.
     - Check the `auditstatus` enum definition (migration/DDL) and align all code paths to those values.
  2. **Improve error handling in `get_compliance_dashboard`:**
     - Catch DB exceptions and return an informative JSON error to the client (rather than a raw stack trace).
  3. **Ensure backend availability:**
     - Confirm the backend server is consistently running on `http://localhost:8000`.
     - If the port or host differs in some environments, align `NEXT_PUBLIC_API_BASE_URL` accordingly.
- **Frontend status**
  - Frontend calls `GET /compliance/dashboard` via proxy and only displays a skeleton loader while `loading === true`.
  - After the request fails, the page shows the main layout with an error toast.
  - No change is required on the frontend to fix the 500/503; these are backend-side concerns.

**Frontend-side notes (already handled or adjusted):**

- Dashboard wraps all these calls in `Promise.allSettled` and logs but does not crash.
- Where endpoints are clearly not working (`/payments/stats`, `/assets/summary`), the dashboard can:
  - Either stop calling them (current approach for some endpoints), or
  - Keep calling but treat failures as “no data available”.

---

### 6. Recommended Backend Next Steps

1. **Fix `get_account_stats` datetime calculation** so `/accounts/stats` returns 200 with the documented JSON payload.
2. **Implement or correctly route `GET /payments/stats`** or remove it from the public API contract if it’s not needed.
3. **Add a non-parametric summary route under `/assets`** and ensure it doesn’t conflict with `/assets/{asset_id}`.
4. **Harden `/portfolio/history`** to:
   - Always return JSON.
   - Avoid sending HTML error pages to API clients.
5. After backend fixes, re-test the dashboard to confirm:
   - No 4xx/5xx for these endpoints under normal conditions.
   - Data shape matches `FRONTEND_API_DOCUMENTATION.md`.

