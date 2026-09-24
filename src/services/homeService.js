import apiClient from '../config/api';

/**
 * Home Service
 * Fetches aggregate stats for the homepage (FR-HOME-01).
 */
const homeService = {
  getStats: async () => {
    try {
      const response = await apiClient.get('/api/home/stats');
      return response.data;
    } catch (error) {
      console.error('Error fetching home stats:', error);
      throw error;
    }
  },
};

export default homeService;
