/**
 * Investment API Service
 * Handles all investment-related API calls (Overview, Goals, Strategies)
 */

import { API_ENDPOINTS } from '@/config/api';
import { apiGet, apiPost, apiPut, apiDelete } from '@/lib/api/client';

/**
 * Transform snake_case object keys to camelCase
 */
const snakeToCamel = (str) => {
  return str.replace(/_([a-z])/g, (_, letter) => letter.toUpperCase());
};

/**
 * Recursively transform object keys from snake_case to camelCase
 */
const transformKeys = (obj) => {
  if (obj === null || obj === undefined) return obj;
  if (Array.isArray(obj)) {
    return obj.map(transformKeys);
  }
  if (typeof obj === 'object' && !(obj instanceof Date)) {
    const transformed = {};
    for (const [key, value] of Object.entries(obj)) {
      const camelKey = snakeToCamel(key);
      transformed[camelKey] = transformKeys(value);
    }
    return transformed;
  }
  return obj;
};

/**
 * Transform camelCase object keys to snake_case for API
 */
const camelToSnake = (str) => {
  return str.replace(/[A-Z]/g, (letter) => `_${letter.toLowerCase()}`);
};

const transformToSnake = (obj) => {
  if (obj === null || obj === undefined) return obj;
  if (Array.isArray(obj)) {
    return obj.map(transformToSnake);
  }
  if (typeof obj === 'object' && !(obj instanceof Date)) {
    const transformed = {};
    for (const [key, value] of Object.entries(obj)) {
      const snakeKey = camelToSnake(key);
      transformed[snakeKey] = transformToSnake(value);
    }
    return transformed;
  }
  return obj;
};

// ============================================================================
// INVESTMENT OVERVIEW APIs ⭐ INTEGRATED
// ============================================================================

/**
 * Get Investment Overview
 * GET /api/v1/investment/overview
 */
export const getInvestmentOverview = async () => {
  const endpoint = API_ENDPOINTS.INVESTMENT.OVERVIEW;
  const response = await apiGet(endpoint);
  
  if (response.data) {
    response.data = transformKeys(response.data);
  }
  
  return response;
};

/**
 * Get Asset Summary Cards
 * GET /api/v1/investment/overview/assets
 */
export const getAssetSummaryCards = async () => {
  const endpoint = API_ENDPOINTS.INVESTMENT.OVERVIEW_ASSETS;
  const response = await apiGet(endpoint);
  
  if (response.data) {
    response.data = transformKeys(response.data);
  }
  
  return response;
};

/**
 * Get Recent Investment Activity
 * GET /api/v1/investment/overview/activity
 */
export const getInvestmentActivity = async (params = {}) => {
  const queryParams = new URLSearchParams();
  if (params.limit) queryParams.append('limit', params.limit);
  
  const endpoint = `${API_ENDPOINTS.INVESTMENT.OVERVIEW_ACTIVITY}${queryParams.toString() ? `?${queryParams.toString()}` : ''}`;
  const response = await apiGet(endpoint);
  
  if (response.data) {
    response.data = transformKeys(response.data);
  }
  
  return response;
};

/**
 * Get Cryptocurrency Prices
 * GET /api/v1/investment/overview/crypto-prices
 */
export const getCryptoPrices = async () => {
  const endpoint = API_ENDPOINTS.INVESTMENT.OVERVIEW_CRYPTO_PRICES;
  const response = await apiGet(endpoint);
  
  if (response.data) {
    response.data = transformKeys(response.data);
  }
  
  return response;
};

/**
 * Get Trader Profile
 * GET /api/v1/investment/overview/trader-profile
 */
export const getTraderProfile = async () => {
  const endpoint = API_ENDPOINTS.INVESTMENT.OVERVIEW_TRADER_PROFILE;
  const response = await apiGet(endpoint);
  
  if (response.data) {
    response.data = transformKeys(response.data);
  }
  
  return response;
};

// ============================================================================
// INVESTMENT GOALS APIs ⭐ INTEGRATED
// ============================================================================

/**
 * Get All Investment Goals
 * GET /api/v1/investment/goals
 */
