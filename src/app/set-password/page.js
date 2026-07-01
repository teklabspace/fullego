'use client';

// The advisor invite email links here: /set-password?token=<token>.
// It reuses the reset-password screen, which switches to token mode when a
// `?token=` is present and posts { token, new_password } to /auth/reset-password.
import ResetPasswordPage from '../reset-password/page';

export default function SetPasswordPage() {
  return <ResetPasswordPage />;
}
