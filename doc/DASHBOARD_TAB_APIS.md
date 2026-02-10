# Dashboard Tab Page - All Available APIs

This document lists all APIs available for the dashboard tab page (`/dashboard`).

## 📊 Currently Used APIs

### 1. User Profile API
- **Endpoint**: `GET /api/v1/users/me`
- **Function**: `getUserProfile()` from `@/utils/authApi`
- **Status**: ✅ Currently integrated
- **Purpose**: Fetch user profile information (name, email, etc.)

---

## 🎯 Recommended APIs for Dashboard Integration

### 2. Portfolio Summary API
- **Endpoint**: `GET /api/v1/portfolio/summary`
- **Function**: `getPortfolioSummary(timeRange)` from `@/utils/portfolioApi`
- **Status**: ⚠️ Available but not integrated in main dashboard
- **Purpose**: Get portfolio overview (net worth, total assets, total debts, etc.)
- **Parameters**: 
  - `timeRange` (optional): '1D', '1W', '1M', '3M', '6M', '1Y', 'ALL'

### 3. Portfolio Performance API
- **Endpoint**: `GET /api/v1/portfolio/performance`
- **Function**: `getPortfolioPerformance(days)` from `@/utils/portfolioApi`
- **Status**: ⚠️ Available but not integrated in main dashboard
- **Purpose**: Get portfolio performance metrics and historical data
- **Parameters**: 
  - `days` (optional): Number of days (default: 30)

### 4. Asset Allocation API
- **Endpoint**: `GET /api/v1/portfolio/allocation`
- **Function**: `getAssetAllocation()` from `@/utils/portfolioApi`
- **Status**: ⚠️ Available but not integrated in main dashboard
- **Purpose**: Get asset allocation breakdown (stocks, bonds, crypto, etc.)

### 5. Top Holdings API
- **Endpoint**: `GET /api/v1/portfolio/holdings/top`
- **Function**: `getTopHoldings(params)` from `@/utils/portfolioApi`
- **Status**: ⚠️ Available but not integrated in main dashboard
- **Purpose**: Get top portfolio holdings
- **Parameters**: 
  - `limit` (optional): Number of holdings to return

### 6. Recent Activity API
- **Endpoint**: `GET /api/v1/portfolio/activity/recent`
- **Function**: `getRecentActivity(params)` from `@/utils/portfolioApi`
- **Status**: ⚠️ Available but not integrated in main dashboard
- **Purpose**: Get recent portfolio transactions/activities
- **Parameters**: 
  - `limit` (optional): Number of activities to return

### 7. Market Summary API
- **Endpoint**: `GET /api/v1/portfolio/market-summary`
- **Function**: `getMarketSummary()` from `@/utils/portfolioApi`
- **Status**: ⚠️ Available but not integrated in main dashboard
- **Purpose**: Get market summary and trends

### 8. Portfolio Alerts API
- **Endpoint**: `GET /api/v1/portfolio/alerts`
- **Function**: `getPortfolioAlerts(params)` from `@/utils/portfolioApi`
- **Status**: ⚠️ Available but not integrated in main dashboard
- **Purpose**: Get portfolio alerts and notifications
- **Parameters**: 
  - `status` (optional): Filter by alert status

### 9. Portfolio History API
- **Endpoint**: `GET /api/v1/portfolio/history`
- **Function**: `getPortfolioHistory(params)` from `@/utils/portfolioApi`
- **Status**: ⚠️ Available but not integrated in main dashboard
- **Purpose**: Get historical portfolio data for charts
- **Parameters**: 
  - `start_date` (optional): Start date for history
  - `end_date` (optional): End date for history

### 10. Portfolio Risk Analysis API
- **Endpoint**: `GET /api/v1/portfolio/risk`
- **Function**: `getPortfolioRisk()` from `@/utils/portfolioApi`
- **Status**: ⚠️ Available but not integrated in main dashboard
- **Purpose**: Get portfolio risk metrics and analysis

### 11. Portfolio Benchmark API
- **Endpoint**: `GET /api/v1/portfolio/benchmark`
- **Function**: `getPortfolioBenchmark()` from `@/utils/portfolioApi`
- **Status**: ⚠️ Available but not integrated in main dashboard
- **Purpose**: Get portfolio benchmark comparison

---

## 💰 Investment APIs

### 12. Investment Overview API
- **Endpoint**: `GET /api/v1/investment/overview`
- **Function**: `getInvestmentOverview()` from `@/utils/investmentApi`
- **Status**: ⚠️ Available but not integrated in main dashboard
- **Purpose**: Get investment overview summary

