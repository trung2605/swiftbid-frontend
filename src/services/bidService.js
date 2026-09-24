import apiClient from '../config/api';

/**
 * Bid Service
 * Handles all API calls related to bids
 */

const API_BASE_URL = '/api/bids';

const bidService = {
  /**
   * Place a new bid on an auction.
   * userId is intentionally NOT sent — the backend always takes it from the JWT (FR-BID-01).
   * @param {number} auctionId - Auction ID
   * @param {number} bidAmount - Bid amount
   * @returns {Promise} - Promise with created bid data
   */
  placeBid: async (auctionId, bidAmount) => {
    try {
      const response = await apiClient.post(API_BASE_URL, { auctionId, bidAmount });
      return response.data;
    } catch (error) {
      console.error('Error placing bid:', error);
      throw error;
    }
  },

  /**
   * Get bid history for a specific auction (newest first).
   * @param {number} auctionId - Auction ID
   * @returns {Promise} - Promise with bids data for the auction
   */
  getBidsByAuction: async (auctionId) => {
    try {
      const response = await apiClient.get(`${API_BASE_URL}/auction/${auctionId}`);
      return response.data;
    } catch (error) {
      console.error(`Error fetching bids for auction ${auctionId}:`, error);
      throw error;
    }
  },

  /**
   * Get bids placed by a specific user (newest first).
   * @param {number} userId - User ID
   * @returns {Promise} - Promise with bids data for the user
   */
  getBidsByUser: async (userId) => {
    try {
      const response = await apiClient.get(`${API_BASE_URL}/user/${userId}`);
      return response.data;
    } catch (error) {
      console.error(`Error fetching bids for user ${userId}:`, error);
      throw error;
    }
  },
};

export default bidService;
