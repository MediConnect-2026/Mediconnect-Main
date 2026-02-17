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
import { useDoctorProfile } from "@/lib/hooks/useDoctorProfile";
import type { Doctor } from "@/shared/navigation/userMenu/editProfile/doctor/services/doctor.types";

function VerifyInfo() {
  const [activeTab, setActiveTab] = useState("identificacion");
  const [isEditing, setIsEditing] = useState(false);
  const user = useAppStore((state) => state.user);
  const userRole = useAppStore((state) => state.user?.rol) as AppUserRole;
  const isDoctor = userRole === "DOCTOR";

  // Obtener datos del doctor desde el API usando React Query
  const { 
    data: doctorProfile, 
    isLoading: isDoctorLoading,
    error: doctorError 
  } = useDoctorProfile({
    enabled: isDoctor, // Solo ejecutar si el usuario es doctor
  });

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
    doctor: Doctor
  ): DoctorPersonalInfo | null => {
    if (!doctor) return null;

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
      email: user?.email || "",
      nationality: doctor.nacionalidad || "",
      identificationNumber: doctor.numeroDocumentoIdentificacion || "",
      phone: doctor.usuario?.telefono || "",
      address: "", // No viene en la respuesta del API
      primarySpecialty,
      secondarySpecialty,
      medicalLicense: doctor.exequatur || "",
      verificationStatus:
        verificationStatusMap[doctor.estadoVerificacion] || "PENDING",
    };
  };

  // Transformar documentos del doctor del API al formato esperado
  const transformDoctorDocuments = (
    doctor: Doctor
  ): DoctorDocuments | null => {
    if (!doctor?.documentos || doctor.documentos.length === 0) return null;

    const docs = doctor.documentos;

    // ✅ Buscar TODOS los documentos de identidad (puede haber más de uno)
    const identityDocs = docs.filter((d: any) => d.tipoDocumento === "foto_documento");
    
    // Buscar título académico
    const academicDoc = docs.find(
      (d: any) => d.tipoDocumento === "titulo_academico"
    );

    const certificationDoc = docs.filter(
      (d: any) => d.tipoDocumento === "Certificación"
    );

    // ✅ Validar que exista al menos un documento de identidad
    if (!identityDocs || identityDocs.length === 0) return null;

    return {
      // ✅ Mapear todos los documentos de identidad encontrados
      identityDocumentFiles: identityDocs.map((identityDoc: any) => ({
        id: identityDoc.id,
        url: identityDoc.urlArchivo,
        name: identityDoc.nombreOriginal,
        type: identityDoc.tipoMime,
        size: identityDoc.tamanio_bytes || 0,
        uploadedAt: identityDoc.creadoEn,
        verificationStatus: identityDoc.estadoRevision === "Pendiente"
          ? "PENDING"
          : identityDoc.estadoRevision === "Aprobado"
            ? "APPROVED"
            : "REJECTED",
        feedback: identityDoc.feedback || undefined,
      })),
      academicTitle: academicDoc
        ? {
            id: academicDoc.id,
            url: academicDoc.urlArchivo,
            name: academicDoc.nombreOriginal,
            type: academicDoc.tipoMime,
            size: academicDoc.tamanio_bytes || 0,
            uploadedAt: academicDoc.creadoEn,
            verificationStatus: academicDoc.estadoRevision === "Pendiente"
              ? "PENDING"
              : academicDoc.estadoRevision === "Aprobado"
                ? "APPROVED"
                : "REJECTED",
          }
        : undefined,
      certifications: certificationDoc.map((cert: any) => ({
        id: cert.id,
        url: cert.urlArchivo,
        name: cert.nombreOriginal,
        type: cert.tipoMime,
        size: cert.tamanio_bytes || 0,
        uploadedAt: cert.creadoEn,
        verificationStatus: cert.estadoRevision === "Pendiente"
          ? "PENDING"
          : cert.estadoRevision === "Aprobado"
            ? "APPROVED"
            : "REJECTED",
      }))
    };
  };

  // Sincronizar datos del doctor desde React Query al store
  useEffect(() => {
    if (isDoctor && doctorProfile) {
      const transformedData = transformDoctorData(doctorProfile);
      // Actualizar con los datos transformados del API
      if (transformedData) {
        setDoctorInfo(transformedData);
      }
    }
  }, [doctorProfile, isDoctor, setDoctorInfo, user?.email]);

  // Sincronizar documentos del doctor desde React Query al store
  useEffect(() => {
    if (isDoctor && doctorProfile) {
      const transformedDocs = transformDoctorDocuments(doctorProfile);
      
      // Actualizar con los documentos transformados del API
      if (transformedDocs) {
        setDoctorDocuments(transformedDocs);
      }
    }
  }, [doctorProfile, isDoctor, setDoctorDocuments]);

  // Usar datos del store o datos mock según el rol
  const currentInfo = isDoctor
    ? doctorInfo || mockDoctorData
    : centerInfo || mockCenterData;

  const currentStatus: VerificationStatus = currentInfo.verificationStatus;

  // Calcular el estado general de documentos basado en documentos individuales
  const getDocumentsStatus = (): VerificationStatus => {
    if (isDoctor && doctorDocuments) {
      // ✅ Recopilar estados de todos los documentos de identidad
      const identityStatuses = doctorDocuments.identityDocumentFiles?.map(
        doc => doc.verificationStatus
      ) || [];
      
      // ✅ Recopilar estados de otros documentos con verificación individual
      const docStatuses = [
        ...identityStatuses,
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
          {/* Mostrar estado de carga solo para doctores */}
          {isDoctor && isDoctorLoading && (
            <div className="flex items-center justify-center min-h-[400px]">
              <div className="text-center">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
                <p className="text-muted-foreground">Cargando información del perfil...</p>
              </div>
            </div>
          )}

          {/* Mostrar error solo para doctores */}
          {isDoctor && doctorError && (
            <div className="bg-destructive/10 border border-destructive/20 rounded-lg p-4 mb-4">
              <h3 className="font-semibold text-destructive mb-2">Error al cargar el perfil</h3>
              <p className="text-sm text-destructive/80">
                {doctorError.message || 'No se pudo cargar la información del perfil. Por favor, intenta nuevamente.'}
              </p>
            </div>
          )}

          {/* Contenido principal - mostrar solo si no está cargando y no hay error */}
          {(!isDoctor || (!isDoctorLoading && !doctorError)) && (
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
          )}
        </div>
      </div>
    </MCDashboardContent>
  );
}

export default VerifyInfo;
