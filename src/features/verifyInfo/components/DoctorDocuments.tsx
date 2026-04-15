import { useEffect } from "react";
import { useTranslation } from "react-i18next";
import type {
  DoctorDocuments as DoctorDocumentsType,
  UploadedFileWithStatus,
  UploadedFile,
} from "@/types/Documents";
import DocumentCard from "./DocumentsCard";
import { useVerifyInfoStore } from "@/stores/useVerifyInfoStore";
import { useUpdateDoctorDocument } from "@/lib/hooks/useUpdateDoctorDocument";

const initialDoctorDocuments: DoctorDocumentsType = {
  identityDocumentFiles: [
    {
      url: "#",
      name: "cedula-identificacion-frontal.pdf",
      type: "application/pdf",
      size: 1.8 * 1024 * 1024,
      uploadedAt: "Subido el 15 Oct 2025",
      verificationStatus: "APPROVED",
      feedback: "Documento de identidad (frontal) verificado correctamente",
    },
    {
      url: "#",
      name: "cedula-identificacion-reverso.pdf",
      type: "application/pdf",
      size: 1.5 * 1024 * 1024,
      uploadedAt: "Subido el 15 Oct 2025",
      verificationStatus: "REJECTED",
      feedback: "La imagen del reverso está borrosa. Por favor, sube una imagen más clara.",
    }
  ],
  academicTitle: {
    url: "#",
    name: "titulo-universitario.pdf",
    type: "application/pdf",
    size: 1.8 * 1024 * 1024,
    uploadedAt: "Subido el 15 Oct 2025",
    verificationStatus: "APPROVED",
    feedback: "Título válido y verificado con la universidad",
  },
  certifications: [
    {
      url: "#",
      name: "certificacion-adicionales.pdf",
      type: "application/pdf",
      size: 1.8 * 1024 * 1024,
      uploadedAt: "Subido el 15 Oct 2025",
    },
    {
      url: "#",
      name: "exequatur-medico.pdf",
      type: "application/pdf",
      size: 1.8 * 1024 * 1024,
      uploadedAt: "Subido el 15 Oct 2025",
    },
  ],
  certificationsStatus: "REJECTED",
  certificationsFeedback: "En revisión por el equipo de verificación",
};

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

interface DoctorDocumentsViewProps {
  documents?: DoctorDocumentsType | null;
}

