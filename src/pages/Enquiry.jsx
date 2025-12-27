import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useEnquiry } from "../context/EnquiryContext.jsx";
import axios from "axios";
import "./Enquiry.css";

function Enquiry() {
  const navigate = useNavigate();
  const { setEnquiry } = useEnquiry();

  const [form, setForm] = useState({
    customerName: "",
    mobile: "",
    email: "",
    eventType: "",
    eventDate: "",
    location: "",
    guests: "",
    notes: ""
  });

  function handleChange(e) {
    setForm({
      ...form,
      [e.target.name]: e.target.value
    });
  }

  function handleSubmit(e) {
    e.preventDefault();

    // Save enquiry globally
    setEnquiry(form);

      // Log form data before sending to backend
      console.log('Form data before submit:', form);
      // Send to backend
      axios.post('http://localhost:3000/api/enquiries', form)
        .then((res) => {
          console.log('Enquiry submitted:', res.data);
          // Move to Enquiries table view
          navigate("/enquiries");
        })
        .catch(err => {
          console.error('Error submitting enquiry:', err);
          alert('Failed to submit enquiry');
        });
  }

  return (
    <div className="enquiry-container">
      <h2>Customer Enquiry</h2>

      <form onSubmit={handleSubmit}>
        <div>
          <label>Customer Name</label>
          <input
            type="text"
            name="customerName"
            value={form.customerName}
            onChange={handleChange}
            required
          />
        </div>

        <div>
          <label>Mobile Number</label>
          <input
            type="tel"
            name="mobile"
            value={form.mobile}
            onChange={handleChange}
            required
          />
        </div>

        <div>
          <label>Email</label>
          <input
            type="email"
            name="email"
            value={form.email}
            onChange={handleChange}
          />
        </div>

        <div>
          <label>Event Type</label>
          <select
            name="eventType"
            value={form.eventType}
            onChange={handleChange}
            required
          >
            <option value="">Select</option>
            <option>Wedding</option>
            <option>Reception</option>
            <option>Birthday</option>
            <option>Corporate</option>
            <option>House Party</option>
          </select>
        </div>

        <div>
          <label>Event Date</label>
          <input
            type="date"
            name="eventDate"
            value={form.eventDate}
            onChange={handleChange}
            required
          />
        </div>

        <div>
          <label>Number of Guests</label>
          <input
            type="number"
            name="guests"
            value={form.guests}
            onChange={handleChange}
          />
        </div>

        <div style={{ gridColumn: "1 / -1" }}>
          <label>Location</label>
          <input
            type="text"
            name="location"
            value={form.location}
            onChange={handleChange}
          />
        </div>

        <div style={{ gridColumn: "1 / -1" }}>
          <label>Notes / Requirements</label>
          <textarea
            name="notes"
            value={form.notes}
            onChange={handleChange}
            rows="3"
          />
        </div>

        <button type="submit">
          Submit Enquiry & Continue →
        </button>
      </form>
    </div>
  );
}

export default Enquiry;
