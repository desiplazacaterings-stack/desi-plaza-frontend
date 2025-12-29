import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import Enquiry from "./Enquiry";
import Menu from "./Menu";
import "./Home.css";

function Home() {
  const navigate = useNavigate();
  const [activeSection, setActiveSection] = useState(null);
  const [userRole, setUserRole] = useState(null);

  useEffect(() => {
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

