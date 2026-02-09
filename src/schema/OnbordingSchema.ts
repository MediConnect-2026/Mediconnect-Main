import { z } from "zod";
import { ValidateDominicanID } from "@/utils/ValidateDominicanID";
import { ValidateDominicanRNC } from "@/utils/ValidateDominicanRNC";

// Schema para archivos subidos
export const UploadedFileSchema = z.object({
  url: z.string(),
  name: z.string().optional(),
  type: z.string(),
});

// Base schemas
export const BasePatientSchema = z.object({
  name: z.string(),
  lastName: z.string(),
  role: z.literal("Patient"),
  identityDocument: z.string(),
  email: z.string(),
  password: z.string(),
  confirmPassword: z.string(),
  urlImg: UploadedFileSchema.optional(),
});

export const BaseDoctorSchema = z.object({
  name: z.string(),
  lastName: z.string(),
  gender: z.string(),
  birthDate: z.string(),
  role: z.literal("Doctor"),
  nationality: z.string(),
  identityDocument: z.string(),
  exequatur: z.string(),
  mainSpecialty: z.string(),
  secondarySpecialties: z.array(z.string()).optional(),
  phone: z.string(),
  email: z.string(),
  urlImg: UploadedFileSchema.optional(),
  identityDocumentFile: UploadedFileSchema.optional(),
  certifications: z.array(UploadedFileSchema).optional(),
  academicTitle: UploadedFileSchema.optional(),
  password: z.string(),
  confirmPassword: z.string(),
});

export const BaseCenterSchema = z.object({
  name: z.string(),
  Description: z.string(),
  website: z.string().optional(),
  address: z.string(),
  province: z.string(),
  rnc: z.string(),
  municipality: z.string(),
  coordinates: z.object({
    latitude: z.number(),
    longitude: z.number(),
  }),
  centerType: z.string(),
  phone: z.string(),
  email: z.string().email(),
  urlImg: UploadedFileSchema.optional(),
  healthCertificateFile: UploadedFileSchema.optional(),
  password: z.string(),
  confirmPassword: z.string(),
  role: z.literal("Center"),
});

export function PatientOnboardingSchema(t: (key: string) => string) {
  return BasePatientSchema.extend({
    name: z.string().min(1, t("validation.nameRequired")),
    lastName: z.string().min(1, t("validation.lastNameRequired")),
    identityDocument: z.coerce
      .string()
      .min(1, t("validation.identityDocumentRequired"))
      .refine((val) => ValidateDominicanID(val), {
        message: t("validation.identityDocumentInvalid"),
      }),
    email: z
      .string()
      .min(1, t("validation.emailRequired"))
      .email(t("validation.emailInvalid")),
    password: z.string().min(6, t("validation.passwordMin")),
    confirmPassword: z.string().min(6, t("validation.passwordMin")),
  }).superRefine((data, ctx) => {
    if (data.password !== data.confirmPassword) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: t("validation.passwordsMustMatch"),
        path: ["confirmPassword"],
      });
    }
  });
}

export function PatientBasicInfoSchema(t: (key: string) => string) {
  return BasePatientSchema.pick({
    name: true,
    lastName: true,
    identityDocument: true,
  }).extend({
    name: z.string().min(1, t("validation.nameRequired")),
    lastName: z.string().min(1, t("validation.lastNameRequired")),
    identityDocument: z.coerce
      .string()
      .min(1, t("validation.identityDocumentRequired"))
      .refine((val) => ValidateDominicanID(val), {
        message: t("validation.identityDocumentInvalid"),
      }),
  });
}

export function CreatePasswordSchema(t: (key: string) => string) {
  return BasePatientSchema.pick({
    password: true,
    confirmPassword: true,
  })
    .extend({
      password: z.string().min(6, t("validation.passwordMin")),
      confirmPassword: z.string().min(6, t("validation.passwordMin")),
    })
    .superRefine((data, ctx) => {
      if (data.password !== data.confirmPassword) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: t("validation.passwordsMustMatch"),
          path: ["confirmPassword"],
        });
      }
    });
}

export function DoctorOnboardingSchema(t: (key: string) => string) {
  return BaseDoctorSchema.extend({
    name: z.string().min(1, t("validation.nameRequired")),
    lastName: z.string().min(1, t("validation.lastNameRequired")),
    gender: z.string().min(1, t("validation.genderRequired")),
    birthDate: z
      .string()
      .min(1, t("validation.birthDateRequired"))
      .regex(/^\d{4}-\d{2}-\d{2}$/, t("validation.birthDateFormat")),
    nationality: z.string().min(1, t("validation.nationalityRequired")),
    identityDocument: z.coerce
      .string()
      .min(1, t("validation.identityDocumentRequired"))
      .refine((val) => ValidateDominicanID(val), {
        message: t("validation.identityDocumentInvalid"),
      }),
    exequatur: z.string().min(1, t("validation.exequaturRequired")),
    mainSpecialty: z.string().min(1, t("validation.mainSpecialtyRequired")),
    secondarySpecialties: z.array(z.string()).optional(),
    phone: z.coerce
      .string()
      .min(1, t("validation.phoneRequired"))
      .regex(/^\d{10}$/, t("validation.phoneInvalid")),
    email: z
      .string()
      .min(1, t("validation.emailRequired"))
      .email(t("validation.emailInvalid")),
    urlImg: UploadedFileSchema.optional(),
    identityDocumentFile: UploadedFileSchema.optional(),
    certifications: z.array(UploadedFileSchema).optional(),
    academicTitle: UploadedFileSchema.optional(),
    password: z.string().min(6, t("validation.passwordMin")),
    confirmPassword: z.string().min(6, t("validation.passwordMin")),
  }).superRefine((data, ctx) => {
    if (data.password !== data.confirmPassword) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: t("validation.passwordsMustMatch"),
        path: ["confirmPassword"],
      });
    }
  });
}

