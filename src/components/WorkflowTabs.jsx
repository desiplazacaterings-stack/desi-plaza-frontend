import { NavLink } from "react-router-dom";
import { useState, useEffect } from "react";
import axios from "axios";
import API_ENDPOINTS from "../config";
import "./WorkflowTabs.css";

const tabs = [
  { path: "/", label: "🏠 Home" },
  { path: "/enquiry", label: "📋 Create Enquiry", permission: "canCreateEnquiry" },
  { path: "/quotation", label: "📊 Create Quotation", permission: "canManageQuotations" },
  { path: "/create-event", label: "✨ Create Event", permission: "canManageQuotations" },
  { path: "/payments", label: "💳 Add Payments", permission: "canViewReports" }
];

function WorkflowTabs() {
  const [userRole, setUserRole] = useState(null);
  const [permissions, setPermissions] = useState({});
  const [loading, setLoading] = useState(true);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  useEffect(() => {
    // Get user role from localStorage
    const userData = localStorage.getItem('user');
    const token = localStorage.getItem('token');
    
    if (userData) {
      try {
        const user = JSON.parse(userData);
        setUserRole(user.role);
        
        // If admin, grant all permissions
        if (user.role === 'admin') {
          setPermissions({
            canCreateInstantOrder: true,
            canViewInstantOrders: true,
            canCreateEnquiry: true,
            canViewEnquiries: true,
            canViewMenu: true,
            canManageQuotations: true,
            canViewReports: true
          });
          setLoading(false);
        } else if (user.role === 'staff' && token) {
          // If staff, fetch permissions from backend
          fetchStaffPermissions(user._id, token);
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
  }, []);

  // Handle body scroll lock when menu opens/closes
  useEffect(() => {
    if (mobileMenuOpen) {
      // Get the scrollable element (usually html/body)
      const scrollY = window.scrollY;
      
      // Lock the page scroll
      document.documentElement.style.overflow = 'hidden';
      document.body.style.overflow = 'hidden';
      
      // Store scroll position in a data attribute
      document.body.setAttribute('data-scroll-position', scrollY);
    } else {
      // Restore scroll
      document.documentElement.style.overflow = '';
      document.body.style.overflow = '';
      
      // Get stored scroll position
      const scrollPosition = document.body.getAttribute('data-scroll-position');
      if (scrollPosition !== null) {
        window.scrollTo(0, parseInt(scrollPosition));
        document.body.removeAttribute('data-scroll-position');
      }
    }
    
    return () => {
      document.documentElement.style.overflow = '';
      document.body.style.overflow = '';
      document.body.removeAttribute('data-scroll-position');
    };
  }, [mobileMenuOpen]);

  const fetchStaffPermissions = async (staffId, token) => {
    try {
      const response = await axios.get(API_ENDPOINTS.ADMIN.GET_PERMISSIONS(staffId), {
        headers: { Authorization: `Bearer ${token}` }
      });
      setPermissions(response.data.data.customPermissions || {});
    } catch (error) {
      console.error('Error fetching staff permissions:', error);
      setPermissions({});
    } finally {
      setLoading(false);
    }
  };

  // Only show workflow tabs for admin/staff, not for public users
  if (!userRole || (userRole !== 'admin' && userRole !== 'staff')) {
    return null;
  }

  // Filter tabs based on permissions (home is always visible)
  const visibleTabs = tabs.filter(tab => {
    if (tab.path === '/') return true; // Home always visible
    if (userRole === 'admin') return true; // Admin sees all tabs
    if (tab.permission && !permissions[tab.permission]) return false; // Staff sees only permitted tabs
    return true;
  });

  return (
    <>
      {/* Home Shortcut Button for Mobile */}
      <NavLink
        to="/"
        className="home-fab"
        title="Go to Home"
        aria-label="Go to home"
      >
        <span className="fab-icon">🏠</span>
        <span className="fab-label">Home</span>
      </NavLink>

      {/* Workflow Floating Button for Mobile */}
      <button 
        className="workflow-fab"
        onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
        title="Workflow Action"
        aria-label="Toggle workflow action"
      >
        <span className="fab-icon">🔄</span>
        <span className="fab-label">Action</span>
      </button>

      {/* Backdrop Overlay */}
      <div 
        className={`workflow-backdrop ${mobileMenuOpen ? 'active' : ''}`}
        onClick={() => setMobileMenuOpen(false)}
      />

      {/* Workflow Tabs Container */}
      <div className={`workflow-tabs ${mobileMenuOpen ? 'mobile-open' : ''}`}>
        {visibleTabs.map(tab => (
          <NavLink
            key={tab.path}
            to={tab.path}
            onClick={() => setMobileMenuOpen(false)}
            className={({ isActive }) =>
              isActive ? 'button workflow-tab active' : 'button workflow-tab'}
            style={({ isActive }) => ({
              background: isActive ? '#f5ba4a' : '#fff',
              color: isActive ? '#232a36' : '#222',
              border: '1px solid #ccc',
              borderRadius: '8px',
              padding: '10px 18px',
              fontWeight: 600,
              boxShadow: isActive ? '0 2px 8px #ffe0a3' : 'none',
              transition: 'background 0.2s, color 0.2s',
              textDecoration: 'none',
              fontSize: '1.08em',
            })}
          >
            {tab.label}
          </NavLink>
        ))}
      </div>
    </>
  );
}

const styles = {
  container: {
    display: "flex",
    gap: "4px",
    margin: "20px 0",
    flexWrap: "wrap",
    borderBottom: "2px solid #e8e8f0",
    paddingBottom: "0",
    background: "#fff",
    borderRadius: "8px 8px 0 0"
  },
  tab: {
    padding: "12px 20px",
    borderRadius: "8px 8px 0 0",
    textDecoration: "none",
    border: "2px solid transparent",
    color: "#666",
    background: "transparent",
    fontWeight: "600",
    fontSize: "0.98em",
    transition: "all 0.3s ease",
    borderBottom: "3px solid transparent",
    cursor: "pointer",
    position: "relative"
  },
  active: {
    background: "linear-gradient(180deg, #f5ba4a 0%, #ffc757 100%)",
    color: "#232a36",
    borderBottom: "3px solid #232a36",
    boxShadow: "0 4px 12px rgba(245, 186, 74, 0.2)"
  }
};

export default WorkflowTabs;
