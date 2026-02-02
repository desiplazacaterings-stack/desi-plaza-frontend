import { useMemo } from 'react';

/**
 * 🎯 Custom Hook: Get unique menu items with filtering
 * 
 * Solves menu item duplication by:
 * 1. Deduplicating by itemName (each item appears once)
 * 2. Preserving all price variants in prices[] array
 * 3. Supporting search and category filtering
 * 4. Memoizing to prevent unnecessary re-renders
 * 
 * @param {Array} menuItems - Raw menu items from API
 * @param {String} searchQuery - Search text to filter by
 * @param {String} selectedCategory - Filter by category (optional)
 * @returns {Array} - Unique menu items with filters applied
 * 
 * @example
 * const uniqueItems = useUniqueMenuItems(menuItems, searchText, category);
 * 
 * {uniqueItems.map(item => (
 *   <option key={item._id} value={item.itemName}>
 *     {item.itemName}
 *   </option>
 * ))}
 */
export const useUniqueMenuItems = (
  menuItems = [],
  searchQuery = "",
  selectedCategory = ""
) => {
  return useMemo(() => {
    if (!menuItems || menuItems.length === 0) return [];

    // 🔹 STEP 1: Extract unique itemNames using Set
    const uniqueItemNames = Array.from(
      new Set(menuItems.map(item => item.itemName))
    );

    // 🔹 STEP 2: Map to representative item (first occurrence of each name)
    // This preserves all prices in the prices[] array
    const uniqueItems = uniqueItemNames
      .map(name => 
        menuItems.find(item => 
          item.itemName === name &&
          (!selectedCategory || item.category === selectedCategory)
        )
      )
      // Filter out items that don't match category
      .filter(item => item !== undefined);

    // 🔹 STEP 3: Apply search filter
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      return uniqueItems.filter(item =>
        item.itemName.toLowerCase().includes(query) ||
        item.category.toLowerCase().includes(query)
      );
    }

    // 🔹 STEP 4: Sort alphabetically
    return uniqueItems.sort((a, b) =>
      a.itemName.localeCompare(b.itemName)
    );
  }, [menuItems, searchQuery, selectedCategory]);
};

/**
 * 🎯 Custom Hook: Get all available units for a selected item
 * 
 * Collects all price variants across all occurrences of an itemName
 * 
 * @param {Array} menuItems - Raw menu items from API
 * @param {String} selectedItemName - The selected item name
 * @returns {Array} - Unique units with prices [{unit, price}, ...]
 * 
 * @example
 * const units = useItemUnits(menuItems, "Afghani Chicken Kebab");
 * // Returns: [{unit: "kg", price: 500}, {unit: "serving", price: 50}, ...]
 * 
 * {units.map(({unit, price}) => (
 *   <option key={unit} value={unit}>
 *     {unit} (${price})
 *   </option>
 * ))}
 */
export const useItemUnits = (menuItems = [], selectedItemName = "") => {
  return useMemo(() => {
    if (!selectedItemName || !menuItems || menuItems.length === 0) return [];

    // 🔹 Find ALL items with this name (all variants)
    const allVariants = menuItems.filter(
      item => item.itemName === selectedItemName
    );

    if (allVariants.length === 0) return [];

    // 🔹 Collect unique units from all variants
    const unitMap = new Map();
    allVariants.forEach(item => {
      (item.prices || []).forEach(priceObj => {
        const key = priceObj.unit;
        // Keep first occurrence (in case of price variations)
        if (!unitMap.has(key)) {
          unitMap.set(key, priceObj.price);
        }
      });
    });

    // 🔹 Convert to array and sort
    return Array.from(unitMap.entries())
      .map(([unit, price]) => ({ unit, price }))
      .sort((a, b) => a.unit.localeCompare(b.unit));
  }, [menuItems, selectedItemName]);
};

/**
 * 🎯 Utility: Get price for specific item and unit
 * 
 * @param {Array} menuItems - Raw menu items
 * @param {String} itemName - Item name to find
 * @param {String} unit - Unit to find
 * @returns {Number} - Price or 0 if not found
 * 
 * @example
 * const price = getPriceForItemUnit(menuItems, "Biryani", "kg");
 */
export const getPriceForItemUnit = (
  menuItems = [],
  itemName = "",
  unit = ""
) => {
  const items = menuItems.filter(item => item.itemName === itemName);
  for (const item of items) {
    const priceObj = item.prices?.find(p => p.unit === unit);
    if (priceObj) return priceObj.price;
  }
  return 0;
};

export default useUniqueMenuItems;
