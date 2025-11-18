import { useState, useEffect } from 'react';

/**
 * Custom Hook: useFetch
 * Fetches data from an API endpoint and manages loading/error states
 * 
 * @param {string} url - The API endpoint URL
 * @param {Object} options - Optional fetch options
 * @returns {Object} - { data, loading, error, refetch }
 * 
 * @example
 * const { data, loading, error, refetch } = useFetch('/api/products');
 */
const useFetch = (url, options = {}) => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchData = async () => {
    setLoading(true);
    setError(null);

    try {
      const response = await fetch(url, {
        ...options,
        headers: {
          'Content-Type': 'application/json',
          ...options.headers,
        },
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const result = await response.json();
      setData(result);
    } catch (err) {
      setError(err.message);
      console.error('Fetch error:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [url]);

  // Refetch function to manually trigger data fetching
  const refetch = () => {
    fetchData();
  };

  return { data, loading, error, refetch };
};

export default useFetch;
