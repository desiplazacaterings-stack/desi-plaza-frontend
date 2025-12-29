import { useState, useEffect } from "react";
import axios from "axios";
import API_ENDPOINTS from "../config";
import "./StaffPermissions.css";

function StaffPermissions() {
  const [staff, setStaff] = useState([]);
  const [selectedStaff, setSelectedStaff] = useState(null);
  const [permissions, setPermissions] = useState({});
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");

  useEffect(() => {
    fetchStaff();
  }, []);

  const fetchStaff = async () => {
    try {
      const response = await axios.get(`${API_ENDPOINTS.ADMIN.USERS}?role=staff`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setStaff(response.data.data.users);
    } catch (error) {
      console.error("Error fetching staff:", error);
      setMessage("Failed to load staff members");
    }
  };

  const handleSelectStaff = async (staffId) => {
    setSelectedStaff(staffId);
    setLoading(true);
    try {
      const response = await axios.get(API_ENDPOINTS.ADMIN.GET_PERMISSIONS(staffId), {
        headers: { Authorization: `Bearer ${token}` }
      });
      setPermissions(response.data.data.customPermissions || {});
      setMessage("");
    } catch (error) {
      console.error("Error fetching permissions:", error);
      setMessage("Failed to load permissions");
    } finally {
      setLoading(false);
    }
  };

  const handlePermissionChange = (key, value) => {
    setPermissions({
      ...permissions,
      [key]: value,
    });
  };

  const handleSavePermissions = async () => {
    if (!selectedStaff) return;
    
    setLoading(true);
    try {
      await axios.patch(
        API_ENDPOINTS.ADMIN.UPDATE_PERMISSIONS(selectedStaff),
        { customPermissions: permissions },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setMessage("✅ Permissions updated successfully!");
      setTimeout(() => setMessage(""), 3000);
    } catch (error) {
      console.error("Error updating permissions:", error);
      setMessage("❌ Failed to update permissions");
    } finally {
      setLoading(false);
    }
  };

  const selectedStaffName = staff.find(s => s._id === selectedStaff)?.name || "";

  return (
    <div className="staff-permissions-container">
      <h2>Staff Permissions Management</h2>

      <div className="permissions-layout">
        {/* Staff List */}
        <div className="staff-list-section">
          <h3>Select Staff Member</h3>
          <div className="staff-list">
            {staff.length === 0 ? (
              <p className="no-staff">No staff members found</p>
            ) : (
              staff.map((member) => (
                <button
                  key={member._id}
                  className={`staff-item ${selectedStaff === member._id ? "selected" : ""}`}
                  onClick={() => handleSelectStaff(member._id)}
                >
                  <div className="staff-info">
                    <div className="staff-name">{member.name}</div>
                    <div className="staff-email">{member.email}</div>
                  </div>
                </button>
              ))
            )}
          </div>
        </div>

        {/* Permissions Panel */}
        <div className="permissions-section">
          {selectedStaff ? (
            <>
              <h3>Permissions for {selectedStaffName}</h3>
              {message && <div className={`message ${message.includes("✅") ? "success" : "error"}`}>{message}</div>}

              {loading ? (
                <p>Loading permissions...</p>
              ) : (
                <>
                  <div className="permissions-grid">
                    <div className="permission-item">
                      <label>
                        <input
                          type="checkbox"
                          checked={permissions.canCreateInstantOrder !== false}
                          onChange={(e) => handlePermissionChange("canCreateInstantOrder", e.target.checked)}
                        />
                        <span>Create Instant Orders</span>
                      </label>
                      <p className="permission-desc">Allow creating quick orders and KOT</p>
                    </div>

                    <div className="permission-item">
                      <label>
                        <input
                          type="checkbox"
                          checked={permissions.canViewInstantOrders !== false}
                          onChange={(e) => handlePermissionChange("canViewInstantOrders", e.target.checked)}
                        />
                        <span>View Instant Orders</span>
                      </label>
                      <p className="permission-desc">Access instant orders list and details</p>
                    </div>

                    <div className="permission-item">
                      <label>
                        <input
                          type="checkbox"
                          checked={permissions.canCreateEnquiry !== false}
                          onChange={(e) => handlePermissionChange("canCreateEnquiry", e.target.checked)}
                        />
                        <span>Create Enquiries</span>
                      </label>
                      <p className="permission-desc">Submit new enquiries</p>
                    </div>

                    <div className="permission-item">
                      <label>
                        <input
                          type="checkbox"
                          checked={permissions.canViewEnquiries !== false}
                          onChange={(e) => handlePermissionChange("canViewEnquiries", e.target.checked)}
                        />
                        <span>View Enquiries</span>
                      </label>
                      <p className="permission-desc">View and manage enquiries</p>
                    </div>

                    <div className="permission-item">
                      <label>
                        <input
                          type="checkbox"
                          checked={permissions.canViewMenu !== false}
                          onChange={(e) => handlePermissionChange("canViewMenu", e.target.checked)}
                        />
                        <span>View Menu</span>
                      </label>
                      <p className="permission-desc">Browse menu items</p>
                    </div>

                    <div className="permission-item">
                      <label>
                        <input
                          type="checkbox"
                          checked={permissions.canManageQuotations !== false}
                          onChange={(e) => handlePermissionChange("canManageQuotations", e.target.checked)}
                        />
                        <span>Manage Quotations</span>
                      </label>
                      <p className="permission-desc">Create and manage quotations</p>
                    </div>

                    <div className="permission-item">
                      <label>
                        <input
                          type="checkbox"
                          checked={permissions.canViewReports !== false}
                          onChange={(e) => handlePermissionChange("canViewReports", e.target.checked)}
                        />
                        <span>View Reports</span>
                      </label>
                      <p className="permission-desc">Access business reports and analytics</p>
                    </div>
                  </div>

                  <button
                    className="save-btn"
                    onClick={handleSavePermissions}
                    disabled={loading}
                  >
                    {loading ? "Saving..." : "Save Permissions"}
                  </button>
                </>
              )}
            </>
          ) : (
            <div className="select-staff-message">
              <p>👈 Select a staff member to manage their permissions</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default StaffPermissions;
