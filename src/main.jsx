import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App.jsx";
import "./styles/design-system.css";
import "./styles/print.css";
import "./index.css";

// Note: Auth validation happens in App.jsx
// localStorage is NOT cleared here to allow login to work properly

ReactDOM.createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
