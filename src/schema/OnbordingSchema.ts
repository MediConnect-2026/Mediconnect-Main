import { z } from "zod";
import { ValidateDominicanID } from "@/utils/ValidateDominicanID";
import { ValidateDominicanRNC } from "@/utils/ValidateDominicanRNC";
import i18next from "i18next";

const PASSWORD_SECURITY_REGEX = /^(?=.*[A-Z])(?=.*\d)(?=.*[^A-Za-z0-9]).{6,}$/;

const getValidationMessage = (
  t: (key: string) => string,
  key: string,
  fallback: { es: string; en: string },
) => {
  const translated = t(key);
  if (!translated || translated === key) {
    return i18next.language?.toLowerCase().startsWith("en")
      ? fallback.en
      : fallback.es;
  }
  return translated;
};

const passwordWithSecurity = (t: (key: string) => string) =>
  z
    .string()
    .min(
      8,
      getValidationMessage(t, "validation.passwordMin", {
        es: "La contraseña debe tener al menos 8 caracteres",
        en: "Password must be at least 8 characters",
      }),
    )
    .refine((val) => PASSWORD_SECURITY_REGEX.test(val), {
      message: getValidationMessage(t, "validation.passwordSecurity", {
        es: "La contraseña debe incluir al menos una mayúscula, un número y un carácter especial.",
        en: "Password must include at least one uppercase letter, one number, and one special character.",
      }),
    });

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
  gender: z.string(),
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
  language: z.string(),
  proficiencyLevel: z.string(),
  exequatur: z.string(),
  mainSpecialty: z.string(),
  secondarySpecialties: z.array(z.string()).optional(),
  phone: z.string(),
  email: z.string(),
  urlImg: UploadedFileSchema.optional(),
  identityDocumentFile: z.array(UploadedFileSchema).optional(),
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
  municipality: z.string(),
  coordinates: z.object({
    latitude: z.number(),
    longitude: z.number(),
  }),
  rnc: z.string(),

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
    password: passwordWithSecurity(t),
    confirmPassword: passwordWithSecurity(t),
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
    gender: true,
  }).extend({
    name: z.string().min(1, t("validation.nameRequired")),
    lastName: z.string().min(1, t("validation.lastNameRequired")),
    identityDocument: z.coerce
      .string()
      .min(1, t("validation.identityDocumentRequired"))
      .refine((val) => ValidateDominicanID(val), {
        message: t("validation.identityDocumentInvalid"),
      }),
    gender: z.string().min(1, t("validation.genderRequired")),
  });
}

export function CreatePasswordSchema(t: (key: string) => string) {
  return BasePatientSchema.pick({
    password: true,
    confirmPassword: true,
  })
    .extend({
      password: passwordWithSecurity(t),
      confirmPassword: passwordWithSecurity(t),
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
    language: z.string().min(1, t("validation.languageRequired")),
    proficiencyLevel: z.string().min(1, t("validation.proficiencyLevelRequired")),
    exequatur: z.coerce
      .string()
      .min(1, t("validation.exequaturRequired"))
      .transform((val) => val.replace(/\D/g, ""))
      .refine((val) => val.length === 5, {
        message: t("validation.exequaturInvalid"),
      }),
    mainSpecialty: z.string().min(1, t("validation.mainSpecialtyRequired")),
    secondarySpecialties: z.array(z.string()).optional(),
    phone: z.coerce
      .string()
      .min(1, t("validation.phoneRequired"))
      .transform((val) => val.replace(/\D/g, ""))
      .refine((val) => val.length === 10, {
        message: t("validation.phoneInvalid"),
      }),
    email: z
      .string()
      .min(1, t("validation.emailRequired"))
      .email(t("validation.emailInvalid")),
    urlImg: UploadedFileSchema.optional(),
    identityDocumentFile: z.array(UploadedFileSchema).max(2, t("validation.maxDocumentFiles")).optional(),
    certifications: z.array(UploadedFileSchema).optional(),
    academicTitle: UploadedFileSchema.optional(),
    password: passwordWithSecurity(t),
    confirmPassword: passwordWithSecurity(t),
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
    language: true,
    proficiencyLevel: true,
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
    language: z.string().min(1, t("validation.languageRequired")),
    proficiencyLevel: z.string().min(1, t("validation.proficiencyLevelRequired")),
    phone: z.coerce
      .string()
      .min(1, t("validation.phoneRequired"))
      .transform((val) => val.replace(/\D/g, ""))
      .refine((val) => val.length === 10, {
        message: t("validation.phoneInvalid"),
      }),
  });
}

export function DoctorProfessionalInfoSchema(t: (key: string) => string) {
  return BaseDoctorSchema.pick({
    exequatur: true,
    mainSpecialty: true,
    secondarySpecialties: true,
  }).extend({
    exequatur: z.coerce
      .string()
      .min(1, t("validation.exequaturRequired"))
      .transform((val) => val.replace(/\D/g, ""))
      .refine((val) => val.length === 5, {
        message: t("validation.exequaturInvalid"),
      }),
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
    // Distrito es opcional: la API puede devolver distritoMunicipal: null
    district: z.string().optional().or(z.literal("")),
    section: z.string().min(1, t("validation.sectionRequired")),
    neighborhood: z.string().min(1, t("validation.neighborhoodRequired")),
    subNeighborhood: z.string().optional().or(z.literal("")),
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
      .transform((val) => val.replace(/\D/g, ""))
      .refine((val) => val.length === 10, {
        message: t("validation.phoneInvalid"),
      }),
    email: z
      .string()
      .min(1, t("validation.emailRequired"))
      .email(t("validation.emailInvalid")),
    urlImg: UploadedFileSchema.optional(),
    healthCertificateFile: UploadedFileSchema.optional(),
    password: passwordWithSecurity(t),
    confirmPassword: passwordWithSecurity(t),
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
      .transform((val) => val.replace(/\D/g, ""))
      .refine((val) => val.length === 10, {
        message: t("validation.phoneInvalid"),
      }),
  });
}

export function CenterLocationInfoSchema(t: (key: string) => string) {
  return z.object({
    address: z.string().min(1, t("validation.addressRequired")),
    province: z.string().min(1, t("validation.provinceRequired")),
    municipality: z.string().min(1, t("validation.municipalityRequired")),
    // Distrito es opcional: distritoMunicipal puede ser null en la respuesta
    // del API de geopoint (zonas sin distrito municipal asignado).
    district: z.string().optional().or(z.literal("")),
    section: z.string().min(1, t("validation.sectionRequired")),
    neighborhood: z.string().min(1, t("validation.neighborhoodRequired")),
    subNeighborhood: z.string().optional().or(z.literal("")),
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