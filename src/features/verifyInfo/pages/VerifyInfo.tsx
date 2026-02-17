import { useState, useEffect } from "react";
import MCDashboardContent from "@/shared/layout/MCDashboardContent";
import { useVerifyInfoStore } from "@/stores/useVerifyInfoStore";
import { useAppStore } from "@/stores/useAppStore";
import {
  type DoctorPersonalInfo,
  type CenterPersonalInfo,
  type DoctorDocuments,
} from "@/schema/verifyInfo.schema";
import VerificationProgressSidebar from "../components/VerificationProgressSidebar";
import IdentificationCard from "../components/Identificationcard";
import DocumentsSection from "../components/DocumentsSection";
import DoctorDocumentsView from "../components/DoctorDocuments";
import CenterDocumentsView from "../components/CenterDocuments";
import type { VerificationStatus } from "../components/Verificationconstants";
import { mockDoctorData, mockCenterData } from "@/data/verifyInfoMock";
import type { AppUserRole } from "@/services/auth/auth.types";

function VerifyInfo() {
  const [activeTab, setActiveTab] = useState("identificacion");
  const [isEditing, setIsEditing] = useState(false);
  const user = useAppStore((state) => state.user);
  const userRole = useAppStore((state) => state.user?.rol) as AppUserRole;
  const isDoctor = userRole === "DOCTOR";

  const {
    doctorInfo,
    centerInfo,
    doctorDocuments,
    centerDocuments,
    setDoctorInfo,
    setCenterInfo,
    setDoctorDocuments,
  } = useVerifyInfoStore();

  // Transformar datos del doctor del API al formato esperado por el componente
  const transformDoctorData = (
    doctor: NonNullable<typeof user>['doctor']
  ): DoctorPersonalInfo | null => {
    if (!doctor || !user) return null;

    // Obtener especialidad principal y secundaria
    const primarySpecialty =
      doctor.especialidades?.find((e: any) => e.es_principal)?.especialidades
        ?.nombre || "";
    const secondarySpecialties = doctor.especialidades
      ?.filter((e: any) => !e.es_principal)
      .map((e: any) => e.especialidades?.nombre)
      .filter(Boolean) || [];

    
    const secondarySpecialty = secondarySpecialties.length > 0 ? secondarySpecialties.join(", ") : undefined;

    // Mapear estado de verificación
    const verificationStatusMap: Record<
      string,
      "PENDING" | "APPROVED" | "REJECTED"
    > = {
      "En revisión": "PENDING",
      Aprobado: "APPROVED",
      Rechazado: "REJECTED",
    };

    return {
      firstName: doctor.nombre || "",
      lastName: doctor.apellido || "",
      gender: doctor.genero || "",
      email: user.email || "",
      nationality: doctor.nacionalidad || "",
      identificationNumber: doctor.numeroDocumentoIdentificacion || "",
      phone: doctor.telefono || "", // No viene en la respuesta, usar valor vacío por defecto
      address: "", // No viene en la respuesta, usar valor vacío por defecto
      primarySpecialty,
      secondarySpecialty,
      medicalLicense: doctor.exequatur || "",
      verificationStatus:
        verificationStatusMap[doctor.estadoVerificacion] || "PENDING",
    };
  };

  // Transformar documentos del doctor del API al formato esperado
  const transformDoctorDocuments = (
    doctor: NonNullable<typeof user>['doctor']
  ): DoctorDocuments | null => {
    if (!doctor?.documentos || doctor.documentos.length === 0) return null;

    const docs = doctor.documentos;

    // Buscar documento de identidad
    const identityDoc = docs.find((d: any) => d.tipoDocumento === "foto_documento");
    // Buscar título académico
    const academicDoc = docs.find(
      (d: any) => d.tipoDocumento === "titulo_academico"
    );

    if (!identityDoc) return null; // El documento de identidad es requerido

    return {
      identityDocumentFile: {
        url: identityDoc.urlArchivo,
        name: identityDoc.nombreOriginal,
        type: identityDoc.tipoMime,
        size: identityDoc.tamanio_bytes || 0,
        uploadedAt: identityDoc.creadoEn,
        verificationStatus: "PENDING", // Por defecto PENDING
      },
      academicTitle: academicDoc
        ? {
            url: academicDoc.urlArchivo,
            name: academicDoc.nombreOriginal,
            type: academicDoc.tipoMime,
            size: academicDoc.tamanio_bytes || 0,
            uploadedAt: academicDoc.creadoEn,
            verificationStatus: "PENDING",
          }
        : undefined,
      certifications: [],
      certificationsStatus: "PENDING",
    };
  };

  // Inicializar datos del doctor cuando el usuario esté disponible
  useEffect(() => {
    if (isDoctor && user?.doctor) {
      const transformedData = transformDoctorData(user.doctor);
      // Siempre actualizar con los datos transformados del API
      if (transformedData) {
        setDoctorInfo(transformedData);
      }
    }

    if (isDoctor && user?.doctor) {
      const transformedDocs = transformDoctorDocuments(user.doctor);
      
      // Siempre actualizar con los documentos transformados del API
      if (transformedDocs) {
        setDoctorDocuments(transformedDocs);
      }
    }
  }, [user, isDoctor, setDoctorInfo, setDoctorDocuments]);

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
                  {isDoctor ? <DoctorDocumentsView documents={doctorDocuments} /> : <CenterDocumentsView />}
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
