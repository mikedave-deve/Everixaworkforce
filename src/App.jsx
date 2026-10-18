import { lazy, Suspense, useEffect, useState } from "react";
import { BrowserRouter, Routes, Route, Link, Navigate, useNavigate } from "react-router-dom";
import PreLoader from "./components/PreLoader";
import RootLayout from "./layout/RootLayout";
import RequireAuth from "./components/RequireAuth";
import RouteSeo from "./components/RouteSeo";
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

// Private areas load on demand so the public marketing pages ship a much smaller bundle.
const PortalLayout = lazy(() => import("./layout/PortalLayout"));
const AdminLayout = lazy(() => import("./layout/AdminLayout"));
const LoginPage = lazy(() => import("./pages/auth/LoginPage"));
const SignupPage = lazy(() => import("./pages/auth/SignupPage"));
const ForgotPasswordPage = lazy(() => import("./pages/auth/ForgotPasswordPage"));
const ResetPasswordPage = lazy(() => import("./pages/auth/ResetPasswordPage"));
const PortalOverview = lazy(() => import("./pages/portal/PortalOverview"));
const PortalMissions = lazy(() => import("./pages/portal/PortalMissions"));
const PortalActivity = lazy(() => import("./pages/portal/PortalActivity"));
const PortalPay = lazy(() => import("./pages/portal/PortalPay"));
const PortalTaxForms = lazy(() => import("./pages/portal/PortalTaxForms"));
const PortalTimesheet = lazy(() => import("./pages/portal/PortalTimesheet"));
const PortalTimeOff = lazy(() => import("./pages/portal/PortalTimeOff"));
const PortalBenefits = lazy(() => import("./pages/portal/PortalBenefits"));
const PortalServices = lazy(() => import("./pages/portal/PortalServices"));
const PortalEquipment = lazy(() => import("./pages/portal/PortalEquipment"));
const PortalSetup = lazy(() => import("./pages/portal/PortalSetup"));
const PortalIdentity = lazy(() => import("./pages/portal/PortalIdentity"));
const PortalDocuments = lazy(() => import("./pages/portal/PortalDocuments"));
const PortalProfile = lazy(() => import("./pages/portal/PortalProfile"));
const PortalHelp = lazy(() => import("./pages/portal/PortalHelp"));
const AdminOverview = lazy(() => import("./pages/admin/AdminOverview"));
const AdminApprovals = lazy(() => import("./pages/admin/AdminApprovals"));
const AdminEmployees = lazy(() => import("./pages/admin/AdminEmployees"));
const AdminMissions = lazy(() => import("./pages/admin/AdminMissions"));
const AdminPay = lazy(() => import("./pages/admin/AdminPay"));
const AdminTax = lazy(() => import("./pages/admin/AdminTax"));
const AdminShipments = lazy(() => import("./pages/admin/AdminShipments"));
const AdminDocuments = lazy(() => import("./pages/admin/AdminDocuments"));
const AdminInbox = lazy(() => import("./pages/admin/AdminInbox"));

/** Sends the user to the login page whenever the API reports their session has ended. */
function SessionWatcher() {
  const navigate = useNavigate();
  useEffect(() => {
    const onOut = () => navigate("/login", { replace: true });
    window.addEventListener("everixa:signed-out", onOut);
    return () => window.removeEventListener("everixa:signed-out", onOut);
  }, [navigate]);
  return null;
}

export default function App() {
  const [loading, setLoading] = useState(true);

  return (
    <BrowserRouter>
      <SessionWatcher />
      <RouteSeo />
      {loading && <PreLoader onFinish={() => setLoading(false)} />}
      <Suspense fallback={null}>
      <Routes>
        <Route path="/login" element={<LoginPage />} />
        <Route path="/signup" element={<SignupPage />} />
        <Route path="/forgot-password" element={<ForgotPasswordPage />} />
        <Route path="/reset-password" element={<ResetPasswordPage />} />

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

        <Route
          path="/admin"
          element={
            <RequireAuth role="admin">
              <AdminLayout />
            </RequireAuth>
          }
        >
          <Route index element={<AdminOverview />} />
          <Route path="approvals" element={<AdminApprovals />} />
          <Route path="employees" element={<AdminEmployees />} />
          <Route path="missions" element={<AdminMissions />} />
          <Route path="pay" element={<AdminPay />} />
          <Route path="tax" element={<AdminTax />} />
          <Route path="shipments" element={<AdminShipments />} />
          <Route path="documents" element={<AdminDocuments />} />
          <Route path="inbox" element={<AdminInbox />} />
          <Route path="*" element={<Navigate to="/admin" replace />} />
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
      </Suspense>
    </BrowserRouter>
  );
}
