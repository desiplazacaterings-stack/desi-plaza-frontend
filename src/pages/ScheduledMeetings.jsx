import React, { useEffect, useState } from "react";
import axios from "axios";
import { Link } from "react-router-dom";
import API_ENDPOINTS from "../config";
import './ScheduledMeetings.css';


const ScheduledMeetings = () => {
  const [meetings, setMeetings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [tab, setTab] = useState('scheduled');

  const fetchMeetings = () => {
    setLoading(true);
    axios.get(API_ENDPOINTS.SCHEDULES.GET_ALL)
      .then(res => {
        setMeetings(res.data);
        setLoading(false);
      })
      .catch(err => {
        setError("Failed to fetch scheduled meetings: " + (err.response?.data?.error || err.message));
        setLoading(false);
      });
  };

  useEffect(() => {
    fetchMeetings();
    const handler = () => fetchMeetings();
    window.addEventListener('scheduledMeetingAdded', handler);
    return () => window.removeEventListener('scheduledMeetingAdded', handler);
  }, []);

  const handleComplete = async (id) => {
    await axios.patch(API_ENDPOINTS.SCHEDULES.COMPLETE(id));
    fetchMeetings();
  };

  const handleCall = (meeting) => {
    window.location.href = `tel:${meeting.enquiryId && meeting.enquiryId.mobile ? meeting.enquiryId.mobile : ''}`;
  };

  const handleMail = (meeting) => {
    window.location.href = `mailto:${meeting.enquiryId && meeting.enquiryId.email ? meeting.enquiryId.email : ''}`;
  };

  if (loading) return <div>Loading...</div>;
  if (error) return <div>{error}</div>;

  const filteredMeetings = meetings.filter(m => tab === 'scheduled' ? !m.completed : m.completed);

  return (
    <div className="scheduled-meetings-dark">
      <h2 className="scheduled-title">Scheduled Meetings</h2>
      <div className="scheduled-tabs">
        <button className={tab === 'scheduled' ? 'tab-btn active' : 'tab-btn'} onClick={() => setTab('scheduled')}>Scheduled</button>
        <button className={tab === 'completed' ? 'tab-btn active' : 'tab-btn'} onClick={() => setTab('completed')}>Completed</button>
      </div>
      <div className="scheduled-table-wrapper">
        <table className="scheduled-table">
          <thead>
            <tr>
              <th>Customer</th>
              <th>Date</th>
              <th>Time</th>
              <th>Place</th>
              <th>Enquiry</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {filteredMeetings.map(meeting => (
              <tr key={meeting._id}>
                <td>{meeting.customerName || (meeting.enquiryId && meeting.enquiryId.customerName)}</td>
                <td>{meeting.date}</td>
                <td>{meeting.time}</td>
                <td>{meeting.place}</td>
                <td>
                  {typeof meeting.enquiryId === 'object' ? (
                    <Link to={`/enquiries#${meeting.enquiryId._id}`}>{meeting.enquiryId._id}</Link>
                  ) : (
                    <Link to={`/enquiries#${meeting.enquiryId}`}>{meeting.enquiryId}</Link>
                  )}
                </td>
                <td className="actions-cell">
                  <button className="action-btn call" onClick={() => handleCall(meeting)}>Call</button>
                  <button className="action-btn mail" onClick={() => handleMail(meeting)}>Mail</button>
                  {tab === 'scheduled' && (
                    <button className="action-btn complete" onClick={() => handleComplete(meeting._id)}>Completed</button>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default ScheduledMeetings;
