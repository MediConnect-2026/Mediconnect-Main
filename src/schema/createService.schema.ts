import z, { array } from "zod";

export const UploadedFileSchema = z.object({
  url: z.string(),
  name: z.string().optional(),
  type: z.string(),
});

// Default schema (sin traducción)
export const defaultServiceSchema = z.object({
  name: z
    .string()
    .min(1, "Name is required")
    .max(50, "Name cannot exceed 50 characters"),
  description: z
    .string()
    .max(150, "La descripción no puede exceder 150 caracteres")
    .optional(),
  specialty: z.string(),
  selectedModality: z.enum(["presencial", "teleconsulta", "Mixta"]),
  price: z.number().min(0, "Price must be a positive number"),
  numberOfSessions: z
    .number()
    .min(1, "Number of sessions must be at least 1")
    .max(5, "Number of sessions cannot exceed 5")
    .default(1),
  duration: z.object({
    hours: z.number().int().min(0).max(23).default(0),
    minutes: z.number().int().min(1).max(59),
  }),
  pricePerSession: z
    .number()
    .min(0, "Price per session must be a positive number"),
  insuranceAccepted: z.string().optional(),
  images: z
    .array(UploadedFileSchema)
    .max(8, "Máximo 8 imágenes")
    .min(1, "Al menos una imagen es requerida"),
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
      .max(150, t("validation.description.maxLength"))
      .optional(),
    specialty: z.string(),
    selectedModality: z.enum(["presencial", "teleconsulta", "Mixta"]),
    price: z.number().min(0, t("validation.price.positive")),
    numberOfSessions: z
      .number()
      .min(1, t("validation.numberOfSessions.min"))
      .max(5, t("validation.numberOfSessions.max"))
      .default(1),
    duration: z.object({
      hours: z.number().int().min(0).max(23).default(0),
      minutes: z
        .number()
        .int()
        .min(1, t("validation.duration.minutes.min"))
        .max(59, t("validation.duration.minutes.max")),
    }),
    pricePerSession: z
      .number()
      .min(0, t("validation.pricePerSession.positive")),
    insuranceAccepted: z.string().optional(),
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
    .max(30, "Name cannot exceed 50 characters"),
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
    .max(30, "Name cannot exceed 50 characters"),
  day: z
    .array(z.number().int().min(0).max(6))
    .min(1, "Debe seleccionar al menos un día"),
  startTime: z.string(),
  endTime: z.string(),
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
    startTime: z.string().min(1, t("validation.startTime.required")),
    endTime: z.string().min(1, t("validation.endTime.required")),
    locationId: z.string().min(1, t("validation.locationId.required")),
  });
