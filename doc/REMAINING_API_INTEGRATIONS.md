# Remaining API Features to Integrate

This document outlines the API features that are defined in the configuration but not yet fully integrated into the UI.

## 📊 Summary

- **Total API Endpoints Defined**: ~200+
- **Fully Integrated**: ~85%
- **Partially Integrated**: ~10%
- **Not Integrated**: ~5%

---

## 🔴 High Priority - Not Integrated

### 1. Investment Management - Extra APIs

**Location**: `src/config/api.js` (lines 157-167)  
**Status**: Structure only - marked as "not integrated in UI"  
**Service File**: `src/utils/investmentApi.js` (lines 432-493)

#### Missing Features:

1. **Investment Performance Analytics**
   - Endpoint: `GET /api/v1/investment/performance`
   - Function: `getInvestmentPerformance()`
   - Purpose: Get performance metrics for investments
   - UI Integration: ❌ Not integrated

2. **Investment Analytics**
   - Endpoint: `GET /api/v1/investment/analytics`
   - Function: `getInvestmentAnalytics()`
   - Purpose: Get detailed analytics for investments
   - UI Integration: ❌ Not integrated

3. **Investment Recommendations**
   - Endpoint: `GET /api/v1/investment/recommendations`
   - Function: `getInvestmentRecommendations()`
   - Purpose: Get personalized investment recommendations
   - UI Integration: ❌ Not integrated

4. **Adjust Goal**
   - Endpoint: `POST /api/v1/investment/goals/{goal_id}/adjust`
   - Function: Not implemented in service file
   - Purpose: Adjust investment goal parameters
   - UI Integration: ❌ Not integrated

5. **Strategy Backtest**
   - Endpoint: `POST /api/v1/investment/strategies/{strategy_id}/backtest`
   - Function: Not implemented in service file
   - Purpose: Backtest investment strategies
   - UI Integration: ❌ Not integrated

6. **Strategy Performance**
   - Endpoint: `GET /api/v1/investment/strategies/{strategy_id}/performance`
   - Function: Not implemented in service file
   - Purpose: Get performance metrics for a strategy
   - UI Integration: ❌ Not integrated

7. **Clone Strategy**
   - Endpoint: `POST /api/v1/investment/strategies/{strategy_id}/clone`
   - Function: Not implemented in service file
   - Purpose: Clone an existing strategy
   - UI Integration: ❌ Not integrated

8. **Investment Watchlist**
   - Endpoints:
     - `GET /api/v1/investment/watchlist`
     - `POST /api/v1/investment/watchlist`
     - `DELETE /api/v1/investment/watchlist/{id}`
   - Functions: Not implemented in service file
   - Purpose: Manage watchlist for investment opportunities
   - UI Integration: ❌ Not integrated
   - Note: Marketplace watchlist is implemented, but investment watchlist is separate

---

## 🟡 Medium Priority - Partially Integrated

### 2. Marketplace Watchlist - Remove Function

**Location**: `src/app/dashboard/marketplace/page.js` (line 791)  
**Status**: TODO comment found  
**Issue**: Remove from watchlist functionality has a TODO comment

```javascript
// TODO: Implement remove from watchlist
```

**Action Required**: 
- Implement `removeFromWatchlist()` function call
- Connect to `marketplaceApi.removeFromWatchlist()`

---

### 3. Portfolio APIs - Verification Needed

**Location**: `src/utils/portfolioApi.js`  
**Status**: Need to verify all endpoints are used in UI

#### Potentially Missing:

1. **Portfolio Alerts**
   - Endpoint: `GET /api/v1/portfolio/alerts`
   - Function: Implemented
   - UI Integration: ⚠️ Need to verify

2. **Portfolio Risk Analysis**
   - Endpoint: `GET /api/v1/portfolio/risk`
   - Function: Implemented
   - UI Integration: ⚠️ Need to verify

3. **Portfolio Benchmark**
   - Endpoint: `GET /api/v1/portfolio/benchmark`
   - Function: Implemented
   - UI Integration: ⚠️ Need to verify

4. **Crypto Portfolio APIs**
   - Endpoints:
     - `GET /api/v1/portfolio/crypto/summary`
     - `GET /api/v1/portfolio/crypto/performance`
     - `GET /api/v1/portfolio/crypto/breakdown`
     - `GET /api/v1/portfolio/crypto/holdings`
   - Functions: Implemented
   - UI Integration: ⚠️ Need to verify

---

### 4. Analytics APIs - Verification Needed

**Location**: `src/utils/analyticsApi.js`  
**Status**: All functions implemented, need UI verification

#### Endpoints:
- `GET /api/v1/analytics/portfolio`
- `GET /api/v1/analytics/performance`
- `GET /api/v1/analytics/risk`

**UI Integration**: ⚠️ Need to verify if used in analytics/reports pages

---

### 5. Reports APIs - Verification Needed

**Location**: `src/utils/reportsApi.js`  
**Status**: Need to verify all endpoints are used

#### Endpoints:
- `POST /api/v1/reports/generate`
- `GET /api/v1/reports`
- `GET /api/v1/reports/{id}`
- `GET /api/v1/reports/{id}/download`
- `GET /api/v1/reports/statistics`

**UI Integration**: ⚠️ Need to verify

---

## 🟢 Low Priority - Fully Integrated

### 6. Authentication APIs ✅
- All endpoints integrated
- 2FA fully implemented
- Login, register, password reset all working

