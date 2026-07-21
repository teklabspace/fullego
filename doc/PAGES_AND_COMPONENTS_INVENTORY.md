# Frontend Pages & Major Components Inventory

**Generated:** March 2026  
**Purpose:** List all pages and major components by feature, estimate distinct screens, and compare to expected platform features.

---

## 1. All Pages (by feature)

### Public & marketing

| Route | File | Notes |
|-------|------|--------|
| `/` | `app/page.js` | Landing / home |
| `/akunuba` | `app/akunuba/page.js` | Akunuba brand/landing |
| `/marketplace` | `app/marketplace/page.js` | Public marketplace (listings) |
| `/about` | `app/about/page.js` | About |
| `/plans` | `app/plans/page.js` | Plans / pricing |
| `/careers` | `app/careers/page.js` | Careers |
| `/press` | `app/press/page.js` | Press |
| `/help-center` | `app/help-center/page.js` | Help center |
| `/contact` | `app/contact/page.js` | Contact |
| `/support` | `app/support/page.js` | Public support |
| `/concierge` | `app/concierge/page.js` | Public concierge |
| `/welcome` | `app/welcome/page.js` | Post-signup welcome |

### Legal & preferences (public or post-auth)

| Route | File | Notes |
|-------|------|--------|
| `/terms` | `app/terms/page.js` | Terms of service |
| `/privacy` | `app/privacy/page.js` | Privacy policy |
| `/cookies` | `app/cookies/page.js` | Cookie policy |
| `/security` | `app/security/page.js` | Security info |

### Authentication & onboarding

| Route | File | Notes |
|-------|------|--------|
| `/login` | `app/login/page.js` | Login |
| `/signup` | `app/signup/page.js` | Signup |
| `/forgot-password` | `app/forgot-password/page.js` | Forgot password (OTP) |
| `/reset-password` | `app/reset-password/page.js` | Reset password |
| `/verify-email` | `app/verify-email/page.js` | Email verification |
| `/verification-success` | `app/verification-success/page.js` | Verification success |
| `/choose-profile` | `app/choose-profile/page.js` | Choose profile type |

### KYC / identity verification

| Route | File | Notes |
|-------|------|--------|
| `/kyc-verification` | `app/kyc-verification/page.js` | KYC start / flow |
| `/kyc/verification-complete` | `app/kyc/verification-complete/page.js` | KYC complete |
| `/document-verification` | `app/document-verification/page.js` | Document upload |
| `/identity-verification` | `app/identity-verification/page.js` | Identity verification |

### Dashboard (main & analytics)

| Route | File | Notes |
|-------|------|--------|
| `/dashboard` | `app/dashboard/page.js` | Main dashboard |
| `/dashboard/analytics` | `app/dashboard/analytics/page.js` | Analytics |
| `/dashboard/kyc` | `app/dashboard/kyc/page.js` | KYC status (dashboard) |

### Portfolio

| Route | File | Notes |
|-------|------|--------|
| `/dashboard/portfolio/Overview` | `app/dashboard/portfolio/Overview/page.js` | Portfolio overview |
| `/dashboard/portfolio/crypto` | `app/dashboard/portfolio/crypto/page.js` | Crypto portfolio |
| `/dashboard/portfolio/cash-flow` | `app/dashboard/portfolio/cash-flow/page.js` | Cash flow (tabs: last30, thisMonth, custom) |
| `/dashboard/portfolio/trade-engine` | `app/dashboard/portfolio/trade-engine/page.js` | Trade engine |

### Investment

| Route | File | Notes |
|-------|------|--------|
| `/dashboard/investment` | `app/dashboard/investment/page.js` | **Redirect only** → `/dashboard/investment/overview` |
| `/dashboard/investment/overview` | `app/dashboard/investment/overview/page.js` | Investment overview |
| `/dashboard/investment/goals-tracker` | `app/dashboard/investment/goals-tracker/page.js` | Goals tracker |
| `/dashboard/investment/strategies` | `app/dashboard/investment/strategies/page.js` | Strategies list |
| `/dashboard/investment/strategies/[id]` | `app/dashboard/investment/strategies/[id]/page.js` | Strategy detail |
| `/dashboard/investment/crypto-marketplace` | `app/dashboard/investment/crypto-marketplace/page.js` | Crypto marketplace |
| `/dashboard/investments` | `app/dashboard/investments/page.js` | **Legacy** – hardcoded data; not in main nav |

### Marketplace (authenticated)

| Route | File | Notes |
|-------|------|--------|
| `/dashboard/marketplace` | `app/dashboard/marketplace/page.js` | Browse + watchlist (tabs: browse, active-offers) |
| `/dashboard/marketplace/[id]` | `app/dashboard/marketplace/[id]/page.js` | Listing detail (+ InvestmentDetailClient) |
| `/dashboard/marketplace/active-offers` | `app/dashboard/marketplace/active-offers/page.js` | Active offers |

