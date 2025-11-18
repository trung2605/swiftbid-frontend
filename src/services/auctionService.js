import axios from '../config/axiosConfig';

/**
 * Auction Service
 * Handles all API calls related to auctions
 */

const API_BASE_URL = '/api/auctions';

const auctionService = {
  /**
   * Fetch all auctions
   * @returns {Promise} - Promise with auctions data
   */
  getAllAuctions: async () => {
    try {
      const response = await axios.get(API_BASE_URL);
      return response.data;
    } catch (error) {
      console.error('Error fetching auctions:', error);
      throw error;
    }
  },

  /**
   * Fetch auction details by auction ID
   * @param {number} auctionId - Auction ID
   * @returns {Promise} - Promise with auction detail data
   */
  getAuctionDetails: async (auctionId) => {
    try {
      const response = await axios.get(`${API_BASE_URL}/${auctionId}/details`);
      return response.data;
    } catch (error) {
      console.error(`Error fetching auction details for ${auctionId}:`, error);
      throw error;
    }
  },

  /**
   * Fetch a single auction by ID
   * @param {number} id - Auction ID
   * @returns {Promise} - Promise with auction data
   */
  getAuctionById: async (id) => {
    try {
      const response = await axios.get(`${API_BASE_URL}/${id}`);
      return response.data;
    } catch (error) {
      console.error(`Error fetching auction ${id}:`, error);
      throw error;
    }
  },

  /**
   * Create a new auction
   * @param {Object} auctionData - Auction data to create
   * @param {number} productId - Product ID for the auction
   * @returns {Promise} - Promise with created auction data
   */
  createAuction: async (auctionData, productId) => {
    try {
      const response = await axios.post(API_BASE_URL, auctionData, {
        params: { productId }
      });
      return response.data;
    } catch (error) {
      console.error('Error creating auction:', error);
      throw error;
    }
  },

  /**
   * Update an existing auction
   * @param {number} id - Auction ID
   * @param {Object} auctionData - Updated auction data
   * @returns {Promise} - Promise with updated auction data
   */
  updateAuction: async (id, auctionData) => {
    try {
      const response = await axios.put(`${API_BASE_URL}/${id}`, auctionData);
      return response.data;
    } catch (error) {
      console.error(`Error updating auction ${id}:`, error);
      throw error;
    }
  },

  /**
   * Delete an auction
   * @param {number} id - Auction ID
   * @returns {Promise} - Promise resolving when deletion is complete
   */
  deleteAuction: async (id) => {
    try {
      await axios.delete(`${API_BASE_URL}/${id}`);
      return { success: true, message: 'Auction deleted successfully' };
    } catch (error) {
      console.error(`Error deleting auction ${id}:`, error);
      throw error;
    }
  },

  /**
   * Get active auctions
   * @returns {Promise} - Promise with active auctions data
   */
  getActiveAuctions: async () => {
    try {
      const response = await axios.get(`${API_BASE_URL}/active`);
      return response.data;
    } catch (error) {
      console.error('Error fetching active auctions:', error);
      throw error;
    }
  }
};

export default auctionService;
