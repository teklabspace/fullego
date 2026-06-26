# Backend Bug Report — 500 Errors & Empty CRM Users (BUG-01 → BUG-05)

**From:** Frontend team
**Repo context:** This is the frontend SPA only. All five issues originate in the
FastAPI backend (`akunuba-backend.onrender.com`, base `/api/v1`). For each bug
below we list the **exact request the frontend sends** (verified against the
current frontend source), the **observed failure**, and a **root-cause
hypothesis** to investigate. None of these are fixable from the frontend repo —
the frontend payloads are well-formed; the backend is throwing during processing
(or returning empty data for BUG-05).

> Note on status codes: a `500` means the request body passed validation and the
> backend then crashed. These are unhandled exceptions, not validation (`422`)
> problems. The fix is server-side error handling + correcting the underlying
> logic.

---

## BUG-01 — Asset creation fails with datetime comparison error

- **Endpoint:** `POST /api/v1/assets`
- **Status:** `500 Internal Server Error` (datetime comparison exception)
- **Frontend source:** `src/app/dashboard/assets/add/page.js` → `createAsset()` in `src/utils/assetsApi.js`

### Exact payload the frontend sends (snake_case after transform)
```json
{
  "name": "Rolex Submariner",
  "category": "Watches",
  "category_group": "Assets",
  "description": "...",
  "location": "...",
  "estimated_value": 15000,
  "current_value": 15000,
  "condition": "Excellent",
  "ownership_type": "Sole",
  "acquisition_date": "2024-01-15",
  "purchase_price": 12000,
  "currency": "USD",
  "valuation_type": "manual",
  "photos": ["<uuid>"],
  "images": ["<uuid>"],
  "documents": ["<uuid>"],
  "specifications": { "...category-specific fields, including date fields as \"YYYY-MM-DD\"..." }
}
```

Key point: **date fields come from `<input type="date">`, so they are
timezone-naive date-only strings like `"2024-01-15"`** (this includes
`acquisition_date` and any date field inside `specifications`).

### Root-cause hypothesis
The backend parses `acquisition_date` (and/or `purchase_date` etc.) into a
**timezone-naive** `datetime`, then compares it against a **timezone-aware**
value such as `datetime.now(timezone.utc)` — e.g. a "acquisition date cannot be
in the future" validation. Python raises:

```
TypeError: can't compare offset-naive and offset-aware datetimes
```

→ unhandled → `500`.

### Suggested backend fix
- Normalize all incoming datetimes to a single convention (UTC-aware) **before**
  any comparison, in the serializer/model layer.
- For pure date fields, parse to `date` (not `datetime`) and compare against
  `date.today()`, or attach `tzinfo=timezone.utc` consistently.
- Wrap creation in error handling so a bad/edge date returns a descriptive `422`,
  not a `500`.

### Frontend mitigation available (only if you ask us to)
We can send `acquisition_date` as a tz-aware ISO string
(`"2024-01-15T00:00:00+00:00"`) instead of `"2024-01-15"`. This only helps if the
backend parses via `datetime.fromisoformat`/pydantic `datetime`; it does **not**
fix the underlying inconsistency, so the backend fix is still required.

---

## BUG-02 — `GET /assets/ai/usage` returns 500

- **Endpoint:** `GET /api/v1/assets/ai/usage`
- **Status:** `500 Internal Server Error`
- **Frontend source:** `getAiUsage()` in `src/utils/assetsApi.js` (consumed by `src/app/dashboard/assets/[id]/AssetDetailClient.js`)

### Request
Plain authenticated GET. **No query params, no body.** There is no frontend input
that could cause this.

### Expected response shape (what the frontend reads, camelCase)
```json
{
  "plan": "pro",
  "period": "2026-06",
  "aiAppraisals": { "limit": 10, "used": 3, "remaining": 7 },
  "aiReviews":    { "limit": 10, "used": 1, "remaining": 9 }
}
```
(`limit`/`remaining` may be `null` to mean unlimited.)

### Root-cause hypothesis
Server-side only. Likely candidates:
- Usage-tracking row missing for the user / current billing period and the code
  dereferences `None` (no record → `NoneType` attribute access).
- The user has no active plan, so a plan lookup returns `None` and limits are
  computed off it.
- Serialization error building the `ai_appraisals` / `ai_reviews` objects.

### Suggested backend fix
- Return zeroed usage (`used: 0`, computed `remaining`) when no usage record
  exists, instead of crashing.
