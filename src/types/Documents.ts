// ✅ Re-exportar los tipos desde el schema de Zod
// Esto asegura que los tipos siempre estén sincronizados con el schema
export type {
  UploadedFile,
  UploadedFileWithStatus,
  DoctorDocuments,
  CenterDocuments,
  DoctorPersonalInfo,
  CenterPersonalInfo,
} from "@/schema/verifyInfo.schema";

export type { verificationStatusEnum as VerificationStatusEnum } from "@/schema/verifyInfo.schema";

// ✅ Exportar el tipo de VerificationStatus desde el enum de Zod
import { z } from "zod";
import { verificationStatusEnum } from "@/schema/verifyInfo.schema";
export type VerificationStatus = z.infer<typeof verificationStatusEnum>;
