import { Link, NavLink, useNavigate, useLocation } from "react-router-dom";
import { useState, useEffect } from "react";
import "./Navbar.css";

function Navbar() {
  const [isOpen, setIsOpen] = useState(false);
  const [userRole, setUserRole] = useState(null);
  const [userName, setUserName] = useState(null);
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    // Get user role from localStorage (from login)
    const token = localStorage.getItem('token');
    const userData = localStorage.getItem('user');
    if (userData) {
      try {
        const user = JSON.parse(userData);
        setUserRole(user.role);
        setUserName(user.name);
      } catch (error) {
        console.error('Error parsing user data:', error);
      }
    }
  }, []);

  useEffect(() => {
    // Close menu when location changes
    setIsOpen(false);
  }, [location]);

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    setUserRole(null);
    setUserName(null);
    setIsOpen(false);
    navigate('/');
  };

  return (
    <>
      <button 
        className="navbar-toggle"
        onClick={() => setIsOpen(!isOpen)}
        title="Toggle Menu"
        aria-label="Toggle navigation menu"
        aria-expanded={isOpen}
      >
        ☰
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
          
          <NavLink 
            className={({ isActive }) => `sidebar-link ${isActive ? 'active' : ''}`}
            to="/instantorders" 
            onClick={() => setIsOpen(false)}
            title="Instant Orders"
          >
            <span className="nav-icon">📋</span>
            <span className="nav-label">Instant Orders</span>
          </NavLink>
          
          <NavLink 
            className={({ isActive }) => `sidebar-link ${isActive ? 'active' : ''}`}
            to="/enquiries" 
            onClick={() => setIsOpen(false)}
            title="View Enquiries"
          >
            <span className="nav-icon">🔍</span>
            <span className="nav-label">Enquiries</span>
          </NavLink>
          
          <NavLink 
            className={({ isActive }) => `sidebar-link ${isActive ? 'active' : ''}`}
            to="/quotations" 
            onClick={() => setIsOpen(false)}
            title="View Quotations"
          >
            <span className="nav-icon">💼</span>
            <span className="nav-label">Quotations</span>
          </NavLink>
          
          <NavLink 
            className={({ isActive }) => `sidebar-link ${isActive ? 'active' : ''}`}
            to="/scheduled-meetings" 
            onClick={() => setIsOpen(false)}
            title="Scheduled Meetings"
          >
            <span className="nav-icon">📅</span>
            <span className="nav-label">Meetings</span>
          </NavLink>

          <NavLink 
            className={({ isActive }) => `sidebar-link ${isActive ? 'active' : ''}`}
            to="/reports" 
            onClick={() => setIsOpen(false)}
            title="Business Reports"
          >
            <span className="nav-icon">📊</span>
            <span className="nav-label">Reports</span>
          </NavLink>
          
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
                <Link 
                  className="auth-button login-btn" 
                  to="/login" 
                  onClick={() => setIsOpen(false)}
                  title="Login to your account"
                >
                  🔓 Login
                </Link>
                <Link 
                  className="auth-button register-btn" 
                  to="/register" 
                  onClick={() => setIsOpen(false)}
                  title="Create a new account"
                >
                  ✍️ Register
                </Link>
              </>
            )}
          </div>
        </nav>
      </aside>
    </>
  );
}

export default Navbar;