export const getInvestmentGoals = async (params = {}) => {
  const queryParams = new URLSearchParams();
  if (params.status) queryParams.append('status', params.status);
  if (params.sortBy) queryParams.append('sort_by', params.sortBy);
  
  const endpoint = `${API_ENDPOINTS.INVESTMENT.GOALS}${queryParams.toString() ? `?${queryParams.toString()}` : ''}`;
  const response = await apiGet(endpoint);
  
  if (response.data) {
    response.data = transformKeys(response.data);
  }
  
  return response;
};

/**
 * Get Goal Details
 * GET /api/v1/investment/goals/{goal_id}
 */
export const getGoalDetails = async (goalId) => {
  const endpoint = API_ENDPOINTS.INVESTMENT.GET_GOAL(goalId);
  const response = await apiGet(endpoint);
  
  if (response.data) {
    response.data = transformKeys(response.data);
  }
  
  return response;
};

/**
 * Create Investment Goal
 * POST /api/v1/investment/goals
 */
export const createInvestmentGoal = async (goalData) => {
  const transformedData = transformToSnake(goalData);
  const endpoint = API_ENDPOINTS.INVESTMENT.CREATE_GOAL;
  const response = await apiPost(endpoint, transformedData);
  
  if (response.data) {
    response.data = transformKeys(response.data);
  }
  
  return response;
};

/**
 * Update Investment Goal
 * PUT /api/v1/investment/goals/{goal_id}
 */
export const updateInvestmentGoal = async (goalId, goalData) => {
  const transformedData = transformToSnake(goalData);
  const endpoint = API_ENDPOINTS.INVESTMENT.UPDATE_GOAL(goalId);
  const response = await apiPut(endpoint, transformedData);
  
  if (response.data) {
    response.data = transformKeys(response.data);
  }
  
  return response;
};

/**
 * Delete Investment Goal
 * DELETE /api/v1/investment/goals/{goal_id}
 */
export const deleteInvestmentGoal = async (goalId) => {
  const endpoint = API_ENDPOINTS.INVESTMENT.DELETE_GOAL(goalId);
  return await apiDelete(endpoint);
};

/**
 * Get Goal Progress History
 * GET /api/v1/investment/goals/{goal_id}/progress
 */
export const getGoalProgress = async (goalId, params = {}) => {
  const queryParams = new URLSearchParams();
  if (params.timeRange) queryParams.append('time_range', params.timeRange);
  
  const endpoint = `${API_ENDPOINTS.INVESTMENT.GOAL_PROGRESS(goalId)}${queryParams.toString() ? `?${queryParams.toString()}` : ''}`;
  const response = await apiGet(endpoint);
  
  if (response.data) {
    response.data = transformKeys(response.data);
  }
  
  return response;
};

/**
 * Get Goal Completion
 * GET /api/v1/investment/goals/{goal_id}/completion
 */
export const getGoalCompletion = async (goalId) => {
  const endpoint = API_ENDPOINTS.INVESTMENT.GOAL_COMPLETION(goalId);
  const response = await apiGet(endpoint);
  
  if (response.data) {
    response.data = transformKeys(response.data);
  }
  
  return response;
};

// ============================================================================
// INVESTMENT STRATEGIES APIs ⭐ INTEGRATED
// ============================================================================

/**
 * Get All Investment Strategies
 * GET /api/v1/investment/strategies
 */
export const getInvestmentStrategies = async (params = {}) => {
  const queryParams = new URLSearchParams();
  if (params.filter) queryParams.append('filter', params.filter);
  if (params.openSourceOnly !== undefined) queryParams.append('open_source_only', params.openSourceOnly);
  if (params.sortBy) queryParams.append('sort_by', params.sortBy);
  if (params.page) queryParams.append('page', params.page);
  if (params.limit) queryParams.append('limit', params.limit);
  
  const endpoint = `${API_ENDPOINTS.INVESTMENT.STRATEGIES}${queryParams.toString() ? `?${queryParams.toString()}` : ''}`;
  const response = await apiGet(endpoint);
  
  if (response.data) {
    response.data = transformKeys(response.data);
  }
  
  return response;
};

/**
 * Get Strategy Details
 * GET /api/v1/investment/strategies/{strategy_id}
 */
export const getStrategyDetails = async (strategyId) => {
  const endpoint = API_ENDPOINTS.INVESTMENT.GET_STRATEGY(strategyId);
  const response = await apiGet(endpoint);
  
  if (response.data) {
    response.data = transformKeys(response.data);
  }
  
  return response;
};

