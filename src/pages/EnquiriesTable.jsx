import React, { useEffect, useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import API_ENDPOINTS from "../config";
import "./Enquiry.css";

import ScheduleMeetingModal from "../components/ScheduleMeetingModal";


const EnquiriesTable = () => {
  const [enquiries, setEnquiries] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [selectedEnquiry, setSelectedEnquiry] = useState(null);

  const navigate = useNavigate();

  useEffect(() => {
    const token = localStorage.getItem('token');
    axios.get(API_ENDPOINTS.ENQUIRIES.GET_ALL, {
      headers: { Authorization: `Bearer ${token}` }
    })
      .then(res => {
        setEnquiries(res.data);
        setLoading(false);
      })
      .catch(err => {
        setError(err.response?.data?.message || "Failed to fetch enquiries");
        setLoading(false);
      });
  }, []);

  const handleScheduleClick = (enquiry) => {
    setSelectedEnquiry(enquiry);
    setModalOpen(true);
  };

  const handleModalClose = () => {
    setModalOpen(false);
    setSelectedEnquiry(null);
  };

  const handleSaveSchedule = async (scheduleData) => {
    try {
      await axios.post(API_ENDPOINTS.SCHEDULES.CREATE, scheduleData);
      alert(`Meeting scheduled for ${scheduleData.customerName} on ${scheduleData.date} at ${scheduleData.time} in ${scheduleData.place}`);
      // Optionally, trigger a custom event to notify ScheduledMeetings to refresh
      window.dispatchEvent(new Event('scheduledMeetingAdded'));
    } catch (err) {
      alert("Failed to schedule meeting. Please try again.");
    }
    setModalOpen(false);
    setSelectedEnquiry(null);
  };

  if (loading) return <div>Loading...</div>;
  if (error) return <div>{error}</div>;

  return (
    <div className="enquiries-wrapper">
      <h2>All Enquiries</h2>
      <table className="enquiries-table">
        <thead>
          <tr>
            <th>Customer Name</th>
            <th>Mobile</th>
            <th>Email</th>
            <th>Event Type</th>
            <th>Event Date</th>
            <th>Location</th>
            <th>Guests</th>
            <th>Notes</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {enquiries.map(enquiry => (
            <tr key={enquiry._id}>
              <td>{enquiry.customerName}</td>
              <td>{enquiry.mobile}</td>
              <td>{enquiry.email}</td>
              <td>{enquiry.eventType}</td>
              <td>{new Date(enquiry.eventDate).toLocaleDateString()}</td>
              <td>{enquiry.location}</td>
              <td>{enquiry.guests}</td>
              <td>{enquiry.notes}</td>
              <td className="actions-cell">
                <button className="action-btn generate-quotation-btn" onClick={() => navigate("/quotation", { state: { enquiry } })}>
                  Generate Quotation
                </button>
                <button className="action-btn schedule-meeting-btn" onClick={() => handleScheduleClick(enquiry)}>
                  Schedule Meeting
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
      <ScheduleMeetingModal
        isOpen={modalOpen}
        onClose={handleModalClose}
        onSave={handleSaveSchedule}
        enquiry={selectedEnquiry}
      />
    </div>
  );
};

export default EnquiriesTable;
