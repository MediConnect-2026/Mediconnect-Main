import z from "zod";
import { prescriptionSchema } from "@/schema/prescription.schema";

// Helper para extraer tipos sin necesidad de t
type SchemaInfer<T extends (t: any) => z.ZodType> = z.infer<ReturnType<T>>;

export type Prescription = SchemaInfer<typeof prescriptionSchema>;