- Add detailed logging on this endpoint and return a descriptive error.

---

## BUG-03 — Asset appraisal creation returns 500

- **Endpoint:** `POST /api/v1/assets/{asset_id}/appraisals`
- **Status:** `500 Internal Server Error`
- **Frontend source:** `runAiAppraisal()` / `requestAssetAppraisal()` in `src/utils/assetsApi.js`
- **Reproduced asset id (from report):** `b30a06cf-bdbe-4e08-ba23-e5f526324b2a`

### Exact payload the frontend sends
For the AI appraisal path:
```json
{ "appraisal_type": "API" }
```
For a manual appraisal request, the transformed appraisal form fields
(snake_case). Both are well-formed.

### Root-cause hypothesis
Server-side. Likely candidates, in order:
1. **Same datetime issue as BUG-01** — appraisal creation stamps/compares
   `created_at` / `valuation_date` mixing naive and aware datetimes.
2. AI provider call (for `appraisal_type: "API"`) fails or returns an unexpected
   shape and the exception isn't caught (note: the documented contract is `403`
   for quota and `503` for AI unavailable — a `500` means an *uncaught* path).
3. A DB constraint / relationship error when inserting the appraisal row (e.g.
   required FK, enum value, or the AI usage counter increment — see BUG-02).

### Suggested backend fix
- Reproduce with the asset id above and capture the stack trace.
- Standardize datetime handling (shared with BUG-01).
- Ensure AI-provider failures map to the documented `403`/`503`, never `500`.

---

## BUG-04 — Admin subscription plan update returns 500

- **Endpoint:** `PATCH /api/v1/admin/subscriptions/{subscription_id}/plan`
- **Status:** `500 Internal Server Error` — body: `{ "detail": "Internal server error" }`
- **Frontend source:** `updateSubscriptionPlan(id, plan, reason)` in `src/utils/adminApi.js`, called from `src/app/dashboard/admin/subscriptions/page.js`

### Exact payload the frontend sends
```json
{ "plan": "monthly", "reason": "Customer request" }
```
(`reason` is omitted entirely when blank.)

### ⚠️ Likely contributing mismatch — please confirm the contract
The admin page offers **`plan ∈ ['free', 'monthly', 'annual']`**
(`src/app/dashboard/admin/subscriptions/page.js:13`). **Those look like billing
cycles, not plan tiers.** Elsewhere the product's plan IDs are
`starter` / `pro` / `premium` / `concierge` (see `BACKEND_MESSAGE.md`), and the
user-facing upgrade endpoint takes `plan_id` + `billing_cycle` **separately**:

```json
// PUT /api/v1/subscriptions/upgrade  (user-facing)
{ "plan_id": "premium", "billing_cycle": "annual" }
```

So there are three open questions:
1. What field(s) does `PATCH /admin/subscriptions/{id}/plan` actually expect —
   `plan`? `plan_id`? `plan_id` + `billing_cycle`?
2. What is the valid value set — tiers (`starter`/`pro`/...) or cycles
   (`monthly`/`annual`)? The frontend currently sends cycles.