### 13. Investment Overview Assets API
- **Endpoint**: `GET /api/v1/investment/overview/assets`
- **Function**: `getAssetSummaryCards()` from `@/utils/investmentApi`
- **Status**: ⚠️ Available but not integrated in main dashboard
- **Purpose**: Get investment assets breakdown

### 14. Investment Overview Activity API
- **Endpoint**: `GET /api/v1/investment/overview/activity`
- **Function**: `getInvestmentActivity()` from `@/utils/investmentApi`
- **Status**: ⚠️ Available but not integrated in main dashboard
- **Purpose**: Get investment activity feed

### 15. Investment Performance API
- **Endpoint**: `GET /api/v1/investment/performance`
- **Function**: `getInvestmentPerformance()` from `@/utils/investmentApi`
- **Status**: ✅ Available and implemented
- **Purpose**: Get investment performance metrics

### 16. Investment Analytics API
- **Endpoint**: `GET /api/v1/investment/analytics`
- **Function**: `getInvestmentAnalytics()` from `@/utils/investmentApi`
- **Status**: ✅ Available and implemented
- **Purpose**: Get detailed investment analytics

### 17. Investment Recommendations API
- **Endpoint**: `GET /api/v1/investment/recommendations`
- **Function**: `getInvestmentRecommendations()` from `@/utils/investmentApi`
- **Status**: ✅ Available and implemented
- **Purpose**: Get personalized investment recommendations

---

## 📈 Analytics APIs

### 18. Portfolio Analytics API
- **Endpoint**: `GET /api/v1/analytics/portfolio`
- **Function**: `getPortfolioAnalytics()` from `@/utils/analyticsApi`
- **Status**: ⚠️ Available but not integrated in main dashboard
- **Purpose**: Get portfolio analytics and insights

### 19. Performance Analytics API
- **Endpoint**: `GET /api/v1/analytics/performance`
- **Function**: `getPerformanceAnalytics()` from `@/utils/analyticsApi`
- **Status**: ⚠️ Available but not integrated in main dashboard
- **Purpose**: Get performance analytics

### 20. Risk Analytics API
- **Endpoint**: `GET /api/v1/analytics/risk`
- **Function**: `getRiskAnalytics()` from `@/utils/analyticsApi`
- **Status**: ⚠️ Available but not integrated in main dashboard
- **Purpose**: Get risk analytics

---

## 🏦 Accounts & Banking APIs

### 21. Accounts Summary API
- **Endpoint**: `GET /api/v1/accounts/me`
- **Function**: `getMyAccounts()` from `@/utils/accountsApi`
- **Status**: ⚠️ Available but not integrated in main dashboard
- **Purpose**: Get user's account summary

### 22. Accounts Stats API
- **Endpoint**: `GET /api/v1/accounts/stats`
- **Function**: `getAccountStats()` from `@/utils/accountsApi`
- **Status**: ⚠️ Available but not integrated in main dashboard
- **Purpose**: Get account statistics

### 23. Banking Accounts API
- **Endpoint**: `GET /api/v1/banking/accounts`
- **Function**: `listBankingAccounts()` from `@/utils/bankingApi`
- **Status**: ⚠️ Available but not integrated in main dashboard
- **Purpose**: List linked banking accounts

---

## 💳 Payment APIs

### 24. Payment History API
- **Endpoint**: `GET /api/v1/payments/history`
- **Function**: `getPaymentHistory(params)` from `@/utils/paymentsApi`
- **Status**: ⚠️ Available but not integrated in main dashboard
- **Purpose**: Get payment transaction history

### 25. Payment Stats API
- **Endpoint**: `GET /api/v1/payments/stats`
- **Function**: `getPaymentStats()` from `@/utils/paymentsApi`
- **Status**: ⚠️ Available but not integrated in main dashboard
- **Purpose**: Get payment statistics

---

## 🏠 Assets APIs

### 26. Assets Summary API
- **Endpoint**: `GET /api/v1/assets/summary`
- **Function**: `getAssetsSummary()` from `@/utils/assetsApi`
- **Status**: ⚠️ Available but not integrated in main dashboard
- **Purpose**: Get assets summary (total value, count, etc.)

### 27. Assets Value Trends API
- **Endpoint**: `GET /api/v1/assets/value-trends`
- **Function**: `getAssetsValueTrends(params)` from `@/utils/assetsApi`
- **Status**: ⚠️ Available but not integrated in main dashboard
- **Purpose**: Get assets value trends over time

