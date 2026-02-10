/**
 * Authentication API Service
 * Handles all authentication-related API calls
 */

import { API_ENDPOINTS } from '@/config/api';
import { apiPost, apiGet, apiPut, apiDelete } from '@/lib/api/client';

/**
 * 1. User Registration
 * POST /api/v1/auth/register
 */
export const register = async (userData) => {
  const response = await apiPost(API_ENDPOINTS.AUTH.REGISTER, {
    email: userData.email,
    password: userData.password,
    first_name: userData.firstName,
    last_name: userData.lastName,
    phone: userData.phone,
  });

  // Store tokens
  if (response.access_token && response.refresh_token) {
    if (typeof window !== 'undefined') {
      localStorage.setItem('access_token', response.access_token);
      localStorage.setItem('refresh_token', response.refresh_token);
    }
  }

  return response;
};

/**
 * 2. User Login
 * POST /api/v1/auth/login
 * 
 * @param {string} email - User email
 * @param {string} password - User password
 * @param {string} totpCode - Optional 2FA code (required if 2FA is enabled)
 * 
 * Returns: 
 * - If 2FA required: { requires_2fa: true, temp_token: "...", message: "..." }
 * - If login successful: { access_token, refresh_token, token_type, user }
 * 
 * User object contains: { id, role, is_verified, is_kyc_verified, is_email_verified }
 */
export const login = async (email, password, totpCode = null) => {
  const requestBody = {
    email,
    password,
  };

  // Add totp_code if provided (for 2FA verification)
  if (totpCode) {
    requestBody.totp_code = totpCode;
  }

  const response = await apiPost(API_ENDPOINTS.AUTH.LOGIN, requestBody);

  // Store tokens only if login is complete (not just 2FA required)
  if (response.access_token && response.refresh_token) {
    if (typeof window !== 'undefined') {
      localStorage.setItem('access_token', response.access_token);
      localStorage.setItem('refresh_token', response.refresh_token);
      
      // Store user info if available
      if (response.user) {
        localStorage.setItem('user_info', JSON.stringify(response.user));
      }
    }
  }

  return response;
};

/**
 * 3. Refresh Token
 * POST /api/v1/auth/refresh
 */
export const refreshToken = async (refreshTokenValue) => {
  const response = await apiPost(API_ENDPOINTS.AUTH.REFRESH, {
    refresh_token: refreshTokenValue,
  });

  // Update stored tokens
  if (response.access_token && response.refresh_token) {
    if (typeof window !== 'undefined') {
      localStorage.setItem('access_token', response.access_token);
      localStorage.setItem('refresh_token', response.refresh_token);
    }
  }

  return response;
};

/**
 * 4. Request OTP
 * POST /api/v1/auth/request-otp
 */
export const requestOTP = async (email) => {
  return await apiPost(API_ENDPOINTS.AUTH.REQUEST_OTP, {
    email,
  });
};

/**
 * 5. Verify OTP
 * POST /api/v1/auth/verify-otp
 */
export const verifyOTP = async (email, otpCode) => {
  try {
    const response = await apiPost(API_ENDPOINTS.AUTH.VERIFY_OTP, {
      email,
      otp_code: otpCode,
    });
    return response;
  } catch (error) {
    throw error;
  }
};

/**
 * 6. Request Password Reset
 * POST /api/v1/auth/request-password-reset
 */
export const requestPasswordReset = async (email) => {
  return await apiPost(API_ENDPOINTS.AUTH.REQUEST_PASSWORD_RESET, {
    email,
  });
};

/**
 * 7. Reset Password
 * POST /api/v1/auth/reset-password
 */
export const resetPassword = async (token, newPassword) => {
  return await apiPost(API_ENDPOINTS.AUTH.RESET_PASSWORD, {
    token,
    new_password: newPassword,
  });
};

/**
 * 8. Verify Email
 * POST /api/v1/auth/verify-email
 */
export const verifyEmail = async (token) => {
  return await apiPost(API_ENDPOINTS.AUTH.VERIFY_EMAIL, {
    token,
  });
};

/**
 * 9. Resend Verification Email
 * POST /api/v1/auth/resend-verification
 */
export const resendVerificationEmail = async (email) => {
  return await apiPost(API_ENDPOINTS.AUTH.RESEND_VERIFICATION, {
    email,
  });
};

/**
 * Get stored access token
 */
