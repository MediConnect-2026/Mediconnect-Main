import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import type {
  CenterDocuments as CenterDocumentsType,
  UploadedFileWithStatus,
} from "@/types/Documents";
import DocumentCard from "./DocumentsCard";
import { useVerifyInfoStore } from "@/stores/useVerifyInfoStore";
import centerService from "@/shared/navigation/userMenu/editProfile/center/services/center.services";
import { toast } from 'sonner';
import { useQueryClient } from '@tanstack/react-query';
import { QUERY_KEYS } from '@/lib/react-query/config';

const initialCenterDocuments: CenterDocumentsType = {
  healthCertificateFile: {
    url: "#",
    name: "certificado-salud.pdf",
    type: "application/pdf",
    size: 2.1 * 1024 * 1024,
    uploadedAt: "Subido el 20 Oct 2025",
    verificationStatus: "PENDING",
    feedback: "En revisión por el equipo de verificación",
  },
};

export default function CenterDocumentsView({
  documents: propDocuments,
}: {
  documents?: CenterDocumentsType | null;
}) {
  const { t, i18n } = useTranslation("common");
  const { centerDocuments, setCenterDocuments } = useVerifyInfoStore();
  const [isUploading, setIsUploading] = useState(false);
  const queryClient = useQueryClient();

  useEffect(() => {
    if (!centerDocuments) {
      setCenterDocuments(propDocuments || initialCenterDocuments);
    }
  }, [centerDocuments, setCenterDocuments, propDocuments]);

  const handleResubmit = async (file: File) => {
    if (!centerDocuments) return;

    const docId = centerDocuments.healthCertificateFile?.id;

    // If we don't have an id, fall back to optimistic UI update
    if (!docId) {
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

      const updatedDoc: UploadedFileWithStatus = {
        url: URL.createObjectURL(file),
        name: file.name,
        type: file.type,
        size: file.size,
        uploadedAt: `Subido el ${now.getDate()} ${months[now.getMonth()]} ${now.getFullYear()}`,
        verificationStatus: "PENDING",
        feedback: "En revisión por el equipo de verificación",
      };

      setCenterDocuments({ healthCertificateFile: updatedDoc });
      console.warn("No document id available for resubmit - performed optimistic update");
      return;
    }

    try {
      // Set loading state
      setIsUploading(true);

      // Llamar al servicio que realiza el PUT /centros-salud/documentos/{id}
      const resp = await centerService.updateDocument(docId, { archivo: file, descripcion: "" });

      // Normalizar respuesta: algunos endpoints devuelven { data: { ... } } u otros retornan el objeto directo
      const payload = resp?.data ?? resp;

      // Si el backend devuelve un objeto con 'documentos' tomar el primero
      const returnedDoc = Array.isArray(payload?.documentos)
        ? payload.documentos[0]
        : payload?.data ?? payload;

      const updated: UploadedFileWithStatus = {
        id: returnedDoc?.id ?? docId,
        url: returnedDoc?.urlArchivo ?? returnedDoc?.archivo ?? returnedDoc?.url ?? URL.createObjectURL(file),
        name: returnedDoc?.nombreOriginal ?? file.name,
        type: returnedDoc?.tipoMime ?? file.type,
        size: returnedDoc?.tamanio_bytes ?? file.size,
        uploadedAt: returnedDoc?.creadoEn ?? new Date().toISOString(),
        verificationStatus: returnedDoc?.estadoRevision === 'Pendiente' ? 'PENDING' : returnedDoc?.estadoRevision === 'Aprobado' ? 'APPROVED' : 'REJECTED',
        feedback: returnedDoc?.feedback ?? undefined,
      };

      setCenterDocuments({ healthCertificateFile: updated });
      console.log("Center document resubmitted:", { file, updated });

      // Forzar refetch de documentos del centro para mantener la información en sync
      try {
        await queryClient.invalidateQueries({ queryKey: [...QUERY_KEYS.CENTERS, 'documents', 'my', i18n.language] });
      } catch (qErr) {
        console.warn('Error invalidating center documents query', qErr);
      }
    } catch (error: any) {
      console.error("Error resubmitting center document:", error);

      // Extraer mensaje del servidor si está disponible
      const serverMessage = error?.response?.data?.message ?? error?.message ?? "";

      // Determinar mensaje de usuario localizado según el error
      let userMessage: string;

      if (!serverMessage) {
        userMessage = t('verification.documentsSection.errorGeneric', 'Error al subir el documento');
      } else if (/5\s?MB|tama[nñ]o|supera|excede/i.test(serverMessage)) {
        userMessage = t('verification.documentsSection.errorFileTooLarge');
      } else if (/solo se permiten|solo se permiten imágenes|only images|jpeg|png|webp|pdf|tipo de archivo no permitido/i.test(serverMessage)) {
        userMessage = t('verification.documentsSection.errorInvalidType');
      } else {
        // Si el backend ya devolvió un mensaje legible, mostrarlo tal cual
        userMessage = serverMessage;
      }

      // Mostrar toast localizado con el mensaje dinámico
      toast.error(t('verification.documentsSection.uploadError', { message: userMessage }));

      // Fallback visual optimista para que el usuario vea el nuevo archivo
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

      const updatedDoc: UploadedFileWithStatus = {
        url: URL.createObjectURL(file),
        name: file.name,
        type: file.type,
        size: file.size,
        uploadedAt: `Subido el ${now.getDate()} ${months[now.getMonth()]} ${now.getFullYear()}`,
        verificationStatus: "REJECTED",
        feedback: "En revisión por el equipo de verificación",
      };

      setCenterDocuments({ healthCertificateFile: updatedDoc });
    }
    finally {
      setIsUploading(false);
    }
  };

  if (!centerDocuments) {
    return <div>{t("verification.documents.loading")}</div>;
  }

  return (
    <div className="space-y-4">
      <DocumentCard
        title={t("verification.documents.healthCertificate")}
        document={centerDocuments.healthCertificateFile}
        onResubmit={handleResubmit}
        isUploading={isUploading}
      />
    </div>
  );
}
