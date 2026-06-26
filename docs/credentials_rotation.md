# Credentials Rotation Guide

This document lists every secret the backend consumes, the risk level if leaked, and the steps to rotate it. **Rotate all keys that were ever in a committed `.env` file immediately.**

---

## Priority: Rotate Now

These must be rotated before any further deployments if the `.env` was committed to git history:

| Env Var | Service | Rotate At |
|---|---|---|
| `STRIPE_SECRET_KEY` | Stripe — server-side charges, subscriptions | Stripe Dashboard → Developers → API keys |
| `STRIPE_WEBHOOK_SECRET` | Stripe — webhook signature verification | Stripe Dashboard → Developers → Webhooks → roll secret |
| `SUPABASE_SERVICE_ROLE_KEY` | Supabase — full DB admin access (bypasses RLS) | Supabase Dashboard → Project Settings → API |
| `SUPABASE_JWT_SECRET` | Supabase — verifies all user JWTs | Supabase Dashboard → Project Settings → API |
| `SECRET_KEY` | App — signs internal JWTs and sessions | Generate a new 64-char random hex string, update env |
| `ANTHROPIC_API_KEY` | Claude AI — AI appraisals and reviews | console.anthropic.com → API Keys |
| `PERSONA_API_KEY` | Persona — KYC identity verification | Persona Dashboard → API Keys |
| `PERSONA_WEBHOOK_SECRET` | Persona — webhook signature verification | Persona Dashboard → Webhooks |
| `PLAID_SECRET_KEY` | Plaid — bank account data | Plaid Dashboard → Keys |
| `PLAID_WEBHOOK_SECRET` | Plaid — webhook signature verification | Plaid Dashboard → Webhooks |
| `GOOGLE_CLIENT_SECRET` | Google OAuth2 | Google Cloud Console → APIs & Services → Credentials |
| `RESEND_API_KEY` | Transactional email | resend.com → API Keys |
| `DATABASE_URL` | PostgreSQL — full DB access | Supabase Dashboard → Project Settings → Database → Reset password |

---

## Rotate When Convenient (Low Blast Radius)

These have more limited scope but should still be rotated if exposed:

| Env Var | Service | Rotate At |
|---|---|---|
| `STRIPE_PUBLISHABLE_KEY` | Stripe — client-facing only, not a real secret | Stripe Dashboard → Developers → API keys |
| `SUPABASE_ANON_KEY` | Supabase — public key, respects RLS | Supabase Dashboard → Project Settings → API |
| `SENDBIRD_API_TOKEN` | Sendbird chat | Sendbird Dashboard → Settings → General |
| `REDIS_URL` | Redis — includes password in DSN | Update Redis auth, change DSN |
| `POLYGON_API_KEY` | Polygon.io market data | app.polygon.io → Dashboard → API Keys |
| `POLYGON_S3_ACCESS_KEY_ID` / `POLYGON_S3_SECRET_ACCESS_KEY` | Polygon S3 storage | Polygon Dashboard |
| `ALPACA_SECRET_KEY` / `ALPACA_OAUTH_CLIENT_SECRET` | Alpaca brokerage | alpaca.markets → Paper/Live → API Keys |
| `CLOUDFLARE_API_TOKEN` | Cloudflare DNS/CDN | Cloudflare Dashboard → My Profile → API Tokens |
| `POSTHOG_API_KEY` / `POSTHOG_PROJECT_API_KEY` | PostHog analytics | PostHog Dashboard → Project Settings → API Keys |
| `SENTRY_DSN` | Sentry error tracking | Sentry Dashboard → Settings → Client Keys |

---

## Rotation Procedure

### 1. Generate new secrets

For `SECRET_KEY`:
```bash
python -c "import secrets; print(secrets.token_hex(64))"
```

For webhook secrets: use the new value shown in each dashboard after rolling.

### 2. Update production environment

Update the values in your hosting environment (Railway, Render, fly.io, Supabase environment, etc.) **before** deleting the old keys.

### 3. Deploy

Restart the application so the new secrets are loaded. Verify health endpoint responds.

### 4. Revoke old keys

Only revoke the old keys after the new deployment is confirmed healthy.

### 5. Purge git history (if .env was committed)

```bash
# Install BFG Repo Cleaner (https://rtyley.github.io/bfg-repo-cleaner/)
bfg --delete-files .env
git reflog expire --expire=now --all && git gc --prune=now --aggressive
git push --force-with-lease origin main
```

All collaborators must re-clone after the force push. Notify the team.

---

## Webhook Secrets — Special Note

Webhook signature secrets are **not** the same as API keys. Each service (Stripe, Persona, Plaid) signs outbound webhook payloads with a secret you set in their dashboard. The backend verifies this on every webhook call. If these are exposed, an attacker can forge webhook events (fake payments, fake KYC approvals).

**After rotating webhook secrets:**
1. Update the env var on the server.
2. Restart the app.
3. Send a test event from each dashboard to confirm verification still passes.

---

## Rotation Schedule (Ongoing)

| Credential type | Recommended rotation interval |
|---|---|
| `SECRET_KEY` | Every 90 days |
| `STRIPE_SECRET_KEY` | Every 6 months or on staff change |
| `SUPABASE_SERVICE_ROLE_KEY` | Every 6 months or on staff change |
| `ANTHROPIC_API_KEY` | Every 6 months |
| `PERSONA_API_KEY` | Every 6 months |
| Webhook secrets | On suspected compromise only |
| `DATABASE_URL` password | On staff change or annually |
| OAuth client secrets | On staff change or annually |

---

## Environment Variable Checklist

Required at boot — the app will refuse to start without these:

- [ ] `DATABASE_URL`
- [ ] `SUPABASE_URL`
- [ ] `SUPABASE_ANON_KEY`
- [ ] `SUPABASE_SERVICE_ROLE_KEY`
- [ ] `SUPABASE_JWT_SECRET`
- [ ] `SECRET_KEY`
- [ ] `STRIPE_SECRET_KEY`
- [ ] `STRIPE_PUBLISHABLE_KEY`
- [ ] `STRIPE_WEBHOOK_SECRET`
- [ ] `ANTHROPIC_API_KEY`
- [ ] `PERSONA_API_KEY`
- [ ] `SENDBIRD_APP_ID`
- [ ] `SENDBIRD_API_TOKEN`

Optional but strongly recommended for production:

- [ ] `REDIS_URL`
- [ ] `SENTRY_DSN`
- [ ] `PERSONA_WEBHOOK_SECRET`
- [ ] `PLAID_SECRET_KEY` + `PLAID_WEBHOOK_SECRET`
- [ ] `RESEND_API_KEY`
- [ ] `GOOGLE_CLIENT_ID` + `GOOGLE_CLIENT_SECRET`
