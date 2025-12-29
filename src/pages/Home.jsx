import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import Enquiry from "./Enquiry";
import Menu from "./Menu";
import "./Home.css";

function Home() {
  const navigate = useNavigate();
  const [activeSection, setActiveSection] = useState(null);
  const [userRole, setUserRole] = useState(null);
  const [permissions, setPermissions] = useState(null);

  useEffect(() => {
    const userData = localStorage.getItem('user');
    if (userData) {
      try {
        const user = JSON.parse(userData);
        setUserRole(user.role);
        // Get permissions from localStorage or user object
        setPermissions(user.customPermissions || user.permissions || {});
      } catch (error) {
        console.error('Error parsing user data:', error);
      }
    }
  }, []);

  if (activeSection === "enquiry") {
    return (
      <>
        <button className="back-btn" onClick={() => setActiveSection(null)}>
          ← Back to Home
        </button>
        <section className="content-section">
          <Enquiry />
        </section>
      </>
    );
  }

  if (activeSection === "menu") {
    return (
      <>
        <button className="back-btn" onClick={() => setActiveSection(null)}>
          ← Back to Home
        </button>
        <section className="menu-preview-section">
          <h2>Browse Our Menu</h2>
          <Menu hidePrice={true} />
        </section>
      </>
    );
  }

  return (
    <div className="home-container">
      {/* ADMIN/LOGGED-IN USER VIEW */}
      {userRole && (
        <section className="hero-section">
          <h1 className="hero-title">Welcome Back</h1>
          <p className="hero-subtitle">What would you like to do?</p>

          <div className="action-buttons">
            {permissions?.canCreateInstantOrder !== false && (
              <button
                className="action-card instant-order-card"
                onClick={() => navigate("/instantorder")}
              >
                <div className="card-icon">🧾</div>
                <h3 className="card-title">Create Instant Order</h3>
                <p className="card-description">Quick order and KOT</p>
              </button>
            )}

            {permissions?.canCreateEnquiry !== false && (
              <button
                className="action-card enquiry-card"
                onClick={() => setActiveSection("enquiry")}
              >
                <div className="card-icon">📋</div>
                <h3 className="card-title">New Enquiry</h3>
                <p className="card-description">Send us an enquiry</p>
              </button>
            )}

            {permissions?.canViewMenu !== false && (
              <button
                className="action-card menu-card"
                onClick={() => setActiveSection("menu")}
              >
                <div className="card-icon">🍽️</div>
                <h3 className="card-title">View Menu</h3>
                <p className="card-description">Browse our offerings</p>
              </button>
            )}
          </div>
        </section>
      )}

      {/* PUBLIC USER VIEW */}
      {!userRole && (
        <section className="hero-section">
          <h1 className="hero-title">Welcome to Desi Plaza Caterings</h1>
          <p className="hero-subtitle">Plan your perfect event with us</p>

          <div className="action-buttons">
            <button
              className="action-card enquiry-card"
              onClick={() => setActiveSection("enquiry")}
            >
              <div className="card-icon">📋</div>
              <h3 className="card-title">Enquiry</h3>
              <p className="card-description">Tell us about your event</p>
            </button>

            <button
              className="action-card menu-card"
              onClick={() => setActiveSection("menu")}
            >
              <div className="card-icon">🍽️</div>
              <h3 className="card-title">View Menu</h3>
              <p className="card-description">Browse our delicious offerings</p>
            </button>
          </div>
        </section>
      )}

      <section className="services-section">
        <h2>Our Services</h2>
        <div className="services-grid">
          <div className="service-card">
            <div className="service-icon">💍</div>
            <h3>Weddings</h3>
            <p>Grand celebrations with premium cuisines and impeccable service</p>
          </div>
          <div className="service-card">
            <div className="service-icon">🎉</div>
            <h3>Events</h3>
            <p>Birthdays, anniversaries, and special occasions catered perfectly</p>
          </div>
          <div className="service-card">
            <div className="service-icon">🏢</div>
            <h3>Corporate</h3>
            <p>Professional catering for meetings, conferences, and corporate events</p>
          </div>
        </div>
      </section>
    </div>
  );
}

export default Home;

