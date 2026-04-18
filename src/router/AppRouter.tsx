import { Route, Routes as Router, BrowserRouter } from "react-router-dom";
import { ROUTES } from "./routes";
import { useAppStore } from "@/stores/useAppStore";
import ProtectedRoute from "@/router/ProtectedRoute";
import { ScrollToTop } from "@/shared/navigation/ScrollToTop";

// Layouts
import AuthLayout from "@/layout/AuthLayout";
import DashboardLayout from "@/layout/DashboardLayout";
import DarkLayout from "@/layout/DarkLayout";

// Auth Pages
import Login from "@/features/auth/pages/LoginPage";
import ForgotPasswordPage from "@/features/auth/pages/passwordFlow/ForgotPasswordPage";
import VerifyEmailPage from "@/features/auth/pages/passwordFlow/VerifyEmailPage";
import ResetPasswordPage from "@/features/auth/pages/passwordFlow/ResetPasswordPage";
import PasswordSuccessPage from "@/features/auth/pages/PasswordSuccessPage";

// Onboarding Pages
import Register from "@/features/onboarding/pages/RegisterPage";
import RegEmailVerificationPage from "@/features/onboarding/pages/RegEmailVerificationPage";
import OtpVerificationPage from "@/features/onboarding/pages/OtpVerificationPage";
import PatientBasicInfoPage from "@/features/onboarding/pages/patientOnboarding/PatientBasicInfoPage";
import PatientProfilePhotoPage from "@/features/onboarding/pages/patientOnboarding/PatientProfilePhotoPage";
import SetCredentialsPage from "@/features/onboarding/pages/SetCredentialsPage";
import DoctorOnboardingPage from "@/features/onboarding/pages/DoctorOnboardingPage";
import CenterOnboardingPage from "@/features/onboarding/pages/CenterOnboardingPage";
import RegisterSuccessPage from "@/features/onboarding/pages/RegisterSuccessPage";

// Dashboard Pages
import PatientDashboard from "@/features/patient/pages/DashboardPage";
import DoctorDashboard from "@/features/doctor/pages/DashboardPage";
import CenterDashboard from "@/features/center/pages/DashboardPage";

// Profile Pages
import PatientProfilePage from "@/features/patient/pages/PatientProfilePage";
import DoctorProfilePage from "@/features/doctor/pages/DoctorProfilePage";
import CenterProfilePage from "@/features/center/pages/CenterProfilePage";

// Patient-specific Pages
import MyAppointmentsPage from "@/features/patient/pages/MyAppointmentsPage";
import MyDoctorsPage from "@/features/patient/pages/MyDoctorsPage";
import ScheduleAppointment from "@/features/patient/pages/ScheduleAppointment";

// Doctor-specific Pages
import AppointmentsPage from "@/features/doctor/pages/AppointmentsPage";
import MyServicesPage from "@/features/doctor/pages/MyServicesPage";
import CreateServicesPage from "@/features/doctor/pages/CreateServicesPage";
import MyPatientsPage from "@/features/doctor/pages/PatientsPage";
import AppointmentConsultation from "@/features/doctor/pages/AppointmentConsultation";
import PatientDetailsPage from "@/features/doctor/pages/PatientDetailsPage";

// Center-specific Pages
import StaffPage from "@/features/center/pages/StaffPage";

// Common Shared Pages
import Search from "@/features/search/pages/Search";
import { CalendarPage } from "@/features/calendar/pages/CalendarPage";
import ChatPage from "@/features/chat/pages/ChatPage";
import ServicesPage from "@/features/doctor/pages/ServicesPage";
import RequestPage from "@/features/request/pages/RequestPage";
import VerifyInfo from "@/features/verifyInfo/pages/VerifyInfo";

// Teleconsultation Pages
import TeleconsultConfirmPage from "@/features/teleconsultation/pages/TeleconsultConfirmPage";
import TeleconsultRoomPage from "@/features/teleconsultation/pages/TeleconsultRoomPage";
import ErrorBoundary from "@/shared/components/ErrorBoundary";

// Settings Pages
import AccountOverviewPage from "@/features/account/settings/pages/AccountOverviewPage";
import ChangeEmailPage from "@/features/account/settings/pages/ChangeEmailPage";
import VerifyNewEmailPage from "@/features/account/settings/pages/VerifyNewEmailPage";
import ChangePasswordPage from "@/features/account/settings/pages/ChangePasswordPage";
import DeleteAccountPage from "@/features/account/settings/pages/DeleteAccountPage";
import VerifyIdentityPage from "@/features/account/settings/pages/VerifyIdentityPage";

// Privacy Pages
import PrivacyOverviewPage from "@/features/account/privacy/pages/PrivacyOverviewPage";
import ProfileVisibilityPage from "@/features/account/privacy/pages/ProfileVisibilityPage";
import BlockedUsersPage from "@/features/account/privacy/pages/BlockedUsersPage";
import MessagesPrivacyPage from "@/features/account/privacy/pages/MessagesPrivacyPage";