---

## 📊 Reports APIs

### 28. Report Statistics API
- **Endpoint**: `GET /api/v1/reports/statistics`
- **Function**: `getReportStatistics()` from `@/utils/reportsApi`
- **Status**: ⚠️ Available but not integrated in main dashboard
- **Purpose**: Get report statistics

---

## 🔔 Notification APIs

### 29. User Notifications API
- **Endpoint**: `GET /api/v1/users/notifications`
- **Function**: Available in user API service
- **Status**: ⚠️ Available but not integrated in main dashboard
- **Purpose**: Get user notifications

---

## 📝 Implementation Priority

### High Priority (Core Dashboard Metrics)
1. ✅ User Profile API (Already integrated)
2. ⚠️ Portfolio Summary API
3. ⚠️ Portfolio Performance API
4. ⚠️ Asset Allocation API
5. ⚠️ Assets Summary API

### Medium Priority (Enhanced Features)
6. ⚠️ Top Holdings API
7. ⚠️ Recent Activity API
8. ⚠️ Market Summary API
9. ⚠️ Portfolio Alerts API
10. ⚠️ Investment Overview API

### Low Priority (Advanced Analytics)
11. ⚠️ Portfolio Risk Analysis API
12. ⚠️ Portfolio Benchmark API
13. ⚠️ Analytics APIs (Portfolio, Performance, Risk)
14. ⚠️ Investment Performance API
15. ⚠️ Investment Analytics API

---

## 📋 API Integration Checklist

### Currently Integrated
- [x] User Profile API

### Available but Not Integrated
- [ ] Portfolio Summary API
- [ ] Portfolio Performance API
- [ ] Asset Allocation API
- [ ] Top Holdings API
- [ ] Recent Activity API
- [ ] Market Summary API
- [ ] Portfolio Alerts API
- [ ] Portfolio History API
- [ ] Portfolio Risk Analysis API
- [ ] Portfolio Benchmark API
- [ ] Investment Overview API
- [ ] Investment Overview Assets API
- [ ] Investment Overview Activity API
- [ ] Portfolio Analytics API
- [ ] Performance Analytics API
- [ ] Risk Analytics API
- [ ] Accounts Summary API
- [ ] Accounts Stats API
- [ ] Banking Accounts API
- [ ] Payment History API
- [ ] Payment Stats API
- [ ] Assets Summary API
- [ ] Assets Value Trends API
- [ ] Report Statistics API
- [ ] User Notifications API

### Not Implemented in Service Files
- [x] Investment Performance API (✅ Implemented)
- [x] Investment Analytics API (✅ Implemented)
- [x] Investment Recommendations API (✅ Implemented)

---

## 🔗 Related Files

- **Main Dashboard Page**: `src/app/dashboard/page.js`
- **API Configuration**: `src/config/api.js`
- **Portfolio API Service**: `src/utils/portfolioApi.js`
- **Investment API Service**: `src/utils/investmentApi.js`
- **Analytics API Service**: `src/utils/analyticsApi.js`
- **Assets API Service**: `src/utils/assetsApi.js`
- **Accounts API Service**: `src/utils/accountsApi.js`
- **Banking API Service**: `src/utils/bankingApi.js`
- **Payments API Service**: `src/utils/paymentsApi.js`
- **Reports API Service**: `src/utils/reportsApi.js`

---

## 📝 Notes

1. **Current State**: The main dashboard page (`/dashboard`) currently only displays static/mock data and uses only the User Profile API.

2. **Integration Opportunity**: Many APIs are available and implemented in service files but not yet integrated into the main dashboard page.

3. **Data Flow**: The dashboard should fetch data from multiple APIs to display:
   - Net Worth & Investable (from Portfolio Summary)
   - Assets & Debts (from Portfolio Summary or Assets Summary)
   - Cash on Hand (from Accounts/Banking APIs)
   - Tax Estimate (from Portfolio Summary or Analytics)
   - Historical Performance Graph (from Portfolio History/Performance)

4. **Performance**: Consider using `Promise.allSettled()` to fetch multiple APIs in parallel for better performance.

5. **Error Handling**: Implement proper error handling for each API call with fallback values.

---

**Last Updated**: Based on codebase analysis  
**Total APIs Available**: 29+ APIs  
**Currently Integrated**: 1 API  
**Available for Integration**: 28+ APIs
