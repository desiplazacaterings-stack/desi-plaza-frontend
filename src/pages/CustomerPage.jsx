import { useState } from "react";
import { useNavigate } from "react-router-dom";
import Enquiry from "./Enquiry";
import "./CustomerPage.css";

function CustomerPage() {
  const navigate = useNavigate();
  const [activeSection, setActiveSection] = useState("menu");

  return (
    <div className="customer-page-container">
      {/* HEADER SECTION */}
      <section className="customer-header">
        <h1>🍽️ Welcome to Desi Plaza Caterings</h1>
        <p>Explore our menu and plan your perfect event with us</p>
      </section>

      {/* NAVIGATION TABS */}
      <section className="customer-nav">
        <button
          className={`nav-btn ${activeSection === "menu" ? "active" : ""}`}
          onClick={() => setActiveSection("menu")}
        >
          📋 View Our Menu
        </button>
        <button
          className={`nav-btn ${activeSection === "enquiry" ? "active" : ""}`}
          onClick={() => setActiveSection("enquiry")}
        >
          ✉️ Submit Enquiry
        </button>
      </section>

      {/* CONTENT SECTION */}
      <section className="customer-content">
        {activeSection === "menu" && (
          <div className="menu-section">
            <h2>Our Delicious Menu</h2>
            <p className="section-desc">
              Browse through our wide variety of dishes and cuisines
            </p>
            <div style={{ marginTop: '1.5rem' }}>
              <p style={{ fontSize: '1rem', color: '#666', marginBottom: '1rem' }}>
                👉 Click the button below to view our complete menu with all dishes and pricing
              </p>
              <button
                className="nav-btn"
                onClick={() => navigate("/menu")}
                style={{ padding: '12px 24px', fontSize: '1rem', cursor: 'pointer' }}
              >
                📋 Go to Full Menu →
              </button>
            </div>
          </div>
        )}

        {activeSection === "enquiry" && (
          <div className="enquiry-section">
            <h2>Plan Your Event</h2>
            <p className="section-desc">
              Tell us about your event and we'll get back to you with perfect catering options
            </p>
            <Enquiry />
          </div>
        )}
      </section>

      {/* FEATURES SECTION */}
      <section className="customer-features">
        <h2>Why Choose Us?</h2>
        <div className="features-grid">
          <div className="feature-card">
            <div className="feature-icon">🎯</div>
            <h3>Quality Service</h3>
            <p>Professional catering with attention to every detail</p>
          </div>
          <div className="feature-card">
            <div className="feature-icon">🍲</div>
            <h3>Diverse Menu</h3>
            <p>Wide variety of cuisines and dishes to choose from</p>
          </div>
          <div className="feature-card">
            <div className="feature-icon">⚡</div>
            <h3>Quick Service</h3>
            <p>Fast and reliable delivery for your events</p>
          </div>
          <div className="feature-card">
            <div className="feature-icon">💬</div>
            <h3>24/7 Support</h3>
            <p>Always available to assist with your catering needs</p>
          </div>
        </div>
      </section>

      {/* FOOTER CTA */}
      <section className="customer-footer">
        <h2>Ready to Book?</h2>
        <p>Choose a date and let's make your event memorable</p>
        <button className="cta-button" onClick={() => setActiveSection("enquiry")}>
          📞 Get in Touch Now
        </button>
      </section>
    </div>
  );
}

export default CustomerPage;
