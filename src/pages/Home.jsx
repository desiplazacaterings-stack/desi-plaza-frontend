import { useState, useEffect } from "react";
import InstantOrder from "./InstantOrder";
import Enquiry from "./Enquiry";
import Menu from "./Menu";
import "../App.css";
import "./Home.css";

function Home() {
  const [activeSection, setActiveSection] = useState(null);
  const [userRole, setUserRole] = useState(null);

  useEffect(() => {
    // Get user role from localStorage (from login)
    const userData = localStorage.getItem('user');
    if (userData) {
      try {
        const user = JSON.parse(userData);
        setUserRole(user.role);
      } catch (error) {
        console.error('Error parsing user data:', error);
      }
    }
  }, []);

  // For public users, show default enquiry view
  const showDefaultEnquiry = !userRole && activeSection === "enquiry";
  const showDefaultMenu = !userRole && activeSection === "menu";

  const services = [
    {
      icon: "💍",
      title: "Weddings",
      description: "Grand celebrations with premium cuisines and impeccable service"
    },
    {
      icon: "🎉",
      title: "Events",
      description: "Birthdays, anniversaries, and special occasions catered perfectly"
    },
    {
      icon: "🏢",
      title: "Corporate",
      description: "Professional catering for meetings, conferences, and corporate events"
    }
  ];

  return (
    <div className="home-container">
      {/* PUBLIC VIEW - Show buttons for logged-out users */}
      {!userRole && activeSection === null && (
        <section className="action-section">
          <h2>Welcome to Desi Plaza Caterings</h2>
          <p className="welcome-subtitle">Plan your perfect event with us</p>
          
          <div className="home-buttons">
            <button 
              className="home-btn enquiry-btn-large"
              onClick={() => setActiveSection("enquiry")}
            >
              <span className="btn-icon">📋</span>
              <span className="btn-label">Enquiry</span>
              <span className="btn-desc">Tell us about your event</span>
            </button>

            <button 
              className="home-btn menu-btn-large"
              onClick={() => setActiveSection("menu")}
            >
              <span className="btn-icon">🍽️</span>
              <span className="btn-label">View Menu</span>
              <span className="btn-desc">Browse our delicious offerings</span>
            </button>
          </div>

          <button 
            className="back-btn"
            onClick={() => setActiveSection(null)}
            style={{ display: 'none' }}
          >
            ← Back
          </button>
        </section>
      )}

      {/* CONDITIONAL RENDERING - Show selected section */}
      {activeSection === "enquiry" && (
        <>
          <button 
            className="back-btn"
            onClick={() => setActiveSection(null)}
          >
            ← Back to Home
          </button>
          <section className="content-section">
            <Enquiry />
          </section>
        </>
      )}

      {activeSection === "menu" && (
        <>
          <button 
            className="back-btn"
            onClick={() => setActiveSection(null)}
          >
            ← Back to Home
          </button>
          <section className="menu-preview-section">
            <h2>Browse Our Menu</h2>
            <Menu hidePrice={true} />
          </section>
        </>
      )}

      {/* SERVICES SHOWCASE - Always visible */}
      <section className="services-section">
        <h2>Our Services</h2>
        <div className="services-grid">
          {services.map((service, index) => (
            <div key={index} className="service-card">
              <div className="service-icon">{service.icon}</div>
              <h3>{service.title}</h3>
              <p>{service.description}</p>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}

export default Home;

