import { z } from "zod";

// ─── Constants ────────────────────────────────────────────────────────────────

export const MAX_FILES = 10; // backend limit
export const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10 MB per file

/** Image MIME types accepted by the /citas/{id}/diagnosticar endpoint */
export const ACCEPTED_FILE_TYPES = [
  "image/jpeg",
  "image/png",
  "image/gif",
  "image/webp",
  "image/svg+xml",
];

export const ACCEPTED_FILE_EXTENSIONS = [
  ".jpg",
  ".jpeg",
  ".png",
  ".gif",
  ".webp",
  ".svg",
];

// ─── Helpers ──────────────────────────────────────────────────────────────────

export const validateFileType = (file: File): boolean =>
  ACCEPTED_FILE_TYPES.includes(file.type);

export const validateFileSize = (file: File): boolean =>
  file.size <= MAX_FILE_SIZE;

export const formatFileSize = (bytes: number): string => {
  if (bytes === 0) return "0 Bytes";
  const k = 1024;
  const sizes = ["Bytes", "KB", "MB", "GB"];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i];
};

// ─── Main prescription schema ─────────────────────────────────────────────────

/**
 * `documents` holds native `File` objects so they can be appended directly to
 * `FormData` when submitting to `POST /citas/{id}/diagnosticar`.
 * Preview URLs are created ad-hoc in the component and are never stored in the form.
 */
export function prescriptionSchema(
  t: (key: string, options?: Record<string, unknown>) => string
) {
  return z.object({
    diagnosisTitle: z
      .string()
      .min(1, t("prescription.validation.diagnosisTitleRequired"))
      .max(
        200,
        t("prescription.validation.diagnosisTitleMax", { max: 200 })
      )
      .trim(),

    diagnosisDescription: z
      .string()
      .min(1, t("prescription.validation.diagnosisDescriptionRequired"))
      .max(
        5000,
        t("prescription.validation.diagnosisDescriptionMax", { max: 5000 })
      ),

    documents: z
      .array(z.instanceof(File))
      .max(
        MAX_FILES,
        t("prescription.validation.documentsMax", { max: MAX_FILES })
      )
      .optional()
      .default([]),
  });
}

export type PrescriptionFormData = z.infer<ReturnType<typeof prescriptionSchema>>;