### Assets

| Route | File | Notes |
|-------|------|--------|
| `/dashboard/assets` | `app/dashboard/assets/page.js` | Assets list |
| `/dashboard/assets/add` | `app/dashboard/assets/add/page.js` | Add asset |
| `/dashboard/assets/detail` | `app/dashboard/assets/detail/page.js` | Asset detail (query `?id=`) – uses AssetDetailClient |

### Reports & CRM

| Route | File | Notes |
|-------|------|--------|
| `/dashboard/reports` | `app/dashboard/reports/page.js` | Reports (tabs: tasks, updates) |
| `/dashboard/reports/crm` | `app/dashboard/reports/crm/page.js` | CRM dashboard (tabs: overview, tasks, updates) |

### Documents

| Route | File | Notes |
|-------|------|--------|
| `/dashboard/documents` | `app/dashboard/documents/page.js` | Documents (category tabs: Identity, etc.) |

### Support & concierge (dashboard)

| Route | File | Notes |
|-------|------|--------|
| `/dashboard/support` | `app/dashboard/support/page.js` | Support tickets |
| `/dashboard/support-dashboard` | `app/dashboard/support-dashboard/page.js` | Support + chat (tabs: support, reports) |
| `/dashboard/concierge` | `app/dashboard/concierge/page.js` | Concierge / appraisals |

### Entity & compliance

| Route | File | Notes |
|-------|------|--------|
| `/dashboard/entity-structure` | `app/dashboard/entity-structure/page.js` | Entity structure (tabs: people, audit) |
| `/dashboard/compliance` | `app/dashboard/compliance/page.js` | Compliance |

### Notifications, referral, transactions, settings

| Route | File | Notes |
|-------|------|--------|
| `/dashboard/notifications` | `app/dashboard/notifications/page.js` | Notifications (tabs: all, unread) |
| `/dashboard/referral` | `app/dashboard/referral/page.js` | Referrals |
| `/dashboard/transactions` | `app/dashboard/transactions/page.js` | Transactions |
| `/dashboard/settings` | `app/dashboard/settings/page.js` | Settings (tabs: profile, linked, payment) |
| `/settings` | `app/settings/page.js` | Standalone settings (tabs: basic, notification, Task & Reminders) |

---

## 2. Major Components (by feature)

### Dashboard shell & layout

| Component | Path | Purpose |
|-----------|------|---------|
| DashboardLayout | `components/dashboard/DashboardLayout.jsx` | Wraps dashboard pages (sidebar + content) |
| Sidebar | `components/dashboard/Sidebar.jsx` | Main nav (sections, submenus) |
| Navbar | `components/dashboard/Navbar.jsx` | Dashboard top bar |
| ProfileDropdown | `components/dashboard/ProfileDropdown.jsx` | User menu |
| NotificationDropdown | `components/dashboard/NotificationDropdown.jsx` | Notifications in header |

### Dashboard modals & overlays

| Component | Path | Purpose |
|-----------|------|---------|
| AssignmentModal | `components/dashboard/AssignmentModal.jsx` | Assign user (e.g. ticket, appraisal) |
| NewTicketModal | `components/dashboard/NewTicketModal.jsx` | Create support ticket |
| DocumentUploadModal | `components/dashboard/DocumentUploadModal.jsx` | Upload document (concierge/support) |

### Auth & layout (public)

| Component | Path | Purpose |
|-----------|------|---------|
| SecureRoute | `components/auth/SecureRoute.jsx` | Protects authenticated routes |
| Layout | `components/layout/Layout.jsx` | Generic layout |
| Navbar | `components/layout/Navbar.jsx` | Public nav |
| Footer | `components/layout/Footer.jsx` | Footer |

### Verification (KYC / onboarding)

| Component | Path | Purpose |
|-----------|------|---------|
| VerificationLayout | `components/verification/VerificationLayout.jsx` | Wraps verification steps |
| Stepper | `components/verification/Stepper.jsx` | Step indicator |
| UploadArea | `components/verification/UploadArea.jsx` | Document upload area |
| PersonaVerification | `components/verification/PersonaVerification.jsx` | Persona verification UI |

### Documents

| Component | Path | Purpose |
|-----------|------|---------|
| ShareDocumentModal | `components/documents/ShareDocumentModal.jsx` | Share document |
| FileUploadModal | `components/documents/FileUploadModal.jsx` | File upload |
| UploadSuccessModal | `components/documents/UploadSuccessModal.jsx` | Upload success |
| DocumentPreviewModal | `components/documents/DocumentPreviewModal.jsx` | Document preview |