//Landing page
import LandingPage from "@/features/landing/pages/LandingPage";
function AppRouter() {
  const userRole = useAppStore((state) => state.user?.rol);
  return (
    <BrowserRouter>
      <ScrollToTop />
      <Router>
        {/* Landing Page as Initial Route */}
        <Route path={"/"} index element={<LandingPage />} />
        {/* Public Routes */}
        <Route path={ROUTES.LOGIN} element={<Login />} />

        {/* Auth Layout Routes */}
        <Route element={<AuthLayout />}>
          {/* Registration Flow */}
          <Route path={ROUTES.REGISTER} element={<Register />} />
          <Route
            path={ROUTES.REG_EMAIL_VERIFICATION}
            element={<RegEmailVerificationPage />}
          />
          <Route
            path={ROUTES.OTP_VERIFICATION}
            element={<OtpVerificationPage />}
          />

          {/* Patient Onboarding */}
          <Route
            path={ROUTES.PATIENT_BASIC_INFO}
            element={<PatientBasicInfoPage />}
          />
          <Route
            path={ROUTES.PATIENT_PROFILE_PHOTO}
            element={<PatientProfilePhotoPage />}
          />
          <Route
            path={ROUTES.PATIENT_PASSWORD}
            element={<SetCredentialsPage />}
          />

          {/* Doctor Onboarding */}
          <Route
            path={ROUTES.DOCTOR_ONBOARDING}
            element={<DoctorOnboardingPage />}
          />
          <Route
            path={ROUTES.DOCTOR_PASSWORD}
            element={<SetCredentialsPage />}
          />

          {/* Center Onboarding */}
          <Route
            path={ROUTES.CENTER_ONBOARDING}
            element={<CenterOnboardingPage />}
          />
          <Route
            path={ROUTES.CENTER_PASSWORD}
            element={<SetCredentialsPage />}
          />

          <Route
            path={ROUTES.REGISTER_SUCCESS}
            element={<RegisterSuccessPage />}
          />

          {/* Password Recovery Flow */}
          <Route
            path={ROUTES.FORGOT_PASSWORD}
            element={<ForgotPasswordPage />}
          />
          <Route path={ROUTES.VERIFY_EMAIL} element={<VerifyEmailPage />} />
          <Route path={ROUTES.RESET_PASSWORD} element={<ResetPasswordPage />} />
          <Route
            path={ROUTES.PASSWORD_SUCCESS}
            element={<PasswordSuccessPage />}
          />
        </Route>

        {/* Protected Dashboard Routes */}
        <Route element={<DarkLayout />}>
          <Route element={<DashboardLayout />}>
            {/* Role-based Dashboards */}
            {userRole === "PATIENT" && (
              <Route
                path={ROUTES.COMMON.DASHBOARD}
                element={<PatientDashboard />}
              />
            )}
            {userRole === "DOCTOR" && (
              <Route
                path={ROUTES.COMMON.DASHBOARD}
                element={<DoctorDashboard />}
              />
            )}
            {userRole === "CENTER" && (
              <Route
                path={ROUTES.COMMON.DASHBOARD}
                element={<CenterDashboard />}
              />
            )}

            {/* Common Routes (All Authenticated Users) */}
            <Route
              path={ROUTES.COMMON.GLOBAL_SEARCH}
              element={
                <ProtectedRoute doctor patient center>
                  <Search />
                </ProtectedRoute>
              }
            />

            <Route
              path={ROUTES.COMMON.CHAT}
              element={
                <ProtectedRoute doctor patient center>
                  <ChatPage />
                </ProtectedRoute>
              }
            />
            <Route
              path={ROUTES.COMMON.CHAT_WITH}
              element={
                <ProtectedRoute doctor patient center>
                  <ChatPage />
                </ProtectedRoute>
              }
            />
            <Route path={ROUTES.COMMON.SERVICE} element={<ServicesPage />} />

            {/* Common Routes (Doctor & Patient Only) */}
            <Route
              path={ROUTES.COMMON.CALENDAR}
              element={
                <ProtectedRoute doctor patient>
                  <CalendarPage />
                </ProtectedRoute>
              }
            />

            {/* Profile Routes */}
            <Route
              path={ROUTES.PATIENT.PATIENT_PROFILE_PRIVATE}
              element={
                <ProtectedRoute doctor patient center>
                  <PatientProfilePage />
                </ProtectedRoute>
              }
            />
            <Route
              path={ROUTES.PATIENT.PATIENT_PROFILE_PUBLIC}
              element={
                <ProtectedRoute doctor patient center>
                  <PatientProfilePage />
                </ProtectedRoute>
              }
            />
            <Route
              path={ROUTES.DOCTOR.DOCTOR_PROFILE_PUBLIC}
              element={
                <ProtectedRoute doctor patient center>
                  <DoctorProfilePage />
                </ProtectedRoute>
              }
            />
            <Route
              path={ROUTES.DOCTOR.DOCTOR_PROFILE_PRIVATE}
              element={
                <ProtectedRoute doctor patient center>
                  <DoctorProfilePage />
                </ProtectedRoute>
              }
            />
            <Route
              path={ROUTES.CENTER.CENTER_PROFILE_PUBLIC}
              element={
                <ProtectedRoute doctor patient center>
                  <CenterProfilePage />
                </ProtectedRoute>
              }
            />
            <Route
              path={ROUTES.CENTER.CENTER_PROFILE_PRIVATE}
              element={
                <ProtectedRoute doctor patient center>
                  <CenterProfilePage />
                </ProtectedRoute>
              }
            />

            {/* Patient-Only Routes */}
            <Route
              path={ROUTES.PATIENT.APPOINTMENTS}
              element={
                <ProtectedRoute patient>
                  <MyAppointmentsPage />
                </ProtectedRoute>
              }
            />
            <Route
              path={ROUTES.PATIENT.MY_DOCTORS}
              element={
                <ProtectedRoute patient>
                  <MyDoctorsPage />
                </ProtectedRoute>
              }
            />
            <Route
              path={ROUTES.PATIENT.SCHEDULE_APPOINTMENT}
              element={
                <ProtectedRoute patient>
                  <ScheduleAppointment />
                </ProtectedRoute>
              }
            />

            {/* Doctor-Only Routes */}
            <Route
              path={ROUTES.DOCTOR.APPOINTMENTS}
              element={
                <ProtectedRoute doctor>
                  <AppointmentsPage />
                </ProtectedRoute>
              }
            />
            <Route
              path={ROUTES.DOCTOR.SERVICES}
              element={
                <ProtectedRoute doctor>
                  <MyServicesPage />
                </ProtectedRoute>
              }
            />
            <Route
              path={ROUTES.DOCTOR.CREATE_SERVICE}
              element={
                <ProtectedRoute doctor>
                  <CreateServicesPage />
                </ProtectedRoute>
              }
            />
            <Route
              path={ROUTES.DOCTOR.EDIT_SERVICE}
              element={
                <ProtectedRoute doctor>
                  <CreateServicesPage />
                </ProtectedRoute>
              }
            />
            <Route
              path={ROUTES.DOCTOR.PATIENTS}
              element={
                <ProtectedRoute doctor>
                  <MyPatientsPage />
                </ProtectedRoute>
              }
            />
            <Route
              path={ROUTES.DOCTOR.CONSULTATION}
              element={
                <ProtectedRoute doctor>
                  <AppointmentConsultation />
                </ProtectedRoute>
              }
            />
            <Route
              path={ROUTES.DOCTOR.PATIENT_DETAILS}
              element={
                <ProtectedRoute doctor>
                  <PatientDetailsPage />
                </ProtectedRoute>
              }
            />

            {/* Center-Only Routes */}
            <Route
              path={ROUTES.CENTER.DOCTORS}
              element={
                <ProtectedRoute center>
                  <StaffPage />
                </ProtectedRoute>
              }
            />

            {/* Doctor & Center Routes */}
            <Route
              path={ROUTES.VERIFY_INFO.VERIFY_INFO}
              element={
                <ProtectedRoute doctor center>
                  <VerifyInfo />
                </ProtectedRoute>
              }
            />
            <Route
              path={ROUTES.COMMON.REQUESTS}
              element={
                <ProtectedRoute doctor center>
                  <RequestPage />
                </ProtectedRoute>
              }
            />

            {/* Teleconsultation Routes */}
            <Route
              path={ROUTES.TELECONSULT.CONFIRM}
              element={<TeleconsultConfirmPage />}
            />
            <Route
              path={ROUTES.TELECONSULT.ROOM}
              element={
                <ErrorBoundary>
                  <TeleconsultRoomPage />
                </ErrorBoundary>
              }
            />

            {/* Settings Routes */}
            <Route
              path={ROUTES.SETTINGS.ROOT}
              element={<AccountOverviewPage />}
            />
            <Route
              path={ROUTES.SETTINGS.VERIFY_IDENTITY}
              element={<VerifyIdentityPage />}
            />
            <Route
              path={ROUTES.SETTINGS.EMAIL.CHANGE}
              element={<ChangeEmailPage />}
            />
            <Route
              path={ROUTES.SETTINGS.EMAIL.VERIFY}
              element={<VerifyNewEmailPage />}
            />
            <Route
              path={ROUTES.SETTINGS.PASSWORD.CHANGE}
              element={<ChangePasswordPage />}
            />
            <Route
              path={ROUTES.SETTINGS.DELETE_ACCOUNT}
              element={<DeleteAccountPage />}
            />

            {/* Privacy Routes */}
            <Route
              path={ROUTES.PRIVACY.ROOT}
              element={<PrivacyOverviewPage />}
            />
            <Route
              path={ROUTES.PRIVACY.PROFILE_VISIBILITY}
              element={<ProfileVisibilityPage />}
            />
            <Route
              path={ROUTES.PRIVACY.MESSAGES}
              element={<MessagesPrivacyPage />}
            />
            <Route
              path={ROUTES.PRIVACY.BLOCKED_USERS}
              element={<BlockedUsersPage />}
            />
          </Route>
        </Route>
      </Router>
    </BrowserRouter>
  );
}

export default AppRouter;
