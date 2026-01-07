import { z } from "zod";
import { PatientOnboardingSchema } from "@/schema/OnbordingSchema";
export type PatientOnboardingSchemaType = z.infer<
  ReturnType<typeof PatientOnboardingSchema>
>;
