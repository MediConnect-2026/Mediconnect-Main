// appointment.schema.ts
import z, { number } from "zod";

// Esquema base sin traducciones
export const appointmentSchemaBase = z.object({
  date: z.string(),
  time: z.string().min(1),
  selectedModality: z.enum(["presencial", "teleconsulta"]), // ← CORREGIDO: sin "Mixta"
  numberOfSessions: number().min(1).max(5).default(1),
  reason: z.string().min(10).max(100),
  // Soportamos citas con o sin seguro
  useInsurance: z.boolean(),
  insuranceProvider: z.string().optional(),
  serviceId: z.string(),
  doctorId: z.string(),
  horarioId: z.number().optional(),
  // appointmentId es OPCIONAL - solo existe cuando editamos/reagendamos
  appointmentId: z.string().optional(),
  
  // Campos del backend (opcionales hasta el submit)
  servicioId: z.number().optional(),
  fecha: z.string().optional(),
  hora: z.string().optional(),
  modalidad: z.string().optional(),
  numPacientes: z.number().optional(),
  seguroId: z.number().optional(),
  tipoSeguroId: z.number().optional(),
  motivoConsulta: z.string().optional(),
  
  // Campos del paciente para agendamiento por doctor
  pacienteNombre: z.string().optional(),
  pacienteApellido: z.string().optional(),
  pacienteDocumento: z.string().optional(),
  pacienteFechaNacimiento: z.string().optional(),
  pacienteGenero: z.string().optional(),
  isDoctorView: z.boolean().optional(),
  isRescheduling: z.boolean().optional(),
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
    useInsurance: z.boolean(),
    insuranceProvider: z.string().optional(),
    serviceId: z.string().min(1, { message: t("appointment.serviceRequired") }),
    doctorId: z.string().min(1, { message: t("appointment.doctorRequired") }),
    horarioId: z.number().optional(),
    // editamos/reagendamos
    appointmentId: z.string().optional(),
    
    // Campos del backend (opcionales)
    servicioId: z.number().optional(),
    fecha: z.string().optional(),
    hora: z.string().optional(),
    modalidad: z.string().optional(),
    numPacientes: z.number().optional(),
    seguroId: z.number().optional(),
    tipoSeguroId: z.number().optional(),
    motivoConsulta: z.string().optional(),
    
    // Campos del paciente para agendamiento por doctor
    pacienteNombre: z.string().optional(),
    pacienteApellido: z.string().optional(),
    pacienteDocumento: z.string().optional(),
    pacienteFechaNacimiento: z.string().optional(),
    pacienteGenero: z.string().optional(),
    isDoctorView: z.boolean().optional(),
    isRescheduling: z.boolean().optional(),
  }).superRefine((data, ctx) => {
    if (data.useInsurance && (!data.insuranceProvider || data.insuranceProvider.length === 0)) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: t("appointment.insuranceRequired"),
        path: ["insuranceProvider"],
      });
    }

    if (data.isDoctorView && !data.isRescheduling) {
      if (!data.pacienteNombre?.trim()) {
        ctx.addIssue({ code: z.ZodIssueCode.custom, message: t("appointment.requiredField"), path: ["pacienteNombre"] });
      }
      if (!data.pacienteApellido?.trim()) {
        ctx.addIssue({ code: z.ZodIssueCode.custom, message: t("appointment.requiredField"), path: ["pacienteApellido"] });
      }
      if (!data.pacienteDocumento?.trim()) {
        ctx.addIssue({ code: z.ZodIssueCode.custom, message: t("appointment.requiredField"), path: ["pacienteDocumento"] });
      }
      if (!data.pacienteFechaNacimiento?.trim()) {
        ctx.addIssue({ code: z.ZodIssueCode.custom, message: t("appointment.requiredField"), path: ["pacienteFechaNacimiento"] });
      }
      if (!data.pacienteGenero?.trim()) {
        ctx.addIssue({ code: z.ZodIssueCode.custom, message: t("appointment.requiredField"), path: ["pacienteGenero"] });
      }
    }
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

// ── Schema de validación para reprogramar cita por el doctor ────────────────
export const rescheduleAppointmentByDoctorSchemaBase = z.object({
  appointmentId: z.string().min(1, { message: "Appointment ID is required." }),
  newDate: z.string().refine((date) => !isNaN(Date.parse(date)), {
    message: "Invalid date.",
  }),
  newTime: z.string().min(1, { message: "Time is required." }),
});

export const rescheduleAppointmentByDoctorSchema = (
  t: (key: string) => string,
) =>
  z.object({
    appointmentId: z.string().min(1, {
      message: t("appointment.idRequired"),
    }),
    newDate: z.string().refine((date) => !isNaN(Date.parse(date)), {
      message: t("appointment.invalidDate"),
    }),
    newTime: z.string().min(1, {
      message: t("appointment.timeRequired"),
    }),
  });

export type RescheduleAppointmentByDoctorFormData = z.infer<
  typeof rescheduleAppointmentByDoctorSchemaBase
>;
