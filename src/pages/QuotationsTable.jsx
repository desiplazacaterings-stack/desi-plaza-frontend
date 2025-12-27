import React, { useEffect, useState } from "react";
import API_ENDPOINTS from "../config";

function QuotationsTable() {
  const [quotations, setQuotations] = useState([]);
  useEffect(() => {
    // Fetch quotations from backend
    fetch(API_ENDPOINTS.QUOTATIONS.GET_ALL)
      .then(res => res.json())
      .then(data => setQuotations(data))
      .catch(err => console.error("Error fetching quotations:", err));
  }, []);

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
          </tr>
        </thead>
        <tbody>
          {quotations.map((q, idx) => (
            <tr key={idx}>
              <td>{q.quotationId}</td>
              <td>{q.enquiry?.customerName}</td>
              <td>{q.enquiry?.mobile}</td>
              <td>{q.enquiry?.email}</td>
              <td>{q.enquiry?.eventType}</td>
              <td>{q.enquiry?.eventDate}</td>
              <td>{q.enquiry?.location}</td>
              <td>{q.enquiry?.guests}</td>
              <td>
                <ul style={{ margin: 0, padding: 0, listStyle: "none" }}>
                  {q.items?.map((item, i) => (
                    <li key={i}>
                      {item.itemName} ({item.unit}) x{item.qty} @ ₹{item.price}
                    </li>
                  ))}
                </ul>
              </td>
              <td>₹{q.total?.toFixed(2)}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export default QuotationsTable;
