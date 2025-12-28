import { useState } from "react";
import InstantOrder from "./InstantOrder";
import Enquiry from "./Enquiry";
import Menu from "./Menu";
import "../App.css";
import "./Home.css";

function Home() {
  const [activeSection, setActiveSection] = useState(null);

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
      {/* ACTION BUTTONS */}
      <section className="action-section">
        <h2>What Would You Like To Do?</h2>
        <div className="home-buttons">
          <button 
            className="home-btn order-btn"
            onClick={() => setActiveSection("order")}
          >
            <span className="btn-icon">🧾</span>
            <span className="btn-label">Instant Order</span>
            <span className="btn-desc">Quick ordering for immediate catering</span>
          </button>

          <button 
            className="home-btn enquiry-btn"
            onClick={() => setActiveSection("enquiry")}
          >
            <span className="btn-icon">📋</span>
            <span className="btn-label">Customer Enquiry</span>
            <span className="btn-desc">Plan your special event with us</span>
          </button>

          <button 
            className="home-btn menu-btn"
            onClick={() => setActiveSection("menu")}
          >
            <span className="btn-icon">🍽️</span>
            <span className="btn-label">View Menu</span>
            <span className="btn-desc">Explore our delicious offerings</span>
          </button>
        </div>
      </section>

      <hr className="divider" />

      {/* CONDITIONAL RENDERING */}
      <section className="content-section">
        {activeSection === "order" && <InstantOrder />}
        {activeSection === "enquiry" && <Enquiry />}
        {activeSection === "menu" && <Menu />}
      </section>

      {/* SERVICES SHOWCASE */}
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

