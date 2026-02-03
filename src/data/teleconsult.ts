import { mockAppointments } from "./appointments"; // Ajusta la ruta

export const teleconsultAppointment = mockAppointments.find(
  (a) => a.appointmentType === "virtual" && a.status === "in_progress",
);
