import { useState, useEffect, useRef } from "react";
import axios from "axios";
import { useNavigate, useLocation } from "react-router-dom";
import API_ENDPOINTS from "../config";
import useMenuItems from "../hooks/useMenuItems";
import "./InstantOrder.css";

/**
 * 🔹 DEDUPLICATE BY ITEMNAME (UI-level only)
 * Shows each itemName only once in dropdown
 * Units still come from prices[] as normal
 */
const dedupeByItemName = (items = []) => {
  const map = new Map();
  items.forEach(item => {
    if (!map.has(item.itemName)) {
      map.set(item.itemName, item);
    }
  });
  return Array.from(map.values());
};

function InstantOrder() {
  const navigate = useNavigate();
  const location = useLocation();
  const orderToEdit = location.state?.orderToEdit;

  const [userRole, setUserRole] = useState(null);
  const [permissions, setPermissions] = useState({});
  const [selectedItem, setSelectedItem] = useState("");
  const [menuSearch, setMenuSearch] = useState("");
  const [showDropdown, setShowDropdown] = useState(false);
  const [qty, setQty] = useState(1);
  const [unit, setUnit] = useState("");
  const [price, setPrice] = useState(0);
  const [availableUnits, setAvailableUnits] = useState([]);
  const [editPricesMode, setEditPricesMode] = useState(false);
  const [isEditing, setIsEditing] = useState(false);

  const [customerName, setCustomerName] = useState("");
  const [mobile, setMobile] = useState("");
  const [email, setEmail] = useState("");
  const [address, setAddress] = useState("");
  
  // Get today's date and current time formatted for datetime-local input
  const getCurrentDateTime = () => {
    const now = new Date();
    const year = now.getFullYear();
    const month = String(now.getMonth() + 1).padStart(2, '0');
    const day = String(now.getDate()).padStart(2, '0');
    const hours = String(now.getHours()).padStart(2, '0');
    const minutes = String(now.getMinutes()).padStart(2, '0');
    return `${year}-${month}-${day}T${hours}:${minutes}`;
  };

  // Helper to format ISO date string to datetime-local input format
  const formatDateTimeForInput = (isoString) => {
    if (!isoString) return getCurrentDateTime();
    const date = new Date(isoString);
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    const hours = String(date.getHours()).padStart(2, '0');
    const minutes = String(date.getMinutes()).padStart(2, '0');
    return `${year}-${month}-${day}T${hours}:${minutes}`;
  };
  
  const [deliveryTime, setDeliveryTime] = useState(getCurrentDateTime());

  const [salesTaxRate, setSalesTaxRate] = useState(5);
  const [serviceChargeAmount, setServiceChargeAmount] = useState(0);
  const [deliveryCharges, setDeliveryCharges] = useState(0);
  const [discount, setDiscount] = useState(0);
  const [advance, setAdvance] = useState(0);
  const [paymentMode, setPaymentMode] = useState("Cash");
  const [status, setStatus] = useState("Pickup");

  const [menuItems, setMenuItems] = useState([]);
  const [kotItems, setKotItems] = useState([]);
  const [showAdvanced, setShowAdvanced] = useState(false);
  const [kotSerialNumber, setKotSerialNumber] = useState(1);
  const [menuItemsLoadError, setMenuItemsLoadError] = useState(null);
  const COMPANY_NAME = "DESI PLAZA CATERINGS";

  // Use the menu items hook to fetch items
  const { menuItems: hookMenuItems, loading: menuLoading, error: menuError, fetchMenuItems: refetchMenuItems, clearCache } = useMenuItems();

  // 🔹 GROUP MENU ITEMS BY NAME (single source of truth)
  const [groupedMenuItems, setGroupedMenuItems] = useState([]);
  useEffect(() => {
    const lastSerialNumber = localStorage.getItem('lastKOTSerialNumber');
    if (lastSerialNumber) {
      setKotSerialNumber(parseInt(lastSerialNumber) + 1);
    }
  }, []);

  // Effect to populate form when editing
  useEffect(() => {
    if (orderToEdit) {
      setIsEditing(true);
      setCustomerName(orderToEdit.customerName || "");
      setMobile(orderToEdit.mobile || "");
      setEmail(orderToEdit.email || "");
      setAddress(orderToEdit.address || "");
      
      // Handle date
      if (orderToEdit.deliveryTime || orderToEdit.createdAt) {
        setDeliveryTime(formatDateTimeForInput(orderToEdit.deliveryTime || orderToEdit.createdAt));
      }

      // Handle items
      if (orderToEdit.items && Array.isArray(orderToEdit.items)) {
        setKotItems(orderToEdit.items);
      }

      // Handle financials
      setSalesTaxRate(orderToEdit.salesTaxRate || 5);
      setServiceChargeAmount(orderToEdit.serviceCharge || 0);
      setDeliveryCharges(orderToEdit.deliveryCharges || 0);
      setDiscount(orderToEdit.discountRate || 0);
      setAdvance(orderToEdit.advance || 0);
      
      // Handle status & payment
      setPaymentMode(orderToEdit.paymentMode || "Cash");
      setStatus(orderToEdit.status || "Pickup");
      
      // Show advanced if any advanced fields are used
      if ((orderToEdit.serviceCharge > 0) || (orderToEdit.deliveryCharges > 0) || (orderToEdit.discount > 0)) {
        setShowAdvanced(true);
      }
    }
  }, [orderToEdit]);

  // Sync hook menu items to component state (only once)
  const menuItemsSynced = useRef(false);
  
  useEffect(() => {
    if (!menuItemsSynced.current && hookMenuItems && hookMenuItems.length > 0) {
      menuItemsSynced.current = true;
      console.log(`✓ Menu items loaded: ${hookMenuItems.length} items`);
      setMenuItems(hookMenuItems);
      setMenuItemsLoadError(null);
    } else if (menuError) {
      console.error('❌ Failed to load menu items:', menuError);
      setMenuItemsLoadError(menuError);
    } else if (!menuLoading && hookMenuItems && hookMenuItems.length === 0) {
      console.warn('⚠️ No menu items returned from server');
      setMenuItemsLoadError('No menu items available in the system');
    }
  }, [hookMenuItems, menuLoading, menuError]);

  // Fetch user permissions on mount
  useEffect(() => {
    const userData = localStorage.getItem('user');
    const token = localStorage.getItem('token');
    
    if (userData) {
      try {
        const user = JSON.parse(userData);
        setUserRole(user.role);
        
        // Admins have all permissions
        if (user.role === 'admin') {
          setPermissions({ canCreateInstantOrder: true });
        } else if (user.role === 'staff' && user._id && token) {
          // Fetch staff permissions from backend
          axios.get(API_ENDPOINTS.ADMIN.GET_PERMISSIONS(user._id), {
            headers: { Authorization: `Bearer ${token}` }
          })
            .then(res => {
              setPermissions(res.data.data.customPermissions || {});
            })
            .catch(err => {
              console.error("Error fetching permissions:", err);
              setPermissions({});
            });
        }
      } catch (error) {
        console.error('Error parsing user data:', error);
        setUserRole(null);
      }
    }
  }, []);

  /* 🔹 Filter items based on search query - deduplicate by itemName */
  const uniqueItemNames = Array.from(new Set(menuItems.map(item => item.itemName)));
  const filteredMenuItems = uniqueItemNames
    .map(name => menuItems.find(item => item.itemName === name))
    .filter(item =>
      item.itemName.toLowerCase().includes(menuSearch.toLowerCase())
    )
    .sort((a, b) => a.itemName.localeCompare(b.itemName));

  /* 🔹 Check authentication on mount */
  useEffect(() => {
    const userData = localStorage.getItem('user');
    if (!userData) {
      navigate('/login');
      return;
    }
    try {
      const user = JSON.parse(userData);
      setUserRole(user.role);
    } catch (error) {
      console.error('Error parsing user data:', error);
      navigate('/login');
    }
  }, [navigate]);

  /* 🔹 Hide dropdown on outside click */
  useEffect(() => {
    const handleClick = (e) => {
      if (!e.target.closest('.instant-order-container')) setShowDropdown(false);
    };
    document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, []);

  /* 🔹 Handle unit and price update when item is selected */
  useEffect(() => {
    if (!selectedItem) {
      setUnit("");
      setPrice(0);
      setAvailableUnits([]);
      return;
    }
    // Find all menu items with the selected name (they all have the same itemName)
    const items = menuItems.filter(i => i.itemName === selectedItem);
    if (items.length > 0) {
      // Collect all unique units from all price objects
      const units = [];
      items.forEach(item => {
        (item.prices || []).forEach(priceObj => {
          if (!units.find(u => u.unit === priceObj.unit)) {
            units.push({ unit: priceObj.unit, price: priceObj.price });
          }
        });
      });
      setAvailableUnits(units);
      // Default to first unit
      if (units.length > 0) {
        setUnit(units[0].unit);
        setPrice(units[0].price);
        console.log(`✓ Item selected: ${selectedItem}, Unit: ${units[0].unit}, Price: $${units[0].price}`);
      } else {
        console.warn(`⚠️ No prices found for item: ${selectedItem}`);
        setUnit("");
        setPrice(0);
      }
    } else {
      console.warn(`⚠️ Item not found in menu: ${selectedItem}`);
      setAvailableUnits([]);
      setUnit("");
      setPrice(0);
    }
  }, [selectedItem, menuItems]);

  /* 🔹 Add item to KOT */
  const addToKOT = () => {
    if (!selectedItem) {
      alert('Please select a menu item before adding.');
      return;
    }
    
    // Warn if price is 0
    if (price === 0 || price === '0') {
      alert('⚠️ Price is $0.00! Please set a price first or check menu item prices.');
      return;
    }
    
    setKotItems(prev => {
      const itemObj = menuItems.find(i => i.itemName === selectedItem);
      const category = itemObj ? itemObj.category : "";
      const idx = prev.findIndex(item => item.itemName === selectedItem && item.unit === unit && item.price === price);
      if (idx !== -1) {
        // Update qty and price for existing item
        const updated = [...prev];
        updated[idx] = {
          ...updated[idx],
          qty: updated[idx].qty + qty,
          price: price, // keep unit price, show total below
          category
        };
        console.log(`✓ Updated item: ${selectedItem}, new qty: ${updated[idx].qty}, price: $${price}`);
        return updated;
      } else {
        console.log(`✓ Added item: ${selectedItem}, qty: ${qty}, unit: ${unit}, price: $${price}`);
        return [...prev, { itemName: selectedItem, qty, unit, price, category }];
      }
    });
    setSelectedItem("");
    setQty(1);
    setUnit("");
    setPrice(0);
    setMenuSearch("");
  };

  /* 🔹 Update item unit in KOT */
  const updateItemUnit = (index, newUnit) => {
    const item = kotItems[index];
    const menuItem = menuItems.find(i => i.itemName === item.itemName);
    const priceObj = menuItem?.prices?.find(p => p.unit === newUnit);

    if (priceObj) {
      setKotItems(prev => {
        const updated = [...prev];
        updated[index] = {
          ...updated[index],
          unit: newUnit,
          price: priceObj.price
        };
        return updated;
      });
    }
  };

  /* 🔹 Calculations */
  const subtotal = kotItems.reduce(
    (sum, item) => sum + item.price * item.qty,
    0
  );
  const salesTaxAmount = subtotal * (salesTaxRate / 100);
  const subtotalWithCharges = subtotal + salesTaxAmount + serviceChargeAmount + deliveryCharges;
  const discountAmount = subtotalWithCharges * (discount / 100);
  const total = subtotalWithCharges - discountAmount;
  const balance = total - advance;

  /* 🔹 Submit Order */
  const submitOrder = async (e) => {
    e.preventDefault();

    if (!customerName || !mobile || kotItems.length === 0) {
      alert("Fill customer details and add items");
      return;
    }

    console.log('📊 CALCULATION CHECK:');
    console.log('  Items in KOT:', kotItems);
    console.log('  Subtotal:', subtotal);
    console.log('  Sales Tax:', salesTaxAmount);
    console.log('  Service Charge:', serviceChargeAmount);
    console.log('  Delivery Charges:', deliveryCharges);
    console.log('  Discount:', discountAmount);
    console.log('  Calculated Total:', total);

    // Warn if total is 0
    if (total === 0) {
      const confirmZeroTotal = window.confirm(
        `⚠️ The total amount is $0.00. This usually means items don't have prices set.\n\nDo you want to continue?\n\nYes = Submit anyway\nNo = Cancel and fix prices`
      );
      if (!confirmZeroTotal) return;
    }

    const orderData = {
      customerName,
      mobile,
      email,
      address,
      items: kotItems.map(item => ({
        itemName: item.itemName,
        qty: item.qty,
        unit: item.unit,
        price: item.price || 0,  // Ensure price is included
        category: item.category
      })),
      subtotal,
      salesTax: salesTaxAmount,
      serviceCharge: serviceChargeAmount,
      discount: discountAmount,
      totalAmount: total,  // This should be non-zero if items have prices
      advance,
      balanceDue: balance,
      paymentMode,
      status,
      orderType: "Instant",
      deliveryTime,
      deliveryCharges
    };

    console.log('📤 Submitting order data:', orderData);
    console.log('Items being sent:', orderData.items);
    console.log('🔍 Item Details:');
    orderData.items.forEach((item, idx) => {
      const itemTotal = item.price * item.qty;
      console.log(`  Item ${idx + 1}: ${item.itemName} | Qty: ${item.qty} | Unit: ${item.unit} | Price: $${item.price} | Total: $${itemTotal}`);
    });
    console.log('Total calculation:', { subtotal, salesTaxAmount, serviceChargeAmount, deliveryCharges, discountAmount, total });

    try {
      if (isEditing && orderToEdit._id) {
        // Update existing order
        await axios.patch(`${API_ENDPOINTS.ORDERS.GET_ALL}/${orderToEdit._id}`, orderData);
        console.log('✅ Order updated successfully');
        alert("✅ Order updated successfully");
      } else {
        // Create new order
        const response = await axios.post(API_ENDPOINTS.ORDERS.CREATE, orderData);
        console.log('✅ Order created successfully:', response.data);
        console.log('New order ID:', response.data._id);
        alert("✅ Order submitted successfully!");
      }

      // Reset form immediately
      setCustomerName("");
      setMobile("");
      setEmail("");
      setAddress("");
      setKotItems([]);
      setDeliveryTime(getCurrentDateTime());
      setAdvance(0);
      setPaymentMode("Cash");
      setStatus("Pickup");
      setSalesTaxRate(5);
      setServiceChargeAmount(0);
      setDeliveryCharges(0);
      setDiscount(0);
      setIsEditing(false);
      setSelectedItem("");
      setMenuSearch("");

      // Give a moment for state to update, then navigate to instant orders list
      // This allows the list page to fetch fresh data from the backend
      setTimeout(() => {
        console.log('🔄 Navigating to instant orders list...');
        navigate("/instantorders");
      }, 500);
    } catch (err) {
      console.error("Full error:", err);
      console.error("Error response:", err.response?.data);
      const errorMsg = err.response?.data?.message || err.message || "Failed to submit order";
      alert(`❌ Error: ${errorMsg}`);
    }
  };

  return (
    <div className="instant-order-container">
      <h2>{isEditing ? "✏️ Edit Instant Order" : "🧾 Instant Order (KOT)"}</h2>

      {/* CUSTOMER DETAILS */}
      <div className="customer-details">
        <h3>📋 Customer Details</h3>

        <div className="form-row">
          <label>
            Name:
            <input value={customerName} onChange={e => setCustomerName(e.target.value)} />
          </label>

          <label>
            Mobile:
            <input value={mobile} onChange={e => {
              const value = e.target.value.replace(/\D/g, '').slice(0, 10);
              setMobile(value);
            }} type="tel" maxLength="10" />
          </label>
        </div>

        <div className="form-row">
          <label>
            Email:
            <input value={email} onChange={e => setEmail(e.target.value)} type="email" />
          </label>

          <label>
            📅 Order Date:
            <input
              type="datetime-local"
              value={deliveryTime}
              onChange={e => setDeliveryTime(e.target.value)}
            />
          </label>
        </div>

        <label>
          Address:
          <textarea value={address} onChange={e => setAddress(e.target.value)} placeholder="Delivery address" />
        </label>
      </div>

      {/* ITEM INPUT WITH SEARCH */}
      <div className="order-input">
        <h3 style={{ marginRight: 16, minWidth: 110, marginBottom: 0 }}>Add Menu Item</h3>
        <div style={{ position: 'relative', flex: 1, minWidth: 240 }}>
          <input
            type="text"
            placeholder="Search and select menu item..."
            value={menuSearch}
            onChange={e => {
              setMenuSearch(e.target.value);
              setShowDropdown(true);
            }}
            onFocus={() => setShowDropdown(true)}
            style={{ marginRight: 0, minWidth: 160, marginBottom: 0, width: '100%' }}
            autoComplete="off"
          />
          {showDropdown && (
            <div style={{ position: 'absolute', top: '100%', left: 0, right: 0, background: '#fff', border: '1.5px solid #ddd', borderRadius: 8, zIndex: 10, maxHeight: 220, overflowY: 'auto', marginTop: 4, boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }}>
              {menuLoading ? (
                <div style={{ padding: 12, color: '#888', fontSize: '0.9rem', textAlign: 'center' }}>⏳ Loading menu items...</div>
              ) : menuError ? (
                <div style={{ padding: 12, textAlign: 'center' }}>
                  <div style={{ color: '#d32f2f', fontSize: '0.9rem', marginBottom: 8 }}>❌ Failed to load menu items</div>
                  <button 
                    onClick={() => {
                      clearCache();
                      refetchMenuItems(true);
                    }}
                    style={{ padding: '6px 12px', background: '#f5ba4a', border: 'none', borderRadius: 4, cursor: 'pointer', fontSize: '0.85rem', fontWeight: 600 }}
                  >
                    🔄 Retry
                  </button>
                </div>
              ) : filteredMenuItems.length === 0 ? (
                <div style={{ padding: 12, color: '#888', fontSize: '0.9rem', textAlign: 'center' }}>
                  {menuItems.length === 0 ? 'No menu items available' : 'No items found'}
                </div>
              ) : (
                filteredMenuItems.map((item) => (
                  <div
                    key={item.itemName}
                    style={{ padding: '10px 14px', cursor: 'pointer', borderBottom: '1px solid #eee', fontSize: '0.9rem', transition: 'all 0.2s' }}
                    onMouseDown={() => {
                      setSelectedItem(item.itemName);
                      setMenuSearch(item.itemName);
                      setShowDropdown(false);
                    }}
                    onMouseEnter={(e) => e.currentTarget.style.background = '#f5f5f5'}
                    onMouseLeave={(e) => e.currentTarget.style.background = 'transparent'}
                  >
                    <div style={{ fontWeight: '500' }}>{item.itemName}</div>
                    <div style={{ fontSize: '0.85rem', color: '#666' }}>
                      {item.prices && item.prices.length > 0 ? (
                        item.prices.map((p, i) => (
                          <span key={i}>
                            ${p.price} ({p.unit}){i < item.prices.length - 1 ? ', ' : ''}
                          </span>
                        ))
                      ) : (
                        <span style={{ color: '#d32f2f' }}>❌ No prices</span>
                      )}
                    </div>
                  </div>
                ))
              )}
            </div>
          )}
        </div>
        {availableUnits.length > 1 ? (
          <select
            value={unit}
            onChange={e => {
              setUnit(e.target.value);
              // Update price for selected unit
              const found = availableUnits.find(u => u.unit === e.target.value);
              setPrice(found ? found.price : 0);
            }}
            style={{ marginRight: 0, width: 130, marginBottom: 0, flex: '0 0 auto' }}
          >
            {availableUnits.map((u, idx) => (
              <option key={idx} value={u.unit}>{u.unit}</option>
            ))}
          </select>
        ) : (
          <input
            type="text"
            placeholder="Unit"
            value={unit}
            readOnly
            style={{ marginRight: 0, width: 130, background: '#f5f5f5', color: '#888', cursor: 'not-allowed', marginBottom: 0, flex: '0 0 auto' }}
          />
        )}
        <input
          type="number"
          min="1"
          placeholder="Qty"
          value={qty}
          onChange={e => setQty(Number(e.target.value))}
          style={{ marginRight: 0, width: 70, marginBottom: 0, flex: '0 0 auto' }}
          className="qty-input"
        />
        <input
          type="number"
          min="0"
          placeholder="Price"
          value={price}
          readOnly
          style={{ marginRight: 0, width: 90, background: '#f5f5f5', color: '#888', cursor: 'not-allowed', marginBottom: 0, flex: '0 0 auto' }}
        />
        <button className="button" onClick={addToKOT}>Add</button>
      </div>

      {/* ADVANCED OPTIONS - COLLAPSIBLE */}
      <div className="advanced-section">
        <button 
          type="button"
          className="toggle-advanced"
          onClick={() => setShowAdvanced(!showAdvanced)}
        >
          {showAdvanced ? '▼' : '▶'} Advanced Options
        </button>

        {showAdvanced && (
          <div className="advanced-fields">
            <div className="form-row">
              <label>
                Sales Tax %:
                <input
                  type="number"
                  value={salesTaxRate}
                  onChange={e => setSalesTaxRate(Number(e.target.value))}
                  min="0"
                  step="0.1"
                />
              </label>

              <label>
                Service Charges (Amount):
                <input
                  type="number"
                  value={serviceChargeAmount}
                  onChange={e => setServiceChargeAmount(Number(e.target.value))}
                  min="0"
                  step="0.1"
                />
              </label>
            </div>

            <div className="form-row">
              <label>
                Delivery Charges:
                <input
                  type="number"
                  value={deliveryCharges}
                  onChange={e => setDeliveryCharges(Number(e.target.value))}
                  min="0"
                  step="0.1"
                />
              </label>

              <label>
                Discount %:
                <input
                  type="number"
                  value={discount}
                  onChange={e => setDiscount(Number(e.target.value))}
                  min="0"
                  step="0.1"
                />
              </label>
            </div>

            <label>
              Status:
              <select value={status} onChange={e => setStatus(e.target.value)}>
                <option>Pickup</option>
                <option>Delivery</option>
              </select>
            </label>
          </div>
        )}
      </div>

      {/* KOT ITEMS TABLE */}
      {kotItems.length > 0 && (
        <div className="kot-items-table-container">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
            <h3 style={{ margin: 0 }}>KOT Items</h3>
            <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer', fontWeight: 500 }}>
              <input
                type="checkbox"
                checked={editPricesMode}
                onChange={e => setEditPricesMode(e.target.checked)}
                style={{ width: '18px', height: '18px', cursor: 'pointer' }}
              />
              ✏️ Edit Prices
            </label>
          </div>
          <table className="kot-items-table">
            <thead>
              <tr>
                <th>Item</th>
                <th>Unit</th>
                <th>Qty</th>
                <th>Price</th>
                <th>Total</th>
                <th>Action</th>
              </tr>
            </thead>
            <tbody>
              {kotItems.map((item, index) => {
                const menuItem = menuItems.find(i => i.itemName === item.itemName);
                const availableUnits = menuItem?.prices?.map(p => p.unit) || [];
                return (
                  <tr key={index}>
                    <td data-label="Item">{item.itemName}</td>
                    <td data-label="Unit">
                      {availableUnits.length > 1 ? (
                        <select
                          value={item.unit}
                          onChange={e => updateItemUnit(index, e.target.value)}
                          className="unit-dropdown"
                        >
                          {availableUnits.map((unit, i) => (
                            <option key={i} value={unit}>{unit}</option>
                          ))}
                        </select>
                      ) : (
                        <span>{item.unit}</span>
                      )}
                    </td>
                    <td data-label="Qty">
                      <input
                        type="number"
                        min="1"
                        value={item.qty}
                        onChange={e => {
                          const updated = [...kotItems];
                          updated[index].qty = Number(e.target.value);
                          setKotItems(updated);
                        }}
                        className="qty-input"
                      />
                    </td>
                    <td data-label="Price">
                      {editPricesMode ? (
                        <input
                          type="number"
                          min="0"
                          step="0.01"
                          value={item.price}
                          onChange={e => {
                            const updated = [...kotItems];
                            updated[index].price = Number(e.target.value);
                            setKotItems(updated);
                          }}
                          className="price-input"
                        />
                      ) : (
                        `$${item.price.toFixed(2)}`
                      )}
                    </td>
                    <td data-label="Total">${(item.price * item.qty).toFixed(2)}</td>
                    <td data-label="Action">
                      <button
                        className="remove-btn"
                        onClick={() => {
                          setKotItems(kotItems.filter((_, i) => i !== index));
                        }}
                      >
                        🗑️ Remove
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}

      {/* SUMMARY */}
      <div className="order-summary">
        <div className="summary-row">
          <p>Subtotal: ${subtotal.toFixed(2)}</p>
          <p>Sales Tax ({salesTaxRate}%): ${salesTaxAmount.toFixed(2)}</p>
          <p>Service Charges: ${serviceChargeAmount.toFixed(2)}</p>
          <p>Delivery Charges: ${deliveryCharges.toFixed(2)}</p>
        </div>
        
        <div className="summary-row">
          <p style={{ fontWeight: 'bold', borderTop: '1px solid #ddd', paddingTop: '8px' }}>
            Subtotal with Charges: ${subtotalWithCharges.toFixed(2)}
          </p>
          <p>Discount ({discount}%): -${discountAmount.toFixed(2)}</p>
          <p style={{ fontSize: '1.1em', fontWeight: 'bold', color: '#e74c3c', borderTop: '2px solid #e74c3c', paddingTop: '8px' }}>
            Total: ${total.toFixed(2)}
          </p>
        </div>
        
        <div className="summary-row">
          <p>Advance: ${advance.toFixed(2)}</p>
          <p>Balance Due: ${balance.toFixed(2)}</p>
        </div>
      </div>

      {/* ACTIONS */}

      <div className="form-row">
        <label>
          💰 Advance:
          <input
            type="number"
            value={advance}
            onChange={e => setAdvance(Number(e.target.value))}
            min="0"
          />
        </label>
      </div>

      <div className="payment-mode-group">
        <label className="payment-mode-label">💳 Payment Mode:</label>
        <div className="radio-group">
          <label className="radio-label">
            <input
              type="radio"
              name="paymentMode"
              value="Cash"
              checked={paymentMode === "Cash"}
              onChange={e => setPaymentMode(e.target.value)}
            />
            <span>💵 Cash</span>
          </label>
          <label className="radio-label">
            <input
              type="radio"
              name="paymentMode"
              value="Card"
              checked={paymentMode === "Card"}
              onChange={e => setPaymentMode(e.target.value)}
            />
            <span>💳 Card</span>
          </label>
          <label className="radio-label">
            <input
              type="radio"
              name="paymentMode"
              value="Cheque"
              checked={paymentMode === "Cheque"}
              onChange={e => setPaymentMode(e.target.value)}
            />
            <span>🏦 Cheque</span>
          </label>
        </div>
      </div>

      {/* ACTIONS */}
      <div className="instant-order-actions">
        <button className="button" onClick={() => {
          // Helper for fixed width
          const pad = (str, len) => (str.length > len ? str.slice(0, len) : str.padEnd(len, ' '));
          const abbreviateUnit = (unit) => {
            const abbrev = {
              'Full Tray': 'FT',
              'Half Tray': 'HT',
              'Plate': 'Pl',
              'Piece': 'Pc',
              'kg': 'kg',
              'liter': 'L'
            };
            return abbrev[unit] || unit;
          };
          let out = '';
          out += '====================================\n';
          out += pad(COMPANY_NAME, 32) + '\n';
          out += '====================================\n';
          out += 'KOT #' + kotSerialNumber.toString().padStart(5, '0') + '  Date: ' + new Date().toLocaleDateString() + '\n';
          out += 'Time: ' + new Date().toLocaleTimeString() + ' Customer: ' + customerName + '\n';
          out += '\n';
          out += 'No  Item             Unit  Qty\n';
          out += '------------------------------------\n';
          kotItems.forEach((item, idx) => {
            out += pad((idx + 1).toString(), 2) + '  ' + pad(item.itemName, 16) + pad(abbreviateUnit(item.unit || ''), 6) + pad(item.qty.toString(), 3) + '\n';
          });
          out += '------------------------------------\n';
          out += '====================================\n';
          
          // Save serial number for next KOT
          localStorage.setItem('lastKOTSerialNumber', kotSerialNumber.toString());
          
          const printWindow = window.open('', '', 'width=600,height=600');
          printWindow.document.write('<html><head><title>KOT Print</title>');
          printWindow.document.write('<style>body{font-family:monospace;} .kot-print{white-space:pre;}</style>');
          printWindow.document.write('</head><body >');
          printWindow.document.write('<pre class="kot-print">' + out + '</pre>');
          printWindow.document.write('</body></html>');
          printWindow.document.close();
          printWindow.focus();
          printWindow.print();
          printWindow.close();
        }}>🖨️ Print KOT</button>
        <button className="button" onClick={() => {
          setKotItems([]);
          if (isEditing) {
            navigate('/instantorders');
          }
        }}>
          {isEditing ? "❌ Cancel Edit" : "🧹 Reset KOT"}
        </button>
        {permissions.canCreateInstantOrder ? (
          <button className="button" onClick={submitOrder}>{isEditing ? "💾 Update Order" : "Submit Order"}</button>
        ) : (
          <button 
            className="button" 
            style={{ opacity: 0.5, cursor: 'not-allowed', background: '#ccc' }} 
            disabled 
            title="You don't have permission to create instant orders"
          >
            Submit Order
          </button>
        )}
      </div>

      {/* KOT PRINT */}
      <pre className="kot-print">
        {(() => {
          // Helper for fixed width
          const pad = (str, len) => (str.length > len ? str.slice(0, len) : str.padEnd(len, ' '));
          const abbreviateUnit = (unit) => {
            const abbrev = {
              'Full Tray': 'FT',
              'Half Tray': 'HT',
              'Plate': 'Pl',
              'Piece': 'Pc',
              'kg': 'kg',
              'liter': 'L'
            };
            return abbrev[unit] || unit;
          };
          let out = '';
          out += '====================================\n';
          out += pad(COMPANY_NAME, 32) + '\n';
          out += '====================================\n';
          out += 'KOT #' + kotSerialNumber.toString().padStart(5, '0') + '  Date: ' + new Date().toLocaleDateString() + '\n';
          out += 'Time: ' + new Date().toLocaleTimeString() + ' Customer: ' + customerName + '\n';
          out += '\n';
          out += 'No  Item             Unit  Qty\n';
          out += '------------------------------------\n';
          kotItems.forEach((item, idx) => {
            out += pad((idx + 1).toString(), 2) + '  ' + pad(item.itemName, 16) + pad(abbreviateUnit(item.unit || ''), 6) + pad(item.qty.toString(), 3) + '\n';
          });
          out += '------------------------------------\n';
          out += '====================================\n';
          return out;
        })()}
      </pre>
    </div>
  );
}

export default InstantOrder;
