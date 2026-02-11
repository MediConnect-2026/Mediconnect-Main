import { useEffect } from "react";
import { useTranslation } from "react-i18next";
import type {
  CenterDocuments as CenterDocumentsType,
  UploadedFileWithStatus,
} from "@/types/Documents";
import DocumentCard from "./DocumentsCard";
import { useVerifyInfoStore } from "@/stores/useVerifyInfoStore";

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
  const { t } = useTranslation("common");
  const { centerDocuments, setCenterDocuments } = useVerifyInfoStore();

  useEffect(() => {
    if (!centerDocuments) {
      setCenterDocuments(propDocuments || initialCenterDocuments);
    }
  }, [centerDocuments, setCenterDocuments, propDocuments]);

  const handleResubmit = (file: File) => {
    if (!centerDocuments) return;

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

    setCenterDocuments({
      healthCertificateFile: updatedDoc,
    });

    console.log("Center document updated:", { file, updatedDoc });
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
      />
    </div>
  );
}
