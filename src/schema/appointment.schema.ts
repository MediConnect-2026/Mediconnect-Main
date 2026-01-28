// appointment.schema.ts
import z, { number } from "zod";

// Esquema base sin traducciones
export const appointmentSchemaBase = z.object({
  date: z.string(),
  time: z.string().min(1),
  selectedModality: z.enum(["presencial", "teleconsulta"]),
  numberOfSessions: number().min(1).max(5).default(1),
  reason: z.string().min(10).max(100),
  insuranceProvider: z.string().min(1),
  serviceId: z.string(),
  doctorId: z.string(),
});

// Función que retorna el esquema con mensajes traducidos
export const appointmentSchema = (t: (key: string) => string) =>
  z.object({
    date: z.string().refine((date) => !isNaN(Date.parse(date)), {
      message: t("appointment.invalidDate"),
    }),
    time: z.string().min(1, { message: t("appointment.timeRequired") }),
    selectedModality: z.enum(["presencial", "teleconsulta"], {
      message: t("appointment.modalityRequired"),
    }),
    numberOfSessions: number()
      .min(1, { message: t("appointment.sessionsMin") })
      .max(5, { message: t("appointment.sessionsMax") })
      .default(1),
    reason: z
      .string()
      .min(10, { message: t("appointment.reasonMin") })
      .max(100, { message: t("appointment.reasonMax") }),
    insuranceProvider: z
      .string()
      .min(1, { message: t("appointment.insuranceRequired") }),
    serviceId: z.string().min(1, { message: t("appointment.serviceRequired") }),
    doctorId: z.string().min(1, { message: t("appointment.doctorRequired") }),
  });
