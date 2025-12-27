import React, { useState } from "react";

const ScheduleMeetingModal = ({ isOpen, onClose, onSave, enquiry }) => {
  const [date, setDate] = useState("");
  const [time, setTime] = useState("");
  const [place, setPlace] = useState("");

  const handleSubmit = (e) => {
    e.preventDefault();
    onSave({
      enquiryId: enquiry._id,
      customerName: enquiry.customerName,
      date,
      time,
      place,
    });
  };

  if (!isOpen) return null;

  return (
    <div className="modal-overlay">
      <div className="modal-content">
        <h3>Schedule Meeting for {enquiry.customerName}</h3>
        <form onSubmit={handleSubmit}>
          <div>
            <label>Date:</label>
            <input type="date" value={date} onChange={e => setDate(e.target.value)} required />
          </div>
          <div>
            <label>Time:</label>
            <input type="time" value={time} onChange={e => setTime(e.target.value)} required />
          </div>
          <div>
            <label>Place:</label>
            <input type="text" value={place} onChange={e => setPlace(e.target.value)} required />
          </div>
          <div style={{ marginTop: 12 }}>
            <button type="submit">Save</button>
            <button type="button" onClick={onClose} style={{ marginLeft: 8 }}>Cancel</button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ScheduleMeetingModal;
