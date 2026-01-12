// @/types/OnbordingTypes.ts
import { z } from "zod";
import {
  PatientOnboardingSchema,
  PatientBasicInfoSchema,
  CreatePasswordSchema,
  DoctorOnboardingSchema,
  UploadedFileSchema,
  DoctorBasicInfoSchema,
  DoctorProfessionalInfoSchema,
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

export type DoctorBasicInfoSchemaType = z.infer<
  ReturnType<typeof DoctorBasicInfoSchema>
>;

export type DoctorProfessionalInfoSchemaType = z.infer<
  ReturnType<typeof DoctorProfessionalInfoSchema>
>;

export type UploadedFileType = z.infer<typeof UploadedFileSchema>;
