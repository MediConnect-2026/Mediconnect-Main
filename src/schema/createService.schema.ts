import z, { array } from "zod";

export const UploadedFileSchema = z.object({
  url: z.string(),
  name: z.string().optional(),
  type: z.string(),
});

// Regex para validar formato de tiempo HH:mm:ss
const timeRegex = /^([0-1][0-9]|2[0-3]):([0-5][0-9]):([0-5][0-9])$/;
// Default service schema (sin traducción)
export const defaultServiceSchema = z.object({
  name: z
    .string()
    .min(1, "Name is required")
    .max(50, "Name cannot exceed 50 characters"),
  description: z
    .string()
    .min(50, "Description must be at least 50 characters")
    .max(250, "Description cannot exceed 250 characters"),
  specialty: z.string(),
  selectedModality: z.enum(["presencial", "teleconsulta", "Mixta"]),
  pricePerSession: z.number().min(1, "Price per session must be positive"),
  numberOfSessions: z
    .number()
    .min(1, "At least 1 session")
    .max(5, "No more than 5 sessions")
    .default(1),
  duration: z.object({
    hours: z.number().int().min(0).max(23).default(0),
    minutes: z
      .number()
      .int()
      .min(1, "Minutes must be at least 1")
      .max(59, "Minutes cannot exceed 59"),
  }),
  images: z
    .array(UploadedFileSchema)
    .max(8, "Max 8 images")
    .min(1, "At least 1 image required"),
  location: z.number().optional(),
  comercial_schedule: array(z.number()),
});
// Schema con traducción (usa función t)
export const serviceSchema = (t: (key: string) => string) =>
  z.object({
    name: z
      .string()
      .min(1, t("validation.name.required"))
      .max(50, t("validation.name.maxLength")),
    description: z
      .string()
      .min(50, t("validation.description.minLength"))
      .max(250, t("validation.description.maxLength")),
    specialty: z.string().min(1, t("validation.specialty.required")), // <-- Validación obligatoria
    selectedModality: z
      .enum(["presencial", "teleconsulta", "Mixta"])
      .refine((val) => !!val, {
        message: t("validation.selectedModality.required"), // <-- Mensaje personalizado
      }),
    pricePerSession: z
      .number()
      .min(1, t("validation.pricePerSession.positive")),
    numberOfSessions: z
      .number()
      .min(1, "At least 1 session")
      .max(5, "No more than 5 sessions")
      .default(1),
    duration: z.object({
      hours: z.number().int().min(0).max(23).default(0),
      minutes: z
        .number()
        .int()
        .min(1, t("validation.duration.minutes.min"))
        .max(59, t("validation.duration.minutes.max")),
    }),
    images: z
      .array(UploadedFileSchema)
      .max(8, t("validation.images.maxLength"))
      .min(1, t("validation.images.required")),
    location: z.number().optional(),
    comercial_schedule: array(z.number()),
  });

// Default location schema
export const defaultLocationSchema = z.object({
  name: z
    .string()
    .min(1, "Name is required")
    .max(30, "Name cannot exceed 30 characters"),
  address: z.string(),
  province: z.string(),
  municipality: z.string(),
  coordinates: z.object({
    latitude: z.number(),
    longitude: z.number(),
  }),
});

// Location schema con traducción
export const locationSchema = (t: (key: string) => string) =>
  z.object({
    name: z
      .string()
      .min(1, t("validation.name.required"))
      .max(30, t("validation.name.maxLength30"))
      .optional(),

    address: z.string().min(1, t("validation.address.required")),
    province: z.string().min(1, t("validation.province.required")),
    municipality: z.string().min(1, t("validation.municipality.required")),
    coordinates: z.object({
      latitude: z.number(),
      longitude: z.number(),
    }),
  });

// Default comercial schedule schema
export const defaultComercialScheduleSchema = z.object({
  name: z
    .string()
    .min(1, "Name is required")
    .max(30, "Name cannot exceed 30 characters"),
  day: z
    .array(z.number().int().min(0).max(6))
    .min(1, "Debe seleccionar al menos un día"),
  startTime: z
    .string()
    .regex(timeRegex, "Start time must be in HH:mm:ss format"),
  endTime: z.string().regex(timeRegex, "End time must be in HH:mm:ss format"),
  locationId: z.string(),
});

export const comercialScheduleSchema = (t: (key: string) => string) =>
  z.object({
    name: z
      .string()
      .min(1, t("validation.name.required"))
      .max(30, t("validation.name.maxLength30")),
    day: z
      .array(z.number().int().min(0).max(6))
      .min(1, t("validation.day.selectAtLeastOne")),
    startTime: z
      .string()
      .regex(timeRegex, t("validation.startTime.invalidFormat")),
    endTime: z.string().regex(timeRegex, t("validation.endTime.invalidFormat")),
    locationId: z.string().min(1, t("validation.locationId.required")),
  });
