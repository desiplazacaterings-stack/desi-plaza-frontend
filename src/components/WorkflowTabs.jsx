import { NavLink } from "react-router-dom";

const tabs = [
  { path: "/", label: "🏠 Home" },
  { path: "/enquiry", label: "1️⃣ Enquiry" },
  { path: "/menu", label: "2️⃣ Menu" },
  { path: "/quotation", label: "3️⃣ Quotation" },
  { path: "/confirm", label: "4️⃣ Confirmed Orders" },
  { path: "/event", label: "5️⃣ Events" }
];

function WorkflowTabs() {
  return (
    <div className="workflow-tabs" style={{ display: 'flex', gap: '10px', margin: '20px 0', flexWrap: 'wrap' }}>
      {tabs.map(tab => (
        <NavLink
          key={tab.path}
          to={tab.path}
          className={({ isActive }) =>
            isActive ? 'button workflow-tab active' : 'button workflow-tab'}
          style={({ isActive }) => ({
            background: isActive ? '#f5ba4a' : '#fff',
            color: isActive ? '#232a36' : '#222',
            border: '1px solid #ccc',
            borderRadius: '8px',
            padding: '10px 18px',
            fontWeight: 600,
            boxShadow: isActive ? '0 2px 8px #ffe0a3' : 'none',
            transition: 'background 0.2s, color 0.2s',
            textDecoration: 'none',
            fontSize: '1.08em',
          })}
        >
          {tab.label}
        </NavLink>
      ))}
    </div>
  );
}

const styles = {
  container: {
    display: "flex",
    gap: "4px",
    margin: "20px 0",
    flexWrap: "wrap",
    borderBottom: "2px solid #e8e8f0",
    paddingBottom: "0",
    background: "#fff",
    borderRadius: "8px 8px 0 0"
  },
  tab: {
    padding: "12px 20px",
    borderRadius: "8px 8px 0 0",
    textDecoration: "none",
    border: "2px solid transparent",
    color: "#666",
    background: "transparent",
    fontWeight: "600",
    fontSize: "0.98em",
    transition: "all 0.3s ease",
    borderBottom: "3px solid transparent",
    cursor: "pointer",
    position: "relative"
  },
  active: {
    background: "linear-gradient(180deg, #f5ba4a 0%, #ffc757 100%)",
    color: "#232a36",
    borderBottom: "3px solid #232a36",
    boxShadow: "0 4px 12px rgba(245, 186, 74, 0.2)"
  }
};

export default WorkflowTabs;
