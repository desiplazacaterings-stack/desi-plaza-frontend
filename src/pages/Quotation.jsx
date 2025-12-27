import "./Quotation.css";
import { useLocation } from "react-router-dom";
import { useState, useEffect } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import API_ENDPOINTS from "../config";

let quotationSerial = 1;

function getCurrentYear() {
  return new Date().getFullYear();
}

function generateQuotationId(serial) {
  const year = getCurrentYear();
  const paddedSerial = String(serial).padStart(4, '0');
  return `DPC-${year}-${paddedSerial}`;
}

function Quotation() {

  // Add state for dropdown visibility
  const [showDropdown, setShowDropdown] = useState(false);

  // Remove item by index
  const removeMenuItem = (idxToRemove) => {
    setAddedItems(prev => prev.filter((_, idx) => idx !== idxToRemove));
  };

  // Hide dropdown on outside click
  useEffect(() => {
    const handleClick = (e) => {
      if (!e.target.closest('.quotation-container')) setShowDropdown(false);
    };
    document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, []);
  const location = useLocation();
  const navigate = useNavigate();
  const enquiry = location.state?.enquiry;


  // If no enquiry, allow manual entry of customer details
  const [manualCustomer, setManualCustomer] = useState({
    customerName: '',
    mobile: ''
  });

  const [menuItems, setMenuItems] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState("");
  const [selectedItem, setSelectedItem] = useState("");
  const [menuSearch, setMenuSearch] = useState("");
  const [qty, setQty] = useState(1);
  const [unit, setUnit] = useState("");
  const [price, setPrice] = useState(0);
  const [availableUnits, setAvailableUnits] = useState([]);
  const [addedItems, setAddedItems] = useState([]);

  useEffect(() => {
    const fetchMenu = async () => {
      try {
        const res = await fetch(API_ENDPOINTS.ITEMS.GET_ALL);
        const data = await res.json();
        setMenuItems(data);
      } catch (err) {
        console.error("Error fetching menu:", err);
      }
    };
    fetchMenu();
  }, []);

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

  const [quotationId, setQuotationId] = useState(() => {
    // Generate Quotation ID in format DPC-YYYY-XXXX
    // For demo, use a static serial (should be replaced with backend logic for real serial)
    return generateQuotationId(quotationSerial++);
  });

  const printQuotation = () => {
    const total = addedItems.reduce((sum, item) => sum + item.price * item.qty, 0);
    let html = `<!DOCTYPE html><html><head><title>Quotation Print</title>
    <style>
      @media print {
        @page { size: A4; margin: 20mm; }
        body { background: #fff !important; }
      }
      body { font-family: Arial, sans-serif; background: #fff; color: #222; margin: 0; }
      .quotation-a4 { max-width: 800px; margin: 0 auto; padding: 24px; background: #fff; border-radius: 8px; }
      .company-header { display: flex; align-items: center; margin-bottom: 18px; }
      .company-logo { width: 90px; height: 90px; object-fit: contain; margin-right: 18px; border-radius: 8px; background: #fff; }
      .company-details { font-size: 13px; background: #f2f2f2; color: #222; border-radius: 8px; padding: 8px 14px; max-width: 350px; }
      .quotation-title { text-align: left; font-size: 22px; font-weight: bold; margin-bottom: 8px; }
      .quotation-info { margin-bottom: 18px; text-align: left; }
      table { width: 100%; border-collapse: collapse; margin-top: 18px; }
      th, td { border: 1px solid #bbb; padding: 8px 10px; text-align: left; }
      th { background: #f5f5f5; }
      tfoot td { font-weight: bold; }
    </style>
    </head><body><div class="quotation-a4">
      <div class="company-header">
        <img src="/logo.png" alt="Desi Plaza Caterings Logo" class="company-logo" />
        <div class="company-details">
          <strong>Desi Plaza Caterings</strong><br>123 Main Street, City, State, ZIP<br>Phone: +91 12345 67890<br>Email: info@desiplazacaterings.com<br>GSTIN: 29ABCDE1234F2Z5
        </div>
      </div>
      <div class="quotation-title">Quotation</div>
      <div class="quotation-info">
        <strong>Quotation ID:</strong> ${quotationId}<br />
        ${enquiry ? `<strong>Customer:</strong> ${enquiry.customerName}<br />
        <strong>Mobile:</strong> ${enquiry.mobile}<br />
        <strong>Email:</strong> ${enquiry.email}<br />
        <strong>Event:</strong> ${enquiry.eventType}<br />
        <strong>Date:</strong> ${enquiry.eventDate}<br />
        <strong>Location:</strong> ${enquiry.location}<br />
        <strong>Guests:</strong> ${enquiry.guests}<br />
        <strong>Notes:</strong> ${enquiry.notes}<br />` : ''}
      </div>
      <table>
        <thead>
          <tr>
            <th>#</th>
            <th>Item Name</th>
            <th>Unit</th>
            <th>Qty</th>
            <th>Price</th>
            <th>Total</th>
          </tr>
        </thead>
        <tbody>
          ${addedItems.map((item, idx) => `
            <tr>
              <td>${idx + 1}</td>
              <td>${item.itemName}</td>
              <td>${item.unit}</td>
              <td>${item.qty}</td>
              <td>₹${item.price.toFixed(2)}</td>
              <td>₹${(item.price * item.qty).toFixed(2)}</td>
            </tr>
          `).join('')}
        </tbody>
        <tfoot>
          <tr>
            <td colspan="5" style="text-align:right;">Total</td>
            <td>₹${total.toFixed(2)}</td>
          </tr>
        </tfoot>
      </table>
    </div></body></html>`;
    const printWindow = window.open('', '', 'width=900,height=1200');
    printWindow.document.write(html);
    printWindow.document.close();
    printWindow.focus();
    printWindow.print();
    printWindow.close();
  };

  // Get unique categories from menuItems
  const categories = Array.from(new Set(menuItems.map(item => item.category))).sort();

  // Filter menu items by selected category and search
  const filteredMenuItems = menuItems
    .filter(item =>
      (!selectedCategory || item.category === selectedCategory) &&
      item.itemName.toLowerCase().includes(menuSearch.toLowerCase())
    )
    .sort((a, b) => a.itemName.localeCompare(b.itemName));

  // ...existing code...

  function saveQuotation() {
    let customerData = null;
    if (enquiry) {
      customerData = {
        customerName: enquiry.customerName,
        mobile: enquiry.mobile,
        email: enquiry.email,
        eventType: enquiry.eventType,
        eventDate: enquiry.eventDate,
        location: enquiry.location,
        guests: enquiry.guests,
        notes: enquiry.notes
      };
    } else {
      if (!manualCustomer.customerName || !manualCustomer.mobile) {
        alert('Please enter customer name and mobile.');
        return;
      }
      customerData = {
        customerName: manualCustomer.customerName,
        mobile: manualCustomer.mobile
      };
    }
    const data = {
      quotationId,
      enquiry: customerData,
      items: addedItems.map(item => ({
        itemName: item.itemName,
        unit: item.unit,
        qty: item.qty,
        price: item.price
      })),
      total: addedItems.reduce((sum, item) => sum + item.price * item.qty, 0)
    };
    axios.post(API_ENDPOINTS.QUOTATIONS.CREATE, data)
      .then(res => {
        alert("Quotation saved successfully!");
        navigate("/quotations");
      })
      .catch(err => {
        let msg = "Failed to save quotation.";
        if (err.response && err.response.data && err.response.data.message) {
          msg += `\n${err.response.data.message}`;
        }
        alert(msg);
        console.error(err);
      });
  }

  return (
    <div className="quotation-container">
      <div style={{ display: 'flex', alignItems: 'center', marginBottom: 10 }}>
        <img src="/logo.png" alt="Desi Plaza Caterings Logo" style={{ width: 90, height: 90, objectFit: 'contain', marginRight: 18, borderRadius: 8, background: '#fff' }} />
        <div className="company-details" style={{ fontSize: 14, background: '#f2f2f2', color: '#222', borderRadius: 8, padding: '8px 14px', maxWidth: 350 }}>
          <strong>Desi Plaza Caterings</strong><br />123 Main Street, City, State, ZIP<br />Phone: +91 12345 67890<br />Email: info@desiplazacaterings.com<br />GSTIN: 29ABCDE1234F2Z5
        </div>
      </div>


      <div style={{ marginBottom: 10, fontWeight: 'bold', color: '#222' }}>Quotation ID: {quotationId}</div>
      {enquiry ? (
        <div style={{ marginBottom: 20, textAlign: 'left', display: 'flex', flexWrap: 'wrap', gap: '32px 48px' }}>
          <div style={{ minWidth: 220 }}>
            <strong>Customer:</strong> {enquiry.customerName}<br />
            <strong>Mobile:</strong> {enquiry.mobile}<br />
            <strong>Email:</strong> {enquiry.email}<br />
            <strong>Event:</strong> {enquiry.eventType}<br />
          </div>
          <div style={{ minWidth: 220 }}>
            <strong>Date:</strong> {enquiry.eventDate}<br />
            <strong>Location:</strong> {enquiry.location}<br />
            <strong>Guests:</strong> {enquiry.guests}<br />
            <strong>Notes:</strong> {enquiry.notes}<br />
          </div>
        </div>
      ) : (
        <div style={{ marginBottom: 20, textAlign: 'left', background: '#fffbe6', padding: 12, borderRadius: 6, border: '1px solid #ffe58f' }}>
          <strong>No enquiry selected. Please enter customer details below:</strong>
          <div style={{ marginTop: 10, display: 'flex', flexDirection: 'row', gap: 32, alignItems: 'flex-end' }}>
            <div style={{ display: 'flex', flexDirection: 'column', minWidth: 220 }}>
              <label style={{ display: 'block', marginBottom: 4 }}>Customer Name:</label>
              <input
                type="text"
                value={manualCustomer.customerName}
                onChange={e => setManualCustomer({ ...manualCustomer, customerName: e.target.value })}
                placeholder="Enter customer name"
                style={{ marginBottom: 6, width: '100%' }}
                required
              />
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', minWidth: 180 }}>
              <label style={{ display: 'block', marginBottom: 4 }}>Mobile:</label>
              <input
                type="text"
                value={manualCustomer.mobile}
                onChange={e => setManualCustomer({ ...manualCustomer, mobile: e.target.value })}
                placeholder="Enter mobile number"
                style={{ marginBottom: 8, width: '100%' }}
                required
              />
            </div>
          </div>
        </div>
      )}
      <div style={{ marginBottom: 20, position: 'relative', maxWidth: 500 }}>
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
        <button className="button" onClick={addMenuItem}>Add</button>
      </div>
      <div style={{ marginBottom: 20 }}>
        <h3>Menu Items</h3>
        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
          <thead>
            <tr>
              <th>#</th>
              <th>Category</th>
              <th>Item Name</th>
              <th>Unit</th>
              <th>Qty</th>
              <th>Price</th>
              <th>Remove</th>
            </tr>
          </thead>
          <tbody>
            {(() => {
              // Group items by category
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
                      <td>{item.category}</td>
                      <td>{item.itemName}</td>
                      <td>{item.unit}</td>
                      <td>{item.qty}</td>
                      <td>₹{(item.price * item.qty).toFixed(2)}</td>
                      <td><button onClick={() => removeMenuItem(item._idx)} style={{color:'#c00'}}>Remove</button></td>
                    </tr>
                  );
                });
              });
              if (addedItems.length > 0) {
                rows.push(
                  <tr key="total-row">
                    <td colSpan={6} style={{ textAlign: 'right', fontWeight: 'bold' }}>Total</td>
                    <td style={{ fontWeight: 'bold' }}>₹{addedItems.reduce((sum, item) => sum + item.price * item.qty, 0).toFixed(2)}</td>
                  </tr>
                );
              }
              return rows;
            })()}
          </tbody>
        </table>
      </div>
      <button className="button" onClick={printQuotation} style={{marginRight:8}}>🖨️ Print Quotation</button>
      <button className="button" onClick={saveQuotation}>💾 Save Quotation</button>
    </div>
  );
}

export default Quotation;
