import { useState, useEffect } from "react";
import React from "react";
import axios from "axios";
import API_ENDPOINTS from "../config";
import ViewSignedAgreement from "../components/ViewSignedAgreement";
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
  const [permissions, setPermissions] = useState({});
  const [userRole, setUserRole] = useState(null);

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
        // Filter out cancelled events
        const activeOrders = (response.data || []).filter(order => order.status !== 'Cancelled');
        setOrders(activeOrders);
      } catch (error) {
        console.error('Error fetching orders:', error);
        setOrders([]);
      } finally {
        setLoading(false);
      }
    };
    fetchOrders();
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
            canAssignTeamToEvent: true,
            canCompleteEvent: true,
            canDeleteEvent: true
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

  // Categorize orders by date
  const categorizeOrders = () => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const categorized = {
      today: [],
      upcoming: [],
      past: []
    };

    // Filter out cancelled events
    const activeOrders = orders.filter(order => order.status !== 'Cancelled');

    activeOrders.forEach(order => {
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

  const handleCancelEvent = async (order) => {
    if (window.confirm(`Are you sure you want to cancel the event for ${order.customerName}?`)) {
      try {
        await axios.patch(
          `${API_ENDPOINTS.ORDERS.BASE}/${order._id}/cancel`,
          { status: 'Cancelled' }
        );
        
        // Update the orders list
        setOrders(orders.filter(o => o._id !== order._id));
        alert('Event cancelled successfully!');
      } catch (error) {
        console.error('Error cancelling event:', error);
        alert('Failed to cancel event');
      }
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

    let html = `<!DOCTYPE html><html><head><meta charset="UTF-8"><meta name="viewport" content="width=device-width, initial-scale=1.0"><title>Invoice Print</title>
    <style>
      * { margin: 0; padding: 0; box-sizing: border-box; }
      @media print {
        @page { size: A4; margin: 20mm; }
        body { background: #fff !important; margin: 0; padding: 20mm; }
      }
      body { font-family: Arial, sans-serif; background: #fff; color: #222; margin: 0; padding: 20px; }
      .invoice-a4 { max-width: 900px; margin: 0 auto; padding: 20px; background: #fff; }
      .company-header { display: flex; align-items: flex-start; margin-bottom: 20px; gap: 15px; }
      .company-logo { width: 80px; height: 80px; object-fit: contain; flex-shrink: 0; background: #fff; }
      .company-details { font-size: 12px; background: #f2f2f2; color: #222; border-radius: 4px; padding: 10px; flex: 1; }
      .invoice-title { text-align: left; font-size: 20px; font-weight: bold; margin: 15px 0 10px 0; }
      .invoice-info { margin-bottom: 15px; text-align: left; font-size: 13px; line-height: 1.6; }
      table { width: 100%; border-collapse: collapse; margin-top: 15px; }
      th, td { border: 1px solid #bbb; padding: 8px; text-align: left; font-size: 13px; }
      th { background: #f5f5f5; font-weight: bold; }
      td { background: #fff; }
      .payment-summary { margin-top: 15px; padding: 10px; background: #f9f9f9; border-radius: 4px; }
      .summary-row { display: flex; justify-content: space-between; padding: 5px 0; font-size: 13px; }
      @media (max-width: 768px) {
        .invoice-a4 { padding: 12px; }
        .company-header { flex-direction: column; }
        .company-details { font-size: 11px; }
        table { font-size: 12px; }
        th, td { padding: 6px; }
      }
      tfoot td { font-weight: bold; text-align: right; background: #f9f9f9; }
    </style>
    </head><body><div class="invoice-a4">
      <div class="company-header">
        <img src="${logoDataUrl}" alt="Desi Plaza Caterings Logo" class="company-logo" />
        <div class="company-details">
          <strong>Desi Plaza Caterings</strong><br>9405 Cincinnati Columbus Rd, West Chester Township, OH 45069, United States<br>Phone: +1 513 7773374<br>Email: desiplazacaterings@gmail.com
        </div>
      </div>
      <div class="invoice-title">Invoice</div>
      <div class="invoice-info">
        <table style="width: 100%; border: none; margin-bottom: 12px;">
          <tr>
            <td style="border: none; width: 50%;"><strong>Invoice ID:</strong> ${order._id.toString().substring(0, 8).toUpperCase()}</td>
            <td style="border: none; width: 50%; text-align: right;"><strong>Invoice Date:</strong> ${new Date().toLocaleDateString()}</td>
          </tr>
          <tr>
            <td style="border: none;"><strong>Customer:</strong> ${order.customerName}</td>
            <td style="border: none; text-align: right;"><strong>Status:</strong> ${order.status || 'Active'}</td>
          </tr>
        </table>
        <table style="width: 100%; border: none;">
          <tr>
            <td style="border: none; width: 50%;"><strong>Mobile:</strong> ${order.mobile}</td>
            <td style="border: none; width: 50%;"><strong>Email:</strong> ${order.email}</td>
          </tr>
          <tr>
            <td style="border: none;"><strong>Event Type:</strong> ${order.eventType}</td>
            <td style="border: none;"><strong>Event Date:</strong> ${new Date(order.eventDate).toLocaleDateString()}</td>
          </tr>
          <tr>
            <td style="border: none;"><strong>Location:</strong> ${order.location}</td>
            <td style="border: none;"><strong>Guests:</strong> ${order.guests || 'N/A'}</td>
          </tr>
        </table>
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
          <span><strong>Total Amount:</strong></span>
          <span><strong>$${total.toFixed(2)}</strong></span>
        </div>
        <div class="summary-row">
          <span>Advance/Deposit Paid:</span>
          <span>$${(order.advance || 0).toFixed(2)}</span>
        </div>
        <div class="summary-row" style="border-top: 2px solid #333; padding-top: 8px; margin-top: 8px;">
          <span><strong>Balance Due:</strong></span>
          <span><strong>$${(order.balanceDue || 0).toFixed(2)}</strong></span>
        </div>
        <div class="summary-row" style="margin-top: 8px;">
          <span><strong>Payment Status:</strong></span>
          <span><strong>${order.paymentStatus || 'Pending'}</strong></span>
        </div>
        <div class="summary-row">
          <span><strong>Payment Mode:</strong></span>
          <span>${order.paymentMode || 'Not Specified'}</span>
        </div>
        <div class="summary-row" style="border-top: 1px solid #ddd; padding-top: 8px; margin-top: 12px; font-size: 12px; color: #666;">
          <span>Note: Remaining balance due by event date</span>
        </div>
      </div>
    </div></body></html>`;
    const printWindow = window.open('', '', 'width=900,height=1200');
    if (printWindow) {
      printWindow.document.write(html);
      printWindow.document.close();
      setTimeout(() => {
        printWindow.focus();
        printWindow.print();
      }, 300);
    } else {
      alert('Please enable pop-ups to print. Alternatively, use your browser\'s print menu.');
    }
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
                <th>#</th>
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
              {orders.map((order, index) => (
                <React.Fragment key={order._id}>
                  <tr>
                    <td data-label="#" className="serial-number">{index + 1}</td>
                    <td data-label="Event Type">{order.eventType}</td>
                    <td data-label="Customer Name">{order.customerName}</td>
                    <td data-label="Mobile">{order.mobile}</td>
                    <td data-label="Event Date">{new Date(order.eventDate).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })}</td>
                    <td data-label="Location">
                      <button 
                        className="view-location-btn"
                        onClick={() => handleViewLocation(order)}
                        title={order.eventPlace}
                      >
                        <img src="/G Maps Logo.png" alt="Google Maps" className="map-logo" />
                      </button>
                    </td>
                    <td data-label="Items">
                      <button 
                        className="view-items-btn-small"
                        onClick={() => setExpandedOrder(expandedOrder === order._id ? null : order._id)}
                      >
                        {order.items?.length || 0} items
                      </button>
                    </td>
                    <td className="amount-gold" data-label="Total Amount">${roundAmount(order.totalAmount).toFixed(2)}</td>
                    <td className="amount-green" data-label="Balance">${roundAmount(order.balanceDue || order.totalAmount).toFixed(2)}</td>
                    <td data-label="Status">
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
                    <td data-label="Action">
                      {order.status !== 'Completed' ? (
                        <div className="action-buttons">
                          {!order.assignedTeam?.name ? (
                            permissions.canAssignTeamToEvent ? (
                              <button 
                                className="assign-btn" 
                                onClick={() => handleAssign(order)}
                                title="Assign Team"
                              >
                                👥
                              </button>
                            ) : (
                              <button 
                                className="assign-btn"
                                disabled
                                style={{ opacity: 0.5, cursor: 'not-allowed', background: '#ccc' }}
                                title="You don't have permission to assign teams"
                              >
                                👥
                              </button>
                            )
                          ) : (
                            <>
                              <div className="assigned-info">
                                <div className="assigned-badge">
                                  ✓ Assigned: {order.assignedTeam.name}
                                </div>
                              </div>
                              {permissions.canCompleteEvent ? (
                                <button 
                                  className="complete-btn" 
                                  onClick={() => handleMarkComplete(order)}
                                  title="Mark Complete"
                                >
                                  ✅
                                </button>
                              ) : (
                                <button 
                                  className="complete-btn"
                                  disabled
                                  style={{ opacity: 0.5, cursor: 'not-allowed', background: '#ccc' }}
                                  title="You don't have permission to mark events as complete"
                                >
                                  ✅
                                </button>
                              )}
                            </>
                          )}
                          {userRole === 'admin' && (
                            <button 
                              className="cancel-btn" 
                              onClick={() => handleCancelEvent(order)}
                              style={{
                                padding: "6px 10px",
                                backgroundColor: "#dc3545",
                                color: "#fff",
                                border: "none",
                                borderRadius: "4px",
                                cursor: "pointer",
                                fontWeight: "bold",
                                fontSize: "0.8em",
                                marginLeft: "6px"
                              }}
                              title="Cancel this event (Admin only)"
                            >
                              ✕
                            </button>
                          )}
                        </div>
                      ) : (
                        <div className="action-buttons">
                          <button 
                            className="print-invoice-btn" 
                            onClick={() => printInvoice(order)}
                            title="Print Invoice"
                          >
                            🖨️
                          </button>
                          {order.agreementSigned && order.signedAgreementId && (
                            <ViewSignedAgreement 
                              agreementId={order.signedAgreementId} 
                              customerName={order.customerName}
                            />
                          )}
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
                                  <td data-label="Item Name">{item.itemName}</td>
                                  <td data-label="Category">{item.category || '-'}</td>
                                  <td data-label="Unit">{item.unit || '-'}</td>
                                  <td data-label="Quantity">{item.qty}</td>
                                  <td data-label="Price">${(item.price || 0).toFixed(2)}</td>
                                  <td data-label="Total">${((item.qty || 0) * (item.price || 0)).toFixed(2)}</td>
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
                title="Close"
              >
                ✕
              </button>
              <button 
                className="complete-btn" 
                onClick={handleAssignTeam}
                disabled={!teamMember.name}
                title="Assign Team"
              >
                👥
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
                title="Close"
              >
                ✕
              </button>
              <button 
                className="complete-btn" 
                onClick={handleCompleteEvent}
                title="Mark Event Complete"
              >
                ✅
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
