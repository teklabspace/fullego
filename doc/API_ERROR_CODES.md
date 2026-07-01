# API Error Codes & Response Envelope

Single source of truth for the `error.code` values and their HTTP status mapping.
The machine-importable version lives in [`api_error_codes.js`](./api_error_codes.js) —
the frontend imports that verbatim; this file is the human-readable reference.

## Envelope shape

**Success**
```json
{ "success": true, "status_code": 200, "message": "...", "data": { } }
```
**No data** — same shape with `"data": null` and a real message (never a bare `null`).

**Error**
```json
{
  "success": false,
  "status_code": 404,
  "message": "We couldn't find an active subscription for this account.",
  "error": { "code": "SUBSCRIPTION_NOT_FOUND", "details": [] }
}
```
`status_code` in the body always equals the HTTP status. Branch on `error.code`
for specific cases, `status_code` for generic handling.

## Generic codes (status-derived)

Returned by the global exception handlers when an error carries no domain code.

| code | HTTP | meaning |
|------|------|---------|
| `BAD_REQUEST` | 400 | Malformed or invalid request |
| `UNAUTHORIZED` | 401 | Missing/invalid auth |
| `PAYMENT_REQUIRED` | 402 | Payment needed to proceed (e.g. Stripe intent could not be created) |
| `FORBIDDEN` | 403 | Authenticated but not allowed |
| `NOT_FOUND` | 404 | Resource not found |
| `METHOD_NOT_ALLOWED` | 405 | Wrong HTTP method for the route |
| `CONFLICT` | 409 | Conflicts with current state |
| `VALIDATION_ERROR` | 422 | Field validation failed — see `error.details` |
| `RATE_LIMITED` | 429 | Too many requests |
| `INTERNAL_ERROR` | 500 | Unhandled server error (internals hidden in prod) |
| `SERVICE_UNAVAILABLE` | 503 | Temporary outage |
| `ERROR` | (varies) | Ultimate fallback for an unmapped HTTP status |

## Domain codes — Subscriptions / checkout

| code | HTTP | raised when |
|------|------|-------------|
| `PLAN_INVALID` | 400 | `plan_id` is not a known plan |
| `BILLING_CYCLE_INVALID` | 400 | `billing_cycle` is not `"monthly"` or `"annual"` |
| `PLAN_REQUIRES_CUSTOM_PRICING` | 400 | Plan has no self-serve price (contact sales) |
| `SUBSCRIPTION_ALREADY_EXISTS` | 409 | Create called while an `active`/`past_due` sub exists → use the upgrade flow |
| `SUBSCRIPTION_NOT_FOUND` | 404 | Renew/upgrade with no subscription record |
| `NO_ACTIVE_SUBSCRIPTION` | 400 | Cancel called with nothing active |
| `SUBSCRIPTION_ALREADY_ACTIVE` | 400 | Renew called on an already-active sub |
| `SUBSCRIPTION_NOT_ACTIVE` | 400 | Upgrade/downgrade requires an active sub |

## Validation error details

`422 VALIDATION_ERROR` always includes a flattened `error.details`:
```json
{
  "success": false, "status_code": 422,
  "message": "Some of the information provided is invalid. Please check the highlighted fields.",
  "error": {
    "code": "VALIDATION_ERROR",
    "details": [ { "field": "billing_cycle", "message": "field required" } ]
  }
}
```
`field` is dot-joined for nested inputs (e.g. `items.0.price`); the leading
`body`/`query`/`path` segment is stripped.

## Adding new domain codes

1. Pick a stable `SCREAMING_SNAKE_CASE` name.
2. Pass it at the raise site: `raise BadRequestException("...", code="MY_CODE")`
   (or `NotFoundException(..., code=...)`, `ConflictException(..., code=...)`).
3. Add it to [`api_error_codes.js`](./api_error_codes.js) **and** the table above,
   in the same PR, so client and server never drift.

## Backend mirror (where these live)
- `app/core/responses.py` — `STATUS_TO_CODE` (generic), `error_envelope`, `flatten_validation_errors`
- `app/core/exceptions.py` — per-exception default `code`
- per-router `raise ...(code=...)` — domain codes
