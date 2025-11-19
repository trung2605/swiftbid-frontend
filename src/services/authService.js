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

export const getCurrentUser = () => {
  return apiClient.get('/api/user-details/me');
};

export const becomeSeller = () => {
  return apiClient.post('/api/account/become-seller');
};

export const getRoles = () => {
  return apiClient.get('/api/account/roles');
}

export const isAuthenticated = () => {
  const token = localStorage.getItem('token');
  return !!token;
};
