import { useState } from "react";
import InstantOrder from "./InstantOrder";
import Enquiry from "./Enquiry";
import Menu from "./Menu";
import "../App.css";
import "./Home.css";

function Home() {
  const [activeSection, setActiveSection] = useState("enquiry");

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
      {/* CONDITIONAL RENDERING - Show Enquiry by default */}
      <section className="content-section">
        {activeSection === "enquiry" && <Enquiry />}
      </section>

      {/* MENU ITEMS - Show without prices */}
      <section className="menu-preview-section">
        <h2>Browse Our Menu</h2>
        <Menu hidePrice={true} />
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

