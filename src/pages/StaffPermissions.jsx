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
  const [expandedCategory, setExpandedCategory] = useState(null);
  
  const token = localStorage.getItem("token");

  // Define permission categories with all permissions
  const permissionCategories = [
    {
      title: "📦 Orders Management (Instant Orders)",
      icon: "📦",
      permissions: [
        { key: "canCreateInstantOrder", label: "Create Orders", desc: "Create new instant orders" },
        { key: "canViewInstantOrders", label: "View Orders", desc: "View list of all orders" },
        { key: "canEditInstantOrder", label: "Edit Orders", desc: "Edit existing orders" },
        { key: "canDeleteInstantOrder", label: "Delete Orders", desc: "Delete orders" },
        { key: "canViewOrderDetails", label: "View Details", desc: "View complete order information" },
        { key: "canUpdateOrderStatus", label: "Update Status", desc: "Change order status" },
      ]
    },
    {
      title: "💬 Enquiries Management",
      icon: "💬",
      permissions: [
        { key: "canCreateEnquiry", label: "Create Enquiry", desc: "Create new enquiries" },
        { key: "canViewEnquiries", label: "View Enquiries", desc: "View all enquiries" },
        { key: "canEditEnquiry", label: "Edit Enquiry", desc: "Edit enquiry details" },
        { key: "canDeleteEnquiry", label: "Delete Enquiry", desc: "Delete enquiries" },
        { key: "canReplyToEnquiry", label: "Reply to Enquiry", desc: "Send replies to enquiries" },
      ]
    },
    {
      title: "💵 Quotations Management",
      icon: "💵",
      permissions: [
        { key: "canCreateQuotation", label: "Create Quotation", desc: "Create new quotations" },
        { key: "canViewQuotations", label: "View Quotations", desc: "View all quotations" },
        { key: "canEditQuotation", label: "Edit Quotation", desc: "Edit quotation details" },
        { key: "canDeleteQuotation", label: "Delete Quotation", desc: "Delete quotations" },
        { key: "canSendQuotation", label: "Send Quotation", desc: "Send quotations to customers" },
        { key: "canApproveQuotation", label: "Approve Quotation", desc: "Approve customer quotations" },
      ]
    },
    {
      title: "🍽️ Menu Management",
      icon: "🍽️",
      permissions: [
        { key: "canViewMenu", label: "View Menu", desc: "Browse menu items" },
        { key: "canAddMenuItems", label: "Add Menu Items", desc: "Create new menu items" },
        { key: "canEditMenuItems", label: "Edit Menu Items", desc: "Edit menu item details" },
        { key: "canDeleteMenuItems", label: "Delete Menu Items", desc: "Remove menu items" },
        { key: "canManageMenuCategories", label: "Manage Categories", desc: "Create and edit categories" },
        { key: "canViewMenuPrices", label: "View Prices", desc: "View menu item prices" },
      ]
    },
    {
      title: "💳 Payments Management",
      icon: "💳",
      permissions: [
        { key: "canViewPayments", label: "View Payments", desc: "View payment records" },
        { key: "canRecordPayment", label: "Record Payment", desc: "Record new payments" },
        { key: "canEditPayment", label: "Edit Payment", desc: "Modify payment records" },
        { key: "canDeletePayment", label: "Delete Payment", desc: "Delete payment records" },
        { key: "canGenerateInvoices", label: "Generate Invoices", desc: "Create invoices" },
        { key: "canViewPaymentReports", label: "Payment Reports", desc: "View payment analytics" },
      ]
    },
    {
      title: "📅 Schedules & Events",
      icon: "📅",
      permissions: [
        { key: "canCreateSchedule", label: "Create Schedule", desc: "Create new schedules" },
        { key: "canViewSchedules", label: "View Schedules", desc: "View all schedules" },
        { key: "canEditSchedule", label: "Edit Schedule", desc: "Edit schedule details" },
        { key: "canDeleteSchedule", label: "Delete Schedule", desc: "Delete schedules" },
        { key: "canCompleteSchedule", label: "Complete Schedule", desc: "Mark schedules complete" },
        { key: "canViewEvents", label: "View Events", desc: "View all events" },
        { key: "canCreateEvent", label: "Create Event", desc: "Create new events" },
        { key: "canEditEvent", label: "Edit Event", desc: "Edit event details" },
        { key: "canDeleteEvent", label: "Delete Event", desc: "Delete events" },
        { key: "canAssignTeamToEvent", label: "Assign Team", desc: "Assign staff to events" },
        { key: "canCompleteEvent", label: "Complete Event", desc: "Mark events complete" },
      ]
    },
    {
      title: "📊 Reports & Analytics",
      icon: "📊",
      permissions: [
        { key: "canViewReports", label: "View Reports", desc: "Access business reports" },
        { key: "canViewSalesReports", label: "Sales Reports", desc: "View sales data" },
        { key: "canViewCustomerReports", label: "Customer Reports", desc: "View customer analytics" },
        { key: "canViewEventReports", label: "Event Reports", desc: "View event statistics" },
        { key: "canExportReports", label: "Export Reports", desc: "Download report data" },
      ]
    },
    {
      title: "👥 User Management",
      icon: "👥",
      permissions: [
        { key: "canViewUsers", label: "View Users", desc: "View user list" },
        { key: "canCreateUser", label: "Create User", desc: "Create new users" },
        { key: "canEditUser", label: "Edit User", desc: "Edit user details" },
        { key: "canDeleteUser", label: "Delete User", desc: "Delete users" },
        { key: "canChangeUserRole", label: "Change Role", desc: "Modify user roles" },
        { key: "canManageUserPermissions", label: "Manage Permissions", desc: "Assign permissions" },
      ]
    },
    {
      title: "⚙️ Settings & Configuration",
      icon: "⚙️",
      permissions: [
        { key: "canViewSettings", label: "View Settings", desc: "Access settings panel" },
        { key: "canEditGeneralSettings", label: "Edit Settings", desc: "Modify system settings" },
        { key: "canManageRoles", label: "Manage Roles", desc: "Create and edit roles" },
        { key: "canViewAuditLogs", label: "View Audit Logs", desc: "Access activity logs" },
      ]
    },
  ];

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
      console.log("Permissions response:", response.data);
      setPermissions(response.data.data.customPermissions || {});
      setMessage("");
      setExpandedCategory(null);
    } catch (error) {
      console.error("Error fetching permissions:", error.response?.data || error.message);
      const errorMessage = error.response?.data?.message || error.response?.data?.error || error.message;
      setMessage(`Failed to load permissions: ${errorMessage}`);
    } finally {
      setLoading(false);
    }
  };

  const handlePermissionChange = (key, value) => {
    const updatedPermissions = {
      ...permissions,
      [key]: value,
    };

    // Auto-enable corresponding "View" permissions when "Create" is enabled
    if (value === true) {
      if (key === "canCreateInstantOrder") {
        updatedPermissions.canViewInstantOrders = true;
      } else if (key === "canCreateEnquiry") {
        updatedPermissions.canViewEnquiries = true;
      } else if (key === "canCreateQuotation") {
        updatedPermissions.canViewQuotations = true;
      } else if (key === "canCreateSchedule") {
        updatedPermissions.canViewSchedules = true;
      } else if (key === "canCreateEvent") {
        updatedPermissions.canViewEvents = true;
      } else if (key === "canAddMenuItems") {
        updatedPermissions.canViewMenu = true;
      } else if (key === "canRecordPayment") {
        updatedPermissions.canViewPayments = true;
      } else if (key === "canCreateUser") {
        updatedPermissions.canViewUsers = true;
      }
    }

    setPermissions(updatedPermissions);
  };

  const handleToggleCategory = (categoryTitle) => {
    setExpandedCategory(expandedCategory === categoryTitle ? null : categoryTitle);
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

  // Helper function to count enabled permissions in category
  const getEnabledCount = (category) => {
    return category.permissions.filter(p => permissions[p.key] !== false).length;
  };

  const selectedStaffName = staff.find(s => s._id === selectedStaff)?.name || "";

  return (
    <div className="staff-permissions-container">
      <h2>🔐 Comprehensive Staff Permissions Management</h2>

      <div className="permissions-layout">
        {/* Staff List */}
        <div className="staff-list-section">
          <h3>👥 Select Staff Member</h3>
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
                    <div className="staff-role">Staff</div>
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
              <div className="section-header">
                <h3>✨ Permissions for <strong>{selectedStaffName}</strong></h3>
                {message && <div className={`message ${message.includes("✅") ? "success" : "error"}`}>{message}</div>}
              </div>

              {loading ? (
                <p className="loading">Loading permissions...</p>
              ) : (
                <>
                  <div className="permissions-categories">
                    {permissionCategories.map((category) => (
                      <div key={category.title} className="permission-category">
                        <div
                          className="category-header"
                          onClick={() => handleToggleCategory(category.title)}
                        >
                          <div className="category-title">
                            <span className="category-icon">{category.icon}</span>
                            <span>{category.title}</span>
                          </div>
                          <div className="category-stats">
                            <span className="permission-count">
                              {getEnabledCount(category)}/{category.permissions.length} enabled
                            </span>
                            <span className={`toggle-icon ${expandedCategory === category.title ? "expanded" : ""}`}>
                              ▶
                            </span>
                          </div>
                        </div>

                        {expandedCategory === category.title && (
                          <div className="category-permissions">
                            {category.permissions.map((perm) => (
                              <div key={perm.key} className="permission-item">
                                <label className="permission-label">
                                  <input
                                    type="checkbox"
                                    checked={permissions[perm.key] !== false}
                                    onChange={(e) => handlePermissionChange(perm.key, e.target.checked)}
                                  />
                                  <span className="permission-text">
                                    <strong>{perm.label}</strong>
                                    <small>{perm.desc}</small>
                                  </span>
                                </label>
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    ))}
                  </div>

                  <div className="permissions-actions">
                    <button
                      className="save-btn"
                      onClick={handleSavePermissions}
                      disabled={loading}
                    >
                      {loading ? "💾 Saving..." : "💾 Save All Permissions"}
                    </button>
                    <p className="info-text">
                      ℹ️ Click on category headers to expand and manage permissions
                    </p>
                  </div>
                </>
              )}
            </>
          ) : (
            <div className="select-staff-message">
              <div className="empty-state">
                <h4>👈 Select a staff member to manage permissions</h4>
                <p>Choose from the staff list on the left to configure access levels</p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default StaffPermissions;
