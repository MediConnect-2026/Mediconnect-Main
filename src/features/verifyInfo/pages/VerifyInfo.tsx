import React, { useState } from "react";
import MCDashboardContent from "@/shared/layout/MCDashboardContent";
import { useVerifyInfoStore } from "@/stores/useVerifyInfoStore";
import { useAppStore } from "@/stores/useAppStore";
import {
  type DoctorPersonalInfo,
  type CenterPersonalInfo,
} from "@/schema/verifyInfo.schema";
import VerificationProgressSidebar from "../components/VerificationProgressSidebar";
import IdentificationCard from "../components/Identificationcard";
import DocumentsSection from "../components/DocumentsSection";
import DoctorDocumentsView from "../components/DoctorDocuments";
import CenterDocumentsView from "../components/CenterDocuments";
import type { VerificationStatus } from "../components/Verificationconstants";
import { mockDoctorData, mockCenterData } from "@/data/verifyInfoMock";

function VerifyInfo() {
  const [activeTab, setActiveTab] = useState("identificacion");
  const [isEditing, setIsEditing] = useState(false);

  const userRole = useAppStore((state) => state.user?.role);
  const isDoctor = userRole === "DOCTOR";

  const {
    doctorInfo,
    centerInfo,
    doctorDocuments,
    centerDocuments,
    setDoctorInfo,
    setCenterInfo,
  } = useVerifyInfoStore();

  // Usar datos del store o datos mock según el rol
  const currentInfo = isDoctor
    ? doctorInfo || mockDoctorData
    : centerInfo || mockCenterData;

  const currentStatus: VerificationStatus = currentInfo.verificationStatus;

  // Calcular el estado general de documentos basado en documentos individuales
  const getDocumentsStatus = (): VerificationStatus => {
    if (isDoctor && doctorDocuments) {
      // ✅ Recopilar estados de documentos con verificación individual
      const docStatuses = [
        doctorDocuments.identityDocumentFile?.verificationStatus,
        doctorDocuments.academicTitle?.verificationStatus,
        // ✅ Para certificaciones, usar el estado del PADRE
        doctorDocuments.certificationsStatus,
      ].filter(Boolean) as VerificationStatus[];

      if (docStatuses.length === 0) return "PENDING";

      const hasRejected = docStatuses.some((status) => status === "REJECTED");
      const hasPending = docStatuses.some((status) => status === "PENDING");
      const allApproved = docStatuses.every((status) => status === "APPROVED");

      if (hasRejected) return "REJECTED";
      if (hasPending) return "PENDING";
      if (allApproved) return "APPROVED";

      return "PENDING";
    } else if (!isDoctor && centerDocuments) {
      return (
        centerDocuments.healthCertificateFile?.verificationStatus || "PENDING"
      );
    }

    return "PENDING";
  };

  const documentsStatus = getDocumentsStatus();

  const handleStartEdit = () => {
    setIsEditing(true);
  };

  const handleCancelEdit = () => {
    setIsEditing(false);
  };

  const handleSubmit = (data: DoctorPersonalInfo | CenterPersonalInfo) => {
    const updatedData = {
      ...data,
      verificationStatus: "PENDING" as const,
    };

    if (isDoctor) {
      setDoctorInfo(updatedData as DoctorPersonalInfo);
    } else {
      setCenterInfo(updatedData as CenterPersonalInfo);
    }
    setIsEditing(false);
  };

  return (
    <MCDashboardContent mainWidth="w-[100%]" noBg>
      <div className="min-h-screen w-full">
        <div className="max-w-6xl mx-auto px-2 sm:px-6 lg:px-8">
          <section className="flex flex-col gap-4 sm:grid sm:grid-cols-[3fr_7fr]">
            <VerificationProgressSidebar
              activeTab={activeTab}
              currentStatus={currentStatus}
              isDoctor={isDoctor}
              onTabChange={setActiveTab}
            />

            <main className="mt-4 sm:mt-0">
              {activeTab === "identificacion" && (
                <IdentificationCard
                  isDoctor={isDoctor}
                  isEditing={isEditing}
                  currentStatus={currentStatus}
                  currentInfo={currentInfo}
                  onStartEdit={handleStartEdit}
                  onCancelEdit={handleCancelEdit}
                  onSubmit={handleSubmit}
                />
              )}

              {activeTab === "documentos" && (
                <DocumentsSection
                  isDoctor={isDoctor}
                  currentStatus={documentsStatus}
                >
                  {isDoctor ? <DoctorDocumentsView /> : <CenterDocumentsView />}
                </DocumentsSection>
              )}
            </main>
          </section>
        </div>
      </div>
    </MCDashboardContent>
  );
}

export default VerifyInfo;
