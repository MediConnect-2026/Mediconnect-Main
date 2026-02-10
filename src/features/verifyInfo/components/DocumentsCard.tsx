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
  maxFiles = 10,
  onView,
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

  // ...existing code...

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    if (!files.length) return;

    if (isArray) {
      const remainingSlots = maxFiles - documents.length - selectedFiles.length;
      const filesToAdd = files.slice(0, remainingSlots);

      setSelectedFiles((prev) => [...prev, ...filesToAdd]);

      const newPreviewUrls: string[] = [];
      filesToAdd.forEach((file) => {
        if (file.type.startsWith("image/")) {
          newPreviewUrls.push(URL.createObjectURL(file));
        } else {
          newPreviewUrls.push("");
        }
      });
      setPreviewUrls((prev) => [...prev, ...newPreviewUrls]);
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
      className={`rounded-3xl border ${borderColorByStatus[currentStatus]} p-5 space-y-4`}
    >
      {/* Header */}
      <div className="flex items-start gap-4">
        <DocumentIcon status={currentStatus} />

        <div className="flex-1 min-w-0">
          <h3 className="text-lg font-semibold text-foreground">{title}</h3>
          {isArray ? (
            <>
              <p className="text-sm text-muted-foreground mt-0.5">
                {documents.length} de {maxFiles} certificaciones subidas
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
                {currentDocument?.uploadedAt || "Subido el 15 Oct 2025"}
              </p>
              {currentDocument?.feedback && (
                <p className={`text-sm mt-1.5 ${feedbackColorClass}`}>
                  {currentDocument.feedback}
                </p>
              )}
            </>
          )}
        </div>

        <StatusBadge
          label={STATUS[currentStatus].label}
          color={STATUS[currentStatus].color}
        />
      </div>

      {/* Lista de documentos existentes para arrays */}
      {isArray && currentDocuments.length > 0 && (
        <div className="space-y-3">
          {currentDocuments.map((doc, index) => (
            <div key={index} className="rounded-xl border p-4">
              <div className="flex items-start gap-3">
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
                      className="w-16 h-16 rounded-lg object-cover cursor-pointer border mt-2"
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
                      <button className="mt-2 flex items-center gap-2 px-3 py-1.5 rounded-lg bg-primary/10 hover:bg-primary/20 transition-colors text-sm font-medium text-primary">
                        <Eye className="w-4 h-4" />
                        Ver documento
                      </button>
                    </PreviewDocumentsDialog>
                  )}
                </div>

                {/* Botón eliminar SOLO si el PADRE está RECHAZADO */}
                {currentStatus === "REJECTED" && (
                  <button
                    onClick={() => handleRemoveExistingDocument(index)}
                    className="p-1.5 rounded-lg hover:bg-muted transition-colors text-muted-foreground hover:text-red-600"
                    aria-label="Eliminar"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* ✅ NUEVOS botones de acción para arrays con documentos y estado REJECTED */}
      {isArray &&
        currentStatus === "REJECTED" &&
        currentDocuments.length > 0 &&
        !selectedFiles.length && (
          <div className="rounded-3xl border border-primary/15 p-4 space-y-3">
            <div className="flex items-center gap-2 text-destructive">
              <AlertTriangle className="w-5 h-5" />
              <p className="font-medium">Acciones disponibles</p>
            </div>
            <p className="text-sm text-destructive">
              Puedes enviar todas las certificaciones actuales para revisión,
              cancelar todo y empezar de nuevo.
            </p>
            <div className="flex flex-col sm:flex-row gap-2 mt-4">
              <MCButton onClick={onSubmitAll} className="flex-1 " size="ml">
                Enviar Todo a Revisión
              </MCButton>

              <MCButton
                onClick={onCancelAll}
                variant="outlineDelete"
                className="flex-1 "
                size="ml"
              >
                Cancelar Todo
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
        <div className="rounded-xl border border-primary/15 bg-muted/30 p-4 space-y-3">
          <div className="space-y-3">
            {selectedFiles.map((file, index) => (
              <div key={index} className="flex items-center gap-3">
                {previewUrls[index] ? (
                  <img
                    src={previewUrls[index]}
                    alt="Vista previa"
                    className="w-14 h-14 rounded-lg object-cover border border-doc-card-border"
                  />
                ) : (
                  <div className="w-14 h-14 rounded-lg bg-status-pending-bg flex items-center justify-center">
                    <FileText className="w-7 h-7 text-status-pending" />
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
                  className="p-1.5 rounded-lg hover:bg-muted transition-colors text-muted-foreground hover:text-foreground"
                  aria-label="Quitar archivo"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            ))}
          </div>

          <p className="text-sm text-red-600 font-medium">
            Una vez que envíes{" "}
            {isArray && selectedFiles.length > 1
              ? "los archivos"
              : "el archivo"}
            , no podrás cambiarlos.
          </p>

          <div className="flex gap-2">
            <MCButton
              onClick={() => fileInputRef.current?.click()}
              variant="outline"
              className="flex-1"
            >
              {isArray ? "Agregar más" : "Cambiar archivo"}
            </MCButton>
            <MCButton className="flex-1" onClick={handleConfirmSubmit}>
              <Upload className="w-4 h-4" />
              Enviar{" "}
              {isArray && selectedFiles.length > 1
                ? `(${selectedFiles.length})`
                : ""}
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
                  onClick={() => fileInputRef.current?.click()}
                  className="w-full flex items-center justify-center gap-2 py-3 rounded-xl border border-dashed border-primary/30 bg-bg-secondary text-foreground font-medium hover:bg-muted transition-colors"
                >
                  <Plus className="w-5 h-5" />
                  {currentStatus === "REJECTED"
                    ? `Reenviar certificaciones (${currentDocuments.length}/${maxFiles})`
                    : `Agregar certificaciones (${currentDocuments.length}/${maxFiles})`}
                </button>
              )
            : currentDocument?.verificationStatus === "REJECTED" &&
              onResubmit && (
                <button
                  onClick={() => fileInputRef.current?.click()}
                  className="w-full flex items-center justify-center gap-2 py-3 rounded-xl border border-primary/15 bg-bg-secondary text-foreground font-medium hover:bg-muted transition-colors"
                >
                  <Upload className="w-5 h-5" />
                  Reenviar
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
