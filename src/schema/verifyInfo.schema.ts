import { z } from "zod";
import { ValidateDominicanID } from "@/utils/ValidateDominicanID";
import { ValidateDominicanRNC } from "@/utils/ValidateDominicanRNC";
// Enum de estatus de verificación
export const verificationStatusEnum = z.enum([
  "PENDING",
  "APPROVED",
  "REJECTED",
]);

// --- Información personal del doctor ---
// 1. Define el schema base SIN traducción
export const doctorPersonalInfoBaseSchema = z.object({
  firstName: z.string(),
  lastName: z.string(),
  gender: z.string(),
  email: z.string(),
  nationality: z.string(),
  identificationNumber: z.string(),
  phone: z.string(),
  address: z.string(),
  primarySpecialty: z.string(),
  secondarySpecialty: z.string().optional(),
  medicalLicense: z.string(),
  verificationStatus: verificationStatusEnum,
});

// 2. Exporta el tipo para usar en el store
export type DoctorPersonalInfo = z.infer<typeof doctorPersonalInfoBaseSchema>;

// 3. Función para obtener el schema con traducción
export function doctorPersonalInfoSchema(t: (key: string) => string) {
  return doctorPersonalInfoBaseSchema.extend({
    firstName: z
      .string()
      .min(1, { message: t("validation.firstNameRequired") }),
    lastName: z.string().min(1, { message: t("validation.lastNameRequired") }),
    gender: z.string().min(1, { message: t("validation.genderRequired") }),
    email: z.string().email({ message: t("validation.emailInvalid") }),
    nationality: z
      .string()
      .min(1, { message: t("validation.nationalityRequired") }),
    identificationNumber: z
      .string()
      .min(1, { message: t("validation.identificationNumberRequired") })
      .refine((val) => ValidateDominicanID(val), {
        message: t("validation.identificationNumberInvalid"),
      }),
    phone: z.string().min(1, { message: t("validation.phoneRequired") }),
    address: z.string().min(1, { message: t("validation.addressRequired") }),
    primarySpecialty: z
      .string()
      .min(1, { message: t("validation.primarySpecialtyRequired") }),
    secondarySpecialty: z.string().optional(),
    medicalLicense: z
      .string()
      .min(1, { message: t("validation.medicalLicenseRequired") }),
    verificationStatus: verificationStatusEnum,
  });
}

// --- Información personal del centro ---
export const centerPersonalInfoBaseSchema = z.object({
  name: z.string(),
  description: z.string(),
  website: z.string().optional(),
  address: z.string(),
  province: z.string(),
  municipality: z.string(),
  rnc: z.string(),
  centerType: z.string(),
  phone: z.string(),
  email: z.string(),
  coordinates: z.object({
    latitude: z.number(),
    longitude: z.number(),
  }),
  verificationStatus: verificationStatusEnum,
});

export type CenterPersonalInfo = z.infer<typeof centerPersonalInfoBaseSchema>;

export function centerPersonalInfoSchema(t: (key: string) => string) {
  return centerPersonalInfoBaseSchema.extend({
    name: z.string().min(1, { message: t("validation.centerNameRequired") }),
    description: z
      .string()
      .min(1, { message: t("validation.centerDescriptionRequired") }),
    website: z
      .string()
      .url({ message: t("validation.urlInvalid") })
      .optional()
      .or(z.literal("")),
    address: z.string().min(1, { message: t("validation.addressRequired") }),
    province: z.string().min(1, { message: t("validation.provinceRequired") }),
    municipality: z
      .string()
      .min(1, { message: t("validation.municipalityRequired") }),
    rnc: z
      .string()
      .min(1, { message: t("validation.rncRequired") })
      .refine((val) => ValidateDominicanRNC(val), {
        message: t("validation.rncInvalid"),
      }),
    centerType: z
      .string()
      .min(1, { message: t("validation.centerTypeRequired") }),
    phone: z.string().min(1, { message: t("validation.phoneRequired") }),
    email: z.string().email({ message: t("validation.emailInvalid") }),
    coordinates: z.object({
      latitude: z.number(),
      longitude: z.number(),
    }),
    verificationStatus: verificationStatusEnum,
  });
}

// --- Esquema para archivos subidos ---
export const uploadedFileBaseSchema = z.object({
  url: z.string(),
  name: z.string().optional(),
  type: z.string(),
});
export type UploadedFile = z.infer<typeof uploadedFileBaseSchema>;

export function uploadedFileSchema(t: (key: string) => string) {
  return uploadedFileBaseSchema;
}

// --- Documentos del centro ---
export const centerDocumentsBaseSchema = z.object({
  healthCertificateFile: uploadedFileBaseSchema,
  urlImg: uploadedFileBaseSchema.optional(),
  verificationStatus: verificationStatusEnum,
});
export type CenterDocuments = z.infer<typeof centerDocumentsBaseSchema>;

export function centerDocumentsSchema(t: (key: string) => string) {
  return centerDocumentsBaseSchema;
}

// --- Documentos del doctor ---
export const doctorDocumentsBaseSchema = z.object({
  identityDocumentFile: uploadedFileBaseSchema,
  certifications: z.array(uploadedFileBaseSchema).optional(),
  academicTitle: uploadedFileBaseSchema.optional(),
  verificationStatus: verificationStatusEnum,
});
export type DoctorDocuments = z.infer<typeof doctorDocumentsBaseSchema>;

export function doctorDocumentsSchema(t: (key: string) => string) {
  return doctorDocumentsBaseSchema;
}