### Reports

| Component | Path | Purpose |
|-----------|------|---------|
| TasksView | `components/reports/TasksView.jsx` | Tasks / reports view |
| ScheduleView | `components/reports/ScheduleView.jsx` | Schedule view |

### Client-only “screen” components (used by a page)

| Component | Path | Used by |
|-----------|------|--------|
| AssetDetailClient | `app/dashboard/assets/[id]/AssetDetailClient.js` | `assets/detail` page (query id) |
| InvestmentDetailClient | `app/dashboard/marketplace/[id]/InvestmentDetailClient.js` | `marketplace/[id]` page |

### Landing / marketing sections

| Component | Path | Purpose |
|-----------|------|---------|
| Hero | `components/sections/Hero.jsx` | Hero section |
| FirstSection | `components/sections/FirstSection.jsx` | First section |
| WealthSolutions | `components/sections/WealthSolutions.jsx` | Wealth solutions |
| HowToGetStarted | `components/sections/HowToGetStarted.jsx` | How to get started |
| FAQ | `components/sections/FAQ.jsx` | FAQ |

### UI primitives

| Component | Path | Purpose |
|-----------|------|---------|
| Button | `components/ui/Button.jsx` | Button |
| OutlineButton | `components/ui/OutlineButton.jsx` | Outline button |
| GradientButton | `components/ui/GradientButton.jsx` | Gradient button |
| GlassCard | `components/ui/GlassCard.jsx` | Glass card |
| Modal | `components/ui/Modal.jsx` | Modal |
| Select | `components/ui/Select.jsx` | Select |
| Container | `components/ui/Container.jsx` | Container |
| StatusBadge | `components/ui/StatusBadge.jsx` | Status badge |

### Skeletons (loading)

| Component | Path | Purpose |
|-----------|------|---------|
| PortfolioOverviewSkeleton | `components/skeletons/PortfolioOverviewSkeleton.jsx` | Portfolio overview loading |
| CryptoPortfolioSkeleton | `components/skeletons/CryptoPortfolioSkeleton.jsx` | Crypto loading |
| CashFlowSkeleton | `components/skeletons/CashFlowSkeleton.jsx` | Cash flow loading |
| TradeEngineSkeleton | `components/skeletons/TradeEngineSkeleton.jsx` | Trade engine loading |
| AssetCardSkeleton | `components/skeletons/AssetCardSkeleton.jsx` | Asset card loading |
| AssetDetailSkeleton | `components/skeletons/AssetDetailSkeleton.jsx` | Asset detail loading |

### Other

| Component | Path | Purpose |
|-----------|------|---------|
| ToastProvider | `components/providers/ToastProvider.jsx` | Toast notifications |
| ErrorPage | `components/error/ErrorPage.jsx` | Error page |

---

## 3. Distinct user screens (estimate)

- **Route-level pages:** 60 `page.js`/`page.jsx` files; 2 are non-screens (redirect at `investment`, legacy mock at `investments`).
- **Distinct routes that render a screen:** **~58**.
- **Tabbed screens:** Several pages expose multiple “views” via tabs (e.g. settings, cash-flow, marketplace, support-dashboard, reports, reports/crm, documents, entity-structure, notifications). Counting each tab as a logical sub-screen gives on the order of **~25+ tab-views** on top of the 58 routes.
- **Detail screens:** Asset detail and listing detail are parameterized (query or dynamic segment); they are 1 route each but many possible instances.

**Summary:**

- **~55–58 distinct route-level screens** (excluding redirect and legacy investments).
- **~25+ tab-based sub-views** within those screens.
- **Total “user-visible screens/view states”: ~80+** (routes + main tab-views).

(Modals and wizards add more states but are not counted as separate “screens” here.)

---

## 4. Expected platform features vs implemented screens

Expected features are derived from **WHAT_IS_DONE_CLIENT_SUMMARY.md** and typical wealth/investment platform scope.

### Implemented (screens exist and are wired)

