/**
 * Marketplace API Service
 * Handles all marketplace-related API calls
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
// MARKETPLACE LISTINGS APIs (from INVESTMENT_APIS.md)
// ============================================================================

/**
 * Create Marketplace Listing
 * POST /api/v1/marketplace/listings
 */
export const createListing = async (listingData) => {
  const transformedData = transformToSnake(listingData);
  const endpoint = API_ENDPOINTS.MARKETPLACE.CREATE_LISTING;
  const response = await apiPost(endpoint, transformedData);
  
  if (response.data) {
    response.data = transformKeys(response.data);
  }
  
  return response;
};

/**
 * List All Marketplace Listings
 * GET /api/v1/marketplace/listings
 */
export const listListings = async (params = {}) => {
  const queryParams = new URLSearchParams();
  if (params.statusFilter) queryParams.append('status_filter', params.statusFilter);
  if (params.page) queryParams.append('page', params.page);
  if (params.limit) queryParams.append('limit', params.limit);
  
  const endpoint = `${API_ENDPOINTS.MARKETPLACE.LIST_LISTINGS}${queryParams.toString() ? `?${queryParams.toString()}` : ''}`;
  const response = await apiGet(endpoint);
  
  if (response.data) {
    response.data = transformKeys(response.data);
  }
  if (response.pagination) {
    response.pagination = transformKeys(response.pagination);
  }
  
  return response;
};

/**
 * Get Listing Details
 * GET /api/v1/marketplace/listings/{listing_id}
 */
export const getListing = async (listingId) => {
  const endpoint = API_ENDPOINTS.MARKETPLACE.GET_LISTING(listingId);
  const response = await apiGet(endpoint);
  
  if (response.data) {
    response.data = transformKeys(response.data);
  }
  
  return response;
};

/**
 * Update Listing
 * PUT /api/v1/marketplace/listings/{listing_id}
 */
export const updateListing = async (listingId, listingData) => {
  const transformedData = transformToSnake(listingData);
  const endpoint = API_ENDPOINTS.MARKETPLACE.UPDATE_LISTING(listingId);
  const response = await apiPut(endpoint, transformedData);
  
  if (response.data) {
    response.data = transformKeys(response.data);
  }
  
  return response;
};

/**
 * Delete/Cancel Listing
 * DELETE /api/v1/marketplace/listings/{listing_id}
 */
export const deleteListing = async (listingId) => {
  const endpoint = API_ENDPOINTS.MARKETPLACE.DELETE_LISTING(listingId);
  return await apiDelete(endpoint);
};

/**
 * Approve Listing (Admin Only)
 * POST /api/v1/marketplace/listings/{listing_id}/approve
 */
export const approveListing = async (listingId) => {
  const endpoint = API_ENDPOINTS.MARKETPLACE.APPROVE_LISTING(listingId);
  const response = await apiPost(endpoint, {});
  
  if (response.data) {
    response.data = transformKeys(response.data);
  }
  
  return response;
};

/**
 * Activate Listing
 * POST /api/v1/marketplace/listings/{listing_id}/activate
 */
export const activateListing = async (listingId) => {
  const endpoint = API_ENDPOINTS.MARKETPLACE.ACTIVATE_LISTING(listingId);
  const response = await apiPost(endpoint, {});
  
  if (response.data) {
    response.data = transformKeys(response.data);
  }
  
  return response;
};

/**
 * Pay Listing Fee
 * POST /api/v1/marketplace/listings/{listing_id}/pay-fee
 */
export const payListingFee = async (listingId) => {
  const endpoint = API_ENDPOINTS.MARKETPLACE.PAY_LISTING_FEE(listingId);
  const response = await apiPost(endpoint, {});
  
  if (response.data) {
    response.data = transformKeys(response.data);
  }
  
  return response;
};

/**
 * Get Listing Offers
 * GET /api/v1/marketplace/listings/{listing_id}/offers
 */