/**
 * Create Investment Strategy
 * POST /api/v1/investment/strategies
 */
export const createInvestmentStrategy = async (strategyData) => {
  const transformedData = transformToSnake(strategyData);
  const endpoint = API_ENDPOINTS.INVESTMENT.CREATE_STRATEGY;
  const response = await apiPost(endpoint, transformedData);
  
  if (response.data) {
    response.data = transformKeys(response.data);
  }
  
  return response;
};

/**
 * Update Investment Strategy
 * PUT /api/v1/investment/strategies/{strategy_id}
 */
export const updateInvestmentStrategy = async (strategyId, strategyData) => {
  const transformedData = transformToSnake(strategyData);
  const endpoint = API_ENDPOINTS.INVESTMENT.UPDATE_STRATEGY(strategyId);
  const response = await apiPut(endpoint, transformedData);
  
  if (response.data) {
    response.data = transformKeys(response.data);
  }
  
  return response;
};

/**
 * Delete Investment Strategy
 * DELETE /api/v1/investment/strategies/{strategy_id}
 */
export const deleteInvestmentStrategy = async (strategyId) => {
  const endpoint = API_ENDPOINTS.INVESTMENT.DELETE_STRATEGY(strategyId);
  return await apiDelete(endpoint);
};

/**
 * Save/Unsave Strategy
 * POST /api/v1/investment/strategies/{strategy_id}/save
 */
export const saveStrategy = async (strategyId, saved = true) => {
  const endpoint = API_ENDPOINTS.INVESTMENT.SAVE_STRATEGY(strategyId);
  const response = await apiPost(endpoint, { saved });
  
  if (response.data) {
    response.data = transformKeys(response.data);
  }
  
  return response;
};

/**
 * Get Strategy Comments
 * GET /api/v1/investment/strategies/{strategy_id}/comments
 */
export const getStrategyComments = async (strategyId, params = {}) => {
  const queryParams = new URLSearchParams();
  if (params.page) queryParams.append('page', params.page);
  if (params.limit) queryParams.append('limit', params.limit);
  
  const endpoint = `${API_ENDPOINTS.INVESTMENT.STRATEGY_COMMENTS(strategyId)}${queryParams.toString() ? `?${queryParams.toString()}` : ''}`;
  const response = await apiGet(endpoint);
  
  if (response.data) {
    response.data = transformKeys(response.data);
  }
  
  return response;
};

/**
 * Add Comment to Strategy
 * POST /api/v1/investment/strategies/{strategy_id}/comments
 */
export const addStrategyComment = async (strategyId, commentData) => {
  const transformedData = transformToSnake(commentData);
  const endpoint = API_ENDPOINTS.INVESTMENT.ADD_COMMENT(strategyId);
  const response = await apiPost(endpoint, transformedData);
  
  if (response.data) {
    response.data = transformKeys(response.data);
  }
  
  return response;
};

/**
 * Boost Strategy
 * POST /api/v1/investment/strategies/{strategy_id}/boost
 */
export const boostStrategy = async (strategyId) => {
  const endpoint = API_ENDPOINTS.INVESTMENT.BOOST_STRATEGY(strategyId);
  const response = await apiPost(endpoint, {});
  
  if (response.data) {
    response.data = transformKeys(response.data);
  }
  
  return response;
};

/**
 * Apply Strategy to Portfolio
 * POST /api/v1/investment/strategies/{strategy_id}/apply
 */
export const applyStrategy = async (strategyId, applyData) => {
  const transformedData = transformToSnake(applyData);
  const endpoint = API_ENDPOINTS.INVESTMENT.APPLY_STRATEGY(strategyId);
  const response = await apiPost(endpoint, transformedData);
  
  if (response.data) {
    response.data = transformKeys(response.data);
  }
  
  return response;
};

/**
 * Share Strategy
 * POST /api/v1/investment/strategies/{strategy_id}/share
 */
export const shareStrategy = async (strategyId, shareData) => {
  const transformedData = transformToSnake(shareData);
  const endpoint = API_ENDPOINTS.INVESTMENT.SHARE_STRATEGY(strategyId);
  const response = await apiPost(endpoint, transformedData);
  
  if (response.data) {
    response.data = transformKeys(response.data);
  }
  
  return response;
};

