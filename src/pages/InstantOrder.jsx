import { useState, useEffect } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import API_ENDPOINTS from "../config";
import "./InstantOrder.css";

function InstantOrder() {
  const navigate = useNavigate();
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
  const [status, setStatus] = useState("Placed");

  const [menuItems, setMenuItems] = useState([]);
  const [kotItems, setKotItems] = useState([]);
  const [showAdvanced, setShowAdvanced] = useState(false);

  /* 🔹 Filter items based on search query */
  const filteredMenuItems = menuItems
    .filter(item =>
      item.itemName.toLowerCase().includes(menuSearch.toLowerCase())
    )
    .sort((a, b) => a.itemName.localeCompare(b.itemName));

  /* 🔹 Hide dropdown on outside click */
  useEffect(() => {
    const handleClick = (e) => {
      if (!e.target.closest('.instant-order-container')) setShowDropdown(false);
    };
    document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, []);

  /* 🔹 Fetch Menu */
  useEffect(() => {
    const fetchMenu = async () => {
      try {
        console.log('Fetching menu items from:', API_ENDPOINTS.ITEMS.GET_ALL);
        const res = await axios.get(API_ENDPOINTS.ITEMS.GET_ALL);
        console.log('Menu API response:', res.data);
        
        // Handle both array and wrapped object responses
        let items = [];
        if (Array.isArray(res.data)) {
          items = res.data;
        } else if (res.data && typeof res.data === 'object' && res.data.items) {
          items = res.data.items;
        } else if (res.data && typeof res.data === 'object') {
          items = Object.values(res.data).flat();
        }
        
        console.log('Processed items count:', items.length);
        setMenuItems(items);
      } catch (err) {
        console.error("Error fetching menu:", err.message);
        setMenuItems([]);
      }
    };
    fetchMenu();
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
      setStatus("Placed");

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
            <input value={mobile} onChange={e => setMobile(e.target.value)} type="tel" />
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
            🕐 Delivery Time:
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
                value="Online"
                checked={paymentMode === "Online"}
                onChange={e => setPaymentMode(e.target.value)}
              />
              <span>📱 Online</span>
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
                  <option>Placed</option>
                  <option>Preparing</option>
                  <option>Ready</option>
                  <option>Delivered</option>
                </select>
              </label>
            </div>
          )}
        </div>
      </div>

      {/* ITEM INPUT WITH SEARCH */}
      <div className="order-input">
        <h3>Add Menu Item</h3>
        <div style={{ position: 'relative' }}>
          <input
            type="text"
            placeholder="Search and select menu item..."
            value={menuSearch}
            onChange={e => {
              setMenuSearch(e.target.value);
              setShowDropdown(true);
            }}
            onFocus={() => setShowDropdown(true)}
            style={{ marginRight: 8, minWidth: 160, marginBottom: 8 }}
            autoComplete="off"
          />
          {showDropdown && (
            <div style={{ position: 'absolute', top: 38, left: 0, right: 0, background: '#fff', border: '1px solid #ccc', borderRadius: 4, zIndex: 10, maxHeight: 180, overflowY: 'auto' }}>
              {filteredMenuItems.length === 0 ? (
                <div style={{ padding: 8, color: '#888' }}>No items found</div>
              ) : (
                filteredMenuItems.map((item, i) => (
                  <div
                    key={i}
                    style={{ padding: '8px 12px', cursor: 'pointer', borderBottom: '1px solid #eee' }}
                    onMouseDown={() => {
                      setSelectedItem(item.itemName);
                      setMenuSearch(item.itemName);
                      setShowDropdown(false);
                    }}
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
            style={{ marginRight: 8, width: 90 }}
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
            style={{ marginRight: 8, width: 80, background: '#f5f5f5', color: '#888', cursor: 'not-allowed' }}
          />
        )}
        <input
          type="number"
          min="1"
          placeholder="Qty"
          value={qty}
          onChange={e => setQty(Number(e.target.value))}
          style={{ marginRight: 8, width: 60 }}
        />
        <input
          type="number"
          min="0"
          placeholder="Price"
          value={price}
          readOnly
          style={{ marginRight: 8, width: 80, background: '#f5f5f5', color: '#888', cursor: 'not-allowed' }}
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
                    <td>{item.itemName}</td>
                    <td>
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
                    <td>
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
                    <td>${item.price.toFixed(2)}</td>
                    <td>${(item.price * item.qty).toFixed(2)}</td>
                    <td>
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
        <p>Subtotal: ₹{subtotal.toFixed(2)}</p>
        <p>Sales Tax ({salesTaxRate}%): ₹{salesTaxAmount.toFixed(2)}</p>
        <p>Service Charges ({serviceChargeRate}%): ₹{serviceChargeAmount.toFixed(2)}</p>
        <p style={{ fontWeight: 'bold', borderTop: '1px solid #ddd', paddingTop: '8px', marginTop: '8px' }}>
          Subtotal with Charges: ₹{subtotalWithCharges.toFixed(2)}
        </p>
        <p>Discount ({discount}%): -₹{discountAmount.toFixed(2)}</p>
        <p style={{ fontSize: '1.2em', fontWeight: 'bold', color: '#e74c3c', borderTop: '2px solid #e74c3c', paddingTop: '8px', marginTop: '8px' }}>
          Total: ₹{total.toFixed(2)}
        </p>
        <p>Advance: ₹{advance.toFixed(2)}</p>
        <p>Balance Due: ₹{balance.toFixed(2)}</p>
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
          out += pad('KOT', 32) + '\n';
          out += pad('Customer: ' + customerName, 32) + '\n';
          out += pad('Date: ' + new Date().toLocaleDateString(), 32) + '\n';
          out += pad('Time: ' + new Date().toLocaleTimeString(), 32) + '\n';
          out += '\n';
          out += 'No  Item             Unit  Qty\n';
          out += '------------------------------------\n';
          kotItems.forEach((item, idx) => {
            out += pad((idx + 1).toString(), 2) + '  ' + pad(item.itemName, 16) + pad(abbreviateUnit(item.unit || ''), 6) + pad(item.qty.toString(), 3) + '\n';
          });
          out += '------------------------------------\n';
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
        <button className="button" onClick={submitOrder}>Submit Order</button>
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
          out += pad('KOT', 32) + '\n';
          out += pad('Customer: ' + customerName, 32) + '\n';
          out += pad('Date: ' + new Date().toLocaleDateString(), 32) + '\n';
          out += pad('Time: ' + new Date().toLocaleTimeString(), 32) + '\n';
          out += '\n';
          out += 'No  Item             Unit  Qty\n';
          out += '------------------------------------\n';
          kotItems.forEach((item, idx) => {
            out += pad((idx + 1).toString(), 2) + '  ' + pad(item.itemName, 16) + pad(abbreviateUnit(item.unit || ''), 6) + pad(item.qty.toString(), 3) + '\n';
          });
          out += '------------------------------------\n';
          return out;
        })()}
      </pre>
    </div>
  );
}

export default InstantOrder;
