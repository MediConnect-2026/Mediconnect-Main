import { z } from "zod";
import {
  LoginSchema,
  ForgotPasswordSchema,
  OtpSchema,
  ResetPasswordSchema,
} from "@/schema/AuthSchema";
export type LoginSchemaType = z.infer<ReturnType<typeof LoginSchema>>;
export type ForgotPasswordSchemaType = z.infer<
  ReturnType<typeof ForgotPasswordSchema>
>;
export type OtpSchemaType = z.infer<ReturnType<typeof OtpSchema>>;
export type ResetPasswordSchemaType = z.infer<
  ReturnType<typeof ResetPasswordSchema>
>;
