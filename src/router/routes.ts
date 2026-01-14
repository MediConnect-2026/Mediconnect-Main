export const ROUTES = {
  // --- AUTH & ONBOARDING ---
  LOGIN: "/login",
  REGISTER: "/auth/register",
  REG_EMAIL_VERIFICATION: "/auth/reg-email-verification",
  OTP_VERIFICATION: "/auth/otp-verification",

  // Onboarding por Rol
  PATIENT_BASIC_INFO: "/auth/patient-onboarding/basic-info",
  PATIENT_PASSWORD: "/auth/patient-onboarding/password-setup",
  PATIENT_PROFILE_PHOTO: "/auth/patient-onboarding/profile-photo",
  DOCTOR_ONBOARDING: "/auth/doctor-onboarding",
  DOCTOR_PASSWORD: "/auth/doctor-onboarding/password-setup",
  CENTER_ONBOARDING: "/auth/center-onboarding",
  CENTER_PASSWORD: "/auth/center-onboarding/password-setup",

  // --- REGISTER SUCCESS ---
  REGISTER_SUCCESS: "/auth/register-success",

  // --- PASSWORD FLOW ---
  FORGOT_PASSWORD: "/forgot-password",
  VERIFY_EMAIL: "/verify-email",
  RESET_PASSWORD: "/reset-password",
  PASSWORD_SUCCESS: "/password-success",

  // --- DASHBOARD PACIENTE ---
  PATIENT: {
    HOME: "/patient/dashboard",
    APPOINTMENTS: "/patient/my-appointments",
    DOCTORS: "/patient/find-doctor",
    CALENDAR: "/patient/calendar",
    PROFILE: "/patient/profile",
    INSURANCE: "/patient/my-insurance",
    SETTINGS: "/patient/settings",
  },

  // --- DASHBOARD DOCTOR ---
  DOCTOR: {
    HOME: "/doctor/dashboard",
    PATIENTS: "/doctor/my-patients",
    APPOINTMENTS: "/doctor/appointments",
    SERVICES: "/doctor/services",
    CALENDAR: "/doctor/schedule",
    PROFILE: "/doctor/profile",
  },

  // --- DASHBOARD CENTRO MÉDICO ---
  CENTER: {
    HOME: "/center/dashboard",
    DOCTORS: "/center/staff",
    APPOINTMENTS: "/center/all-appointments",
    FINANCES: "/center/finances",
  },
};
