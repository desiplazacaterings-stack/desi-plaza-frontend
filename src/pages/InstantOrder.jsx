import { useState, useEffect, useRef } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import API_ENDPOINTS from "../config";
import useMenuItems from "../hooks/useMenuItems";
import "./InstantOrder.css";

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

function InstantOrder() {
  const navigate = useNavigate();
  const [userRole, setUserRole] = useState(null);
  const [permissions, setPermissions] = useState({});
  const [selectedItem, setSelectedItem] = useState("");
  const [menuSearch, setMenuSearch] = useState("");
  const [showDropdown, setShowDropdown] = useState(false);
  const [qty, setQty] = useState(1);
  const [unit, setUnit] = useState("");
  const [price, setPrice] = useState(0);
  const [availableUnits, setAvailableUnits] = useState([]);

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
  
  const [deliveryTime, setDeliveryTime] = useState(getCurrentDateTime());

  const [salesTaxRate, setSalesTaxRate] = useState(5);
  const [serviceChargeRate, setServiceChargeRate] = useState(0);
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

  // Generate KOT serial number on mount
  useEffect(() => {
    const lastSerialNumber = localStorage.getItem('lastKOTSerialNumber');
    if (lastSerialNumber) {
      setKotSerialNumber(parseInt(lastSerialNumber) + 1);
    }
  }, []);

  // Sync hook menu items to component state (only once)
  const menuItemsSynced = useRef(false);
  
  useEffect(() => {
    if (!menuItemsSynced.current && hookMenuItems && hookMenuItems.length > 0) {
      menuItemsSynced.current = true;
      const cleanItems = dedupeMenuItems(hookMenuItems);
      console.log(`✓ Menu items synced: ${cleanItems.length} items loaded`);
      setMenuItems(cleanItems);
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

  /* 🔹 Filter items based on search query */
  const filteredMenuItems = menuItems
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
    // Find all menu items with the selected name
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
      } else {
        setUnit("");
        setPrice(0);
      }
    } else {
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
        return updated;
      } else {
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
  const serviceChargeAmount = subtotal * (serviceChargeRate / 100);
  const subtotalWithCharges = subtotal + salesTaxAmount + serviceChargeAmount;
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

    const orderData = {
      customerName,
      mobile,
      email,
      address,
      items: kotItems,
      subtotal,
      salesTax: salesTaxAmount,
      serviceCharge: serviceChargeAmount,
      discount: discountAmount,
      total,
      advance,
      balance,
      deliveryTime: deliveryTime || null,
      paymentMode,
      status,
      orderType: "Instant"
    };

    try {
      await axios.post(API_ENDPOINTS.ORDERS.CREATE, orderData);
      alert("✅ Order submitted");

      // Reset
      setCustomerName("");
      setMobile("");
      setEmail("");
      setAddress("");
      setKotItems([]);
      setDeliveryTime(getCurrentDateTime());
      setAdvance(0);
      setPaymentMode("Cash");
      setStatus("Pickup");

      // Redirect to instant orders table
      navigate("/instantorders");
    } catch (err) {
      console.error(err);
      alert("❌ Failed to submit order");
    }
  };

  return (
    <div className="instant-order-container">
      <h2>🧾 Instant Order (KOT)</h2>

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

          <label>
            Email:
            <input value={email} onChange={e => setEmail(e.target.value)} type="email" />
          </label>
        </div>

        <label>
          Address:
          <textarea value={address} onChange={e => setAddress(e.target.value)} placeholder="Delivery address" />
        </label>

        <div className="form-row">
          <label>
            📅 Order Date:
            <input
              type="datetime-local"
              value={deliveryTime}
              onChange={e => setDeliveryTime(e.target.value)}
            />
          </label>

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
                  Service Charges %:
                  <input
                    type="number"
                    value={serviceChargeRate}
                    onChange={e => setServiceChargeRate(Number(e.target.value))}
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
                filteredMenuItems.map((item, i) => (
                  <div
                    key={i}
                    style={{ padding: '10px 14px', cursor: 'pointer', borderBottom: '1px solid #eee', fontSize: '0.9rem', transition: 'all 0.2s' }}
                    onMouseDown={() => {
                      setSelectedItem(item.itemName);
                      setMenuSearch(item.itemName);
                      setShowDropdown(false);
                    }}
                    onMouseEnter={(e) => e.currentTarget.style.background = '#f5f5f5'}
                    onMouseLeave={(e) => e.currentTarget.style.background = 'transparent'}
                  >
                    {item.itemName}
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

      {/* KOT ITEMS TABLE */}
      {kotItems.length > 0 && (
        <div className="kot-items-table-container">
          <h3>KOT Items</h3>
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
                    <td data-label="Price">${item.price.toFixed(2)}</td>
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
          <p>Service Charges ({serviceChargeRate}%): ${serviceChargeAmount.toFixed(2)}</p>
        </div>
        
        <p style={{ fontWeight: 'bold', borderTop: '1px solid #ddd', paddingTop: '8px', marginTop: '8px' }}>
          Subtotal with Charges: ${subtotalWithCharges.toFixed(2)}
        </p>
        
        <div className="summary-row">
          <p>Discount ({discount}%): -${discountAmount.toFixed(2)}</p>
          <p style={{ fontSize: '1.2em', fontWeight: 'bold', color: '#e74c3c', borderTop: '2px solid #e74c3c', paddingTop: '8px', marginTop: '8px' }}>
            Total: ${total.toFixed(2)}
          </p>
        </div>
        
        <div className="summary-row">
          <p>Advance: ${advance.toFixed(2)}</p>
          <p>Balance Due: ${balance.toFixed(2)}</p>
        </div>
      </div>

      {/* ACTIONS */}

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
        <button className="button" onClick={() => setKotItems([])}>🧹 Reset KOT</button>
        {permissions.canCreateInstantOrder ? (
          <button className="button" onClick={submitOrder}>Submit Order</button>
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
