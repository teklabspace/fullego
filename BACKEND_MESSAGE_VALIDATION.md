# BACKEND_MESSAGE — Input validation gaps

**Date:** 20 Aug 2026
**From:** Frontend
**Scope:** Server-side validation for every field the frontend now validates client-side.

---

## Why this exists

The frontend now enforces per-field rules on every form (numeric fields accept
only numbers, name fields only letters, everything bounded to the column it
lands in). Those rules were derived by reading `app/schemas/*.py`, the inline
Pydantic models in `app/api/v1/*.py`, and `app/models/*.py`.

Doing that turned up a structural gap: **the API validates almost nothing.**
Across every schema in the service the complete set of constraints is:

| Constraint | Where |
|---|---|
| `EmailStr` | `user.py` — email fields |
| `min_length=1` | `user.py` — `first_name`, `last_name` on `UserCreate` |
| `max_length=500` | `user.py` — `avatar_url` on `UserUpdate` |
| `acquisition_date` guard | `asset.py` — `_AcquisitionDateGuard` |

Everything else — passwords, amounts, quantities, percentages, phone numbers,
and every string field in the product — is unconstrained at the schema layer.

Client-side rules are a UX improvement, not a control. Anything hitting the API
directly bypasses them entirely.

---

## 1. Over-length strings return 500, not 422

This is the highest-impact item.

The **DB column widths are the real limits**, and Pydantic doesn't know about
them. A value longer than the column reaches the `INSERT`/`UPDATE` and Postgres
raises `value too long for type character varying(N)` — which surfaces to the
user as a generic server error rather than a field-level message.

Column widths currently unprotected include:

| Table.column | Width | Sent by |
|---|---|---|
| `users.first_name` / `last_name` | `String(100)` | register, profile update |
| `users.phone` | `String(20)` | register, profile update |
| `users.email` | `String(255)` | register, profile update |
| `assets.name` | `String(255)` NOT NULL | asset create/update |
| `assets.symbol` | `String(50)` | asset create/update |
| `assets.location` | `String(255)` | asset create/update |
| `assets.currency` | `String(3)` NOT NULL | asset create/update |
| `investment_goals.name` | `String(255)` NOT NULL | goal create |
| `investment_goals.notes` | `String(1000)` | goal create/adjust |
| `support_tickets.subject` | `String(255)` NOT NULL | ticket create |
| `entities.name` | `String(255)` NOT NULL | entity create |
| `entities.jurisdiction` | `String(100)` | entity create |
| `entities.registration_number` | `String(100)` | entity create |
| `entity_persons.phone` | `String(50)` | entity person create |
| `orders.symbol` | `String(50)` NOT NULL | order placement |

There are 57 more `String(255)`, 38 `String(500)`, 26 `String(100)` and 25
`String(50)` columns in `app/models/` on the same footing.

**Ask:** add `max_length` to the matching Pydantic fields so these come back as
422s with a field name. The frontend already caps input at exactly these widths,
so no legitimate request changes behaviour.

---

## 2. Passwords can exceed bcrypt's 72-byte limit

`app/core/security.py::hash_password` passes the raw password straight to
passlib/bcrypt:

```python
def hash_password(password: str) -> str:
    try:
        return pwd_context.hash(password)
    except Exception as e:
        password_bytes = password.encode('utf-8')
        ...
        hashed = bcrypt.hashpw(password_bytes, salt)
```

bcrypt hashes at most **72 bytes**. Depending on the installed bcrypt version a
longer password either raises (caught by that bare `except` and retried down the
same path) or is **silently truncated**. Silent truncation is the dangerous
case: two different passwords sharing a 72-byte prefix both authenticate.

Note this is **bytes, not characters** — 40 accented characters is 80 bytes.

Also, `UserCreate.password` has **no minimum length**. The 8-character rule is
frontend-only today; the API accepts a one-character password.

**Ask:**

```python
password: str = Field(..., min_length=8, max_length=72)
```

plus an explicit byte-length check before hashing (a UTF-8 password under 72
*characters* can still exceed 72 *bytes*). The frontend now enforces both.

---

## 3. Money and quantity fields accept any number

No amount field anywhere has a `gt`/`ge` constraint, so the API currently
accepts negative deposits, zero-quantity orders, and values that overflow the
column.

The column shapes the frontend now enforces:

| Shape | Meaning | Fields |
|---|---|---|
| `Numeric(20, 2)` | ≤18 integer digits, ≤2 decimals | `assets.current_value`, `estimated_value`, `purchase_price`, `payments.amount`, `orders.price`, `orders.stop_price`, `investment_goals.target_amount`, `current_value`, `monthly_contribution` |
| `Numeric(20, 8)` | ≤12 integer digits, ≤8 decimals | `orders.quantity`, `filled_quantity`, `investment_goals.target_quantity`, `current_quantity` |
| `Numeric(5, 2)` | 0–999.99 | `asset_ownership.ownership_percentage` |

Exceeding the precision raises `numeric field overflow` at the DB — another 500
where a 422 belongs.

**Ask:** `Field(..., gt=0)` on amounts that must be positive (deposits, order
quantities, goal targets), `ge=0` where zero is meaningful, and `max_digits` /
`decimal_places` on the `Decimal` fields to match the columns.

Two behaviours the frontend deliberately does **not** block, because the API
allows them — flagging in case either is unintentional:

- **Asset values are optional.** `resolve_initial_values()` writes `0.00` into
  both `current_value` and `estimated_value` when neither is supplied, so the
  wizard lets a category's value fields stay empty rather than forcing a number
  the user doesn't have.
- **`ownership_percentage` is `Numeric(5, 2)`**, which permits up to `999.99`.
  The frontend caps percentage inputs at 100. If >100% ownership is genuinely
  invalid, the column and a schema constraint should say so.

---

## 4. Phone numbers are unvalidated

`users.phone` is `String(20)` with no format constraint, so `"not a phone"` is
stored happily. The frontend now allows digits plus `+ ( ) - . space`, requires
7–15 digits (E.164), and caps at 20 characters.

Worth noting the inconsistency: `entity_persons.phone` is `String(50)` while
`users.phone` is `String(20)`. If these should match, the frontend cap will need
to follow.

**Ask:** a shared `PhoneStr` annotated type, or `Field(None, max_length=20,
pattern=r"^\+?[\d\s()\-.]+$")`.

---

## 5. Email accepts more than the frontend now sends

`EmailStr` (email-validator) requires a dotted domain, so `a@b` and
`user@localhost` already 422. The frontend rule was written to match that
exactly — worth knowing if `EmailStr`'s config ever changes, because the two
would then disagree.

---

## Frontend reference

The rules and the reasoning behind each limit live in:

- `src/utils/validation/rules.js` — primitives, with the backend origin of every
  constant in comments
- `src/utils/validation/fieldSpecs.js` — field-name → rule resolution, and
  `COMMON_SPECS` with the column width noted per entry
- `src/utils/validation/rules.test.js` + `fieldSpecs.test.js` — 125 unit tests
  (`npm test`) pinning the behaviour, including the precision and byte-length
  edge cases above

If any constraint in this document is added server-side with **different**
numbers than the frontend uses, tell us and we will realign — the frontend
should never be stricter than the API, or it blocks requests that would succeed.
