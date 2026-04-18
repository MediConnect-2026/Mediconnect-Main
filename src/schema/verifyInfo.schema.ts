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
  comentarioVerificacion: z.string().optional(),
  verificationStatus: verificationStatusEnum,
});

export type DoctorPersonalInfo = z.infer<typeof doctorPersonalInfoBaseSchema>;

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
    // Address is not editable in the current doctor verify-info form.
    // Keep it optional in validation to avoid blocking submit.
    address: z.string(),
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
  district: z.string().optional(),
  section: z.string().optional(),
  codigoPostal: z.string().optional(),
  barrioId: z.string().optional(),
  rnc: z.string(),
  centerType: z.string(),
  centerTypeLabel: z.string().optional(),
  phone: z.string(),
  email: z.string(),
  coordinates: z.object({
    latitude: z.number(),
    longitude: z.number(),
  }),
  comentarioVerificacion: z.string().optional(),
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
    district: z.string().optional(),
    section: z.string().optional(),
    codigoPostal: z.string().optional(),
    barrioId: z.string().optional(),
    rnc: z
      .string()
      .min(1, { message: t("validation.rncRequired") })
      .refine((val) => ValidateDominicanRNC(val), {
        message: t("validation.rncInvalid"),
      }),
    centerType: z
      .string()
      .min(1, { message: t("validation.centerTypeRequired") }),
    centerTypeLabel: z.string().optional(),
    phone: z.string().min(1, { message: t("validation.phoneRequired") }),
    email: z.string().email({ message: t("validation.emailInvalid") }),
    coordinates: z.object({
      latitude: z.number(),
      longitude: z.number(),
    }),
    verificationStatus: verificationStatusEnum,
  });
}

// --- Esquema para archivos base (sin estado de verificación) ---
// ✅ Este se usa para los items dentro de certifications[]
export const uploadedFileBaseSchema = z.object({
  url: z.string(),
  name: z.string(),
  type: z.string(),
  size: z.number(),
  uploadedAt: z.string(),
});
export type UploadedFile = z.infer<typeof uploadedFileBaseSchema>;

// --- Archivo con verificationStatus (para documentos individuales) ---
// ✅ Este se usa para identityDocumentFile y academicTitle
export const uploadedFileWithStatusBaseSchema = uploadedFileBaseSchema.extend({
  id: z.number().optional(), // ID del documento en el API (para actualizaciones)
  verificationStatus: verificationStatusEnum,
  feedback: z.string().optional(),
});
export type UploadedFileWithStatus = z.infer<
  typeof uploadedFileWithStatusBaseSchema
>;

// --- Documentos del centro ---
export const centerDocumentsBaseSchema = z.object({
  healthCertificateFile: uploadedFileWithStatusBaseSchema,
});
export type CenterDocuments = z.infer<typeof centerDocumentsBaseSchema>;

export function centerDocumentsSchema(t: (key: string) => string) {
  void t;
  return centerDocumentsBaseSchema;
}

// --- Documentos del doctor ---
// ✅ Actualizado para incluir el estado padre de las certificaciones
export const doctorDocumentsBaseSchema = z.object({
  // ✅ Cambiado a array para soportar múltiples documentos de identidad
  identityDocumentFiles: z.array(uploadedFileWithStatusBaseSchema).min(1),
  academicTitle: uploadedFileWithStatusBaseSchema.optional(),
  // ✅ certifications usa uploadedFileBaseSchema (sin estado individual)
  certifications: z.array(uploadedFileBaseSchema).optional(),
  // ✅ Estado del padre para las certificaciones
  certificationsStatus: verificationStatusEnum.optional(),
  certificationsFeedback: z.string().optional(),
});
export type DoctorDocuments = z.infer<typeof doctorDocumentsBaseSchema>;

export function doctorDocumentsSchema(t: (key: string) => string) {
  void t;
  return doctorDocumentsBaseSchema;
}
