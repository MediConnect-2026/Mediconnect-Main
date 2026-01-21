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

import PatientProfilePage from "@/features/patient/pages/PatientProfilePage";

function AppRouter() {
  return (
    <BrowserRouter>
      {" "}
      <ScrollToTop /> {/* 👈 AQUÍ, dentro del Router real */}
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
            <Route path={ROUTES.PATIENT.HOME} element={<PatientDashboard />} />
            <Route
              path={ROUTES.PATIENT.PATIENT_PROFILE_PRIVATE}
              element={<PatientProfilePage />}
            />

            <Route path={ROUTES.DOCTOR.HOME} element={<DoctorDashboard />} />
            <Route path={ROUTES.CENTER.HOME} element={<CenterDashboard />} />
          </Route>
        </Route>
      </Router>
    </BrowserRouter>
  );
}

export default AppRouter;
