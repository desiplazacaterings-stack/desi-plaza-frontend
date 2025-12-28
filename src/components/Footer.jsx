import { Link } from "react-router-dom";
import "./Footer.css";

function Footer() {
  const currentYear = new Date().getFullYear();

  const companyInfo = {
    name: "Desi Plaza Caterings",
    phone: "+91 12345 67890",
    email: "info@desiplazacaterings.com",
    address: "123 Main Street, City, State, ZIP",
    gstin: "29ABCDE1234F2Z5"
  };

  const quickLinks = [
    { label: "Home", path: "/" },
    { label: "Instant Order", path: "/#order" },
    { label: "Enquiry", path: "/#enquiry" },
    { label: "Menu", path: "/#menu" },
  ];

  const serviceLinks = [
    { label: "View Enquiries", path: "/enquiries" },
    { label: "View Quotations", path: "/quotations" },
    { label: "Scheduled Meetings", path: "/scheduled-meetings" },
    { label: "Instant Orders", path: "/instantorderdetails" },
  ];

  const supportLinks = [
    { label: "Contact Us", url: `mailto:${companyInfo.email}` },
    { label: "Call Us", url: `tel:${companyInfo.phone}` },
    { label: "FAQs", href: "#" },
    { label: "Support", href: "#" },
  ];

  return (
    <footer className="footer">
      <div className="footer-container">
        {/* Company Info Section */}
        <div className="footer-section">
          <h3 className="footer-heading">About {companyInfo.name}</h3>
          <div className="company-footer-info">
            <p className="footer-description">
              Premium catering services for your special events, weddings, corporate functions, and celebrations.
            </p>
            <ul className="contact-list">
              <li>
                <span className="contact-icon">📍</span>
                <a href={`https://maps.google.com/?q=${encodeURIComponent(companyInfo.address)}`} 
                   target="_blank" 
                   rel="noopener noreferrer"
                   className="contact-link">
                  {companyInfo.address}
                </a>
              </li>
              <li>
                <span className="contact-icon">📞</span>
                <a href={`tel:${companyInfo.phone}`} className="contact-link">
                  {companyInfo.phone}
                </a>
              </li>
              <li>
                <span className="contact-icon">📧</span>
                <a href={`mailto:${companyInfo.email}`} className="contact-link">
                  {companyInfo.email}
                </a>
              </li>
              <li>
                <span className="contact-icon">🏢</span>
                <span className="gstin-info">GST ID: {companyInfo.gstin}</span>
              </li>
            </ul>
          </div>
        </div>

        {/* Quick Links Section */}
        <div className="footer-section">
          <h3 className="footer-heading">Quick Links</h3>
          <ul className="footer-links">
            {quickLinks.map((link) => (
              <li key={link.label}>
                <Link to={link.path} className="footer-link">
                  {link.label}
                </Link>
              </li>
            ))}
          </ul>
        </div>

        {/* Services Section */}
        <div className="footer-section">
          <h3 className="footer-heading">Services</h3>
          <ul className="footer-links">
            {serviceLinks.map((link) => (
              <li key={link.label}>
                <Link to={link.path} className="footer-link">
                  {link.label}
                </Link>
              </li>
            ))}
          </ul>
        </div>

        {/* Support Section */}
        <div className="footer-section">
          <h3 className="footer-heading">Support</h3>
          <ul className="footer-links">
            {supportLinks.map((link) => (
              <li key={link.label}>
                {link.url ? (
                  <a href={link.url} className="footer-link">
                    {link.label}
                  </a>
                ) : (
                  <Link to={link.href} className="footer-link">
                    {link.label}
                  </Link>
                )}
              </li>
            ))}
          </ul>
        </div>
      </div>

      {/* Footer Bottom */}
      <div className="footer-bottom">
        <div className="footer-bottom-container">
          <p className="footer-copyright">
            &copy; {currentYear} {companyInfo.name}. All rights reserved.
          </p>
          <div className="footer-legal">
            <a href="#" className="footer-legal-link">Privacy Policy</a>
            <span className="separator">•</span>
            <a href="#" className="footer-legal-link">Terms of Service</a>
            <span className="separator">•</span>
            <a href="#" className="footer-legal-link">Cookie Policy</a>
          </div>
        </div>
      </div>
    </footer>
  );
}

export default Footer;
