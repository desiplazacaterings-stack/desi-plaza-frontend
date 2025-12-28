import { useLocation, Link } from "react-router-dom";
import "./BreadcrumbNav.css";

function BreadcrumbNav() {
  const location = useLocation();
  const pathnames = location.pathname.split("/").filter((x) => x);

  const routeLabels = {
    "": "Home",
    "instantorderdetails": "Instant Orders",
    "enquiries": "Enquiries",
    "quotations": "Quotations",
    "scheduled-meetings": "Meetings",
    "admin": "Admin Dashboard",
    "login": "Login",
    "register": "Register",
    "enquiry": "New Enquiry",
    "menu": "Menu",
    "quotation": "Quotation",
    "confirm": "Confirmed Orders",
    "event": "Events",
    "payments": "Payments Tracking",
  };

  // Don't show breadcrumbs on home page
  if (pathnames.length === 0) return null;

  return (
    <nav 
      className="breadcrumb-nav" 
      role="navigation" 
      aria-label="Breadcrumb"
    >
      <div className="breadcrumb-container">
        <Link to="/" className="breadcrumb-link breadcrumb-home" title="Go to Home">
          🏠 Home
        </Link>
        
        {pathnames.map((pathname, index) => {
          const routePath = `/${pathnames.slice(0, index + 1).join("/")}`;
          const label = routeLabels[pathname] || pathname.charAt(0).toUpperCase() + pathname.slice(1);
          const isLast = index === pathnames.length - 1;

          return (
            <div key={index} className="breadcrumb-item">
              <span className="breadcrumb-separator" aria-hidden="true">→</span>
              {isLast ? (
                <span className="breadcrumb-current" aria-current="page">
                  {label}
                </span>
              ) : (
                <Link to={routePath} className="breadcrumb-link" title={`Go to ${label}`}>
                  {label}
                </Link>
              )}
            </div>
          );
        })}
      </div>
    </nav>
  );
}

export default BreadcrumbNav;
