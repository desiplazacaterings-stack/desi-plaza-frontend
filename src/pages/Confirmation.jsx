import React from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import printAgreement from '../utils/printAgreement';

function Confirmation() {
  const location = useLocation();
  const navigate = useNavigate();
  
  // Destructure data passed from Quotation page
  const { quotationId, enquiry, items, total } = location.state || {};

  // Handle case where user navigates directly without state
  if (!location.state) {
    return (
      <div style={{ padding: 20, textAlign: 'center' }}>
        <h2>No Order Details Found</h2>
        <p>Please go back and create a quotation first.</p>
        <button 
          onClick={() => navigate('/quotations')}
          style={{ padding: '8px 16px', cursor: 'pointer' }}
        >
          Go to Quotations
        </button>
      </div>
    );
  }

  const handlePlaceOrder = () => {
    // Placeholder for backend submission logic
    // e.g., axios.post('http://localhost:3000/api/orders', { ... })
    
    alert(`Order ${quotationId} confirmed successfully!`);
    navigate('/'); 
  };

  return (
    <div className="confirmation-container" style={{ maxWidth: 800, margin: '20px auto', padding: 20, fontFamily: 'Arial, sans-serif' }}>
      <h1 style={{ borderBottom: '2px solid #eee', paddingBottom: 10 }}>Order Confirmation</h1>
      
      <div style={{ background: '#f9f9f9', padding: 20, borderRadius: 8, marginBottom: 20 }}>
        <h3 style={{ marginTop: 0 }}>Customer Details</h3>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
          <div><strong>Quotation ID:</strong> {quotationId}</div>
          <div><strong>Name:</strong> {enquiry.customerName}</div>
          <div><strong>Mobile:</strong> {enquiry.mobile}</div>
          {enquiry.email && <div><strong>Email:</strong> {enquiry.email}</div>}
          {enquiry.eventType && <div><strong>Event Type:</strong> {enquiry.eventType}</div>}
          {enquiry.eventDate && <div><strong>Event Date:</strong> {enquiry.eventDate}</div>}
          {enquiry.location && <div><strong>Location:</strong> {enquiry.location}</div>}
          {enquiry.guests && <div><strong>Guests:</strong> {enquiry.guests}</div>}
        </div>
        {enquiry.notes && (
          <div style={{ marginTop: 10 }}>
            <strong>Notes:</strong> {enquiry.notes}
          </div>
        )}
      </div>

      <div style={{ marginBottom: 20 }}>
        <h3>Order Summary</h3>
        <table style={{ width: '100%', borderCollapse: 'collapse', border: '1px solid #ddd' }}>
          <thead>
            <tr style={{ background: '#f0f0f0' }}>
              <th style={{ padding: 10, border: '1px solid #ddd', textAlign: 'left' }}>#</th>
              <th style={{ padding: 10, border: '1px solid #ddd', textAlign: 'left' }}>Item Name</th>
              <th style={{ padding: 10, border: '1px solid #ddd', textAlign: 'center' }}>Unit</th>
              <th style={{ padding: 10, border: '1px solid #ddd', textAlign: 'center' }}>Qty</th>
              <th style={{ padding: 10, border: '1px solid #ddd', textAlign: 'right' }}>Price</th>
              <th style={{ padding: 10, border: '1px solid #ddd', textAlign: 'right' }}>Total</th>
            </tr>
          </thead>
          <tbody>
            {items.map((item, index) => (
              <tr key={index}>
                <td style={{ padding: 10, border: '1px solid #ddd' }}>{index + 1}</td>
                <td style={{ padding: 10, border: '1px solid #ddd' }}>{item.itemName}</td>
                <td style={{ padding: 10, border: '1px solid #ddd', textAlign: 'center' }}>{item.unit}</td>
                <td style={{ padding: 10, border: '1px solid #ddd', textAlign: 'center' }}>{item.qty}</td>
                <td style={{ padding: 10, border: '1px solid #ddd', textAlign: 'right' }}>${Number(item.price).toFixed(2)}</td>
                <td style={{ padding: 10, border: '1px solid #ddd', textAlign: 'right' }}>₹{(item.price * item.qty).toFixed(2)}</td>
              </tr>
            ))}
          </tbody>
          <tfoot>
            <tr style={{ background: '#f9f9f9', fontWeight: 'bold' }}>
              <td colSpan={5} style={{ padding: 10, border: '1px solid #ddd', textAlign: 'right' }}>Grand Total</td>
              <td style={{ padding: 10, border: '1px solid #ddd', textAlign: 'right' }}>₹{Number(total).toFixed(2)}</td>
            </tr>
          </tfoot>
        </table>
      </div>

      <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 15 }}>
        <button 
          onClick={() => navigate(-1)} 
          style={{ padding: '10px 20px', borderRadius: 4, border: '1px solid #ccc', background: '#fff', cursor: 'pointer' }}
        >
          Back to Edit
        </button>
        <button 
          onClick={() => printAgreement(enquiry)}
          style={{ padding: '10px 20px', borderRadius: 4, border: '1px solid #f39c12', background: '#fff', color: '#f39c12', fontWeight: 'bold', cursor: 'pointer' }}
        >
          Print Agreement
        </button>
        <button 
          onClick={handlePlaceOrder}
          style={{ padding: '10px 20px', borderRadius: 4, border: 'none', background: '#28a745', color: 'white', fontWeight: 'bold', cursor: 'pointer' }}
        >
          Confirm & Place Order
        </button>
      </div>
    </div>
  );
}

export default Confirmation;