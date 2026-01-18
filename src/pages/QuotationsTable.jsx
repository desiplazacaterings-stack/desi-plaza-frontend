import React, { useEffect, useState } from "react";
import API_ENDPOINTS from "../config";
import "./ViewQuotations.css";

function QuotationsTable() {
  const [quotations, setQuotations] = useState([]);
  const [selectedItems, setSelectedItems] = useState(null);
  const [showModal, setShowModal] = useState(false);

  useEffect(() => {
    // Fetch quotations from backend
    fetch(API_ENDPOINTS.QUOTATIONS.GET_ALL)
      .then(res => res.json())
      .then(data => setQuotations(data))
      .catch(err => console.error("Error fetching quotations:", err));
  }, []);

  const handleViewItems = (items) => {
    setSelectedItems(items);
    setShowModal(true);
  };

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
          {quotations.map((q, idx) => (
            <tr key={idx}>
              <td data-label="Quotation ID">{q.quotationId}</td>
              <td data-label="Customer Name">{q.enquiry?.customerName}</td>
              <td data-label="Mobile">{q.enquiry?.mobile}</td>
              <td data-label="Email">{q.enquiry?.email}</td>
              <td data-label="Event Type">{q.enquiry?.eventType}</td>
              <td data-label="Event Date">{q.enquiry?.eventDate}</td>
              <td data-label="Location">{q.enquiry?.location}</td>
              <td data-label="Guests">{q.enquiry?.guests}</td>
              <td data-label="Line Items" style={{ textAlign: "center" }}>
                <button 
                  onClick={() => handleViewItems(q.items)}
                  style={{
                    padding: "6px 12px",
                    backgroundColor: "#ffc107",
                    border: "none",
                    borderRadius: "4px",
                    cursor: "pointer",
                    fontWeight: "bold",
                    fontSize: "0.85em"
                  }}
                >
                  View Items
                </button>
              </td>
              <td data-label="Total">${q.total?.toFixed(2)}</td>
            </tr>
          ))}
        </tbody>
      </table>

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
}

export default QuotationsTable;
