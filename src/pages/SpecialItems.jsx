import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import "./SpecialItems.css";

function SpecialItems() {
  const navigate = useNavigate();
  const [filteredCategory, setFilteredCategory] = useState("All");

  // Enhanced special items with descriptions
  const specialItems = [
    {
      id: 1,
      name: "Tandoori Chicken",
      category: "Non Veg Kebab's",
      image: "/tandoori-chicken.jpg",
      description: "Marinated in yogurt and traditional spices, perfectly charred in traditional tandoor oven",
      longDesc: "Our signature tandoori chicken is prepared using an authentic family recipe. Tender chicken pieces marinated in yogurt and aromatic spices are cooked in our traditional tandoor, giving it a perfect smoky flavor.",
      price: "$170/Full Tray",
      highlights: ["Charred to perfection", "Authentic recipe", "Smoky flavor"],
      servings: "8-10 people"
    },
    {
      id: 2,
      name: "Chicken Tikka Kebab",
      category: "Non Veg Kebab's",
      image: "/chicken-tikka.jpg",
      description: "Tender chicken pieces with aromatic spices and creamy marinade",
      longDesc: "Succulent chicken tikka pieces crafted from premium chicken, marinated with yogurt and freshly ground spices. Each piece is grilled to perfection with a juicy center and golden exterior.",
      price: "$170/Full Tray",
      highlights: ["Premium quality", "Creamy marinade", "Perfectly grilled"],
      servings: "8-10 people"
    },
    {
      id: 3,
      name: "Paneer Fried Rice",
      category: "Special Rice",
      image: "/paneer-rice.jpg",
      description: "Fragrant basmati rice with cottage cheese and seasonal vegetables",
      longDesc: "A vegetarian delight combining fluffy basmati rice with soft paneer cubes and colorful vegetables. Cooked with garlic, ginger, and house spices for an aromatic experience.",
      price: "$160/Full Tray",
      highlights: ["Fluffy rice", "Soft paneer", "House spices"],
      servings: "8-10 people"
    },
    {
      id: 4,
      name: "Chilli Chicken",
      category: "Non Veg Appetizers",
      image: "/chilli-chicken.svg",
      description: "Crispy chicken pieces tossed in tangy chilli sauce",
      longDesc: "Crispy fried chicken pieces coated in our special chilli sauce made with fresh chillies, ginger, and garlic. A perfect appetizer that balances heat and tanginess.",
      price: "$170/Full Tray",
      highlights: ["Crispy exterior", "Tangy sauce", "Perfectly spiced"],
      servings: "6-8 people"
    },
    {
      id: 5,
      name: "Butter Chicken",
      category: "Non Veg Curries",
      image: "/butter-chicken.svg",
      description: "Creamy tomato curry with tender chicken pieces",
      longDesc: "Our most beloved curry! Tender chicken pieces cooked in a rich, creamy tomato-based sauce with aromatic spices, cream, and a touch of sweetness. Served with naan or rice.",
      price: "$280/Full Tray",
      highlights: ["Creamy sauce", "Tender chicken", "Rich flavor"],
      servings: "10-12 people"
    },
    {
      id: 6,
      name: "Gulab Jamun",
      category: "Desserts",
      image: "/gulab-jamun.svg",
      description: "Sweet milk solids balls soaked in rose sugar syrup",
      longDesc: "Traditional Indian dessert made from milk solids fried until golden brown and soaked in rose-scented sugar syrup. Served warm for the best experience.",
      price: "$100/Full Tray",
      highlights: ["Traditional recipe", "Rose flavor", "Sweet delight"],
      servings: "12-15 pieces"
    }
  ];

  const categories = ["All", ...new Set(specialItems.map(item => item.category))];

  const filtered = filteredCategory === "All" 
    ? specialItems 
    : specialItems.filter(item => item.category === filteredCategory);

  return (
    <div className="special-items-page">
      {/* Hero Section */}
      <section className="hero-section">
        <div className="hero-content">
          <h1>✨ Our Signature Dishes</h1>
          <p>Handpicked specialties from our premium menu, crafted with passion and tradition</p>
          <button 
            className="cta-button"
            onClick={() => navigate('/menu')}
          >
            View Full Menu
          </button>
        </div>
      </section>

      {/* Filter Section */}
      <section className="filter-section">
        <div className="filter-container">
          {categories.map(category => (
            <button
              key={category}
              className={`filter-btn ${filteredCategory === category ? 'active' : ''}`}
              onClick={() => setFilteredCategory(category)}
            >
              {category}
            </button>
          ))}
        </div>
      </section>

      {/* Items Grid */}
      <section className="items-section">
        <div className="items-grid">
          {filtered.map((item) => (
            <div key={item.id} className="item-card">
              <div className="item-image">
                <img src={item.image} alt={item.name} className="item-photo" />
                <div className="category-tag">{item.category}</div>
              </div>

              <div className="item-info">
                <h3>{item.name}</h3>
                <p className="short-desc">{item.description}</p>

                <div className="highlights">
                  {item.highlights.map((highlight, idx) => (
                    <span key={idx} className="highlight-tag">
                      {highlight}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Why Choose Us */}
      <section className="why-choose-section">
        <h2>Why Choose Our Signature Dishes?</h2>
        <div className="reasons-grid">
          <div className="reason-card">
            <div className="reason-icon">👨‍🍳</div>
            <h4>Expert Chefs</h4>
            <p>Prepared by experienced chefs with years of culinary expertise</p>
          </div>
          <div className="reason-card">
            <div className="reason-icon">🥘</div>
            <h4>Premium Ingredients</h4>
            <p>Only the finest fresh ingredients sourced from trusted suppliers</p>
          </div>
          <div className="reason-card">
            <div className="reason-icon">🔥</div>
            <h4>Traditional Recipes</h4>
            <p>Authentic recipes passed down through generations</p>
          </div>
          <div className="reason-card">
            <div className="reason-icon">⚡</div>
            <h4>Fresh & Quick</h4>
            <p>Prepared fresh for your order with minimal delivery time</p>
          </div>
        </div>
      </section>
    </div>
  );
}

export default SpecialItems;
