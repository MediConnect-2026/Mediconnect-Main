import { useEffect } from "react";
import { useTranslation } from "react-i18next";
import type {
  DoctorDocuments as DoctorDocumentsType,
  UploadedFileWithStatus,
  UploadedFile,
} from "@/types/Documents";
import DocumentCard from "./DocumentsCard";
import { useVerifyInfoStore } from "@/stores/useVerifyInfoStore";

const initialDoctorDocuments: DoctorDocumentsType = {
  identityDocumentFile: {
    url: "#",
    name: "cedula-identificacion.pdf",
    type: "application/pdf",
    size: 1.8 * 1024 * 1024,
    uploadedAt: "Subido el 15 Oct 2025",
    verificationStatus: "APPROVED",
    feedback: "Documento de identidad verificado correctamente",
  },
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

  useEffect(() => {
    if (!doctorDocuments) {
      setDoctorDocuments(propDocuments || initialDoctorDocuments);
    }
  }, [doctorDocuments, setDoctorDocuments, propDocuments]);

  const handleResubmit = (
    field: "identityDocumentFile" | "academicTitle",
    file: File,
  ) => {
    if (!doctorDocuments) return;

    const updatedDoc: UploadedFileWithStatus = {
      url: URL.createObjectURL(file),
      name: file.name,
      type: file.type,
      size: file.size,
      uploadedAt: formatDate(),
      verificationStatus: "PENDING",
      feedback: "En revisión por el equipo de verificación",
    };

    setDoctorDocuments({
      ...doctorDocuments,
      [field]: updatedDoc,
    });

    console.log("Doctor document updated:", { field, file, updatedDoc });
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
      <DocumentCard
        title={t("verification.documents.identityDocument")}
        document={doctorDocuments.identityDocumentFile}
        onResubmit={(file) => handleResubmit("identityDocumentFile", file)}
      />

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