| Feature area | Expected | Implemented screens |
|--------------|----------|---------------------|
| **Auth & onboarding** | Login, signup, logout, password reset, email verify | ✅ Login, signup, forgot-password, reset-password, verify-email, verification-success, choose-profile, welcome |
| **KYC / identity** | KYC/KYB flows, document/identity verification | ✅ kyc-verification, kyc/verification-complete, document-verification, identity-verification, dashboard/kyc |
| **Dashboard & analytics** | Main dashboard, analytics | ✅ dashboard, dashboard/analytics |
| **Portfolio** | Overview, crypto, cash flow, trade engine | ✅ portfolio/Overview, portfolio/crypto, portfolio/cash-flow, portfolio/trade-engine |
| **Investment** | Overview, goals, strategies (list + detail), crypto marketplace | ✅ investment/overview, goals-tracker, strategies, strategies/[id], investment/crypto-marketplace |
| **Marketplace** | Browse, listing detail, offers | ✅ dashboard/marketplace (browse + active-offers), marketplace/[id], marketplace/active-offers |
| **Assets** | List, add, detail | ✅ assets, assets/add, assets/detail |
| **Documents** | List, upload, share, preview | ✅ dashboard/documents |
| **Notifications** | List, filters | ✅ dashboard/notifications |
| **Referrals** | Stats, list, code, leaderboard | ✅ dashboard/referral |
| **Transactions** | History (multi-source) | ✅ dashboard/transactions |
| **Reports & CRM** | Reports, CRM overview, tasks, updates | ✅ dashboard/reports, dashboard/reports/crm |
| **Support** | Tickets, support dashboard (chat) | ✅ dashboard/support, dashboard/support-dashboard |
| **Concierge** | Appraisals | ✅ dashboard/concierge |
| **Compliance** | Tasks, audits, alerts | ✅ dashboard/compliance |
| **Entity structure** | Entities, people, audit trail | ✅ dashboard/entity-structure |
| **Settings** | Profile, linked accounts, payment/billing, notifications, tasks/reminders | ✅ dashboard/settings (profile, linked, payment), settings (basic, notification, Task & Reminders) |
| **Public** | Landing, marketplace, about, help, contact, plans, legal | ✅ page.js, marketplace, about, help-center, contact, plans, terms, privacy, cookies, security, support, concierge |

### Gaps / missing or partial screens

| Gap | Description |
|-----|-------------|
| **Add Entity** | No dedicated “Add Entity” screen; entity-structure has a button that shows “coming soon”. Expected: modal or small flow to create entity (backend API exists). |
| **Add Person** | Same as above for “Add Person” on entity-structure. Expected: modal or small flow (backend may exist). |
| **Investment watchlist (dedicated)** | Add/remove watchlist exists on goals-tracker and crypto-marketplace; no dedicated “My watchlist” page listing all watched items in one place. Optional. |
| **Invoices (standalone)** | Invoices are used in settings (payment tab). No standalone “Invoices” list/detail screen. Optional if settings is enough. |
| **Generated reports list** | Reports can be generated (reports API); CRM/reports screens show tasks/overview. A dedicated “My generated reports” (list + download) may be expected. Partially covered under reports/crm. |
| **Banking / Plaid link** | Banking APIs exist; linking flow may live inside dashboard/settings (linked accounts). If there is no dedicated “Link bank account” step or clear entry point, that could be considered a missing flow rather than a missing screen. |
| **2FA setup** | 2FA settings exist in backend; if there is no dedicated “Enable 2FA” step (e.g. QR + code) in dashboard/settings, that’s a missing flow. |
| **Strategy actions (UI only)** | Backend supports adjust goal, backtest, clone strategy, strategy performance. No dedicated UI for backtest results, clone confirmation, or “adjust goal” modal; these are missing UI surfaces, not necessarily new routes. |
| **Legacy / duplicate** | `/dashboard/investments` (plural) is a legacy page with hardcoded data and is not in main nav; could be removed or replaced by investment/overview. |

### Summary

- **Fully covered:** Auth, KYC/verification, main dashboard, analytics, portfolio (all 4 sub-areas), investment (overview, goals, strategies, crypto marketplace), marketplace (browse, detail, offers), assets (list, add, detail), documents, notifications, referrals, transactions, reports/CRM, support, support-dashboard, concierge, compliance, entity structure, settings (both dashboard and standalone), and public/marketing/legal pages.
- **Missing or partial:** Add Entity (modal/flow), Add Person (modal/flow), optional dedicated watchlist page, optional standalone invoices screen, and clearer flows for banking link and 2FA if not already in settings. Strategy backtest/clone/adjust-goal UIs are missing but can be added on existing strategy/detail screens.

---

## 5. Page count summary

| Group | Page count |
|-------|------------|
| Public & marketing | 12 |
| Legal & preferences | 4 |
| Auth & onboarding | 7 |
| KYC / verification | 4 |
| Dashboard (main & analytics) | 3 |
| Portfolio | 4 |
| Investment | 6 (1 redirect, 1 legacy) |
| Marketplace | 3 |
| Assets | 3 |
| Reports & CRM | 2 |
| Documents | 1 |
| Support & concierge | 3 |
| Entity & compliance | 2 |
| Notifications, referral, transactions, settings | 5 |
| **Total (all page files)** | **60** |
| **Distinct user-facing screens (estimate)** | **~55–58** (excluding redirect + legacy) |

---

**End of inventory.**
