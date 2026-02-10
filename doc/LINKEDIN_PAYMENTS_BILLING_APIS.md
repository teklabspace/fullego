# LinkedIn Accounts, Payments & Billing APIs Documentation

This document outlines all required APIs for LinkedIn account integration, payment processing, and billing/subscription management.

**Base URL**: `/api/v1`  
**Authentication**: All endpoints require Bearer token in `Authorization` header (except OAuth callbacks)

---

## Table of Contents

1. [LinkedIn Accounts APIs](#linkedin-accounts-apis)
2. [Payments APIs](#payments-apis)
3. [Billing & Subscription APIs](#billing--subscription-apis)

---

## LinkedIn Accounts APIs

### Overview
LinkedIn account integration allows users to connect their LinkedIn profiles for professional networking, profile verification, and social features within the platform.

### Status: ⚠️ **NOT YET IMPLEMENTED**
These APIs need to be created on the backend.

---

### 1. Connect LinkedIn Account
**POST** `/linkedin/connect`

**Description**: Initiates OAuth flow to connect user's LinkedIn account.

**Request Body**:
```json
{
  "redirect_uri": "https://app.example.com/linkedin/callback"
}
```

**Response** (200):
```json
{
  "auth_url": "https://www.linkedin.com/oauth/v2/authorization?response_type=code&client_id=...",
  "state": "random_state_token",
  "expires_in": 600
}
```

**Frontend Implementation**:
- Redirect user to `auth_url`
- Store `state` token for verification

---

### 2. LinkedIn OAuth Callback
**POST** `/linkedin/callback`

**Description**: Handles OAuth callback from LinkedIn after user authorization.

**Request Body**:
```json
{
  "code": "authorization_code_from_linkedin",
  "state": "state_token_from_connect"
}
```

**Response** (200):
```json
{
  "linkedin_account": {
    "id": "linkedin_user_id",
    "profile_id": "uuid",
    "linkedin_id": "linkedin_user_id",
    "first_name": "John",
    "last_name": "Doe",
    "email": "john.doe@example.com",
    "profile_url": "https://www.linkedin.com/in/johndoe",
    "profile_image_url": "https://media.licdn.com/dms/image/...",
    "headline": "Senior Wealth Manager",
    "location": "New York, NY",
    "industry": "Financial Services",
    "is_verified": true,
    "connected_at": "2024-01-01T00:00:00Z"
  },
  "access_token": "encrypted_linkedin_token",
  "expires_at": "2024-12-31T23:59:59Z"
}
```

---

### 3. Get LinkedIn Account Status
**GET** `/linkedin/status`

**Description**: Returns the current LinkedIn connection status for the authenticated user.

**Response** (200):
```json
{
  "is_connected": true,
  "linkedin_account": {
    "id": "uuid",
    "linkedin_id": "linkedin_user_id",
    "first_name": "John",
    "last_name": "Doe",
    "profile_url": "https://www.linkedin.com/in/johndoe",
    "profile_image_url": "https://media.licdn.com/dms/image/...",
    "headline": "Senior Wealth Manager",
    "is_verified": true,
    "connected_at": "2024-01-01T00:00:00Z",
    "last_synced_at": "2024-01-15T10:30:00Z"
  }
}
```

**Response** (200) - Not Connected:
```json
{
  "is_connected": false,
  "linkedin_account": null
}
```

---

### 4. Sync LinkedIn Profile
**POST** `/linkedin/sync`

**Description**: Manually syncs LinkedIn profile data to update user information.

**Response** (200):
```json
{
  "linkedin_account": {
    "id": "uuid",
    "first_name": "John",
    "last_name": "Doe",
    "headline": "Senior Wealth Manager",
    "location": "New York, NY",
    "industry": "Financial Services",
    "profile_image_url": "https://media.licdn.com/dms/image/...",
    "last_synced_at": "2024-01-15T10:30:00Z"
  },
  "updated_fields": ["headline", "location", "profile_image_url"]
}
```

---

### 5. Disconnect LinkedIn Account
**DELETE** `/linkedin/disconnect`

**Description**: Disconnects the user's LinkedIn account from their profile.

**Response** (200):
```json
{
  "message": "LinkedIn account disconnected successfully",
  "disconnected_at": "2024-01-15T10:30:00Z"
}
```

---

### 6. Get LinkedIn Connections (Network)
**GET** `/linkedin/connections`

**Description**: Retrieves user's LinkedIn connections (if permissions granted).

**Query Parameters**:
- `limit` (integer, optional): Number of connections to return (1-500, default: 50)
- `offset` (integer, optional): Pagination offset (default: 0)

**Response** (200):
```json
{
  "data": [
    {
      "linkedin_id": "linkedin_user_id",
      "first_name": "Jane",
      "last_name": "Smith",
      "headline": "Investment Advisor",
      "profile_url": "https://www.linkedin.com/in/janesmith",
      "profile_image_url": "https://media.licdn.com/dms/image/...",
      "is_mutual_connection": true,
      "connected_at": "2023-06-15T00:00:00Z"
    }
  ],
  "total": 150,
  "limit": 50,
  "offset": 0
}
```

---

### 7. Share to LinkedIn
**POST** `/linkedin/share`

**Description**: Shares content (portfolio summary, achievement, etc.) to user's LinkedIn feed.

**Request Body**:
```json
{
  "content": "Just reached $1M in portfolio value! 🎉",
  "visibility": "public", // "public" | "connections"
  "media_url": "https://example.com/portfolio-chart.png" // optional
}
```

**Response** (200):
```json
{
  "share_id": "linkedin_share_id",
  "share_url": "https://www.linkedin.com/feed/update/...",
  "shared_at": "2024-01-15T10:30:00Z"
}
```

---

## Payments APIs

### Overview
Payment processing APIs for handling transactions, payment methods, refunds, and invoices. These APIs are **already implemented** in the codebase.

---

### Payment Processing

#### 1. Create Payment Intent
**POST** `/payments/create-intent`

**Description**: Creates a payment intent for processing a payment.

**Request Body**:
```json
{
  "amount": 100.00,
  "currency": "USD",
  "payment_method": "card", // "card" | "bank_transfer" | "wallet"
  "description": "Payment for subscription",
  "metadata": {
    "subscription_id": "uuid",
    "plan_name": "Premium"
  }
}
```

**Response** (201):
```json
{
  "payment_intent_id": "pi_xxx",
  "client_secret": "pi_xxx_secret_xxx",
  "amount": 100.00,
  "currency": "USD",
  "status": "requires_payment_method",
  "created_at": "2024-01-01T00:00:00Z"
}
```

**Frontend Implementation**: `src/utils/paymentsApi.js` - `createPaymentIntent()`

---

#### 2. Payment Webhook Handler
**POST** `/payments/webhook`

**Description**: Handles Stripe webhook events for payment status updates.

**Request Body**: (Stripe webhook payload)
```json
{
  "type": "payment_intent.succeeded",
  "data": {
    "object": {
      "id": "pi_xxx",
      "status": "succeeded",
      "amount": 10000
    }
  }
}
```

**Response** (200):
```json
{
  "received": true,
  "event_type": "payment_intent.succeeded",
  "processed_at": "2024-01-01T00:00:00Z"
}
```

**Frontend Implementation**: `src/utils/paymentsApi.js` - `handlePaymentWebhook()`

---

#### 3. Get Payment History
**GET** `/payments/history`

**Description**: Retrieves payment history for the authenticated user.

**Query Parameters**:
- `limit` (integer, optional): Number of payments (1-100, default: 20)
- `offset` (integer, optional): Pagination offset (default: 0)
- `status` (string, optional): Filter by status (`completed`, `pending`, `failed`, `refunded`)
- `start_date` (string, optional): Start date (ISO 8601 format)
- `end_date` (string, optional): End date (ISO 8601 format)

**Response** (200):
```json
{
  "data": [
    {
      "id": "uuid",
      "amount": 100.00,
      "currency": "USD",
      "payment_method": "card",
      "status": "completed",
      "description": "Payment for subscription",
      "stripe_payment_intent_id": "pi_xxx",
      "created_at": "2024-01-01T00:00:00Z",
      "metadata": {
        "subscription_id": "uuid",
        "plan_name": "Premium"
      }
    }
  ],
  "total": 25,
  "limit": 20,
  "offset": 0
}
```

**Frontend Implementation**: `src/utils/paymentsApi.js` - `getPaymentHistory()`

---

#### 4. Get Payment Statistics
**GET** `/payments/stats`

**Description**: Returns payment statistics and analytics.

**Response** (200):
```json
{
  "total_revenue": 5000.00,
  "total_transactions": 25,
  "average_transaction_value": 200.00,
  "currency": "USD",
  "payment_method_breakdown": [
    {
      "method": "card",
      "count": 20,
      "total": 4000.00,
      "percentage": 80.0
    },
    {
      "method": "bank_transfer",
      "count": 5,
      "total": 1000.00,
      "percentage": 20.0
    }
  ],
  "status_breakdown": {
    "completed": 23,
    "pending": 1,
    "failed": 1
  },
  "period": {
    "start_date": "2024-01-01",
    "end_date": "2024-01-31"
  }
}
```

**Frontend Implementation**: `src/utils/paymentsApi.js` - `getPaymentStats()`

**Status**: ⚠️ **Backend Issue** - Returns `405 Method Not Allowed`. See `doc/BACKEND_API_ISSUES.md`.

---

### Payment Methods

#### 5. Get Payment Methods
**GET** `/payments/payment-methods`

**Description**: Retrieves all saved payment methods for the user.

**Response** (200):
```json
{
  "data": [
    {
      "id": "pm_xxx",
      "type": "card",
      "card": {
        "brand": "visa",
        "last4": "4242",
        "exp_month": 12,
        "exp_year": 2025
      },
      "is_default": true,
      "created_at": "2024-01-01T00:00:00Z"
    },
    {
      "id": "pm_yyy",
      "type": "bank_account",
      "bank_account": {
        "bank_name": "Chase Bank",
        "account_type": "checking",
        "last4": "1234"
      },
      "is_default": false,
      "created_at": "2024-01-05T00:00:00Z"
    }
  ]
}
```

**Frontend Implementation**: `src/utils/paymentsApi.js` - `getPaymentMethods()`

---

#### 6. Add Payment Method
**POST** `/payments/payment-methods`

**Description**: Adds a new payment method (card or bank account).

**Request Body**:
```json
{
  "payment_method_id": "pm_xxx", // Stripe payment method ID
  "set_as_default": true
}
```

**Response** (201):
```json
{
  "payment_method": {
    "id": "pm_xxx",
    "type": "card",
    "card": {
      "brand": "visa",
      "last4": "4242",
      "exp_month": 12,
      "exp_year": 2025
    },
    "is_default": true,
    "created_at": "2024-01-01T00:00:00Z"
  }
}
```

**Frontend Implementation**: `src/utils/paymentsApi.js` - `addPaymentMethod()`

---

#### 7. Remove Payment Method
**DELETE** `/payments/payment-methods/{method_id}`

**Description**: Removes a saved payment method.

**Response** (200):
```json
{
  "message": "Payment method removed successfully",
  "removed_at": "2024-01-01T00:00:00Z"
}
```

**Frontend Implementation**: `src/utils/paymentsApi.js` - `removePaymentMethod()`

---

### Refunds

#### 8. Create Refund
**POST** `/payments/payments/{payment_id}/refund`

**Description**: Creates a refund for a completed payment.

**Request Body**:
```json
{
  "amount": 50.00, // Optional: partial refund. Omit for full refund
  "reason": "customer_request", // "customer_request" | "duplicate" | "fraudulent"
  "metadata": {
    "refund_reason": "Customer requested refund"
  }
}
```

**Response** (201):
```json
{
  "refund": {
    "id": "re_xxx",
    "payment_id": "uuid",
    "amount": 50.00,
    "currency": "USD",
    "status": "succeeded",
    "reason": "customer_request",
    "created_at": "2024-01-01T00:00:00Z"
  }
}
```

**Frontend Implementation**: `src/utils/paymentsApi.js` - `createRefund()`

---

#### 9. Get Refunds
**GET** `/payments/payments/{payment_id}/refunds`

**Description**: Retrieves all refunds for a specific payment.

**Response** (200):
```json
{
  "data": [
    {
      "id": "re_xxx",
      "payment_id": "uuid",
      "amount": 50.00,
      "currency": "USD",
      "status": "succeeded",
      "reason": "customer_request",
      "created_at": "2024-01-01T00:00:00Z"
    }
  ],
  "total": 1
}
```

**Frontend Implementation**: `src/utils/paymentsApi.js` - `getRefunds()`

---

### Invoices

#### 10. Create Invoice
**POST** `/payments/invoices`

**Description**: Creates a new invoice for billing.

**Request Body**:
```json
{
  "amount": 99.00,
  "currency": "USD",
  "description": "Premium subscription - January 2024",
  "due_date": "2024-02-01",
  "customer_email": "customer@example.com",
  "line_items": [
    {
      "description": "Premium Plan",
      "amount": 99.00,
      "quantity": 1
    }
  ],
  "metadata": {
    "subscription_id": "uuid",
    "plan_name": "Premium"
  }
}
```

**Response** (201):
```json
{
  "invoice": {
    "id": "inv_xxx",
    "amount": 99.00,
    "currency": "USD",
    "status": "draft",
    "description": "Premium subscription - January 2024",
    "due_date": "2024-02-01",
    "invoice_url": "https://invoice.example.com/inv_xxx",
    "created_at": "2024-01-01T00:00:00Z"
  }
}
```

**Frontend Implementation**: `src/utils/paymentsApi.js` - `createInvoice()`

---

#### 11. List Invoices
**GET** `/payments/invoices`

**Description**: Retrieves all invoices for the authenticated user.

**Query Parameters**:
- `status_filter` (string, optional): Filter by status (`draft`, `open`, `paid`, `void`, `uncollectible`)
- `limit` (integer, optional): Number of invoices (1-100, default: 20)
- `offset` (integer, optional): Pagination offset (default: 0)

**Response** (200):
```json
{
  "data": [
    {
      "id": "inv_xxx",
      "amount": 99.00,
      "currency": "USD",
      "status": "paid",
      "description": "Premium subscription - January 2024",
      "due_date": "2024-02-01",
      "paid_at": "2024-01-15T10:30:00Z",
      "invoice_url": "https://invoice.example.com/inv_xxx",
      "created_at": "2024-01-01T00:00:00Z"
    }
  ],
  "total": 12,
  "limit": 20,
  "offset": 0
}
```

**Frontend Implementation**: `src/utils/paymentsApi.js` - `listInvoices()`

---

#### 12. Get Invoice Details
**GET** `/payments/invoices/{invoice_id}`

**Description**: Retrieves detailed information for a specific invoice.

**Response** (200):
```json
{
  "invoice": {
    "id": "inv_xxx",
    "amount": 99.00,
    "currency": "USD",
    "status": "paid",
    "description": "Premium subscription - January 2024",
    "due_date": "2024-02-01",
    "paid_at": "2024-01-15T10:30:00Z",
    "invoice_url": "https://invoice.example.com/inv_xxx",
    "line_items": [
      {
        "description": "Premium Plan",
        "amount": 99.00,
        "quantity": 1
      }
    ],
    "payment_method": {
      "type": "card",
      "last4": "4242"
    },
    "created_at": "2024-01-01T00:00:00Z"
  }
}
```

**Frontend Implementation**: `src/utils/paymentsApi.js` - `getInvoice()`

---

#### 13. Pay Invoice
**POST** `/payments/invoices/{invoice_id}/pay`

**Description**: Processes payment for an open invoice.

**Request Body** (optional):
```json
{
  "payment_method_id": "pm_xxx" // Optional: use specific payment method. Defaults to default payment method.
}
```

**Response** (200):
```json
{
  "invoice": {
    "id": "inv_xxx",
    "status": "paid",
    "paid_at": "2024-01-15T10:30:00Z",
    "payment_id": "uuid"
  },
  "payment": {
    "id": "uuid",
    "amount": 99.00,
    "status": "completed"
  }
}
```

**Frontend Implementation**: `src/utils/paymentsApi.js` - `payInvoice()`

---

## Billing & Subscription APIs

### Overview
Billing and subscription management APIs for handling subscription plans, billing cycles, and subscription-related operations.

### Status: ⚠️ **PARTIALLY IMPLEMENTED**
Some subscription information is available through account stats, but dedicated subscription APIs need to be created.

---

### Subscription Management

#### 1. Get Subscription Status
**GET** `/billing/subscription`

**Description**: Retrieves current subscription information for the authenticated user.

**Response** (200):
```json
{
  "subscription": {
    "id": "sub_xxx",
    "plan_id": "plan_premium",
    "plan_name": "Premium",
    "status": "active", // "active" | "canceled" | "past_due" | "trialing" | "incomplete"
    "current_period_start": "2024-01-01T00:00:00Z",
    "current_period_end": "2024-02-01T00:00:00Z",
    "cancel_at_period_end": false,
    "canceled_at": null,
    "trial_end": null,
    "billing_cycle": "monthly", // "monthly" | "annual"
    "amount": 99.00,
    "currency": "USD",
    "features": [
      "full_portfolio_management",
      "marketplace_access",
      "priority_support"
    ],
    "created_at": "2023-12-01T00:00:00Z"
  }
}
```

**Response** (200) - No Subscription:
```json
{
  "subscription": null,
  "message": "No active subscription"
}
```

---

#### 2. Get Available Plans
**GET** `/billing/plans`

**Description**: Retrieves all available subscription plans.

**Response** (200):
```json
{
  "plans": [
    {
      "id": "plan_starter",
      "name": "Starter",
      "description": "Perfect for new or casual investors",
      "monthly_price": 0.00,
      "annual_price": 0.00,
      "currency": "USD",
      "features": [
        "Basic portfolio dashboard",
        "Limited aggregation (1-2 accounts)",
        "Read-only market performance",
        "Marketplace browsing",
        "Standard email support"
      ],
      "limits": {
        "max_accounts": 2,
        "max_assets": 10
      }
    },
    {
      "id": "plan_pro",
      "name": "Pro",
      "description": "For active investors & small business owners",
      "monthly_price": 199.00,
      "annual_price": 1999.00,
      "currency": "USD",
      "features": [
        "Full portfolio management",
        "Automated rebalancing",
        "Marketplace access",
        "Asset valuation tools",
        "Transaction tracking",
        "Priority support"
      ],
      "limits": {
        "max_accounts": 10,
        "max_assets": 100
      },
      "popular": true
    },
    {
      "id": "plan_premium",
      "name": "Premium",
      "description": "For advanced investors & entrepreneurs",
      "monthly_price": 699.00,
      "annual_price": 6999.00,
      "currency": "USD",
      "features": [
        "Everything in Pro",
        "AI-driven insights",
        "Automated asset valuation",
        "Document center",
        "Tax & investment advisory",
        "Premium support"
      ],
      "limits": {
        "max_accounts": -1, // unlimited
        "max_assets": -1 // unlimited
      }
    },
    {
      "id": "plan_concierge",
      "name": "Concierge",
      "description": "Custom enterprise solution",
      "monthly_price": null, // Custom pricing
      "annual_price": null,
      "currency": "USD",
      "features": [
        "Everything in Premium",
        "Dedicated account manager",
        "Custom integrations",
        "White-glove onboarding",
        "24/7 concierge support"
      ],
      "limits": {
        "max_accounts": -1,
        "max_assets": -1
      },
      "is_custom": true
    }
  ]
}
```

---

#### 3. Subscribe to Plan
**POST** `/billing/subscribe`

**Description**: Creates a new subscription or upgrades/downgrades existing subscription.

**Request Body**:
```json
{
  "plan_id": "plan_premium",
  "billing_cycle": "monthly", // "monthly" | "annual"
  "payment_method_id": "pm_xxx", // Optional: use specific payment method
  "coupon_code": "WELCOME20" // Optional: discount coupon
}
```

**Response** (201):
```json
{
  "subscription": {
    "id": "sub_xxx",
    "plan_id": "plan_premium",
    "plan_name": "Premium",
    "status": "active",
    "current_period_start": "2024-01-15T00:00:00Z",
    "current_period_end": "2024-02-15T00:00:00Z",
    "billing_cycle": "monthly",
    "amount": 99.00,
    "currency": "USD",
    "created_at": "2024-01-15T00:00:00Z"
  },
  "payment_intent": {
    "id": "pi_xxx",
    "client_secret": "pi_xxx_secret_xxx",
    "status": "requires_payment_method"
  }
}
```

---

#### 4. Update Subscription
**PATCH** `/billing/subscription`

**Description**: Updates subscription (change plan, billing cycle, etc.).

**Request Body**:
```json
{
  "plan_id": "plan_pro", // Optional: change plan
  "billing_cycle": "annual", // Optional: change billing cycle
  "payment_method_id": "pm_yyy" // Optional: update payment method
}
```

**Response** (200):
```json
{
  "subscription": {
    "id": "sub_xxx",
    "plan_id": "plan_pro",
    "plan_name": "Pro",
    "status": "active",
    "billing_cycle": "annual",
    "amount": 1999.00,
    "prorated_amount": 50.00, // Refund/charge for prorated period
    "updated_at": "2024-01-15T00:00:00Z"
  }
}
```

---

#### 5. Cancel Subscription
**POST** `/billing/subscription/cancel`

**Description**: Cancels subscription. Access continues until end of billing period.

**Request Body** (optional):
```json
{
  "cancel_immediately": false, // If true, cancel immediately. Default: false (cancel at period end)
  "cancellation_reason": "Too expensive" // Optional
}
```

**Response** (200):
```json
{
  "subscription": {
    "id": "sub_xxx",
    "status": "canceled",
    "cancel_at_period_end": true,
    "canceled_at": "2024-01-15T00:00:00Z",
    "current_period_end": "2024-02-15T00:00:00Z",
    "cancellation_reason": "Too expensive"
  },
  "message": "Subscription will remain active until 2024-02-15"
}
```

---

#### 6. Reactivate Subscription
**POST** `/billing/subscription/reactivate`

**Description**: Reactivates a canceled subscription before period end.

**Response** (200):
```json
{
  "subscription": {
    "id": "sub_xxx",
    "status": "active",
    "cancel_at_period_end": false,
    "canceled_at": null,
    "reactivated_at": "2024-01-15T00:00:00Z"
  }
}
```

---

### Billing History

#### 7. Get Billing History
**GET** `/billing/history`

**Description**: Retrieves billing history (invoices, payments, refunds).

**Query Parameters**:
- `limit` (integer, optional): Number of records (1-100, default: 20)
- `offset` (integer, optional): Pagination offset (default: 0)
- `type` (string, optional): Filter by type (`invoice`, `payment`, `refund`)
- `start_date` (string, optional): Start date (ISO 8601 format)
- `end_date` (string, optional): End date (ISO 8601 format)

**Response** (200):
```json
{
  "data": [
    {
      "id": "uuid",
      "type": "invoice",
      "invoice_id": "inv_xxx",
      "amount": 99.00,
      "currency": "USD",
      "status": "paid",
      "description": "Premium subscription - January 2024",
      "billing_period": {
        "start": "2024-01-01",
        "end": "2024-02-01"
      },
      "created_at": "2024-01-01T00:00:00Z",
      "paid_at": "2024-01-01T10:30:00Z"
    },
    {
      "id": "uuid",
      "type": "payment",
      "payment_id": "uuid",
      "amount": 99.00,
      "currency": "USD",
      "status": "completed",
      "description": "Payment for invoice inv_xxx",
      "created_at": "2024-01-01T10:30:00Z"
    }
  ],
  "total": 24,
  "limit": 20,
  "offset": 0
}
```

---

#### 8. Get Upcoming Invoice
**GET** `/billing/invoice/upcoming`

**Description**: Retrieves the next invoice that will be generated.

**Response** (200):
```json
{
  "invoice": {
    "id": "inv_upcoming",
    "amount": 99.00,
    "currency": "USD",
    "description": "Premium subscription - February 2024",
    "due_date": "2024-02-01T00:00:00Z",
    "billing_period": {
      "start": "2024-02-01",
      "end": "2024-03-01"
    },
    "line_items": [
      {
        "description": "Premium Plan",
        "amount": 99.00,
        "quantity": 1
      }
    ],
    "estimated_charge_date": "2024-02-01T00:00:00Z"
  }
}
```

---

### Payment Methods for Billing

#### 9. Set Default Payment Method
**PATCH** `/billing/payment-method/default`

**Description**: Sets the default payment method for subscription billing.

**Request Body**:
```json
{
  "payment_method_id": "pm_xxx"
}
```

**Response** (200):
```json
{
  "payment_method": {
    "id": "pm_xxx",
    "type": "card",
    "card": {
      "brand": "visa",
      "last4": "4242"
    },
    "is_default": true,
    "updated_at": "2024-01-15T00:00:00Z"
  }
}
```

---

### Usage & Limits

#### 10. Get Usage Statistics
**GET** `/billing/usage`

**Description**: Retrieves current usage statistics against subscription limits.

**Response** (200):
```json
{
  "subscription": {
    "plan_id": "plan_pro",
    "plan_name": "Pro"
  },
  "usage": {
    "accounts": {
      "used": 5,
      "limit": 10,
      "percentage": 50.0
    },
    "assets": {
      "used": 45,
      "limit": 100,
      "percentage": 45.0
    },
    "storage": {
      "used_mb": 250,
      "limit_mb": 1000,
      "percentage": 25.0
    }
  },
  "period": {
    "start": "2024-01-01",
    "end": "2024-02-01"
  }
}
```

---

## Implementation Status Summary

### ✅ Fully Implemented
- **Payments APIs**: All payment processing, payment methods, refunds, and invoices APIs are implemented in `src/utils/paymentsApi.js`
- **Payment Configuration**: All endpoints defined in `src/config/api.js`

### ⚠️ Partially Implemented
- **Billing/Subscription**: Subscription status available through `/accounts/stats` but dedicated subscription APIs need to be created
- **Payment Stats**: Endpoint exists but returns `405 Method Not Allowed` (backend issue)

### ❌ Not Implemented
- **LinkedIn Accounts**: No LinkedIn integration APIs exist. All 7 LinkedIn APIs need to be created on backend.
- **Billing APIs**: Dedicated subscription management APIs need to be created (10 endpoints listed above)

---

## Next Steps

1. **Backend Development**:
   - Implement LinkedIn OAuth integration APIs (7 endpoints)
   - Create subscription/billing management APIs (10 endpoints)
   - Fix `/payments/stats` endpoint (405 Method Not Allowed issue)

2. **Frontend Development**:
   - Create `src/utils/linkedinApi.js` service file
   - Create `src/utils/billingApi.js` service file
   - Add LinkedIn connection UI components
   - Add subscription management UI components
   - Update `src/config/api.js` with new endpoints

3. **Testing**:
   - Test LinkedIn OAuth flow
   - Test subscription lifecycle (subscribe, upgrade, downgrade, cancel)
   - Test payment processing with subscriptions
   - Test billing history and invoices

---

## Related Documentation

- `doc/FRONTEND_API_DOCUMENTATION.md` - Complete API documentation
- `doc/BACKEND_API_ISSUES.md` - Known backend API issues
- `src/utils/paymentsApi.js` - Payment API service implementation
- `src/config/api.js` - API endpoint configuration
