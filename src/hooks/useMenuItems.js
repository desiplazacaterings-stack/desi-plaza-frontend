import { useState, useEffect, useCallback } from 'react';
import axios from 'axios';
import API_ENDPOINTS from '../config';

const CACHE_KEY = 'menu_items_cache';
const CACHE_DURATION = 5 * 60 * 1000; // 5 minutes

// ✅ utility: force unique items by _id
const dedupeById = (items = []) => {
  const map = new Map();
  items.forEach(item => {
    if (item?._id) {
      map.set(item._id, { ...item });
    }
  });
  return Array.from(map.values());
};

export const useMenuItems = () => {
  const [menuItems, setMenuItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchMenuItems = useCallback(async (forceRefresh = false) => {
    try {
      setLoading(true);
      setError(null);

      // 🔥 STEP 1: ignore old broken cache
      if (!forceRefresh) {
        const cached = localStorage.getItem(CACHE_KEY);
        if (cached) {
          const { data, timestamp } = JSON.parse(cached);
          const age = Date.now() - timestamp;

          if (age < CACHE_DURATION && Array.isArray(data)) {
            console.log('📦 Using cached menu items');
            setMenuItems(dedupeById([...data])); // ✅ clone + dedupe
            setLoading(false);
            return;
          }
        }
      }

      // 🔄 STEP 2: fetch fresh data
      console.log('🔄 Fetching menu items from server...');
      const response = await axios.get(API_ENDPOINTS.ITEMS.GET_ALL);

      let items = [];
      if (Array.isArray(response.data)) {
        items = response.data;
      } else if (Array.isArray(response.data?.items)) {
        items = response.data.items;
      }

      // ✅ clone + dedupe ALWAYS
      const cleanItems = dedupeById([...items]);

      // Cache clean data only
      localStorage.setItem(
        CACHE_KEY,
        JSON.stringify({
          data: cleanItems,
          timestamp: Date.now()
        })
      );

      setMenuItems(cleanItems);
      console.log(`✓ Menu items loaded: ${cleanItems.length}`);
    } catch (err) {
      setError(err.message || 'Failed to fetch menu items');
      console.error('❌ Error fetching menu items:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  const clearCache = useCallback(() => {
    localStorage.removeItem(CACHE_KEY);
    console.log('🧹 Menu cache cleared');
  }, []);

  useEffect(() => {
    fetchMenuItems(true); // 🔥 force clean load on first mount
  }, []);

  return {
    menuItems,
    loading,
    error,
    fetchMenuItems,
    clearCache
  };
};

export default useMenuItems;