3. If the backend receives an unrecognized value (e.g. `"monthly"` when it wants
   a tier), does it crash (e.g. `PlanType("monthly")` → `ValueError`, or a
   `None` plan lookup that's then dereferenced)? **That would explain the 500.**

### Root-cause hypothesis
Backend receives a `plan` value it can't resolve to a known plan/price and
crashes instead of returning a `400/422`. Once we agree on the contract above,
the frontend will send the correct field/values **and** the backend should
validate + reject unknown values gracefully.

### Action
Please reply with the exact expected request shape and value set for this admin
endpoint. We will align the frontend dropdown (`PLAN_OPTIONS`) and the
`updateSubscriptionPlan` body to match. (This is the one bug where the frontend
likely needs a coordinated change once the contract is confirmed.)

---

## BUG-05 — CRM assignment user dropdown is empty

- **Endpoint:** `GET /api/v1/crm/users`
- **Status:** Request succeeds but returns no usable users → dropdown stays empty
  (the original report's "PATCH .../plan" endpoint line appears to be a copy-paste
  error; the affected call is `GET /crm/users`).
- **Frontend source:** `getCrmUsers()` in `src/utils/crmApi.js`, consumed by `src/components/dashboard/AssignmentModal.jsx`

### Request
```
GET /api/v1/crm/users
```
Optional query params supported by the frontend: `?role=<role>&team=<team>`
(none are sent by the assignment modal — it requests the full list).

### Frontend is already defensive
`AssignmentModal.jsx` normalizes **every** plausible response shape — a bare
array, or wrapped under `data` / `users` / `items` / `results` — and maps
`id/userId`, `name/userName/firstName+lastName`, `email`. So the dropdown is
empty only if the endpoint returns an **empty list**, an **error**, or objects
**without an `id`** (each `<option>` keys off `user.id`).

### Root-cause hypothesis (one of)
1. `GET /crm/users` returns an empty array for this account (no users match the
   backend's CRM-eligibility filter, e.g. it only returns `advisor`/`admin` users
   and there are none, or it scopes to a team the caller isn't in).
2. Endpoint returns `401/403` for the caller's role (frontend logs the error and
   shows a "Could not load CRM users" toast).
3. Returned user objects omit an `id` field, so options render with no value.

### Suggested backend fix / info needed
- Confirm what population `GET /crm/users` is meant to return and which roles can
  call it.
- Verify it returns each user with a stable `id`, a display `name` (or
  `first_name`/`last_name`), and `email`.
- Confirm whether `role` / `team` filters are required or optional.

---

## BUG-06 — Reading a single asset (and its appraisals) returns 500

- **Endpoints:**
  - `GET /api/v1/assets/{asset_id}` → `500 Internal Server Error`
  - `GET /api/v1/assets/{asset_id}/appraisals` → `500 Internal Server Error`
- **Frontend source:** `getAsset()` / `getAssetAppraisals()` in `src/utils/assetsApi.js`, consumed by `src/app/dashboard/assets/[id]/AssetDetailClient.js`. UI shows **"Error loading asset — Failed to fetch"**.
- **Reproduced asset id:** `437c8628-6582-4ccb-90e1-f59eacd78cd8`

### Request
Plain authenticated GETs. **No query params, no body** (`getAsset` calls
`GET_BY_ID(assetId)` with nothing else). There is no frontend input that could
cause this — the asset id is a valid UUID the backend itself returned from
`POST /assets`.

### Why this is severe
The asset was **created successfully** (`POST /assets` returned this id), but it
can no longer be **read back**. So a freshly created asset is un-viewable: the
detail page, the appraisal list, and the appraisal-creation flow all fail. This
is worse than BUG-03 alone — the whole detail surface for the asset is dead.

### Root-cause hypothesis
Same family as BUG-01 / BUG-03 — a **read/serialization-time datetime issue**.
The most likely sequence:
1. `POST /assets` stored a date field (e.g. `acquisition_date`, or a date inside
   `specifications`) as a timezone-**naive** value.
2. On read, the backend serializes/compares it against a timezone-**aware** value
   (`datetime.now(timezone.utc)`), raising
   `TypeError: can't compare offset-naive and offset-aware datetimes` → uncaught
   → `500`.

Alternative: the failed appraisal write (BUG-03) left a partial/related row that
the asset read now joins against and chokes on. Worth checking whether the asset
read does an eager join to `appraisals`.

### Suggested backend fix
- Reproduce a `GET /assets/{id}` with the id above and capture the stack trace.
- Standardize datetime handling on the **read** path too (shared root cause with
  BUG-01) — parse pure dates to `date`, or attach `tzinfo=timezone.utc`
  consistently before any comparison/serialization.
- Wrap asset read in error handling so a single bad row returns a descriptive
  error, never a bare `500`.

---

## Summary table

| Bug | Endpoint | Frontend payload OK? | Owner |
|-----|----------|----------------------|-------|
| BUG-01 | `POST /assets` | ✅ (sends naive dates by design) | Backend (datetime handling) |
| BUG-02 | `GET /assets/ai/usage` | ✅ (no input) | Backend |
| BUG-03 | `POST /assets/{id}/appraisals` | ✅ | Backend |
| BUG-04 | `PATCH /admin/subscriptions/{id}/plan` | ⚠️ value set unconfirmed (`free/monthly/annual`) | Backend + coordinated FE change |
| BUG-05 | `GET /crm/users` | ✅ (FE handles all shapes) | Backend (returns empty/error) |
| BUG-06 | `GET /assets/{id}` + `GET /assets/{id}/appraisals` | ✅ (parameterless GET) | Backend (read-path datetime/serialization) |

**The only item needing a frontend change is BUG-04**, and only after the backend
confirms the expected request shape and valid plan values for the admin endpoint.
