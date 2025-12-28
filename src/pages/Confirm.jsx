import { useEffect, useState } from "react";
import { useLocation } from "react-router-dom";
import axios from "axios";
import API_ENDPOINTS from "../config";
import printAgreement from "../utils/printAgreement";
import "./Confirm.css";

function Confirm() {
  const location = useLocation();
  const passedOrder = location.state?.order;
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

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

  return (
    <div className="confirm-container" style={{ padding: '20px', maxWidth: '1400px', margin: '0 auto' }}>
      <h2 style={{ marginBottom: '20px', color: '#232a36', fontSize: '1.8em' }}>Confirmed Orders</h2>
      {loading && <div style={{ padding: '20px', textAlign: 'center' }}>Loading...</div>}
      {error && <div style={{ padding: '20px', color: '#d32f2f', background: '#ffebee', borderRadius: '4px' }}>{error}</div>}
      {!loading && !error && orders.length > 0 && (
        <div style={{ overflowX: 'auto', background: '#fff', borderRadius: '8px', boxShadow: '0 2px 8px rgba(0,0,0,0.1)' }}>
          <table style={{ 
            width: "100%", 
            borderCollapse: "collapse", 
            fontSize: '0.95em'
          }}>
            <thead>
              <tr style={{ 
                background: '#f5ba4a', 
                fontWeight: 'bold', 
                textAlign: 'left',
                position: 'sticky',
                top: 0
              }}>
                <th style={{ padding: '14px', minWidth: '100px', borderRight: '1px solid #ddd' }}>Order ID</th>
                <th style={{ padding: '14px', minWidth: '120px', borderRight: '1px solid #ddd' }}>Customer Name</th>
                <th style={{ padding: '14px', minWidth: '110px', borderRight: '1px solid #ddd' }}>Mobile</th>
                <th style={{ padding: '14px', minWidth: '150px', borderRight: '1px solid #ddd' }}>Email</th>
                <th style={{ padding: '14px', minWidth: '140px', borderRight: '1px solid #ddd' }}>Address</th>
                <th style={{ padding: '14px', minWidth: '150px', borderRight: '1px solid #ddd' }}>Event Date</th>
                <th style={{ padding: '14px', minWidth: '80px', borderRight: '1px solid #ddd', textAlign: 'right' }}>Total</th>
                <th style={{ padding: '14px', minWidth: '80px', borderRight: '1px solid #ddd', textAlign: 'right' }}>Advance</th>
                <th style={{ padding: '14px', minWidth: '80px', borderRight: '1px solid #ddd', textAlign: 'right' }}>Balance</th>
                <th style={{ padding: '14px', minWidth: '90px', borderRight: '1px solid #ddd' }}>Status</th>
                <th style={{ padding: '14px', minWidth: '200px', borderRight: '1px solid #ddd' }}>Line Items</th>
                <th style={{ padding: '14px', minWidth: '120px' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {orders.map(order => (
                <tr key={order._id || order.quotationId} style={{ borderBottom: '1px solid #eee', transition: 'background 0.2s' }} onMouseEnter={(e) => e.currentTarget.style.background = '#f9f9f9'} onMouseLeave={(e) => e.currentTarget.style.background = 'transparent'}>
                  <td style={{ padding: '12px', borderRight: '1px solid #eee' }}><strong>{order._id?.substring(0, 8) || order.quotationId || 'N/A'}...</strong></td>
                  <td style={{ padding: '12px', borderRight: '1px solid #eee' }}>{order.customer?.name || 'N/A'}</td>
                  <td style={{ padding: '12px', borderRight: '1px solid #eee' }}>{order.customer?.mobile || 'N/A'}</td>
                  <td style={{ padding: '12px', borderRight: '1px solid #eee', fontSize: '0.9em' }}>{order.customer?.email || 'N/A'}</td>
                  <td style={{ padding: '12px', borderRight: '1px solid #eee', fontSize: '0.9em' }}>{order.customer?.address || 'N/A'}</td>
                  <td style={{ padding: '12px', borderRight: '1px solid #eee', fontSize: '0.9em' }}>{order.deliveryTime ? new Date(order.deliveryTime).toLocaleString() : 'N/A'}</td>
                  <td style={{ padding: '12px', borderRight: '1px solid #eee', textAlign: 'right', fontWeight: '600', color: '#1976d2' }}>${order.total?.toFixed(2) || 'N/A'}</td>
                  <td style={{ padding: '12px', borderRight: '1px solid #eee', textAlign: 'right', color: '#388e3c' }}>${order.advance?.toFixed(2) || 'N/A'}</td>
                  <td style={{ padding: '12px', borderRight: '1px solid #eee', textAlign: 'right', color: '#d32f2f' }}>${order.balance?.toFixed(2) || 'N/A'}</td>
                  <td style={{ padding: '12px', borderRight: '1px solid #eee' }}>
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
                  <td style={{ padding: '12px', borderRight: '1px solid #eee' }}>
                    <ul style={{ margin: 0, padding: '0 0 0 16px', listStyle: "disc" }}>
                      {order.items && order.items.length > 0 ? order.items.map((item, idx) => (
                        <li key={idx} style={{ marginBottom: '4px', fontSize: '0.85em', color: '#555' }}>
                          <strong>{item.itemName}</strong> ({item.unit}) x{item.qty} @ ${item.price?.toFixed(2)}
                        </li>
                      )) : <li style={{ fontSize: '0.85em', color: '#999' }}>No items</li>}
                    </ul>
                  </td>
                  <td style={{ padding: '12px' }}>
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
                    >
                      Print Agreement
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
      {!loading && !error && orders.length === 0 && <div style={{ padding: '40px', textAlign: 'center', color: '#999', fontSize: '1.1em' }}>No orders found.</div>}
    </div>
  );
}

export default Confirm;
