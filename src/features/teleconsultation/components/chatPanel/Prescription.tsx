import { useCallback, useEffect, useRef, useState } from "react";
import { Controller } from "react-hook-form";
import { useTranslation } from "react-i18next";
import { CheckCircle, AlertCircle, X, Upload, Image as ImageIcon, FileText } from "lucide-react";

import MCFormWrapper from "@/shared/components/forms/MCFormWrapper";
import MCInput from "@/shared/components/forms/MCInput";
import MCButton from "@/shared/components/forms/MCButton";
import RichTextEditor from "./RichTextEditor";
import { FileViewerModal } from "./FileViewerModal";

import { prescriptionSchema, MAX_FILES, MAX_FILE_SIZE, validateFileType, validateFileSize, formatFileSize } from "@/schema/prescription.schema";
import { usePrescriptionStore } from "@/stores/usePrescriptionStore";
import { useTeleconsultStore } from "@/stores/useTeleconsultStore";
import { diagnosticarCita } from "@/services/api/appointments.service";
import { useCitaDetails } from "@/lib/hooks/useCitaDetails";
import { useIsMobile } from "@/lib/hooks/useIsMobile";
import { cn } from "@/lib/utils";

// ─── Types ────────────────────────────────────────────────────────────────────

interface PrescriptionProps {
  minHeight?: string;
  maxHeight?: string;
  /** ID de la cita para el flujo presencial. Tiene prioridad sobre el store de teleconsulta. */
  appointmentId?: string;
  /** Callback invocado tras un envío exitoso (p. ej. para redirigir). */
  onSuccess?: () => void;
}

interface FilePreview {
  file: File;
  /** Object URL for <img> previews. Revoked on component unmount or file removal. */
  objectUrl: string;
}

interface ViewerModalState {
  open: boolean;
  content: string;
  type: "image" | "file";
  fileName?: string;
  fileType?: string;
}

type SubmitStatus = "idle" | "loading" | "success" | "error";

// ─── Component ────────────────────────────────────────────────────────────────

