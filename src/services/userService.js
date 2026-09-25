import apiClient from '../config/api';

/**
 * User Service (Admin-only, FR-ADMIN-01)
 * All endpoints here require the ADMIN role — the backend enforces this with
 * @PreAuthorize("hasRole('ADMIN')") regardless of what the client does.
 */
const API_BASE_URL = '/api/users';

const userService = {
  getAllUsers: async () => {
    try {
      const response = await apiClient.get(API_BASE_URL);
      return response.data;
    } catch (error) {
      console.error('Error fetching users:', error);
      throw error;
    }
  },

  deleteUser: async (id) => {
    try {
      await apiClient.delete(`${API_BASE_URL}/${id}`);
      return { success: true };
    } catch (error) {
      console.error(`Error deleting user ${id}:`, error);
      throw error;
    }
  },
};

export default userService;
