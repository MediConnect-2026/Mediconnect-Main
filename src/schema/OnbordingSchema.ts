import z from "zod";
import { validatePassport } from "@/utils/validatePassport";
import { ValidateDominicanID } from "@/utils/ValidateDominicanID";

export const BasePatientSchema = z.object({
  name: z.string(),
  lastName: z.string(),
  urlImg: z.instanceof(File).optional(),
  identityDocument: z.string(),
  email: z.string(),
  password: z.string(),
  confirmPassword: z.string(),
});

export function PatientOnboardingSchema(t: (key: string) => string) {
  return BasePatientSchema.extend({
    name: z.string().min(1, t("validation.nameRequired")),
    lastName: z.string().min(1, t("validation.lastNameRequired")),
    urlImg: z.string().optional(),
    identityDocument: z.string().refine(
      (val) => {
        return ValidateDominicanID(val) || validatePassport(val);
      },
      { message: t("validation.invalidIdentityDocument") }
    ),
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
    identityDocument: z.string().refine(
      (val) => {
        return ValidateDominicanID(val) || validatePassport(val);
      },
      { message: t("validation.invalidIdentityDocument") }
    ),
  });
}

export function PatientCreatePasswordSchema(t: (key: string) => string) {
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
        });
      }
    });
}
