import apiClient from '../config/api';

/**
 * Authentication Service
 * Handles all authentication-related API calls
 */

/**
 * Register a new user
 * @param {Object} registerRequest - { username, email, password }
 * @returns {Promise} - Promise with registration response
 */
export const register = (registerRequest) => {
  return apiClient.post('/api/auth/register', registerRequest);
};

/**
 * Login user
 * @param {Object} loginRequest - { username, password }
 * @returns {Promise} - Promise with login response (includes token)
 */
export const login = (loginRequest) => {
  return apiClient.post('/api/auth/login', loginRequest);
};

/**
 * Request password reset
 * @param {Object} forgotRequest - { email }
 * @returns {Promise} - Promise with forgot password response
 */
export const forgotPassword = (forgotRequest) => {
  return apiClient.post('/api/auth/forgot-password', forgotRequest);
};

/**
 * Reset password with token
 * @param {Object} resetRequest - { token, newPassword }
 * @returns {Promise} - Promise with reset password response
 */
export const resetPassword = (resetRequest) => {
  return apiClient.post('/api/auth/reset-password', resetRequest);
};

/**
 * Logout user (client-side)
 * Clears token and user data from localStorage
 */
export const logout = () => {
  localStorage.removeItem('token');
  localStorage.removeItem('user');
  delete apiClient.defaults.headers.common['Authorization'];
};

/**
 * Get current user profile
 * @returns {Promise} - Promise with user data
 */
export const getCurrentUser = () => {
  return apiClient.get('/api/user-details/me');
};

/**
 * Check if user is authenticated
 * @returns {boolean}
 */
export const isAuthenticated = () => {
  const token = localStorage.getItem('token');
  return !!token;
};
