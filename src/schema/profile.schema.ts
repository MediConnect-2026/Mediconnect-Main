import { z } from "zod";
import { ValidateDominicanID } from "@/utils/ValidateDominicanID";
import { UploadedFileSchema } from "./OnbordingSchema";
import { ValidateDominicanRNC } from "@/utils/ValidateDominicanRNC";

export function profileSchema(t: (key: string) => string) {
  return z.object({
    role: z.enum(["PATIENT", "DOCTOR", "CENTER"]),
    fullName: z.string().min(1, t("validation.fullNameRequired")),
    email: z.string().email(t("validation.emailInvalid")),
    avatar: UploadedFileSchema.optional(),
    banner: UploadedFileSchema.optional(),
  });
}

export function doctorProfileSchema(t: (key: string) => string) {
  return profileSchema(t).extend({
    specialty: z.string().min(1, t("validation.specialtyRequired")),
    phone: z.string().optional(),
    yearsExperience: z
      .number()
      .min(0, t("validation.yearsPositive"))
      .refine((val) => typeof val === "number" && !isNaN(val), {
        message: t("validation.yearsNumber"),
      }),
    biography: z.string().optional(),
    secondarySpecialties: z.array(z.string()).optional(),
    licenseNumber: z.string().min(1, t("validation.licenseNumberRequired")),
    identityDocument: z
      .string()
      .min(1, t("validation.identityDocumentRequired")),
    nationality: z.string().min(1, t("validation.nationalityRequired")),
    birthDate: z.string().min(1, t("validation.birthDateRequired")),
  });
}

export function patientProfileSchema(t: (key: string) => string) {
  return profileSchema(t).extend({
    identityDocument: z
      .string()
      .min(1, t("validation.identityDocumentRequired"))
      .refine((val) => ValidateDominicanID(val), {
        message: t("validation.identityDocumentInvalid"),
      }),
    phone: z.string().optional(),
    age: z
      .string()
      .refine((val) => !val || !isNaN(Number(val)), {
        message: t("validation.ageInvalid"),
      })
      .transform((val) => (val ? Number(val) : undefined))
      .optional(),
    gender: z.enum(["MALE", "FEMALE", "OTHER"]).optional(),
    bloodType: z
      .enum(["A+", "A-", "B+", "B-", "AB+", "AB-", "O+", "O-"], {
        message: t("validation.bloodTypeInvalid"),
      })
      .optional(),
    nationality: z.string().optional(),
    weight: z
      .string()
      .refine((val) => !val || !isNaN(Number(val)), {
        message: t("validation.weightInvalid"),
      })
      .transform((val) => (val ? Number(val) : undefined))
      .optional(),
    height: z
      .string()
      .refine((val) => !val || !isNaN(Number(val)), {
        message: t("validation.heightInvalid"),
      })
      .transform((val) => (val ? Number(val) : undefined))
      .optional(),
  });
}

export function patientClinicalHistorySchema(t: (key: string) => string) {
  return z.object({
    allergies: z.array(z.string()).optional(),
    conditions: z.array(z.string()).optional(),
  });
}

export function patientInsuranceSchema(t: (key: string) => string) {
  return z.object({
    insuranceProvider: z.array(z.string()).optional(),
  });
}

export function centerProfileSchema(t: (key: string) => string) {
  return profileSchema(t).extend({
    centerType: z.string().min(1, t("validation.centerTypeRequired")),
    phone: z.string().optional(),
    website: z.string().url(t("validation.websiteInvalid")).optional(),
    taxId: z
      .string()
      .min(1, t("validation.taxIdRequired"))
      .refine((val) => ValidateDominicanRNC(val), {
        message: t("validation.taxIdInvalid"),
      }),
    address: z.string().optional(),
  });
}

// Corregido: usar un esquema base local, no BaseCenterSchema (que no existe aquí)
export function centerLocationSchema(t: (key: string) => string) {
  return z.object({
    address: z.string().min(1, t("validation.addressRequired")),
    province: z.string().min(1, t("validation.provinceRequired")),
    municipality: z.string().min(1, t("validation.municipalityRequired")),
    coordinates: z.object({
      latitude: z.number(),
      longitude: z.number(),
    }),
  });
}
