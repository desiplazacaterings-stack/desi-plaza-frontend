import "./CompanyHeader.css";

function CompanyHeader() {
  const companyInfo = {
    name: "Desi Plaza Caterings",
    address: "123 Main Street, City, State, ZIP",
    phone: "+91 12345 67890",
    email: "info@desiplazacaterings.com",
    gstin: "29ABCDE1234F2Z5",
    categories: "Weddings • Events • Corporate Catering",
    tagline: "Premium Catering Services for Your Special Events"
  };

  return (
    <header className="company-header">
      <div className="company-header-container">
        <div className="company-logo-section">
          <img 
            src="/logo.png" 
            alt={companyInfo.name} 
            className="company-logo"
          />
        </div>
        
        <div className="company-info-section">
          <h1 className="company-title">Welcome to {companyInfo.name}</h1>
          <p className="company-tagline">{companyInfo.tagline}</p>
          
          <div className="company-details">
            <p className="detail-item">
              📍 <strong>Address:</strong> {companyInfo.address}
            </p>
            <p className="detail-item">
              📞 <strong>Phone:</strong> <a href={`tel:${companyInfo.phone}`}>{companyInfo.phone}</a>
            </p>
            <p className="detail-item">
              📧 <strong>Email:</strong> <a href={`mailto:${companyInfo.email}`}>{companyInfo.email}</a>
            </p>
            <p className="detail-item">
              🏢 <strong>GSTIN:</strong> {companyInfo.gstin}
            </p>
          </div>
          
          <p className="company-categories">{companyInfo.categories}</p>
        </div>
      </div>
    </header>
  );
}

export default CompanyHeader;