export const getListingOffers = async (listingId) => {
  const endpoint = API_ENDPOINTS.MARKETPLACE.GET_LISTING_OFFERS(listingId);
  const response = await apiGet(endpoint);
  
  if (response.data) {
    response.data = transformKeys(response.data);
  }
  
  return response;
};

/**
 * Search Marketplace Listings
 * GET /api/v1/marketplace/search
 */
export const searchMarketplace = async (params = {}) => {
  const queryParams = new URLSearchParams();
  if (params.q) queryParams.append('q', params.q);
  if (params.assetType) queryParams.append('asset_type', params.assetType);
  if (params.minPrice) queryParams.append('min_price', params.minPrice);
  if (params.maxPrice) queryParams.append('max_price', params.maxPrice);
  if (params.sortBy) queryParams.append('sort_by', params.sortBy);
  if (params.page) queryParams.append('page', params.page);
  if (params.limit) queryParams.append('limit', params.limit);
  
  const endpoint = `${API_ENDPOINTS.MARKETPLACE.SEARCH}${queryParams.toString() ? `?${queryParams.toString()}` : ''}`;
  const response = await apiGet(endpoint);
  
  if (response.data) {
    response.data = transformKeys(response.data);
  }
  
  return response;
};

// ============================================================================
// MARKETPLACE OFFERS APIs (from INVESTMENT_APIS.md)
// ============================================================================

/**
 * Create Offer on Listing
 * POST /api/v1/marketplace/listings/{listing_id}/offers
 */
export const createOffer = async (listingId, offerData) => {
  const transformedData = transformToSnake(offerData);
  const endpoint = API_ENDPOINTS.MARKETPLACE.CREATE_OFFER(listingId);
  const response = await apiPost(endpoint, transformedData);
  
  if (response.data) {
    response.data = transformKeys(response.data);
  }
  
  return response;
};

/**
 * Get Offer Details
 * GET /api/v1/marketplace/offers/{offer_id}
 */
export const getOffer = async (offerId) => {
  const endpoint = API_ENDPOINTS.MARKETPLACE.GET_OFFER(offerId);
  const response = await apiGet(endpoint);
  
  if (response.data) {
    response.data = transformKeys(response.data);
  }
  
  return response;
};

/**
 * Accept Offer and Create Escrow
 * POST /api/v1/marketplace/offers/{offer_id}/accept
 */
export const acceptOffer = async (offerId) => {
  const endpoint = API_ENDPOINTS.MARKETPLACE.ACCEPT_OFFER(offerId);
  const response = await apiPost(endpoint, {});
  
  if (response.data) {
    response.data = transformKeys(response.data);
  }
  
  return response;
};

/**
 * Reject Offer
 * POST /api/v1/marketplace/offers/{offer_id}/reject
 */
export const rejectOffer = async (offerId) => {
  const endpoint = API_ENDPOINTS.MARKETPLACE.REJECT_OFFER(offerId);
  const response = await apiPost(endpoint, {});
  
  if (response.data) {
    response.data = transformKeys(response.data);
  }
  
  return response;
};

/**
 * Create Counter Offer
 * POST /api/v1/marketplace/offers/{offer_id}/counter
 */
export const counterOffer = async (offerId, counterData) => {
  const transformedData = transformToSnake(counterData);
  const endpoint = API_ENDPOINTS.MARKETPLACE.COUNTER_OFFER(offerId);
  const response = await apiPost(endpoint, transformedData);
  
  if (response.data) {
    response.data = transformKeys(response.data);
  }
  
  return response;
};

/**
 * Withdraw Offer
 * POST /api/v1/marketplace/offers/{offer_id}/withdraw
 */
export const withdrawOffer = async (offerId) => {
  const endpoint = API_ENDPOINTS.MARKETPLACE.WITHDRAW_OFFER(offerId);
  const response = await apiPost(endpoint, {});
  
  if (response.data) {
    response.data = transformKeys(response.data);
  }
  
  return response;
};

