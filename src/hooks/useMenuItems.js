import { useState, useEffect, useCallback } from 'react';
import axios from 'axios';
import API_ENDPOINTS from '../config';

const CACHE_KEY = 'menu_items_cache';
const CACHE_DURATION = 5 * 60 * 1000; // 5 minutes

export const useMenuItems = () => {
  const [menuItems, setMenuItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchMenuItems = useCallback(async (forceRefresh = false) => {
    try {
      setLoading(true);
      setError(null);

      // Check cache first
      if (!forceRefresh) {
        const cached = localStorage.getItem(CACHE_KEY);
        if (cached) {
          const { data, timestamp } = JSON.parse(cached);
          const age = Date.now() - timestamp;
          if (age < CACHE_DURATION) {
            console.log('📦 Using cached menu items');
            setMenuItems(data);
            setLoading(false);
            return;
          }
        }
      }

      // Fetch from server
      console.log('🔄 Fetching menu items from server...');
      const response = await axios.get(API_ENDPOINTS.ITEMS.GET_ALL);
      
      console.log('📦 API Response:', response.data);
      
      let items = [];
      if (Array.isArray(response.data)) {
        items = response.data;
        console.log(`✓ Response is array: ${items.length} items`);
      } else if (response.data && response.data.items && Array.isArray(response.data.items)) {
        items = response.data.items;
        console.log(`✓ Response has .items property: ${items.length} items`);
      } else {
        console.warn('⚠️ Unexpected response format:', typeof response.data, Object.keys(response.data || {}));
      }

      // Cache the results
      localStorage.setItem(
        CACHE_KEY,
        JSON.stringify({
          data: items,
          timestamp: Date.now()
        })
      );

      setMenuItems(items);
      console.log(`✓ Menu items cached: ${items.length} items`);
    } catch (err) {
      setError(err.message || 'Failed to fetch menu items');
      console.error('❌ Error fetching menu items:', err.message);
    } finally {
      setLoading(false);
    }
  }, []);

  // Clear cache
  const clearCache = useCallback(() => {
    localStorage.removeItem(CACHE_KEY);
    console.log('Cache cleared');
  }, []);

  // Fetch on mount
  useEffect(() => {
    fetchMenuItems();
  }, [fetchMenuItems]);

  return {
    menuItems,
    loading,
    error,
    fetchMenuItems,
    clearCache
  };
};

export default useMenuItems;
