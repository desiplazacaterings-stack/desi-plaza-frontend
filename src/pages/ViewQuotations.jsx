
import React, { useEffect, useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import API_ENDPOINTS from "../config";

const ViewQuotations = () => {
  const [quotations, setQuotations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

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
    <div>
      <h2>All Quotations</h2>
      <table border="1" cellPadding="8" style={{ width: "100%", borderCollapse: "collapse" }}>
        <thead>
          <tr>
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
          {quotations.map(q => (
            <tr key={q._id}>
              <td>{q.quotationId || 'N/A'}</td>
              <td>{q.enquiry?.customerName || 'N/A'}</td>
              <td>{q.enquiry?.mobile || 'N/A'}</td>
              <td>{q.enquiry?.email || 'N/A'}</td>
              <td>{q.enquiry?.eventType || 'N/A'}</td>
              <td>{q.enquiry?.eventDate || 'N/A'}</td>
              <td>{q.enquiry?.location || 'N/A'}</td>
              <td>{q.enquiry?.guests || 'N/A'}</td>
              <td>
                <ul style={{ margin: 0, padding: 0, listStyle: "none" }}>
                  {q.items?.length > 0 ? q.items.map((item, i) => (
                    <li key={i}>
                      {item.itemName} ({item.unit}) x{item.qty} @ ₹{item.price}
                    </li>
                  )) : <li>N/A</li>}
                </ul>
              </td>
              <td>₹{q.total?.toFixed(2) || 'N/A'}</td>
              <td>
                <button onClick={() => handleConfirmOrder(q)}>Confirm Order</button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default ViewQuotations;
