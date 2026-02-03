import { z } from "zod";

// Document schema for uploaded files
export const documentSchema = (t: (key: string) => string) =>
  z.object({
    id: z.string(),
    name: z.string().min(1, t("prescription.documentNameRequired")),
    url: z.string().url(t("prescription.documentUrlInvalid")),
    type: z.string(),
    size: z.number().max(10 * 1024 * 1024, t("prescription.documentSizeMax")),
    uploadedAt: z.date(),
  });

export type DocumentFile = z.infer<ReturnType<typeof documentSchema>>;

// Main prescription schema
export function prescriptionSchema(t: (key: string) => string) {
  return z.object({
    diagnosisTitle: z
      .string()
      .min(1, t("prescription.diagnosisTitleRequired"))
      .max(200, t("prescription.diagnosisTitleMax"))
      .trim(),
    diagnosisDescription: z
      .string()
      .min(1, t("prescription.diagnosisDescriptionRequired"))
      .max(5000, t("prescription.diagnosisDescriptionMax")),
    documents: z
      .array(documentSchema(t))
      .max(5, t("prescription.documentsMax"))
      .optional()
      .default([]),
  });
}

export type PrescriptionFormData = z.infer<
  ReturnType<typeof prescriptionSchema>
>;

// File type validation helper
export const ACCEPTED_FILE_TYPES = [
  "image/jpeg",
  "image/png",
  "image/gif",
  "image/webp",
  "application/pdf",
  "application/msword",
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
];

export const ACCEPTED_FILE_EXTENSIONS = [
  ".jpg",
  ".jpeg",
  ".png",
  ".gif",
  ".webp",
  ".pdf",
  ".doc",
  ".docx",
];

export const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB
export const MAX_FILES = 5;

export const validateFileType = (file: File): boolean => {
  return ACCEPTED_FILE_TYPES.includes(file.type);
};

export const validateFileSize = (file: File): boolean => {
  return file.size <= MAX_FILE_SIZE;
};

export const formatFileSize = (bytes: number): string => {
  if (bytes === 0) return "0 Bytes";
  const k = 1024;
  const sizes = ["Bytes", "KB", "MB", "GB"];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i];
};