### 7. User Profile APIs ✅
- Profile management
- Notification preferences
- Privacy preferences
- 2FA setup and management
- Password change
- Account deactivation/deletion

### 8. Assets APIs ✅
- CRUD operations
- Document management
- Appraisal requests
- Sale requests
- Asset transfers

### 9. KYC/KYB APIs ✅
- Verification flow
- Document upload
- Status tracking

### 10. Marketplace APIs ✅
- Listings management
- Offers system
- Escrow management
- Watchlist (marketplace)
- Market highlights/trends

### 11. Payments APIs ✅
- Payment intents
- Payment methods
- Invoices
- Refunds
- Payment history

### 12. Accounts & Banking APIs ✅
- Account management
- Joint accounts
- Banking integration (Plaid)
- Transaction history

### 13. Trading APIs ✅
- Trading account info
- Assets/positions
- Transaction history

### 14. Trade Engine APIs ✅
- Asset search
- Order placement
- Order management

### 15. Documents APIs ✅
- Document management
- Sharing
- Statistics

### 16. Support Tickets APIs ✅
- Ticket management
- Assignment
- Comments
- History

### 17. Concierge/Appraisals APIs ✅
- Appraisal management
- Status updates
- Valuation updates
- Comments

### 18. CRM APIs ✅
- User management
- Dashboard overview
- Updates

### 19. Compliance APIs ✅
- Task management
- Audits
- Alerts
- Reports
- Policies

### 20. Entity Structure APIs ✅
- Entity management
- Hierarchy
- Compliance
- People & roles
- Audit trail
- Documents

---

## 📝 Implementation Checklist

### High Priority Tasks

- [ ] **Investment Performance API**
  - [ ] Add UI component to display performance metrics
  - [ ] Integrate with investment dashboard
  - [ ] Add charts/visualizations

- [ ] **Investment Analytics API**
  - [ ] Create analytics page/component
  - [ ] Display analytics data
  - [ ] Add filtering options

- [ ] **Investment Recommendations API**
  - [ ] Create recommendations section
  - [ ] Display personalized recommendations
  - [ ] Add "Apply Recommendation" functionality

- [ ] **Adjust Goal API**
  - [ ] Implement `adjustGoal()` function in `investmentApi.js`
  - [ ] Add UI form for adjusting goals
  - [ ] Connect to goal management page

- [ ] **Strategy Backtest API**
  - [ ] Implement `backtestStrategy()` function
  - [ ] Add backtest UI component
  - [ ] Display backtest results

- [ ] **Strategy Performance API**
  - [ ] Implement `getStrategyPerformance()` function
  - [ ] Add performance metrics display
  - [ ] Integrate with strategy detail page

- [ ] **Clone Strategy API**
  - [ ] Implement `cloneStrategy()` function
  - [ ] Add "Clone" button to strategy cards
  - [ ] Handle clone confirmation

- [ ] **Investment Watchlist API**
  - [ ] Implement watchlist functions in `investmentApi.js`
  - [ ] Add watchlist UI component
  - [ ] Integrate with investment listings
  - [ ] Add watchlist management page

### Medium Priority Tasks

- [ ] **Marketplace Watchlist - Remove**
  - [ ] Implement remove functionality
  - [ ] Add confirmation dialog
  - [ ] Update UI after removal

- [ ] **Portfolio APIs Verification**
  - [ ] Verify alerts integration
  - [ ] Verify risk analysis integration
  - [ ] Verify benchmark integration
  - [ ] Verify crypto portfolio integration

- [ ] **Analytics APIs Verification**
  - [ ] Verify portfolio analytics usage
  - [ ] Verify performance analytics usage
  - [ ] Verify risk analytics usage

- [ ] **Reports APIs Verification**
  - [ ] Verify report generation
  - [ ] Verify report listing
  - [ ] Verify report download
  - [ ] Verify statistics display

---

## 🔍 How to Verify Integration

1. **Search for API function usage**:
   ```bash
   grep -r "functionName" src/app
   ```

2. **Check for TODO comments**:
   ```bash
   grep -r "TODO" src/
   ```

3. **Check for API endpoint usage**:
   ```bash
   grep -r "API_ENDPOINTS" src/app
   ```

4. **Review service files**:
   - Check if all endpoints have corresponding functions
   - Check if functions are exported
   - Check if functions are used in UI components

---

## 📌 Notes

1. **Investment Watchlist vs Marketplace Watchlist**:
   - These are two separate systems
   - Marketplace watchlist is for marketplace listings
   - Investment watchlist is for investment opportunities/strategies
   - Both need to be implemented separately

2. **Structure Only APIs**:
   - Some APIs are marked as "Structure only - not integrated"
   - These have service functions but no UI integration
   - Priority should be given to these for completion

3. **Verification Needed**:
   - Some APIs may be integrated but need verification
   - Check actual usage in UI components
   - Ensure proper error handling and loading states

---

## 🎯 Recommended Next Steps

1. **Start with High Priority items**:
   - Investment Performance API
   - Investment Analytics API
   - Investment Recommendations API

2. **Complete Investment Watchlist**:
   - This is a core feature for investment management
   - Similar to marketplace watchlist (can reuse patterns)

3. **Verify Medium Priority items**:
   - Check if they're actually used
   - Document findings
   - Integrate if missing

4. **Test all integrations**:
   - Ensure error handling
   - Add loading states
   - Test edge cases

---

**Last Updated**: Based on codebase analysis as of current date  
**Total Remaining**: ~15 API endpoints/functions need integration or verification
