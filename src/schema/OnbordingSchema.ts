import z from "zod";
import { validatePassport } from "@/utils/validatePassport";
import { ValidateDominicanID } from "@/utils/ValidateDominicanID";

export function PatientOnboardingSchema(t: (key: string) => string) {
  return z
    .object({
      name: z.string().min(1, t("validation.nameRequired")),
      lastName: z.string().min(1, t("validation.lastNameRequired")),
      urlImg: z
        .instanceof(File)
        .optional()
        .refine((file) => !file || file.size <= 5 * 1024 * 1024, {
          message: "Image must be smaller than 5MB",
        })
        .refine(
          (file) =>
            !file ||
            ["image/jpeg", "image/png", "image/webp"].includes(file.type),
          { message: "Only JPG, PNG or WEBP images are allowed" }
        ),
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
