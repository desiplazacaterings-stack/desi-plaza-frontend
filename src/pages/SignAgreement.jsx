import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import axios from "axios";
import API_ENDPOINTS from "../config";
import SignaturePad from "../components/SignaturePad";
import generateAgreement from "../utils/agreementTemplate";
import html2pdf from "html2pdf.js";

function SignAgreement() {
  const { shareToken } = useParams();
  const [agreement, setAgreement] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [customerSignerName, setCustomerSignerName] = useState("");
  const [businessSignerName, setBusinessSignerName] = useState("");
  const [showCustomerPad, setShowCustomerPad] = useState(false);
  const [showBusinessPad, setShowBusinessPad] = useState(false);
  const [customerSigned, setCustomerSigned] = useState(false);
  const [businessSigned, setBusinessSigned] = useState(false);
  const [customerSignature, setCustomerSignature] = useState(null);
  const [businessSignature, setBusinessSignature] = useState(null);
  const [signing, setSigning] = useState(false);

  useEffect(() => {
    fetchAgreement();
  }, [shareToken]);

  const fetchAgreement = async () => {
    try {
      setLoading(true);
      const response = await axios.get(
        `${API_ENDPOINTS.BASE_URL}/api/agreements/view/${shareToken}`
      );
      setAgreement(response.data.agreement);
      
      // Load existing signatures
      if (response.data.agreement.customerSigned) {
        setCustomerSigned(true);
      }
      if (response.data.agreement.businessSigned) {
        setBusinessSigned(true);
      }
      
      setLoading(false);
    } catch (err) {
      setError(
        err.response?.data?.message || "Failed to load agreement. Link may have expired."
      );
      setLoading(false);
    }
  };

  const handleCustomerSignature = async (signatureData) => {
    if (!customerSignerName.trim()) {
      alert("Please enter your name before signing");
      return;
    }

    try {
      setSigning(true);
      await axios.post(
        `${API_ENDPOINTS.BASE_URL}/api/agreements/submit-signature/${shareToken}`,
        {
          signatureData,
          signedBy: customerSignerName,
          role: "customer"
        }
      );

      setCustomerSignature(signatureData);
      setCustomerSigned(true);
      setShowCustomerPad(false);
      alert("Customer signature added! Now waiting for business signature.");
    } catch (err) {
      alert(err.response?.data?.message || "Failed to submit signature");
    } finally {
      setSigning(false);
    }
  };

  const handleBusinessSignature = async (signatureData) => {
    if (!businessSignerName.trim()) {
      alert("Please enter your name before signing");
      return;
    }

    try {
      setSigning(true);
      await axios.post(
        `${API_ENDPOINTS.BASE_URL}/api/agreements/submit-signature/${shareToken}`,
        {
          signatureData,
          signedBy: businessSignerName,
          role: "business"
        }
      );

      setBusinessSignature(signatureData);
      setBusinessSigned(true);
      setShowBusinessPad(false);
      alert("Agreement signed by both parties! Generating PDF...");
      
      // Generate PDF after both signatures
      generateAndSavePDF(signatureData);
    } catch (err) {
      alert(err.response?.data?.message || "Failed to submit signature");
    } finally {
      setSigning(false);
    }
  };

  const generateAndSavePDF = async (businessSig) => {
    try {
      // Create a printable version of the agreement
      const element = document.createElement("div");
      element.innerHTML = `
        <div style="font-family: Arial, sans-serif; padding: 40px; max-width: 900px; margin: 0 auto;">
          <h1 style="text-align: center; color: #232a36;">CATERING SERVICE AGREEMENT</h1>
          <div style="border-top: 2px solid #333; margin: 20px 0;"></div>
          
          <pre style="font-family: Arial; white-space: pre-wrap; word-wrap: break-word; font-size: 12px;">
${generateAgreement({
  customerName: agreement.customerName,
  mobile: agreement.mobile,
  email: agreement.email,
  eventType: agreement.eventType,
  eventDate: agreement.eventDate,
  eventTime: agreement.eventTime,
  guests: agreement.guests,
  location: agreement.location,
  notes: agreement.notes
})}
          </pre>
          
          <div style="margin-top: 40px; border-top: 2px solid #333; padding-top: 20px;">
            <div style="display: flex; justify-content: space-between; margin-top: 30px;">
              <div style="width: 45%;">
                <h4>CUSTOMER SIGNATURE:</h4>
                <img src="${customerSignature}" style="max-width: 100%; height: 100px; border: 1px solid #ccc; margin: 10px 0;" />
                <p><strong>Name:</strong> ${customerSignerName}</p>
                <p><strong>Date:</strong> ${new Date().toLocaleDateString()}</p>
              </div>
              <div style="width: 45%;">
                <h4>BUSINESS SIGNATURE:</h4>
                <img src="${businessSig}" style="max-width: 100%; height: 100px; border: 1px solid #ccc; margin: 10px 0;" />
                <p><strong>Name:</strong> ${businessSignerName}</p>
                <p><strong>Date:</strong> ${new Date().toLocaleDateString()}</p>
              </div>
            </div>
          </div>
        </div>
      `;

      const options = {
        margin: 10,
        filename: `Agreement-${agreement.customerName}-${new Date().toISOString().split('T')[0]}.pdf`,
        image: { type: "jpeg", quality: 0.98 },
        html2canvas: { scale: 2 },
        jsPDF: { orientation: "portrait", unit: "mm", format: "a4" }
      };

      // Generate PDF
      html2pdf().set(options).from(element).save();

      // Send PDF data to backend
      const pdf = await html2pdf().set(options).from(element).outputPdf("datauristring");
      
      await axios.post(
        `${API_ENDPOINTS.BASE_URL}/api/agreements/save-pdf/${shareToken}`,
        { pdfData: pdf }
      );
    } catch (err) {
      console.error("Error generating PDF:", err);
    }
  };

  if (loading) {
    return (
      <div style={{ padding: "40px", textAlign: "center" }}>
        <div style={{ fontSize: "1.2em", color: "#666" }}>Loading agreement...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div style={{ padding: "40px", textAlign: "center", color: "#d32f2f", fontSize: "1.1em" }}>
        <h2>⚠️ Error</h2>
        <p>{error}</p>
      </div>
    );
  }

  if (!agreement) {
    return (
      <div style={{ padding: "40px", textAlign: "center" }}>
        <div style={{ fontSize: "1.2em", color: "#666" }}>Agreement not found</div>
      </div>
    );
  }

  const agreementContent = generateAgreement({
    customerName: agreement.customerName,
    mobile: agreement.mobile,
    email: agreement.email,
    eventType: agreement.eventType,
    eventDate: agreement.eventDate,
    eventTime: agreement.eventTime,
    guests: agreement.guests,
    location: agreement.location,
    notes: agreement.notes
  });

  return (
    <div style={{ maxWidth: "900px", margin: "0 auto", padding: "20px" }}>
      {/* Header */}
      <div
        style={{
          backgroundColor: "#f5f5f5",
          padding: "20px",
          borderRadius: "8px",
          marginBottom: "20px"
        }}
      >
        <h1 style={{ margin: "0 0 10px 0", color: "#232a36" }}>
          📋 Service Agreement
        </h1>
        <p style={{ margin: "0", color: "#666", fontSize: "0.95em" }}>
          Please review the agreement and sign below. Both parties need to sign for completion.
        </p>
      </div>

      {/* Agreement Content with Inline Signatures */}
      <div
        style={{
          backgroundColor: "#fff",
          padding: "30px",
          borderRadius: "8px",
          border: "1px solid #e0e0e0",
          marginBottom: "24px",
          lineHeight: "1.6",
          fontSize: "0.85em",
          color: "#333"
        }}
      >
        <div dangerouslySetInnerHTML={{ __html: agreementContent }} />

        {/* Customer Signature Section - Inline */}
        <div style={{ marginTop: "30px", paddingTop: "20px", borderTop: "2px solid #e0e0e0" }}>
          <h4 style={{ marginTop: "0", color: "#232a36", fontSize: "0.95em" }}>👤 CUSTOMER SIGNATURE:</h4>

          {!customerSigned ? (
            <div>
              <div style={{ marginBottom: "16px" }}>
                <label style={{ display: "block", marginBottom: "8px", fontWeight: "500" }}>
                  Full Name *
                </label>
                <input
                  type="text"
                  value={customerSignerName}
                  onChange={(e) => setCustomerSignerName(e.target.value)}
                  placeholder="Enter your full name"
                  style={{
                    width: "100%",
                    padding: "10px 12px",
                    border: "1px solid #ccc",
                    borderRadius: "4px",
                    fontSize: "1em",
                    boxSizing: "border-box"
                  }}
                />
              </div>

              {!showCustomerPad && (
                <button
                  onClick={() => setShowCustomerPad(true)}
                  style={{
                    padding: "10px 20px",
                    backgroundColor: "#1976d2",
                    color: "white",
                    border: "none",
                    borderRadius: "4px",
                    cursor: "pointer",
                    fontSize: "0.95em",
                    fontWeight: "500"
                  }}
                >
                  ✏️ Sign Here
                </button>
              )}

              {showCustomerPad && (
                <div style={{ marginTop: "16px" }}>
                  <p style={{ margin: "8px 0", color: "#666", fontSize: "0.9em" }}>
                    Sign in the box below:
                  </p>
                  <SignaturePad
                    onSign={handleCustomerSignature}
                    disabled={signing}
                  />
                </div>
              )}
            </div>
          ) : (
            <div style={{ padding: "12px", backgroundColor: "#f0f8f0" }}>
              <p style={{ margin: "0", color: "#2e7d32" }}>
                ✓ Signed by: {customerSignerName}
              </p>
            </div>
          )}
        </div>

        {/* Business Signature Section - Inline */}
        <div style={{ marginTop: "30px", paddingTop: "20px", borderTop: "2px solid #e0e0e0" }}>
          <h4 style={{ marginTop: "0", color: "#232a36", fontSize: "0.95em" }}>🏢 DESI PLAZA CATERINGS - AUTHORIZED REPRESENTATIVE:</h4>

          <div style={{ marginBottom: "16px", padding: "12px", backgroundColor: "#f9f9f9", borderRadius: "4px" }}>
            <p style={{ margin: "0 0 10px 0", color: "#666", fontSize: "0.9em", fontWeight: "500" }}>
              Authorized Signature:
            </p>
            <img 
              src="/Signature.png" 
              alt="Authorized Signature of Desi Plaza Caterings Representative" 
              style={{ 
                maxHeight: "70px", 
                width: "auto",
                display: "block"
              }} 
            />
          </div>

          {!businessSigned ? (
            <div>
              <div style={{ marginBottom: "16px" }}>
                <label style={{ display: "block", marginBottom: "8px", fontWeight: "500" }}>
                  Authorized Representative Name *
                </label>
                <input
                  type="text"
                  value={businessSignerName}
                  onChange={(e) => setBusinessSignerName(e.target.value)}
                  placeholder="Enter authorized representative name"
                  style={{
                    width: "100%",
                    padding: "10px 12px",
                    border: "1px solid #ccc",
                    borderRadius: "4px",
                    fontSize: "1em",
                    boxSizing: "border-box"
                  }}
                />
              </div>

              {!showBusinessPad && (
                <button
                  onClick={() => setShowBusinessPad(true)}
                  disabled={!customerSigned}
                  style={{
                    padding: "10px 20px",
                    backgroundColor: customerSigned ? "#f39c12" : "#ccc",
                    color: "white",
                    border: "none",
                    borderRadius: "4px",
                    cursor: customerSigned ? "pointer" : "not-allowed",
                    fontSize: "0.95em",
                    fontWeight: "500"
                  }}
                >
                  ✏️ {customerSigned ? "Sign Here" : "Awaiting Customer Signature"}
                </button>
              )}

              {showBusinessPad && (
                <div style={{ marginTop: "16px" }}>
                  <p style={{ margin: "8px 0", color: "#666", fontSize: "0.9em" }}>
                    Sign in the box below:
                  </p>
                  <SignaturePad
                    onSign={handleBusinessSignature}
                    disabled={signing}
                  />
                </div>
              )}
            </div>
          ) : (
            <div style={{ padding: "12px", backgroundColor: "#f0f8f0" }}>
              <p style={{ margin: "0", color: "#2e7d32" }}>
                ✓ Signed by: {businessSignerName}
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Completion Message */}
      {customerSigned && businessSigned && (
        <div
          style={{
            backgroundColor: "#e8f5e9",
            padding: "30px",
            borderRadius: "8px",
            border: "2px solid #4caf50",
            textAlign: "center",
            marginBottom: "20px"
          }}
        >
          <h2 style={{ margin: "0 0 16px 0", color: "#2e7d32" }}>
            ✅ Agreement Successfully Signed!
          </h2>
          <p style={{ margin: "0", color: "#558b2f", fontSize: "0.95em" }}>
            A PDF copy has been saved to the system.
          </p>
        </div>
      )}

      {/* Footer */}
      <div
        style={{
          padding: "20px",
          backgroundColor: "#f9f9f9",
          borderRadius: "8px",
          textAlign: "center",
          color: "#666",
          fontSize: "0.9em"
        }}
      >
        <p style={{ margin: "0 0 8px 0" }}>
          <strong>Desi Plaza Caterings</strong>
        </p>
        <p style={{ margin: "0" }}>
          Questions? Contact us at {agreement.email} or {agreement.mobile}
        </p>
      </div>
    </div>
  );
}

export default SignAgreement;
