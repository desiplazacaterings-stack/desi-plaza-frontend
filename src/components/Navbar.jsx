import { Link, useNavigate } from "react-router-dom";
import { useState, useEffect } from "react";
import "./Navbar.css";

function Navbar() {
  const [isOpen, setIsOpen] = useState(false);
  const [userRole, setUserRole] = useState(null);
  const [userName, setUserName] = useState(null);
  const navigate = useNavigate();

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
      >
        ☰
      </button>
      <aside className={`sidebar-nav ${isOpen ? 'open' : ''}`}>
        <nav>
          <Link className="sidebar-link" to="/" onClick={() => setIsOpen(false)}>🏠 Home</Link>
          <Link className="sidebar-link" to="/instantorderdetails" onClick={() => setIsOpen(false)}>📋 Instant Order Details</Link>
          <Link className="sidebar-link" to="/enquiries" onClick={() => setIsOpen(false)}>🔍 View Enquiries</Link>
          <Link className="sidebar-link" to="/quotations" onClick={() => setIsOpen(false)}>💼 View Quotations</Link>
          <Link className="sidebar-link" to="/scheduled-meetings" onClick={() => setIsOpen(false)}>📅 Scheduled Meetings</Link>
          {userRole === 'admin' && (
            <Link className="sidebar-link admin-link" to="/admin" onClick={() => setIsOpen(false)}>🔧 Admin Dashboard</Link>
          )}
          
          {/* Auth Links */}
          <div className="auth-links">
            {userName ? (
              <>
                <div className="user-info">
                  👤 {userName} ({userRole})
                </div>
                <button className="auth-button logout-btn" onClick={handleLogout}>
                  🚪 Logout
                </button>
              </>
            ) : (
              <>
                <Link className="auth-button login-btn" to="/login" onClick={() => setIsOpen(false)}>
                  🔓 Login
                </Link>
                <Link className="auth-button register-btn" to="/register" onClick={() => setIsOpen(false)}>
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
