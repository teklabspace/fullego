# Preferences Tab APIs - Linked Accounts & Payment/Billing

Complete API documentation for the **Preferences** tab features:
- **Linked Accounts** (Banking integration)
- **Payment & Billing** (Payment methods, subscriptions, invoices)

**Base URL**: `/api/v1`  
**Authentication**: All endpoints require Bearer token in `Authorization` header

---

## Table of Contents

1. [Linked Accounts APIs](#linked-accounts-apis)
2. [Payment Methods APIs](#payment-methods-apis)
3. [Subscription APIs](#subscription-apis)
4. [Billing & Invoices APIs](#billing--invoices-apis)

---

## Linked Accounts APIs

### Get All Linked Accounts
**GET** `/banking/accounts`

**Headers**: `Authorization: Bearer <token>`

**Response** (200):
```json
[
  {
    "id": "uuid",
    "institution_name": "Chase Bank",
    "account_name": "Checking Account",
    "account_type": "banking",
    "balance": 5000.00,
    "currency": "USD"
  }
]
```

**Use Case**: Display list of linked bank accounts in preferences

---

### Get Linked Account Details
**GET** `/banking/accounts/{linked_account_id}`

**Headers**: `Authorization: Bearer <token>`

**Path Parameters**:
- `linked_account_id` (UUID, required): Linked account ID

**Response** (200):
```json
{
  "id": "uuid",
  "account_id": "uuid",
  "plaid_item_id": "item_xxx",
  "account_type": "banking",
  "institution_name": "Chase Bank",
  "account_name": "Checking Account",
  "account_number": "****4932",
  "routing_number": "021000021",
  "balance": 5000.00,
  "currency": "USD",
  "is_active": true,
  "last_synced_at": "2024-01-01T00:00:00Z",
  "created_at": "2024-01-01T00:00:00Z",
  "updated_at": "2024-01-01T00:00:00Z"
}
```

**Use Case**: Show detailed information for a specific linked account

---

### Create Plaid Link Token
**POST** `/banking/link-token`

**Headers**: `Authorization: Bearer <token>`

**Request Body**: None

**Response** (200):
```json
{
  "link_token": "link-sandbox-xxx"
}
```

**Use Case**: Initialize Plaid Link flow to connect a new bank account

**Frontend Flow**:
1. Call this endpoint to get `link_token`
2. Initialize Plaid Link with the token
3. User completes Plaid flow and receives `public_token`
4. Call `/banking/link` with `public_token` to complete linking

---

### Link Bank Account
**POST** `/banking/link`

**Headers**: `Authorization: Bearer <token>`

**Request Body**:
```json
{
  "public_token": "public-sandbox-xxx"
}
```

**Response** (200):
```json
{
  "message": "2 account(s) linked successfully"
}
```

**Use Case**: Complete account linking after Plaid flow

**Note**: Requires Annual subscription (returns 403 if not eligible)

---

### Refresh Account Balance
**POST** `/banking/accounts/{linked_account_id}/refresh`

**Headers**: `Authorization: Bearer <token>`

**Path Parameters**:
- `linked_account_id` (UUID, required): Linked account ID

**Request Body**: None

**Response** (200):
```json
{
  "message": "Account balance refreshed successfully",
  "balance": 5200.00,
  "currency": "USD"
}
```

**Use Case**: Manually refresh account balance from Plaid

---

### Sync Transactions
**POST** `/banking/sync/{linked_account_id}`

**Headers**: `Authorization: Bearer <token>`

**Path Parameters**:
- `linked_account_id` (UUID, required): Linked account ID

**Request Body**: None

**Response** (200):
```json
{
  "message": "Synced 15 new transactions"
}
```

**Use Case**: Manually sync transactions from Plaid (last 30 days)

---

### Get Account Transactions
**GET** `/banking/accounts/{linked_account_id}/transactions`

**Headers**: `Authorization: Bearer <token>`

**Path Parameters**:
- `linked_account_id` (UUID, required): Linked account ID

**Query Parameters**:
- `start_date` (string, optional): Start date (YYYY-MM-DD)
- `end_date` (string, optional): End date (YYYY-MM-DD)
- `limit` (integer, optional): Number of transactions (1-500, default: 50)

**Response** (200):
```json
{
  "transactions": [
    {
      "id": "uuid",
      "amount": -50.00,
      "currency": "USD",
      "description": "Coffee Shop",
      "category": "Food & Drink",
      "transaction_date": "2024-01-01T00:00:00Z",
      "created_at": "2024-01-01T00:00:00Z"
    }
  ],
  "count": 15
}
```

**Use Case**: Display transaction history for a linked account

---

### Disconnect Linked Account
**DELETE** `/banking/accounts/{linked_account_id}`

**Headers**: `Authorization: Bearer <token>`

**Path Parameters**:
- `linked_account_id` (UUID, required): Linked account ID

**Response** (200):
```json
{
  "message": "Account disconnected successfully"
}
```

**Use Case**: Remove/unlink a bank account from preferences

---

## Payment Methods APIs

### Get Payment Methods
**GET** `/payments/payment-methods`

**Headers**: `Authorization: Bearer <token>`

**Response** (200):
```json
[
  {
    "id": "pm_xxx",
    "type": "card",
    "card": {
      "brand": "visa",
      "last4": "4242",
      "exp_month": 12,
      "exp_year": 2025
    },
    "created": 1704067200
  }
]
```

**Use Case**: Display saved payment methods (cards) in billing preferences

---

### Add Payment Method
**POST** `/payments/payment-methods`

**Headers**: `Authorization: Bearer <token>`

**Request Body**:
```json
{
  "payment_method_id": "pm_xxx"
}
```

**Response** (200):
```json
{
  "id": "pm_xxx",
  "type": "card",
  "card": {
    "brand": "visa",
    "last4": "4242",
    "exp_month": 12,
    "exp_year": 2025
  },
  "created": 1704067200
}
```

**Use Case**: Add a new payment method (card) from Stripe payment element

**Frontend Flow**:
1. Use Stripe Elements to collect card details
2. Create payment method via Stripe.js: `stripe.createPaymentMethod(...)`
3. Get `payment_method_id` from Stripe
4. Call this endpoint with the `payment_method_id` to save it

---

### Remove Payment Method
**DELETE** `/payments/payment-methods/{method_id}`

**Headers**: `Authorization: Bearer <token>`

**Path Parameters**:
- `method_id` (string, required): Stripe payment method ID (e.g., `pm_xxx`)

**Response** (200):
```json
{
  "message": "Payment method removed successfully"
}
```

**Use Case**: Remove a saved payment method from preferences

---

## Subscription APIs

### Get Current Subscription
**GET** `/subscriptions`

**Headers**: `Authorization: Bearer <token>`

**Response** (200):
```json
{
  "id": "uuid",
  "plan": "monthly",
  "status": "active",
  "amount": 99.00,
  "currency": "USD",
  "current_period_end": "2024-02-01T00:00:00Z"
}
```

**Response** (200, if no subscription):
```json
null
```

**Use Case**: Display current subscription status and plan in billing preferences

---

### Create Subscription
**POST** `/subscriptions`

**Headers**: `Authorization: Bearer <token>`

**Request Body**:
```json
{
  "plan": "monthly",
  "discount_code": "EARLYBIRD"
}
```

**Valid Plans**:
- `"monthly"` - $99.00/month
- `"annual"` - $990.00/year (2 months free)

**Valid Discount Codes**:
- `"EARLYBIRD"` - 10% off
- `"ANNUAL20"` - 20% off annual

**Response** (201):
```json
{
  "id": "uuid",
  "plan": "monthly",
  "status": "active",
  "amount": 89.10,
  "currency": "USD",
  "current_period_end": "2024-02-01T00:00:00Z"
}
```

**Use Case**: Subscribe to a plan from billing preferences

---

### Cancel Subscription
**POST** `/subscriptions/cancel`

**Headers**: `Authorization: Bearer <token>`

**Request Body**: None

**Response** (200):
```json
{
  "message": "Subscription cancelled successfully"
}
```

**Use Case**: Cancel active subscription from preferences

---

### Renew Subscription
**POST** `/subscriptions/renew`

**Headers**: `Authorization: Bearer <token>`

**Request Body**: None

**Response** (200):
```json
{
  "message": "Subscription renewed successfully"
}
```

**Use Case**: Renew an expired subscription

---

### Upgrade/Downgrade Subscription
**PUT** `/subscriptions/upgrade`

**Headers**: `Authorization: Bearer <token>`

**Request Body**:
```json
{
  "monthly"
}
```
or
```json
{
  "annual"
}
```

**Response** (200):
```json
{
  "id": "uuid",
  "plan": "annual",
  "status": "active",
  "amount": 990.00,
  "currency": "USD",
  "current_period_end": "2025-01-01T00:00:00Z"
}
```

**Use Case**: Change subscription plan (upgrade monthly to annual, or downgrade)

**Note**: Prorated billing is calculated automatically

---

### Get Subscription History
**GET** `/subscriptions/history`

**Headers**: `Authorization: Bearer <token>`

**Response** (200):
```json
{
  "subscription": {
    "id": "uuid",
    "plan": "monthly",
    "status": "active",
    "amount": 99.00,
    "current_period_start": "2024-01-01T00:00:00Z",
    "current_period_end": "2024-02-01T00:00:00Z"
  },
  "payments": [
    {
      "id": "uuid",
      "amount": 99.00,
      "currency": "USD",
      "created_at": "2024-01-01T00:00:00Z"
    }
  ]
}
```

**Use Case**: Display subscription history and payment records

---

### Get Subscription Permissions
**GET** `/subscriptions/permissions`

**Headers**: `Authorization: Bearer <token>`

**Response** (200):
```json
{
  "plan": "monthly",
  "status": "active",
  "permissions": {
    "banking": false,
    "marketplace": true,
    "chat": false
  },
  "limits": {
    "assets": 10,
    "documents": 50,
    "listings": 5
  },
  "current_period_end": "2024-02-01T00:00:00Z"
}
```

**Use Case**: Show what features are available with current subscription plan

---

### Get Usage Limits
**GET** `/subscriptions/limits`

**Headers**: `Authorization: Bearer <token>`

**Response** (200):
```json
{
  "plan": "monthly",
  "limits": {
    "assets": 10,
    "documents": 50,
    "listings": 5,
    "offers": 10
  },
  "usage": {
    "assets": 7,
    "documents": 12,
    "listings": 2,
    "offers": 5
  },
  "remaining": {
    "assets": 3,
    "documents": 38,
    "listings": 3,
    "offers": 5
  }
}
```

**Use Case**: Display current usage vs limits for subscription plan

---

## Billing & Invoices APIs

### Get Payment History
**GET** `/payments/history`

**Headers**: `Authorization: Bearer <token>`

**Response** (200):
```json
[
  {
    "id": "uuid",
    "amount": 99.00,
    "currency": "USD",
    "payment_method": "card",
    "status": "completed",
    "stripe_payment_intent_id": "pi_xxx",
    "created_at": "2024-01-01T00:00:00Z"
  }
]
```

**Use Case**: Display payment transaction history in billing preferences

---

### Get Payment Statistics
**GET** `/payments/stats`

**Headers**: `Authorization: Bearer <token>`

**Response** (200):
```json
{
  "total_revenue": 5000.00,
  "total_transactions": 25,
  "average_transaction_value": 200.00,
  "payment_method_breakdown": [
    {
      "method": "card",
      "count": 20,
      "total": 4000.00
    }
  ]
}
```

**Use Case**: Show payment statistics summary

---

### List Invoices
**GET** `/payments/invoices`

**Headers**: `Authorization: Bearer <token>`

**Query Parameters**:
- `status_filter` (string, optional): Filter by status - `paid`, `unpaid`, `overdue`

**Response** (200):
```json
[
  {
    "id": "uuid",
    "invoice_number": "INV-20240101-001",
    "amount": 99.00,
    "currency": "USD",
    "description": "Monthly subscription",
    "due_date": "2024-01-15T00:00:00Z",
    "paid_at": "2024-01-10T00:00:00Z",
    "payment_id": "uuid",
    "created_at": "2024-01-01T00:00:00Z"
  }
]
```

**Use Case**: Display invoices list in billing preferences

---

### Get Invoice Details
**GET** `/payments/invoices/{invoice_id}`

**Headers**: `Authorization: Bearer <token>`

**Path Parameters**:
- `invoice_id` (UUID, required): Invoice ID

**Response** (200):
```json
{
  "id": "uuid",
  "invoice_number": "INV-20240101-001",
  "amount": 99.00,
  "currency": "USD",
  "description": "Monthly subscription",
  "due_date": "2024-01-15T00:00:00Z",
  "paid_at": "2024-01-10T00:00:00Z",
  "payment_id": "uuid",
  "created_at": "2024-01-01T00:00:00Z"
}
```

**Use Case**: View detailed invoice information

---

### Pay Invoice
**POST** `/payments/invoices/{invoice_id}/pay`

**Headers**: `Authorization: Bearer <token>`

**Path Parameters**:
- `invoice_id` (UUID, required): Invoice ID

**Request Body**: None

**Response** (201):
```json
{
  "id": "uuid",
  "amount": 99.00,
  "currency": "USD",
  "payment_method": "card",
  "status": "pending",
  "stripe_payment_intent_id": "pi_xxx",
  "created_at": "2024-01-01T00:00:00Z"
}
```

**Use Case**: Pay an unpaid invoice

---

## Summary: What APIs You Need for Preferences Tabs

### Linked Accounts Tab

**Required APIs**:
1. ✅ `GET /api/v1/banking/accounts` - List all linked accounts
2. ✅ `POST /api/v1/banking/link-token` - Get Plaid link token
3. ✅ `POST /api/v1/banking/link` - Complete account linking
4. ✅ `POST /api/v1/banking/accounts/{id}/refresh` - Refresh balance
5. ✅ `DELETE /api/v1/banking/accounts/{id}` - Disconnect account
6. ✅ `GET /api/v1/banking/accounts/{id}/transactions` - View transactions

**UI Features**:
- Display list of linked accounts with balances
- "Add Account" button → Plaid Link flow
- "Refresh" button per account
- "Disconnect" button per account
- View transaction history per account

---

### Payment & Billing Tab

**Required APIs**:

**Payment Methods Section**:
1. ✅ `GET /api/v1/payments/payment-methods` - List saved cards
2. ✅ `POST /api/v1/payments/payment-methods` - Add new card
3. ✅ `DELETE /api/v1/payments/payment-methods/{id}` - Remove card

**Subscription Section**:
4. ✅ `GET /api/v1/subscriptions` - Current subscription status
5. ✅ `POST /api/v1/subscriptions` - Create new subscription
6. ✅ `POST /api/v1/subscriptions/cancel` - Cancel subscription
7. ✅ `PUT /api/v1/subscriptions/upgrade` - Change plan
8. ✅ `GET /api/v1/subscriptions/history` - Subscription & payment history
9. ✅ `GET /api/v1/subscriptions/permissions` - Feature access
10. ✅ `GET /api/v1/subscriptions/limits` - Usage vs limits

**Billing Section**:
11. ✅ `GET /api/v1/payments/history` - Payment history
12. ✅ `GET /api/v1/payments/stats` - Payment statistics
13. ✅ `GET /api/v1/payments/invoices` - List invoices
14. ✅ `GET /api/v1/payments/invoices/{id}` - Invoice details
15. ✅ `POST /api/v1/payments/invoices/{id}/pay` - Pay invoice

**UI Features**:
- **Payment Methods**: List cards, add/remove cards (Stripe Elements)
- **Subscription**: Current plan, upgrade/downgrade, cancel, renewal date
- **Billing History**: Payment transactions, invoices, download receipts
- **Usage**: Show limits and current usage for subscription features

---

## Integration Notes

### Plaid Integration (Linked Accounts)

1. **Install Plaid Link**:
   ```bash
   npm install react-plaid-link
   ```

2. **Flow**:
   ```javascript
   // 1. Get link token
   const { link_token } = await apiGet('/banking/link-token');
   
   // 2. Initialize Plaid Link
   const { open, ready } = usePlaidLink({
     token: link_token,
     onSuccess: async (public_token) => {
       // 3. Complete linking
       await apiPost('/banking/link', { public_token });
     }
   });
   ```

### Stripe Integration (Payment Methods)

1. **Install Stripe**:
   ```bash
   npm install @stripe/stripe-js @stripe/react-stripe-js
   ```

2. **Flow**:
   ```javascript
   // 1. Create payment method from card element
   const { paymentMethod } = await stripe.createPaymentMethod({
     type: 'card',
     card: cardElement
   });
   
   // 2. Save payment method
   await apiPost('/payments/payment-methods', {
     payment_method_id: paymentMethod.id
   });
   ```

---

## Error Handling

All endpoints may return:
- **400 Bad Request**: Invalid input
- **401 Unauthorized**: Missing/invalid token
- **403 Forbidden**: Insufficient permissions (e.g., subscription required)
- **404 Not Found**: Resource not found
- **500 Internal Server Error**: Server error

---

**Last Updated**: 2024-01-01  
**API Version**: v1
