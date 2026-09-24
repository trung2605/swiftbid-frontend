import apiClient from '../config/api';

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
      const response = await apiClient.get(API_BASE_URL);
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
      const response = await apiClient.get(`${API_BASE_URL}/${auctionId}/details`);
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
      const response = await apiClient.get(`${API_BASE_URL}/${id}`);
      return response.data;
    } catch (error) {
      console.error(`Error fetching auction ${id}:`, error);
      throw error;
    }
  },

  /**
   * Create a new auction
   * @param {FormData} formData - FormData containing auction data and banner image
   * @returns {Promise} - Promise with created auction data
   */
  createAuction: async (formData) => {
    try {
      const response = await apiClient.post(API_BASE_URL, formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      return response.data;
    } catch (error) {
      console.error('Error creating auction:', error);
      throw error;
    }
  },

  /**
   * Update an existing auction's schedule (only allowed while it's still PENDING).
   * Backend takes startTime/endTime as request params, not a JSON body.
   * @param {number} id - Auction ID
   * @param {{startTime: string, endTime: string}} auctionData - ISO date-time strings
   * @returns {Promise} - Promise with updated auction data
   */
  updateAuction: async (id, { startTime, endTime }) => {
    try {
      const response = await apiClient.put(`${API_BASE_URL}/${id}`, null, {
        params: { startTime, endTime },
      });
      return response.data;
    } catch (error) {
      console.error(`Error updating auction ${id}:`, error);
      throw error;
    }
  },

  /**
   * Fetch auctions created by the currently authenticated seller.
   * @returns {Promise} - Promise with the caller's own auctions
   */
  getMyAuctions: async () => {
    try {
      const response = await apiClient.get(`${API_BASE_URL}/my-auctions`);
      return response.data;
    } catch (error) {
      console.error('Error fetching my auctions:', error);
      throw error;
    }
  },

  /**
   * Cancel (soft-delete) an auction.
   * @param {number} id - Auction ID
   * @returns {Promise} - Promise resolving when cancellation is complete
   */
  deleteAuction: async (id) => {
    try {
      await apiClient.delete(`${API_BASE_URL}/${id}`);
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
      const response = await apiClient.get(`${API_BASE_URL}/active`);
      return response.data;
    } catch (error) {
      console.error('Error fetching active auctions:', error);
      throw error;
    }
  },

  getFeaturedAuctions: async () => {
    try {
      const response = await apiClient.get(`${API_BASE_URL}/featured`);
      return response.data;
    } catch (error) {
      console.error('Error fetching featured auctions:', error);
      throw error;
    }
  }

};

export default auctionService;