/**
 * Get User's Offers
 * GET /api/v1/marketplace/offers/my
 */
export const getMyOffers = async (params = {}) => {
  const queryParams = new URLSearchParams();
  if (params.statusFilter) queryParams.append('status_filter', params.statusFilter);
  
  const endpoint = `${API_ENDPOINTS.MARKETPLACE.MY_OFFERS}${queryParams.toString() ? `?${queryParams.toString()}` : ''}`;
  const response = await apiGet(endpoint);
  
  if (response.data) {
    response.data = transformKeys(response.data);
  }
  
  return response;
};

// ============================================================================
// MARKETPLACE ESCROW APIs (from INVESTMENT_APIS.md)
// ============================================================================

/**
 * Get Escrow Details
 * GET /api/v1/marketplace/escrow/{escrow_id}
 */
export const getEscrow = async (escrowId) => {
  const endpoint = API_ENDPOINTS.MARKETPLACE.GET_ESCROW(escrowId);
  const response = await apiGet(endpoint);
  
  if (response.data) {
    response.data = transformKeys(response.data);
  }
  
  return response;
};

/**
 * Mark Escrow as Funded
 * POST /api/v1/marketplace/escrow/{escrow_id}/fund
 */
export const fundEscrow = async (escrowId) => {
  const endpoint = API_ENDPOINTS.MARKETPLACE.FUND_ESCROW(escrowId);
  const response = await apiPost(endpoint, {});
  
  if (response.data) {
    response.data = transformKeys(response.data);
  }
  
  return response;
};

/**
 * Release Escrow Funds to Seller
 * POST /api/v1/marketplace/escrow/{escrow_id}/release
 */
export const releaseEscrow = async (escrowId) => {
  const endpoint = API_ENDPOINTS.MARKETPLACE.RELEASE_ESCROW(escrowId);
  const response = await apiPost(endpoint, {});
  
  if (response.data) {
    response.data = transformKeys(response.data);
  }
  
  return response;
};

/**
 * Create Dispute for Escrow
 * POST /api/v1/marketplace/escrow/{escrow_id}/dispute
 */
export const disputeEscrow = async (escrowId, reason) => {
  const endpoint = API_ENDPOINTS.MARKETPLACE.DISPUTE_ESCROW(escrowId);
  const response = await apiPost(endpoint, { reason });
  
  if (response.data) {
    response.data = transformKeys(response.data);
  }
  
  return response;
};

/**
 * Refund Escrow to Buyer
 * POST /api/v1/marketplace/escrow/{escrow_id}/refund
 */
export const refundEscrow = async (escrowId) => {
  const endpoint = API_ENDPOINTS.MARKETPLACE.REFUND_ESCROW(escrowId);
  const response = await apiPost(endpoint, {});
  
  if (response.data) {
    response.data = transformKeys(response.data);
  }
  
  return response;
};

// ============================================================================
// MARKETPLACE MARKET HIGHLIGHTS APIs
// ============================================================================

/**
 * Get Market Highlights
 * GET /api/v1/marketplace/market-highlights
 */
export const getMarketHighlights = async (params = {}) => {
  const queryParams = new URLSearchParams();
  if (params.timeRange) queryParams.append('time_range', params.timeRange);
  if (params.categories) queryParams.append('categories', params.categories);
  
  const endpoint = `${API_ENDPOINTS.MARKETPLACE.MARKET_HIGHLIGHTS}${queryParams.toString() ? `?${queryParams.toString()}` : ''}`;
  const response = await apiGet(endpoint);
  
  if (response.data) {
    response.data = transformKeys(response.data);
  }
  
  return response;
};

/**
 * Get Market Trends
 * GET /api/v1/marketplace/market-trends
 */
