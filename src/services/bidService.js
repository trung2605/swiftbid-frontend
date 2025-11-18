import axios from '../config/axiosConfig';

/**
 * Bid Service
 * Handles all API calls related to bids
 */

const API_BASE_URL = '/api/bids';

const bidService = {
  /**
   * Fetch all bids
   * @returns {Promise} - Promise with bids data
   */
  getAllBids: async () => {
    try {
      const response = await axios.get(API_BASE_URL);
      return response.data;
    } catch (error) {
      console.error('Error fetching bids:', error);
      throw error;
    }
  },

  /**
   * Fetch a single bid by ID
   * @param {number} id - Bid ID
   * @returns {Promise} - Promise with bid data
   */
  getBidById: async (id) => {
    try {
      const response = await axios.get(`${API_BASE_URL}/${id}`);
      return response.data;
    } catch (error) {
      console.error(`Error fetching bid ${id}:`, error);
      throw error;
    }
  },

  /**
   * Place a new bid
   * @param {Object} bidData - Bid data containing auction ID, user ID, and bid amount
   * @returns {Promise} - Promise with created bid data
   */
  placeBid: async (bidData) => {
    try {
      const response = await axios.post(API_BASE_URL, bidData);
      return response.data;
    } catch (error) {
      console.error('Error placing bid:', error);
      throw error;
    }
  },

  /**
   * Get bids for a specific auction
   * @param {number} auctionId - Auction ID
   * @returns {Promise} - Promise with bids data for the auction
   */
  getBidsByAuction: async (auctionId) => {
    try {
      const response = await axios.get(`${API_BASE_URL}/auction/${auctionId}`);
      return response.data;
    } catch (error) {
      console.error(`Error fetching bids for auction ${auctionId}:`, error);
      throw error;
    }
  },

  /**
   * Get bids placed by a specific user
   * @param {number} userId - User ID
   * @returns {Promise} - Promise with bids data for the user
   */
  getBidsByUser: async (userId) => {
    try {
      const response = await axios.get(`${API_BASE_URL}/user/${userId}`);
      return response.data;
    } catch (error) {
      console.error(`Error fetching bids for user ${userId}:`, error);
      throw error;
    }
  },

  /**
   * Delete a bid
   * @param {number} id - Bid ID
   * @returns {Promise} - Promise resolving when deletion is complete
   */
  deleteBid: async (id) => {
    try {
      await axios.delete(`${API_BASE_URL}/${id}`);
      return { success: true, message: 'Bid deleted successfully' };
    } catch (error) {
      console.error(`Error deleting bid ${id}:`, error);
      throw error;
    }
  }
};

export default bidService;
