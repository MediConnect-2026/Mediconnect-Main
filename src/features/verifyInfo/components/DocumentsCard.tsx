import { useState, useRef } from "react";
import {
  Upload,
  X,
  FileText,
  Plus,
  Trash2,
  Eye,
  Send,
  AlertTriangle,
  XCircle,
} from "lucide-react";
import type { UploadedFileWithStatus, UploadedFile } from "@/types/Documents";
import StatusBadge from "./Statusbadge";
import { type VerificationStatus, STATUS } from "./Verificationconstants";
import MCButton from "@/shared/components/forms/MCButton";
import DocumentIcon from "./DocumentIcon";
import { ImageCarouselModal } from "@/features/doctor/components/healthService/ImageCarouselModal";
import PreviewDocumentsDialog from "@/features/patient/components/appoiments/PreviewDocumentsDialog";
import { useTranslation } from "react-i18next";
import { useIsMobile } from "@/lib/hooks/useIsMobile";

interface DocumentCardProps {
  title: string;
  document?: UploadedFileWithStatus;
  documents?: UploadedFile[];
  onResubmit?: (file: File) => void;
  onUpdateArray?: (files: UploadedFile[]) => void;
  isArray?: boolean;
  maxFiles?: number;
  onView?: () => void;
  arrayParentStatus?: VerificationStatus;
  arrayParentFeedback?: string;
  onSubmitAll?: () => void;
  onCancelAll?: () => void;
}

const formatDate = () => {
  const now = new Date();
  const months = [
    "Ene",
    "Feb",
    "Mar",
    "Abr",
    "May",
    "Jun",
    "Jul",
    "Ago",
    "Sep",
    "Oct",
    "Nov",
    "Dic",
  ];
  return `Subido el ${now.getDate()} ${months[now.getMonth()]} ${now.getFullYear()}`;
};