export const getMarketTrends = async (params = {}) => {
  const queryParams = new URLSearchParams();
  if (params.timeRange) queryParams.append('time_range', params.timeRange);
  if (params.category) queryParams.append('category', params.category);
  if (params.granularity) queryParams.append('granularity', params.granularity);
  
  const endpoint = `${API_ENDPOINTS.MARKETPLACE.MARKET_TRENDS}${queryParams.toString() ? `?${queryParams.toString()}` : ''}`;
  const response = await apiGet(endpoint);
  
  if (response.data) {
    response.data = transformKeys(response.data);
  }
  
  return response;
};

/**
 * Get Market Summary
 * GET /api/v1/marketplace/market-summary
 */
export const getMarketSummary = async (params = {}) => {
  const queryParams = new URLSearchParams();
  if (params.timeRange) queryParams.append('time_range', params.timeRange);
  
  const endpoint = `${API_ENDPOINTS.MARKETPLACE.MARKET_SUMMARY}${queryParams.toString() ? `?${queryParams.toString()}` : ''}`;
  const response = await apiGet(endpoint);
  
  if (response.data) {
    response.data = transformKeys(response.data);
  }
  
  return response;
};

// ============================================================================
// MARKETPLACE WATCHLIST APIs
// ============================================================================

/**
 * Get User's Watchlist
 * GET /api/v1/marketplace/watchlist
 */
export const getWatchlist = async (params = {}) => {
  const queryParams = new URLSearchParams();
  if (params.statusFilter) queryParams.append('status_filter', params.statusFilter);
  if (params.category) queryParams.append('category', params.category);
  if (params.sortBy) queryParams.append('sort_by', params.sortBy);
  
  const endpoint = `${API_ENDPOINTS.MARKETPLACE.WATCHLIST}${queryParams.toString() ? `?${queryParams.toString()}` : ''}`;
  const response = await apiGet(endpoint);
  
  // Watchlist returns array directly, not wrapped in data
  if (Array.isArray(response)) {
    return { data: response.map(transformKeys) };
  }
  
  if (response.data) {
    response.data = Array.isArray(response.data) 
      ? response.data.map(transformKeys)
      : transformKeys(response.data);
  }
  
  return response;
};

/**
 * Add Listing to Watchlist
 * POST /api/v1/marketplace/watchlist
 */
export const addToWatchlist = async (watchlistData) => {
  const transformedData = transformToSnake(watchlistData);
  const endpoint = API_ENDPOINTS.MARKETPLACE.ADD_TO_WATCHLIST;
  const response = await apiPost(endpoint, transformedData);
  
  if (response.data) {
    response.data = transformKeys(response.data);
  }
  
  return response;
};

/**
 * Check if Listing is in Watchlist
 * GET /api/v1/marketplace/watchlist/check/{listing_id}
 */
export const checkWatchlist = async (listingId) => {
  const endpoint = API_ENDPOINTS.MARKETPLACE.CHECK_WATCHLIST(listingId);
  const response = await apiGet(endpoint);
  
  if (response.data) {
    response.data = transformKeys(response.data);
  }
  
  return response;
};

/**
 * Remove Item from Watchlist
 * DELETE /api/v1/marketplace/watchlist/{watchlist_item_id}
 */
export const removeFromWatchlist = async (watchlistItemId) => {
  const endpoint = API_ENDPOINTS.MARKETPLACE.REMOVE_FROM_WATCHLIST(watchlistItemId);
  return await apiDelete(endpoint);
};

/**
 * Update Watchlist Item
 * PUT /api/v1/marketplace/watchlist/{watchlist_item_id}
 */
export const updateWatchlistItem = async (watchlistItemId, watchlistData) => {
  const transformedData = transformToSnake(watchlistData);
  const endpoint = API_ENDPOINTS.MARKETPLACE.UPDATE_WATCHLIST_ITEM(watchlistItemId);
  const response = await apiPut(endpoint, transformedData);
  
  if (response.data) {
    response.data = transformKeys(response.data);
  }
  
  return response;
};
