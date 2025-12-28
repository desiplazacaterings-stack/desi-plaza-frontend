import { useState, useEffect } from "react";
import axios from "axios";
import API_ENDPOINTS from "../config";
import "./Payments.css";

// Helper function to round amounts to nearest rupee
const roundAmount = (amount) => Math.round((amount || 0) * 100) / 100;

function Payments() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [paymentAmount, setPaymentAmount] = useState("");
  const [selectedOrderId, setSelectedOrderId] = useState(null);
  const [paymentNotes, setPaymentNotes] = useState("");
  const [filterStatus, setFilterStatus] = useState("pending");

  useEffect(() => {
    const fetchOrders = async () => {
      try {
        setLoading(true);
        const response = await axios.get(API_ENDPOINTS.ORDERS.GET_ALL);
        setOrders(response.data || []);
      } catch (error) {
        console.error("Error fetching orders:", error);
        setOrders([]);
      } finally {
        setLoading(false);
      }
    };
    fetchOrders();
  }, []);

  // Filter orders based on payment status
  const getFilteredOrders = () => {
    return orders.filter(order => {
      if (filterStatus === "pending") {
        return order.paymentStatus === "Pending" || order.paymentStatus === "Partial";
      } else if (filterStatus === "paid") {
        return order.paymentStatus === "Paid";
      }
      return true;
    });
  };

  const handlePaymentSubmit = async (orderId) => {
    if (!paymentAmount || isNaN(paymentAmount) || parseFloat(paymentAmount) <= 0) {
      alert("Please enter a valid payment amount");
      return;
    }

    const order = orders.find(o => o._id === orderId);
    if (!order) return;

    try {
      const amountReceived = roundAmount((order.amountReceived || 0) + parseFloat(paymentAmount));
      
      const response = await axios.patch(
        `${API_ENDPOINTS.ORDERS.BASE}/${orderId}`,
        {
          amountReceived: amountReceived,
          paymentNotes: paymentNotes
        }
      );

      setOrders(orders.map(o => o._id === orderId ? response.data : o));
      setPaymentAmount("");
      setPaymentNotes("");
      setSelectedOrderId(null);
      alert("Payment recorded successfully!");
    } catch (error) {
      console.error("Error recording payment:", error);
      alert("Error recording payment");
    }
  };

  const calculateBalanceDue = (order) => {
    const total = roundAmount(order.totalAmount || 0);
    const received = roundAmount(order.amountReceived || 0);
    return Math.max(0, total - received);
  };

  const filteredOrders = getFilteredOrders();

  if (loading) {
    return <div className="loading">Loading payments...</div>;
  }

  return (
    <div className="payments-container">
      <h1>💳 Payment Tracking</h1>
      
      {/* Filter Tabs */}
      <div className="payment-filters">
        <button
          className={`filter-btn ${filterStatus === "pending" ? "active" : ""}`}
          onClick={() => setFilterStatus("pending")}
        >
          ⏳ Pending ({orders.filter(o => o.paymentStatus === "Pending" || o.paymentStatus === "Partial").length})
        </button>
        <button
          className={`filter-btn ${filterStatus === "paid" ? "active" : ""}`}
          onClick={() => setFilterStatus("paid")}
        >
          ✓ Paid ({orders.filter(o => o.paymentStatus === "Paid").length})
        </button>
        <button
          className={`filter-btn ${filterStatus === "all" ? "active" : ""}`}
          onClick={() => setFilterStatus("all")}
        >
          📊 All ({orders.length})
        </button>
      </div>

      {/* Payments Table */}
      {filteredOrders.length === 0 ? (
        <div className="no-data">
          {filterStatus === "paid" ? "No paid payments" : "No pending payments"}
        </div>
      ) : (
        <div className="payments-table-wrapper">
          <table className="payments-table">
            <thead>
              <tr>
                <th>Order ID</th>
                <th>Customer</th>
                <th>Event Date</th>
                <th>Total Amount</th>
                <th>Amount Received</th>
                <th>Balance Due</th>
                <th>Status</th>
                <th>Action</th>
              </tr>
            </thead>
            <tbody>
              {filteredOrders.map(order => {
                const balanceDue = calculateBalanceDue(order);
                return (
                  <tr key={order._id}>
                    <td className="order-id">{order._id?.substring(0, 8) || "N/A"}...</td>
                    <td>{order.customerName || "N/A"}</td>
                    <td>{order.eventDate ? new Date(order.eventDate).toLocaleDateString() : "N/A"}</td>
                    <td className="amount">${roundAmount(order.totalAmount).toLocaleString()}</td>
                    <td className="amount-received">${roundAmount(order.amountReceived).toLocaleString()}</td>
                    <td className="balance-due">
                      <span className={balanceDue > 0 ? "warning" : "success"}>
                        ${roundAmount(balanceDue).toLocaleString()}
                      </span>
                    </td>
                    <td>
                      <span className={`status-badge ${order.paymentStatus?.toLowerCase() || "pending"}`}>
                        {order.paymentStatus || "Pending"}
                      </span>
                    </td>
                    <td>
                      {balanceDue > 0 && (
                        <button
                          className="add-payment-btn"
                          onClick={() => setSelectedOrderId(selectedOrderId === order._id ? null : order._id)}
                          title="Add Payment"
                        >
                          💰 Add Payment
                        </button>
                      )}
                      {balanceDue === 0 && (
                        <span className="paid-badge">✓ Paid</span>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}

      {/* Payment Entry Form */}
      {selectedOrderId && (
        <div className="payment-entry-form">
          <div className="form-header">
            <h3>💳 Record Payment</h3>
            <button
              className="close-btn"
              onClick={() => {
                setSelectedOrderId(null);
                setPaymentAmount("");
                setPaymentNotes("");
              }}
              title="Close"
            >
              ✕
            </button>
          </div>

          {(() => {
            const order = orders.find(o => o._id === selectedOrderId);
            if (!order) return null;
            
            const balanceDue = calculateBalanceDue(order);

            return (
              <div className="form-content">
                <div className="order-summary">
                  <div className="summary-item">
                    <span className="label">Order ID:</span>
                    <span className="value">{order._id?.substring(0, 12)}...</span>
                  </div>
                  <div className="summary-item">
                    <span className="label">Customer:</span>
                    <span className="value">{order.customerName || "N/A"}</span>
                  </div>
                  <div className="summary-item">
                    <span className="label">Total Amount:</span>
                    <span className="value">${roundAmount(order.totalAmount).toLocaleString()}</span>
                  </div>
                  <div className="summary-item">
                    <span className="label">Amount Received:</span>
                    <span className="value">${roundAmount(order.amountReceived).toLocaleString()}</span>
                  </div>
                  <div className="summary-item highlight">
                    <span className="label">Balance Due:</span>
                    <span className="value balance">${roundAmount(balanceDue).toLocaleString()}</span>
                  </div>
                </div>

                <form
                  onSubmit={(e) => {
                    e.preventDefault();
                    handlePaymentSubmit(selectedOrderId);
                  }}
                >
                  <div className="form-group">
                    <label htmlFor="paymentAmount">Payment Amount *</label>
                    <input
                      id="paymentAmount"
                      type="number"
                      min="0"
                      step="0.01"
                      value={paymentAmount}
                      onChange={(e) => setPaymentAmount(e.target.value)}
                      placeholder={`Enter amount (Max: $${roundAmount(balanceDue)})`}
                      max={roundAmount(balanceDue)}
                      required
                    />
                    {paymentAmount && (
                      <div className="hint">
                        {parseFloat(paymentAmount) > roundAmount(balanceDue) && (
                          <span className="warning">⚠️ Amount exceeds balance due</span>
                        )}
                        {parseFloat(paymentAmount) <= roundAmount(balanceDue) && parseFloat(paymentAmount) > 0 && (
                          <span className="success">✓ New balance will be: ${roundAmount(balanceDue - parseFloat(paymentAmount)).toLocaleString()}</span>
                        )}
                      </div>
                    )}
                  </div>

                  <div className="form-group">
                    <label htmlFor="paymentNotes">Payment Notes</label>
                    <textarea
                      id="paymentNotes"
                      value={paymentNotes}
                      onChange={(e) => setPaymentNotes(e.target.value)}
                      placeholder="Add notes (optional) - e.g., Cheque No., Transaction ID, etc."
                      rows="3"
                    />
                  </div>

                  <div className="form-actions">
                    <button type="submit" className="submit-btn">
                      ✓ Record Payment
                    </button>
                    <button
                      type="button"
                      className="cancel-btn"
                      onClick={() => {
                        setSelectedOrderId(null);
                        setPaymentAmount("");
                        setPaymentNotes("");
                      }}
                    >
                      ✕ Cancel
                    </button>
                  </div>
                </form>
              </div>
            );
          })()}
        </div>
      )}
    </div>
  );
}

export default Payments;
