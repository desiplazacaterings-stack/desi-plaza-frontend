import { useEffect, useState } from "react";
import { useLocation } from "react-router-dom";
import axios from "axios";
import API_ENDPOINTS from "../config";
import printAgreement from "../utils/printAgreement";
import "./Confirm.css";
import { formatDateTime, formatDate } from "../utils/dateUtils";

function Confirm() {
  const location = useLocation();
  const passedOrder = location.state?.order;
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [expandedOrder, setExpandedOrder] = useState(null);
  const [shareLoading, setShareLoading] = useState({});
  const [shareLinks, setShareLinks] = useState({});

  useEffect(() => {
    if (passedOrder) {
      setOrders([passedOrder]);
      setLoading(false);
    } else {
      axios.get(API_ENDPOINTS.ORDERS.GET_ALL)
        .then(res => {
          setOrders(res.data.filter(o => o.orderType === 'Event'));
          setLoading(false);
        })
        .catch(err => {
          setError("Failed to fetch confirmed orders");
          setLoading(false);
        });
    }
  }, [passedOrder]);

  const handleGenerateShareLink = async (order) => {
    try {
      setShareLoading(prev => ({ ...prev, [order._id]: true }));
      
      const response = await axios.post(API_ENDPOINTS.AGREEMENTS.GENERATE_LINK, {
        orderId: order._id,
        customerData: {
          customerName: order.customerName,
          mobile: order.mobile,
          email: order.email,
          eventType: order.eventType,
          eventDate: order.eventDate,
          eventTime: order.eventTime,
          guests: order.guests,
          location: order.address,
          notes: order.notes || ''
        }
      });

      setShareLinks(prev => ({
        ...prev,
        [order._id]: response.data.shareableUrl
      }));

      // Copy to clipboard
      navigator.clipboard.writeText(response.data.shareableUrl);
      alert("Share link copied to clipboard! You can now send it to your customer.");
    } catch (err) {
      alert("Error generating share link: " + (err.response?.data?.message || err.message));
    } finally {
      setShareLoading(prev => ({ ...prev, [order._id]: false }));
    }
  };

  return (
    <div className="confirm-container" style={{ padding: '20px', maxWidth: '1400px', margin: '0 auto' }}>
      <h2 style={{ marginBottom: '20px', color: '#232a36', fontSize: '1.8em' }}>Confirmed Orders</h2>
      {loading && <div style={{ padding: '20px', textAlign: 'center' }}>Loading...</div>}
      {error && <div style={{ padding: '20px', color: '#d32f2f', background: '#ffebee', borderRadius: '4px' }}>{error}</div>}
      {!loading && !error && orders.length > 0 && (
        <div className="confirm-wrapper">
          <table>
            <thead>
              <tr>
                <th>Order ID</th>
                <th>Customer Name</th>
                <th>Mobile</th>
                <th>Email</th>
                <th>Address</th>
                <th>Event Date</th>
                <th>Total</th>
                <th>Advance</th>
                <th>Balance</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {orders.map(order => [
                <tr key={`order-${order._id || order.quotationId}`}>
                  <td><strong>{order._id?.substring(0, 8) || order.quotationId || 'N/A'}...</strong></td>
                  <td>{order.customerName || 'N/A'}</td>
                  <td>{order.mobile || 'N/A'}</td>
                  <td>{order.email || 'N/A'}</td>
                  <td>{order.address || 'N/A'}</td>
                  <td>{order.eventDate ? formatDateTime(order.eventDate) : 'N/A'}</td>
                  <td style={{ textAlign: 'right', color: '#1976d2', fontWeight: '600' }}>${order.total?.toFixed(2) || 'N/A'}</td>
                  <td style={{ textAlign: 'right', color: '#388e3c' }}>${order.advance?.toFixed(2) || 'N/A'}</td>
                  <td style={{ textAlign: 'right', color: '#d32f2f' }}>${order.balance?.toFixed(2) || 'N/A'}</td>
                  <td>
                    <span style={{ 
                      padding: '4px 8px', 
                      background: order.status === 'Placed' ? '#e3f2fd' : '#f3e5f5', 
                      color: order.status === 'Placed' ? '#1976d2' : '#7b1fa2',
                      borderRadius: '4px',
                      fontSize: '0.85em',
                      fontWeight: '500'
                    }}>
                      {order.status}
                    </span>
                  </td>
                  <td style={{ display: 'flex', gap: '8px', flexDirection: 'column' }}>
                    <button
                      onClick={() => setExpandedOrder(expandedOrder === order._id ? null : order._id)}
                      style={{
                        padding: '6px 12px',
                        background: '#2196F3',
                        color: 'white',
                        border: 'none',
                        borderRadius: '4px',
                        cursor: 'pointer',
                        fontSize: '0.85em',
                        fontWeight: '500'
                      }}
                    >
                      {expandedOrder === order._id ? '👁️ Hide Items' : '👁️ View Items'}
                    </button>
                    <button
                      onClick={() => printAgreement({
                        customerName: order.customer?.name || 'N/A',
                        mobile: order.customer?.mobile || 'N/A',
                        email: order.customer?.email || 'N/A',
                        eventType: order.eventType || 'N/A',
                        eventDate: order.eventDate || 'N/A',
                        eventTime: order.eventTime || 'N/A',
                        guests: order.guests || 'N/A',
                        location: order.customer?.address || 'N/A',
                        notes: order.notes || ''
                      })}
                      style={{
                        padding: '6px 12px',
                        background: '#f39c12',
                        color: 'white',
                        border: 'none',
                        borderRadius: '4px',
                        cursor: 'pointer',
                        fontSize: '0.85em',
                        fontWeight: '500'
                      }}
                      title="Print Agreement"
                    >
                      🖨️
                    </button>
                    <button
                      onClick={() => handleGenerateShareLink(order)}
                      disabled={shareLoading[order._id]}
                      style={{
                        padding: '6px 12px',
                        background: shareLoading[order._id] ? '#ccc' : '#4caf50',
                        color: 'white',
                        border: 'none',
                        borderRadius: '4px',
                        cursor: shareLoading[order._id] ? 'not-allowed' : 'pointer',
                        fontSize: '0.85em',
                        fontWeight: '500'
                      }}
                      title="Generate Shareable Link"
                    >
                      {shareLoading[order._id] ? '⏳' : '🔗'}
                    </button>
                  </td>
                </tr>,
                expandedOrder === order._id && order.items && order.items.length > 0 && (
                  <tr key={`items-${order._id || order.quotationId}`} style={{ background: '#f9f9f9' }}>
                    <td colSpan="11" style={{ padding: '16px', borderTop: '2px solid #f5ba4a' }}>
                      <div style={{ marginTop: '8px' }}>
                        <h5 style={{ marginTop: 0, marginBottom: '12px', color: '#232a36' }}>Order Items:</h5>
                        <ul style={{ margin: 0, padding: '0 0 0 24px', listStyle: 'disc' }}>
                          {order.items.map((item, idx) => (
                            <li key={idx} style={{ marginBottom: '6px', fontSize: '0.9em', color: '#333' }}>
                              <strong>{item.itemName}</strong> ({item.unit}) x{item.qty} @ ${item.price?.toFixed(2)}
                            </li>
                          ))}
                        </ul>
                      </div>
                    </td>
                  </tr>
                )
              ])}
            </tbody>
          </table>
        </div>
      )}
      {!loading && !error && orders.length === 0 && <div style={{ padding: '40px', textAlign: 'center', color: '#999', fontSize: '1.1em' }}>No orders found.</div>}
    </div>
  );
}

export default Confirm;
