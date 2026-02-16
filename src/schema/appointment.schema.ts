// appointment.schema.ts
import z, { number } from "zod";

// Esquema base sin traducciones
export const appointmentSchemaBase = z.object({
  date: z.string(),
  time: z.string().min(1),
  selectedModality: z.enum(["presencial", "teleconsulta"]), // ← CORREGIDO: sin "Mixta"
  numberOfSessions: number().min(1).max(5).default(1),
  reason: z.string().min(10).max(100),
  insuranceProvider: z.string().min(1),
  serviceId: z.string(),
  doctorId: z.string(),
  // appointmentId es OPCIONAL - solo existe cuando editamos/reagendamos
  appointmentId: z.string().optional(),
});

export const cancelAppointmentSchemaBase = z.object({
  cancellationReason: z
    .string()
    .min(10, {
      message: "La razón de cancelación debe tener al menos 10 caracteres.",
    })
    .max(200, {
      message: "La razón de cancelación no puede exceder los 200 caracteres.",
    }),
});

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
    // editamos/reagendamos
    appointmentId: z.string().optional(),
  });

export const cancelAppointmentSchema = (t: (key: string) => string) =>
  z.object({
    cancellationReason: z
      .string()
      .min(10, {
        message: t("appointment.cancellationReasonMin"),
      })
      .max(200, {
        message: t("appointment.cancellationReasonMax"),
      }),
  });

// Exportar el tipo inferido del schema
export type scheduleAppointment = z.infer<typeof appointmentSchemaBase>;
export type CancelAppointment = z.infer<typeof cancelAppointmentSchemaBase>;
