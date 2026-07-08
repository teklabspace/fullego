# Backend request — admin force-release / force-refund escrow endpoints

**Context:** The admin "Escrow & Disputes" table now shows **Release** and **Refund**
buttons on every escrow whose funds are held (`funded`) or `disputed`.

- For **disputed** escrows the buttons already work — they call the existing
  `POST /admin/disputes/{escrow_id}/resolve` (`{ resolution: "release" | "refund", reason }`).
- For **funded (non-disputed)** escrows there is currently **no admin path**:
  `/marketplace/escrow/{id}/release` is seller-only (admins get 401), so an admin
  can't push a stuck escrow that never got disputed. This is the "open item #2"
  from the escrow spec. Please add the two endpoints below.

The frontend is already wired to them (`ADMIN.ESCROW_RELEASE` / `ESCROW_REFUND`)
and degrades gracefully (shows "not available yet") while they 404.

---

## 1. Force-release to seller

```
POST /api/v1/admin/escrow/{escrow_id}/release
Auth: Bearer <admin access_token>   (non-admin → 403 FORBIDDEN)
Body (optional): { "reason": "…" }
```

- Allowed from status **`funded`** (and ideally **`disputed`**, so it doubles as a
  dispute resolution). Moves the escrow to **`released`** and pays the seller via Stripe.
- Reject from `pending` / `released` / `refunded` with `400` (see errors).
- Notify **both** parties (same push used by the dispute-resolve flow).
- Response `data`: the updated escrow object — same shape as `GET /admin/escrow/{id}`
  (so the UI can refresh the row). At minimum `{ id, status: "released", released_at, … }`.

## 2. Force-refund to buyer

```
POST /api/v1/admin/escrow/{escrow_id}/refund
Auth: Bearer <admin access_token>   (non-admin → 403 FORBIDDEN)
Body (optional): { "reason": "…" }
```

- Allowed from status **`funded`** or **`disputed`**. Moves the escrow to **`refunded`**
  and returns the money to the buyer via Stripe.
- Reject from `pending` / `released` / `refunded` with `400`.
- Notify **both** parties.
- Response `data`: the updated escrow object (`{ id, status: "refunded", … }`).

---

## Shared expectations

- **Envelope:** standard `{ success, status_code, message, data }`; errors as
  `{ success: false, status_code, message, error: { code, details } }`.
- **Error cases** (branch on `error.code`):
  - Non-admin → `403` `FORBIDDEN`.
  - Escrow not found → `404` `NOT_FOUND`.
  - Wrong state (e.g. release a `pending`/already-terminal escrow) → `400`
    with a clear message + code (e.g. `INVALID_ESCROW_STATE`).
- **Idempotency:** a second call on an already `released`/`refunded` escrow should
  `400` (not double-pay / double-refund).
- **Audit:** persist the admin actor id + the optional `reason` on the escrow record.

## Optional (nice-to-have)

- Add `listing_title` + `thumbnail_url` to each item in `GET /marketplace/offers/my`
  (the escrow spec's open item #1) so the buyer's offers list can show images before
  the escrow card opens.
