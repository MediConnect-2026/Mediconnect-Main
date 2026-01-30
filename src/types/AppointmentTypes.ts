// AppointmentTypes.ts
import z from "zod";
import {
  appointmentSchemaBase,
  cancelAppointmentSchemaBase,
} from "../schema/appointment.schema";

export type scheduleAppointment = z.infer<typeof appointmentSchemaBase>;

// Tipo específico para cuando estamos creando (sin ID)
export type CreateAppointment = Omit<scheduleAppointment, "appointmentId">;

export type CancelAppointment = z.infer<typeof cancelAppointmentSchemaBase>;

// Tipo específico para cuando estamos editando (con ID requerido)
export type EditAppointment = Required<scheduleAppointment>;
