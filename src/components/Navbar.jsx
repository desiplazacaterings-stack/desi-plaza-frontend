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
          
          {userRole && (
            <>
              <button
                className="sidebar-link protected-link"
                onClick={() => {
                  handleProtectedNavigation("/instantorders");
                  setIsOpen(false);
                }}
                title={userRole ? "Instant Orders" : "Login to view instant orders"}
                style={{ cursor: 'pointer', border: 'none', background: 'none', width: '100%', textAlign: 'left' }}
              >
                <span className="nav-icon">📋</span>
                <span className="nav-label">Instant Orders</span>
              </button>
              
              <button
                className="sidebar-link protected-link"
                onClick={() => {
                  handleProtectedNavigation("/enquiries");
                  setIsOpen(false);
                }}
                title={userRole ? "View Enquiries" : "Login to view enquiries"}
                style={{ cursor: 'pointer', border: 'none', background: 'none', width: '100%', textAlign: 'left' }}
              >
                <span className="nav-icon">🔍</span>
                <span className="nav-label">Enquiries</span>
              </button>
              
              <button
                className="sidebar-link protected-link"
                onClick={() => {
                  handleProtectedNavigation("/quotations");
                  setIsOpen(false);
                }}
                title={userRole ? "View Quotations" : "Login to view quotations"}
                style={{ cursor: 'pointer', border: 'none', background: 'none', width: '100%', textAlign: 'left' }}
              >
                <span className="nav-icon">💼</span>
                <span className="nav-label">Quotations</span>
              </button>
              
              <button
                className="sidebar-link protected-link"
                onClick={() => {
                  handleProtectedNavigation("/scheduled-meetings");
                  setIsOpen(false);
                }}
                title={userRole ? "Scheduled Meetings" : "Login to view meetings"}
                style={{ cursor: 'pointer', border: 'none', background: 'none', width: '100%', textAlign: 'left' }}
              >
                <span className="nav-icon">📅</span>
                <span className="nav-label">Meetings</span>
              </button>

              <button
                className="sidebar-link protected-link"
                onClick={() => {
                  handleProtectedNavigation("/reports");
                  setIsOpen(false);
                }}
                title={userRole ? "Business Reports" : "Login to view reports"}
                style={{ cursor: 'pointer', border: 'none', background: 'none', width: '100%', textAlign: 'left' }}
              >
                <span className="nav-icon">📊</span>
                <span className="nav-label">Reports</span>
              </button>
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
