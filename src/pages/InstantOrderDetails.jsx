import React, { useState, useEffect } from "react";
import axios from "axios";
import API_ENDPOINTS from "../config";
import { useNavigate } from "react-router-dom";
import usePagination from "../hooks/usePagination";
import Pagination from "../components/Pagination";
import "./InstantOrderDetails.css";

function InstantOrderDetails() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [search, setSearch] = useState("");
  const navigate = useNavigate();

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

  const getOrderTotal = (order) => {
    // Return totalAmount if available, otherwise try total, otherwise calculate from items
    if (order.totalAmount && order.totalAmount > 0) {
      return order.totalAmount;
    }
    if (order.total && order.total > 0) {
      return order.total;
    }
    // Fallback: calculate from items
    if (order.items && Array.isArray(order.items)) {
      return order.items.reduce((sum, item) => {
        return sum + ((item.price || 0) * (item.qty || 0));
      }, 0);
    }
    return 0;
  };

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
      console.log('Fetched orders:', instantOrders);
      instantOrders.forEach(order => {
        console.log(`Order ${order._id}: totalAmount=${order.totalAmount}, total=${order.total}, items=${order.items?.length}`);
      });
      setOrders(instantOrders);
    } catch (err) {
      setError('Failed to fetch orders');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const deleteOrder = async (orderId) => {
    if (window.confirm('Are you sure you want to delete this order?')) {
      try {
        const token = localStorage.getItem('token');
        await axios.delete(API_ENDPOINTS.ORDERS.DELETE(orderId), {
          headers: { Authorization: `Bearer ${token}` }
        });
        setOrders(orders.filter(order => order._id !== orderId));
        alert('✅ Order deleted successfully');
      } catch (err) {
        console.error(err);
        alert('❌ Failed to delete order');
      }
    }
  };

  const editOrder = (orderId) => {
    navigate(`/instantorder/edit/${orderId}`);
  };

  if (loading) return <div className="instant-orders-loading">Loading instant orders...</div>;
  if (error) return <div className="instant-orders-error">{error}</div>;

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
    order.customerName.toLowerCase().includes(search.toLowerCase())
  );

  // Setup pagination with 15 orders per page
  const pagination = usePagination(filteredOrders, 15);

  return (
    <div className="instant-orders-container">
      <div className="instant-orders-header">
        <h2>📦 Instant Orders</h2>
        <div className="instant-orders-search-group">
          <input
            type="text"
            placeholder="Search by customer name..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="instant-orders-search-input"
          />
          <button onClick={() => window.print()} className="instant-orders-print-btn">🖨️ Print All</button>
        </div>
      </div>
      {filteredOrders.length === 0 ? (
        <div className="instant-orders-empty">No instant orders found.</div>
      ) : (
        <div className="instant-orders-table-wrapper">
          <table className="instant-orders-table">
            <thead>
              <tr>
                <th>Order ID</th>
                <th>Customer Name</th>
                <th>Mobile</th>
                <th>Items (Qty)</th>
                <th>Total Amount</th>
                <th>Payment Status</th>
                <th>Status</th>
                <th>Order Date</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {pagination.currentItems.map(order => (
                <tr key={order._id}>
                  <td data-label="Order ID">{order._id?.slice(-6) || 'N/A'}</td>
                  <td data-label="Customer Name">{order.customerName}</td>
                  <td data-label="Mobile">{order.mobile}</td>
                  <td data-label="Items (Qty)">
                    {order.items?.length || 0} item{(order.items?.length || 0) !== 1 ? 's' : ''} ({order.items?.reduce((sum, item) => sum + (item.qty || 0), 0) || 0} qty)
                  </td>
                  <td data-label="Total Amount" style={{ fontWeight: '600', color: getOrderTotal(order) > 0 ? '#2e7d32' : '#d32f2f' }}>
                    ${getOrderTotal(order).toFixed(2)}
                  </td>
                  <td data-label="Payment Status">
                    <span style={{
                      padding: '4px 8px',
                      borderRadius: '4px',
                      fontWeight: '600',
                      fontSize: '0.85rem',
                      backgroundColor: order.paymentStatus === 'Paid' ? '#e8f5e9' : order.paymentStatus === 'Partial' ? '#fff3e0' : '#ffebee',
                      color: order.paymentStatus === 'Paid' ? '#2e7d32' : order.paymentStatus === 'Partial' ? '#e65100' : '#c62828'
                    }}>
                      {order.paymentStatus || 'Pending'}
                    </span>
                  </td>
                  <td data-label="Status"><strong>{order.status}</strong></td>
                  <td data-label="Order Date">{new Date(order.createdAt).toLocaleDateString('en-IN')}</td>
                  <td data-label="Actions">
                    <div className="instant-order-actions">
                      <button className="instant-order-btn instant-order-btn-print" onClick={() => printOrder(order)}>🖨️ Print</button>
                      <button className="instant-order-btn instant-order-btn-kot" onClick={() => kotPrintOrder(order)}>🧾 KOT</button>
                      <button className="instant-order-btn instant-order-btn-edit" onClick={() => editOrder(order._id)}>✏️ Edit</button>
                      <button className="instant-order-btn instant-order-btn-delete" onClick={() => deleteOrder(order._id)}>🗑️ Delete</button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {filteredOrders.length > 0 && (
        <Pagination 
          currentPage={pagination.currentPage}
          totalPages={pagination.totalPages}
          totalItems={pagination.totalItems}
          itemsPerPage={pagination.itemsPerPage}
          onPageChange={pagination.goToPage}
        />
      )}
    </div>
  );
}

export default InstantOrderDetails;