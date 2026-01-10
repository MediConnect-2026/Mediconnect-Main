import { z } from "zod";

// Schema para archivos subidos
export const UploadedFileSchema = z.object({
  url: z.string(),
  name: z.string().optional(),
  type: z.string(), // "image" | "pdf"
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
  urlImg: z.string().optional(),
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
  urlImg: z.string().optional(),
  identityDocumentFile: UploadedFileSchema.optional(),
  certifications: z.array(UploadedFileSchema).optional(),
  academicTitle: UploadedFileSchema.optional(),
  password: z.string(),
  confirmPassword: z.string(),
});

// Patient schemas con validaciones
export function PatientOnboardingSchema(t: (key: string) => string) {
  return BasePatientSchema.extend({
    name: z.string().min(1, t("validation.nameRequired")),
    lastName: z.string().min(1, t("validation.lastNameRequired")),
    identityDocument: z
      .string()
      .min(1, t("validation.identityDocumentRequired")),
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
    email: true,
  }).extend({
    name: z.string().min(1, t("validation.nameRequired")),
    lastName: z.string().min(1, t("validation.lastNameRequired")),
    identityDocument: z
      .string()
      .min(1, t("validation.identityDocumentRequired")),
    email: z
      .string()
      .min(1, t("validation.emailRequired"))
      .email(t("validation.emailInvalid")),
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

// Doctor schema con validaciones
export function DoctorOnboardingSchema(t: (key: string) => string) {
  return BaseDoctorSchema.extend({
    name: z.string().min(1, t("validation.nameRequired")),
    lastName: z.string().min(1, t("validation.lastNameRequired")),
    gender: z.string().min(1, t("validation.genderRequired")),
    birthDate: z.string().min(1, t("validation.birthDateRequired")),
    nationality: z.string().min(1, t("validation.nationalityRequired")),
    identityDocument: z
      .string()
      .min(1, t("validation.identityDocumentRequired")),
    exequatur: z.string().min(1, t("validation.exequaturRequired")),
    mainSpecialty: z.string().min(1, t("validation.mainSpecialtyRequired")),
    secondarySpecialties: z.array(z.string()).optional(),
    phone: z.string().min(1, t("validation.phoneRequired")),
    email: z
      .string()
      .min(1, t("validation.emailRequired"))
      .email(t("validation.emailInvalid")),
    urlImg: z.string().optional(),
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
