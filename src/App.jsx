import { useEffect, useState } from "react";
import { BrowserRouter, Routes, Route } from "react-router-dom";
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
import PortalProfile from "./pages/portal/PortalProfile";
import PortalTimesheet from "./pages/portal/PortalTimesheet";
import PortalDocuments from "./pages/portal/PortalDocuments";
import PortalAnnouncements from "./pages/portal/PortalAnnouncements";
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
          <Route path="profile" element={<PortalProfile />} />
          <Route path="timesheet" element={<PortalTimesheet />} />
          <Route path="documents" element={<PortalDocuments />} />
          <Route path="announcements" element={<PortalAnnouncements />} />
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
              <div className="min-h-[60vh] flex items-center justify-center">
                <div className="text-center">
                  <p className="font-display text-8xl font-bold text-forest-200 mb-4">
                    404
                  </p>
                  <h1 className="font-display text-2xl font-bold text-forest-900 mb-2">
                    Page Not Found
                  </h1>
                  <p className="font-body text-sm text-forest-600 mb-6">
                    The page you're looking for doesn't exist.
                  </p>
                  <a href="/" className="btn-primary">
                    Back to Home
                  </a>
                </div>
              </div>
            }
          />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}
