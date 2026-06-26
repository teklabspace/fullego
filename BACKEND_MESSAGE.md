# Backend Team — Subscription & Plans Sync

Hi team, frontend has been updated. Please confirm the following so the integration works end-to-end.

---

## 1. Plan IDs & Prices

We are now using these fixed plan IDs and prices on the frontend. Please confirm the backend uses the same IDs and returns matching price values:

| Plan ID    | Monthly Price | Annual Price | Notes                  |
|------------|--------------|-------------|------------------------|
| `starter`  | $49          | $470        | ~20% annual discount   |
| `pro`      | $299         | $2,870      | ~20% annual discount   |
| `premium`  | $899         | $8,630      | ~20% annual discount   |
| `concierge`| Custom       | Custom      | Contact sales only     |

---

## 2. `GET /api/v1/subscriptions/plans` — Response Shape

The frontend expects one of these two shapes. Which one does the backend return?

**Option A:**
```json
{ "plans": [ { "id": "starter", "name": "Starter", "price": 49, ... } ] }
```

**Option B:**
```json
{ "data": [ { "id": "starter", "name": "Starter", "price": 49, ... } ] }
```

If neither, please share the actual shape so we can update the transform in `subscriptionsApi.js`.

---

## 3. `POST /api/v1/subscriptions` — Create Subscription

We send:
```json
{ "plan_id": "pro", "billing_cycle": "monthly" }
```

Please confirm:
- Does `billing_cycle` accept `"monthly"` and `"annual"`?
- What does the response look like on success?
- If payment action is required (e.g. Stripe 3DS), does the response include `requires_action: true` and `client_secret`?

---

## 4. `PUT /api/v1/subscriptions/upgrade` — Change Plan

We send:
```json
{ "plan_id": "premium", "billing_cycle": "annual" }
```

Confirm this endpoint handles both upgrades and downgrades, or is there a separate downgrade endpoint?

---

## 5. `POST /api/v1/subscriptions/cancel` — Cancel

No body sent. Confirm this cancels the subscription tied to the authenticated user's token — no subscription ID needed.

---

## 6. Admin & Advisor Roles — No Subscription Required

**Important:** On the frontend, `admin` and `advisor` role accounts now skip the subscription UI entirely. They see a message: "Your account does not require a subscription."

**Please confirm:** Does the backend also skip subscription enforcement for admin/advisor roles? We want to make sure:
- `GET /api/v1/subscriptions` does not return a 404 or error for admin/advisor accounts (or we handle it gracefully)
- `POST /api/v1/subscriptions` rejects if an admin/advisor tries to subscribe (as a safety check)

---

## 7. Admin Subscription Management — `PATCH /api/v1/admin/subscriptions/{id}/plan`

The admin page sends:
```json
{ "plan": "pro", "reason": "optional reason string" }
```

But the user-facing API uses `plan_id` + `billing_cycle` separately. Is the admin endpoint intentionally different, or should it also accept `plan_id` + `billing_cycle`? Please clarify the expected shape.

---

## 8. Payment Methods

We have `ADD_PAYMENT_METHOD` and `DELETE_PAYMENT_METHOD` endpoints configured but no UI flow yet. Please share:
- The expected request body for adding a payment method
- Whether you're using Stripe (and if so, do we need to collect a `paymentMethodId` from Stripe.js on the frontend first?)

---

Thanks — please reply with confirmation or corrections on any of the above.
