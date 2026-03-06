import { useState, useEffect } from "react";
import axios from "axios";
import API_ENDPOINTS from "../config";
import usePagination from "../hooks/usePagination";
import Pagination from "../components/Pagination";
import "./Payments.css";
import { formatDate, getOrderDate } from "../utils/dateUtils";

// Helper function to round amounts to nearest rupee
const roundAmount = (amount) => Math.round((amount || 0) * 100) / 100;

function Payments() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [paymentAmount, setPaymentAmount] = useState("");
  const [selectedOrderId, setSelectedOrderId] = useState(null);
  const [paymentNotes, setPaymentNotes] = useState("");
  const [paymentMode, setPaymentMode] = useState("Cash");
  const [filterTab, setFilterTab] = useState("pending");
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

  // Filter orders based on filter tab and search term
  const getFilteredOrders = () => {
    return orders.filter(order => {
      // Tab filter
      let tabMatch = true;
      if (filterTab === "pending") {
        tabMatch = order.paymentStatus === "Pending" || order.paymentStatus === "Partial";
      } else if (filterTab === "instant") {
        tabMatch = order.orderType === "Instant";
      } else if (filterTab === "event") {
        tabMatch = order.orderType === "Event";
      }
      
      // Search filter
      const searchLower = searchTerm.toLowerCase();
      const searchMatch = 
        (order._id && order._id.toLowerCase().includes(searchLower)) ||
        (order.customerName && order.customerName.toLowerCase().includes(searchLower));
      
      return tabMatch && (searchTerm === "" || searchMatch);
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
          paymentStatus: amountReceived >= order.totalAmount ? "Paid" : "Partial",
          paymentMode: paymentMode,
          paymentNotes: paymentNotes
        }
      );

      setOrders(orders.map(o => o._id === orderId ? response.data : o));
      setPaymentAmount("");
      setPaymentNotes("");
      setPaymentMode("Cash");
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
  }, [searchTerm, filterTab]);

  if (loading) {
    return <div className="loading">Loading payments...</div>;
  }

  return (
    <div className="payments-container">
      <h1>💳 Payment Tracking</h1>
      
      {/* Filter Tabs */}
      <div className="payment-filters">
        <button className={`filter-btn ${filterTab === "pending" ? "active" : ""}`}
          onClick={() => setFilterTab("pending")}
        >
          ⏳ Pending Payments ({orders.filter(o => o.paymentStatus === "Pending" || o.paymentStatus === "Partial").length})
        </button>
        <button className={`filter-btn ${filterTab === "instant" ? "active" : ""}`}
          onClick={() => setFilterTab("instant")}
        >
          🛒 Instant Order Payments ({orders.filter(o => o.orderType === "Instant").length})
        </button>
        <button
          className={`filter-btn ${filterTab === "event" ? "active" : ""}`}
          onClick={() => setFilterTab("event")}
        >
          🎉 Event Orders Payments ({orders.filter(o => o.orderType === "Event").length})
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
          {filterTab === "pending" ? "No pending payments" : filterTab === "instant" ? "No instant order payments" : "No event order payments"}
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
                    <td data-label="Event Date">
                      {formatDate(getOrderDate(order))}
                    </td>
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

      {/* Payment Entry Modal */}
      {selectedOrderId && (
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
          zIndex: 1000
        }}>
          {(() => {
            const order = orders.find(o => o._id === selectedOrderId);
            if (!order) return null;
            
            const balanceDue = calculateBalanceDue(order);

            return (
              <div style={{
                backgroundColor: '#fff',
                padding: '30px',
                borderRadius: '12px',
                maxWidth: '500px',
                width: '90%',
                boxShadow: '0 8px 32px rgba(0,0,0,0.3)',
                maxHeight: '90vh',
                overflowY: 'auto'
              }}>
                <div style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  marginBottom: '24px',
                  gap: '16px'
                }}>
                  <h3 style={{ margin: 0, fontSize: '1.4rem', color: '#232a36' }}>💳 Record Payment</h3>
                  <button
                    onClick={() => {
                      setSelectedOrderId(null);
                      setPaymentAmount("");
                      setPaymentNotes("");
                      setPaymentMode("Cash");
                    }}
                    style={{
                      background: '#ef4444',
                      color: 'white',
                      border: 'none',
                      width: '36px',
                      height: '36px',
                      borderRadius: '50%',
                      fontSize: '1.2rem',
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      minWidth: '36px',
                      minHeight: '36px'
                    }}
                    title="Close"
                  >
                    ✕
                  </button>
                </div>

                {/* Order Summary */}
                <div style={{
                  background: '#f9f9f9',
                  padding: '16px',
                  borderRadius: '8px',
                  marginBottom: '24px',
                  border: '1px solid #e0e0e0'
                }}>
                  <div style={{ marginBottom: '12px', display: 'flex', justifyContent: 'space-between', fontSize: '0.95rem' }}>
                    <span style={{ fontWeight: '600', color: '#666' }}>Order ID:</span>
                    <span style={{ fontWeight: '700', color: '#232a36' }}>{order._id?.substring(0, 12)}...</span>
                  </div>
                  <div style={{ marginBottom: '12px', display: 'flex', justifyContent: 'space-between', fontSize: '0.95rem' }}>
                    <span style={{ fontWeight: '600', color: '#666' }}>Customer:</span>
                    <span style={{ fontWeight: '700', color: '#232a36' }}>{order.customerName || "N/A"}</span>
                  </div>
                  <div style={{ marginBottom: '12px', display: 'flex', justifyContent: 'space-between', fontSize: '0.95rem' }}>
                    <span style={{ fontWeight: '600', color: '#666' }}>Total Amount:</span>
                    <span style={{ fontWeight: '700', color: '#232a36' }}>${roundAmount(order.totalAmount).toLocaleString()}</span>
                  </div>
                  <div style={{ marginBottom: '12px', display: 'flex', justifyContent: 'space-between', fontSize: '0.95rem' }}>
                    <span style={{ fontWeight: '600', color: '#666' }}>Amount Received:</span>
                    <span style={{ fontWeight: '700', color: '#232a36' }}>${roundAmount(order.amountReceived).toLocaleString()}</span>
                  </div>
                  <div style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    fontSize: '0.95rem',
                    background: 'linear-gradient(135deg, #fef3c7 0%, #fef08a 100%)',
                    padding: '12px',
                    borderRadius: '6px',
                    borderLeft: '4px solid #f59e0b'
                  }}>
                    <span style={{ fontWeight: '600', color: '#666' }}>Balance Due:</span>
                    <span style={{ fontWeight: '700', color: '#ef4444' }}>${balanceDue > 0.01 ? roundAmount(balanceDue).toLocaleString() : '0'}</span>
                  </div>
                </div>

                <form
                  onSubmit={(e) => {
                    e.preventDefault();
                    handlePaymentSubmit(selectedOrderId);
                  }}
                  style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}
                >
                  {/* Payment Amount */}
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                    <label style={{ fontWeight: '600', color: '#232a36', fontSize: '0.95rem' }}>
                      Payment Amount *
                    </label>
                    <input
                      type="number"
                      min="0"
                      step="0.01"
                      value={paymentAmount}
                      onChange={(e) => setPaymentAmount(e.target.value)}
                      placeholder={`Enter amount (Max: $${roundAmount(balanceDue)})`}
                      max={roundAmount(balanceDue)}
                      required
                      style={{
                        padding: '12px 14px',
                        border: '2px solid #e0e0e0',
                        borderRadius: '6px',
                        fontSize: '1rem',
                        fontFamily: 'inherit',
                        transition: 'all 0.3s ease'
                      }}
                      onFocus={(e) => e.target.style.borderColor = '#f5ba4a'}
                      onBlur={(e) => e.target.style.borderColor = '#e0e0e0'}
                    />
                    {paymentAmount && (
                      <div style={{
                        fontSize: '0.85rem',
                        padding: '8px 12px',
                        borderRadius: '4px',
                        background: parseFloat(paymentAmount) > roundAmount(balanceDue) ? '#fef2f2' : '#f0fdf4'
                      }}>
                        {parseFloat(paymentAmount) > roundAmount(balanceDue) && (
                          <span style={{ color: '#dc2626', fontWeight: '600' }}>⚠️ Amount exceeds balance due</span>
                        )}
                        {parseFloat(paymentAmount) <= roundAmount(balanceDue) && parseFloat(paymentAmount) > 0 && (
                          <span style={{ color: '#f5ba4a', fontWeight: '600' }}>✓ New balance will be: ${roundAmount(balanceDue - parseFloat(paymentAmount)).toLocaleString()}</span>
                        )}
                      </div>
                    )}
                  </div>

                  {/* Payment Method */}
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                    <label style={{ fontWeight: '600', color: '#232a36', fontSize: '0.95rem' }}>
                      Payment Method *
                    </label>
                    <div style={{ display: 'flex', gap: '20px' }}>
                      {['Cash', 'Card', 'Cheque'].map(method => (
                        <label key={method} style={{
                          display: 'flex',
                          alignItems: 'center',
                          gap: '8px',
                          cursor: 'pointer',
                          fontWeight: '500',
                          color: '#232a36'
                        }}>
                          <input
                            type="radio"
                            name="paymentMode"
                            value={method}
                            checked={paymentMode === method}
                            onChange={(e) => setPaymentMode(e.target.value)}
                            style={{
                              width: '18px',
                              height: '18px',
                              cursor: 'pointer'
                            }}
                          />
                          {method}
                        </label>
                      ))}
                    </div>
                  </div>

                  {/* Payment Notes */}
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                    <label style={{ fontWeight: '600', color: '#232a36', fontSize: '0.95rem' }}>
                      Payment Notes
                    </label>
                    <textarea
                      value={paymentNotes}
                      onChange={(e) => setPaymentNotes(e.target.value)}
                      placeholder="Add notes (optional) - e.g., Cheque No., Transaction ID, etc."
                      rows="3"
                      style={{
                        padding: '12px 14px',
                        border: '2px solid #e0e0e0',
                        borderRadius: '6px',
                        fontSize: '1rem',
                        fontFamily: 'inherit',
                        transition: 'all 0.3s ease',
                        resize: 'none'
                      }}
                      onFocus={(e) => e.target.style.borderColor = '#f5ba4a'}
                      onBlur={(e) => e.target.style.borderColor = '#e0e0e0'}
                    />
                  </div>

                  {/* Action Buttons */}
                  <div style={{ display: 'flex', gap: '12px', marginTop: '20px' }}>
                    {permissions.canRecordPayment ? (
                      <button
                        type="submit"
                        style={{
                          flex: 1,
                          padding: '12px 20px',
                          background: 'linear-gradient(90deg, #f5ba4a 0%, #ffc757 100%)',
                          color: '#1a1a1a',
                          border: 'none',
                          borderRadius: '6px',
                          fontWeight: '700',
                          fontSize: '0.95rem',
                          cursor: 'pointer',
                          transition: 'all 0.3s ease',
                          minHeight: '44px'
                        }}
                        onMouseEnter={(e) => {
                          e.target.style.transform = 'translateY(-2px)';
                          e.target.style.boxShadow = '0 4px 12px rgba(245, 186, 74, 0.3)';
                        }}
                        onMouseLeave={(e) => {
                          e.target.style.transform = 'translateY(0)';
                          e.target.style.boxShadow = 'none';
                        }}
                      >
                        ✓ Record Payment
                      </button>
                    ) : (
                      <button
                        type="button"
                        style={{
                          flex: 1,
                          padding: '12px 20px',
                          background: '#ccc',
                          color: '#666',
                          border: 'none',
                          borderRadius: '6px',
                          fontWeight: '700',
                          fontSize: '0.95rem',
                          cursor: 'not-allowed',
                          opacity: 0.5,
                          minHeight: '44px'
                        }}
                        disabled
                        title="You don't have permission to record payments"
                      >
                        ✓ Record Payment
                      </button>
                    )}
                    <button
                      type="button"
                      style={{
                        flex: 1,
                        padding: '12px 20px',
                        background: '#e5e7eb',
                        color: '#232a36',
                        border: '2px solid #d1d5db',
                        borderRadius: '6px',
                        fontWeight: '700',
                        fontSize: '0.95rem',
                        cursor: 'pointer',
                        transition: 'all 0.3s ease',
                        minHeight: '44px'
                      }}
                      onClick={() => {
                        setSelectedOrderId(null);
                        setPaymentAmount("");
                        setPaymentNotes("");
                        setPaymentMode("Cash");
                      }}
                      onMouseEnter={(e) => {
                        e.target.style.background = '#d1d5db';
                        e.target.style.transform = 'translateY(-2px)';
                      }}
                      onMouseLeave={(e) => {
                        e.target.style.background = '#e5e7eb';
                        e.target.style.transform = 'translateY(0)';
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
