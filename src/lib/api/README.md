# API Structure Documentation

This directory contains the API client and service files for making HTTP requests to the backend.

## Folder Structure

```
src/
├── config/
│   └── api.js              # Centralized API configuration (base URL, endpoints)
├── lib/
│   └── api/
│       ├── client.js       # Base API client with common functionality
│       └── README.md       # This file
└── utils/
    └── authApi.js          # Authentication API service
```

## Configuration

### `src/config/api.js`

Centralized configuration for all API endpoints:

- **Base URL**: `https://akunuba-backend.onrender.com` (can be overridden via `NEXT_PUBLIC_API_BASE_URL` env variable)
- **API Version**: `v1`
- **Endpoints**: All API endpoints are defined here for easy maintenance

**Usage:**
```javascript
import { API_BASE_URL, API_ENDPOINTS, getApiUrl } from '@/config/api';

// Get full URL for an endpoint
const loginUrl = getApiUrl(API_ENDPOINTS.AUTH.LOGIN);
```

## Base API Client

### `src/lib/api/client.js`

Provides reusable API request functions:

- `apiRequest()` - Generic request handler with logging
- `apiGet()` - GET requests
- `apiPost()` - POST requests
- `apiPut()` - PUT requests
- `apiPatch()` - PATCH requests
- `apiDelete()` - DELETE requests

**Features:**
- Automatic authorization header injection (Bearer token)
- Comprehensive request/response logging
- Error handling and logging
- Duration tracking

**Usage:**
```javascript
import { apiPost, apiGet } from '@/lib/api/client';
import { API_ENDPOINTS } from '@/config/api';

// POST request
const response = await apiPost(API_ENDPOINTS.AUTH.LOGIN, {
  email: 'user@example.com',
  password: 'password123'
});

// GET request
const data = await apiGet(API_ENDPOINTS.USER.PROFILE);
```

## Authentication API

### `src/utils/authApi.js`

Authentication-specific API functions:

- `register()` - User registration
- `login()` - User login
- `refreshToken()` - Refresh access token
- `requestOTP()` - Request OTP code
- `verifyOTP()` - Verify OTP code
- `requestPasswordReset()` - Request password reset link
- `resetPassword()` - Reset password with token
- `verifyEmail()` - Verify email address
- `resendVerificationEmail()` - Resend verification email

**Usage:**
```javascript
import { login, register } from '@/utils/authApi';

// Login
const response = await login('user@example.com', 'password123');

// Register
const response = await register({
  email: 'user@example.com',
  password: 'password123',
  firstName: 'John',
  lastName: 'Doe',
  phone: '+1234567890'
});
```

## Adding New API Services

To add a new API service:

1. **Add endpoints to `src/config/api.js`:**
```javascript
export const API_ENDPOINTS = {
  AUTH: { ... },
  USER: {
    BASE: '/users',
    PROFILE: '/users/profile',
    UPDATE_PROFILE: '/users/profile',
  },
};
```

2. **Create service file in `src/utils/` or `src/lib/api/`:**
```javascript
import { API_ENDPOINTS } from '@/config/api';
import { apiGet, apiPost } from '@/lib/api/client';

export const getUserProfile = async () => {
  return await apiGet(API_ENDPOINTS.USER.PROFILE);
};

export const updateUserProfile = async (data) => {
  return await apiPost(API_ENDPOINTS.USER.UPDATE_PROFILE, data);
};
```

## Environment Variables

Set `NEXT_PUBLIC_API_BASE_URL` in your `.env.local` file to override the default base URL:

```env
NEXT_PUBLIC_API_BASE_URL=http://localhost:8000
```

## Logging

All API requests are automatically logged with:
- Request method and endpoint
- Request body (sanitized)
- Response status and data
- Duration
- Errors (if any)

Logs are prefixed with `[API]`, `[API SUCCESS]`, or `[API ERROR]` for easy filtering.