function Prescription({ minHeight, maxHeight, appointmentId: appointmentIdProp, onSuccess }: PrescriptionProps) {
  const { t } = useTranslation("common");
  const isMobile = useIsMobile();

  // Store
  const addPrescription = usePrescriptionStore((s) => s.addPrescription);
  const clearPrescription = usePrescriptionStore((s) => s.clearPrescription);
  const prescription = usePrescriptionStore((s) => s.prescription);
  const activeAppointmentIdFromStore = useTeleconsultStore((s) => s.activeAppointmentId);
  const activeAppointmentId = appointmentIdProp ?? activeAppointmentIdFromStore;

  // Appointment status
  const { rawStatus, loading: loadingCita } = useCitaDetails(activeAppointmentId ?? undefined);
  const isCitaInProgress = rawStatus === "in_progress";

  // Local state
  const [filePreviews, setFilePreviews] = useState<FilePreview[]>([]);
  const [isDragging, setIsDragging] = useState(false);
  const [submitStatus, setSubmitStatus] = useState<SubmitStatus>("idle");
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [fileErrors, setFileErrors] = useState<string[]>([]);
  const [viewerModal, setViewerModal] = useState<ViewerModalState>({
    open: false,
    content: "",
    type: "file",
    fileName: "",
    fileType: "",
  });

  // Clean up all object URLs on unmount to prevent memory leaks
  const filePreviewsRef = useRef(filePreviews);
  useEffect(() => {
    filePreviewsRef.current = filePreviews;
  }, [filePreviews]);

  useEffect(() => {
    return () => {
      filePreviewsRef.current.forEach((fp) => URL.revokeObjectURL(fp.objectUrl));
    };
  }, []);

  // ─── File handlers ──────────────────────────────────────────────────────────

  const validateFiles = useCallback((incoming: File[]): { valid: File[]; errors: string[] } => {
    const valid: File[] = [];
    const errors: string[] = [];

    for (const file of incoming) {
      if (!validateFileType(file)) {
        errors.push(
          t("prescription.validation.fileTypeInvalid", { fileName: file.name })
        );
        continue;
      }
      if (!validateFileSize(file)) {
        errors.push(
          t("prescription.validation.fileSizeExceeded", {
            fileName: file.name,
            maxSize: formatFileSize(MAX_FILE_SIZE),
          })
        );
        continue;
      }
      valid.push(file);
    }

    return { valid, errors };
  }, [t]);

  const addFiles = useCallback(
    (incoming: File[], onChange: (files: File[]) => void) => {
      setFileErrors([]);
      const { valid, errors } = validateFiles(incoming);
      if (errors.length) setFileErrors(errors);
      if (!valid.length) return;

      setFilePreviews((prev) => {
        const remaining = MAX_FILES - prev.length;
        if (remaining <= 0) return prev;

        const toAdd = valid.slice(0, remaining);
        const newPreviews: FilePreview[] = toAdd.map((file) => ({
          file,
          objectUrl: URL.createObjectURL(file),
        }));

        const updated = [...prev, ...newPreviews];
        onChange(updated.map((fp) => fp.file));
        return updated;
      });
    },
    [validateFiles],
  );

  const removeFile = useCallback(
    (index: number, onChange: (files: File[]) => void) => {
      setFilePreviews((prev) => {
        URL.revokeObjectURL(prev[index].objectUrl);
        const updated = prev.filter((_, i) => i !== index);
        onChange(updated.map((fp) => fp.file));
        return updated;
      });
    },
    [],
  );

  const openFilePreview = useCallback((filePreview: FilePreview) => {
    const fileType = filePreview.file.type || "";
    const isImage = fileType.startsWith("image/");

    setViewerModal({
      open: true,
      content: filePreview.objectUrl,
      type: isImage ? "image" : "file",
      fileName: filePreview.file.name,
      fileType: fileType.includes("pdf") ? "pdf" : "other",
    });
  }, []);

  const handleDownloadFile = useCallback((url: string, fileName: string) => {
    const anchor = document.createElement("a");
    anchor.href = url;
    anchor.download = fileName;
    anchor.target = "_blank";
    document.body.appendChild(anchor);
    anchor.click();
    document.body.removeChild(anchor);
  }, []);

  const getFileIcon = useCallback((fileType: string) => {
    if (fileType === "pdf") return "PDF";
    return "FILE";
  }, []);

  // ─── Drag & Drop ────────────────────────────────────────────────────────────

  const handleDragEnter = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
  }, []);

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
  }, []);

  const handleDrop = useCallback(
    (e: React.DragEvent, onChange: (files: File[]) => void) => {
      e.preventDefault();
      e.stopPropagation();
      setIsDragging(false);
      addFiles(Array.from(e.dataTransfer.files), onChange);
    },
    [addFiles],
  );

  // ─── Form submit ─────────────────────────────────────────────────────────────

  const handleSubmit = useCallback(
    async (formData: { diagnosisTitle: string; diagnosisDescription: string; documents?: File[] }) => {
      if (!activeAppointmentId) return;

      setSubmitStatus("loading");
      setErrorMessage(null);

      try {
        await diagnosticarCita(activeAppointmentId, {
          nombreDiagnostico: formData.diagnosisTitle,
          descripcionDiagnostico: formData.diagnosisDescription,
          archivos: formData.documents ?? [],
        });

        // Persist to store for downstream consumers
        addPrescription(formData as any);

        setSubmitStatus("success");

        // Reset after 3 s, then invoke optional callback
        setTimeout(() => {
          setSubmitStatus("idle");
          clearPrescription();
          setFilePreviews((prev) => {
            prev.forEach((fp) => URL.revokeObjectURL(fp.objectUrl));
            return [];
          });
          onSuccess?.();
        }, 3000);


      } catch (err: unknown) {
        const message =
          err instanceof Error
            ? err.message
            : t("prescription.status.submitError");
        setErrorMessage(message);
        setSubmitStatus("error");
      }
    },
    [activeAppointmentId, addPrescription, clearPrescription, onSuccess, t],
  );

  // ─── Render ──────────────────────────────────────────────────────────────────

  const isAtLimit = filePreviews.length >= MAX_FILES;
  const isSubmitting = submitStatus === "loading";

  return (
    <div className="flex flex-col h-full w-full rounded-xl md:rounded-2xl overflow-hidden overflow-y-auto">
      <MCFormWrapper schema={prescriptionSchema(t)} onSubmit={handleSubmit}>
        <div className="flex flex-col gap-3 md:gap-4 p-3 md:p-4 overflow-y-auto h-full w-full items-center">
          <div className="flex flex-col gap-3 md:gap-4 flex-1 overflow-y-auto w-full max-w-3xl px-1">

            {/* ── Diagnosis Title ── */}
            <MCInput
              name="diagnosisTitle"
              label={t("prescription.diagnosisTittle")}
              placeholder={t("prescription.diagnosisTittlePlaceholder")}
              value={prescription?.diagnosisTitle || ""}
              size="medium"
              disabled={loadingCita || !isCitaInProgress || isSubmitting}
            />

            {/* ── Diagnosis Description (Rich Text) ── */}
            <Controller
              name="diagnosisDescription"
              defaultValue={prescription?.diagnosisDescription || ""}
              render={({ field, fieldState }) => (
                <RichTextEditor
                  value={field.value}
                  onChange={field.onChange}
                  label={t("prescription.diagnosisDescription")}
                  placeholder={t("prescription.diagnosisDescriptionPlaceholder")}
                  error={fieldState.error?.message}
                  minHeight={minHeight}
                  maxHeight={maxHeight}
                  disabled={loadingCita || !isCitaInProgress || isSubmitting}
                />
              )}
            />

            {/* ── File Upload Area ── */}
            <Controller
              name="documents"
              defaultValue={[]}
              render={({ field, fieldState }) => (
                <div className="flex flex-col gap-2">
                  <label className="block text-sm md:text-base lg:text-lg text-primary font-medium">
                    {t("prescription.documents")}
                    <span className="text-primary/50 font-normal text-xs md:text-sm ml-2">
                      {t("prescription.maxImagesHint", { max: MAX_FILES })}
                    </span>
                  </label>

                  {/* Drop Zone */}
                  <div
                    onDragEnter={handleDragEnter}
                    onDragLeave={handleDragLeave}
                    onDragOver={handleDragOver}
                    onDrop={(e) => handleDrop(e, field.onChange)}
                    className={cn(
                      "relative border-2 border-dashed rounded-lg p-3 md:p-4 text-center",
                      "transition-all duration-200",
                      isAtLimit
                        ? "opacity-50 cursor-not-allowed border-primary/10"
                        : "cursor-pointer",
                      isDragging && !isAtLimit
                        ? "border-primary bg-primary/5"
                        : "border-primary/15 hover:border-primary/50 bg-bg-btn-secondary",
                    )}
                  >
                    <input
                      type="file"
                      multiple
                      accept="image/*,.pdf,application/pdf"
                      disabled={isAtLimit || isSubmitting || loadingCita || !isCitaInProgress}
                      onClick={(e) => {
                        // Allow re-selecting the same file after removing it.
                        e.currentTarget.value = "";
                      }}
                      onChange={(e) => {
                        addFiles(Array.from(e.target.files ?? []), field.onChange);
                        e.currentTarget.value = "";
                      }}
                      className="absolute inset-0 w-full h-full opacity-0 cursor-pointer disabled:cursor-not-allowed"
                    />

                    <div className="flex flex-col items-center gap-1 pointer-events-none">
                      <Upload className="w-6 h-6 md:w-7 md:h-7 text-primary" />
                      <p className="text-xs md:text-sm font-medium text-primary">
                        {isMobile
                          ? t("prescription.uploadHintMobile")
                          : t("prescription.uploadHintDesktop")}
                      </p>
                      <p className="text-[10px] md:text-xs text-primary/75">
                        {t("prescription.uploadFormats")}
                      </p>
                      {isAtLimit && (
                        <span className="text-xs text-amber-500 mt-0.5">
                          {t("prescription.validation.maxReached", {
                            max: MAX_FILES,
                          })}
                        </span>
                      )}
                    </div>
                  </div>

                  {/* File validation errors */}
                  {fileErrors.length > 0 && (
                    <ul className="space-y-0.5">
                      {fileErrors.map((err, i) => (
                        <li key={i} className="text-xs text-red-500 flex items-start gap-1">
                          <AlertCircle className="w-3 h-3 mt-0.5 shrink-0" />
                          {err}
                        </li>
                      ))}
                    </ul>
                  )}

                  {/* Field-level schema error */}
                  {fieldState.error && (
                    <p className="text-xs text-red-500">{fieldState.error.message}</p>
                  )}

                  {/* Image Previews Grid */}
                  {filePreviews.length > 0 && (
                    <div className="mt-1">
                      <p className="text-xs md:text-sm text-primary/70 mb-2">
                        {t("prescription.imagesAttached", {
                          count: filePreviews.length,
                        })}
                      </p>
                      <div className="border bg-primary/10 rounded-lg p-2 md:p-3">
                        <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-3 lg:grid-cols-5 gap-2 md:gap-3">
                          {filePreviews.map((fp, idx) => (
                            <div
                              key={fp.objectUrl}
                              onClick={() => openFilePreview(fp)}
                              onKeyDown={(e) => {
                                if (e.key === "Enter" || e.key === " ") {
                                  e.preventDefault();
                                  openFilePreview(fp);
                                }
                              }}
                              role="button"
                              tabIndex={0}
                              className="relative group aspect-square border-2 border-primary/15 rounded-lg overflow-hidden bg-bg-btn-secondary hover:border-primary transition-colors"
                            >
                              {/* Remove button */}
                              <button
                                type="button"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  removeFile(idx, field.onChange);
                                }}
                                disabled={isSubmitting}
                                className="absolute top-1 right-1 z-10 bg-red-500 hover:bg-red-600 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity shadow-md disabled:pointer-events-none"
                                aria-label={t("prescription.removeImageAria")}
                              >
                                <X className="w-2.5 h-2.5 md:w-3 md:h-3" />
                              </button>

                              {/* Preview */}
                              <div className="w-full h-full flex items-center justify-center">
                                {fp.file.type.startsWith("image/") ? (
                                  <img
                                    src={fp.objectUrl}
                                    alt={fp.file.name}
                                    loading="lazy"
                                    className="object-cover w-full h-full rounded-lg"
                                  />
                                ) : fp.file.type === "application/pdf" ? (
                                  <>
                                    <object
                                      data={fp.objectUrl}
                                      type="application/pdf"
                                      aria-label={fp.file.name}
                                      className="w-full h-full"
                                    >
                                      <div className="w-full h-full flex flex-col items-center justify-center gap-1 p-2 text-center">
                                        <FileText className="w-5 h-5 md:w-6 md:h-6 text-primary/60" />
                                        <p className="text-[10px] md:text-xs text-primary/70 line-clamp-2 break-all">
                                          {fp.file.name}
                                        </p>
                                      </div>
                                    </object>
                                    <span className="absolute top-1 left-1 z-10 bg-red-600 text-white text-[9px] px-1.5 py-0.5 rounded">
                                      PDF
                                    </span>
                                  </>
                                ) : (
                                  <ImageIcon className="w-5 h-5 md:w-6 md:h-6 text-primary/60" />
                                )}
                              </div>

                              {/* File size badge */}
                              <div className="absolute bottom-0 inset-x-0 bg-black/50 text-white text-[9px] text-center py-0.5 opacity-0 group-hover:opacity-100 transition-opacity truncate px-1">
                                {formatFileSize(fp.file.size)}
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              )}
            />

            {/* ── No active appointment warning ── */}
            {!activeAppointmentId && (
              <div className="flex items-center gap-2 rounded-lg bg-amber-500/10 border border-amber-500/30 px-3 py-2 text-xs md:text-sm text-amber-600">
                <AlertCircle className="w-4 h-4 shrink-0" />
                {t("prescription.status.noActiveAppointment")}
              </div>
            )}

            {/* ── Not in progress appointment warning ── */}
            {activeAppointmentId && !loadingCita && !isCitaInProgress && (
              <div className="flex items-center gap-2 rounded-lg bg-amber-500/10 border border-amber-500/30 px-3 py-2 text-xs md:text-sm text-amber-600">
                <AlertCircle className="w-4 h-4 shrink-0" />
                {t("prescription.status.notInProgress")}
              </div>
            )}

            {/* ── Submit feedback ── */}
            {submitStatus === "success" && (
              <div className="flex items-center gap-2 rounded-lg bg-green-500/10 border border-green-500/30 px-3 py-2 text-xs md:text-sm text-green-600">
                <CheckCircle className="w-4 h-4 shrink-0" />
                {t("prescription.status.submitSuccess")}
              </div>
            )}

            {submitStatus === "error" && errorMessage && (
              <div className="flex items-center gap-2 rounded-lg bg-red-500/10 border border-red-500/30 px-3 py-2 text-xs md:text-sm text-red-600">
                <AlertCircle className="w-4 h-4 shrink-0" />
                {errorMessage}
              </div>
            )}

            {/* ── Submit Button ── */}
            <MCButton
              type="submit"
              size="l"
              className="w-full md:w-auto"
              disabled={!activeAppointmentId || loadingCita || !isCitaInProgress || isSubmitting}
            >
              {isSubmitting
                ? t("prescription.status.submitting")
                : t("prescription.submit")}
            </MCButton>
          </div>
        </div>
      </MCFormWrapper>

      <FileViewerModal
        viewerModal={viewerModal}
        onOpenChange={(open) => setViewerModal((prev) => ({ ...prev, open }))}
        onDownloadFile={handleDownloadFile}
        getFileIcon={getFileIcon}
      />
    </div>
  );
}

export default Prescription;
