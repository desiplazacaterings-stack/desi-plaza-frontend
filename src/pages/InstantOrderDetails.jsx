import React, { useState, useEffect } from "react";
import axios from "axios";
import API_ENDPOINTS from "../config";

  // Print KOT for a single order (placeholder)
  const kotPrintOrder = (order) => {
    const printWindow = window.open('', '', 'width=800,height=900');
    printWindow.document.write(`
      <html>
        <head>
          <title>KOT Print</title>
          <style>
            @media print {
              @page {
                size: 80mm 120mm;
                margin: 5mm;
              }
              body {
                width: 72mm;
                font-family: 'Courier New', Courier, monospace;
                font-size: 12px;
                margin: 0;
                padding: 0;
              }
              table {
                width: 100%;
                border-collapse: collapse;
              }
              th, td {
                border-bottom: 1px dashed #000;
                padding: 2px 0;
                text-align: left;
              }
              h2 {
                font-size: 16px;
                margin: 0 0 8px 0;
                text-align: center;
              }
            }
          </style>
        </head>
        <body>
          <h2>KOT (Kitchen Order Ticket)</h2>
          <div><strong>Order ID:</strong> ${order._id}</div>
          <div><strong>Customer Name:</strong> ${order.customer.name}</div>
          <table>
            <tr><th>Item</th><th>Unit</th><th>Qty</th></tr>
            ${order.items.map(item => `<tr><td>${item.itemName}</td><td>${item.unit || ''}</td><td>${item.qty}</td></tr>`).join('')}
          </table>
        </body>
      </html>
    `);
    printWindow.document.close();
    printWindow.focus();
    printWindow.print();
    printWindow.close();
  };

function InstantOrderDetails() {
    // Responsive styles for mobile view
    const tableStyle = {
      width: '100%',
      borderCollapse: 'collapse',
      marginTop: '20px',
      fontSize: '14px',
      minWidth: '320px',
      overflowX: 'auto',
      display: 'block',
      whiteSpace: 'nowrap',
    };
    const thTdStyle = {
      border: '1px solid #ddd',
      padding: '8px',
      minWidth: '90px',
      textAlign: 'left',
      fontSize: '14px',
      wordBreak: 'break-word',
    };
    const mobileHeaderStyle = {
      backgroundColor: '#f2f2f2',
      fontWeight: 'bold',
      fontSize: '15px',
    };
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [search, setSearch] = useState("");

  useEffect(() => {
    fetchOrders();
  }, []);

  const fetchOrders = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get(API_ENDPOINTS.ORDERS.GET_ALL, {
        headers: { Authorization: `Bearer ${token}` }
      });
      // Filter for instant orders
      const instantOrders = response.data.filter(order => order.orderType === 'Instant');
      setOrders(instantOrders);
    } catch (err) {
      setError('Failed to fetch orders');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <p>Loading instant orders...</p>;
  if (error) return <p>{error}</p>;

  // Print a single order's details
  const printOrder = (order) => {
    const printWindow = window.open('', '', 'width=800,height=600');
    printWindow.document.write('<html><head><title>Print Order</title></head><body>');
    printWindow.document.write(`<h2>Instant Order Details</h2>`);
    printWindow.document.write(`<strong>Order ID:</strong> ${order._id}<br/>`);
    printWindow.document.write(`<strong>Customer Name:</strong> ${order.customer.name}<br/>`);
    printWindow.document.write(`<strong>Mobile:</strong> ${order.customer.mobile}<br/>`);
    printWindow.document.write(`<strong>Address:</strong> ${order.customer.address || ''}<br/>`);
    printWindow.document.write(`<strong>Status:</strong> ${order.status}<br/>`);
    printWindow.document.write(`<strong>Created:</strong> ${new Date(order.createdAt).toLocaleString()}<br/><br/>`);
    printWindow.document.write('<table border="1" cellpadding="8" style="border-collapse:collapse;width:100%"><tr><th>Item</th><th>Qty</th><th>Price</th></tr>');
    order.items.forEach(item => {
      printWindow.document.write(`<tr><td>${item.itemName}</td><td>${item.qty}</td><td>₹${item.price}</td></tr>`);
    });
    printWindow.document.write('</table>');
    printWindow.document.write(`<p><strong>Total:</strong> ₹${order.total}</p>`);
    printWindow.document.write('</body></html>');
    printWindow.document.close();
    printWindow.focus();
    printWindow.print();
    printWindow.close();
  };

  // Filter orders by customer name
  const filteredOrders = orders.filter(order =>
    order.customer.name.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 16 }}>
        <h2 style={{ margin: 0 }}>Instant Order Details</h2>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <input
            type="text"
            placeholder="Search by customer name..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            style={{ padding: '8px', borderRadius: 4, border: '1px solid #ccc', fontSize: 15 }}
          />
          <button onClick={() => window.print()} style={{ padding: '8px 16px', fontSize: '16px', cursor: 'pointer' }}>🖨️ Print</button>
        </div>
      </div>
      {filteredOrders.length === 0 ? (
        <p>No instant orders found.</p>
      ) : (
        <div style={{ overflowX: 'auto' }}>
          <table style={tableStyle}>
            <thead>
              <tr style={mobileHeaderStyle}>
                <th style={thTdStyle}>Order ID</th>
                <th style={thTdStyle}>Customer Name</th>
                <th style={thTdStyle}>Mobile</th>
                <th style={thTdStyle}>Items</th>
                <th style={thTdStyle}>Category</th>
                <th style={thTdStyle}>Amount</th>
                <th style={thTdStyle}>Total</th>
                <th style={thTdStyle}>Status</th>
                <th style={thTdStyle}>Created</th>
                <th style={thTdStyle}></th>
              </tr>
            </thead>
            <tbody>
              {filteredOrders.map(order => (
                <tr key={order._id}>
                  <td style={thTdStyle}>{order._id}</td>
                  <td style={thTdStyle}>{order.customer.name}</td>
                  <td style={thTdStyle}>{order.customer.mobile}</td>
                  <td style={thTdStyle}>
                    {order.items.map((item, index) => (
                      <div key={index}>{item.qty} x {item.itemName}</div>
                    ))}
                  </td>
                  <td style={thTdStyle}>
                    {order.items.map((item, index) => (
                      <div key={index}>{item.category || ''}</div>
                    ))}
                  </td>
                  <td style={thTdStyle}>
                    {order.items.map((item, index) => (
                      <div key={index}>₹{(item.qty * item.price).toFixed(2)}</div>
                    ))}
                  </td>
                  <td style={thTdStyle}>₹{order.total}</td>
                  <td style={thTdStyle}>{order.status}</td>
                  <td style={thTdStyle}>{new Date(order.createdAt).toLocaleString()}</td>
                  <td style={thTdStyle}>
                    <div className="table-action-buttons">
                      <button className="button" onClick={() => printOrder(order)}>🖨️ Print</button>
                      <button className="button" onClick={() => kotPrintOrder(order)} style={{ backgroundColor: '#f0ad4e', color: '#fff' }}>🧾 KOT Print</button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

export default InstantOrderDetails;