// ============================================================================
// EXTRA INVESTMENT APIs (Structure Only - Not Integrated)
// ============================================================================

/**
 * Get Investment Performance
 * GET /api/v1/investment/performance
 * NOTE: Structure only - not integrated in UI
 */
export const getInvestmentPerformance = async (params = {}) => {
  const queryParams = new URLSearchParams();
  if (params.timeRange) queryParams.append('time_range', params.timeRange);
  if (params.assetType) queryParams.append('asset_type', params.assetType);
  
  const endpoint = `${API_ENDPOINTS.INVESTMENT.PERFORMANCE}${queryParams.toString() ? `?${queryParams.toString()}` : ''}`;
  const response = await apiGet(endpoint);
  
  if (response.data) {
    response.data = transformKeys(response.data);
  }
  
  return response;
};

/**
 * Get Investment Analytics
 * GET /api/v1/investment/analytics
 * NOTE: Structure only - not integrated in UI
 */
export const getInvestmentAnalytics = async (params = {}) => {
  const queryParams = new URLSearchParams();
  if (params.timeRange) queryParams.append('time_range', params.timeRange);
  if (params.metric) queryParams.append('metric', params.metric);
  if (params.groupBy) queryParams.append('group_by', params.groupBy);
  
  const endpoint = `${API_ENDPOINTS.INVESTMENT.ANALYTICS}${queryParams.toString() ? `?${queryParams.toString()}` : ''}`;
  const response = await apiGet(endpoint);
  
  if (response.data) {
    response.data = transformKeys(response.data);
  }
  
  return response;
};

/**
 * Get Investment Recommendations
 * GET /api/v1/investment/recommendations
 * NOTE: Structure only - not integrated in UI
 */
export const getInvestmentRecommendations = async (params = {}) => {
  const queryParams = new URLSearchParams();
  if (params.riskLevel) queryParams.append('risk_level', params.riskLevel);
  if (params.investmentAmount) queryParams.append('investment_amount', params.investmentAmount);
  
  const endpoint = `${API_ENDPOINTS.INVESTMENT.RECOMMENDATIONS}${queryParams.toString() ? `?${queryParams.toString()}` : ''}`;
  const response = await apiGet(endpoint);
  
  if (response.data) {
    response.data = transformKeys(response.data);
  }
  
  return response;
};

/**
 * Adjust Investment Goal
 * POST /api/v1/investment/goals/{goal_id}/adjust
 * 
 * @param {string} goalId - Goal ID
 * @param {Object} adjustmentData - Adjustment data
 * @param {number} adjustmentData.targetAmount - Optional: new target amount
 * @param {string} adjustmentData.targetDate - Optional: new target date (YYYY-MM-DD)
 * @param {number} adjustmentData.monthlyContribution - Optional: new monthly contribution
 * @param {string} adjustmentData.riskTolerance - Optional: "conservative" | "moderate" | "aggressive"
 * @param {string} adjustmentData.notes - Optional: notes about the adjustment
 */
export const adjustGoal = async (goalId, adjustmentData) => {
  const transformedData = transformToSnake({
    target_amount: adjustmentData.targetAmount,
    target_date: adjustmentData.targetDate,
    monthly_contribution: adjustmentData.monthlyContribution,
    risk_tolerance: adjustmentData.riskTolerance,
    notes: adjustmentData.notes
  });
  
  const endpoint = API_ENDPOINTS.INVESTMENT.ADJUST_GOAL(goalId);
  const response = await apiPost(endpoint, transformedData);
  
  if (response.data) {
    response.data = transformKeys(response.data);
  }
  if (response.updated_parameters) {
    response.updated_parameters = transformKeys(response.updated_parameters);
  }
  
  return response;
};

/**
 * Backtest Strategy
 * POST /api/v1/investment/strategies/{strategy_id}/backtest
 * 
 * @param {string} strategyId - Strategy ID
 * @param {Object} backtestParams - Backtest parameters
 * @param {string} backtestParams.startDate - Required: backtest start date (YYYY-MM-DD)
 * @param {string} backtestParams.endDate - Required: backtest end date (YYYY-MM-DD)
 * @param {number} backtestParams.initialCapital - Required: initial investment amount
 */
