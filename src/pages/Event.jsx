import { useState, useEffect } from "react";
import React from "react";
import axios from "axios";
import API_ENDPOINTS from "../config";
import "./Event.css";

// Helper function to round amounts to nearest rupee
const roundAmount = (amount) => Math.round((amount || 0) * 100) / 100;

function Event() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showAssignModal, setShowAssignModal] = useState(false);
  const [showCompleteModal, setShowCompleteModal] = useState(false);
  const [showMapModal, setShowMapModal] = useState(false);
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [teamMember, setTeamMember] = useState({
    name: '',
    role: '',
    phone: ''
  });

  const teamOptions = [
    { name: 'Raj Kumar', role: 'Event Manager', phone: '9876543210' },
    { name: 'Priya Sharma', role: 'Chef', phone: '9876543211' },
    { name: 'Vikram Singh', role: 'Logistics Manager', phone: '9876543212' },
    { name: 'Anaya Patel', role: 'Coordinator', phone: '9876543213' },
    { name: 'Rahul Verma', role: 'Service Lead', phone: '9876543214' }
  ];

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

  const handleAssign = (order) => {
    setSelectedOrder(order);
    setTeamMember({ name: '', role: '', phone: '' });
    setShowAssignModal(true);
  };

  const handleSelectTeam = (team) => {
    setTeamMember(team);
  };

  const handleAssignTeam = async () => {
    if (!teamMember.name) {
      alert('Please select a team member');
      return;
    }

    try {
      const response = await axios.patch(
        `${API_ENDPOINTS.ORDERS.BASE}/${selectedOrder._id}`,
        { assignedTeam: teamMember }
      );
      
      // Update the orders list
      setOrders(orders.map(o => o._id === selectedOrder._id ? response.data : o));
      setShowAssignModal(false);
      alert('Team member assigned successfully!');
    } catch (error) {
      console.error('Error assigning team:', error);
      alert('Failed to assign team member');
    }
  };

  const handleMarkComplete = (order) => {
    setSelectedOrder(order);
    setShowCompleteModal(true);
  };

  const handleCompleteEvent = async () => {
    try {
      const response = await axios.patch(
        `${API_ENDPOINTS.ORDERS.BASE}/${selectedOrder._id}/complete`,
        { assignedTeam: selectedOrder.assignedTeam }
      );
      
      // Update the orders list
      setOrders(orders.map(o => o._id === selectedOrder._id ? response.data : o));
      setShowCompleteModal(false);
      alert('Event marked as completed!');
    } catch (error) {
      console.error('Error completing event:', error);
      alert('Failed to complete event');
    }
  };

  const printInvoice = async (order) => {
    const total = (order.items || []).reduce((sum, item) => sum + item.price * item.qty, 0);
    
    // Fetch and convert logo to data URL
    let logoDataUrl = '';
    try {
      const response = await fetch('/logo.png');
      const blob = await response.blob();
      logoDataUrl = await new Promise((resolve) => {
        const reader = new FileReader();
        reader.onloadend = () => resolve(reader.result);
        reader.readAsDataURL(blob);
      });
    } catch (error) {
      console.log('Logo could not be loaded');
    }

    let html = `<!DOCTYPE html><html><head><title>Invoice Print</title>
    <style>
      @media print {
        @page { size: A4; margin: 20mm; }
        body { background: #fff !important; }
      }
      body { font-family: Arial, sans-serif; background: #fff; color: #222; margin: 0; }
      .invoice-a4 { max-width: 800px; margin: 0 auto; padding: 24px; background: #fff; border-radius: 8px; }
      .company-header { display: flex; align-items: center; margin-bottom: 18px; }
      .company-logo { width: 90px; height: 90px; object-fit: contain; margin-right: 18px; border-radius: 8px; background: #fff; }
      .company-details { font-size: 13px; background: #f2f2f2; color: #222; border-radius: 8px; padding: 8px 14px; max-width: 350px; }
      .invoice-title { text-align: left; font-size: 22px; font-weight: bold; margin-bottom: 8px; }
      .invoice-info { margin-bottom: 18px; text-align: left; }
      table { width: 100%; border-collapse: collapse; margin-top: 18px; table-layout: fixed; }
      th, td { border: 1px solid #bbb; padding: 8px 10px; text-align: left; }
      th { background: #f5f5f5; }
      th:nth-child(1) { width: 5%; }
      th:nth-child(2) { width: 45%; }
      th:nth-child(3) { width: 10%; }
      th:nth-child(4) { width: 10%; text-align: center; }
      th:nth-child(5) { width: 15%; text-align: right; }
      th:nth-child(6) { width: 15%; text-align: right; }
      td:nth-child(1) { text-align: center; }
      td:nth-child(4) { text-align: center; }
      td:nth-child(5), td:nth-child(6) { text-align: right; }
      tfoot td { font-weight: bold; text-align: right; }
      .payment-summary { margin-top: 20px; padding: 12px; background: #f9f9f9; border-radius: 4px; }
      .summary-row { display: flex; justify-content: space-between; padding: 6px 0; }
    </style>
    </head><body><div class="invoice-a4">
      <div class="company-header">
        <img src="${logoDataUrl}" alt="Desi Plaza Caterings Logo" class="company-logo" />
        <div class="company-details">
          <strong>Desi Plaza Caterings</strong><br>123 Main Street, City, State, ZIP<br>Phone: +91 12345 67890<br>Email: info@desiplazacaterings.com<br>GSTIN: 29ABCDE1234F2Z5
        </div>
      </div>
      <div class="invoice-title">Invoice</div>
      <div class="invoice-info">
        <strong>Invoice ID:</strong> ${order._id.toString().substring(0, 8).toUpperCase()}<br />
        <strong>Customer:</strong> ${order.customerName}<br />
        <strong>Mobile:</strong> ${order.mobile}<br />
        <strong>Email:</strong> ${order.email}<br />
        <strong>Event Type:</strong> ${order.eventType}<br />
        <strong>Event Date:</strong> ${new Date(order.eventDate).toLocaleDateString()}<br />
        <strong>Location:</strong> ${order.location}<br />
        <strong>Guests:</strong> ${order.guests}<br />
      </div>
      <table>
        <thead>
          <tr>
            <th>#</th>
            <th>Item Name</th>
            <th>Unit</th>
            <th>Qty</th>
            <th>Price</th>
            <th>Total</th>
          </tr>
        </thead>
        <tbody>
          ${(order.items || []).map((item, idx) => `
            <tr>
              <td>${idx + 1}</td>
              <td>${item.itemName}</td>
              <td>${item.unit}</td>
              <td>${item.qty}</td>
              <td>$${item.price.toFixed(2)}</td>
              <td>$${(item.price * item.qty).toFixed(2)}</td>
            </tr>
          `).join('')}
        </tbody>
        <tfoot>
          <tr>
            <td colspan="5" style="text-align:right;">Total Amount</td>
            <td>$${total.toFixed(2)}</td>
          </tr>
          <tr>
            <td colspan="5" style="text-align:right;">Advance Paid</td>
            <td>$${(order.advance || 0).toFixed(2)}</td>
          </tr>
          <tr>
            <td colspan="5" style="text-align:right;"><strong>Balance Due</strong></td>
            <td><strong>$${(order.balanceDue || 0).toFixed(2)}</strong></td>
          </tr>
        </tfoot>
      </table>
      <div class="payment-summary">
        <div class="summary-row">
          <strong>Payment Status:</strong>
          <strong>${order.paymentStatus || 'Pending'}</strong>
        </div>
      </div>
    </div></body></html>`;
    const printWindow = window.open('', '', 'width=900,height=1200');
    printWindow.document.write(html);
    printWindow.document.close();
    printWindow.focus();
    printWindow.print();
    printWindow.close();
  };

  const handleViewLocation = (order) => {
    setSelectedOrder(order);
    setShowMapModal(true);
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
                <th>Status</th>
                <th>Action</th>
              </tr>
            </thead>
            <tbody>
              {orders.map((order) => (
                <React.Fragment key={order._id}>
                  <tr>
                    <td>{order.eventType}</td>
                    <td>{order.customerName}</td>
                    <td>{order.mobile}</td>
                    <td>{new Date(order.eventDate).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })}</td>
                    <td>
                      <button 
                        className="view-location-btn"
                        onClick={() => handleViewLocation(order)}
                        title="View location on map"
                      >
                        📍 {order.eventPlace}
                      </button>
                    </td>
                    <td>
                      <button 
                        className="view-items-btn-small"
                        onClick={() => setExpandedOrder(expandedOrder === order._id ? null : order._id)}
                      >
                        {order.items?.length || 0} items
                      </button>
                    </td>
                    <td className="amount-gold">${roundAmount(order.totalAmount).toFixed(2)}</td>
                    <td className="amount-green">${roundAmount((order.totalAmount || 0) - (order.advance || 0)).toFixed(2)}</td>
                    <td>
                      <span className={`status-badge status-${order.status?.toLowerCase() || 'placed'}`}>
                        {order.status || 'Placed'}
                      </span>
                      {order.status === 'Completed' && (
                        <div className="payment-status">
                          <span className={`payment-badge payment-${order.paymentStatus?.toLowerCase() || 'pending'}`}>
                            {order.paymentStatus || 'Pending'}
                          </span>
                          {order.paymentStatus !== 'Paid' && (
                            <div className="payment-alert">
                              Due: ${roundAmount(order.balanceDue).toFixed(2)}
                            </div>
                          )}
                        </div>
                      )}
                    </td>
                    <td>
                      {order.status !== 'Completed' ? (
                        <div className="action-buttons">
                          {!order.assignedTeam?.name ? (
                            <button 
                              className="assign-btn" 
                              onClick={() => handleAssign(order)}
                            >
                              Assign Team
                            </button>
                          ) : (
                            <>
                              <div className="assigned-info">
                                <div className="assigned-badge">
                                  ✓ Assigned: {order.assignedTeam.name}
                                </div>
                              </div>
                              <button 
                                className="complete-btn" 
                                onClick={() => handleMarkComplete(order)}
                              >
                                Mark Complete
                              </button>
                            </>
                          )}
                        </div>
                      ) : (
                        <div className="action-buttons">
                          <button 
                            className="print-invoice-btn" 
                            onClick={() => printInvoice(order)}
                          >
                            🖨️ Print Invoice
                          </button>
                        </div>
                      )}
                    </td>
                  </tr>
                  {expandedOrder === order._id && order.items && order.items.length > 0 && (
                    <tr className="items-row">
                      <td colSpan="10">
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
                                  <td>${(item.price || 0).toFixed(2)}</td>
                                  <td>${((item.qty || 0) * (item.price || 0)).toFixed(2)}</td>
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

      {/* Modal for assigning team */}
      {showAssignModal && selectedOrder && (
        <div className="modal-overlay" onClick={() => setShowAssignModal(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3>Assign Team Member</h3>
              <button className="close-btn" onClick={() => setShowAssignModal(false)}>✕</button>
            </div>

            <div className="modal-body">
              <div className="event-info">
                <p><strong>Customer:</strong> {selectedOrder.customerName}</p>
                <p><strong>Event Type:</strong> {selectedOrder.eventType}</p>
                <p><strong>Event Date:</strong> {new Date(selectedOrder.eventDate).toLocaleDateString('en-IN')}</p>
                <p><strong>Location:</strong> {selectedOrder.eventPlace}</p>
              </div>

              <div className="team-selection">
                <h4>Select Team Member</h4>
                <div className="team-list">
                  {teamOptions.map((team, idx) => (
                    <div 
                      key={idx}
                      className={`team-option ${teamMember.name === team.name ? 'selected' : ''}`}
                      onClick={() => handleSelectTeam(team)}
                    >
                      <div className="team-name">{team.name}</div>
                      <div className="team-role">{team.role}</div>
                      <div className="team-phone">{team.phone}</div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            <div className="modal-footer">
              <button 
                className="cancel-btn" 
                onClick={() => setShowAssignModal(false)}
              >
                Cancel
              </button>
              <button 
                className="complete-btn" 
                onClick={handleAssignTeam}
                disabled={!teamMember.name}
              >
                Assign Team
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal for completing event */}
      {showCompleteModal && selectedOrder && (
        <div className="modal-overlay" onClick={() => setShowCompleteModal(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3>Mark Event Complete</h3>
              <button className="close-btn" onClick={() => setShowCompleteModal(false)}>✕</button>
            </div>

            <div className="modal-body">
              <div className="event-info">
                <p><strong>Customer:</strong> {selectedOrder.customerName}</p>
                <p><strong>Event Type:</strong> {selectedOrder.eventType}</p>
                <p><strong>Event Date:</strong> {new Date(selectedOrder.eventDate).toLocaleDateString('en-IN')}</p>
              </div>

              <div className="assigned-team-info">
                <h4>Assigned Team</h4>
                <div className="team-card">
                  <p><strong>Name:</strong> {selectedOrder.assignedTeam?.name}</p>
                  <p><strong>Role:</strong> {selectedOrder.assignedTeam?.role}</p>
                  <p><strong>Phone:</strong> {selectedOrder.assignedTeam?.phone}</p>
                </div>
              </div>

              <div className="payment-info">
                <h4>Payment Status</h4>
                <div className="payment-details">
                  <p><strong>Total Amount:</strong> ${roundAmount(selectedOrder.totalAmount).toFixed(2)}</p>
                  <p><strong>Advance Received:</strong> ${roundAmount(selectedOrder.advance).toFixed(2)}</p>
                  {selectedOrder.totalAmount && selectedOrder.advance && 
                   roundAmount(selectedOrder.totalAmount) !== roundAmount(selectedOrder.advance) && (
                    <p className="payment-due"><strong>Amount Due:</strong> ${roundAmount(selectedOrder.totalAmount - selectedOrder.advance).toFixed(2)}</p>
                  )}
                </div>
              </div>

              <div className="completion-note">
                <p><em>Marking this event as complete will set the payment status. You can update payment details later if needed.</em></p>
              </div>
            </div>

            <div className="modal-footer">
              <button 
                className="cancel-btn" 
                onClick={() => setShowCompleteModal(false)}
              >
                Cancel
              </button>
              <button 
                className="complete-btn" 
                onClick={handleCompleteEvent}
              >
                Confirm & Mark Complete
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Location Map Modal */}
      {showMapModal && selectedOrder && (
        <div className="modal-overlay" onClick={() => setShowMapModal(false)}>
          <div className="modal-content location-modal" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2>📍 Event Location</h2>
              <button className="close-btn" onClick={() => setShowMapModal(false)}>✕</button>
            </div>

            <div className="modal-body">
              <div className="location-info">
                <p><strong>Customer:</strong> {selectedOrder.customerName}</p>
                <p><strong>Event Location:</strong> {selectedOrder.eventPlace}</p>
                <p><strong>Event Date:</strong> {new Date(selectedOrder.eventDate).toLocaleDateString('en-IN')}</p>
              </div>

              <div className="map-container">
                <iframe
                  width="100%"
                  height="400"
                  style={{ border: 'none', borderRadius: '8px' }}
                  src={`https://www.google.com/maps/embed/v1/place?key=YOUR_GOOGLE_MAPS_API_KEY&q=${encodeURIComponent(selectedOrder.eventPlace)}`}
                  allowFullScreen=""
                  loading="lazy"
                  referrerPolicy="no-referrer-when-downgrade"
                ></iframe>
              </div>

              <div className="map-links">
                <a 
                  href={`https://www.google.com/maps/search/${encodeURIComponent(selectedOrder.eventPlace)}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="map-link-btn"
                >
                  🔗 View in Google Maps
                </a>
                <a 
                  href={`https://www.google.com/maps/dir/?api=1&destination=${encodeURIComponent(selectedOrder.eventPlace)}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="map-link-btn directions-btn"
                >
                  🧭 Get Directions
                </a>
              </div>
            </div>

            <div className="modal-footer">
              <button 
                className="cancel-btn" 
                onClick={() => setShowMapModal(false)}
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default Event;
