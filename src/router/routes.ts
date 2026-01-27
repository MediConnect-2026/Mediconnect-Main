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
    PATIENT_PROFILE_PRIVATE: "/patient/profile",
    PATIENT_PROFILE_PUBLIC: "/patient/profile/:patientId",
    SCHEDULE_APPOINTMENT: "/patient/schedule-appointment",
  },

  // --- DASHBOARD DOCTOR ---
  DOCTOR: {
    HOME: "/doctor/dashboard",
    PATIENTS: "/doctor/my-patients",
    APPOINTMENTS: "/doctor/appointments",
    SERVICES: "/doctor/services",
    CALENDAR: "/doctor/schedule",
    PROFILE: "/doctor/profile",
    SETTINGS: "/doctor/settings",
    DOCTOR_PROFILE_PRIVATE: "/doctor/profile",
    DOCTOR_PROFILE_PUBLIC: "/doctor/profile/:doctorId",
  },

  // --- DASHBOARD CENTRO MÉDICO ---
  CENTER: {
    HOME: "/center/dashboard",
    DOCTORS: "/center/staff",
    REQUESTS: "/center/requests",
    PROFILE: "/center/profile",
    SETTINGS: "/center/settings",
    CENTER_PROFILE_PRIVATE: "/center/profile",
    CENTER_PROFILE_PUBLIC: "/center/profile/:centerId",
  },

  COMMON: {
    CHAT: "/chat",
    GLOBAL_SEARCH: "/search",
  },
};
