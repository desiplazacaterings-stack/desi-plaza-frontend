import "./CompanyHeader.css";

function CompanyHeader() {
  const companyInfo = {
    name: "Desi Plaza Caterings",
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
          <h1 className="company-title">{companyInfo.name}</h1>
          <p className="company-tagline">{companyInfo.tagline}</p>
        </div>
      </div>
    </header>
  );
}

export default CompanyHeader;
