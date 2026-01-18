import { useEffect, useState } from "react";
import axios from "axios";
import API_ENDPOINTS from "../config";
import usePagination from "../hooks/usePagination";
import Pagination from "../components/Pagination";
import "./InstantOrdersTable.css";

function InstantOrdersTable() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState("All");
  const [permissions, setPermissions] = useState({});
  const [userRole, setUserRole] = useState(null);

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
      const response = await axios.get(API_ENDPOINTS.ORDERS.GET_ALL);
      // Filter only Instant orders
      const instantOrders = response.data.filter(order => order.orderType === "Instant");
      setOrders(instantOrders);
    } catch (err) {
      console.error("Error fetching instant orders:", err);
      alert("Failed to fetch instant orders");
    } finally {
      setLoading(false);
    }
  };

  const filteredOrders = filter === "All" 
    ? orders 
    : orders.filter(order => order.status === filter);

  const pagination = usePagination(filteredOrders);

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
        {["Placed", "Preparing", "Ready", "Delivered"].map(status => (
          <button 
            key={status}
            onClick={() => setFilter(status)}
            className={filter === status ? "active" : ""}
          >
            {status} ({orders.filter(o => o.status === status).length})
          </button>
        ))}
      </div>

      {loading ? (
        <p>Loading orders...</p>
      ) : filteredOrders.length === 0 ? (
        <p style={{ textAlign: "center", color: "#888" }}>No instant orders found</p>
      ) : (
        <table className="instant-orders-table">
          <thead>
            <tr>
              <th>Customer</th>
              <th>Mobile</th>
              <th>Items</th>
              <th>Total</th>
              <th>Status</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {pagination.currentItems.map(order => (
              <tr key={order._id}>
                <td>{order.customerName}</td>
                <td>{order.mobile}</td>
                <td style={{ textAlign: "center" }}>{order.items?.length || 0}</td>
                <td style={{ textAlign: "right" }}>${order.total?.toFixed(2) || "0.00"}</td>
                <td style={{ textAlign: "center" }}>
                  {permissions.canEditInstantOrder ? (
                    <select 
                      value={order.status} 
                      onChange={(e) => updateOrderStatus(order._id, e.target.value)}
                    >
                      <option>Placed</option>
                      <option>Preparing</option>
                      <option>Ready</option>
                      <option>Delivered</option>
                    </select>
                  ) : (
                    <select 
                      value={order.status}
                      disabled
                      title="You don't have permission to edit order status"
                    >
                      <option>{order.status}</option>
                    </select>
                  )}
                </td>
                <td style={{ textAlign: "center" }}>
                  {permissions.canDeleteInstantOrder ? (
                    <button 
                      onClick={() => deleteOrder(order._id)}
                    >
                      ✕ Delete
                    </button>
                  ) : (
                    <button 
                      disabled
                      title="You don't have permission to delete orders"
                    >
                      ✕ Delete
                    </button>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}

      <Pagination 
        currentPage={pagination.currentPage}
        totalPages={pagination.totalPages}
        totalItems={pagination.totalItems}
        onPageChange={pagination.goToPage}
      />
    </div>
  );
}

export default InstantOrdersTable;
