import { useEffect, useState } from "react";
import axios from "axios";
import API_ENDPOINTS from "../config";
import "./InstantOrdersTable.css";

function InstantOrdersTable() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState("All");

  useEffect(() => {
    fetchInstantOrders();
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
    <div style={{ padding: "20px", maxWidth: "1200px", margin: "0 auto" }}>
      <h2>📋 Instant Orders</h2>

      <div style={{ marginBottom: "20px", display: "flex", gap: "10px", flexWrap: "wrap" }}>
        <button 
          onClick={() => setFilter("All")} 
          style={{ padding: "8px 16px", background: filter === "All" ? "#007bff" : "#e0e0e0", color: filter === "All" ? "white" : "black", border: "none", borderRadius: "4px", cursor: "pointer" }}
        >
          All ({orders.length})
        </button>
        {["Placed", "Preparing", "Ready", "Delivered"].map(status => (
          <button 
            key={status}
            onClick={() => setFilter(status)} 
            style={{ padding: "8px 16px", background: filter === status ? "#007bff" : "#e0e0e0", color: filter === status ? "white" : "black", border: "none", borderRadius: "4px", cursor: "pointer" }}
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
        <div style={{ overflowX: "auto" }}>
          <table style={{ width: "100%", borderCollapse: "collapse", background: "white", boxShadow: "0 2px 4px rgba(0,0,0,0.1)", borderRadius: "8px", overflow: "hidden" }}>
            <thead>
              <tr style={{ background: "#f5f5f5", borderBottom: "2px solid #ddd" }}>
                <th style={{ padding: "12px", textAlign: "left" }}>Customer</th>
                <th style={{ padding: "12px", textAlign: "left" }}>Mobile</th>
                <th style={{ padding: "12px", textAlign: "center" }}>Items</th>
                <th style={{ padding: "12px", textAlign: "right" }}>Total</th>
                <th style={{ padding: "12px", textAlign: "center" }}>Status</th>
                <th style={{ padding: "12px", textAlign: "center" }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredOrders.map(order => (
                <tr key={order._id} style={{ borderBottom: "1px solid #eee", hover: { background: "#f9f9f9" } }}>
                  <td style={{ padding: "12px" }}>{order.customerName}</td>
                  <td style={{ padding: "12px" }}>{order.mobile}</td>
                  <td style={{ padding: "12px", textAlign: "center" }}>{order.items?.length || 0}</td>
                  <td style={{ padding: "12px", textAlign: "right" }}>₹{order.total?.toFixed(2) || "0.00"}</td>
                  <td style={{ padding: "12px", textAlign: "center" }}>
                    <select 
                      value={order.status} 
                      onChange={(e) => updateOrderStatus(order._id, e.target.value)}
                      style={{ padding: "6px 10px", borderRadius: "4px", border: "1px solid #ddd", background: "white", cursor: "pointer" }}
                    >
                      <option>Placed</option>
                      <option>Preparing</option>
                      <option>Ready</option>
                      <option>Delivered</option>
                    </select>
                  </td>
                  <td style={{ padding: "12px", textAlign: "center" }}>
                    <button 
                      onClick={() => deleteOrder(order._id)}
                      style={{ padding: "6px 12px", background: "#ff4444", color: "white", border: "none", borderRadius: "4px", cursor: "pointer" }}
                    >
                      Delete
                    </button>
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

export default InstantOrdersTable;
