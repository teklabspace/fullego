# Frontend API Documentation

Complete API documentation for frontend integration with request bodies, endpoints, and response formats.

**Base URL**: `/api/v1`  
**Authentication**: All endpoints require Bearer token in `Authorization` header (except auth endpoints)

---

## Table of Contents

1. [Authentication APIs](#authentication-apis)
2. [User APIs](#user-apis)
3. [Portfolio APIs](#portfolio-apis)
4. [Investment APIs](#investment-apis)
5. [Analytics APIs](#analytics-apis)
6. [Accounts & Banking APIs](#accounts--banking-apis)
7. [Assets APIs](#assets-apis)
8. [Payments APIs](#payments-apis)
9. [Reports APIs](#reports-apis)
10. [Notifications APIs](#notifications-apis)

---

## Authentication APIs

### Login
**POST** `/auth/login`

**Request Body**:
```json
{
  "email": "user@example.com",
  "password": "password123"
}
```

**Response** (200):
```json
{
  "access_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "token_type": "bearer",
  "user": {
    "id": "uuid",
    "email": "user@example.com",
    "first_name": "John",
    "last_name": "Doe"
  }
}
```

### Register
**POST** `/auth/register`

**Request Body**:
```json
{
  "email": "user@example.com",
  "password": "password123",
  "first_name": "John",
  "last_name": "Doe",
  "phone": "+1234567890"
}
```

**Response** (201):
```json
{
  "access_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "token_type": "bearer",
  "user": {
    "id": "uuid",
    "email": "user@example.com",
    "first_name": "John",
    "last_name": "Doe"
  }
}
```

---

## User APIs

### Get Current User
**GET** `/users/me`

**Headers**: `Authorization: Bearer <token>`

**Response** (200):
```json
{
  "id": "uuid",
  "email": "user@example.com",
  "first_name": "John",
  "last_name": "Doe",
  "phone": "+1234567890",
  "role": "user",
  "is_verified": true,
  "is_active": true,
  "created_at": "2024-01-01T00:00:00Z"
}
```

### Update User Profile
**PUT** `/users/me`

**Headers**: `Authorization: Bearer <token>`

**Request Body**:
```json
{
  "first_name": "John",
  "last_name": "Doe",
  "phone": "+1234567890",
  "email": "newemail@example.com"
}
```

**Response** (200): Same as Get Current User

### Get User Notifications
**GET** `/users/notifications`

**Headers**: `Authorization: Bearer <token>`

**Query Parameters**:
- `unread_only` (boolean, optional): Filter unread notifications only

**Response** (200):
```json
[
  {
    "id": "uuid",
    "notification_type": "order_filled",
    "title": "Order Filled",
    "message": "Your order for AAPL has been filled",
    "is_read": false,
    "created_at": "2024-01-01T00:00:00Z"
  }
]
```

---

## Portfolio APIs

### Get Portfolio Summary
**GET** `/portfolio/summary`

**Headers**: `Authorization: Bearer <token>`

**Query Parameters**:
- `time_range` (string, optional): `1D`, `1W`, `1M`, `3M`, `6M`, `1Y`, `ALL` (default: `ALL`)

**Response** (200):
```json
{
  "data": {
    "total_portfolio_value": 150000.00,
    "total_invested": 140000.00,
    "total_returns": 10000.00,
    "return_percentage": 7.14,
    "today_change": 500.00,
    "today_change_percentage": 0.33,
    "cash_available": 10000.00,
    "cash_percentage": 6.67,
    "asset_types_count": 3,
    "total_holdings": 15
  }
}
```

### Get Portfolio Performance
**GET** `/portfolio/performance`

**Headers**: `Authorization: Bearer <token>`

**Query Parameters**:
- `days` (integer, optional): Number of days (1-365, default: 30)

**Response** (200):
```json
{
  "total_return": 5000.00,
  "total_return_percentage": 3.57,
  "period_days": 30,
  "current_value": 145000.00,
  "historical_value": 140000.00,
  "daily_returns": [
    {
      "date": "2024-01-01",
      "value": 140000.00
    }
  ],
  "best_performer": {
    "symbol": "AAPL",
    "name": "Apple Inc.",
    "return_percentage": 5.2,
    "value": 50000.00
  },
  "worst_performer": {
    "symbol": "TSLA",
    "name": "Tesla Inc.",
    "return_percentage": -2.1,
    "value": 20000.00
  }
}
```

### Get Portfolio History
**GET** `/portfolio/history`

**Headers**: `Authorization: Bearer <token>`

**Query Parameters**:
- `days` (integer, optional): Number of days (1-365, default: 30)

**Response** (200):
```json
[
  {
    "date": "2024-01-01T00:00:00Z",
    "value": 140000.00,
    "currency": "USD"
  }
]
```

### Get Asset Allocation
**GET** `/portfolio/allocation`

**Headers**: `Authorization: Bearer <token>`

**Response** (200):
```json
[
  {
    "asset_type": "stock",
    "count": 10,
    "value": 100000.00,
    "percentage": 66.67,
    "assets": [
      {
        "id": "uuid",
        "name": "Apple Inc.",
        "symbol": "AAPL",
        "value": 50000.00,
        "currency": "USD"
      }
    ]
  }
]
```

### Get Top Holdings
**GET** `/portfolio/holdings/top`

**Headers**: `Authorization: Bearer <token>`

**Query Parameters**:
- `limit` (integer, optional): Number of holdings (1-100, default: 10)
- `sort_by` (string, optional): `value`, `change`, `change_percentage` (default: `value`)
- `order` (string, optional): `asc`, `desc` (default: `desc`)

**Response** (200):
```json
{
  "data": [
    {
      "symbol": "AAPL",
      "name": "Apple Inc.",
      "type": "Stock",
      "shares": 100.0,
      "avg_price": 150.00,
      "current_price": 155.00,
      "value": 15500.00,
      "change": 5.00,
      "change_percentage": 3.33,
      "currency": "USD"
    }
  ]
}
```

### Get Recent Activity
**GET** `/portfolio/activity/recent`

**Headers**: `Authorization: Bearer <token>`

**Query Parameters**:
- `limit` (integer, optional): Number of activities (1-100, default: 10)
- `type` (string, optional): `buy`, `sell`, `dividend`, `transfer`, `all` (default: `all`)

**Response** (200):
```json
{
  "data": [
    {
      "id": "uuid",
      "type": "buy",
      "asset": "AAPL",
      "name": "Apple Inc.",
      "amount": 10.0,
      "price": 150.00,
      "total": 1500.00,
      "date": "2024-01-01",
      "time": "10:30:00",
      "currency": "USD"
    }
  ]
}
```

### Get Market Summary
**GET** `/portfolio/market-summary`

**Headers**: `Authorization: Bearer <token>`

**Response** (200):
```json
{
  "data": {
    "indices": [
      {
        "name": "S&P 500",
        "value": 4500.00,
        "change": 25.00,
        "change_percentage": 0.56
      }
    ],
    "crypto": [
      {
        "symbol": "BTC",
        "name": "Bitcoin",
        "price": 45000.00,
        "change": 500.00,
        "change_percentage": 1.12
      }
    ]
  }
}
```

### Get Portfolio Alerts
**GET** `/portfolio/alerts`

**Headers**: `Authorization: Bearer <token>`

**Query Parameters**:
- `status` (string, optional): `active`, `resolved`, `all` (default: `active`)
- `limit` (integer, optional): Number of alerts (1-100, default: 10)

**Response** (200):
```json
{
  "data": [
    {
      "id": "uuid",
      "type": "price_alert",
      "title": "Price Alert",
      "message": "AAPL has reached your target price",
      "severity": "warning",
      "created_at": "2024-01-01T00:00:00Z"
    }
  ]
}
```

### Get Portfolio Risk Metrics
**GET** `/portfolio/risk`

**Headers**: `Authorization: Bearer <token>`

**Response** (200):
```json
{
  "volatility": 2.5,
  "concentration_risk": 35.5,
  "diversification_score": 75.0,
  "asset_type_count": 4,
  "total_assets": 15
}
```

### Compare with Benchmark
**GET** `/portfolio/benchmark`

**Headers**: `Authorization: Bearer <token>`

**Query Parameters**:
- `benchmark_value` (decimal, required): Benchmark portfolio value

**Response** (200):
```json
{
  "portfolio_value": 150000.00,
  "benchmark_value": 145000.00,
  "difference": 5000.00,
  "difference_percentage": 3.45,
  "outperforming": true
}
```

---

## Investment APIs

### Get Investment Overview Assets
**GET** `/investment/overview/assets`

**Headers**: `Authorization: Bearer <token>`

**Response** (200):
```json
{
  "data": [
    {
      "type": "total",
      "label": "Total Portfolio Value",
      "value": 150000.00,
      "change": 500.00,
      "change_percentage": 0.33,
      "currency": "USD"
    },
    {
      "type": "stock",
      "label": "Stocks",
      "value": 100000.00,
      "change": null,
      "change_percentage": null,
      "currency": "USD"
    }
  ]
}
```

### Get Investment Overview Activity
**GET** `/investment/overview/activity`

**Headers**: `Authorization: Bearer <token>`

**Query Parameters**:
- `limit` (integer, optional): Number of activities (1-100, default: 10)
- `type` (string, optional): `buy`, `sell`, `dividend`, `transfer`, `all` (default: `all`)

**Response** (200):
```json
{
  "data": [
    {
      "id": "uuid",
      "type": "buy",
      "asset": "AAPL",
      "name": "Apple Inc.",
      "amount": 10.0,
      "price": 150.00,
      "total": 1500.00,
      "date": "2024-01-01",
      "time": "10:30:00",
      "currency": "USD"
    }
  ]
}
```

### Get Crypto Prices
**GET** `/investment/overview/crypto-prices`

**Headers**: `Authorization: Bearer <token>`

**Response** (200):
```json
{
  "data": [
    {
      "symbol": "BTC",
      "name": "Bitcoin",
      "price": 45000.00,
      "change": 500.00,
      "change_percentage": 1.12
    }
  ]
}
```

### Get Trader Profile
**GET** `/investment/overview/trader-profile`

**Headers**: `Authorization: Bearer <token>`

**Response** (200):
```json
{
  "data": {
    "account_number": "123456789",
    "buying_power": 50000.00,
    "cash": 10000.00,
    "portfolio_value": 150000.00,
    "pattern_day_trader": false,
    "trading_blocked": false,
    "account_blocked": false,
    "status": "ACTIVE"
  }
}
```

### Get Investment Performance
**GET** `/investment/performance`

**Headers**: `Authorization: Bearer <token>`

**Query Parameters**:
- `days` (integer, optional): Number of days (1-365, default: 30)
- `time_range` (string, optional): `1D`, `1W`, `1M`, `3M`, `6M`, `1Y`, `ALL` (default: `1M`)

**Response** (200):
```json
{
  "total_return": 5000.00,
  "total_return_percentage": 3.57,
  "period_days": 30,
  "current_value": 145000.00,
  "historical_value": 140000.00,
  "daily_returns": [
    {
      "date": "2024-01-01",
      "value": 140000.00
    }
  ],
  "best_performer": {
    "symbol": "AAPL",
    "name": "Apple Inc.",
    "return_percentage": 5.2,
    "value": 50000.00
  },
  "worst_performer": {
    "symbol": "TSLA",
    "name": "Tesla Inc.",
    "return_percentage": -2.1,
    "value": 20000.00
  },
  "asset_breakdown": [
    {
      "type": "stock",
      "value": 100000.00,
      "percentage": 68.97
    }
  ]
}
```

### Get Investment Analytics
**GET** `/investment/analytics`

**Headers**: `Authorization: Bearer <token>`

**Query Parameters**:
- `time_range` (string, optional): `1M`, `3M`, `6M`, `1Y`, `ALL` (default: `1Y`)

**Response** (200):
```json
{
  "total_invested": 140000.00,
  "current_value": 150000.00,
  "total_return": 10000.00,
  "total_return_percentage": 7.14,
  "annualized_return": 8.5,
  "sharpe_ratio": 1.2,
  "volatility": 12.5,
  "beta": 0.95,
  "alpha": 2.3,
  "max_drawdown": -5.2,
  "win_rate": 65.5,
  "average_holding_period": 45,
  "asset_allocation": {
    "stocks": 66.67,
    "bonds": 20.00,
    "crypto": 10.00,
    "other": 3.33
  },
  "sector_allocation": {
    "technology": 35.0,
    "healthcare": 20.0,
    "finance": 15.0
  },
  "performance_by_period": {
    "1M": 3.57,
    "3M": 8.2,
    "6M": 12.5,
    "1Y": 15.3
  }
}
```

### Get Investment Recommendations
**GET** `/investment/recommendations`

**Headers**: `Authorization: Bearer <token>`

**Query Parameters**:
- `limit` (integer, optional): Number of recommendations (1-50, default: 10)
- `type` (string, optional): `buy`, `sell`, `hold`, `diversify` (default: `all`)

**Response** (200):
```json
{
  "data": [
    {
      "id": "uuid",
      "type": "buy",
      "symbol": "MSFT",
      "name": "Microsoft Corporation",
      "reason": "Strong fundamentals and growth potential",
      "confidence": 85,
      "current_price": 350.00,
      "target_price": 380.00,
      "potential_return": 8.57,
      "risk_level": "medium",
      "time_horizon": "6-12 months",
      "created_at": "2024-01-01T00:00:00Z"
    }
  ],
  "portfolio_insights": {
    "diversification_score": 75,
    "risk_level": "moderate",
    "suggested_actions": [
      "Consider adding more bonds for diversification",
      "Reduce concentration in technology sector"
    ]
  }
}
```

---

## Analytics APIs

### Track Event
**POST** `/analytics/track`

**Headers**: `Authorization: Bearer <token>`

**Request Body**:
```json
{
  "event": "button_click",
  "properties": {
    "button_name": "buy_stock",
    "page": "dashboard"
  }
}
```

**Response** (200):
```json
{
  "message": "Event tracked successfully"
}
```

### Identify User
**POST** `/analytics/identify`

**Headers**: `Authorization: Bearer <token>`

**Request Body**:
```json
{
  "properties": {
    "subscription_plan": "premium",
    "account_type": "individual"
  }
}
```

**Response** (200):
```json
{
  "message": "User identified successfully"
}
```

### Get Analytics Dashboard
**GET** `/analytics/dashboard`

**Headers**: `Authorization: Bearer <token>`

**Response** (200):
```json
{
  "user_id": "uuid",
  "posthog_configured": true,
  "dashboard_url": "https://app.posthog.com",
  "tracking_enabled": true,
  "features": {
    "event_tracking": true,
    "user_identification": true,
    "batch_tracking": true,
    "page_view_tracking": true
  }
}
```

---

## Accounts & Banking APIs

### Get My Accounts
**GET** `/accounts/me`

**Headers**: `Authorization: Bearer <token>`

**Response** (200):
```json
{
  "id": "uuid",
  "account_type": "individual",
  "account_name": "John Doe",
  "is_joint": false,
  "tax_id": "123-45-6789",
  "created_at": "2024-01-01T00:00:00Z"
}
```

### Get Account Stats
**GET** `/accounts/stats`

**Headers**: `Authorization: Bearer <token>`

**Response** (200):
```json
{
  "account_age_days": 365,
  "total_transactions": 150,
  "portfolio_value": 150000.00,
  "kyc_status": "approved",
  "subscription_status": "active",
  "is_verified": true,
  "is_joint": false
}
```

### List User Accounts
**GET** `/accounts`

**Headers**: `Authorization: Bearer <token>`

**Query Parameters**:
- `type` (string, optional): `checking`, `savings`, `investment`, `brokerage`, `all` (default: `all`)

**Response** (200):
```json
{
  "data": [
    {
      "id": "uuid",
      "name": "Primary Checking",
      "type": "checking",
      "masked_number": "****4932",
      "balance": 5000.00,
      "currency": "USD",
      "available_balance": 5000.00
    }
  ]
}
```

### Get Banking Accounts
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

---

## Assets APIs

### Get Assets Summary
**GET** `/assets/summary`

**Headers**: `Authorization: Bearer <token>`

**Response** (200):
```json
{
  "total_value": 150000.00,
  "total_count": 15,
  "by_type": {
    "stock": {
      "count": 10,
      "value": 100000.00
    },
    "crypto": {
      "count": 3,
      "value": 30000.00
    }
  },
  "currency": "USD"
}
```

### Get Assets Value Trends
**GET** `/assets/value-trends`

**Headers**: `Authorization: Bearer <token>`

**Query Parameters**:
- `days` (integer, optional): Number of days (1-365, default: 30)
- `asset_type` (string, optional): Filter by asset type

**Response** (200):
```json
{
  "data": [
    {
      "date": "2024-01-01",
      "value": 140000.00,
      "currency": "USD"
    }
  ]
}
```

---

## Payments APIs

### Get Payment History
**GET** `/payments/history`

**Headers**: `Authorization: Bearer <token>`

**Response** (200):
```json
[
  {
    "id": "uuid",
    "amount": 100.00,
    "currency": "USD",
    "payment_method": "card",
    "status": "completed",
    "stripe_payment_intent_id": "pi_xxx",
    "created_at": "2024-01-01T00:00:00Z"
  }
]
```

### Get Payment Stats
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

### Create Payment Intent
**POST** `/payments/create-intent`

**Headers**: `Authorization: Bearer <token>`

**Request Body**:
```json
{
  "amount": 100.00,
  "currency": "USD",
  "payment_method": "card",
  "description": "Payment for subscription"
}
```

**Response** (201):
```json
{
  "id": "uuid",
  "amount": 100.00,
  "currency": "USD",
  "payment_method": "card",
  "status": "pending",
  "stripe_payment_intent_id": "pi_xxx",
  "created_at": "2024-01-01T00:00:00Z"
}
```

---

## Reports APIs

### Get Report Statistics
**GET** `/reports/statistics`

**Headers**: `Authorization: Bearer <token>`

**Query Parameters**:
- `date_range_start` (string, optional): ISO 8601 date
- `date_range_end` (string, optional): ISO 8601 date

**Response** (200):
```json
{
  "total_tasks_received": 50,
  "tasks_solved": 45,
  "tasks_unresolved": 5,
  "performance_trends": {
    "tickets": {
      "total": 30,
      "solved": 28,
      "unresolved": 2
    },
    "appraisals": {
      "total": 20,
      "solved": 17,
      "unresolved": 3
    }
  }
}
```

### Generate Report
**POST** `/reports/generate`

**Headers**: `Authorization: Bearer <token>`

**Request Body**:
```json
{
  "report_type": "portfolio",
  "date_range": {
    "start_date": "2024-01-01T00:00:00Z",
    "end_date": "2024-12-31T23:59:59Z"
  },
  "filters": {
    "asset_type": "stock"
  },
  "format": "pdf"
}
```

**Response** (201):
```json
{
  "id": "uuid",
  "status": "generating",
  "report_type": "portfolio",
  "format": "pdf",
  "created_at": "2024-01-01T00:00:00Z",
  "generated_at": null
}
```

---

## Notifications APIs

### Get Notifications
**GET** `/notifications`

**Headers**: `Authorization: Bearer <token>`

**Query Parameters**:
- `unread_only` (boolean, optional): Filter unread notifications

**Response** (200):
```json
[
  {
    "id": "uuid",
    "notification_type": "order_filled",
    "title": "Order Filled",
    "message": "Your order for AAPL has been filled",
    "is_read": false,
    "created_at": "2024-01-01T00:00:00Z"
  }
]
```

### Mark Notification as Read
**POST** `/notifications/{notification_id}/read`

**Headers**: `Authorization: Bearer <token>`

**Response** (200):
```json
{
  "message": "Notification marked as read"
}
```

### Get Unread Count
**GET** `/notifications/unread-count`

**Headers**: `Authorization: Bearer <token>`

**Response** (200):
```json
{
  "count": 5
}
```

---

## Error Responses

All endpoints may return the following error responses:

### 400 Bad Request
```json
{
  "detail": "Invalid request parameters"
}
```

### 401 Unauthorized
```json
{
  "detail": "Not authenticated"
}
```

### 403 Forbidden
```json
{
  "detail": "Insufficient permissions"
}
```

### 404 Not Found
```json
{
  "detail": "Resource not found"
}
```

### 500 Internal Server Error
```json
{
  "detail": "Internal server error"
}
```

---

## Notes

1. **Authentication**: Include `Authorization: Bearer <token>` header in all authenticated requests
2. **Date Formats**: Use ISO 8601 format (e.g., `2024-01-01T00:00:00Z`)
3. **Currency**: All monetary values are in decimal format (e.g., `150000.00`)
4. **Pagination**: Some endpoints support pagination with `page` and `limit` query parameters
5. **Rate Limiting**: API requests may be rate-limited. Check response headers for rate limit information

---

**Last Updated**: 2024-01-01  
**API Version**: v1
