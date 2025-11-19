import apiClient from "../config/api";

/**
 * Product Service
 * Handles all API calls related to products/auctions
 */

const API_BASE_URL = "/api/products";

const productService = {
  /**
   * Fetch all products
   * @returns {Promise} - Promise with products data
   */
  getAllProducts: async () => {
    try {
      const response = await apiClient.get(API_BASE_URL);
      return response.data;
    } catch (error) {
      console.error("Error fetching products:", error);
      throw error;
    }
  },

  getMyProducts: async () => {
    try {
      const token = localStorage.getItem("token");

      if (token) {
      }

      const response = await apiClient.get(`${API_BASE_URL}/my-products`);

      // Backend returns: { status: 200, data: [...], timestamp: '...' }
      // So we need to access response.data.data for the actual array
      const backendData = response.data;
      const productsArray = backendData.data || backendData; // Try .data first, fallback to root

      return Array.isArray(productsArray) ? productsArray : [];
    } catch (error) {
      throw error;
    }
  },

  /**
   * Fetch a single product by ID
   * @param {number} id - Product ID
   * @returns {Promise} - Promise with product data
   */
  getProductById: async (id) => {
    try {
      const response = await apiClient.get(`${API_BASE_URL}/${id}`);
      return response.data;
    } catch (error) {
      console.error(`Error fetching product ${id}:`, error);
      throw error;
    }
  },

  /**
   * Create a new product
   * @param {Object} productData - Product data to create
   * @returns {Promise} - Promise with created product data
   */
  createProduct: async (productData) => {
    try {
      const response = await apiClient.post(API_BASE_URL, productData);
      return response.data;
    } catch (error) {
      console.error("Error creating product:", error);
      throw error;
    }
  },

  /**
   * Update an existing product
   * @param {number} id - Product ID
   * @param {Object} productData - Updated product data
   * @returns {Promise} - Promise with updated product data
   */
  updateProduct: async (id, productData) => {
    try {
      const response = await apiClient.put(
        `${API_BASE_URL}/${id}`,
        productData
      );
      return response.data;
    } catch (error) {
      console.error(`Error updating product ${id}:`, error);
      throw error;
    }
  },

  /**
   * Delete a product
   * @param {number} id - Product ID
   * @returns {Promise} - Promise resolving when deletion is complete
   */
  deleteProduct: async (id) => {
    try {
      await apiClient.delete(`${API_BASE_URL}/${id}`);
      return { success: true, message: "Product deleted successfully" };
    } catch (error) {
      console.error(`Error deleting product ${id}:`, error);
      throw error;
    }
  },

  /**
   * Search products by name or description
   * @param {string} query - Search query
   * @returns {Promise} - Promise with search results
   */
  searchProducts: async (query) => {
    try {
      const response = await apiClient.get(`${API_BASE_URL}/search`, {
        params: { q: query },
      });
      return response.data;
    } catch (error) {
      console.error("Error searching products:", error);
      throw error;
    }
  },
};

export default productService;
