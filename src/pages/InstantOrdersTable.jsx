import { useEffect, useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import API_ENDPOINTS from "../config";
import usePagination from "../hooks/usePagination";
import Pagination from "../components/Pagination";
import * as XLSX from 'xlsx';
import "./InstantOrdersTable.css";

function InstantOrdersTable() {
  const navigate = useNavigate();
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState("All");
  const [permissions, setPermissions] = useState({});
  const [userRole, setUserRole] = useState(null);
  const [expandedOrderId, setExpandedOrderId] = useState(null);
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [searchTerm, setSearchTerm] = useState("");

  useEffect(() => {
    fetchInstantOrders();
  }, []);

  // Fetch user permissions
  useEffect(() => {
    const userData = localStorage.getItem('user');
    const token = localStorage.getItem('token');
    if (userData) {
      try {
        const user = JSON.parse(userData);
        setUserRole(user.role);
        if (user.role === 'admin') {
          setPermissions({
            canEditInstantOrder: true,
            canDeleteInstantOrder: true
          });
        } else if (user.role === 'staff' && user._id && token) {
          axios.get(API_ENDPOINTS.ADMIN.GET_PERMISSIONS(user._id), {
            headers: { Authorization: `Bearer ${token}` }
          })
            .then(res => setPermissions(res.data.data.customPermissions || {}))
            .catch(err => {
              console.error("Error fetching permissions:", err);
              setPermissions({});
            });
        }
      } catch (error) {
        console.error('Error parsing user data:', error);
      }
    }
  }, []);

  const fetchInstantOrders = async () => {
    try {
      setLoading(true);
      console.log('🔄 Fetching instant orders from backend...');
      const response = await axios.get(API_ENDPOINTS.ORDERS.GET_ALL);
      console.log('📦 Raw response from backend:', response.data);
      // Filter only Instant orders
      const instantOrders = response.data.filter(order => order.orderType === "Instant");
      console.log('✅ Filtered instant orders:', instantOrders);
      console.log(`Found ${instantOrders.length} instant orders`);
      instantOrders.forEach((order, idx) => {
        console.log(`  Order ${idx + 1}: ID=${order._id}, Customer=${order.customerName}, Status=${order.status}, Amount=$${order.totalAmount || 0}`);
      });
      setOrders(instantOrders);
    } catch (err) {
      console.error("❌ Error fetching instant orders:", err);
      alert("Failed to fetch instant orders");
    } finally {
      setLoading(false);
    }
  };

  const filteredOrders = (() => {
    let result = filter === "All" 
      ? orders 
      : orders.filter(order => order.status === filter);
    
    // Add search filtering
    if (searchTerm) {
      const searchLower = searchTerm.toLowerCase();
      result = result.filter(order => 
        (order._id && order._id.toLowerCase().includes(searchLower)) ||
        (order.customerName && order.customerName.toLowerCase().includes(searchLower))
      );
    }
    
    return result;
  })();

  const pagination = usePagination(filteredOrders, 50);  // 50 orders per page

  const deleteOrder = async (id) => {
    if (window.confirm("Are you sure you want to delete this order?")) {
      try {
        await axios.delete(`${API_ENDPOINTS.ORDERS.GET_ALL}/${id}`);
        setOrders(orders.filter(order => order._id !== id));
        alert("Order deleted successfully");
      } catch (err) {
        console.error("Error deleting order:", err);
        alert("Failed to delete order");
      }
    }
  };

  const handleEdit = (order) => {
    navigate("/instantorder", { state: { orderToEdit: order } });
  };

  const updateOrderStatus = async (id, newStatus) => {
    try {
      await axios.patch(`${API_ENDPOINTS.ORDERS.GET_ALL}/${id}`, { status: newStatus });
      setOrders(orders.map(order => 
        order._id === id ? { ...order, status: newStatus } : order
      ));
      alert("Order status updated");
    } catch (err) {
      console.error("Error updating order:", err);
      alert("Failed to update order status");
    }
  };

  const exportToExcel = () => {
    // Filter orders by date range
    let ordersToExport = orders;
    
    if (startDate || endDate) {
      ordersToExport = orders.filter(order => {
        const orderDate = new Date(order.createdAt);
        const start = startDate ? new Date(startDate) : new Date('2000-01-01');
        const end = endDate ? new Date(endDate) : new Date('2099-12-31');
        
        return orderDate >= start && orderDate <= end;
      });
    }

    if (ordersToExport.length === 0) {
      alert('No orders found for the selected date range');
      return;
    }

    // Prepare data for Excel - Summary Sheet
    const summaryData = [
      ['DESI PLAZA CATERINGS - INSTANT ORDERS REPORT'],
      [],
      ['Report Generated:', new Date().toLocaleString()],
      startDate ? ['Start Date:', new Date(startDate).toLocaleDateString()] : [],
      endDate ? ['End Date:', new Date(endDate).toLocaleDateString()] : [],
      [],
      ['Total Orders:', ordersToExport.length],
      ['Total Revenue:', `$${ordersToExport.reduce((sum, o) => sum + (o.totalAmount || 0), 0).toFixed(2)}`],
      []
    ];

    // Orders detail data
    const ordersDetailData = [
      ['Order ID', 'Customer Name', 'Mobile', 'Email', 'Items Count', 'Subtotal', 'Sales Tax', 'Service Charge', 'Delivery', 'Discount', 'Total Amount', 'Advance', 'Balance', 'Status', 'Order Type', 'Payment Mode', 'Date/Time'],
      ...ordersToExport.map(order => [
        order._id,
        order.customerName,
        order.mobile,
        order.email || '',
        order.items?.length || 0,
        (order.subtotal || 0).toFixed(2),
        (order.salesTax || 0).toFixed(2),
        (order.serviceCharge || 0).toFixed(2),
        (order.deliveryCharges || 0).toFixed(2),
        (order.discount || 0).toFixed(2),
        (order.totalAmount || order.total || 0).toFixed(2),
        (order.advance || 0).toFixed(2),
        (order.balance || 0).toFixed(2),
        order.status,
        order.orderType,
        order.paymentMode || 'Not specified',
        new Date(order.createdAt).toLocaleString()
      ])
    ];

    // Create workbook and sheets
    const wb = XLSX.utils.book_new();
    
    // Summary sheet
    const summaryWs = XLSX.utils.aoa_to_sheet(summaryData);
    summaryWs['!cols'] = [
      { wch: 20 },
      { wch: 30 }
    ];
    XLSX.utils.book_append_sheet(wb, summaryWs, 'Summary');

    // Orders sheet
    const ordersWs = XLSX.utils.aoa_to_sheet(ordersDetailData);
    ordersWs['!cols'] = [
      { wch: 24 }, // Order ID
      { wch: 18 }, // Customer Name
      { wch: 14 }, // Mobile
      { wch: 20 }, // Email
      { wch: 12 }, // Items Count
      { wch: 12 }, // Subtotal
      { wch: 12 }, // Sales Tax
      { wch: 12 }, // Service Charge
      { wch: 10 }, // Delivery
      { wch: 10 }, // Discount
      { wch: 12 }, // Total Amount
      { wch: 10 }, // Advance
      { wch: 10 }, // Balance
      { wch: 12 }, // Status
      { wch: 12 }, // Order Type
      { wch: 14 }, // Payment Mode
      { wch: 20 }  // Date/Time
    ];
    XLSX.utils.book_append_sheet(wb, ordersWs, 'Orders');

    // Generate filename
    const fileName = `Instant_Orders_${startDate || 'All'}_to_${endDate || 'All'}_${new Date().getTime()}.xlsx`;
    
    // Write file
    XLSX.writeFile(wb, fileName);
    console.log(`✅ Excel file exported: ${fileName}`);
  };

  return (
    <div className="instant-orders-table-container">
      <h2>📋 Instant Orders</h2>

      <div className="instant-orders-filters">
        <button 
          onClick={() => setFilter("All")}
          className={filter === "All" ? "active" : ""}
        >
          All ({orders.length})
        </button>
        {["Pickup", "Delivery"].map(status => (
          <button 
            key={status}
            onClick={() => setFilter(status)}
            className={filter === status ? "active" : ""}
          >
            {status} ({orders.filter(o => o.status === status).length})
          </button>
        ))}
        <button 
          onClick={() => {
            console.log('🔄 Manual refresh triggered');
            fetchInstantOrders();
          }}
          style={{ marginLeft: 'auto', background: '#4CAF50', color: 'white', padding: '8px 16px', border: 'none', borderRadius: '4px', cursor: 'pointer' }}
          title="Refresh orders list"
        >
          🔄 Refresh
        </button>
      </div>

      {/* Search Bar */}
      <div style={{ marginBottom: '20px', display: 'flex', gap: '10px', alignItems: 'center' }}>
        <input
          type="text"
          placeholder="🔍 Search by customer name or order ID..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          style={{
            flex: 1,
            padding: '10px 12px',
            border: '1px solid #ddd',
            borderRadius: '6px',
            fontSize: '0.95rem',
            fontFamily: 'inherit'
          }}
        />
        {searchTerm && (
          <button
            onClick={() => setSearchTerm("")}
            style={{
              padding: '10px 16px',
              backgroundColor: '#f5ba4a',
              color: '#fff',
              border: 'none',
              borderRadius: '6px',
              cursor: 'pointer',
              fontWeight: '600',
              whiteSpace: 'nowrap'
            }}
          >
            ✕ Clear
          </button>
        )}
      </div>

      {/* Date Filter & Export Section */}
      <div className="date-export-section">
        <div className="date-inputs">
          <label>
            Start Date:
            <input 
              type="date" 
              value={startDate} 
              onChange={(e) => setStartDate(e.target.value)}
              style={{ marginLeft: '8px', padding: '8px', borderRadius: '4px', border: '1.5px solid #ddd' }}
            />
          </label>
          <label>
            End Date:
            <input 
              type="date" 
              value={endDate} 
              onChange={(e) => setEndDate(e.target.value)}
              style={{ marginLeft: '8px', padding: '8px', borderRadius: '4px', border: '1.5px solid #ddd' }}
            />
          </label>
          <button 
            onClick={() => {
              setStartDate("");
              setEndDate("");
            }}
            style={{ padding: '8px 16px', background: '#f0f0f0', border: '1.5px solid #ddd', borderRadius: '4px', cursor: 'pointer', marginLeft: '12px' }}
            title="Clear date filters"
          >
            🔃 Clear Dates
          </button>
        </div>
        <button 
          onClick={exportToExcel}
          style={{ 
            background: 'linear-gradient(135deg, #1e88e5, #1565c0)', 
            color: 'white', 
            padding: '10px 20px', 
            border: 'none', 
            borderRadius: '6px', 
            cursor: 'pointer',
            fontWeight: '600',
            fontSize: '0.95rem',
            boxShadow: '0 4px 12px rgba(30, 136, 229, 0.3)',
            transition: 'all 0.3s ease'
          }}
          title="Download orders as Excel file"
          onMouseEnter={(e) => e.target.style.transform = 'translateY(-2px)'}
          onMouseLeave={(e) => e.target.style.transform = 'translateY(0)'}
        >
          📥 Download Excel
        </button>
      </div>

      {loading ? (
        <p>Loading orders...</p>
      ) : filteredOrders.length === 0 ? (
        <p style={{ textAlign: "center", color: "#888" }}>No instant orders found</p>
      ) : (
        <div className="instant-orders-list">
          {pagination.currentItems.map(order => (
            <div key={order._id} className="order-card">
              <div 
                className="order-header"
                onClick={() => setExpandedOrderId(expandedOrderId === order._id ? null : order._id)}
                style={{ cursor: 'pointer' }}
              >
                <div className="order-summary-row">
                  <div><strong>{order.customerName}</strong></div>
                  <div>{order.mobile}</div>
                  <div>{order.items?.length || 0} items</div>
                  <div style={{ color: '#d4a574', fontWeight: 'bold' }}>
                    ${Number(order.totalAmount || order.total || 0).toFixed(2)}
                  </div>
                  <div>
                    <span className={`status-badge status-${order.status?.toLowerCase()}`}>
                      {order.status}
                    </span>
                  </div>
                  <div style={{ marginLeft: 'auto' }}>
                    {expandedOrderId === order._id ? '▼' : '▶'}
                  </div>
                </div>
              </div>

              {expandedOrderId === order._id && (
                <div className="order-details">
                  <div className="details-grid">
                    <div className="detail-section">
                      <h4>📋 Order Information</h4>
                      <p><strong>Order ID:</strong> {order._id}</p>
                      <p><strong>Date:</strong> {new Date(order.createdAt).toLocaleString()}</p>
                      <p><strong>Type:</strong> {order.orderType}</p>
                      <p><strong>Status:</strong> {order.status}</p>
                    </div>

                    <div className="detail-section">
                      <h4>👤 Customer Details</h4>
                      <p><strong>Name:</strong> {order.customerName}</p>
                      <p><strong>Mobile:</strong> {order.mobile}</p>
                      {order.email && <p><strong>Email:</strong> {order.email}</p>}
                      {order.address && <p><strong>Address:</strong> {order.address}</p>}
                    </div>

                    <div className="detail-section full-width">
                      <h4>🍽️ Items Ordered</h4>
                      <table className="items-table">
                        <thead>
                          <tr>
                            <th>Item Name</th>
                            <th>Qty</th>
                            <th>Unit</th>
                            <th>Price</th>
                            <th>Total</th>
                          </tr>
                        </thead>
                        <tbody>
                          {order.items && order.items.length > 0 ? (
                            order.items.map((item, idx) => (
                              <tr key={idx}>
                                <td>{item.itemName}</td>
                                <td style={{ textAlign: 'center' }}>{item.qty}</td>
                                <td style={{ textAlign: 'center' }}>{item.unit}</td>
                                <td style={{ textAlign: 'right' }}>${(item.price || 0).toFixed(2)}</td>
                                <td style={{ textAlign: 'right', fontWeight: 'bold' }}>
                                  ${((item.price || 0) * (item.qty || 0)).toFixed(2)}
                                </td>
                              </tr>
                            ))
                          ) : (
                            <tr><td colSpan="5" style={{ textAlign: 'center', color: '#999' }}>No items</td></tr>
                          )}
                        </tbody>
                      </table>
                    </div>

                    <div className="detail-section">
                      <h4>💰 Financial Details</h4>
                      <p><strong>Subtotal:</strong> ${(order.subtotal || 0).toFixed(2)}</p>
                      {order.salesTax > 0 && <p><strong>Sales Tax:</strong> ${order.salesTax.toFixed(2)}</p>}
                      {order.serviceCharge > 0 && <p><strong>Service Charge:</strong> ${order.serviceCharge.toFixed(2)}</p>}
                      {order.deliveryCharges > 0 && <p><strong>Delivery:</strong> ${order.deliveryCharges.toFixed(2)}</p>}
                      {order.discount > 0 && <p><strong>Discount:</strong> -${order.discount.toFixed(2)}</p>}
                      <p style={{ fontSize: '1.1em', color: '#d4a574', fontWeight: 'bold', borderTop: '1px solid #ddd', paddingTop: '8px', marginTop: '8px' }}>
                        <strong>Total:</strong> ${(order.totalAmount || order.total || 0).toFixed(2)}
                      </p>
                    </div>

                    <div className="detail-section">
                      <h4>💳 Payment</h4>
                      <p><strong>Mode:</strong> {order.paymentMode || 'Not specified'}</p>
                      <p><strong>Advance:</strong> ${(order.advance || 0).toFixed(2)}</p>
                      <p><strong>Balance Due:</strong> ${(order.balance || 0) > 0.01 ? (order.balance || 0).toFixed(2) : '0.00'}</p>
                    </div>
                  </div>

                  <div className="order-actions">
                    {permissions.canEditInstantOrder && (
                      <button 
                        className="btn-edit"
                        onClick={() => handleEdit(order)}
                      >
                        ✏️ Edit
                      </button>
                    )}
                    {permissions.canDeleteInstantOrder && (
                      <button 
                        className="btn-delete"
                        onClick={() => deleteOrder(order._id)}
                      >
                        🗑️ Delete
                      </button>
                    )}
                    <button 
                      className="btn-close"
                      onClick={() => setExpandedOrderId(null)}
                    >
                      Close
                    </button>
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      <Pagination 
        currentPage={pagination.currentPage}
        totalPages={pagination.totalPages}
        totalItems={pagination.totalItems}
        onPageChange={pagination.goToPage}
        itemsPerPage={pagination.itemsPerPage}
      />
    </div>
  );
}

export default InstantOrdersTable;
