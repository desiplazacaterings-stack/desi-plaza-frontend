import menuData from "../data/menu.json";
import { useState, useEffect, useMemo } from "react";
import useMenuItems from "../hooks/useMenuItems";
import "./Menu.css";

// ✅ Improved deduplication utility - handles missing _id
const dedupeMenuItems = (items = []) => {
  const seen = new Set();
  const result = [];

  (items || []).forEach((item, index) => {
    // Create unique identifier: prefer _id, fallback to itemName+category combo
    const uniqueKey = item?._id 
      ? String(item._id)
      : `${item?.itemName}-${item?.category}`;

    if (!seen.has(uniqueKey)) {
      seen.add(uniqueKey);
      result.push({ ...item, __uniqueKey: uniqueKey });
    }
  });

  return result;
};

export default function Menu({ hidePrice = false }) {
  // ✅ USE HOOK - Single source of truth for menu
  const { menuItems: hookMenuItems, loading: hookLoading, error: hookError } = useMenuItems();
  
  const [filter, setFilter] = useState("All");
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [searchQuery, setSearchQuery] = useState("");
  const [userRole, setUserRole] = useState(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

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

  // ✅ DEDUPLICATION: Remove exact duplicates from hook data
  const displayItems = useMemo(
    () => dedupeMenuItems(hookMenuItems || []),
    [hookMenuItems]
  );

  // ✅ DEBUG: Log deduplication results
  useEffect(() => {
    if (hookMenuItems && displayItems) {
      console.log(`📊 Menu deduplication: ${hookMenuItems.length} items → ${displayItems.length} unique items`);
    }
  }, [hookMenuItems, displayItems]);

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

      {/* ✅ FIX: Changed 'loading' to 'hookLoading' */}
      {hookLoading ? (
        <div className="no-items">
          <p>Loading menu...</p>
        </div>
      ) : hookError ? (
        <div className="no-items">
          <p>Error loading menu: {hookError}</p>
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
                {groupedByCategory[category].map((item) => (
                  <div 
                    key={item.__uniqueKey || item._id || `${item.itemName}-${item.category}`} 
                    className="menu-card"
                  >
                    <div className="card-header">
                      <h4>{item.itemName}</h4>
                    </div>

                    {isAuthenticated && item.prices && item.prices.length > 0 ? (
                      <div className="prices-container">
                        {item.prices.map((priceObj, i) => (
                          <div key={`${item.__uniqueKey}-price-${i}`} className="price-option">
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
