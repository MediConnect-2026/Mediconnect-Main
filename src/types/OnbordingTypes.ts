// @/types/OnbordingTypes.ts
import { z } from "zod";
import {
  PatientOnboardingSchema,
  PatientBasicInfoSchema,
  CreatePasswordSchema,
  DoctorOnboardingSchema,
  UploadedFileSchema,
} from "@/schema/OnbordingSchema";

// Exportar tipos inferidos de Zod
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
