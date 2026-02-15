import { Link, NavLink, useNavigate, useLocation } from "react-router-dom";
import { useState, useEffect } from "react";
import axios from "axios";
import API_ENDPOINTS from "../config";
import { clearAuthData } from "../utils/authUtils";
import LoginModal from "./LoginModal";
import "./Navbar.css";

function Navbar() {
  const [isOpen, setIsOpen] = useState(false);
  const [showLoginModal, setShowLoginModal] = useState(false);
  const [userRole, setUserRole] = useState(null);
  const [userName, setUserName] = useState(null);
  const [userId, setUserId] = useState(null);
  const [permissions, setPermissions] = useState({});
  const [loading, setLoading] = useState(true);
  const [tokenValid, setTokenValid] = useState(null);
  const navigate = useNavigate();
  const location = useLocation();

  // Verify token validity first
  useEffect(() => {
    const verifyToken = async () => {
      const token = localStorage.getItem('token');
      const userData = localStorage.getItem('user');

      if (!token || !userData) {
        setTokenValid(false);
        return;
      }

      try {
        // Verify token with server with timeout
        const controller = new AbortController();
        const timeout = setTimeout(() => controller.abort(), 3000);
        
        const response = await fetch(`${import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000'}/api/auth/me`, {
          method: 'GET',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          },
          signal: controller.signal
        });

        clearTimeout(timeout);

        if (!response.ok) {
          // Token is invalid on server
          clearAuthData();
          setTokenValid(false);
          return;
        }

        setTokenValid(true);
      } catch (error) {
        console.error('Error verifying token:', error);
        clearAuthData();
        setTokenValid(false);
      } finally {
        setLoading(false);
      }
    };

    verifyToken();
  }, []);

  // Only load user data if token is valid
  useEffect(() => {
    if (tokenValid === null) return; // Still checking

    if (!tokenValid) {
      setUserRole(null);
      setUserName(null);
      setUserId(null);
      setLoading(false);
      return;
    }

    // Get user role from localStorage (from login)
    const token = localStorage.getItem('token');
    const userData = localStorage.getItem('user');
    if (userData) {
      try {
        const user = JSON.parse(userData);
        setUserRole(user.role);
        setUserName(user.name);
        setUserId(user._id);
        console.log('✅ User loaded in Navbar:', { name: user.name, role: user.role, userId: user._id });
        
        // If admin, grant all permissions
        if (user.role === 'admin') {
          setPermissions({
            canCreateInstantOrder: true,
            canViewInstantOrders: true,
            canCreateEnquiry: true,
            canViewEnquiries: true,
            canViewMenu: true,
            canCreateQuotation: true,
            canViewQuotations: true,
            canViewReports: true,
            canViewSchedules: true
          });
          setLoading(false);
        } else if (user.role === 'staff' && token) {
          // First, try to use permissions from login response
          if (user.customPermissions && Object.keys(user.customPermissions).length > 0) {
            console.log('Using permissions from login response:', user.customPermissions);
            setPermissions(user.customPermissions);
            setLoading(false);
          } else {
            // If not available in login, fetch from API
            fetchStaffPermissions(user._id, token);
          }
        } else {
          setLoading(false);
        }
      } catch (error) {
        console.error('Error parsing user data:', error);
        setLoading(false);
      }
    } else {
      setLoading(false);
    }
  }, [tokenValid]);

  const fetchStaffPermissions = async (staffId, token) => {
    try {
      if (!staffId) {
        console.warn('⚠️ staffId is missing, skipping permission fetch');
        setLoading(false);
        return;
      }

      const response = await axios.get(API_ENDPOINTS.ADMIN.GET_PERMISSIONS(staffId), {
        headers: { Authorization: `Bearer ${token}` }
      });
      console.log('Full API Response:', response.data);
      
      // Handle both nested and non-nested response structures
      let customPerms = response.data.data?.customPermissions || response.data.customPermissions || {};
      console.log('Extracted customPermissions:', customPerms);
      
      // If customPermissions is empty, initialize with defaults
      if (Object.keys(customPerms).length === 0) {
        console.warn('⚠️ customPermissions is empty, initializing with defaults');
        customPerms = {
          canViewInstantOrders: false,
          canViewEnquiries: false,
          canViewQuotations: false,
          canViewSchedules: false,
          canViewReports: false
        };
      }
      
      console.log('Final permissions being set:', customPerms);
      setPermissions(customPerms);
    } catch (error) {
      console.error('Error fetching staff permissions:', error);
      console.error('Error response:', error.response?.data);
      // Set empty permissions if error
      setPermissions({});
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    // Close menu when location changes
    setIsOpen(false);
  }, [location]);

  const handleLogout = async () => {
    try {
      // Call backend logout endpoint if user is authenticated
      const token = localStorage.getItem('token');
      if (token) {
        try {
          await fetch(`${import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000'}/api/auth/logout`, {
            method: 'GET',
            headers: {
              'Authorization': `Bearer ${token}`,
              'Content-Type': 'application/json'
            }
          });
        } catch (error) {
          console.warn('Could not call logout endpoint:', error);
        }
      }
    } finally {
      // Always clear local storage regardless of server response
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      localStorage.clear(); // Clear all localStorage to be safe
      setUserRole(null);
      setUserName(null);
      setUserId(null);
      setIsOpen(false);
      // Refresh page to clear any cached state
      window.location.href = '/';
    }
  };

  const handleProtectedNavigation = (path) => {
    if (!userRole) {
      // Not logged in, redirect to login
      navigate('/login');
    } else {
      // Logged in, navigate to the path
      navigate(path);
    }
  };

  return (
    <>
      {/* Backdrop overlay to close sidebar when clicking outside */}
      {isOpen && (
        <div 
          className="sidebar-backdrop"
          onClick={() => setIsOpen(false)}
          role="presentation"
          aria-hidden="true"
        />
      )}
      
      <button 
        className="navbar-toggle"
        onClick={() => setIsOpen(!isOpen)}
        title="Toggle Menu"
        aria-label="Toggle navigation menu"
        aria-expanded={isOpen}
      >
        <span className="toggle-icon">☰</span>
        <span className="toggle-label">Menu</span>
      </button>
      <aside 
        className={`sidebar-nav ${isOpen ? 'open' : ''}`}
        role="navigation"
        aria-label="Main navigation"
      >
        <nav>
          <NavLink 
            className={({ isActive }) => `sidebar-link ${isActive ? 'active' : ''}`}
            to="/" 
            onClick={() => setIsOpen(false)}
            title="Home"
          >
            <span className="nav-icon">🏠</span>
            <span className="nav-label">Home</span>
          </NavLink>
          
          {userRole && (
            <>
              {permissions.canViewInstantOrders && (
                <button
                  className="sidebar-link protected-link"
                  onClick={() => {
                    handleProtectedNavigation("/instantorders");
                    setIsOpen(false);
                  }}
                  title="View Instant Orders"
                  style={{ cursor: 'pointer', border: 'none', background: 'none', width: '100%', textAlign: 'left' }}
                >
                  <span className="nav-icon">📋</span>
                  <span className="nav-label">View Instant Orders</span>
                </button>
              )}
              
              {permissions.canViewEnquiries && (
                <button
                  className="sidebar-link protected-link"
                  onClick={() => {
                    handleProtectedNavigation("/enquiries");
                    setIsOpen(false);
                  }}
                  title="View Enquiries"
                  style={{ cursor: 'pointer', border: 'none', background: 'none', width: '100%', textAlign: 'left' }}
                >
                  <span className="nav-icon">🔍</span>
                  <span className="nav-label">View Enquiries</span>
                </button>
              )}
              
              {permissions.canViewQuotations && (
                <button
                  className="sidebar-link protected-link"
                  onClick={() => {
                    handleProtectedNavigation("/quotations");
                    setIsOpen(false);
                  }}
                  title="View Quotations"
                  style={{ cursor: 'pointer', border: 'none', background: 'none', width: '100%', textAlign: 'left' }}
                >
                  <span className="nav-icon">💼</span>
                  <span className="nav-label">View Quotations</span>
                </button>
              )}
              
              {permissions.canViewSchedules && (
                <button
                  className="sidebar-link protected-link"
                  onClick={() => {
                    handleProtectedNavigation("/scheduled-meetings");
                    setIsOpen(false);
                  }}
                  title="View Meetings"
                  style={{ cursor: 'pointer', border: 'none', background: 'none', width: '100%', textAlign: 'left' }}
                >
                  <span className="nav-icon">📅</span>
                  <span className="nav-label">View Meetings</span>
                </button>
              )}

              {permissions.canViewReports && (
                <button
                  className="sidebar-link protected-link"
                  onClick={() => {
                    handleProtectedNavigation("/reports");
                    setIsOpen(false);
                  }}
                  title="View Reports"
                  style={{ cursor: 'pointer', border: 'none', background: 'none', width: '100%', textAlign: 'left' }}
                >
                  <span className="nav-icon">📊</span>
                  <span className="nav-label">View Reports</span>
                </button>
              )}
              
              {permissions.canViewMenu && (
                <NavLink 
                  className={({ isActive }) => `sidebar-link ${isActive ? 'active' : ''}`}
                  to="/menu" 
                  onClick={() => setIsOpen(false)}
                  title="View Menu"
                >
                  <span className="nav-icon">🍽️</span>
                  <span className="nav-label">View Menu</span>
                </NavLink>
              )}
              
              {permissions.canViewReports && (
                <button
                  className="sidebar-link protected-link"
                  onClick={() => {
                    handleProtectedNavigation("/confirm");
                    setIsOpen(false);
                  }}
                  title="View Confirmed Orders"
                  style={{ cursor: 'pointer', border: 'none', background: 'none', width: '100%', textAlign: 'left' }}
                >
                  <span className="nav-icon">✅</span>
                  <span className="nav-label">View Confirmed Orders</span>
                </button>
              )}
              
              {permissions.canViewReports && (
                <button
                  className="sidebar-link protected-link"
                  onClick={() => {
                    handleProtectedNavigation("/event");
                    setIsOpen(false);
                  }}
                  title="View Events"
                  style={{ cursor: 'pointer', border: 'none', background: 'none', width: '100%', textAlign: 'left' }}
                >
                  <span className="nav-icon">🎉</span>
                  <span className="nav-label">View Events</span>
                </button>
              )}
            </>
          )}
          
          {userRole === 'admin' && (
            <NavLink 
              className={({ isActive }) => `sidebar-link admin-link ${isActive ? 'active' : ''}`}
              to="/admin" 
              onClick={() => setIsOpen(false)}
              title="Admin Dashboard"
            >
              <span className="nav-icon">🔧</span>
              <span className="nav-label">Admin</span>
            </NavLink>
          )}
          
          {/* Auth Links */}
          <div className="auth-links" role="group" aria-label="Authentication">
            {userName ? (
              <>
                <div className="user-info" role="status" aria-label={`Logged in as ${userName}`}>
                  <span className="user-icon">👤</span>
                  <div className="user-details">
                    <div className="user-name">{userName}</div>
                    <div className="user-role">{userRole}</div>
                  </div>
                </div>
                <button 
                  className="auth-button logout-btn" 
                  onClick={handleLogout}
                  title="Logout"
                  aria-label="Logout"
                >
                  🚪 Logout
                </button>
              </>
            ) : (
              <>
                <button 
                  className="auth-button login-btn" 
                  onClick={() => {
                    setShowLoginModal(true);
                    setIsOpen(false);
                  }}
                  title="Login to your account"
                  type="button"
                >
                  🔓 Login
                </button>
              </>
            )}
          </div>
        </nav>
      </aside>

      {/* Login Modal */}
      <LoginModal isOpen={showLoginModal} onClose={() => setShowLoginModal(false)} />
    </>
  );
}

export default Navbar;
