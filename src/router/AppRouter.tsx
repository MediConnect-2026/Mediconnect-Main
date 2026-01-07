import { Route, Routes as Router, BrowserRouter } from "react-router-dom";
import { ROUTES } from "./routes";
import AuthLayout from "@/layout/AuthLayout";
import DashboardLayout from "@/layout/DashboardLayout";
import Login from "@/features/auth/pages/LoginPage";
import ForgotPasswordPage from "@/features/auth/pages/passwordFlow/ForgotPasswordPage";
import VerifyEmailPage from "@/features/auth/pages/passwordFlow/VerifyEmailPage";
import ResetPasswordPage from "@/features/auth/pages/passwordFlow/ResetPasswordPage";
import PasswordSuccessPage from "@/features/auth/pages/PasswordSuccessPage";
import Register from "@/features/auth/pages/registerFlow/RegisterPage";
import DarkLayout from "@/layout/DarkLayout";
import RegEmailVerificationPage from "@/features/auth/pages/registerFlow/RegEmailVerificationPage";
import OtpVerificationPage from "@/features/auth/pages/registerFlow/OtpVerificationPage";
import PatientBasicInfoPage from "@/features/auth/pages/registerFlow/patientOnboarding/PatientBasicInfoPage";
import PatientProfilePhotoPage from "@/features/auth/pages/registerFlow/patientOnboarding/PatientProfilePhotoPage";
import SetCredentialsPage from "@/features/auth/pages/registerFlow/SetCredentialsPage";
import DoctorOnboardingPage from "@/features/auth/pages/registerFlow/DoctorOnboardingPage";
import CenterOnboardingPage from "@/features/auth/pages/registerFlow/CenterOnboardingPage";
function AppRouter() {
  return (
    <BrowserRouter>
      <Router>
        <Route path={ROUTES.LOGIN} index element={<Login />} />
        <Route element={<AuthLayout />}>
          {/* Register Flow */}{" "}
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
            path={ROUTES.CENTER_ONBOARDING}
            element={<CenterOnboardingPage />}
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
          <Route element={<DashboardLayout />}></Route>
        </Route>
      </Router>
    </BrowserRouter>
  );
}

export default AppRouter;
