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

  const [otherEventType, setOtherEventType] = useState("");

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
    const { name, value } = e.target;
    
    // If event type is being changed, reset otherEventType if not "Other"
    if (name === 'eventType' && value !== 'Other') {
      setOtherEventType("");
    }
    
    setForm({
      ...form,
      [name]: value
    });
  }

  function handleSubmit(e) {
    e.preventDefault();

    // Prepare form data with other event type if applicable
    const submissionData = {
      ...form,
      eventType: form.eventType === 'Other' ? otherEventType : form.eventType
    };

    // Validate that other event type is filled if selected
    if (form.eventType === 'Other' && !otherEventType.trim()) {
      alert('Please specify the event type');
      return;
    }

    // Save enquiry globally
    setEnquiry(submissionData);

      // Log form data before sending to backend
      console.log('Form data before submit:', submissionData);
      // Send to backend
      axios.post(API_ENDPOINTS.ENQUIRIES.CREATE, submissionData)
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
            setOtherEventType("");
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
            onChange={(e) => {
              e.target.value = e.target.value.replace(/\D/g, '').slice(0, 10);
              handleChange(e);
            }}
            required
            maxLength="10"
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
            <option>Sangeeth</option>
            <option>Mehendi</option>
            <option>Birthday</option>
            <option>Graduation Party</option>
            <option>Other</option>
          </select>
        </div>

        {form.eventType === 'Other' && (
          <div>
            <label>Specify Event Type</label>
            <input
              type="text"
              value={otherEventType}
              onChange={(e) => setOtherEventType(e.target.value)}
              placeholder="Enter your event type"
              required
            />
          </div>
        )}

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

        <div>
          <label>Location</label>
          <input
            type="text"
            name="location"
            value={form.location}
            onChange={handleChange}
          />
        </div>

        <div className="full-width">
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
