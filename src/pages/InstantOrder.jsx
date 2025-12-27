import { useState, useEffect } from "react";
import axios from "axios";
import API_ENDPOINTS from "../config";
import "./InstantOrder.css";

function InstantOrder() {
  const [selectedItem, setSelectedItem] = useState("");
  const [qty, setQty] = useState(1);

  const [customerName, setCustomerName] = useState("");
  const [mobile, setMobile] = useState("");
  const [email, setEmail] = useState("");
  const [address, setAddress] = useState("");
  const [deliveryTime, setDeliveryTime] = useState("");

  const [taxRate, setTaxRate] = useState(5);
  const [advance, setAdvance] = useState(0);
  const [status, setStatus] = useState("Placed");

  const [menuItems, setMenuItems] = useState([]);
  const [kotItems, setKotItems] = useState([]);

  /* 🔹 Fetch Menu */
  useEffect(() => {
    const fetchMenu = async () => {
      try {
        const res = await axios.get(API_ENDPOINTS.ITEMS.GET_ALL);
        setMenuItems(res.data);
      } catch (err) {
        console.error("Error fetching menu:", err);
      }
    };
    fetchMenu();
  }, []);

  /* 🔹 Add item to KOT */
  const addToKOT = () => {
    if (!selectedItem) return;

    const item = menuItems.find(i => i.itemName === selectedItem);
    if (!item) return;

    const priceObj =
      item.prices?.length > 0
        ? item.prices[0]
        : { price: 0, unit: "" };

    setKotItems(prev => [
      ...prev,
      {
        itemName: selectedItem,
        qty,
        price: priceObj.price,
        category: item.category,
        unit: priceObj.unit
      }
    ]);

    setSelectedItem("");
    setQty(1);
  };

  /* 🔹 Calculations */
  const subtotal = kotItems.reduce(
    (sum, item) => sum + item.price * item.qty,
    0
  );
  const taxAmount = subtotal * (taxRate / 100);
  const total = subtotal + taxAmount;
  const balance = total - advance;

  /* 🔹 Submit Order */
  const submitOrder = async (e) => {
    e.preventDefault();

    if (!customerName || !mobile || kotItems.length === 0) {
      alert("Fill customer details and add items");
      return;
    }

    const orderData = {
      customer: {
        name: customerName,
        mobile,
        email,
        address
      },
      items: kotItems,
      subtotal,
      tax: taxAmount,
      total,
      advance,
      balance,
      deliveryTime: deliveryTime || null,
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
      setDeliveryTime("");
      setAdvance(0);
      setStatus("Placed");
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
        <h3>Customer Details</h3>

        <label>
          Name:
          <input value={customerName} onChange={e => setCustomerName(e.target.value)} />
        </label>

        <label>
          Mobile:
          <input value={mobile} onChange={e => setMobile(e.target.value)} />
        </label>

        <label>
          Email:
          <input value={email} onChange={e => setEmail(e.target.value)} />
        </label>

        <label>
          Address:
          <textarea value={address} onChange={e => setAddress(e.target.value)} />
        </label>

        <label>
          Delivery Time:
          <input
            type="datetime-local"
            value={deliveryTime}
            onChange={e => setDeliveryTime(e.target.value)}
          />
        </label>

        <label>
          Tax %:
          <input
            type="number"
            value={taxRate}
            onChange={e => setTaxRate(Number(e.target.value))}
          />
        </label>

        <label>
          Advance:
          <input
            type="number"
            value={advance}
            onChange={e => setAdvance(Number(e.target.value))}
          />
        </label>

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

      {/* ITEM INPUT */}
      <div className="order-input">
        <select value={selectedItem} onChange={e => setSelectedItem(e.target.value)}>
          <option value="">Select Item</option>
          {menuItems.map((item, i) => (
            <option key={i} value={item.itemName}>
              {item.itemName}
            </option>
          ))}
        </select>

        <input
          type="number"
          min="1"
          value={qty}
          onChange={e => setQty(Number(e.target.value))}
        />

        <button onClick={addToKOT}>➕ Add</button>
      </div>

      {/* SUMMARY */}
      <div className="order-summary">
        <p>Subtotal: ₹{subtotal}</p>
        <p>Tax: ₹{taxAmount}</p>
        <p>Total: ₹{total}</p>
        <p>Advance: ₹{advance}</p>
        <p>Balance: ₹{balance}</p>
      </div>

      {/* ACTIONS */}

      {/* ACTIONS */}
      <div className="instant-order-actions">
        <button className="button" onClick={() => {
          // Helper for fixed width
          const pad = (str, len) => (str.length > len ? str.slice(0, len) : str.padEnd(len, ' '));
          let out = '';
          out += pad('KOT', 32) + '\n';
          out += pad('Customer: ' + customerName, 32) + '\n';
          out += pad('Date: ' + new Date().toLocaleDateString(), 32) + '\n';
          out += pad('Time: ' + new Date().toLocaleTimeString(), 32) + '\n';
          out += '\n';
          out += pad('No  Item        Unit Qty', 32) + '\n';
          out += pad('-------------------------------', 32) + '\n';
          kotItems.forEach((item, idx) => {
            out += pad((idx + 1).toString(), 3) + ' ' + pad(item.itemName, 10) + pad(item.unit || '', 6) + pad(item.qty.toString(), 5) + '\n';
          });
          out += pad('-------------------------------', 32) + '\n';
          out += pad('Subtotal: ₹' + subtotal.toFixed(2), 32) + '\n';
          out += pad('Tax: ₹' + taxAmount.toFixed(2), 32) + '\n';
          out += pad('Total: ₹' + total.toFixed(2), 32) + '\n';
          out += pad('Advance: ₹' + advance.toFixed(2), 32) + '\n';
          out += pad('Balance: ₹' + balance.toFixed(2), 32) + '\n';
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
          let out = '';
          out += pad('KOT', 32) + '\n';
          out += pad('Customer: ' + customerName, 32) + '\n';
          out += pad('Date: ' + new Date().toLocaleDateString(), 32) + '\n';
          out += pad('Time: ' + new Date().toLocaleTimeString(), 32) + '\n';
          out += '\n';
          out += pad('No  Item                Qty', 32) + '\n';
          out += pad('-------------------------------', 32) + '\n';
          kotItems.forEach((item, idx) => {
            out += pad((idx + 1).toString(), 3) + ' ' + pad(item.itemName, 20) + pad(item.qty.toString(), 5) + '\n';
          });
          out += pad('-------------------------------', 32) + '\n';
          out += pad('Subtotal: ₹' + subtotal.toFixed(2), 32) + '\n';
          out += pad('Tax: ₹' + taxAmount.toFixed(2), 32) + '\n';
          out += pad('Total: ₹' + total.toFixed(2), 32) + '\n';
          out += pad('Advance: ₹' + advance.toFixed(2), 32) + '\n';
          out += pad('Balance: ₹' + balance.toFixed(2), 32) + '\n';
          return out;
        })()}
      </pre>
    </div>
  );
}

export default InstantOrder;