export const getAccessToken = () => {
  if (typeof window !== 'undefined') {
    return localStorage.getItem('access_token');
  }
  return null;
};

/**
 * Get stored refresh token
 */
export const getRefreshToken = () => {
  if (typeof window !== 'undefined') {
    return localStorage.getItem('refresh_token');
  }
  return null;
};

/**
 * Clear stored tokens and user info
 */
export const clearTokens = () => {
  if (typeof window !== 'undefined') {
    localStorage.removeItem('access_token');
    localStorage.removeItem('refresh_token');
    localStorage.removeItem('user_info');
  }
};

/**
 * Check if user is authenticated
 */
export const isAuthenticated = () => {
  return !!getAccessToken();
};

/**
 * Get current user profile
 * GET /api/v1/users/me
 */
export const getUserProfile = async () => {
  return await apiGet(API_ENDPOINTS.USERS.PROFILE);
};

/**
 * Update user profile
 * PUT /api/v1/users/me
 */
export const updateUserProfile = async (profileData) => {
  return await apiPut(API_ENDPOINTS.USERS.UPDATE_PROFILE, profileData);
};

// ============================================
// Notification Preferences APIs
// ============================================

/**
 * Get notification preferences
 * GET /api/v1/users/notifications
 */
export const getNotificationPreferences = async () => {
  return await apiGet(API_ENDPOINTS.USERS.NOTIFICATIONS);
};

/**
 * Update notification preferences
 * PUT /api/v1/users/notifications
 */
export const updateNotificationPreferences = async (preferences) => {
  return await apiPut(API_ENDPOINTS.USERS.NOTIFICATIONS, preferences);
};

// ============================================
// Privacy Preferences APIs
// ============================================

/**
 * Get privacy preferences
 * GET /api/v1/users/privacy
 */
export const getPrivacyPreferences = async () => {
  return await apiGet(API_ENDPOINTS.USERS.PRIVACY);
};

/**
 * Update privacy preferences
 * PUT /api/v1/users/privacy
 */
export const updatePrivacyPreferences = async (preferences) => {
  return await apiPut(API_ENDPOINTS.USERS.PRIVACY, preferences);
};

// ============================================
// Two-Factor Authentication APIs
// ============================================

/**
 * Get 2FA status
 * GET /api/v1/users/two-factor-auth/status
 */
export const get2FAStatus = async () => {
  return await apiGet(API_ENDPOINTS.USERS.TWO_FACTOR_AUTH_STATUS);
};

/**
 * Setup 2FA (Generate QR code and backup codes)
 * POST /api/v1/users/two-factor-auth/setup
 */
export const setup2FA = async () => {
  return await apiPost(API_ENDPOINTS.USERS.TWO_FACTOR_AUTH_SETUP);
};

/**
 * Verify 2FA setup with TOTP code
 * POST /api/v1/users/two-factor-auth/verify
 */
export const verify2FA = async (code) => {
  return await apiPost(API_ENDPOINTS.USERS.TWO_FACTOR_AUTH_VERIFY, {
    code,
  });
};

/**
 * Toggle 2FA (Enable/Disable)
 * PUT /api/v1/users/two-factor-auth
 */
export const toggle2FA = async (enabled) => {
  return await apiPut(API_ENDPOINTS.USERS.TWO_FACTOR_AUTH, {
    enabled,
  });
};

// ============================================
// Password Management APIs
// ============================================

/**
 * Change password
 * PUT /api/v1/users/change-password
 */
export const changePassword = async (
  currentPassword,
  newPassword,
  confirmPassword
) => {
  return await apiPut(API_ENDPOINTS.USERS.CHANGE_PASSWORD, {
    current_password: currentPassword,
    new_password: newPassword,
    confirm_password: confirmPassword,
  });
};

// ============================================
// Account Management APIs
// ============================================

/**
 * Deactivate account (soft delete)
 * POST /api/v1/users/deactivate
 */
export const deactivateAccount = async (reason, password) => {
  return await apiPost(API_ENDPOINTS.USERS.DEACTIVATE_ACCOUNT, {
    reason: reason || null,
    password_confirmation: password,
  });
};

/**
 * Delete account (hard delete - permanent)
 * POST /api/v1/users/delete
 */
export const deleteAccount = async (password, confirmationText) => {
  return await apiPost(API_ENDPOINTS.USERS.DELETE_ACCOUNT, {
    password_confirmation: password,
    confirmation_text: confirmationText,
  });
};
