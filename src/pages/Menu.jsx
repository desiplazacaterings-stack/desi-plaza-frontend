
import menuData from "../data/menu.json";
import { useState, useEffect, useRef, useMemo } from "react";
import axios from "axios";
import API_ENDPOINTS from "../config";
import "./Menu.css";

// ✅ Deduplication utility
const dedupeMenuItems = (items = []) => {
  const map = new Map();
  (items || []).forEach(item => {
    if (item?._id) {
      map.set(item._id, { ...item });
    }
  });
  return Array.from(map.values());
};

export default function Menu({ hidePrice = false }) {
  const [filter, setFilter] = useState("All");
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [searchQuery, setSearchQuery] = useState("");
  const [menuItems, setMenuItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [userRole, setUserRole] = useState(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  const fetchInProgress = useRef(false);

  useEffect(() => {
    // Check user authentication
    const token = localStorage.getItem('token');
    const userData = localStorage.getItem('user');
    
    if (token && userData) {
      try {
        const user = JSON.parse(userData);
        setIsAuthenticated(true);
        setUserRole(user.role);
        console.log('✓ User authenticated:', user.role);
      } catch (error) {
        console.error('Error parsing user data:', error);
        setIsAuthenticated(false);
        setUserRole(null);
      }
    } else {
      setIsAuthenticated(false);
      setUserRole(null);
    }
  }, []);

  useEffect(() => {
    // ✅ CRITICAL FIX: Double-guard against multiple mounts
    // If data already loaded OR fetch is in progress, skip
    if (menuItems.length > 0 || fetchInProgress.current) {
      setLoading(false);
      return;
    }

    fetchInProgress.current = true;

    const fetchMenu = async () => {
      try {
        setLoading(true);
        console.log('🔄 Fetching menu from:', API_ENDPOINTS.ITEMS.GET_ALL);
        const response = await axios.get(API_ENDPOINTS.ITEMS.GET_ALL);
        
        let items = [];
        if (response.data && Array.isArray(response.data)) {
          items = response.data;
        } else if (response.data && typeof response.data === 'object' && response.data.items) {
          items = response.data.items;
        } else {
          console.warn('⚠️ Unexpected response format, using local data');
          items = menuData;
        }
        
        // ✅ Deduplicate items - REPLACE state, don't append
        const cleanItems = dedupeMenuItems(items);
        console.log(`✓ Menu items loaded: ${cleanItems.length} items`);
        setMenuItems(cleanItems);
      } catch (error) {
        console.error('❌ Error fetching menu:', error.message, 'Using local data instead');
        setMenuItems(dedupeMenuItems(menuData || []));
      } finally {
        setLoading(false);
        fetchInProgress.current = false;
      }
    };
    
    fetchMenu();
  }, []); // Empty dependency - runs ONCE at mount

  // ✅ SAFETY NET: Deduplicate again in render in case of concurrent mounts
  const displayItems = useMemo(
    () => dedupeMenuItems(menuItems),
    [menuItems]
  );

  // Filter items by veg/non-veg
  let filteredMenu =
    filter === "All"
      ? displayItems
      : displayItems.filter(item => item.veg_nonveg === filter);

  // Filter items by selected category
  if (selectedCategory !== "All") {
    filteredMenu = filteredMenu.filter(item => item.category === selectedCategory);
  }

  // Filter items by search query (category or item name)
  if (searchQuery.trim()) {
    const query = searchQuery.toLowerCase();
    filteredMenu = filteredMenu.filter(item => 
      item.itemName.toLowerCase().includes(query) || 
      item.category.toLowerCase().includes(query)
    );
  }

  // Group items by category
  const groupedByCategory = filteredMenu.reduce((acc, item) => {
    const category = item.category || "Other";
    if (!acc[category]) {
      acc[category] = [];
    }
    acc[category].push(item);
    return acc;
  }, {});

  // Get all unique categories from original menu for category buttons
  const allCategories = [...new Set(displayItems.map(item => item.category || "Other"))].sort();
  
  const categories = Object.keys(groupedByCategory).sort();

  return (
    <div className="menu-container">
      <div className="menu-header">
        <h2>Our Menu</h2>
        <p className="menu-subtitle">Explore our delicious catering options</p>
      </div>

      <div className="filter-buttons">
        <button 
          className={`filter-button ${filter === "All" ? "active" : ""}`} 
          onClick={() => setFilter("All")}
        >
          🍽️ All Items
        </button>
      </div>

      <div className="search-container">
        <input
          type="text"
          className="search-input"
          placeholder="🔍 Search by category or item name..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
        />
        {searchQuery && (
          <button 
            className="search-clear"
            onClick={() => setSearchQuery("")}
          >
            ✕
          </button>
        )}
      </div>

      {/* Category Filter Buttons */}
      <div className="category-filter-section">
        <h3 className="category-filter-title">📂 Browse by Category</h3>
        <div className="category-buttons">
          <button 
            className={`category-btn ${selectedCategory === "All" ? "active" : ""}`}
            onClick={() => setSelectedCategory("All")}
          >
            All Categories
          </button>
          {allCategories.map((category) => (
            <button
              key={category}
              className={`category-btn ${selectedCategory === category ? "active" : ""}`}
              onClick={() => setSelectedCategory(category)}
            >
              {category}
            </button>
          ))}
        </div>
      </div>

      {loading ? (
        <div className="no-items">
          <p>Loading menu...</p>
        </div>
      ) : categories.length > 0 ? (
        <div className="categories-grid">
          {categories.map((category) => (
            <div key={category} className="category-section">
              <div className="category-header">
                <h3>{category}</h3>
                <span className="item-count">{groupedByCategory[category].length} items</span>
              </div>

              <div className="items-list">
                {groupedByCategory[category].map((item, index) => (
                  <div key={index} className="menu-card">
                    <div className="card-header">
                      <h4>{item.itemName}</h4>
                    </div>

                    {isAuthenticated && item.prices && item.prices.length > 0 ? (
                      <div className="prices-container">
                        {item.prices.map((priceObj, i) => (
                          <div key={i} className="price-option">
                            <span className="price-label">
                              {priceObj.units} {priceObj.unit}
                            </span>
                            <span className="price-value">${priceObj.price}</span>
                          </div>
                        ))}
                      </div>
                    ) : !isAuthenticated ? (
                      <div className="item-available">✓ Available</div>
                    ) : hidePrice ? (
                      <div className="item-available">✓ Available</div>
                    ) : (
                      <div className="no-price">No pricing available</div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="no-items">
          <p>No menu items found</p>
          {displayItems.length > 0 && (
            <p style={{ fontSize: '0.9em', color: '#666', marginTop: '10px' }}>
              (Total items loaded: {displayItems.length}, but none match current filter)
            </p>
          )}
        </div>
      )}
    </div>
  );
}
