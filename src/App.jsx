import { BrowserRouter, Routes, Route } from "react-router-dom";
import { useEffect, useState } from "react";
import setupAxiosInterceptors from "./utils/axiosSetup";
import { setupStorageListener } from "./utils/authUtils";
import Navbar from "./components/Navbar";
import BreadcrumbNav from "./components/BreadcrumbNav";
import WorkflowTabs from "./components/WorkflowTabs";
import CompanyHeader from "./components/CompanyHeader";
import Footer from "./components/Footer";
import { EnquiryProvider } from "./context/EnquiryContext.jsx";

import Home from "./pages/Home";
import Menu from "./pages/Menu";
import Enquiry from "./pages/Enquiry";
import Quotation from "./pages/Quotation";
import CreateEvent from "./pages/CreateEvent";
import ViewQuotations from "./pages/ViewQuotations";
import Confirm from "./pages/Confirm";
import Event from "./pages/Event";
import Payments from "./pages/Payments";
import InstantOrder from "./pages/InstantOrder";
import InstantOrderDetails from "./pages/InstantOrderDetails";
import InstantOrdersTable from "./pages/InstantOrdersTable";
import EnquiriesTable from "./pages/EnquiriesTable";
import ScheduledMeetings from "./pages/ScheduledMeetings";
import AdminDashboard from "./pages/AdminDashboard";
import StaffPermissions from "./pages/StaffPermissions";
import Reports from "./pages/Reports";
import Login from "./pages/Login";
import CustomerPage from "./pages/CustomerPage";
import SignAgreement from "./pages/SignAgreement";
import APITest from "./pages/APITest";
import SpecialItems from "./pages/SpecialItems";

function App() {
  const [authValidated, setAuthValidated] = useState(false);

  // Validate stored token on app startup
  useEffect(() => {
    const validateAuth = async () => {
      try {
        console.log('Starting auth validation...');
        
        const token = localStorage.getItem('token');
        
        if (!token) {
          console.log('No token stored, user must login');
          setAuthValidated(true);
          return;
        }

        // Token exists, verify it's still valid with the server
        try {
          const controller = new AbortController();
          const timeout = setTimeout(() => controller.abort(), 3000);
          
          const response = await fetch(
            `${import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000'}/api/auth/me`,
            {
              method: 'GET',
              headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json'
              },
              signal: controller.signal
            }
          );
          
          clearTimeout(timeout);
          
          if (!response.ok) {
            console.log('Token invalid on server, clearing...');
            localStorage.removeItem('token');
            localStorage.removeItem('user');
          } else {
            console.log('Token verified with server');
          }
        } catch (error) {
          console.log('Token verification error:', error.message);
          localStorage.removeItem('token');
          localStorage.removeItem('user');
        }
      } catch (error) {
        console.error('Auth validation error:', error);
      } finally {
        setupAxiosInterceptors();
        setAuthValidated(true);
      }
    };

    validateAuth();

    // Setup listener for logout in other tabs
    const removeStorageListener = setupStorageListener(() => {
      console.log('Logout detected in another tab, reloading...');
      window.location.reload();
    });

    // Cleanup listener on unmount
    return () => {
      removeStorageListener();
    };
  }, []);

  // Show loading while validating auth
  if (!authValidated) {
    return (
      <div style={{ 
        display: 'flex', 
        justifyContent: 'center', 
        alignItems: 'center', 
        minHeight: '100vh',
        backgroundColor: '#f5f5f5',
        fontSize: '18px',
        color: '#666'
      }}>
        <div style={{ textAlign: 'center' }}>
          <h2>Initializing...</h2>
        </div>
      </div>
    );
  }

  return (
    <EnquiryProvider>
      <BrowserRouter>
        <div style={{ padding: "0", fontFamily: "Arial, sans-serif", background: "#f5f5f5", color: "#222", marginLeft: "0", display: "flex", flexDirection: "column", minHeight: "100vh" }}>
          
          <Navbar />

          <CompanyHeader />

          <BreadcrumbNav />

          <main style={{ flex: 1 }}>
            <Routes>
            {/* Regular website / workflow */}
            <Route
              path="/"
              element={
                <>
                  <WorkflowTabs />
                  <Home />
                </>
              }
            />
            <Route
              path="/enquiry"
              element={
                <>
                  <WorkflowTabs />
                  <Enquiry />
                </>
              }
            />
            <Route
              path="/menu"
              element={
                <>
                  <WorkflowTabs />
                  <Menu />
                </>
              }
            />
            <Route
              path="/quotation"
              element={
                <>
                  <WorkflowTabs />
                  <Quotation />
                </>
              }
            />
            <Route
              path="/create-event"
              element={
                <>
                  <WorkflowTabs />
                  <CreateEvent />
                </>
              }
            />
            <Route
              path="/quotations"
              element={
                <>
                  <WorkflowTabs />
                  <ViewQuotations />
                </>
              }
            />
            <Route
              path="/confirm"
              element={
                <>
                  <WorkflowTabs />
                  <Confirm />
                </>
              }
            />
            <Route
              path="/event"
              element={
                <>
                  <WorkflowTabs />
                  <Event />
                </>
              }
            />
            <Route
              path="/payments"
              element={
                <>
                  <WorkflowTabs />
                  <Payments />
                </>
              }
            />

            <Route
              path="/scheduled-meetings"
              element={
                <>
                  <WorkflowTabs />
                  <ScheduledMeetings />
                </>
              }
            />
            <Route
              path="/enquiries"
              element={
                <>
                  <WorkflowTabs />
                  <EnquiriesTable />
                </>
              }
            />

            {/* Admin Dashboard */}
            <Route path="/admin" element={<AdminDashboard />} />

            {/* Staff Permissions */}
            <Route path="/staff-permissions" element={<StaffPermissions />} />

            {/* Reports */}
            <Route
              path="/reports"
              element={
                <>
                  <WorkflowTabs />
                  <Reports />
                </>
              }
            />

            {/* Auth Pages */}
            <Route path="/login" element={<Login />} />
            
            {/* API Diagnostic Test */}
            <Route path="/api-test" element={<APITest />} />

            {/* Special Items Showcase */}
            <Route path="/special-items" element={<SpecialItems />} />

            {/* Agreement Signing - Public Route */}
            <Route path="/sign-agreement/:shareToken" element={<SignAgreement />} />

            {/* Customer Page */}
            <Route path="/customer" element={<CustomerPage />} />

            {/* 🚀 INSTANT ORDER / KOT MODE */}
            <Route 
              path="/instantorder" 
              element={
                <>
                  <WorkflowTabs />
                  <InstantOrder />
                </>
              } 
            />
            <Route path="/instantorderdetails" element={<InstantOrderDetails />} />
            <Route
              path="/instantorders"
              element={
                <>
                  <WorkflowTabs />
                  <InstantOrdersTable />
                </>
              }
            />
            </Routes>
          </main>

          <Footer />
        </div>
      </BrowserRouter>
    </EnquiryProvider>
  );
}

export default App;
