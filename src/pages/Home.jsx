import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import Enquiry from "./Enquiry";
import backgroundImage from "../Background.jpg";

function Home() {
  const navigate = useNavigate();
  const [activeSection, setActiveSection] = useState(null);
  const [userRole, setUserRole] = useState(null);
  const [permissions, setPermissions] = useState(null);

  // Special items with images
  const specialItems = [
    {
      id: 1,
      name: "Tandoori Chicken",
      category: "Non Veg Kebab's",
      image: "/tandoori-chicken.jpg",
      description: "Marinated in yogurt and spices, perfectly roasted",
      price: "$170/Full Tray"
    },
    {
      id: 2,
      name: "Chicken Tikka Kebab",
      category: "Non Veg Kebab's",
      image: "/chicken-tikka.jpg",
      description: "Tender chicken pieces with aromatic spices",
      price: "$170/Full Tray"
    },
    {
      id: 3,
      name: "Paneer Fried Rice",
      category: "Special Rice",
      image: "/paneer-rice.jpg",
      description: "Fragrant rice with cottage cheese and veggies",
      price: "$160/Full Tray"
    },
    {
      id: 4,
      name: "Chilli Chicken",
      category: "Non Veg Appetizers",
      image: "/chilli-chicken.jpg",
      description: "Spicy and tangy chicken appetizer",
      price: "$170/Full Tray"
    },
    {
      id: 5,
      name: "Butter Chicken",
      category: "Non Veg Curries",
      image: "/butter-chicken.jpg",
      description: "Creamy tomato curry with tender chicken pieces",
      price: "$280/Full Tray"
    },
    {
      id: 6,
      name: "Gulab Jamun",
      category: "Desserts",
      image: "/gulab-jamun.jpg",
      description: "Sweet milk solids balls in sugar syrup",
      price: "$100/Full Tray"
    }
  ];

  useEffect(() => {
    const userData = localStorage.getItem('user');
    if (userData) {
      try {
        const user = JSON.parse(userData);
        setUserRole(user.role);
        // Get permissions from localStorage or user object
        // Admin users get all permissions by default
        const userPermissions = user.role === 'admin' ? {
          canCreateInstantOrder: true,
          canViewInstantOrders: true,
          canCreateEnquiry: true,
          canViewEnquiries: true,
          canViewMenu: true,
          canManageQuotations: true,
          canViewReports: true
        } : (user.customPermissions || user.permissions || {});
        setPermissions(userPermissions);
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

  return (
    <div className="home-container">
      {/* ADMIN/LOGGED-IN USER VIEW */}
      {userRole && (
        <section 
          className="hero"
          style={{
            backgroundImage: `linear-gradient(135deg, rgba(0, 0, 0, 0.15) 0%, rgba(0, 0, 0, 0.2) 50%, rgba(0, 0, 0, 0.15) 100%), url(${backgroundImage})`,
            backgroundSize: 'cover',
            backgroundPosition: 'center bottom',
            backgroundRepeat: 'no-repeat',
            backgroundAttachment: 'scroll'
          }}
        >
          <div className="hero-content">
            <h1 className="hero-title">Welcome Back</h1>
            <p className="hero-subtitle">What would you like to do?</p>

            <div className="action-buttons grid-3">
              {permissions?.canCreateInstantOrder === true && (
                <div className="card" style={{ background: '#8b0000', borderColor: '#ffffff' }}>
                  <div className="card-emoji">🧾</div>
                  <strong style={{ color: '#ffffff' }}>Create Instant Order</strong>
                  <p style={{ color: 'rgba(255, 255, 255, 0.9)' }}>Quick order and KOT</p>
                  <button
                    className="btn"
                    onClick={() => navigate("/instantorder")}
                  >
                    Create
                  </button>
                </div>
              )}

              {permissions?.canCreateEnquiry === true && (
                <div className="card" style={{ background: '#8b0000', borderColor: '#ffffff' }}>
                  <div className="card-emoji">📋</div>
                  <strong style={{ color: '#ffffff' }}>New Enquiry</strong>
                  <p style={{ color: 'rgba(255, 255, 255, 0.9)' }}>Send us an enquiry</p>
                  <button
                    className="btn"
                    onClick={() => setActiveSection("enquiry")}
                  >
                    Start
                  </button>
                </div>
              )}

              {permissions?.canViewMenu === true && (
                <div className="card" style={{ background: '#8b0000', borderColor: '#ffffff' }}>
                  <div className="card-emoji">🍽️</div>
                  <strong style={{ color: '#ffffff' }}>View Menu</strong>
                  <p style={{ color: 'rgba(255, 255, 255, 0.9)' }}>Browse our offerings</p>
                  <button
                    className="btn"
                    onClick={() => navigate("/menu")}
                  >
                    Browse
                  </button>
                </div>
              )}
            </div>
          </div>
        </section>
      )}

      {/* PUBLIC USER VIEW */}
      {!userRole && (
        <section 
          className="hero"
          style={{
            backgroundImage: `linear-gradient(135deg, rgba(0, 0, 0, 0.15) 0%, rgba(0, 0, 0, 0.2) 50%, rgba(0, 0, 0, 0.15) 100%), url(${backgroundImage})`,
            backgroundSize: 'cover',
            backgroundPosition: 'center bottom',
            backgroundRepeat: 'no-repeat',
            backgroundAttachment: 'scroll'
          }}
        >
          <div className="hero-content">
            <h1 className="hero-title">Welcome to<br />Desi Plaza Caterings</h1>
            <p className="hero-subtitle">Plan your perfect event with us</p>

            <div className="action-buttons grid-3">
              <div className="card guest-card" style={{ background: 'transparent', border: '2px solid #ffd700' }}>
                <strong style={{ color: '#ffffff' }}>Enquiry</strong>
                <p style={{ color: '#ffffff' }}>Tell us about your event</p>
                <button
                  className="btn"
                  onClick={() => setActiveSection("enquiry")}
                  style={{ width: '140px', padding: '12px 24px', fontSize: '0.95rem', whiteSpace: 'nowrap' }}
                >
                  Get Started
                </button>
              </div>

              <div className="card guest-card" style={{ background: 'transparent', border: '2px solid #ffd700' }}>
                <strong style={{ color: '#ffffff' }}>Signature Dishes</strong>
                <p style={{ color: '#ffffff' }}>Our specialty items</p>
                <button
                  className="btn"
                  onClick={() => navigate('/special-items')}
                  style={{ width: '140px', padding: '12px 24px', fontSize: '0.95rem', whiteSpace: 'nowrap' }}
                >
                  Explore
                </button>
              </div>

              <div className="card guest-card" style={{ background: 'transparent', border: '2px solid #ffd700' }}>
                <strong style={{ color: '#ffffff' }}>View Menu</strong>
                <p style={{ color: '#ffffff' }}>Browse our<br />delicious menu</p>
                <button
                  className="btn"
                  onClick={() => navigate("/menu")}
                  style={{ width: '140px', padding: '12px 24px', fontSize: '0.95rem', whiteSpace: 'nowrap' }}
                >
                  Browse
                </button>
              </div>
            </div>
          </div>
        </section>
      )}

      <section className="section section-light">
        <div style={{ textAlign: 'center', marginBottom: '3rem' }}>
          <h2 className="section-title">✨ Our Signature Dishes</h2>
          <p style={{ fontSize: '1rem', color: '#666' }}>Handpicked favorites from our premium menu</p>
        </div>

        <div className="grid-3">
          {specialItems.map((item) => (
            <div key={item.id} className="card" style={{ display: 'flex', flexDirection: 'column', background: '#ffffff', border: '2px solid #f0f0f0' }}>
              <div style={{ marginBottom: '1rem' }}>
                <img src={item.image} alt={item.name} style={{ width: '100%', height: '220px', objectFit: 'cover', borderRadius: '0.5rem' }} />
                <span className="badge" style={{ display: 'inline-block', marginTop: '0.5rem', fontSize: '0.8rem', background: '#8b0000', color: '#ffffff', padding: '4px 8px', borderRadius: '4px' }}>{item.category}</span>
              </div>
              
              <div style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
                <h3 style={{ marginBottom: '0.5rem', color: '#8b0000', fontSize: '1.3rem' }}>{item.name}</h3>
                <p style={{ marginBottom: '1rem', color: '#666', flex: 1 }}>{item.description}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      <section className="section">
        <h2 className="section-title">Our Services</h2>
        <div className="grid-3">
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

