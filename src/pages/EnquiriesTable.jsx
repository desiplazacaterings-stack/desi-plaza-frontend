import React, { useEffect, useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import API_ENDPOINTS from "../config";
import usePagination from "../hooks/usePagination";
import Pagination from "../components/Pagination";
import "./Enquiry.css";

import ScheduleMeetingModal from "../components/ScheduleMeetingModal";


const EnquiriesTable = () => {
  const [enquiries, setEnquiries] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [selectedEnquiry, setSelectedEnquiry] = useState(null);
  const [permissions, setPermissions] = useState({});
  const [userRole, setUserRole] = useState(null);
  const [showMapModal, setShowMapModal] = useState(false);
  const [activeTab, setActiveTab] = useState('active');
  const [cancellationReason, setCancellationReason] = useState('');
  const [showCancelModal, setShowCancelModal] = useState(false);
  const [selectedEnquiryForCancel, setSelectedEnquiryForCancel] = useState(null);

  const navigate = useNavigate();

  // Fetch user permissions
  useEffect(() => {
    const userData = localStorage.getItem('user');
    const token = localStorage.getItem('token');
    
    if (userData) {
      try {
        const user = JSON.parse(userData);
        setUserRole(user.role);
        
        // Admins have all permissions
        if (user.role === 'admin') {
          setPermissions({
            canCreateQuotation: true,
            canCreateSchedule: true,
            canViewEnquiries: true
          });
        } else if (user.role === 'staff' && user._id && token) {
          // Fetch staff permissions from backend
          axios.get(API_ENDPOINTS.ADMIN.GET_PERMISSIONS(user._id), {
            headers: { Authorization: `Bearer ${token}` }
          })
            .then(res => {
              setPermissions(res.data.data.customPermissions || {});
            })
            .catch(err => {
              console.error("Error fetching permissions:", err);
              setPermissions({});
            });
        }
      } catch (error) {
        console.error('Error parsing user data:', error);
        setUserRole(null);
      }
    }
  }, []);

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

  // Listen for quotation creation event to refresh enquiries
  useEffect(() => {
    const handleQuotationCreated = () => {
      console.log('Quotation created event received, refreshing enquiries...');
      const token = localStorage.getItem('token');
      axios.get(API_ENDPOINTS.ENQUIRIES.GET_ALL, {
        headers: { Authorization: `Bearer ${token}` }
      })
        .then(res => {
          setEnquiries(res.data);
        })
        .catch(err => {
          console.error('Error refreshing enquiries:', err);
        });
    };

    window.addEventListener('quotationCreated', handleQuotationCreated);
    return () => window.removeEventListener('quotationCreated', handleQuotationCreated);
  }, []);

  const handleScheduleClick = (enquiry) => {
    setSelectedEnquiry(enquiry);
    setModalOpen(true);
  };

  const handleViewLocation = (enquiry) => {
    setSelectedEnquiry(enquiry);
    setShowMapModal(true);
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

  const handleCancelClick = (enquiry) => {
    setSelectedEnquiryForCancel(enquiry);
    setCancellationReason('');
    setShowCancelModal(true);
  };

  const handleCancelEnquiry = async () => {
    if (!selectedEnquiryForCancel) return;

    try {
      const token = localStorage.getItem('token');
      await axios.patch(
        API_ENDPOINTS.ENQUIRIES.CANCEL(selectedEnquiryForCancel._id),
        { reason: cancellationReason },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      
      // Update the local state
      setEnquiries(enquiries.map(e => 
        e._id === selectedEnquiryForCancel._id 
          ? { ...e, status: 'Cancelled', cancellationReason, cancelledAt: new Date() }
          : e
      ));
      
      setShowCancelModal(false);
      setSelectedEnquiryForCancel(null);
      setCancellationReason('');
      alert('Enquiry cancelled successfully!');
    } catch (err) {
      console.error('Error cancelling enquiry:', err);
      alert('Failed to cancel enquiry. Please try again.');
    }
  };

  // Call hooks unconditionally - before any conditional returns
  const pagination = usePagination(enquiries);

  // Filter enquiries based on active tab
  const filteredEnquiries = enquiries.filter(e => {
    if (activeTab === 'active') {
      return e.status !== 'Cancelled';
    } else {
      return e.status === 'Cancelled';
    }
  });

  // Re-paginate filtered enquiries
  const paginatedData = usePagination(filteredEnquiries);

  if (loading) return <div>Loading...</div>;
  if (error) return <div>{error}</div>;

  return (
    <div className="enquiries-wrapper">
      <h2>All Enquiries</h2>
      
      {/* Tab Navigation */}
      <div style={{
        display: 'flex',
        gap: '0',
        marginBottom: '20px',
        borderBottom: '2px solid #ddd'
      }}>
        <button
          onClick={() => setActiveTab('active')}
          style={{
            padding: '12px 24px',
            backgroundColor: activeTab === 'active' ? '#f5ba4a' : '#f0f0f0',
            color: activeTab === 'active' ? '#232a36' : '#666',
            border: 'none',
            borderBottom: activeTab === 'active' ? '3px solid #232a36' : 'none',
            cursor: 'pointer',
            fontWeight: '600',
            fontSize: '1em',
            transition: 'all 0.3s ease'
          }}
        >
          📋 Active Enquiries
        </button>
        <button
          onClick={() => setActiveTab('cancelled')}
          style={{
            padding: '12px 24px',
            backgroundColor: activeTab === 'cancelled' ? '#f5ba4a' : '#f0f0f0',
            color: activeTab === 'cancelled' ? '#232a36' : '#666',
            border: 'none',
            borderBottom: activeTab === 'cancelled' ? '3px solid #232a36' : 'none',
            cursor: 'pointer',
            fontWeight: '600',
            fontSize: '1em',
            transition: 'all 0.3s ease'
          }}
        >
          ✕ Cancelled Enquiries
        </button>
      </div>
      
      <table className="enquiries-table">
        <thead>
          <tr>
            <th>#</th>
            <th>Customer Name</th>
            <th>Mobile</th>
            <th>Email</th>
            <th>Event Type</th>
            <th>Event Date</th>
            <th>Location</th>
            <th>Guests</th>
            <th>Notes</th>
            <th>Status</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {paginatedData.currentItems.map((enquiry, index) => (
            <tr key={enquiry._id}>
              <td data-label="#" className="serial-number">{paginatedData.startIndex + index + 1}</td>
              <td data-label="Customer Name">{enquiry.customerName}</td>
              <td data-label="Mobile">{enquiry.mobile}</td>
              <td data-label="Email">{enquiry.email}</td>
              <td data-label="Event Type">{enquiry.eventType}</td>
              <td data-label="Event Date">{new Date(enquiry.eventDate).toLocaleDateString()}</td>
              <td data-label="Location">
                <button 
                  className="view-location-btn"
                  onClick={() => handleViewLocation(enquiry)}
                  title={enquiry.location}
                >
                  <img src="/G Maps Logo.png" alt="Google Maps" className="map-logo" />
                </button>
              </td>
              <td data-label="Guests">{enquiry.guests}</td>
              <td data-label="Notes">{enquiry.notes}</td>
              <td data-label="Status">
                <span style={{
                  padding: '6px 12px',
                  borderRadius: '4px',
                  fontWeight: 'bold',
                  fontSize: '0.85em',
                  backgroundColor: enquiry.quotationStatus === 'Quotation Generated' ? '#d4edda' : '#fff3cd',
                  color: enquiry.quotationStatus === 'Quotation Generated' ? '#155724' : '#856404'
                }}>
                  {enquiry.quotationStatus || 'Pending'}
                </span>
              </td>
              <td data-label="Actions" className="actions-cell">
                {activeTab === 'active' ? (
                  <>
                    {permissions.canCreateQuotation && (
                      <button className="action-btn generate-quotation-btn" onClick={() => navigate("/quotation", { state: { enquiry } })}>
                        Generate Quotation
                      </button>
                    )}
                    {!permissions.canCreateQuotation && (
                      <button className="action-btn" style={{ opacity: 0.5, cursor: 'not-allowed', background: '#ccc' }} disabled title="You don't have permission to generate quotations">
                        Generate Quotation
                      </button>
                    )}
                    {permissions.canCreateSchedule && (
                      <button className="action-btn schedule-meeting-btn" onClick={() => handleScheduleClick(enquiry)}>
                        Schedule Meeting
                      </button>
                    )}
                    {!permissions.canCreateSchedule && (
                      <button className="action-btn" style={{ opacity: 0.5, cursor: 'not-allowed', background: '#ccc' }} disabled title="You don't have permission to schedule meetings">
                        Schedule Meeting
                      </button>
                    )}
                    <button 
                      className="action-btn cancel-enquiry-btn" 
                      onClick={() => handleCancelClick(enquiry)}
                      style={{ background: '#dc3545', color: '#fff' }}
                      title="Cancel Enquiry"
                    >
                      ✕ Cancel
                    </button>
                  </>
                ) : (
                  <span style={{ color: '#999', fontSize: '0.9em' }}>Cancelled on {new Date(enquiry.cancelledAt).toLocaleDateString()}</span>
                )}
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      {filteredEnquiries.length === 0 && (
        <div style={{ textAlign: 'center', padding: '40px', color: '#999' }}>
          {activeTab === 'active' ? 'No active enquiries found.' : 'No cancelled enquiries found.'}
        </div>
      )}

      <Pagination 
        currentPage={paginatedData.currentPage}
        totalPages={paginatedData.totalPages}
        totalItems={paginatedData.totalItems}
        onPageChange={paginatedData.goToPage}
      />

      {/* Location Map Modal */}
      {showMapModal && selectedEnquiry && (
        <div className="modal-overlay" onClick={() => setShowMapModal(false)}>
          <div className="modal-content location-modal" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2>
                <svg className="map-icon" viewBox="0 0 24 32" width="24" height="32" fill="#4285F4">
                  <path d="M12 0C5.4 0 0 5.4 0 12c0 9 12 20 12 20s12-11 12-20c0-6.6-5.4-12-12-12zm0 16c-2.2 0-4-1.8-4-4s1.8-4 4-4 4 1.8 4 4-1.8 4-4 4z"/>
                </svg>
                Event Location
              </h2>
              <button className="close-btn" onClick={() => setShowMapModal(false)}>✕</button>
            </div>

            <div className="modal-body">
              <div className="location-info">
                <p><strong>Customer:</strong> {selectedEnquiry.customerName}</p>
                <p><strong>Location:</strong> {selectedEnquiry.location}</p>
                <p><strong>Event Date:</strong> {new Date(selectedEnquiry.eventDate).toLocaleDateString('en-IN')}</p>
              </div>

              <div className="map-links">
                <a 
                  href={`https://www.google.com/maps/search/${encodeURIComponent(selectedEnquiry.location)}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="map-link-btn"
                >
                  🔗 View in Google Maps
                </a>
                <a 
                  href={`https://www.google.com/maps/dir/?api=1&destination=${encodeURIComponent(selectedEnquiry.location)}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="map-link-btn directions-btn"
                >
                  🧭 Get Directions
                </a>
              </div>
            </div>

            <div className="modal-footer">
              <button 
                className="cancel-btn" 
                onClick={() => setShowMapModal(false)}
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Cancel Enquiry Modal */}
      {showCancelModal && selectedEnquiryForCancel && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundColor: 'rgba(0,0,0,0.5)',
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          zIndex: 1001
        }}>
          <div style={{
            backgroundColor: '#fff',
            padding: '30px',
            borderRadius: '8px',
            maxWidth: '400px',
            boxShadow: '0 4px 20px rgba(0,0,0,0.3)'
          }}>
            <h3 style={{ marginTop: 0, marginBottom: '20px' }}>Cancel Enquiry</h3>
            <p><strong>Customer:</strong> {selectedEnquiryForCancel.customerName}</p>
            <p><strong>Mobile:</strong> {selectedEnquiryForCancel.mobile}</p>
            
            <div style={{ marginBottom: '15px' }}>
              <label style={{ display: 'block', marginBottom: '8px', fontWeight: '600' }}>
                Reason for Cancellation (Optional):
              </label>
              <textarea
                value={cancellationReason}
                onChange={(e) => setCancellationReason(e.target.value)}
                placeholder="Enter reason for cancellation..."
                style={{
                  width: '100%',
                  padding: '10px',
                  border: '1px solid #ddd',
                  borderRadius: '4px',
                  fontFamily: 'inherit',
                  minHeight: '100px',
                  boxSizing: 'border-box'
                }}
              />
            </div>

            <div style={{ display: 'flex', gap: '10px', justifyContent: 'flex-end' }}>
              <button
                onClick={() => {
                  setShowCancelModal(false);
                  setSelectedEnquiryForCancel(null);
                  setCancellationReason('');
                }}
                style={{
                  padding: '10px 20px',
                  backgroundColor: '#6c757d',
                  color: '#fff',
                  border: 'none',
                  borderRadius: '4px',
                  cursor: 'pointer',
                  fontWeight: '600'
                }}
              >
                No, Keep It
              </button>
              <button
                onClick={handleCancelEnquiry}
                style={{
                  padding: '10px 20px',
                  backgroundColor: '#dc3545',
                  color: '#fff',
                  border: 'none',
                  borderRadius: '4px',
                  cursor: 'pointer',
                  fontWeight: '600'
                }}
              >
                Yes, Cancel Enquiry
              </button>
            </div>
          </div>
        </div>
      )}

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
