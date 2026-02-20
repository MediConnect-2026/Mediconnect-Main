import { Route, Routes as Router, BrowserRouter } from "react-router-dom";
import { ROUTES } from "./routes";
import AuthLayout from "@/layout/AuthLayout";
import DashboardLayout from "@/layout/DashboardLayout";
import Login from "@/features/auth/pages/LoginPage";
import ForgotPasswordPage from "@/features/auth/pages/passwordFlow/ForgotPasswordPage";
import VerifyEmailPage from "@/features/auth/pages/passwordFlow/VerifyEmailPage";
import ResetPasswordPage from "@/features/auth/pages/passwordFlow/ResetPasswordPage";
import PasswordSuccessPage from "@/features/auth/pages/PasswordSuccessPage";
import Register from "@/features/onboarding/pages/RegisterPage";
import DarkLayout from "@/layout/DarkLayout";
import RegEmailVerificationPage from "@/features/onboarding/pages/RegEmailVerificationPage";
import OtpVerificationPage from "@/features/onboarding/pages/OtpVerificationPage";
import PatientBasicInfoPage from "@/features/onboarding/pages/patientOnboarding/PatientBasicInfoPage";
import PatientProfilePhotoPage from "@/features/onboarding/pages/patientOnboarding/PatientProfilePhotoPage";
import SetCredentialsPage from "@/features/onboarding/pages/SetCredentialsPage";
import DoctorOnboardingPage from "@/features/onboarding/pages/DoctorOnboardingPage";
import CenterOnboardingPage from "@/features/onboarding/pages/CenterOnboardingPage";
import RegisterSuccessPage from "@/features/onboarding/pages/RegisterSuccessPage";
import { ScrollToTop } from "@/shared/navigation/ScrollToTop";
import PatientDashboard from "@/features/patient/pages/DashboardPage";
import DoctorDashboard from "@/features/doctor/pages/DashboardPage";
import CenterDashboard from "@/features/center/pages/DashboardPage";
import DoctorProfilePage from "@/features/doctor/pages/DoctorProfilePage";
import PatientProfilePage from "@/features/patient/pages/PatientProfilePage";
import Search from "@/features/search/pages/Search";
import ScheduleAppointment from "@/features/patient/pages/ScheduleAppointment";
import TeleconsultConfirmPage from "@/features/teleconsultation/pages/TeleconsultConfirmPage";
import TeleconsultRoomPage from "@/features/teleconsultation/pages/TeleconsultRoomPage";
import ChatPage from "@/features/chat/pages/ChatPage";
import ServicesPage from "@/features/doctor/pages/ServicesPage";
//Settings and Privacy Pages Imports
import AccountOverviewPage from "@/features/account/settings/pages/AccountOverviewPage";
import ChangeEmailPage from "@/features/account/settings/pages/ChangeEmailPage";
import VerifyNewEmailPage from "@/features/account/settings/pages/VerifyNewEmailPage";
import ChangePasswordPage from "@/features/account/settings/pages/ChangePasswordPage";
import DeleteAccountPage from "@/features/account/settings/pages/DeleteAccountPage";
import VerifyIdentityPage from "@/features/account/settings/pages/VerifyIdentityPage";
import PrivacyOverviewPage from "@/features/account/privacy/pages/PrivacyOverviewPage";
import ProfileVisibilityPage from "@/features/account/privacy/pages/ProfileVisibilityPage";
import BlockedUsersPage from "@/features/account/privacy/pages/BlockedUsersPage";
import MessagesPrivacyPage from "@/features/account/privacy/pages/MessagesPrivacyPage";
import MyAppointmentsPage from "@/features/patient/pages/MyAppointmentsPage";
import MyDoctorsPage from "@/features/patient/pages/MyDoctorsPage";
import { CalendarPage } from "@/features/calendar/pages/CalendarPage";
import MyServicesPage from "@/features/doctor/pages/MyServicesPage";
import MyPatientsPage from "@/features/doctor/pages/PatientsPage";
import AppointmentsPage from "@/features/doctor/pages/AppointmentsPage";
import { useAppStore } from "@/stores/useAppStore";
import VerifyInfo from "@/features/verifyInfo/pages/VerifyInfo";
import ProtectedRoute from "@/router/ProtectedRoute";
import CreateServicesPage from "@/features/doctor/pages/CreateServicesPage";
import RequestPage from "@/features/request/pages/RequestPage";
import AppointmentConsultation from "@/features/doctor/pages/AppointmentConsultation";
import PatientDetailsPage from "@/features/doctor/pages/PatientDetailsPage";
function AppRouter() {
  const userRole = useAppStore((state) => state.user?.role);
  return (
    <BrowserRouter>
      {" "}
      <ScrollToTop />
      <Router>
        <Route path={ROUTES.LOGIN} index element={<Login />} />
        <Route element={<AuthLayout />}>
          {/* Register Flow */}
          <Route path={ROUTES.REGISTER} element={<Register />} />
          <Route
            path={ROUTES.REG_EMAIL_VERIFICATION}
            element={<RegEmailVerificationPage />}
          />
          <Route
            path={ROUTES.OTP_VERIFICATION}
            element={<OtpVerificationPage />}
          />
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
          <Route
            path={ROUTES.DOCTOR_ONBOARDING}
            element={<DoctorOnboardingPage />}
          />
          <Route
            path={ROUTES.DOCTOR_PASSWORD}
            element={<SetCredentialsPage />}
          />
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
          {/* Password flow */}
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
        <Route element={<DarkLayout />}>
          <Route element={<DashboardLayout />}>
            {/* Conditional Dashboard Route */}
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
            <Route
              path={ROUTES.PATIENT.PATIENT_PROFILE_PRIVATE}
              element={<PatientProfilePage />}
            />
            <Route
              path={ROUTES.PATIENT.PATIENT_PROFILE_PUBLIC}
              element={<PatientProfilePage />}
            />
            <Route path={ROUTES.COMMON.GLOBAL_SEARCH} element={<Search />} />
            <Route
              path={ROUTES.PATIENT.SCHEDULE_APPOINTMENT}
              element={<ScheduleAppointment />}
            />
            {/* SETTINGS */}
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
              path={ROUTES.SETTINGS.EMAIL.VERIFY}
              element={<VerifyIdentityPage />}
            />
            <Route
              path={ROUTES.SETTINGS.PASSWORD.CHANGE}
              element={<ChangePasswordPage />}
            />
            <Route
              path={ROUTES.SETTINGS.DELETE_ACCOUNT}
              element={<DeleteAccountPage />}
            />
            <Route
              path={ROUTES.PATIENT.APPOINTMENTS}
              element={<MyAppointmentsPage />}
            />
            {/* PRIVACY */}
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
            <Route
              path={ROUTES.TELECONSULT.CONFIRM}
              element={<TeleconsultConfirmPage />}
            />
            <Route
              path={ROUTES.TELECONSULT.ROOM}
              element={<TeleconsultRoomPage />}
            />
            <Route
              path={ROUTES.PATIENT.MY_DOCTORS}
              element={<MyDoctorsPage />}
            />
            <Route path={ROUTES.COMMON.CALENDAR} element={<CalendarPage />} />
            <Route
              path={ROUTES.DOCTOR.DOCTOR_PROFILE_PUBLIC}
              element={<DoctorProfilePage />}
            />
            <Route
              path={ROUTES.DOCTOR.DOCTOR_PROFILE_PRIVATE}
              element={<DoctorProfilePage />}
            />
            <Route
              path={ROUTES.DOCTOR.APPOINTMENTS}
              element={<AppointmentsPage />}
            />
            <Route
              path={ROUTES.VERIFY_INFO.VERIFY_INFO}
              element={
                <ProtectedRoute doctor center>
                  {" "}
                  <VerifyInfo />{" "}
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
            />{" "}
            <Route
              path={ROUTES.DOCTOR.PATIENT_DETAILS}
              element={
                <ProtectedRoute doctor>
                  <PatientDetailsPage />
                </ProtectedRoute>
              }
            />
            PatientDetailsPage
            <Route path={ROUTES.DOCTOR.SERVICES} element={<MyServicesPage />} />
            <Route path={ROUTES.DOCTOR.PATIENTS} element={<MyPatientsPage />} />
            <Route path={ROUTES.COMMON.CHAT} element={<ChatPage />} />
            <Route path={ROUTES.COMMON.CHAT_WITH} element={<ChatPage />} />
            <Route path={ROUTES.COMMON.SERVICE} element={<ServicesPage />} />
            <Route
              path={ROUTES.DOCTOR.CONSULTATION}
              element={<AppointmentConsultation></AppointmentConsultation>}
            ></Route>
            <Route
              path={ROUTES.DOCTOR.CREATE_SERVICE}
              element={<CreateServicesPage />}
            />
            <Route
              path={ROUTES.DOCTOR.EDIT_SERVICE}
              element={<CreateServicesPage />}
            />
          </Route>
        </Route>
      </Router>
    </BrowserRouter>
  );
}

export default AppRouter;
