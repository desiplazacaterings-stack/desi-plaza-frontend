import "./Quotation.css";
import { useLocation } from "react-router-dom";
import { useState, useEffect, useRef } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import API_ENDPOINTS from "../config";
import useMenuItems from "../hooks/useMenuItems";

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
  const [permissions, setPermissions] = useState({});
  const [userRole, setUserRole] = useState(null);

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
          setPermissions({ canCreateQuotation: true });
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

  const location = useLocation();
  const navigate = useNavigate();
  const enquiry = location.state?.enquiry;
  const quotationToEdit = location.state?.quotation;
  const [isEditMode] = useState(!!quotationToEdit);
  const [editingQuotationId] = useState(quotationToEdit?._id);


  // If no enquiry, allow manual entry of customer details
  const [manualCustomer, setManualCustomer] = useState({
    customerName: '',
    mobile: ''
  });

  const { menuItems, loading: menuLoading } = useMenuItems();
  const [selectedCategory, setSelectedCategory] = useState("");
  const [selectedItem, setSelectedItem] = useState("");
  const [menuSearch, setMenuSearch] = useState("");
  const [qty, setQty] = useState(1);
  const [unit, setUnit] = useState("");
  const [price, setPrice] = useState(0);
  const [availableUnits, setAvailableUnits] = useState([]);
  const [addedItems, setAddedItems] = useState([]);
  const [salesTaxRate, setSalesTaxRate] = useState(0);
  const [serviceChargeRate, setServiceChargeRate] = useState(0);
  const [discount, setDiscount] = useState(0);
  const [labourCharges, setLabourCharges] = useState(0);
  const [showAdvanced, setShowAdvanced] = useState(false);

  // Initialize items if editing
  useEffect(() => {
    if (isEditMode && quotationToEdit?.items) {
      setAddedItems(quotationToEdit.items);
      setSalesTaxRate(quotationToEdit.salesTaxRate || 0);
      setServiceChargeRate(quotationToEdit.serviceChargeRate || 0);
      setDiscount(quotationToEdit.discount || 0);
      setLabourCharges(quotationToEdit.labourCharges || 0);
    }
  }, [isEditMode, quotationToEdit]);

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

  const printQuotation = async () => {
    // Fetch and convert logo to data URL
    let logoDataUrl = '';
    try {
      const response = await fetch('/logo.png');
      const blob = await response.blob();
      logoDataUrl = await new Promise((resolve) => {
        const reader = new FileReader();
        reader.onloadend = () => resolve(reader.result);
        reader.readAsDataURL(blob);
      });
    } catch (error) {
      console.log('Logo could not be loaded');
    }

    let html = `<!DOCTYPE html><html><head><meta charset="UTF-8"><meta name="viewport" content="width=device-width, initial-scale=1.0"><title>Quotation Print</title>
    <style>
      * { margin: 0; padding: 0; box-sizing: border-box; }
      @media print {
        @page { size: A4; margin: 20mm; }
        body { background: #fff !important; margin: 0; padding: 20mm; }
      }
      body { font-family: Arial, sans-serif; background: #fff; color: #222; margin: 0; padding: 20px; }
      .quotation-a4 { max-width: 900px; margin: 0 auto; padding: 20px; background: #fff; }
      .company-header { display: flex; align-items: flex-start; margin-bottom: 20px; gap: 15px; }
      .company-logo { width: 80px; height: 80px; object-fit: contain; flex-shrink: 0; background: #fff; }
      .company-details { font-size: 12px; background: #f2f2f2; color: #222; border-radius: 4px; padding: 10px; flex: 1; }
      .quotation-title { text-align: left; font-size: 20px; font-weight: bold; margin: 15px 0 10px 0; }
      .quotation-info { margin-bottom: 15px; text-align: left; font-size: 13px; line-height: 1.6; }
      table { width: 100%; border-collapse: collapse; margin-top: 15px; }
      th, td { border: 1px solid #bbb; padding: 8px; text-align: left; font-size: 13px; }
      th { background: #f5f5f5; font-weight: bold; }
      td { background: #fff; }
      tr.summary-row td { border: none; padding: 6px 8px; background: #fafafa; text-align: right; }
      tr.summary-row td:first-child { text-align: right; font-weight: bold; }
      tr.total-row td { border: none; padding: 8px; background: #e8f5e9; font-weight: bold; font-size: 14px; color: #2e7d32; }
      @media (max-width: 768px) {
        .quotation-a4 { padding: 12px; }
        .company-header { flex-direction: column; }
        .company-details { font-size: 11px; }
        table { font-size: 12px; }
        th, td { padding: 6px; }
      }
    </style>
    </head><body><div class="quotation-a4">
      <div class="company-header">
        <img src="${logoDataUrl}" alt="Desi Plaza Caterings Logo" class="company-logo" />
        <div class="company-details">
          <strong>Desi Plaza Caterings</strong><br>9405 Cincinnati Columbus Rd, West Chester Township, OH 45069, United States<br>Phone: +1 513 7773374<br>Email: desiplazacaterings@gmail.com
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
              <td>$${item.price.toFixed(2)}</td>
              <td>$${(item.price * item.qty).toFixed(2)}</td>
            </tr>
          `).join('')}
        </tbody>
        <tfoot>
          <tr class="summary-row">
            <td colspan="5" style="text-align:right;">Subtotal</td>
            <td>$${subtotal.toFixed(2)}</td>
          </tr>
          ${salesTaxRate > 0 ? `<tr class="summary-row">
            <td colspan="5" style="text-align:right;">Sales Tax (${salesTaxRate}%)</td>
            <td>$${salesTaxAmount.toFixed(2)}</td>
          </tr>` : ''}
          ${serviceChargeRate > 0 ? `<tr class="summary-row">
            <td colspan="5" style="text-align:right;">Service Charges (${serviceChargeRate}%)</td>
            <td>$${serviceChargeAmount.toFixed(2)}</td>
          </tr>` : ''}
          ${labourCharges > 0 ? `<tr class="summary-row">
            <td colspan="5" style="text-align:right;">Labour Charges</td>
            <td>$${labourCharges.toFixed(2)}</td>
          </tr>` : ''}
          ${discount > 0 ? `<tr class="summary-row">
            <td colspan="5" style="text-align:right;">Discount (${discount}%)</td>
            <td style="color: #e74c3c;">-$${discountAmount.toFixed(2)}</td>
          </tr>` : ''}
          <tr class="total-row">
            <td colspan="5" style="text-align:right;">Total</td>
            <td>$${total.toFixed(2)}</td>
          </tr>
        </tfoot>
      </table>
    </div></body></html>`;
    const printWindow = window.open('', '', 'width=900,height=1200');
    if (printWindow) {
      printWindow.document.write(html);
      printWindow.document.close();
      setTimeout(() => {
        printWindow.focus();
        printWindow.print();
      }, 300);
    } else {
      alert('Please enable pop-ups to print. Alternatively, use your browser\'s print menu.');
    }
  };

  // Calculate totals with tax and charges
  const subtotal = addedItems.reduce((sum, item) => sum + item.price * item.qty, 0);
  const salesTaxAmount = subtotal * (salesTaxRate / 100);
  const serviceChargeAmount = subtotal * (serviceChargeRate / 100);
  const subtotalWithCharges = subtotal + salesTaxAmount + serviceChargeAmount + labourCharges;
  const discountAmount = subtotalWithCharges * (discount / 100);
  const total = subtotalWithCharges - discountAmount;

  // Get unique categories from menuItems
  const categories = Array.from(new Set(menuItems.map(item => item.category))).sort();

  // Filter menu items by selected category and search (already grouped - no duplicate itemNames)
  const filteredMenuItems = menuItems
    .filter(item =>
      (!selectedCategory || item.category === selectedCategory) &&
      item.itemName.toLowerCase().includes(menuSearch.toLowerCase())
    )
    .sort((a, b) => a.itemName.localeCompare(b.itemName));

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
    } else if (isEditMode && quotationToEdit?.enquiry) {
      customerData = quotationToEdit.enquiry;
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
      enquiryId: enquiry?._id || null,
      enquiry: customerData,
      items: addedItems.map(item => ({
        itemName: item.itemName,
        unit: item.unit,
        qty: item.qty,
        price: item.price
      })),
      subtotal,
      salesTaxRate,
      salesTax: salesTaxAmount,
      serviceChargeRate,
      serviceCharge: serviceChargeAmount,
      labourCharges,
      discount,
      discountAmount,
      total
    };

    console.log('Sending quotation data:', data);

    if (isEditMode) {
      // Update existing quotation
      axios.patch(API_ENDPOINTS.QUOTATIONS.UPDATE(editingQuotationId), data)
        .then(res => {
          alert("Quotation updated successfully!");
          navigate("/quotations");
        })
        .catch(err => {
          let msg = "Failed to update quotation.";
          if (err.response && err.response.data && err.response.data.message) {
            msg += `\n${err.response.data.message}`;
          }
          alert(msg);
          console.error(err);
        });
    } else {
      // Create new quotation
      data.quotationId = quotationId;
      axios.post(API_ENDPOINTS.QUOTATIONS.CREATE, data)
        .then(res => {
          alert("Quotation saved successfully!");
          // Dispatch event to notify enquiries table to refresh
          window.dispatchEvent(new Event('quotationCreated'));
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
  }

  return (
    <div className="quotation-container">
      <div style={{ display: 'flex', alignItems: 'center', marginBottom: 10 }}>
        <img src="/logo.png" alt="Desi Plaza Caterings Logo" style={{ width: 90, height: 90, objectFit: 'contain', marginRight: 18, borderRadius: 8, background: '#fff' }} />
        <div className="company-details" style={{ fontSize: 14, background: '#f2f2f2', color: '#222', borderRadius: 8, padding: '8px 14px', maxWidth: 350 }}>
          <strong>Desi Plaza Caterings</strong><br />9405 Cincinnati Columbus Rd, West Chester Township, OH 45069, United States<br />Phone: +1 513 7773374<br />Email: desiplazacaterings@gmail.com
        </div>
      </div>


      <div style={{ marginBottom: 10, fontWeight: 'bold', color: '#222' }}>
        {isEditMode ? `Editing Quotation: ${quotationToEdit.quotationId}` : `Quotation ID: ${quotationId}`}
      </div>
      {enquiry || isEditMode ? (
        <div style={{ marginBottom: 20, textAlign: 'left', display: 'flex', flexWrap: 'wrap', gap: '32px 48px' }}>
          <div style={{ minWidth: 220 }}>
            <strong>Customer:</strong> {enquiry?.customerName || quotationToEdit?.enquiry?.customerName}<br />
            <strong>Mobile:</strong> {enquiry?.mobile || quotationToEdit?.enquiry?.mobile}<br />
            <strong>Email:</strong> {enquiry?.email || quotationToEdit?.enquiry?.email}<br />
            <strong>Event:</strong> {enquiry?.eventType || quotationToEdit?.enquiry?.eventType}<br />
          </div>
          <div style={{ minWidth: 220 }}>
            <strong>Date:</strong> {enquiry?.eventDate || quotationToEdit?.enquiry?.eventDate}<br />
            <strong>Location:</strong> {enquiry?.location || quotationToEdit?.enquiry?.location}<br />
            <strong>Guests:</strong> {enquiry?.guests || quotationToEdit?.enquiry?.guests}<br />
            <strong>Notes:</strong> {enquiry?.notes || quotationToEdit?.enquiry?.notes}<br />
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
                type="tel"
                value={manualCustomer.mobile}
                onChange={e => {
                  const value = e.target.value.replace(/\D/g, '').slice(0, 10);
                  setManualCustomer({ ...manualCustomer, mobile: value });
                }}
                placeholder="Enter mobile number"
                style={{ marginBottom: 8, width: '100%' }}
                required
                maxLength="10"
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
                filteredMenuItems.map((item) => (
                  <div
                    key={item.itemName}
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

      {/* ADVANCED OPTIONS */}
      <div style={{ marginBottom: 20 }}>
        <button
          type="button"
          onClick={() => setShowAdvanced(!showAdvanced)}
          style={{
            background: '#f5f5f5',
            border: '1px solid #ddd',
            padding: '8px 16px',
            borderRadius: 4,
            cursor: 'pointer',
            fontWeight: 'bold',
            color: '#333'
          }}
        >
          {showAdvanced ? '▼' : '▶'} Advanced Options
        </button>

        {showAdvanced && (
          <div style={{
            background: '#fffbe6',
            border: '1px solid #ffe58f',
            padding: 12,
            borderRadius: 4,
            marginTop: 8,
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
            gap: 12
          }}>
            <label style={{ display: 'flex', flexDirection: 'column' }}>
              Sales Tax %:
              <input
                type="number"
                value={salesTaxRate}
                onChange={e => setSalesTaxRate(Number(e.target.value))}
                min="0"
                step="0.1"
                placeholder="0"
                style={{ marginTop: 4, padding: 6, borderRadius: 4, border: '1px solid #ddd' }}
              />
            </label>

            <label style={{ display: 'flex', flexDirection: 'column' }}>
              Service Charges %:
              <input
                type="number"
                value={serviceChargeRate}
                onChange={e => setServiceChargeRate(Number(e.target.value))}
                min="0"
                step="0.1"
                placeholder="0"
                style={{ marginTop: 4, padding: 6, borderRadius: 4, border: '1px solid #ddd' }}
              />
            </label>

            <label style={{ display: 'flex', flexDirection: 'column' }}>
              Discount %:
              <input
                type="number"
                value={discount}
                onChange={e => setDiscount(Number(e.target.value))}
                min="0"
                step="0.1"
                placeholder="0"
                style={{ marginTop: 4, padding: 6, borderRadius: 4, border: '1px solid #ddd' }}
              />
            </label>

            <label style={{ display: 'flex', flexDirection: 'column' }}>
              Labour Charges (Fixed Amount):
              <input
                type="number"
                value={labourCharges}
                onChange={e => setLabourCharges(Number(e.target.value))}
                min="0"
                step="0.01"
                placeholder="0"
                style={{ marginTop: 4, padding: 6, borderRadius: 4, border: '1px solid #ddd' }}
              />
            </label>
          </div>
        )}
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
                      <td data-label="#">{rowIdx++}</td>
                      <td data-label="Category">{item.category}</td>
                      <td data-label="Item Name">{item.itemName}</td>
                      <td data-label="Unit">{item.unit}</td>
                      <td data-label="Qty">{item.qty}</td>
                      <td data-label="Total">${(item.price * item.qty).toFixed(2)}</td>
                      <td data-label="Action"><button onClick={() => removeMenuItem(item._idx)} style={{color:'#c00'}}>Remove</button></td>
                    </tr>
                  );
                });
              });
              if (addedItems.length > 0) {
                rows.push(
                  <tr key="subtotal-row">
                    <td colSpan={6} style={{ textAlign: 'right', fontWeight: 'bold' }}>Subtotal</td>
                    <td style={{ fontWeight: 'bold' }}>${subtotal.toFixed(2)}</td>
                  </tr>
                );
                if (salesTaxRate > 0) {
                  rows.push(
                    <tr key="tax-row" style={{ background: '#f0f0f0' }}>
                      <td colSpan={6} style={{ textAlign: 'right', fontWeight: 'bold' }}>Sales Tax ({salesTaxRate}%)</td>
                      <td style={{ fontWeight: 'bold' }}>${salesTaxAmount.toFixed(2)}</td>
                    </tr>
                  );
                }
                if (serviceChargeRate > 0) {
                  rows.push(
                    <tr key="charge-row" style={{ background: '#f0f0f0' }}>
                      <td colSpan={6} style={{ textAlign: 'right', fontWeight: 'bold' }}>Service Charges ({serviceChargeRate}%)</td>
                      <td style={{ fontWeight: 'bold' }}>${serviceChargeAmount.toFixed(2)}</td>
                    </tr>
                  );
                }
                if (discount > 0) {
                  rows.push(
                    <tr key="discount-row" style={{ background: '#f0f0f0' }}>
                      <td colSpan={6} style={{ textAlign: 'right', fontWeight: 'bold' }}>Discount ({discount}%)</td>
                      <td style={{ fontWeight: 'bold', color: '#e74c3c' }}>-${discountAmount.toFixed(2)}</td>
                    </tr>
                  );
                }
                rows.push(
                  <tr key="total-row" style={{ background: '#e8f5e9' }}>
                    <td colSpan={6} style={{ textAlign: 'right', fontWeight: 'bold', fontSize: '1.1em' }}>Total</td>
                    <td style={{ fontWeight: 'bold', fontSize: '1.1em', color: '#2e7d32' }}>${total.toFixed(2)}</td>
                  </tr>
                );
              }
              return rows;
            })()}
          </tbody>
        </table>
      </div>
      <button className="button" onClick={printQuotation} style={{marginRight:8}}>🖨️ Print Quotation</button>
      {permissions.canCreateQuotation ? (
        <button className="button" onClick={saveQuotation}>💾 Save Quotation</button>
      ) : (
        <button 
          className="button" 
          style={{ opacity: 0.5, cursor: 'not-allowed', background: '#ccc' }} 
          disabled 
          title="You don't have permission to create quotations"
        >
          💾 Save Quotation
        </button>
      )}
    </div>
  );
}

export default Quotation;