export const backtestStrategy = async (strategyId, backtestParams) => {
  const transformedData = transformToSnake({
    start_date: backtestParams.startDate,
    end_date: backtestParams.endDate,
    initial_capital: backtestParams.initialCapital
  });
  
  const endpoint = API_ENDPOINTS.INVESTMENT.STRATEGY_BACKTEST(strategyId);
  const response = await apiPost(endpoint, transformedData);
  
  if (response.data) {
    response.data = transformKeys(response.data);
  }
  
  return response;
};

/**
 * Get Strategy Performance
 * GET /api/v1/investment/strategies/{strategy_id}/performance
 * 
 * @param {string} strategyId - Strategy ID
 * @param {number} days - Optional: Number of days for performance calculation (default: 30, max: 365)
 */
export const getStrategyPerformance = async (strategyId, days = 30) => {
  const queryParams = new URLSearchParams();
  if (days) queryParams.append('days', days.toString());
  
  const endpoint = `${API_ENDPOINTS.INVESTMENT.STRATEGY_PERFORMANCE(strategyId)}${queryParams.toString() ? `?${queryParams.toString()}` : ''}`;
  const response = await apiGet(endpoint);
  
  if (response.data) {
    response.data = transformKeys(response.data);
  }
  if (response.performance) {
    response.performance = transformKeys(response.performance);
  }
  if (response.period) {
    response.period = transformKeys(response.period);
  }
  if (response.trades) {
    response.trades = transformKeys(response.trades);
  }
  
  return response;
};

/**
 * Clone Strategy
 * POST /api/v1/investment/strategies/{strategy_id}/clone
 * 
 * @param {string} strategyId - Strategy ID to clone
 * @param {Object} cloneData - Clone data
 * @param {string} cloneData.newName - Required: name for the cloned strategy
 * @param {Object} cloneData.adjustParameters - Optional: adjust strategy parameters
 */
export const cloneStrategy = async (strategyId, cloneData) => {
  const transformedData = transformToSnake({
    new_name: cloneData.newName,
    adjust_parameters: cloneData.adjustParameters
  });
  
  const endpoint = API_ENDPOINTS.INVESTMENT.CLONE_STRATEGY(strategyId);
  const response = await apiPost(endpoint, transformedData);
  
  if (response.data) {
    response.data = transformKeys(response.data);
  }
  
  return response;
};

// ============================================================================
// WATCHLIST API
// ============================================================================

/**
 * Get investment watchlist items
 * GET /api/v1/investment/watchlist
 * @returns {Promise<Object>} Watchlist items with total count
 */
export const getWatchlist = async () => {
  try {
    const endpoint = API_ENDPOINTS.INVESTMENT.WATCHLIST.LIST;
    const response = await apiGet(endpoint);
    return transformKeys(response);
  } catch (error) {
    console.error('Error fetching watchlist:', error);
    throw error;
  }
};

/**
 * Add an item to investment watchlist
 * POST /api/v1/investment/watchlist
 * @param {string} symbol - Asset symbol (e.g., 'AAPL')
 * @param {string} assetType - Asset type: 'stock' | 'crypto' | 'etf' | 'bond'
 * @param {string|null} name - Optional asset name
 * @returns {Promise<Object>} Created watchlist item
 */
export const addToWatchlist = async (symbol, assetType, name = null) => {
  try {
    const endpoint = API_ENDPOINTS.INVESTMENT.WATCHLIST.ADD;
    const body = {
      symbol: symbol.toUpperCase(),
      assetType,
      ...(name && { name }),
    };
    const response = await apiPost(endpoint, body);
    return transformKeys(response.watchlistItem || response);
  } catch (error) {
    console.error('Error adding to watchlist:', error);
    throw error;
  }
};

/**
 * Remove an item from investment watchlist
 * DELETE /api/v1/investment/watchlist/{item_id}
 * @param {string} itemId - UUID of the watchlist item
 * @returns {Promise<boolean>} Success status
 */
export const removeFromWatchlist = async (itemId) => {
  try {
    const endpoint = API_ENDPOINTS.INVESTMENT.WATCHLIST.REMOVE(itemId);
    await apiDelete(endpoint);
    return true;
  } catch (error) {
    console.error('Error removing from watchlist:', error);
    throw error;
  }
};
