import axios from 'axios';

/**
 * Axios Configuration
 * Central configuration for all HTTP requests
 */

// Create axios instance with default config
const axiosInstance = axios.create({
  baseURL: process.env.REACT_APP_API_BASE_URL || 'http://localhost:8080',
  timeout: 10000, // 10 seconds
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request Interceptor
axiosInstance.interceptors.request.use(
  (config) => {
    // Get token from localStorage
    const token = localStorage.getItem('authToken');
    
    // If token exists, add it to request headers
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }

    // Log request for debugging (remove in production)
    if (process.env.NODE_ENV === 'development') {
      console.log('🚀 Request:', config.method.toUpperCase(), config.url);
    }

    return config;
  },
  (error) => {
    console.error('❌ Request Error:', error);
    return Promise.reject(error);
  }
);

// Response Interceptor
axiosInstance.interceptors.response.use(
  (response) => {
    // Log response for debugging (remove in production)
    if (process.env.NODE_ENV === 'development') {
      console.log('✅ Response:', response.config.url, response.status);
    }

    return response;
  },
  (error) => {
    // Handle different error scenarios
    if (error.response) {
      // Server responded with error status
      const { status, data } = error.response;

      switch (status) {
        case 401:
          // Unauthorized - clear token and redirect to login
          console.error('🔒 Unauthorized access - redirecting to login');
          localStorage.removeItem('authToken');
          window.location.href = '/login';
          break;

        case 403:
          // Forbidden
          console.error('⛔ Access forbidden');
          break;

        case 404:
          // Not found
          console.error('🔍 Resource not found');
          break;

        case 500:
          // Internal server error
          console.error('💥 Server error');
          break;

        default:
          console.error('❌ Error:', status, data);
      }
    } else if (error.request) {
      // Request was made but no response received
      console.error('📡 No response from server');
    } else {
      // Something else happened
      console.error('❌ Error:', error.message);
    }

    return Promise.reject(error);
  }
);

export default axiosInstance;
