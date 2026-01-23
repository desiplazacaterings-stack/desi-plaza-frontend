import { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import API_ENDPOINTS from "../config";
import menuData from "../data/menu.json";
import "./CreateEvent.css";

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

function getCurrentYear() {
  return new Date().getFullYear();
}

function generateUniqueQuotationId() {
  const year = getCurrentYear();
  const timestamp = Date.now();
  const random = Math.floor(Math.random() * 10000);
  const unique = `${timestamp}${random}`.slice(-6);
  return `DPC-${year}-${unique}`;
}

function CreateEvent() {
  const navigate = useNavigate();
  const [permissions, setPermissions] = useState({});
  const [userRole, setUserRole] = useState(null);
  const [showDropdown, setShowDropdown] = useState(false);

  // Enquiry Form State
  const [enquiryForm, setEnquiryForm] = useState({
    customerName: "",
    mobile: "",
    email: "",
    eventType: "",
    eventDate: "",
    eventTime: "",
    location: "",
    guests: "",
    notes: ""
  });

  // Quotation Form State
  const [menuItems, setMenuItems] = useState([]);
  const [menuLoading, setMenuLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState("");
  const [selectedItem, setSelectedItem] = useState("");
  const [menuSearch, setMenuSearch] = useState("");
  const [qty, setQty] = useState(1);
  const [unit, setUnit] = useState("");
  const [price, setPrice] = useState(0);
  const [availableUnits, setAvailableUnits] = useState([]);
  const [addedItems, setAddedItems] = useState([]);
  const [quotationId, setQuotationId] = useState(() => {
    return generateUniqueQuotationId();
  });

  // Fetch menu items on mount (only once)
  const menuFetched = useRef(false);
  
  useEffect(() => {
    if (menuFetched.current) return;
    menuFetched.current = true;

    const fetchMenu = async () => {
      try {
        setMenuLoading(true);
        console.log('🔄 Fetching menu from:', API_ENDPOINTS.ITEMS.GET_ALL);
        const response = await axios.get(API_ENDPOINTS.ITEMS.GET_ALL);
        
        let items = [];
        if (response.data && Array.isArray(response.data)) {
          items = response.data;
        } else if (response.data && typeof response.data === 'object' && response.data.items) {
          items = response.data.items;
        } else {
          console.warn('⚠️ Unexpected response format, using local data');
          items = menuData || [];
        }
        
        // ✅ Deduplicate items
        const cleanItems = dedupeMenuItems(items);
        console.log(`✓ Menu items loaded: ${cleanItems.length} items`);
        setMenuItems(cleanItems);
      } catch (error) {
        console.error('❌ Error fetching menu:', error.message, 'Using local data instead');
        const fallbackItems = menuData || [];
        setMenuItems(fallbackItems);
      } finally {
        setMenuLoading(false);
      }
    };
    
    fetchMenu();
  }, []);

  // Fetch user permissions on mount
  useEffect(() => {
    const userData = localStorage.getItem('user');
    const token = localStorage.getItem('token');
    
    if (userData) {
      try {
        const user = JSON.parse(userData);
        setUserRole(user.role);
        
        if (user.role === 'admin') {
          setPermissions({
            canCreateEnquiry: true,
            canCreateQuotation: true,
            canCreateEvent: true
          });
        } else if (user.role === 'staff' && user._id && token) {
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

  // Hide dropdown on outside click
  useEffect(() => {
    const handleClick = (e) => {
      if (!e.target.closest('.create-event-container')) setShowDropdown(false);
    };
    document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, []);

  // Handle available units change
  useEffect(() => {
    if (!selectedItem) {
      setUnit("");
      setPrice(0);
      setAvailableUnits([]);
      return;
    }
    const items = menuItems.filter(i => i.itemName === selectedItem);
    if (items.length > 0) {
      const units = [];
      items.forEach(item => {
        (item.prices || []).forEach(priceObj => {
          if (!units.find(u => u.unit === priceObj.unit)) {
            units.push({ unit: priceObj.unit, price: priceObj.price });
          }
        });
      });
      setAvailableUnits(units);
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

  // Enquiry Form Handlers
  function handleEnquiryChange(e) {
    setEnquiryForm({
      ...enquiryForm,
      [e.target.name]: e.target.value
    });
  }

  // Menu Item Handlers
  const addMenuItem = () => {
    if (!selectedItem) {
      alert('Please select a menu item before adding.');
      return;
    }
    setAddedItems(prev => {
      const itemObj = menuItems.find(i => i.itemName === selectedItem);
      const category = itemObj ? itemObj.category : "";
      const idx = prev.findIndex(item => item.itemName === selectedItem && item.unit === unit && item.price === price);
      if (idx !== -1) {
        const updated = [...prev];
        updated[idx] = {
          ...updated[idx],
          qty: updated[idx].qty + qty,
          price: price,
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

  const removeMenuItem = (idxToRemove) => {
    setAddedItems(prev => prev.filter((_, idx) => idx !== idxToRemove));
  };

  // Get unique categories
  const categories = Array.from(new Set(menuItems.map(item => item.category))).sort();

  // Filter menu items
  const filteredMenuItems = menuItems
    .filter(item =>
      (!selectedCategory || item.category === selectedCategory) &&
      item.itemName.toLowerCase().includes(menuSearch.toLowerCase())
    )
    .sort((a, b) => a.itemName.localeCompare(b.itemName));

  // Validate form data
  function validateForms() {
    if (!enquiryForm.customerName || !enquiryForm.mobile) {
      alert('Please enter customer name and mobile.');
      return false;
    }
    if (!enquiryForm.eventDate || !enquiryForm.eventType) {
      alert('Please enter event date and event type.');
      return false;
    }
    if (addedItems.length === 0) {
      alert('Please add at least one menu item.');
      return false;
    }
    return true;
  }

  // Create Event - combines enquiry and quotation and creates an order
  async function createEvent(e) {
    e.preventDefault();

    if (!validateForms()) {
      return;
    }

    try {
      // Get auth token from localStorage
      const token = localStorage.getItem('token');
      const axiosConfig = token ? { headers: { Authorization: `Bearer ${token}` } } : {};

      const total = addedItems.reduce((sum, item) => sum + item.price * item.qty, 0);

      // Step 1: Create Enquiry
      const enquiryData = {
        customerName: enquiryForm.customerName,
        mobile: enquiryForm.mobile,
        email: enquiryForm.email,
        eventType: enquiryForm.eventType,
        eventDate: enquiryForm.eventDate,
        eventTime: enquiryForm.eventTime,
        location: enquiryForm.location,
        guests: enquiryForm.guests,
        notes: enquiryForm.notes
      };

      console.log('Creating enquiry:', enquiryData);
      const enquiryRes = await axios.post(API_ENDPOINTS.ENQUIRIES.CREATE, enquiryData, axiosConfig);
      const enquiryId = enquiryRes.data._id;
      console.log('Enquiry created:', enquiryId);

      // Step 2: Create Quotation
      const quotationData = {
        quotationId,
        enquiry: enquiryData,
        items: addedItems.map(item => ({
          itemName: item.itemName,
          unit: item.unit,
          qty: item.qty,
          price: item.price
        })),
        total: total
      };

      console.log('Creating quotation:', quotationData);
      const quotationRes = await axios.post(API_ENDPOINTS.QUOTATIONS.CREATE, quotationData, axiosConfig);
      const quotationId_ref = quotationRes.data._id;
      console.log('Quotation created:', quotationId_ref);

      // Step 3: Create Order (Event)
      const orderData = {
        customerName: enquiryForm.customerName,
        mobile: enquiryForm.mobile,
        email: enquiryForm.email,
        address: enquiryForm.location,
        eventType: enquiryForm.eventType,
        eventDate: new Date(enquiryForm.eventDate),
        eventTime: enquiryForm.eventTime,
        eventPlace: enquiryForm.location,
        guests: enquiryForm.guests ? parseInt(enquiryForm.guests) : 0,
        notes: enquiryForm.notes,
        items: addedItems.map(item => ({
          itemName: item.itemName,
          unit: item.unit,
          qty: parseInt(item.qty),
          price: parseFloat(item.price),
          category: item.category
        })),
        subtotal: parseFloat(total),
        total: parseFloat(total),
        totalAmount: parseFloat(total),
        status: 'Confirmed',
        orderType: 'Event',
        quotationId: quotationId_ref
      };

      console.log('Creating order:', orderData);
      const orderRes = await axios.post(API_ENDPOINTS.ORDERS.CREATE, orderData, axiosConfig);
      console.log('Event created:', orderRes.data);

      alert('✅ Event created successfully!');
      
      // Reset form
      setEnquiryForm({
        customerName: "",
        mobile: "",
        email: "",
        eventType: "",
        eventDate: "",
        eventTime: "",
        location: "",
        guests: "",
        notes: ""
      });
      setAddedItems([]);
      setSelectedItem("");
      setMenuSearch("");

      // Navigate to events page
      navigate("/event");
    } catch (error) {
      console.error('Error creating event:', error);
      let msg = "Failed to create event.";
      if (error.response) {
        console.error('Error response:', error.response.data);
        if (error.response.data && error.response.data.message) {
          msg += `\n${error.response.data.message}`;
        }
      } else if (error.message) {
        console.error('Error message:', error.message);
        msg += `\n${error.message}`;
      }
      alert(msg);
    }
  }

  return (
    <div className="create-event-container">
      <div className="create-event-header">
        <div style={{ display: 'flex', alignItems: 'center', marginBottom: 20 }}>
          <img src="/logo.png" alt="Desi Plaza Caterings Logo" style={{ width: 80, height: 80, objectFit: 'contain', marginRight: 16, borderRadius: 8, background: '#fff' }} />
          <div>
            <h1>Create New Event</h1>
            <p style={{ margin: '4px 0 0 0', color: '#666', fontSize: '0.95em' }}>Combine enquiry details and quotation to create an event</p>
          </div>
        </div>
      </div>

      <form onSubmit={createEvent}>
        <div className="form-sections">
          {/* ENQUIRY DETAILS SECTION */}
          <div className="form-section">
            <h2 className="section-title">📋 Event Details</h2>
            
            <div className="form-row">
              <div className="form-group">
                <label>Customer Name *</label>
                <input
                  type="text"
                  name="customerName"
                  value={enquiryForm.customerName}
                  onChange={handleEnquiryChange}
                  placeholder="Full name"
                  required
                />
              </div>
              <div className="form-group">
                <label>Mobile *</label>
                <input
                  type="tel"
                  name="mobile"
                  value={enquiryForm.mobile}
                  onChange={(e) => {
                    e.target.value = e.target.value.replace(/\D/g, '').slice(0, 10);
                    handleEnquiryChange(e);
                  }}
                  placeholder="Phone number"
                  required
                  maxLength="10"
                />
              </div>
              <div className="form-group">
                <label>Email</label>
                <input
                  type="email"
                  name="email"
                  value={enquiryForm.email}
                  onChange={handleEnquiryChange}
                  placeholder="Email address"
                />
              </div>
            </div>

            <div className="form-row">
              <div className="form-group">
                <label>Event Type *</label>
                <input
                  type="text"
                  name="eventType"
                  value={enquiryForm.eventType}
                  onChange={handleEnquiryChange}
                  placeholder="e.g., Wedding, Birthday, Corporate"
                  required
                />
              </div>
              <div className="form-group">
                <label>Event Date *</label>
                <input
                  type="date"
                  name="eventDate"
                  value={enquiryForm.eventDate}
                  onChange={handleEnquiryChange}
                  required
                />
              </div>
              <div className="form-group">
                <label>Event Time</label>
                <input
                  type="time"
                  name="eventTime"
                  value={enquiryForm.eventTime}
                  onChange={handleEnquiryChange}
                />
              </div>
            </div>

            <div className="form-row">
              <div className="form-group">
                <label>Location</label>
                <input
                  type="text"
                  name="location"
                  value={enquiryForm.location}
                  onChange={handleEnquiryChange}
                  placeholder="Event venue/address"
                />
              </div>
              <div className="form-group">
                <label>Number of Guests</label>
                <input
                  type="number"
                  name="guests"
                  value={enquiryForm.guests}
                  onChange={handleEnquiryChange}
                  placeholder="Approximate count"
                  min="0"
                />
              </div>
            </div>

            <div className="form-row full">
              <div className="form-group">
                <label>Notes</label>
                <textarea
                  name="notes"
                  value={enquiryForm.notes}
                  onChange={handleEnquiryChange}
                  placeholder="Additional details or special requirements"
                  rows="3"
                />
              </div>
            </div>
          </div>

          {/* QUOTATION/MENU ITEMS SECTION */}
          <div className="form-section">
            <h2 className="section-title">🍽️ Menu Items</h2>

            <div className="menu-add-section">
              <h3>Add Menu Items</h3>
              
              {menuLoading ? (
                <div style={{ padding: '20px', textAlign: 'center', color: '#888' }}>Loading menu items...</div>
              ) : menuItems.length === 0 ? (
                <div style={{ padding: '20px', textAlign: 'center', color: '#d32f2f', background: '#ffebee', borderRadius: '6px' }}>No menu items available. Please check your connection.</div>
              ) : (
                <>
                  <div className="form-row">
                    <div className="form-group">
                      <label>Category</label>
                      <select
                        value={selectedCategory}
                        onChange={(e) => {
                          setSelectedCategory(e.target.value);
                          setSelectedItem("");
                          setMenuSearch("");
                        }}
                      >
                        <option value="">All Categories</option>
                        {categories.map((cat, idx) => (
                          <option key={idx} value={cat}>{cat}</option>
                        ))}
                      </select>
                    </div>

                    <div className="form-group" style={{ position: 'relative', flex: 2 }}>
                      <label>Menu Item *</label>
                      <input
                        type="text"
                        placeholder="Search and select menu item..."
                        value={menuSearch}
                        onChange={e => {
                          setMenuSearch(e.target.value);
                          setShowDropdown(true);
                        }}
                        onFocus={() => setShowDropdown(true)}
                        autoComplete="off"
                      />
                      {showDropdown && (
                        <div className="menu-dropdown">
                          {filteredMenuItems.length === 0 ? (
                            <div className="dropdown-item-empty">No items found</div>
                          ) : (
                            filteredMenuItems.map((item, i) => (
                              <div
                                key={i}
                                className="dropdown-item"
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
                  </div>

                  <div className="form-row">
                    <div className="form-group">
                      <label>Unit</label>
                      {availableUnits.length > 1 ? (
                        <select
                          value={unit}
                          onChange={e => {
                            setUnit(e.target.value);
                            const found = availableUnits.find(u => u.unit === e.target.value);
                            setPrice(found ? found.price : 0);
                          }}
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
                          style={{ background: '#f5f5f5', cursor: 'not-allowed', color: '#888' }}
                        />
                      )}
                    </div>
                    <div className="form-group">
                      <label>Quantity *</label>
                      <input
                        type="number"
                        min="1"
                        placeholder="Qty"
                        value={qty}
                        onChange={e => setQty(Number(e.target.value))}
                      />
                    </div>
                    <div className="form-group">
                      <label>Price</label>
                      <input
                        type="number"
                        min="0"
                        placeholder="Price"
                        value={price}
                        readOnly
                        style={{ background: '#f5f5f5', cursor: 'not-allowed', color: '#888' }}
                      />
                    </div>
                    <div className="form-group" style={{ display: 'flex', alignItems: 'flex-end' }}>
                      <button type="button" className="button" onClick={addMenuItem}>Add</button>
                    </div>
                  </div>
                </>
              )}
            </div>

            {/* ADDED ITEMS TABLE */}
            {addedItems.length > 0 && (
              <div className="items-table-section">
                <h3>Added Items</h3>
                <table className="items-table">
                  <thead>
                    <tr>
                      <th>#</th>
                      <th>Item Name</th>
                      <th>Unit</th>
                      <th>Qty</th>
                      <th>Price</th>
                      <th>Total</th>
                      <th>Action</th>
                    </tr>
                  </thead>
                  <tbody>
                    {(() => {
                      const grouped = {};
                      addedItems.forEach((item, idx) => {
                        if (!grouped[item.category]) grouped[item.category] = [];
                        grouped[item.category].push({ ...item, _idx: idx });
                      });
                      let rowIdx = 1;
                      const rows = [];
                      Object.keys(grouped).sort().forEach(category => {
                        rows.push(
                          <tr key={category} style={{ background: '#f5f5f5', fontWeight: 'bold' }}>
                            <td colSpan={7}>{category || 'Uncategorized'}</td>
                          </tr>
                        );
                        grouped[category].forEach(item => {
                          rows.push(
                            <tr key={rowIdx + '-' + item.itemName}>
                              <td>{rowIdx++}</td>
                              <td>{item.itemName}</td>
                              <td>{item.unit}</td>
                              <td>{item.qty}</td>
                              <td>${item.price.toFixed(2)}</td>
                              <td style={{ fontWeight: 'bold' }}>${(item.price * item.qty).toFixed(2)}</td>
                              <td><button type="button" className="remove-btn" onClick={() => removeMenuItem(item._idx)}>Remove</button></td>
                            </tr>
                          );
                        });
                      });
                      if (addedItems.length > 0) {
                        const total = addedItems.reduce((sum, item) => sum + item.price * item.qty, 0);
                        rows.push(
                          <tr key="total-row" style={{ fontWeight: 'bold', background: '#fffbe6' }}>
                            <td colSpan={5} style={{ textAlign: 'right' }}>Total</td>
                            <td>${total.toFixed(2)}</td>
                            <td></td>
                          </tr>
                        );
                      }
                      return rows;
                    })()}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>

        {/* SUBMIT BUTTON */}
        <div className="form-actions">
          {permissions.canCreateEnquiry && permissions.canCreateQuotation ? (
            <button type="submit" className="button button-primary">
              ✨ Create Event
            </button>
          ) : (
            <button 
              type="button" 
              className="button" 
              style={{ opacity: 0.5, cursor: 'not-allowed', background: '#ccc' }} 
              disabled
              title="You don't have permission to create events"
            >
              ✨ Create Event
            </button>
          )}
          <button 
            type="button" 
            className="button button-secondary"
            onClick={() => navigate("/")}
          >
            Cancel
          </button>
        </div>
      </form>
    </div>
  );
}

export default CreateEvent;
