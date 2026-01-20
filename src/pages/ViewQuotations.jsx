
import React, { useEffect, useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import API_ENDPOINTS from "../config";
import "./ViewQuotations.css";

const ViewQuotations = () => {
  const [quotations, setQuotations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [permissions, setPermissions] = useState({});
  const [userRole, setUserRole] = useState(null);
  const [selectedItems, setSelectedItems] = useState(null);
  const [showModal, setShowModal] = useState(false);

  const navigate = useNavigate();
  useEffect(() => {
    const token = localStorage.getItem('token');
    axios.get(API_ENDPOINTS.QUOTATIONS.GET_ALL, {
      headers: { Authorization: `Bearer ${token}` }
    })
      .then(res => {
        // Filter out confirmed quotations
        const pendingQuotations = res.data.filter(q => q.status !== 'Confirmed');
        setQuotations(pendingQuotations);
        setLoading(false);
      })
      .catch(err => {
        setError(err.response?.data?.message || "Failed to fetch quotations");
        setLoading(false);
      });
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
          setPermissions({ canCreateInstantOrder: true });
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

  if (loading) return <div>Loading...</div>;
  if (error) return <div>{error}</div>;

  // Add Confirm Order button for each quotation
  async function handleConfirmOrder(quotation) {
    // Prepare order data from quotation with all event details
    const orderData = {
      customerName: quotation.enquiry?.customerName || '',
      mobile: quotation.enquiry?.mobile || '',
      email: quotation.enquiry?.email || '',
      address: quotation.enquiry?.location || '',
      eventType: quotation.enquiry?.eventType || '',
      eventDate: quotation.enquiry?.eventDate || null,
      eventPlace: quotation.enquiry?.location || '',
      subEvents: quotation.enquiry?.subEvents || '',
      eventManager: quotation.enquiry?.eventManager || '',
      items: (quotation.items || []).map(item => ({
        itemName: item.itemName,
        qty: item.qty,
        price: item.price,
        category: item.category || '',
        unit: item.unit || ''
      })),
      subtotal: quotation.total || 0,
      tax: 0,
      total: quotation.total || 0,
      totalAmount: quotation.total || 0,
      advance: 0,
      balance: quotation.total || 0,
      status: 'Confirmed',
      orderType: 'Event',
      quotationId: quotation._id,
    };

    try {
      const res = await axios.post(API_ENDPOINTS.ORDERS.CREATE, orderData);
      // Update quotation status to Confirmed
      await axios.patch(API_ENDPOINTS.QUOTATIONS.UPDATE(quotation._id), { status: 'Confirmed' });
      // Remove the quotation from the list after confirming
      setQuotations(quotations.filter(q => q._id !== quotation._id));
      // Navigate to /confirm and pass both order and quotation details
      navigate("/confirm", { state: { order: res.data, quotation: quotation } });
    } catch (err) {
      console.error('Error confirming order:', err.response?.data || err.message);
      alert(`Failed to confirm order: ${err.response?.data?.message || err.message}`);
      console.error(err);
    }
  }

  return (
    <div className="view-quotations-container">
      <h2>All Quotations</h2>
      <div className="quotations-wrapper">
        <table className="quotations-table">
          <thead>
            <tr>
              <th>#</th>
              <th>Quotation ID</th>
              <th>Customer Name</th>
              <th>Mobile</th>
              <th>Email</th>
              <th>Event Type</th>
              <th>Event Date</th>
              <th>Location</th>
              <th>Guests</th>
              <th>Line Items</th>
              <th>Total</th>
              <th>Action</th>
            </tr>
          </thead>
          <tbody>
            {quotations.map((q, index) => (
              <tr key={q._id}>
                <td data-label="#" className="serial-number">{index + 1}</td>
                <td data-label="Quotation ID">{q.quotationId || 'N/A'}</td>
                <td data-label="Customer Name">{q.enquiry?.customerName || 'N/A'}</td>
                <td data-label="Mobile">{q.enquiry?.mobile || 'N/A'}</td>
                <td data-label="Email">{q.enquiry?.email || 'N/A'}</td>
                <td data-label="Event Type">{q.enquiry?.eventType || 'N/A'}</td>
                <td data-label="Event Date">{q.enquiry?.eventDate || 'N/A'}</td>
                <td data-label="Location">{q.enquiry?.location || 'N/A'}</td>
                <td data-label="Guests">{q.enquiry?.guests || 'N/A'}</td>
                <td data-label="Line Items">
                  <button 
                    onClick={() => {
                      setSelectedItems(q.items);
                      setShowModal(true);
                    }}
                    style={{
                      padding: "6px 12px",
                      backgroundColor: "#ffc107",
                      border: "none",
                      borderRadius: "4px",
                      cursor: "pointer",
                      fontWeight: "bold",
                      fontSize: "0.85em"
                    }}
                    title="View Items"
                  >
                    👁️
                  </button>
                </td>
                <td data-label="Total">${q.total?.toFixed(2) || 'N/A'}</td>
                <td data-label="Action">
                  <div style={{ display: 'flex', gap: '8px', justifyContent: 'center' }}>
                    <button 
                      className="edit-quotation-btn"
                      onClick={() => navigate("/quotation", { state: { quotation: q } })}
                      title="Edit Quotation"
                      style={{
                        padding: '6px 12px',
                        backgroundColor: '#17a2b8',
                        color: '#fff',
                        border: 'none',
                        borderRadius: '4px',
                        cursor: 'pointer',
                        fontWeight: 'bold',
                        fontSize: '0.85em'
                      }}
                    >
                      ✏️ Edit
                    </button>
                    {permissions.canCreateInstantOrder ? (
                      <button className="confirm-order-btn" onClick={() => handleConfirmOrder(q)} title="Confirm Order" style={{ padding: '6px 12px', backgroundColor: '#28a745', color: '#fff', border: 'none', borderRadius: '4px', cursor: 'pointer', fontWeight: 'bold', fontSize: '0.85em' }}>✓ Confirm</button>
                    ) : (
                      <button className="confirm-order-btn" disabled title="You don't have permission to confirm orders" style={{ padding: '6px 12px', backgroundColor: '#ccc', cursor: 'not-allowed', border: 'none', borderRadius: '4px', fontWeight: 'bold', fontSize: '0.85em' }}>
                        ✓ Confirm
                      </button>
                    )}
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Modal for viewing items */}
      {showModal && (
        <div style={{
          position: "fixed",
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundColor: "rgba(0,0,0,0.5)",
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          zIndex: 1000
        }}>
          <div style={{
            backgroundColor: "#fff",
            padding: "30px",
            borderRadius: "8px",
            maxWidth: "500px",
            maxHeight: "80vh",
            overflowY: "auto",
            boxShadow: "0 4px 20px rgba(0,0,0,0.3)"
          }}>
            <h3 style={{ marginTop: 0, marginBottom: "20px" }}>Quotation Items</h3>
            <table style={{ width: "100%", borderCollapse: "collapse" }}>
              <thead>
                <tr style={{ borderBottom: "2px solid #ddd" }}>
                  <th style={{ textAlign: "left", padding: "8px" }}>Item</th>
                  <th style={{ textAlign: "center", padding: "8px" }}>Unit</th>
                  <th style={{ textAlign: "center", padding: "8px" }}>Qty</th>
                  <th style={{ textAlign: "right", padding: "8px" }}>Price</th>
                  <th style={{ textAlign: "right", padding: "8px" }}>Total</th>
                </tr>
              </thead>
              <tbody>
                {selectedItems?.map((item, i) => (
                  <tr key={i} style={{ borderBottom: "1px solid #eee" }}>
                    <td style={{ padding: "8px" }}>{item.itemName}</td>
                    <td style={{ textAlign: "center", padding: "8px" }}>{item.unit}</td>
                    <td style={{ textAlign: "center", padding: "8px" }}>{item.qty}</td>
                    <td style={{ textAlign: "right", padding: "8px" }}>${item.price.toFixed(2)}</td>
                    <td style={{ textAlign: "right", padding: "8px" }}>${(item.price * item.qty).toFixed(2)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
            <div style={{ marginTop: "20px", textAlign: "right" }}>
              <button 
                onClick={() => setShowModal(false)}
                style={{
                  padding: "10px 20px",
                  backgroundColor: "#6c757d",
                  color: "#fff",
                  border: "none",
                  borderRadius: "4px",
                  cursor: "pointer",
                  fontWeight: "bold"
                }}
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ViewQuotations;
