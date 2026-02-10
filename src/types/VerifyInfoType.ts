import { z } from "zod";
import { doctorPersonalInfoBaseSchema } from "@/schema/verifyInfo.schema";

export type DoctorPersonalInfo = z.infer<typeof doctorPersonalInfoBaseSchema>;
