// config/navbar.config.ts
export const NAVBAR_CONFIG = {
  PATIENT: {
    home: "/patient/dashboard",
    menu: [
      { label: "home", href: "/patient/dashboard" },
      { label: "appointments", href: "/patient/my-appointments" },
      { label: "doctors", href: "/patient/find-doctor" },
      { label: "calendar", href: "/patient/calendar" },
    ],
  },

  DOCTOR: {
    home: "/doctor/dashboard",
    menu: [
      { label: "home", href: "/doctor/dashboard" },
      { label: "patients", href: "/doctor/my-patients" },
      { label: "appointments", href: "/doctor/appointments" },
      { label: "services", href: "/doctor/services" },
      { label: "schedule", href: "/doctor/schedule" },
    ],
  },

  CENTER: {
    home: "/center/dashboard",
    menu: [
      { label: "home", href: "/center/dashboard" },
      { label: "doctors", href: "/center/staff" },
      { label: "requests", href: "/center/requests" },
    ],
  },
};
