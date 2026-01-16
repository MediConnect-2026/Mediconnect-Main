import { z } from "zod";
import {
  profileSchema,
  doctorProfileSchema,
  patientProfileSchema,
  centerProfileSchema,
  centerLocationSchema,
  patientInsuranceSchema,
  patientClinicalHistorySchema,
} from "@/schema/profile.schema";

// Tipos inferidos de los esquemas Zod
export type ProfileType = z.infer<ReturnType<typeof profileSchema>>;
export type DoctorProfileType = z.infer<ReturnType<typeof doctorProfileSchema>>;
export type PatientProfileType = z.infer<
  ReturnType<typeof patientProfileSchema>
>;
export type PatientClinicalHistoryType = z.infer<
  ReturnType<typeof patientClinicalHistorySchema>
>;
export type PatientInsuranceType = z.infer<
  ReturnType<typeof patientInsuranceSchema>
>;
export type CenterProfileType = z.infer<ReturnType<typeof centerProfileSchema>>;
export type CenterLocationType = z.infer<
  ReturnType<typeof centerLocationSchema>
>;
