// config/navbar.config.ts
export const NAVBAR_CONFIG = {
  PATIENT: {
    home: "/patient/dashboard",
    menu: [
      { label: "Inicio", href: "/patient/dashboard" },
      { label: "Citas", href: "/patient/my-appointments" },
      { label: "Doctores", href: "/patient/find-doctor" },
      { label: "Calendario", href: "/patient/calendar" },
    ],
  },

  DOCTOR: {
    home: "/doctor/dashboard",
    menu: [
      { label: "Pacientes", href: "/doctor/my-patients" },
      { label: "Citas", href: "/doctor/appointments" },
      { label: "Servicios", href: "/doctor/services" },
      { label: "Calendario", href: "/doctor/schedule" },
    ],
  },

  CENTER: {
    home: "/center/dashboard",
    menu: [
      { label: "Doctores", href: "/center/staff" },
      { label: "Citas", href: "/center/all-appointments" },
      { label: "Finanzas", href: "/center/finances" },
    ],
  },
};
