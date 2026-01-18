import { useState, useEffect } from 'react';
import axios from 'axios';
import API_ENDPOINTS from '../config';
import StaffPermissions from './StaffPermissions';
import './AdminDashboard.css';

function AdminDashboard() {
  const [activeTab, setActiveTab] = useState('users');
  const [users, setUsers] = useState([]);
  const [statistics, setStatistics] = useState({});
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterRole, setFilterRole] = useState('');
  const [filterStatus, setFilterStatus] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [modalType, setModalType] = useState('create');
  const [selectedUser, setSelectedUser] = useState(null);
  const [formData, setFormData] = useState({});
  const [message, setMessage] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  const token = localStorage.getItem('token');

  // Fetch users
  const fetchUsers = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (searchTerm) params.append('search', searchTerm);
      if (filterRole) params.append('role', filterRole);
      if (filterStatus) params.append('status', filterStatus);

      console.log('Fetching users with token:', token ? token.substring(0, 20) + '...' : 'NO TOKEN');
      const response = await axios.get(`${API_ENDPOINTS.ADMIN.USERS}?${params}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setUsers(response.data.data.users);
      console.log('Users fetched:', response.data.data.users);
    } catch (error) {
      console.error('Error fetching users:', error.response?.data || error.message);
      console.error('Full error:', error);
      const errorMsg = error.response?.data?.message || error.response?.data?.error || error.message;
      setMessage('Error fetching users: ' + errorMsg);
    } finally {
      setLoading(false);
    }
  };

  // Fetch statistics
  const fetchStatistics = async () => {
    try {
      const response = await axios.get(API_ENDPOINTS.ADMIN.STATISTICS, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setStatistics(response.data.data.statistics);
    } catch (error) {
      console.error('Error fetching statistics:', error.response?.data || error.message);
      // Don't show statistics errors in the message, just log them
      // setMessage('Error fetching statistics: ' + (error.response?.data?.error || error.message));
    }
  };

  useEffect(() => {
    if (activeTab === 'users') {
      fetchUsers();
      fetchStatistics();
    }
  }, [activeTab, searchTerm, filterRole, filterStatus]);

  // Handle form input
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  // Create user
  const handleCreateUser = async (e) => {
    e.preventDefault();
    
    // Validate all required fields with better error messaging
    const missingFields = [];
    if (!formData.name || formData.name.trim() === '') missingFields.push('Name');
    if (!formData.email || formData.email.trim() === '') missingFields.push('Email');
    if (!formData.password || formData.password.trim() === '') missingFields.push('Password');
    if (!formData.mobile || formData.mobile.trim() === '') missingFields.push('Phone');
    if (!formData.role) missingFields.push('Role');
    
    if (missingFields.length > 0) {
      setMessage(`Error: Missing required fields: ${missingFields.join(', ')}`);
      return;
    }
    
    try {
      console.log('Creating user with data:', formData);
      const response = await axios.post(API_ENDPOINTS.ADMIN.CREATE_USER, formData, {
        headers: { Authorization: `Bearer ${token}` }
      });
      console.log('User created successfully:', response.data);
      setMessage('User created successfully');
      setShowModal(false);
      setFormData({ role: 'staff' });
      fetchUsers();
    } catch (error) {
      console.error('Error creating user:', error.response?.data || error.message);
      setMessage('Error creating user: ' + (error.response?.data?.message || error.response?.data?.error || error.message));
    }
  };

  // Update user
  const handleUpdateUser = async (e) => {
    e.preventDefault();
    try {
      console.log('Updating user with data:', {
        userId: selectedUser._id,
        formData: formData
      });
      const response = await axios.patch(API_ENDPOINTS.ADMIN.UPDATE_USER(selectedUser._id), formData, {
        headers: { Authorization: `Bearer ${token}` }
      });
      console.log('Update response:', response.data);
      setMessage('User updated successfully');
      setShowModal(false);
      setFormData({});
      setSelectedUser(null);
      fetchUsers();
    } catch (error) {
      console.error('Error updating user:', {
        status: error.response?.status,
        data: error.response?.data,
        message: error.message
      });
      setMessage('Error updating user: ' + (error.response?.data?.message || error.response?.data?.error || error.message));
    }
  };

  // Delete user
  const handleDeleteUser = async (id) => {
    if (window.confirm('Are you sure you want to delete this user?')) {
      try {
        await axios.delete(API_ENDPOINTS.ADMIN.DELETE_USER(id), {
          headers: { Authorization: `Bearer ${token}` }
        });
        setMessage('User deleted successfully');
        fetchUsers();
      } catch (error) {
        console.error('Error deleting user:', error.response?.data || error.message);
        setMessage('Error deleting user: ' + (error.response?.data?.message || error.response?.data?.error || error.message));
      }
    }
  };

  // Change user status
  const handleChangeStatus = async (id, newStatus) => {
    try {
      await axios.patch(API_ENDPOINTS.ADMIN.CHANGE_STATUS(id), { status: newStatus }, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setMessage(`User status changed to ${newStatus}`);
      fetchUsers();
    } catch (error) {
      console.error('Error changing status:', error.response?.data || error.message);
      setMessage('Error changing status: ' + (error.response?.data?.message || error.response?.data?.error || error.message));
    }
  };

  // Change user role
  const handleChangeRole = async (id, newRole) => {
    try {
      await axios.patch(API_ENDPOINTS.ADMIN.CHANGE_ROLE(id), { role: newRole }, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setMessage(`User role changed to ${newRole}`);
      fetchUsers();
    } catch (error) {
      console.error('Error changing role:', error.response?.data || error.message);
      setMessage('Error changing role: ' + (error.response?.data?.message || error.response?.data?.error || error.message));
    }
  };

  // Open modal for create
  const openCreateModal = () => {
    setModalType('create');
    setFormData({ role: 'staff' }); // Set default role
    setSelectedUser(null);
    setShowModal(true);
  };

  // Open modal for edit
  const openEditModal = (user) => {
    setModalType('edit');
    setSelectedUser(user);
    setFormData({
      name: user.name,
      email: user.email,
      mobile: user.mobile,
      role: user.role,
      status: user.status
    });
    setShowModal(true);
  };

  return (
    <div className="admin-dashboard">
      <h1>🔧 Admin Dashboard</h1>

      {message && (
        <div className="message">
          {message}
          <button onClick={() => setMessage('')}>×</button>
        </div>
      )}

      <div className="admin-tabs">
        <button
          className={`tab-button ${activeTab === 'users' ? 'active' : ''}`}
          onClick={() => setActiveTab('users')}
        >
          👥 User Management
        </button>
        <button
          className={`tab-button ${activeTab === 'permissions' ? 'active' : ''}`}
          onClick={() => setActiveTab('permissions')}
        >
          🔐 Staff Permissions
        </button>
        <button
          className={`tab-button ${activeTab === 'settings' ? 'active' : ''}`}
          onClick={() => setActiveTab('settings')}
        >
          ⚙️ Settings
        </button>
      </div>

      {activeTab === 'users' && (
        <div className="admin-section">
          <h2>User Management</h2>

          {/* Statistics */}
          <div className="statistics-grid">
            <div className="stat-card">
              <h3>Total Users</h3>
              <p className="stat-number">{statistics.totalUsers || 0}</p>
            </div>
            <div className="stat-card admin-color">
              <h3>Admins</h3>
              <p className="stat-number">{statistics.byRole?.admin || 0}</p>
            </div>
            <div className="stat-card staff-color">
              <h3>Staff</h3>
              <p className="stat-number">{statistics.byRole?.staff || 0}</p>
            </div>
            <div className="stat-card active-color">
              <h3>Active</h3>
              <p className="stat-number">{statistics.byStatus?.active || 0}</p>
            </div>
            <div className="stat-card inactive-color">
              <h3>Inactive</h3>
              <p className="stat-number">{statistics.byStatus?.inactive || 0}</p>
            </div>
          </div>

          {/* Filters and Actions */}
          <div className="admin-controls">
            <button className="create-btn" onClick={openCreateModal}>
              ➕ Create New User
            </button>

            <div className="filters">
              <input
                type="text"
                placeholder="Search by name, email, or phone..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="filter-input"
              />

              <select
                value={filterRole}
                onChange={(e) => setFilterRole(e.target.value)}
                className="filter-select"
              >
                <option value="">All Roles</option>
                <option value="admin">Admin</option>
                <option value="staff">Staff</option>
              </select>

              <select
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value)}
                className="filter-select"
              >
                <option value="">All Status</option>
                <option value="active">Active</option>
                <option value="inactive">Inactive</option>
                <option value="suspended">Suspended</option>
              </select>
            </div>
          </div>

          {/* Users Table */}
          <div className="users-table-container">
            {loading ? (
              <p className="loading">Loading users...</p>
            ) : users.length === 0 ? (
              <p className="no-data">No users found</p>
            ) : (
              <table className="users-table">
                <thead>
                  <tr>
                    <th>Name</th>
                    <th>Email</th>
                    <th>Phone</th>
                    <th>Role</th>
                    <th>Status</th>
                    <th>Last Login</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {users.map(user => (
                    <tr key={user._id}>
                      <td data-label="Name"><strong>{user.name}</strong></td>
                      <td data-label="Email">{user.email}</td>
                      <td data-label="Phone">{user.mobile}</td>
                      <td data-label="Role">
                        <select
                          value={user.role}
                          onChange={(e) => handleChangeRole(user._id, e.target.value)}
                          className={`role-select ${user.role}`}
                        >
                          <option value="admin">Admin</option>
                          <option value="staff">Staff</option>
                          <option value="customer">Customer</option>
                        </select>
                      </td>
                      <td data-label="Status">
                        <select
                          value={user.status}
                          onChange={(e) => handleChangeStatus(user._id, e.target.value)}
                          className={`status-select ${user.status}`}
                        >
                          <option value="active">Active</option>
                          <option value="inactive">Inactive</option>
                          <option value="suspended">Suspended</option>
                        </select>
                      </td>
                      <td data-label="Last Login">
                        {user.lastLogin ? new Date(user.lastLogin).toLocaleDateString() : 'Never'}
                      </td>
                      <td data-label="Actions">
                        <button
                          className="edit-btn"
                          onClick={() => openEditModal(user)}
                        >
                          ✏️
                        </button>
                        <button
                          className="delete-btn"
                          onClick={() => handleDeleteUser(user._id)}
                        >
                          🗑️
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        </div>
      )}

      {activeTab === 'permissions' && (
        <StaffPermissions />
      )}

      {activeTab === 'settings' && (
        <div className="admin-section">
          <h2>System Settings</h2>
          <div className="settings-content">
            <div className="setting-item">
              <h3>🔐 Role Permissions</h3>
              <p><strong>Admin:</strong> Full access to all features</p>
              <p><strong>Staff:</strong> Can manage orders and view reports</p>
              <p><strong>Customer:</strong> Limited to their own orders</p>
            </div>

            <div className="setting-item">
              <h3>📊 User Roles</h3>
              <p><strong>Admin:</strong> System administrator with full control</p>
              <p><strong>Staff:</strong> Employee managing orders and customers</p>
              <p><strong>Customer:</strong> Regular user creating orders and quotations</p>
            </div>

            <div className="setting-item">
              <h3>🔄 User Status</h3>
              <p><strong>Active:</strong> User can access the system</p>
              <p><strong>Inactive:</strong> User account is disabled</p>
              <p><strong>Suspended:</strong> User account is suspended (violation)</p>
            </div>
          </div>
        </div>
      )}

      {/* Modal for Create/Edit User */}
      {showModal && (
        <div className="modal-overlay" onClick={() => setShowModal(false)}>
          <div className="modal-content" onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <h2>{modalType === 'create' ? '➕ Create New User' : '✏️ Edit User'}</h2>
              <button className="close-btn" onClick={() => setShowModal(false)}>×</button>
            </div>

            <form onSubmit={modalType === 'create' ? handleCreateUser : handleUpdateUser}>
              <div className="form-group">
                <label>Name *</label>
                <input
                  type="text"
                  name="name"
                  placeholder="Enter full name"
                  value={formData.name || ''}
                  onChange={handleInputChange}
                  required
                />
              </div>

              <div className="form-group">
                <label>Email *</label>
                <input
                  type="email"
                  name="email"
                  placeholder="Enter email address"
                  value={formData.email || ''}
                  onChange={handleInputChange}
                  required
                />
              </div>

              <div className="form-group">
                <label>Phone *</label>
                <input
                  type="tel"
                  name="mobile"
                  placeholder="Enter phone number"
                  value={formData.mobile || ''}
                  onChange={handleInputChange}
                  required
                />
              </div>

              {modalType === 'create' && (
                <div className="form-group password-group">
                  <label>Password *</label>
                  <div className="password-input-wrapper">
                    <input
                      type={showPassword ? 'text' : 'password'}
                      name="password"
                      placeholder="Minimum 8 characters"
                      value={formData.password || ''}
                      onChange={handleInputChange}
                      required
                      minLength="8"
                    />
                    <button
                      type="button"
                      className="toggle-password-btn"
                      onClick={() => setShowPassword(!showPassword)}
                      title={showPassword ? 'Hide password' : 'Show password'}
                    >
                      {showPassword ? '🙈' : '👁️'}
                    </button>
                  </div>
                </div>
              )}

              {modalType === 'edit' && (
                <div className="form-group password-group">
                  <label>New Password (optional)</label>
                  <div className="password-input-wrapper">
                    <input
                      type={showPassword ? 'text' : 'password'}
                      name="password"
                      placeholder="Leave empty to keep current password"
                      value={formData.password || ''}
                      onChange={handleInputChange}
                      minLength="8"
                    />
                    <button
                      type="button"
                      className="toggle-password-btn"
                      onClick={() => setShowPassword(!showPassword)}
                      title={showPassword ? 'Hide password' : 'Show password'}
                    >
                      {showPassword ? '🙈' : '👁️'}
                    </button>
                  </div>
                </div>
              )}

              <div className="form-group">
                <label>Role *</label>
                <select
                  name="role"
                  value={formData.role || 'staff'}
                  onChange={handleInputChange}
                  required
                >
                  <option value="staff">Staff</option>
                  <option value="admin">Admin</option>
                </select>
              </div>

              {modalType === 'edit' && (
                <div className="form-group">
                  <label>Status</label>
                  <select
                    name="status"
                    value={formData.status || 'active'}
                    onChange={handleInputChange}
                  >
                    <option value="active">Active</option>
                    <option value="inactive">Inactive</option>
                    <option value="suspended">Suspended</option>
                  </select>
                </div>
              )}

              <div className="form-actions">
                <button type="submit" className="submit-btn">
                  {modalType === 'create' ? 'Create User' : 'Update User'}
                </button>
                <button type="button" className="cancel-btn" onClick={() => setShowModal(false)}>
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

export default AdminDashboard;
