import { useState } from "react";
import axios from "axios";
import API_ENDPOINTS from "../config";

export default function ViewSignedAgreement({ agreementId, customerName }) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const handleViewPDF = async () => {
    try {
      setLoading(true);
      const response = await axios.get(
        `${API_ENDPOINTS.BASE_URL}/api/agreements/pdf/${agreementId}`
      );

      if (response.data.pdfData) {
        // Open PDF in new window
        const link = document.createElement("a");
        link.href = response.data.pdfData;
        link.target = "_blank";
        link.download = `Agreement-${customerName}-${new Date().toISOString().split('T')[0]}.pdf`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
      }
    } catch (err) {
      setError(err.response?.data?.message || "Failed to load PDF");
      alert("Error: " + error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ display: "flex", gap: "8px" }}>
      <button
        onClick={handleViewPDF}
        disabled={loading}
        style={{
          padding: "6px 12px",
          backgroundColor: loading ? "#ccc" : "#9c27b0",
          color: "white",
          border: "none",
          borderRadius: "4px",
          cursor: loading ? "not-allowed" : "pointer",
          fontSize: "0.85em",
          fontWeight: "500"
        }}
        title="View signed agreement PDF"
      >
        {loading ? "⏳" : "📄"}
      </button>
    </div>
  );
}