export function DoctorBasicInfoSchema(t: (key: string) => string) {
  return BaseDoctorSchema.pick({
    name: true,
    lastName: true,
    gender: true,
    birthDate: true,
    nationality: true,
    identityDocument: true,
    phone: true,
  }).extend({
    name: z.string().min(1, t("validation.nameRequired")),
    lastName: z.string().min(1, t("validation.lastNameRequired")),
    gender: z.string().min(1, t("validation.genderRequired")),
    birthDate: z
      .string()
      .min(1, t("validation.birthDateRequired"))
      .regex(/^\d{4}-\d{2}-\d{2}$/, t("validation.birthDateFormat")),
    nationality: z.string().min(1, t("validation.nationalityRequired")),
    identityDocument: z.coerce
      .string()
      .min(1, t("validation.identityDocumentRequired"))
      .refine((val) => ValidateDominicanID(val), {
        message: t("validation.identityDocumentInvalid"),
      }),
    phone: z.coerce
      .string()
      .min(1, t("validation.phoneRequired"))
      .regex(/^\d{10}$/, t("validation.phoneInvalid")),
  });
}

export function DoctorProfessionalInfoSchema(t: (key: string) => string) {
  return BaseDoctorSchema.pick({
    exequatur: true,
    mainSpecialty: true,
    secondarySpecialties: true,
  }).extend({
    exequatur: z.string().min(1, t("validation.exequaturRequired")),
    mainSpecialty: z.string().min(1, t("validation.mainSpecialtyRequired")),
    secondarySpecialties: z.array(z.string()).optional(),
  });
}

export function CenterOnboardingSchema(t: (key: string) => string) {
  return BaseCenterSchema.extend({
    name: z.string().min(1, t("validation.centerNameRequired")),
    Description: z.string().min(1, t("validation.descriptionRequired")),
    website: z
      .string()
      .url(t("validation.websiteInvalid"))
      .optional()
      .or(z.literal("")),
    address: z.string().min(1, t("validation.addressRequired")),
    province: z.string().min(1, t("validation.provinceRequired")),
    municipality: z.string().min(1, t("validation.municipalityRequired")),
    rnc: z.coerce
      .string()
      .min(1, t("validation.rncRequired"))
      .refine((val) => ValidateDominicanRNC(val), {
        message: t("validation.rncInvalid"),
      }),
    coordinates: z.object({
      latitude: z.number(),
      longitude: z.number(),
    }),
    centerType: z.string().min(1, t("validation.centerTypeRequired")),
    phone: z.coerce
      .string()
      .min(1, t("validation.phoneRequired"))
      .regex(/^\d{10}$/, t("validation.phoneInvalid")),
    email: z
      .string()
      .min(1, t("validation.emailRequired"))
      .email(t("validation.emailInvalid")),
    urlImg: UploadedFileSchema.optional(),
    healthCertificateFile: UploadedFileSchema.optional(),
    password: z.string().min(6, t("validation.passwordMin")),
    confirmPassword: z.string().min(6, t("validation.passwordMin")),
  }).superRefine((data, ctx) => {
    if (data.password !== data.confirmPassword) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: t("validation.passwordsMustMatch"),
        path: ["confirmPassword"],
      });
    }
  });
}

export function CenterBasicInfoSchema(t: (key: string) => string) {
  return BaseCenterSchema.pick({
    name: true,
    Description: true,
    website: true,
    rnc: true,
    centerType: true,
    phone: true,
  }).extend({
    name: z.string().min(1, t("validation.centerNameRequired")),
    Description: z.string().min(1, t("validation.descriptionRequired")),
    website: z
      .string()
      .url(t("validation.websiteInvalid"))
      .optional()
      .or(z.literal("")),
    rnc: z.coerce
      .string()
      .min(1, t("validation.rncRequired"))
      .refine((val) => ValidateDominicanRNC(val), {
        message: t("validation.rncInvalid"),
      }),
    centerType: z.string().min(1, t("validation.centerTypeRequired")),
    phone: z.coerce
      .string()
      .min(1, t("validation.phoneRequired"))
      .regex(/^\d{10}$/, t("validation.phoneInvalid")),
  });
}

export function CenterLocationInfoSchema(t: (key: string) => string) {
  return BaseCenterSchema.pick({
    address: true,
    province: true,
    municipality: true,
    coordinates: true,
  }).extend({
    address: z.string().min(1, t("validation.addressRequired")),
    province: z.string().min(1, t("validation.provinceRequired")),
    municipality: z.string().min(1, t("validation.municipalityRequired")),
    coordinates: z.object({
      latitude: z.number(),
      longitude: z.number(),
    }),
  });
}

// Exportar tipos inferidos
export type PatientOnboardingSchemaType = z.infer<
  ReturnType<typeof PatientOnboardingSchema>
>;
export type PatientBasicInfoSchemaType = z.infer<
  ReturnType<typeof PatientBasicInfoSchema>
>;
export type PatientCreatePasswordSchemaType = z.infer<
  ReturnType<typeof CreatePasswordSchema>
>;
export type DoctorOnboardingSchemaType = z.infer<
  ReturnType<typeof DoctorOnboardingSchema>
>;
export type UploadedFileType = z.infer<typeof UploadedFileSchema>;
