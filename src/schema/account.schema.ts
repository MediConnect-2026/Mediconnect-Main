import { z } from "zod";

export function verifyAccountSchema(t: (key: string) => string) {
  return z.object({
    password: z.string().min(8, { message: t("validation.passwordRequired") }),
  });
}

export function changeEmailSchema(t: (key: string) => string) {
  return z.object({
    newEmail: z
      .string()
      .min(1, { message: t("validation.emailRequired") })
      .email({ message: t("validation.emailInvalid") }),
    otp: z
      .string()
      .length(6, { message: t("validation.otpLength") })
      .regex(/^\d+$/, { message: t("validation.otpNumeric") }),
  });
}

export function changePasswordSchema(t: (key: string) => string) {
  return z
    .object({
      newPassword: z.string().min(8, {
        message: t("validation.passwordMin"),
      }),
      confirmNewPassword: z
        .string()
        .min(8, { message: t("validation.confirmPasswordRequired") }),
      recoveryToken: z.string().optional(), // Token obtenido después de validar OTP
      otp: z.string().optional(), // OTP para validación
    })
    .refine((data) => data.newPassword === data.confirmNewPassword, {
      message: t("validation.passwordsDoNotMatch"),
      path: ["confirmNewPassword"],
    });
}

export function profileVisibilitySchema(t: (key: string) => string) {
  return z.object({
    visibility: z.enum(["PUBLIC", "PRIVATE", "RELATIONSHIPS_ONLY"], {
      message: t("validation.visibilityRequired"),
    }),
  });
}

export function patientPrivacyMessageSchema(t: (key: string) => string) {
  return z.object({
    consentGiven: z.boolean().refine((val) => val === true, {
      message: t("validation.privacyConsentRequired"),
    }),
  });
}

export function doctorMessageConfigSchema(t: (key: string) => string) {
  return z.object({
    patientMessage: z.enum(["WITH_APPOINTMENT", "PREVIOUS", "NONE"], {
      message: t("validation.invalidPatientMessageConfig"),
    }),
    centerMessage: z.enum(["CONNECTION_ESTABLISHED", "ANY_CENTER", "NONE"], {
      message: t("validation.invalidCenterMessageConfig"),
    }),
  });
}

export function centerMessageConfigSchema(t: (key: string) => string) {
  return z.object({
    patientMessage: z.enum(["ANY", "WITH_APPOINTMENT", "NONE"], {
      message: t("validation.invalidPatientMessageConfig"),
    }),
    doctorMessage: z.enum(["ANY", "AFFILIATED", "NONE"], {
      message: t("validation.invalidDoctorMessageConfig"),
    }),
  });
}

export function patientMessageConfigSchema(t: (key: string) => string) {
  return z.object({
    doctorMessage: z.enum(["ANY", "MY_DOCTORS", "WITH_APPOINTMENT", "NONE"], {
      message: t("validation.invalidDoctorMessageConfig"),
    }),
    centerMessage: z.enum(["ANY", "WITH_APPOINTMENT", "NONE"], {
      message: t("validation.invalidCenterMessageConfig"),
    }),
  });
}
