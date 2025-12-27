import { useState, useEffect } from "react";
import React from "react";
import axios from "axios";
import API_ENDPOINTS from "../config";
import "./Event.css";

function Event() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchOrders = async () => {
      try {
        setLoading(true);
        const response = await axios.get(API_ENDPOINTS.ORDERS.GET_ALL);
        console.log('Orders fetched:', response.data);
        setOrders(response.data || []);
      } catch (error) {
        console.error('Error fetching orders:', error);
        setOrders([]);
      } finally {
        setLoading(false);
      }
    };
    fetchOrders();
  }, []);

  // Categorize orders by date
  const categorizeOrders = () => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const categorized = {
      today: [],
      upcoming: [],
      past: []
    };

    orders.forEach(order => {
      if (order.eventDate) {
        const eventDate = new Date(order.eventDate);
        eventDate.setHours(0, 0, 0, 0);

        const timeDiff = eventDate - today;

        if (timeDiff === 0) {
          categorized.today.push(order);
        } else if (timeDiff > 0) {
          categorized.upcoming.push(order);
        } else {
          categorized.past.push(order);
        }
      }
    });

    // Sort dates
    categorized.today.sort((a, b) => new Date(b.eventDate) - new Date(a.eventDate));
    categorized.upcoming.sort((a, b) => new Date(a.eventDate) - new Date(b.eventDate));
    categorized.past.sort((a, b) => new Date(b.eventDate) - new Date(a.eventDate));

    return categorized;
  };

  const categorized = categorizeOrders();

  const handleAssign = (orderId) => {
    console.log('Assign event:', orderId);
    // TODO: Implement assign functionality
  };

  const [expandedOrder, setExpandedOrder] = useState(null);

  const EventCategory = ({ title, orders, icon }) => (
    <div className="event-category">
      <div className="category-header">
        <h3>{icon} {title}</h3>
        <span className="event-count">{orders.length} events</span>
      </div>

      {orders.length > 0 ? (
        <div className="table-wrapper">
          <table className="events-table">
            <thead>
              <tr>
                <th>Event Type</th>
                <th>Customer Name</th>
                <th>Mobile</th>
                <th>Event Date</th>
                <th>Location</th>
                <th>Items</th>
                <th>Total Amount</th>
                <th>Balance</th>
                <th>Action</th>
              </tr>
            </thead>
            <tbody>
              {orders.map((order) => (
                <React.Fragment key={order._id}>
                  <tr>
                    <td><strong>{order.eventType}</strong></td>
                    <td>{order.customerName}</td>
                    <td>{order.mobile}</td>
                    <td>{new Date(order.eventDate).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })}</td>
                    <td>{order.eventPlace}</td>
                    <td>
                      <button 
                        className="view-items-btn-small"
                        onClick={() => setExpandedOrder(expandedOrder === order._id ? null : order._id)}
                      >
                        {order.items?.length || 0} items
                      </button>
                    </td>
                    <td className="amount-gold">₹{(order.totalAmount || 0).toFixed(2)}</td>
                    <td className="amount-green">₹{((order.totalAmount || 0) - (order.advance || 0)).toFixed(2)}</td>
                    <td>
                      <button 
                        className="assign-btn" 
                        onClick={() => handleAssign(order._id)}
                      >
                        Assign
                      </button>
                    </td>
                  </tr>
                  {expandedOrder === order._id && order.items?.length > 0 && (
                    <tr className="items-row">
                      <td colSpan="9">
                        <div className="items-details">
                          <h5>Order Items:</h5>
                          <table className="items-table">
                            <thead>
                              <tr>
                                <th>Item Name</th>
                                <th>Category</th>
                                <th>Unit</th>
                                <th>Quantity</th>
                                <th>Price</th>
                                <th>Total</th>
                              </tr>
                            </thead>
                            <tbody>
                              {order.items.map((item, idx) => (
                                <tr key={idx}>
                                  <td>{item.itemName}</td>
                                  <td>{item.category || '-'}</td>
                                  <td>{item.unit || '-'}</td>
                                  <td>{item.qty}</td>
                                  <td>₹{(item.price || 0).toFixed(2)}</td>
                                  <td>₹{((item.qty || 0) * (item.price || 0)).toFixed(2)}</td>
                                </tr>
                              ))}
                            </tbody>
                          </table>
                        </div>
                      </td>
                    </tr>
                  )}
                </React.Fragment>
              ))}
            </tbody>
          </table>
        </div>
      ) : (
        <p className="no-events">No {title.toLowerCase()}</p>
      )}
    </div>
  );

  return (
    <div className="event-container">
      <div className="event-header">
        <h2>Events</h2>
      </div>

      {loading ? (
        <div className="loading">Loading events...</div>
      ) : orders.length === 0 ? (
        <div className="no-events-message">
          <p>No confirmed orders yet. Create a quotation and confirm to see events here.</p>
        </div>
      ) : (
        <>
          <EventCategory title="Today Events" orders={categorized.today} icon="📅" />
          <EventCategory title="Upcoming Events" orders={categorized.upcoming} icon="📆" />
          <EventCategory title="Past Events" orders={categorized.past} icon="✓" />
        </>
      )}
    </div>
  );
}

export default Event;