export default function DocumentCard({
  title,
  document,
  documents = [],
  onResubmit,
  onUpdateArray,
  isArray = false,
  maxFiles = 5,

  arrayParentStatus,
  arrayParentFeedback,
  onSubmitAll,
  onCancelAll,
}: DocumentCardProps) {
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const [previewUrls, setPreviewUrls] = useState<string[]>([]);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [carouselOpen, setCarouselOpen] = useState(false);
  const [carouselStartIndex, setCarouselStartIndex] = useState(0);

  const { t } = useTranslation("common");
  const isMobile = useIsMobile();

  // ...existing code...

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    if (!files.length) return;

    if (isArray) {
      // Calcula cuántos archivos puedes agregar sin exceder el máximo total
      const remainingSlots = maxFiles - documents.length;
      if (remainingSlots <= 0) return; // No se pueden agregar más archivos

      // Solo toma los archivos necesarios para no exceder el máximo
      const filesToAdd = files.slice(0, remainingSlots);

      setSelectedFiles((prev) => {
        // Asegura que el total nunca exceda maxFiles
        const totalExisting = documents.length;
        const maxNewFiles = maxFiles - totalExisting;
        return [...prev, ...filesToAdd].slice(0, maxNewFiles);
      });

      const newPreviewUrls: string[] = [];
      filesToAdd.forEach((file) => {
        if (file.type.startsWith("image/")) {
          newPreviewUrls.push(URL.createObjectURL(file));
        } else {
          newPreviewUrls.push("");
        }
      });

      setPreviewUrls((prev) => {
        const totalExisting = documents.length;
        const maxNewPreviews = maxFiles - totalExisting;
        return [...prev, ...newPreviewUrls].slice(0, maxNewPreviews);
      });
    } else {
      const file = files[0];
      setSelectedFiles([file]);

      if (file.type.startsWith("image/")) {
        setPreviewUrls([URL.createObjectURL(file)]);
      } else {
        setPreviewUrls([""]);
      }
    }
  };

  const handleRemoveSelectedFile = (index: number) => {
    const urlToRevoke = previewUrls[index];
    if (urlToRevoke) {
      URL.revokeObjectURL(urlToRevoke);
    }

    setSelectedFiles((prev) => prev.filter((_, i) => i !== index));
    setPreviewUrls((prev) => prev.filter((_, i) => i !== index));
  };

  const handleRemoveAllSelected = () => {
    previewUrls.forEach((url) => {
      if (url) URL.revokeObjectURL(url);
    });
    setSelectedFiles([]);
    setPreviewUrls([]);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const handleConfirmSubmit = () => {
    if (isArray && onUpdateArray && selectedFiles.length > 0) {
      const newDocuments: UploadedFile[] = selectedFiles.map((file) => ({
        url: URL.createObjectURL(file),
        name: file.name,
        type: file.type,
        size: file.size,
        uploadedAt: formatDate(),
      }));

      onUpdateArray([...documents, ...newDocuments]);
      handleRemoveAllSelected();
    } else if (!isArray && onResubmit && selectedFiles[0]) {
      onResubmit(selectedFiles[0]);
      handleRemoveAllSelected();
    }
  };

  const handleRemoveExistingDocument = (index: number) => {
    if (isArray && onUpdateArray) {
      const updatedDocuments = documents.filter((_, i) => i !== index);
      onUpdateArray(updatedDocuments);
    }
  };

  const formatFileSize = (bytes: number) => {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  };

  const getOverallStatus = (): VerificationStatus => {
    if (isArray) {
      return arrayParentStatus || "PENDING";
    }
    return document?.verificationStatus || "PENDING";
  };

  const borderColorByStatus: Record<VerificationStatus, string> = {
    APPROVED: "border-[#2E7D32]/40",
    PENDING: "border-[#C77A1F]/40",
    REJECTED: "border-[#C62828]/40",
  };

  const currentStatus = getOverallStatus();
  const currentDocument = isArray ? null : document;
  const currentDocuments = isArray ? documents : [];

  const feedbackColorClass =
    currentStatus === "APPROVED"
      ? "text-status-approved"
      : currentStatus === "REJECTED"
        ? "text-status-rejected"
        : "text-status-pending";

  const imageDocuments = isArray
    ? documents.filter((doc) => doc.type.startsWith("image/"))
    : document && document.type.startsWith("image/")
      ? [document]
      : [];

  return (
    <div
      className={`rounded-2xl md:rounded-3xl border ${borderColorByStatus[currentStatus]} p-3 md:p-5 space-y-3 md:space-y-4`}
    >
      {/* Header */}
      <div className="flex items-start gap-3 md:gap-4">
        <div className="hidden md:block">
          <DocumentIcon status={currentStatus} />
        </div>

        <div className="flex-1 min-w-0">
          <h3 className="text-base md:text-lg font-semibold text-foreground">
            {title}
          </h3>
          {/* StatusBadge debajo del título en mobile */}
          <div className="mt-2 mb-1 md:hidden">
            <StatusBadge
              label={STATUS[currentStatus].label}
              color={STATUS[currentStatus].color}
            />
          </div>
          {isArray ? (
            <>
              <p className="text-sm text-muted-foreground mt-0.5">
                {t("verification.documentsSection.filesUploaded", {
                  count: documents.length,
                  max: maxFiles,
                })}
              </p>
              {arrayParentFeedback && (
                <p className={`text-sm mt-1.5 ${feedbackColorClass}`}>
                  {arrayParentFeedback}
                </p>
              )}
            </>
          ) : (
            <>
              <p className="text-sm text-muted-foreground mt-0.5">
                {currentDocument?.name || "documento.pdf"}
                <span className="mx-2">•</span>
                {formatFileSize(currentDocument?.size || 0)}
                <span className="mx-2">•</span>
                {currentDocument?.uploadedAt ||
                  t("verification.documentsSection.uploadedOn", {
                    date: "15 Oct 2025",
                  })}
              </p>
              {currentDocument?.feedback && (
                <p className={`text-sm mt-1.5 ${feedbackColorClass}`}>
                  {currentDocument.feedback}
                </p>
              )}
            </>
          )}
        </div>

        {/* StatusBadge a la derecha solo en desktop */}
        <div className="hidden md:flex flex-shrink-0 items-center">
          <StatusBadge
            label={t(`verification.status.${currentStatus.toLowerCase()}`)}
            color={STATUS[currentStatus].color}
          />
        </div>
      </div>

      {/* Lista de documentos existentes para arrays */}
      {isArray && currentDocuments.length > 0 && (
        <div className="space-y-2 md:space-y-3">
          {currentDocuments.map((doc, index) => (
            <div
              key={index}
              className="rounded-lg md:rounded-xl border border-primary/15 p-3 md:p-4"
            >
              <div className="flex items-start gap-2 md:gap-3">
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-foreground truncate">
                    {doc.name}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    {formatFileSize(doc.size)} • {doc.uploadedAt}
                  </p>

                  {/* Preview para imágenes */}
                  {doc.type.startsWith("image/") && (
                    <img
                      src={doc.url}
                      alt={doc.name}
                      className="w-12 h-12 md:w-16 md:h-16 rounded-lg object-cover cursor-pointer border mt-2"
                      onClick={() => {
                        setCarouselStartIndex(
                          imageDocuments.findIndex((d) => d.url === doc.url),
                        );
                        setCarouselOpen(true);
                      }}
                    />
                  )}

                  {/* Botón para ver PDFs */}
                  {!doc.type.startsWith("image/") && (
                    <PreviewDocumentsDialog
                      documentUrl={doc.url}
                      documentType={doc.type}
                      documentName={doc.name}
                    >
                      <button className="mt-2 flex items-center gap-2 px-2 md:px-3 py-1 md:py-1.5 rounded-lg bg-primary/10 hover:bg-primary/20 transition-colors text-xs md:text-sm font-medium text-primary">
                        <Eye className="w-3 h-3 md:w-4 md:h-4" />
                        {t("verification.documentsSection.viewDocument")}
                      </button>
                    </PreviewDocumentsDialog>
                  )}
                </div>

                {/* Botón eliminar SOLO si el PADRE está RECHAZADO */}
                {currentStatus === "REJECTED" && (
                  <button
                    onClick={() => handleRemoveExistingDocument(index)}
                    className="p-1.5 rounded-lg hover:bg-muted transition-colors text-muted-foreground hover:text-red-600 flex-shrink-0"
                    aria-label={t("verification.documentsSection.removeFile")}
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Nuevos botones de acción para arrays con documentos y estado REJECTED */}
      {isArray &&
        currentStatus === "REJECTED" &&
        currentDocuments.length > 0 &&
        !selectedFiles.length && (
          <div className="rounded-2xl md:rounded-3xl border border-primary/15 p-3 md:p-4 space-y-3">
            <div className="flex items-center gap-2 text-destructive">
              <AlertTriangle className="w-4 h-4 md:w-5 md:h-5 flex-shrink-0" />
              <p className="font-medium text-sm md:text-base">
                {t("verification.documentsSection.actionsAvailable")}
              </p>
            </div>
            <p className="text-sm text-destructive">
              {t("verification.documentsSection.actionsDescription")}
            </p>
            <div className="flex flex-col gap-2 mt-4">
              <MCButton
                onClick={onSubmitAll}
                className="w-full"
                size={isMobile ? "sm" : "ml"}
              >
                {t("verification.documentsSection.submitAllForReview")}
              </MCButton>

              <MCButton
                onClick={onCancelAll}
                variant="outlineDelete"
                className="w-full"
                size={isMobile ? "sm" : "ml"}
              >
                {t("verification.documentsSection.cancelAll")}
              </MCButton>
            </div>
          </div>
        )}

      {/* Modal de vista previa tipo carrusel para imágenes */}
      <ImageCarouselModal
        images={imageDocuments.map((doc) => doc.url)}
        open={carouselOpen}
        onClose={() => setCarouselOpen(false)}
        startIndex={carouselStartIndex}
      />

      {/* Vista previa de archivos seleccionados */}
      {selectedFiles.length > 0 && (
        <div className="rounded-xl border border-primary/15 bg-muted/30 p-3 md:p-4 space-y-3">
          <div className="space-y-2 md:space-y-3">
            {selectedFiles.map((file, index) => (
              <div key={index} className="flex items-center gap-2 md:gap-3">
                {previewUrls[index] ? (
                  <img
                    src={previewUrls[index]}
                    alt="Vista previa"
                    className="w-12 h-12 md:w-14 md:h-14 rounded-lg object-cover border border-primary/15 flex-shrink-0"
                  />
                ) : (
                  <div className="w-12 h-12 md:w-14 md:h-14 rounded-lg bg-status-pending-bg flex items-center justify-center flex-shrink-0">
                    <FileText className="w-6 h-6 md:w-7 md:h-7 text-status-pending" />
                  </div>
                )}
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-foreground truncate">
                    {file.name}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    {formatFileSize(file.size)}
                  </p>
                </div>
                <button
                  onClick={() => handleRemoveSelectedFile(index)}
                  className="p-1.5 rounded-lg hover:bg-muted transition-colors text-muted-foreground hover:text-foreground flex-shrink-0"
                  aria-label={t("verification.documentsSection.removeFile")}
                >
                  <X className="w-4 h-4 md:w-5 md:h-5" />
                </button>
              </div>
            ))}
          </div>

          <p className="text-sm text-red-600 font-medium">
            {t("verification.documentsSection.warningCannotChange", {
              fileType:
                isArray && selectedFiles.length > 1
                  ? t(
                      "verification.documentsSection.warningCannotChangeMultiple",
                    )
                  : t(
                      "verification.documentsSection.warningCannotChangeSingle",
                    ),
            })}
          </p>

          <div className="flex flex-col md:flex-row gap-2">
            <MCButton
              onClick={() => fileInputRef.current?.click()}
              variant="outline"
              className="flex-1"
              size={isMobile ? "sm" : "sm"}
            >
              {isArray
                ? t("verification.documentsSection.addMore")
                : t("verification.documentsSection.changeFile")}
            </MCButton>
            <MCButton
              className="flex-1"
              onClick={handleConfirmSubmit}
              size={isMobile ? "sm" : "sm"}
            >
              <Upload className="w-4 h-4" />
              {isArray && selectedFiles.length > 1
                ? t("verification.documentsSection.sendMultiple", {
                    count: selectedFiles.length,
                  })
                : t("verification.documentsSection.send")}
            </MCButton>
          </div>
        </div>
      )}

      {/* Botón para agregar archivos o resubmitir */}
      {!selectedFiles.length && (
        <>
          {isArray
            ? // Solo permitir agregar si está RECHAZADO o si no hay documentos aún
              (currentStatus === "REJECTED" || currentDocuments.length === 0) &&
              currentDocuments.length < maxFiles && (
                <button
                  onClick={() => {
                    // Limita la selección a máximo 5 archivos en total
                    if (
                      currentDocuments.length + selectedFiles.length <
                      maxFiles
                    ) {
                      fileInputRef.current?.click();
                    }
                  }}
                  className="w-full flex items-center justify-center gap-2 py-2.5 md:py-3 rounded-xl border border-dashed border-primary/30 bg-bg-secondary text-foreground font-medium hover:bg-muted transition-colors text-sm md:text-base"
                >
                  <Plus className="w-4 h-4 md:w-5 md:h-5" />
                  {currentStatus === "REJECTED"
                    ? t(
                        "verification.documentsSection.resubmitCertifications",
                        {
                          current: currentDocuments.length,
                          max: maxFiles,
                        },
                      )
                    : t("verification.documentsSection.addCertifications", {
                        current: currentDocuments.length,
                        max: maxFiles,
                      })}
                </button>
              )
            : currentDocument?.verificationStatus === "REJECTED" &&
              onResubmit && (
                <button
                  onClick={() => fileInputRef.current?.click()}
                  className="w-full flex items-center justify-center gap-2 py-2.5 md:py-3 rounded-xl border border-primary/15 bg-bg-secondary text-foreground font-medium hover:bg-muted transition-colors text-sm md:text-base"
                >
                  <Upload className="w-4 h-4 md:w-5 md:h-5" />
                  {t("verification.documentsSection.resubmit")}
                </button>
              )}
        </>
      )}

      <input
        ref={fileInputRef}
        type="file"
        className="hidden"
        accept=".pdf,.jpg,.jpeg,.png,.webp"
        multiple={isArray}
        onChange={handleFileSelect}
      />
    </div>
  );
}
