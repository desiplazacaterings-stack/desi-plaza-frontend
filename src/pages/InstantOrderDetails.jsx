import React, { useState, useEffect } from "react";
import axios from "axios";
import API_ENDPOINTS from "../config";

  // Print KOT for a single order (mobile-friendly)
  const kotPrintOrder = (order) => {
    const isMobile = /iPhone|iPad|iPod|Android/i.test(navigator.userAgent);
    
    const htmlContent = `
      <html>
        <head>
          <meta charset="UTF-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <title>KOT Print</title>
          <style>
            * {
              margin: 0;
              padding: 0;
              box-sizing: border-box;
            }
            @page {
              size: 80mm 120mm;
              margin: 0;
              padding: 0;
            }
            body {
              width: 100%;
              max-width: 80mm;
              font-family: 'Courier New', Courier, monospace;
              font-size: 11px;
              padding: 5mm;
              background: white;
              margin: 0;
            }
            @media print {
              @page {
                size: 80mm 120mm;
                margin: 0;
              }
              body {
                width: 80mm;
                height: auto;
                margin: 0;
                padding: 5mm;
              }
              * {
                -webkit-print-color-adjust: exact !important;
                print-color-adjust: exact !important;
              }
            }
            table {
              width: 100%;
              border-collapse: collapse;
              margin: 3mm 0;
            }
            th, td {
              border-bottom: 1px dashed #000;
              padding: 1.5mm 2mm;
              text-align: left;
              font-size: 10px;
            }
            th {
              font-weight: bold;
            }
            h2 {
              font-size: 14px;
              margin: 2mm 0 3mm 0;
              text-align: center;
              font-weight: bold;
            }
            .divider {
              border-top: 2px dashed #000;
              margin: 2mm 0;
            }
            .label {
              font-weight: bold;
              width: 30%;
              display: inline-block;
            }
            .info-row {
              margin: 1mm 0;
              font-size: 10px;
              word-wrap: break-word;
              overflow-wrap: break-word;
            }
          </style>
        </head>
        <body>
          <h2>KOT</h2>
          <div class="divider"></div>
          <div class="info-row"><span class="label">Order ID:</span> ${order._id?.slice(-6) || 'N/A'}</div>
          <div class="info-row"><span class="label">Customer:</span> ${order.customer?.name || 'N/A'}</div>
          <div class="divider"></div>
          <table>
            <tr>
              <th style="width: 50%">Item</th>
              <th style="width: 25%">Qty</th>
              <th style="width: 25%">Unit</th>
            </tr>
            ${order.items?.map(item => `<tr><td>${item.itemName || 'N/A'}</td><td>${item.qty || 0}</td><td>${item.unit || '-'}</td></tr>`).join('')}
          </table>
          <div class="divider"></div>
          <div style="text-align: center; font-size: 9px; margin-top: 2mm;">
            ${new Date().toLocaleString()}
          </div>
        </body>
      </html>
    `;
    
    if (isMobile) {
      // Mobile: Use blob approach
      const blob = new Blob([htmlContent], { type: 'text/html' });
      const url = URL.createObjectURL(blob);
      const printWindow = window.open(url, '_blank');
      
      if (printWindow) {
        printWindow.onload = () => {
          setTimeout(() => {
            printWindow.focus();
            printWindow.print();
            printWindow.onafterprint = () => {
              URL.revokeObjectURL(url);
              printWindow.close();
            };
          }, 300);
        };
      } else {
        alert('Please enable pop-ups to print.');
      }
    } else {
      // Desktop: Use traditional approach
      const printWindow = window.open('', '', 'width=350,height=600');
      if (printWindow) {
        printWindow.document.write(htmlContent);
        printWindow.document.close();
        setTimeout(() => {
          printWindow.focus();
          printWindow.print();
        }, 250);
      }
    }
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
      printWindow.document.write(`<tr><td>${item.itemName}</td><td>${item.qty}</td><td>$${item.price}</td></tr>`);
    });
    printWindow.document.write('</table>');
    printWindow.document.write(`<p><strong>Total:</strong> $${order.total}</p>`);
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
                  <td style={thTdStyle} data-label="Order ID">{order._id}</td>
                  <td style={thTdStyle} data-label="Customer Name">{order.customer.name}</td>
                  <td style={thTdStyle} data-label="Mobile">{order.customer.mobile}</td>
                  <td style={thTdStyle} data-label="Items">
                    {order.items.map((item, index) => (
                      <div key={index}>{item.qty} x {item.itemName}</div>
                    ))}
                  </td>
                  <td style={thTdStyle} data-label="Category">
                    {order.items.map((item, index) => (
                      <div key={index}>{item.category || ''}</div>
                    ))}
                  </td>
                  <td style={thTdStyle} data-label="Amount">
                    {order.items.map((item, index) => (
                      <div key={index}>${(item.qty * item.price).toFixed(2)}</div>
                    ))}
                  </td>
                  <td style={thTdStyle} data-label="Total">${order.total}</td>
                  <td style={thTdStyle} data-label="Status">{order.status}</td>
                  <td style={thTdStyle} data-label="Created">{new Date(order.createdAt).toLocaleString()}</td>
                  <td style={thTdStyle} data-label="Actions">
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