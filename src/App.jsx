import { BrowserRouter, Routes, Route } from "react-router-dom";
import Navbar from "./components/Navbar";
import WorkflowTabs from "./components/WorkflowTabs";
import CompanyHeader from "./components/CompanyHeader";
import { EnquiryProvider } from "./context/EnquiryContext.jsx";

import Home from "./pages/Home";
import Menu from "./pages/Menu";
import Enquiry from "./pages/Enquiry";
import Quotation from "./pages/Quotation";
import ViewQuotations from "./pages/ViewQuotations";
import Confirm from "./pages/Confirm";
import Event from "./pages/Event";
import InstantOrder from "./pages/InstantOrder";
import InstantOrderDetails from "./pages/InstantOrderDetails";
import EnquiriesTable from "./pages/EnquiriesTable";
import ScheduledMeetings from "./pages/ScheduledMeetings";
import AdminDashboard from "./pages/AdminDashboard";
import Login from "./pages/Login";
import Register from "./pages/Register";

function App() {
  return (
    <EnquiryProvider>
      <BrowserRouter>
        <div style={{ padding: "0", fontFamily: "Arial, sans-serif", background: "#f5f5f5", color: "#222", marginLeft: "0" }}>
          <CompanyHeader />
          
          <Navbar />

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

            {/* Auth Pages */}
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />

            {/* 🚀 INSTANT ORDER / KOT MODE (NO WORKFLOW TABS) */}
            <Route path="/instantorder" element={<InstantOrder />} />
            <Route path="/instantorderdetails" element={<InstantOrderDetails />} />
          </Routes>
        </div>
      </BrowserRouter>
    </EnquiryProvider>
  );
}

export default App;
