import { useState, useEffect } from "react";
import axios from "axios";
import API_ENDPOINTS from "../config";
import usePagination from "../hooks/usePagination";
import Pagination from "../components/Pagination";
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
  const [searchTerm, setSearchTerm] = useState("");
  const [permissions, setPermissions] = useState({});
  const [userRole, setUserRole] = useState(null);
  const [showShortCloseModal, setShowShortCloseModal] = useState(false);
  const [selectedOrderForShortClose, setSelectedOrderForShortClose] = useState(null);
  const [shortCloseAmount, setShortCloseAmount] = useState("");
  const [shortCloseReason, setShortCloseReason] = useState("");

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
          setPermissions({ canRecordPayment: true });
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

  // Filter orders based on payment status and search term
  const getFilteredOrders = () => {
    return orders.filter(order => {
      // Status filter
      let statusMatch = true;
      if (filterStatus === "pending") {
        statusMatch = order.paymentStatus === "Pending" || order.paymentStatus === "Partial";
      } else if (filterStatus === "paid") {
        statusMatch = order.paymentStatus === "Paid";
      }
      
      // Search filter
      const searchLower = searchTerm.toLowerCase();
      const searchMatch = 
        (order._id && order._id.toLowerCase().includes(searchLower)) ||
        (order.customerName && order.customerName.toLowerCase().includes(searchLower));
      
      return statusMatch && (searchTerm === "" || searchMatch);
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

  const handleShortClose = async () => {
    if (!selectedOrderForShortClose) return;

    if (!shortCloseAmount || isNaN(shortCloseAmount) || parseFloat(shortCloseAmount) < 0) {
      alert("Please enter a valid final amount");
      return;
    }

    const finalAmount = parseFloat(shortCloseAmount);
    const totalAmount = selectedOrderForShortClose.totalAmount || 0;

    if (finalAmount > totalAmount) {
      alert("Final amount cannot exceed total event amount");
      return;
    }

    try {
      const response = await axios.patch(
        API_ENDPOINTS.ORDERS.SHORT_CLOSE(selectedOrderForShortClose._id),
        {
          finalAmount: finalAmount,
          reason: shortCloseReason
        }
      );

      setOrders(orders.map(o => o._id === selectedOrderForShortClose._id ? response.data.order : o));
      setShowShortCloseModal(false);
      setSelectedOrderForShortClose(null);
      setShortCloseAmount("");
      setShortCloseReason("");
      alert("Event short closed successfully!");
    } catch (error) {
      console.error("Error short closing event:", error);
      alert("Error short closing event");
    }
  };

  const calculateBalanceDue = (order) => {
    const total = roundAmount(order.totalAmount || 0);
    const received = roundAmount(order.amountReceived || 0);
    return Math.max(0, total - received);
  };

  const filteredOrders = getFilteredOrders();
  const pagination = usePagination(filteredOrders, 15);

  // Reset to page 1 when search term or filter changes
  useEffect(() => {
    pagination.goToPage(1);
  }, [searchTerm, filterStatus]);

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

      {/* Search Bar */}
      <div style={{ marginBottom: '20px', display: 'flex', gap: '10px', alignItems: 'center' }}>
        <input
          type="text"
          placeholder="🔍 Search by customer name or order ID..."
          value={searchTerm}
          onChange={(e) => {
            setSearchTerm(e.target.value);
          }}
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
            onClick={() => {
              setSearchTerm("");
            }}
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

      {/* Payments Table */}
      {filteredOrders.length === 0 ? (
        <div className="no-data">
          {filterStatus === "paid" ? "No paid payments" : "No pending payments"}
        </div>
      ) : (
        <>
          <div className="payments-table-wrapper">
          <table className="payments-table">
            <thead>
              <tr>
                <th>Order ID</th>
                <th>Customer</th>
                <th>Type</th>
                <th>Event Date</th>
                <th>Total Amount</th>
                <th>Amount Received</th>
                <th>Balance Due</th>
                <th>Status</th>
                <th>Action</th>
              </tr>
            </thead>
            <tbody>
              {pagination.currentItems.map(order => {
                const balanceDue = calculateBalanceDue(order);
                return (
                  <tr key={order._id}>
                    <td className="order-id" data-label="Order ID">{order._id?.substring(0, 8) || "N/A"}...</td>
                    <td data-label="Customer">{order.customerName || "N/A"}</td>
                    <td data-label="Type">
                      <span style={{
                        padding: '4px 10px',
                        borderRadius: '4px',
                        fontSize: '0.85rem',
                        fontWeight: '600',
                        backgroundColor: order.orderType === 'Event' ? '#e8f5e9' : '#f3e5f5',
                        color: order.orderType === 'Event' ? '#2e7d32' : '#6a1b9a'
                      }}>
                        {order.orderType || 'Event'}
                      </span>
                    </td>
                    <td data-label="Event Date">{order.eventDate ? new Date(order.eventDate).toLocaleDateString() : "N/A"}</td>
                    <td className="amount" data-label="Total Amount">${roundAmount(order.totalAmount).toLocaleString()}</td>
                    <td className="amount-received" data-label="Amount Received">${roundAmount(order.amountReceived).toLocaleString()}</td>
                    <td className="balance-due" data-label="Balance Due">
                      <span className={balanceDue > 0.01 ? "warning" : "success"}>
                        ${balanceDue > 0.01 ? roundAmount(balanceDue).toLocaleString() : '0'}
                      </span>
                    </td>
                    <td data-label="Status">
                      <span className={`status-badge ${order.paymentStatus?.toLowerCase() || "pending"}`}>
                        {order.paymentStatus || "Pending"}
                      </span>
                    </td>
                    <td data-label="Action">
                      {balanceDue > 0 && (
                        <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                          <button
                            className="add-payment-btn"
                            onClick={() => setSelectedOrderId(selectedOrderId === order._id ? null : order._id)}
                            title="Add Payment"
                          >
                            💰 Add Payment
                          </button>
                          <button
                            className="short-close-btn"
                            onClick={() => {
                              setSelectedOrderForShortClose(order);
                              setShortCloseAmount(roundAmount(order.amountReceived || 0).toString());
                              setShowShortCloseModal(true);
                            }}
                            title="Short Close Event"
                            style={{
                              padding: '8px 12px',
                              backgroundColor: '#ffc107',
                              color: '#000',
                              border: 'none',
                              borderRadius: '4px',
                              cursor: 'pointer',
                              fontWeight: '600',
                              fontSize: '0.9em'
                            }}
                          >
                            🔑 Short Close
                          </button>
                        </div>
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

          {/* Pagination */}
          {filteredOrders.length > 0 && (
            <div style={{ marginTop: '20px' }}>
              <Pagination 
                currentPage={pagination.currentPage}
                totalPages={pagination.totalPages}
                totalItems={pagination.totalItems}
                itemsPerPage={pagination.itemsPerPage}
                onPageChange={pagination.goToPage}
              />
            </div>
          )}
        </>
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
                    <span className="value balance">${balanceDue > 0.01 ? roundAmount(balanceDue).toLocaleString() : '0'}</span>
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
                    {permissions.canRecordPayment ? (
                      <button type="submit" className="submit-btn">
                        ✓ Record Payment
                      </button>
                    ) : (
                      <button 
                        type="button"
                        className="submit-btn" 
                        style={{ opacity: 0.5, cursor: 'not-allowed', background: '#ccc' }} 
                        disabled 
                        title="You don't have permission to record payments"
                      >
                        ✓ Record Payment
                      </button>
                    )}
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

      {/* Short Close Modal */}
      {showShortCloseModal && selectedOrderForShortClose && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundColor: 'rgba(0,0,0,0.5)',
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          zIndex: 1001
        }}>
          <div style={{
            backgroundColor: '#fff',
            padding: '30px',
            borderRadius: '8px',
            maxWidth: '450px',
            boxShadow: '0 4px 20px rgba(0,0,0,0.3)'
          }}>
            <h3 style={{ marginTop: 0, marginBottom: '20px' }}>🔑 Short Close Event</h3>
            
            <div style={{ backgroundColor: '#f9f9f9', padding: '15px', borderRadius: '6px', marginBottom: '20px' }}>
              <div style={{ marginBottom: '10px' }}>
                <strong>Customer:</strong> {selectedOrderForShortClose.customerName}
              </div>
              <div style={{ marginBottom: '10px' }}>
                <strong>Total Amount:</strong> ${roundAmount(selectedOrderForShortClose.totalAmount).toLocaleString()}
              </div>
              <div style={{ marginBottom: '10px' }}>
                <strong>Already Received:</strong> ${roundAmount(selectedOrderForShortClose.amountReceived).toLocaleString()}
              </div>
              <div style={{ color: '#e74c3c', fontWeight: '600' }}>
                <strong>Short Close Amount:</strong> ${roundAmount((selectedOrderForShortClose.totalAmount || 0) - parseFloat(shortCloseAmount || 0)).toLocaleString()}
              </div>
            </div>

            <div style={{ marginBottom: '15px' }}>
              <label style={{ display: 'block', marginBottom: '8px', fontWeight: '600' }}>
                Final Amount to Accept (₹):
              </label>
              <input
                type="number"
                value={shortCloseAmount}
                onChange={(e) => setShortCloseAmount(e.target.value)}
                placeholder="Enter final amount"
                style={{
                  width: '100%',
                  padding: '10px',
                  border: '1px solid #ddd',
                  borderRadius: '4px',
                  boxSizing: 'border-box',
                  fontSize: '1em'
                }}
              />
            </div>

            <div style={{ marginBottom: '15px' }}>
              <label style={{ display: 'block', marginBottom: '8px', fontWeight: '600' }}>
                Reason for Short Close (Optional):
              </label>
              <textarea
                value={shortCloseReason}
                onChange={(e) => setShortCloseReason(e.target.value)}
                placeholder="Enter reason..."
                style={{
                  width: '100%',
                  padding: '10px',
                  border: '1px solid #ddd',
                  borderRadius: '4px',
                  boxSizing: 'border-box',
                  fontFamily: 'inherit',
                  minHeight: '80px'
                }}
              />
            </div>

            <div style={{ display: 'flex', gap: '10px', justifyContent: 'flex-end' }}>
              <button
                onClick={() => {
                  setShowShortCloseModal(false);
                  setSelectedOrderForShortClose(null);
                  setShortCloseAmount("");
                  setShortCloseReason("");
                }}
                style={{
                  padding: '10px 20px',
                  backgroundColor: '#6c757d',
                  color: '#fff',
                  border: 'none',
                  borderRadius: '4px',
                  cursor: 'pointer',
                  fontWeight: '600'
                }}
              >
                Cancel
              </button>
              <button
                onClick={handleShortClose}
                style={{
                  padding: '10px 20px',
                  backgroundColor: '#ffc107',
                  color: '#000',
                  border: 'none',
                  borderRadius: '4px',
                  cursor: 'pointer',
                  fontWeight: '600'
                }}
              >
                ✓ Short Close Event
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default Payments;
