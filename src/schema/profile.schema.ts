import { z } from "zod";
import { ValidateDominicanID } from "@/utils/ValidateDominicanID";
import { UploadedFileSchema } from "./OnbordingSchema";
import { ValidateDominicanRNC } from "@/utils/ValidateDominicanRNC";

export function profileSchema(t: (key: string) => string) {
  return z.object({
    role: z.enum(["PATIENT", "DOCTOR", "CENTER"], {
      message: t("validation.roleRequired"),
    }),
    fullName: z.string().min(1, t("validation.fullNameRequired")),
    email: z.string().email(t("validation.emailInvalid")),
    avatar: UploadedFileSchema.optional(),
    banner: UploadedFileSchema.optional(),
  });
}

export function doctorProfileSchema(t: (key: string) => string) {
  return profileSchema(t).extend({
    specialty: z.string().min(1, t("validation.specialtyRequired")),
    phone: z.coerce
      .string()
      .regex(/^\d{10}$/, t("validation.phoneInvalid"))
      .optional(),
    yearsExperience: z.string().min(0, t("validation.yearsPositive")),
    biography: z.string().optional(),
    secondarySpecialties: z
      .array(z.string().min(1, t("validation.secondarySpecialtyRequired")))
      .optional(),
    licenseNumber: z.string().min(1, t("validation.licenseNumberRequired")),
    identityDocument: z.coerce
      .string()
      .min(1, t("validation.identityDocumentRequired"))
      .refine((val) => ValidateDominicanID(val), {
        message: t("validation.identityDocumentInvalid"),
      }),
    nationality: z.string().min(1, t("validation.nationalityRequired")),
    birthDate: z.string().min(1, t("validation.birthDateRequired")),
  });
}

export function doctorEducationSchema(t: (key: string) => string) {
  return z.object({
    educations: z
      .array(
        z.object({
          institution: z.string().min(1, t("validation.institutionRequired")),
          degree: z.string().min(1, t("validation.degreeRequired")),
          startMonth: z.string().min(1, t("validation.startMonthRequired")),
          startYear: z.string().min(1, t("validation.startYearRequired")),
          endMonth: z.string().min(1, t("validation.endMonthRequired")),
          endYear: z.string().min(1, t("validation.endYearRequired")),
        }),
      )
      .min(1, t("validation.educationAtLeastOne")),
  });
}

export function doctorExperienceSchema(t: (key: string) => string) {
  return z.object({
    experiences: z
      .array(
        z.object({
          hospital: z.string().min(1, t("validation.hospitalRequired")),
          position: z.string().min(1, t("validation.positionRequired")),
          startMonth: z.string().min(1, t("validation.startMonthRequired")),
          startYear: z.string().min(1, t("validation.startYearRequired")),
          endMonth: z.string().min(1, t("validation.endMonthRequired")),
          endYear: z.string().min(1, t("validation.endYearRequired")),
        }),
      )
      .min(1, t("validation.experienceAtLeastOne")),
  });
}

export function doctorLanguageSchema(t: (key: string) => string) {
  return z.object({
    languages: z
      .array(z.string().min(1, t("validation.languageRequired")))
      .min(1, t("validation.languageAtLeastOne")),
  });
}

export function doctorInsuranceSchema(t: (key: string) => string) {
  return z.object({
    insuranceProviders: z
      .array(z.string().min(1, t("validation.insuranceProviderRequired")))
      .optional(),
  });
}

export function patientProfileSchema(t: (key: string) => string) {
  return profileSchema(t).extend({
    identityDocument: z.coerce
      .string()
      .min(1, t("validation.identityDocumentRequired"))
      .refine((val) => ValidateDominicanID(val), {
        message: t("validation.identityDocumentInvalid"),
      }),
    phone: z.coerce
      .string()
      .regex(/^\d{10}$/, t("validation.phoneInvalid"))
      .optional(),
    age: z
      .number()
      .min(0, t("validation.agePositive"))
      .max(150, t("validation.ageMax"))
      .optional(),
    gender: z
      .enum(["MALE", "FEMALE", "OTHER"], {
        message: t("validation.genderRequired"),
      })
      .optional(),
    bloodType: z
      .enum(["A+", "A-", "B+", "B-", "AB+", "AB-", "O+", "O-"], {
        message: t("validation.bloodTypeInvalid"),
      })
      .optional(),
    nationality: z
      .string()
      .min(1, t("validation.nationalityRequired"))
      .optional(),
    weight: z
      .number()
      .min(0.1, t("validation.weightPositive"))
      .max(500, t("validation.weightMax"))
      .optional(),
    height: z
      .number()
      .min(1, t("validation.heightPositive"))
      .max(300, t("validation.heightMax"))
      .optional(),
  });
}

export function patientClinicalHistorySchema(t: (key: string) => string) {
  return z.object({
    allergies: z
      .array(z.string().min(1, t("validation.allergyRequired")))
      .optional(),
    conditions: z
      .array(z.string().min(1, t("validation.conditionRequired")))
      .optional(),
  });
}

export function patientInsuranceSchema(t: (key: string) => string) {
  return z.object({
    insuranceProvider: z
      .array(z.string().min(1, t("validation.insuranceProviderRequired")))
      .optional(),
  });
}

export function centerProfileSchema(t: (key: string) => string) {
  return profileSchema(t).extend({
    centerType: z.string().min(1, t("validation.centerTypeRequired")),
    phone: z.coerce
      .string()
      .regex(/^\d{10}$/, t("validation.phoneInvalid"))
      .optional(),
    website: z
      .string()
      .url(t("validation.websiteInvalid"))
      .optional()
      .or(z.literal("")),
    taxId: z.coerce
      .string()
      .min(1, t("validation.taxIdRequired"))
      .refine((val) => ValidateDominicanRNC(val), {
        message: t("validation.taxIdInvalid"),
      }),
    address: z.string().min(1, t("validation.addressRequired")).optional(),
  });
}

export function centerLocationSchema(t: (key: string) => string) {
  return z.object({
    address: z.string().min(1, t("validation.addressRequired")),
    province: z.string().min(1, t("validation.provinceRequired")),
    municipality: z.string().min(1, t("validation.municipalityRequired")),
    coordinates: z.object({
      latitude: z
        .number()
        .min(-90, t("validation.latitudeRange"))
        .max(90, t("validation.latitudeRange")),
      longitude: z
        .number()
        .min(-180, t("validation.longitudeRange"))
        .max(180, t("validation.longitudeRange")),
    }),
  });
}
