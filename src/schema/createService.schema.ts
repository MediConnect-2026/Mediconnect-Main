import z, { array } from "zod";

export const UploadedFileSchema = z.object({
  url: z.string(),
  name: z.string().optional(),
  type: z.string(),
});

// Regex para validar formato de tiempo HH:mm
const durationRegex = /^([0-1][0-9]|2[0-3]):([0-5][0-9])$/;

// Regex para validar formato de tiempo HH:mm:ss
const timeRegex = /^([0-1][0-9]|2[0-3]):([0-5][0-9]):([0-5][0-9])$/;

// Schema con traducción (usa función t)
export const serviceSchema = (t: (key: string) => string) =>
  z.object({
    name: z
      .string()
      .min(1, t("validation.name.required"))
      .max(50, t("validation.name.maxLength")),
    description: z
      .string()
      .max(250, t("validation.description.maxLength"))
      .optional(),
    specialty: z.string(),
    selectedModality: z.enum(["presencial", "teleconsulta", "Mixta"]),
    pricePerSession: z
      .number()
      .min(1, t("validation.pricePerSession.positive")),
    numberOfSessions: z
      .number()
      .min(1, t("validation.numberOfSessions.min"))
      .max(5, t("validation.numberOfSessions.max"))
      .default(1),
    duration: z
      .string()
      .min(1, t("validation.duration.required"))
      .regex(durationRegex, t("validation.duration.format"))
      .transform((val) => {
        const [hours, minutes] = val.split(":").map(Number);
        return { hours, minutes };
      })
      .refine((val) => val.hours >= 0 && val.hours <= 23, {
        message: t("validation.duration.hours.invalid"),
      })
      .refine((val) => val.minutes >= 1 && val.minutes <= 59, {
        message: t("validation.duration.minutes.invalid"),
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
      .max(30, t("validation.name.maxLength30")),
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
