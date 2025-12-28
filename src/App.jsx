import { BrowserRouter, Routes, Route } from "react-router-dom";
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
import Reports from "./pages/Reports";
import Login from "./pages/Login";
import Register from "./pages/Register";
import CustomerPage from "./pages/CustomerPage";

function App() {
  return (
    <EnquiryProvider>
      <BrowserRouter>
        <div style={{ padding: "0", fontFamily: "Arial, sans-serif", background: "#f5f5f5", color: "#222", marginLeft: "0", display: "flex", flexDirection: "column", minHeight: "100vh" }}>
          <CompanyHeader />
          
          <Navbar />

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
            <Route path="/register" element={<Register />} />

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
