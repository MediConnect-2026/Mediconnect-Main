// config/navbar.config.ts
export const NAVBAR_CONFIG = {
  PATIENT: {
    home: "/dashboard",
    menu: [
      { label: "home", href: "/dashboard" },
      { label: "appointments", href: "/patient/my-appointments" },
      { label: "doctors", href: "/patient/my-doctors" },
      { label: "calendar", href: "/calendar" },
    ],
  },

  DOCTOR: {
    home: "/dashboard",
    menu: [
      { label: "home", href: "/dashboard" },
      { label: "patients", href: "/doctor/my-patients" },
      { label: "appointments", href: "/doctor/appointments" },
      { label: "services", href: "/doctor/services" },
      { label: "schedule", href: "/calendar" },
    ],
  },

  CENTER: {
    home: "/dashboard",
    menu: [
      { label: "home", href: "/dashboard" },
      { label: "doctors", href: "/center/staff" },
    ],
  },
};
