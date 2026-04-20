import React from "react";
import { MCModalBase } from "@/shared/components/MCModalBase";

interface PreviewDocumentsDialogProps {
  children?: React.ReactNode;
  documentUrl?: string;
  documentType?: string;
  documentName?: string;
  isOpen?: boolean;
  onClose?: () => void;
  zIndex?: number;
}

function PreviewDocumentsDialog({
  children,
  documentUrl,
  documentType,
  documentName,
  isOpen,
  onClose,
  zIndex,
}: PreviewDocumentsDialogProps) {
  const renderPreviewContent = () => {
    if (!documentUrl) {
      return (
        <div className="flex items-center justify-center h-[90vh] text-muted-foreground">
          <span>No document to preview</span>
        </div>
      );
    }

    // Verificar si es imagen usando documentType primero, luego la extensión como fallback
    const isImage =
      documentType?.startsWith("image/") ||
      documentUrl.match(/\.(jpg|jpeg|png|gif|webp)$/i);

    if (isImage) {
      return (
        <div className="flex items-center justify-center max-h-[90vh] overflow-hidden">
          <img
            src={documentUrl}
            alt={documentName || "Vista previa del documento"}
            className="max-w-full max-h-full object-contain rounded-lg"
          />
        </div>
      );
    }

    // Verificar si es PDF usando documentType primero, luego la extensión
    const isPdf =
      documentType?.toLowerCase().includes("pdf") ||
      documentUrl.match(/\.pdf($|\?)/i);

    if (isPdf) {
      // Si es un blob local o file local, solo mostrar botón para abrir en nueva pestaña
      if (documentUrl.startsWith("blob:") || documentUrl.startsWith("file:")) {
        return (
          <div className="flex flex-col items-center justify-center h-[90vh] gap-4">
            <div className="text-6xl text-muted-foreground">📄</div>
            <div className="text-center">
              <h3 className="text-lg font-semibold mb-2">
                {documentName || "Documento PDF"}
              </h3>
              <p className="text-muted-foreground mb-4">
                Los archivos PDF subidos localmente no se pueden previsualizar
                aquí. Haz clic para abrirlo en una nueva pestaña.
              </p>
              <a
                href={documentUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center px-4 py-2 bg-primary text-primary-foreground rounded-md hover:bg-primary/90 transition-colors"
              >
                Abrir PDF en nueva pestaña
              </a>
            </div>
          </div>
        );
      }
      // Si es una URL pública, mostrar en iframe
      return (
        <div className="h-[90vh] w-full bg-transparent rounded-lg overflow-hidden">
          <iframe
            src={documentUrl}
            className="w-full h-full border-0 rounded-lg bg-transparent custom-iframe-scroll"
            title={documentName || "PDF Document"}
            style={{ background: "transparent" }}
          />
        </div>
      );
    }

    // Otros tipos de archivo
    return (
      <div className="flex flex-col items-center justify-center h-[90vh] gap-4">
        <div className="text-6xl text-muted-foreground">📄</div>
        <div className="text-center">
          <h3 className="text-lg font-semibold mb-2">
            {documentName || "Document"}
          </h3>
          <p className="text-muted-foreground mb-4">
            Preview not available for this file type
          </p>
          <a
            href={documentUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center px-4 py-2 bg-primary text-primary-foreground rounded-md hover:bg-primary/90 transition-colors"
          >
            Open in new tab
          </a>
        </div>
      </div>
    );
  };

  return (
    <MCModalBase
      id="previewDocumentsDialog"
      title={documentName || "Vista previa del documento"}
      trigger={children}
      isOpen={isOpen}
      onClose={onClose}
      size="xl"
      zIndex={zIndex}
    >
      <div className="p-4">{renderPreviewContent()}</div>
    </MCModalBase>
  );
}

export default PreviewDocumentsDialog;
