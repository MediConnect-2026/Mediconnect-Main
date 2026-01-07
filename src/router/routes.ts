export const ROUTES = {
  LOGIN: "/login",

  //Registration flow
  REGISTER: "/auth/register",
  REG_EMAIL_VERIFICATION: "/auth/reg-email-verification",
  OTP_VERIFICATION: "/auth/otp-verification",
  //Patient Flow
  PATIENT_BASIC_INFO: "/auth/patient-onboarding/basic-info",
  PATIENT_PASSWORD: "/auth/patient-onboarding/password-setup",
  PATIENT_PROFILE_PHOTO: "/auth/patient-onboarding/profile-photo",

  DOCTOR_ONBOARDING: "/auth/doctor-onboarding",
  CENTER_ONBOARDING: "/auth/center-onboarding",

  //New password flow
  FORGOT_PASSWORD: "/auth/forgot-password",
  VERIFY_EMAIL: "/auth/verify-email",
  RESET_PASSWORD: "/auth/reset-password",
  PASSWORD_SUCCESS: "/auth/password-success",
};
