import { useEffect, useState } from "react";
import { BrowserRouter, Routes, Route, Link, Navigate } from "react-router-dom";
import PreLoader from "./components/PreLoader";
import RootLayout from "./layout/RootLayout";
import PortalLayout from "./layout/PortalLayout";
import RequireAuth from "./components/RequireAuth";
import HomePage from "./pages/HomePage";
import AboutPage from "./pages/AboutPage";
import ServicesPage from "./pages/ServicesPage";
import IndustriesPage from "./pages/IndustriesPage";
import JobsPage from "./pages/JobsPage";
import EmployersPage from "./pages/EmployersPage";
import CandidatesPage from "./pages/CandidatesPage";
import ContactPage from "./pages/ContactPage";
import SubmitResumePage from "./pages/SubmitResumePage";
import ApplyNowPage from "./pages/ApplyNowPage";
import MeetOurStaffPage from "./pages/MeetOurStaffPage";
import LoginPage from "./pages/auth/LoginPage";
import SignupPage from "./pages/auth/SignupPage";
import ForgotPasswordPage from "./pages/auth/ForgotPasswordPage";
import PortalOverview from "./pages/portal/PortalOverview";
import PortalMissions from "./pages/portal/PortalMissions";
import PortalActivity from "./pages/portal/PortalActivity";
import PortalPay from "./pages/portal/PortalPay";
import PortalTaxForms from "./pages/portal/PortalTaxForms";
import PortalTimesheet from "./pages/portal/PortalTimesheet";
import PortalTimeOff from "./pages/portal/PortalTimeOff";
import PortalBenefits from "./pages/portal/PortalBenefits";
import PortalServices from "./pages/portal/PortalServices";
import PortalEquipment from "./pages/portal/PortalEquipment";
import PortalSetup from "./pages/portal/PortalSetup";
import PortalIdentity from "./pages/portal/PortalIdentity";
import PortalDocuments from "./pages/portal/PortalDocuments";
import PortalProfile from "./pages/portal/PortalProfile";
import PortalHelp from "./pages/portal/PortalHelp";
import { seedDemoAccount } from "./lib/auth";

export default function App() {
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    seedDemoAccount();
  }, []);

  return (
    <BrowserRouter>
      {loading && <PreLoader onFinish={() => setLoading(false)} />}
      <Routes>
        <Route path="/login" element={<LoginPage />} />
        <Route path="/signup" element={<SignupPage />} />
        <Route path="/forgot-password" element={<ForgotPasswordPage />} />

        <Route
          path="/portal"
          element={
            <RequireAuth>
              <PortalLayout />
            </RequireAuth>
          }
        >
          <Route index element={<PortalOverview />} />
          <Route path="missions" element={<PortalMissions />} />
          <Route path="activity" element={<PortalActivity />} />
          <Route path="pay" element={<PortalPay />} />
          <Route path="tax-forms" element={<PortalTaxForms />} />
          <Route path="timesheet" element={<PortalTimesheet />} />
          <Route path="time-off" element={<PortalTimeOff />} />
          <Route path="benefits" element={<PortalBenefits />} />
          <Route path="services" element={<PortalServices />} />
          <Route path="equipment" element={<PortalEquipment />} />
          <Route path="setup" element={<PortalSetup />} />
          <Route path="identity" element={<PortalIdentity />} />
          <Route path="documents" element={<PortalDocuments />} />
          <Route path="profile" element={<PortalProfile />} />
          <Route path="help" element={<PortalHelp />} />
          <Route path="announcements" element={<Navigate to="/portal" replace />} />
          <Route path="*" element={<Navigate to="/portal" replace />} />
        </Route>

        <Route element={<RootLayout />}>
          <Route index element={<HomePage />} />
          <Route path="about" element={<AboutPage />} />
          <Route path="services" element={<ServicesPage />} />
          <Route path="industries" element={<IndustriesPage />} />
          <Route path="jobs" element={<JobsPage />} />
          <Route path="employers" element={<EmployersPage />} />
          <Route path="candidates" element={<CandidatesPage />} />
          <Route path="contact" element={<ContactPage />} />
          <Route path="submit-resume" element={<SubmitResumePage />} />
          <Route path="apply" element={<ApplyNowPage />} />
          <Route path="staff" element={<MeetOurStaffPage />} />

          <Route
            path="*"
            element={
              <section className="on-dark grain relative flex min-h-[80vh] items-end bg-ink-950 pb-20 pt-40">
                <div className="container-main relative">
                  <p className="eyebrow mb-6">Error 404</p>
                  <h1 className="display-xl text-cream-50">Page <em className="text-brass-300">not found.</em></h1>
                  <p className="lede mb-10 mt-8 text-cream-100/70">The page you're looking for doesn't exist.</p>
                  <Link to="/" className="btn-light">Back to Home</Link>
                </div>
              </section>
            }
          />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}
