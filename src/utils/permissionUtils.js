/**
 * Permission Utility Functions
 * Helper functions for checking and managing user permissions throughout the app
 */

// Define all permission categories and their permissions
export const PERMISSION_CATEGORIES = {
  ORDERS: {
    title: "Orders Management",
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
  ENQUIRIES: {
    title: "Enquiries Management",
    icon: "💬",
    permissions: [
      { key: "canCreateEnquiry", label: "Create Enquiry", desc: "Create new enquiries" },
      { key: "canViewEnquiries", label: "View Enquiries", desc: "View all enquiries" },
      { key: "canEditEnquiry", label: "Edit Enquiry", desc: "Edit enquiry details" },
      { key: "canDeleteEnquiry", label: "Delete Enquiry", desc: "Delete enquiries" },
      { key: "canReplyToEnquiry", label: "Reply to Enquiry", desc: "Send replies to enquiries" },
    ]
  },
  QUOTATIONS: {
    title: "Quotations Management",
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
  MENU: {
    title: "Menu Management",
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
  PAYMENTS: {
    title: "Payments Management",
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
  SCHEDULES_EVENTS: {
    title: "Schedules & Events",
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
  REPORTS: {
    title: "Reports & Analytics",
    icon: "📊",
    permissions: [
      { key: "canViewReports", label: "View Reports", desc: "Access business reports" },
      { key: "canViewSalesReports", label: "Sales Reports", desc: "View sales data" },
      { key: "canViewCustomerReports", label: "Customer Reports", desc: "View customer analytics" },
      { key: "canViewEventReports", label: "Event Reports", desc: "View event statistics" },
      { key: "canExportReports", label: "Export Reports", desc: "Download report data" },
    ]
  },
  USERS: {
    title: "User Management",
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
  SETTINGS: {
    title: "Settings & Configuration",
    icon: "⚙️",
    permissions: [
      { key: "canViewSettings", label: "View Settings", desc: "Access settings panel" },
      { key: "canEditGeneralSettings", label: "Edit Settings", desc: "Modify system settings" },
      { key: "canManageRoles", label: "Manage Roles", desc: "Create and edit roles" },
      { key: "canViewAuditLogs", label: "View Audit Logs", desc: "Access activity logs" },
    ]
  }
};

/**
 * Check if user has a specific permission
 * @param {string} permissionKey - The permission key to check
 * @param {object} userPermissions - User's permissions object from localStorage
 * @returns {boolean} - True if user has the permission
 */
export const hasPermission = (permissionKey, userPermissions) => {
  if (!userPermissions || typeof userPermissions !== 'object') {
    return false;
  }
  return userPermissions[permissionKey] === true;
};

/**
 * Check if user has ANY of the given permissions
 * @param {string[]} permissionKeys - Array of permission keys to check
 * @param {object} userPermissions - User's permissions object
 * @returns {boolean} - True if user has at least one permission
 */
export const hasAnyPermission = (permissionKeys, userPermissions) => {
  if (!Array.isArray(permissionKeys)) {
    return hasPermission(permissionKeys, userPermissions);
  }
  return permissionKeys.some(key => hasPermission(key, userPermissions));
};

/**
 * Check if user has ALL of the given permissions
 * @param {string[]} permissionKeys - Array of permission keys to check
 * @param {object} userPermissions - User's permissions object
 * @returns {boolean} - True if user has all permissions
 */
export const hasAllPermissions = (permissionKeys, userPermissions) => {
  if (!Array.isArray(permissionKeys)) {
    return hasPermission(permissionKeys, userPermissions);
  }
  return permissionKeys.every(key => hasPermission(key, userPermissions));
};

/**
 * Get user's permissions from localStorage
 * @returns {object} - User's permissions object or empty object
 */
export const getUserPermissions = () => {
  try {
    const user = localStorage.getItem('user');
    if (!user) return {};
    const userData = JSON.parse(user);
    // For admin users, return all permissions as true
    if (userData.role === 'admin') {
      return getAllPermissions();
    }
    return userData.customPermissions || {};
  } catch (error) {
    console.error('Error getting user permissions:', error);
    return {};
  }
};

/**
 * Get all available permissions as a boolean object (for admin)
 * @returns {object} - All permissions set to true
 */
export const getAllPermissions = () => {
  const allPermissions = {};
  Object.values(PERMISSION_CATEGORIES).forEach(category => {
    category.permissions.forEach(perm => {
      allPermissions[perm.key] = true;
    });
  });
  return allPermissions;
};

/**
 * Get a specific permission from a category by key
 * @param {string} permissionKey - The permission key
 * @returns {object} - Permission object {key, label, desc} or null
 */
export const getPermissionDetails = (permissionKey) => {
  for (const category of Object.values(PERMISSION_CATEGORIES)) {
    const perm = category.permissions.find(p => p.key === permissionKey);
    if (perm) return perm;
  }
  return null;
};

/**
 * Get all permissions in a category
 * @param {string} categoryKey - The category key (ORDERS, ENQUIRIES, etc.)
 * @returns {object[]} - Array of permissions in the category
 */
export const getPermissionsByCategory = (categoryKey) => {
  const category = PERMISSION_CATEGORIES[categoryKey];
  return category ? category.permissions : [];
};

/**
 * Get all permission keys
 * @returns {string[]} - Array of all permission keys
 */
export const getAllPermissionKeys = () => {
  const keys = [];
  Object.values(PERMISSION_CATEGORIES).forEach(category => {
    category.permissions.forEach(perm => {
      keys.push(perm.key);
    });
  });
  return keys;
};

/**
 * Check if user is admin
 * @returns {boolean} - True if user is admin
 */
export const isAdmin = () => {
  try {
    const user = localStorage.getItem('user');
    if (!user) return false;
    const userData = JSON.parse(user);
    return userData.role === 'admin';
  } catch (error) {
    return false;
  }
};

/**
 * Check if user is staff
 * @returns {boolean} - True if user is staff
 */
export const isStaff = () => {
  try {
    const user = localStorage.getItem('user');
    if (!user) return false;
    const userData = JSON.parse(user);
    return userData.role === 'staff';
  } catch (error) {
    return false;
  }
};

/**
 * Get user role
 * @returns {string} - User role (admin, staff, customer, etc.)
 */
export const getUserRole = () => {
  try {
    const user = localStorage.getItem('user');
    if (!user) return null;
    const userData = JSON.parse(user);
    return userData.role;
  } catch (error) {
    return null;
  }
};

/**
 * Format permission key to readable label
 * @param {string} key - The permission key
 * @returns {string} - Readable label
 */
export const formatPermissionLabel = (key) => {
  const details = getPermissionDetails(key);
  return details ? details.label : key.replace(/([A-Z])/g, ' $1').trim();
};

export default {
  PERMISSION_CATEGORIES,
  hasPermission,
  hasAnyPermission,
  hasAllPermissions,
  getUserPermissions,
  getAllPermissions,
  getPermissionDetails,
  getPermissionsByCategory,
  getAllPermissionKeys,
  isAdmin,
  isStaff,
  getUserRole,
  formatPermissionLabel
};
