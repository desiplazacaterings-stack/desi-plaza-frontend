import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useEffect } from "react";
import { useEnquiry } from "../context/EnquiryContext.jsx";
import axios from "axios";
import API_ENDPOINTS from "../config";
import "./Enquiry.css";

function Enquiry() {
  const navigate = useNavigate();
  const { setEnquiry } = useEnquiry();
  const [submitted, setSubmitted] = useState(false);
  const [permissions, setPermissions] = useState({});
  const [userRole, setUserRole] = useState(null);

  const [form, setForm] = useState({
    customerName: "",
    mobile: "",
    email: "",
    eventType: "",
    eventDate: "",
    eventTime: "",
    location: "",
    guests: "",
    notes: ""
  });

  // Fetch user permissions
  useEffect(() => {
    const userData = localStorage.getItem('user');
    const token = localStorage.getItem('token');
    if (userData) {
      try {
        const user = JSON.parse(userData);
        setUserRole(user.role);
        if (user.role === 'admin') {
          setPermissions({ canCreateEnquiry: true });
        } else if (user.role === 'staff' && user._id && token) {
          axios.get(API_ENDPOINTS.ADMIN.GET_PERMISSIONS(user._id), {
            headers: { Authorization: `Bearer ${token}` }
          })
            .then(res => setPermissions(res.data.data.customPermissions || {}))
            .catch(err => {
              console.error("Error fetching permissions:", err);
              setPermissions({});
            });
        } else {
          // Public users can always create enquiries
          setPermissions({ canCreateEnquiry: true });
        }
      } catch (error) {
        console.error('Error parsing user data:', error);
        // Default to allowing enquiry creation for public users
        setPermissions({ canCreateEnquiry: true });
      }
    } else {
      // Public users can create enquiries
      setPermissions({ canCreateEnquiry: true });
    }
  }, []);

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
      axios.post(API_ENDPOINTS.ENQUIRIES.CREATE, form)
        .then((res) => {
          console.log('Enquiry submitted:', res.data);
          // Check if user is logged in
          const userData = localStorage.getItem('user');
          const userRole = userData ? JSON.parse(userData).role : null;
          
          if (userRole === 'admin' || userRole === 'staff') {
            // Logged-in users go to enquiries table
            navigate("/enquiries");
          } else {
            // Public users see thank you message
            setSubmitted(true);
            // Reset form
            setForm({
              customerName: "",
              mobile: "",
              email: "",
              eventType: "",
              eventDate: "",
              eventTime: "",
              location: "",
              guests: "",
              notes: ""
            });
          }
        })
        .catch(err => {
          console.error('Error submitting enquiry:', err);
          alert('Failed to submit enquiry');
        });
  }

  // Show thank you message for public users
  if (submitted) {
    return (
      <div className="enquiry-container">
        <div className="thank-you-message">
          <div className="thank-you-icon">✅</div>
          <h2>Thank You!</h2>
          <p>Thank you for your enquiry.</p>
          <p>We'll call you back soon!</p>
          <button 
            className="back-home-btn" 
            onClick={() => {
              setSubmitted(false);
              navigate('/');
            }}
          >
            Back to Home
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="enquiry-container">
      <h2>Enquiry</h2>

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
            required
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
          <label>Event Time</label>
          <input
            type="time"
            name="eventTime"
            value={form.eventTime}
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

        <button type="submit" disabled={!permissions.canCreateEnquiry} style={!permissions.canCreateEnquiry ? { opacity: 0.5, cursor: 'not-allowed', background: '#ccc' } : {}}>
          {permissions.canCreateEnquiry ? '✓ Submit Enquiry & Continue →' : '✗ You cannot create enquiries'}
        </button>
      </form>
    </div>
  );
}

export default Enquiry;