export default function DoctorDocumentsView({
  documents: propDocuments,
}: DoctorDocumentsViewProps) {
  const { t } = useTranslation("common");
  const { doctorDocuments, setDoctorDocuments } = useVerifyInfoStore();
  
  // Hook para actualizar documentos rechazados
  const { mutate: updateDocument, isPending: isUpdating } = useUpdateDoctorDocument({
    onSuccess: (data) => {
      console.log("✅ Documento actualizado exitosamente:", data);
      // El cache se invalida automáticamente en el hook
      // Los datos se actualizarán via React Query
    },
    onError: (error) => {
      console.error("❌ Error al actualizar documento:", error);
      // Aquí podrías mostrar un toast o notificación de error
      // Por ahora solo loggeamos el error
    }
  });

  console.log("DoctorDocumentsView rendered with propDocuments:", propDocuments);
  
  useEffect(() => {
    if (!doctorDocuments) {
      setDoctorDocuments(propDocuments || initialDoctorDocuments);
    }
  }, [doctorDocuments, setDoctorDocuments, propDocuments]);

  const handleResubmit = (
    field: "identityDocumentFiles" | "academicTitle",
    file: File,
    documentIndex?: number, // ✅ Índice del documento dentro del array (solo para identityDocumentFiles)
  ) => {
    if (!doctorDocuments) return;

    // ✅ Manejo especial para arrays de documentos de identidad
    if (field === "identityDocumentFiles") {
      if (documentIndex === undefined) {
        console.error("❌ Se requiere documentIndex para identityDocumentFiles");
        return;
      }

      const documentToUpdate = doctorDocuments.identityDocumentFiles?.[documentIndex];
      
      if (!documentToUpdate?.id) {
        console.error("❌ No se puede actualizar: documento sin ID");
        return;
      }

      // Actualizar UI optimísticamente
      const optimisticDoc: UploadedFileWithStatus = {
        ...documentToUpdate,
        url: URL.createObjectURL(file),
        name: file.name,
        type: file.type,
        size: file.size,
        uploadedAt: formatDate(),
        verificationStatus: "PENDING",
        feedback: "Documento en proceso de actualización...",
      };

      // ✅ Actualizar el documento específico en el array
      const updatedIdentityDocs = [...(doctorDocuments.identityDocumentFiles || [])];
      updatedIdentityDocs[documentIndex] = optimisticDoc;

      setDoctorDocuments({
        ...doctorDocuments,
        identityDocumentFiles: updatedIdentityDocs,
      });

      // Enviar al servidor
      updateDocument({
        documentId: documentToUpdate.id,
        data: {
          archivo: file,
          descripcion: `Documento de identidad ${documentIndex + 1} actualizado`,
        }
      });

      console.log("Identity document update requested:", { 
        field, 
        file, 
        documentIndex,
        documentId: documentToUpdate.id 
      });
      
      return;
    }

    // ✅ Manejo para documentos individuales (academicTitle)
    const documentToUpdate = doctorDocuments[field];
    
    // Verificar que el documento tenga un ID (viene del API)
    if (!documentToUpdate?.id) {
      console.error("❌ No se puede actualizar: documento sin ID");
      return;
    }

    // Actualizar UI optimísticamente
    const optimisticDoc: UploadedFileWithStatus = {
      ...documentToUpdate,
      url: URL.createObjectURL(file),
      name: file.name,
      type: file.type,
      size: file.size,
      uploadedAt: formatDate(),
      verificationStatus: "PENDING",
      feedback: "Documento en proceso de actualización...",
    };

    setDoctorDocuments({
      ...doctorDocuments,
      [field]: optimisticDoc,
    });

    // Enviar al servidor
    updateDocument({
      documentId: documentToUpdate.id,
      data: {
        archivo: file,
        descripcion: `Documento académico actualizado`,
      }
    });

    console.log("Academic document update requested:", { 
      field, 
      file, 
      documentId: documentToUpdate.id 
    });
  };

  const handleCertificationsUpdate = (certifications: UploadedFile[]) => {
    if (!doctorDocuments) return;

    setDoctorDocuments({
      ...doctorDocuments,
      certifications,
    });

    console.log("Certifications updated:", certifications);
  };

  const handleSubmitAllCertifications = () => {
    if (!doctorDocuments) return;

    setDoctorDocuments({
      ...doctorDocuments,
      certificationsStatus: "PENDING",
      certificationsFeedback:
        "Todas las certificaciones están siendo revisadas por el equipo de verificación",
    });

    console.log("All certifications submitted for review");
  };

  const handleCancelAllCertifications = () => {
    if (!doctorDocuments) return;

    setDoctorDocuments({
      ...doctorDocuments,
      certifications: [],
      certificationsStatus: "PENDING",
      certificationsFeedback: "",
    });

    console.log("All certifications cancelled");
  };

  if (!doctorDocuments) {
    return <div>{t("verification.documents.loading")}</div>;
  }

  return (
    <div className="space-y-4">
      {/* Indicador de actualización en progreso */}
      {isUpdating && (
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 flex items-center gap-3">
          <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-blue-600"></div>
          <p className="text-sm text-blue-800">
            Actualizando documento... Por favor espera.
          </p>
        </div>
      )}

      {/* ✅ Renderizar todos los documentos de identidad */}
      {doctorDocuments.identityDocumentFiles?.map((identityDoc, index) => (
        <DocumentCard
          key={`identity-doc-${index}`}
          title={
            doctorDocuments.identityDocumentFiles.length > 1
              ? `${t("verification.documents.identityDocument")} ${index + 1}`
              : t("verification.documents.identityDocument")
          }
          document={identityDoc}
          onResubmit={(file) => handleResubmit("identityDocumentFiles", file, index)}
        />
      ))}

      {doctorDocuments.academicTitle && (
        <DocumentCard
          title={t("verification.documents.academicTitle")}
          document={doctorDocuments.academicTitle}
          onResubmit={(file) => handleResubmit("academicTitle", file)}
        />
      )}

      <DocumentCard
        title={t("verification.documents.additionalCertifications")}
        documents={doctorDocuments.certifications || []}
        onUpdateArray={handleCertificationsUpdate}
        isArray={true}
        maxFiles={5}
        arrayParentStatus={doctorDocuments.certificationsStatus || "PENDING"}
        arrayParentFeedback={doctorDocuments.certificationsFeedback}
        onSubmitAll={handleSubmitAllCertifications}
        onCancelAll={handleCancelAllCertifications}
      />
    </div>
  );
}
