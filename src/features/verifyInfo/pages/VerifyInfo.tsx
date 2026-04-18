import { useState, useEffect, useMemo, useRef } from "react";
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
import { useCenterProfile } from "@/lib/hooks/useCenterProfile";
import { useCenterDocuments } from "@/lib/hooks/useCenterDocuments";
import { doctorService } from "@/shared/navigation/userMenu/editProfile/doctor/services";
import type { Doctor } from "@/shared/navigation/userMenu/editProfile/doctor/services/doctor.types";
import { useTranslation } from "react-i18next";
import VerifyInfoSkeleton from "../components/VerifyInfoSkeleton";
import MCButton from "@/shared/components/forms/MCButton";
import centerService from "@/shared/navigation/userMenu/editProfile/center/services/center.services";
import { toast } from "sonner";
import { useQueryClient } from "@tanstack/react-query";
import { QUERY_KEYS } from "@/lib/react-query/config";
import { socketService } from "@/services/websocket";
import type { NotificacionEvent } from "@/types/WebSocketTypes";
import type {
  UpdateCenterLocationRequest,
  UpdateCenterLocationResponse,
} from "@/shared/navigation/userMenu/editProfile/center/services/center.types";

function VerifyInfo() {
  const [activeTab, setActiveTab] = useState("identificacion");
  const [isEditing, setIsEditing] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const user = useAppStore((state) => state.user);
  const userRole = useAppStore((state) => state.user?.rol) as AppUserRole;
  const isDoctor = userRole === "DOCTOR";
  const {i18n} = useTranslation();
  const { t } = useTranslation("common");
  const queryClient = useQueryClient();
  // Obtener datos del doctor desde el API usando React Query
  const { 
    data: doctorProfile, 
    isLoading: isDoctorLoading,
    error: doctorError,
    refetch: refetchDoctor,
  } = useDoctorProfile({
    enabled: isDoctor, // Solo ejecutar si el usuario es doctor
    staleTime: 1000 * 60 * 15,
  });

  const {
    doctorInfo,
    centerInfo,
    doctorDocuments,
    centerDocuments,
    setDoctorInfo,
    setCenterInfo,
    setDoctorDocuments,
    setCenterDocuments,
  } = useVerifyInfoStore();
  
  // Obtener datos del centro desde el API usando React Query
  const {
    data: centerProfile,
    isLoading: isCenterLoading,
    error: centerError,
    refetch: refetchCenter,
  } = useCenterProfile({
    enabled: !isDoctor, // Solo ejecutar si NO es doctor
    language: i18n.language,
    staleTime: 1000 * 60 * 15,
  });

  const {
    data: centerDocsResponse,
    refetch: refetchCenterDocuments,
  } = useCenterDocuments({
    // Keep sidebar progress status accurate from first render.
    // If we fetch only when opening the documents tab, status jumps from
    // pending to approved/rejected after tab change.
    enabled: !isDoctor,
    language: i18n.language,
    staleTime: 1000 * 60 * 15,
  });

  const isVerificationNotification = (event: NotificacionEvent): boolean => {
    const normalizeText = (value?: string) =>
      String(value || "")
        .normalize("NFD")
        .replace(/[\u0300-\u036f]/g, "")
        .toLowerCase();

    const entityHints = [
      "documento",
      "document",
      "verificacion",
      "verification",
      "info personal",
      "información personal",
      "personal_info",
      "estadoinfopersonal",
    ];

    const statusHints = [
      "aprob",
      "approved",
      "rechaz",
      "rejected",
      "pendient",
      "pending",
      "revision",
      "review",
    ];

    const entity = normalizeText(event.tipoEntidad);
    const title = normalizeText(event.titulo);
    const message = normalizeText(event.mensaje);
    const alertType = normalizeText(event.tipoAlerta);
    const haystack = `${title} ${message} ${alertType}`;

    const hasVerificationEntity = entityHints.some((hint) =>
      entity.includes(hint),
    );

    const hasVerificationText =
      entityHints.some((hint) => haystack.includes(hint)) &&
      statusHints.some((hint) => haystack.includes(hint));

    return hasVerificationEntity || hasVerificationText;
  };

  const isRefreshingFromNotificationRef = useRef(false);
  const lastNotificationRefreshAtRef = useRef(0);

  useEffect(() => {
    const refreshFromNotification = async () => {
      const now = Date.now();
      if (
        isRefreshingFromNotificationRef.current ||
        now - lastNotificationRefreshAtRef.current < 1200
      ) {
        return;
      }

      isRefreshingFromNotificationRef.current = true;
      lastNotificationRefreshAtRef.current = now;

      try {
        if (isDoctor) {
          await queryClient.invalidateQueries({
            queryKey: [...QUERY_KEYS.DOCTORS, "me"],
          });
          await refetchDoctor();
          return;
        }

        await Promise.all([
          queryClient.invalidateQueries({
            queryKey: [...QUERY_KEYS.CENTERS, "me"],
          }),
          queryClient.invalidateQueries({
            queryKey: [...QUERY_KEYS.CENTERS, "documents", "my"],
          }),
          refetchCenter(),
          refetchCenterDocuments(),
        ]);
      } finally {
        isRefreshingFromNotificationRef.current = false;
      }
    };

    const unsubscribe = socketService.onNewNotification((event) => {
      if (!event || !isVerificationNotification(event)) return;
      void refreshFromNotification();
    });

    return () => {
      unsubscribe();
    };
  }, [
    isDoctor,
    queryClient,
    refetchDoctor,
    refetchCenter,
    refetchCenterDocuments,
  ]);

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

    
    const secondarySpecialty =
      secondarySpecialties.length > 0 ? secondarySpecialties[0] : undefined;

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
      comentarioVerificacion:
        doctor.comentarioVerificacion || undefined,
      verificationStatus:
        verificationStatusMap[
          ((doctor as any).estadoInfoPersonal ?? doctor.estadoVerificacion) as string
        ] || "PENDING",
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

    const mapRevisionStatus = (estadoRevision?: string): "PENDING" | "APPROVED" | "REJECTED" =>
      estadoRevision === "Pendiente"
        ? "PENDING"
        : estadoRevision === "Aprobado"
          ? "APPROVED"
          : "REJECTED";

    const getDocumentFeedback = (doc: any): string | undefined =>
      doc?.comentarioAdmin || doc?.feedback || undefined;

    const certificationStatuses = certificationDoc.map((cert: any) =>
      mapRevisionStatus(cert.estadoRevision)
    );
    const certificationsStatus = certificationStatuses.length
      ? certificationStatuses.some((status) => status === "REJECTED")
        ? "REJECTED"
        : certificationStatuses.some((status) => status === "PENDING")
          ? "PENDING"
          : "APPROVED"
      : undefined;

    const rejectedCertification = certificationDoc.find(
      (cert) => mapRevisionStatus((cert as any).estadoRevision) === "REJECTED"
    );
    const certificationWithFeedback = certificationDoc.find((cert) =>
      Boolean(getDocumentFeedback(cert as any))
    );
    const certificationsFeedback =
      getDocumentFeedback(rejectedCertification as any) ||
      getDocumentFeedback(certificationWithFeedback as any) ||
      undefined;

    console.log("Transforming doctor documents:", { identityDocs, academicDoc, certificationDoc });
    return {
      // ✅ Mapear todos los documentos de identidad encontrados
      identityDocumentFiles: identityDocs.map((identityDoc: any) => ({
        id: identityDoc.id,
        url: identityDoc.urlArchivo,
        name: identityDoc.nombreOriginal,
        type: identityDoc.tipoMime,
        size: identityDoc.tamanio_bytes || 0,
        uploadedAt: identityDoc.creadoEn,
        verificationStatus: mapRevisionStatus(identityDoc.estadoRevision),
        feedback: getDocumentFeedback(identityDoc),
      })),
      academicTitle: academicDoc
        ? {
            id: academicDoc.id,
            url: academicDoc.urlArchivo,
            name: academicDoc.nombreOriginal,
            type: academicDoc.tipoMime,
            size: academicDoc.tamanio_bytes || 0,
            uploadedAt: academicDoc.creadoEn,
            verificationStatus: mapRevisionStatus(academicDoc.estadoRevision),
            feedback: getDocumentFeedback(academicDoc),
          }
        : undefined,
      certifications: certificationDoc.map((cert: any) => ({
        id: cert.id,
        url: cert.urlArchivo,
        name: cert.nombreOriginal,
        type: cert.tipoMime,
        size: cert.tamanio_bytes || 0,
        uploadedAt: cert.creadoEn,
      })),
      certificationsStatus,
      certificationsFeedback,
    };
  };

  // Transformar datos del centro del API al formato esperado por el componente
  const transformCenterData = (center: any): import("@/schema/verifyInfo.schema").CenterPersonalInfo | null => {
    if (!center) return null;

    // Puede venir dentro de { data: { ... } } dependiendo del servicio
    const payload = center.data || center;

    const verificationStatusMap: Record<string, "PENDING" | "APPROVED" | "REJECTED"> = {
      "En revisión": "PENDING",
      "En Revisión": "PENDING",
      "Under review": "PENDING",
      Aprobado: "APPROVED",
      Rechazado: "REJECTED",
      Approved: "APPROVED",
      Rejected: "REJECTED",
    };

    const ubicacion = payload.ubicacion || {};

    const asNumericString = (...values: unknown[]): string => {
      for (const value of values) {
        const raw = String(value ?? "").trim();
        if (/^\d+$/.test(raw)) {
          return raw;
        }
      }
      return "";
    };

    const provinceId = asNumericString(
      ubicacion.provinciaId,
      ubicacion.provincia_id,
      ubicacion.provincia?.id,
      ubicacion.barrio?.seccion?.provinciaId,
      ubicacion.barrio?.seccion?.id_provincia
    );

    const municipalityId = asNumericString(
      ubicacion.municipioId,
      ubicacion.municipio_id,
      ubicacion.municipio?.id,
      ubicacion.barrio?.seccion?.municipioId,
      ubicacion.barrio?.seccion?.id_municipio
    );

    const districtId = asNumericString(
      ubicacion.distritoId,
      ubicacion.distrito_id,
      ubicacion.distritoMunicipalId,
      ubicacion.distritoMunicipal?.id,
      ubicacion.barrio?.seccion?.distritoMunicipalId,
      ubicacion.barrio?.seccion?.distrito_id
    );

    const sectionId = asNumericString(
      ubicacion.seccionId,
      ubicacion.seccion_id,
      ubicacion.seccion?.id,
      ubicacion.barrio?.seccionId,
      ubicacion.barrio?.seccion?.id
    );

    const barrioId = asNumericString(ubicacion.barrioId, ubicacion.barrio?.id);

    return {
      name: payload.nombreComercial || payload.nombre || "",
      description: payload.descripcion || "",
      website: payload.sitio_web || payload.sitioWeb || undefined,
      address: ubicacion.direccionCompleta || ubicacion.direccion || "",
      province: provinceId,
      municipality: municipalityId,
      district: districtId,
      section: sectionId,
      codigoPostal: ubicacion.codigoPostal || "",
      barrioId,
      rnc: payload.rnc || "",
      centerType: String(payload.tipoCentro?.id || payload.tipoCentroId || ""),
      centerTypeLabel: payload.tipoCentro?.nombre || payload.tipoCentro || "",
      phone: payload.usuario?.telefono || payload.telefono || "",
      email: payload.usuario?.email || payload.email || "",
      coordinates: {
        latitude: ubicacion.latitud ?? 0,
        longitude: ubicacion.longitud ?? 0,
      },
      comentarioVerificacion:
        payload.comentarioVerificacion || payload.comentario_verificacion || payload.comentario || payload.feedback || undefined,
      verificationStatus:
        verificationStatusMap[
          (payload.estadoInfoPersonal ?? payload.estadoVerificacion) as string
        ] || "PENDING",
    };
  };

  const transformCenterDocuments = (resp: any): import("@/schema/verifyInfo.schema").CenterDocuments | null => {
    if (!resp) return null;
    const payload = resp.data || resp;
    const docs = payload.documentos || payload.data?.documentos || [];


    // Buscar certificado sanitario
    const cert = docs.find((d: any) => /certific/i.test(String(d.tipoDocumento).toLowerCase()) || String(d.tipoDocumento).toLowerCase().includes('sanitaria'));

    if (!cert) return null;

    const verificationStatus = cert.estadoRevision === 'Pendiente' ? 'PENDING' : cert.estadoRevision === 'Aprobado' ? 'APPROVED' : 'REJECTED';

    return {
      healthCertificateFile: {
        id: cert.id,
        url: cert.urlArchivo,
        name: cert.nombreOriginal || cert.urlArchivo?.split('/').pop() || 'certificado.pdf',
        type: cert.tipoMime || 'application/pdf',
        size: cert.tamanio_bytes || 0,
        uploadedAt: cert.creadoEn,
        verificationStatus: verificationStatus as any,
        feedback: cert.comentarioAdmin || cert.feedback || undefined,
      },
    };
  };

  const transformedDoctorInfo = useMemo(
    () => (isDoctor && doctorProfile ? transformDoctorData(doctorProfile) : null),
    [doctorProfile, isDoctor, user?.email, i18n.language],
  );

  const transformedCenterInfo = useMemo(
    () => (!isDoctor && centerProfile ? transformCenterData(centerProfile) : null),
    [centerProfile, isDoctor, i18n.language],
  );

  const transformedDoctorDocuments = useMemo(
    () => (isDoctor && doctorProfile ? transformDoctorDocuments(doctorProfile) : null),
    [doctorProfile, isDoctor, i18n.language],
  );

  const transformedCenterDocuments = useMemo(
    () =>
      !isDoctor && centerDocsResponse
        ? transformCenterDocuments(centerDocsResponse)
        : null,
    [centerDocsResponse, isDoctor, i18n.language],
  );

  // Sincronizar datos del API al store evitando escrituras redundantes
  useEffect(() => {
    if (isDoctor && transformedDoctorInfo) {
      if (JSON.stringify(doctorInfo) !== JSON.stringify(transformedDoctorInfo)) {
        setDoctorInfo(transformedDoctorInfo);
      }
    }

    if (!isDoctor && transformedCenterInfo) {
      if (JSON.stringify(centerInfo) !== JSON.stringify(transformedCenterInfo)) {
        setCenterInfo(transformedCenterInfo);
      }
    }
  }, [
    doctorInfo,
    centerInfo,
    transformedDoctorInfo,
    transformedCenterInfo,
    isDoctor,
    setDoctorInfo,
    setCenterInfo,
    i18n.language
  ]);

  // Sincronizar documentos desde API al store evitando escrituras redundantes
  useEffect(() => {
    if (isDoctor && transformedDoctorDocuments) {
      if (
        JSON.stringify(doctorDocuments) !==
        JSON.stringify(transformedDoctorDocuments)
      ) {
        setDoctorDocuments(transformedDoctorDocuments);
      }
    }

    if (!isDoctor && transformedCenterDocuments) {
      if (
        JSON.stringify(centerDocuments) !==
        JSON.stringify(transformedCenterDocuments)
      ) {
        // setCenterDocuments viene del store
         
        setCenterDocuments(transformedCenterDocuments);
      }
    }
  }, [
    doctorDocuments,
    centerDocuments,
    transformedDoctorDocuments,
    transformedCenterDocuments,
    isDoctor,
    setDoctorDocuments,
    setCenterDocuments,
    i18n.language
  ]);

  // Usar datos del store o datos mock según el rol
  const currentInfo = isDoctor
    ? isDoctorLoading
      ? null
      : doctorInfo || mockDoctorData
    : isCenterLoading
    ? null
    : centerInfo || mockCenterData;

  const currentStatus: VerificationStatus = currentInfo
    ? currentInfo.verificationStatus
    : "PENDING";

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

  const handleSubmit = async (data: DoctorPersonalInfo | CenterPersonalInfo) => {
    const normalize = (value?: string | null) => (value || "").trim();
    const sameCoords = (
      a?: { latitude: number; longitude: number },
      b?: { latitude: number; longitude: number }
    ) => {
      if (!a && !b) return true;
      if (!a || !b) return false;
      return a.latitude === b.latitude && a.longitude === b.longitude;
    };

    if (isDoctor) {
      const next = data as DoctorPersonalInfo;
      const prev = currentInfo as DoctorPersonalInfo;

      const hasDoctorChanges =
        normalize(next.firstName) !== normalize(prev.firstName) ||
        normalize(next.lastName) !== normalize(prev.lastName) ||
        normalize(next.phone) !== normalize(prev.phone) ||
        normalize(next.nationality) !== normalize(prev.nationality);

      if (!hasDoctorChanges) {
        toast.info(t("verification.identification.noChanges"));
        setIsEditing(false);
        return;
      }

      setIsSubmitting(true);
      try {
        await doctorService.updateProfile({
          nombre: normalize(next.firstName),
          apellido: normalize(next.lastName),
          telefono: normalize(next.phone),
          nacionalidad: normalize(next.nationality),
        });

        await queryClient.invalidateQueries({
          queryKey: [...QUERY_KEYS.DOCTORS, "me"],
        });
        await refetchDoctor();

        const updatedData = {
          ...next,
          verificationStatus: "PENDING" as const,
        };
        setDoctorInfo(updatedData);
        setIsEditing(false);
        toast.success(t("verification.identification.updateSuccess"));
      } catch (error: any) {
        const serverMessage =
          error?.response?.data?.message ||
          error?.message ||
          t("verification.identification.updateError");

        toast.error(serverMessage);
      } finally {
        setIsSubmitting(false);
      }

      return;
    }

    const next = data as CenterPersonalInfo;
    const prev = currentInfo as CenterPersonalInfo;

    const hasGeneralChanges =
      normalize(next.name) !== normalize(prev.name) ||
      normalize(next.description) !== normalize(prev.description) ||
      normalize(next.website) !== normalize(prev.website) ||
      normalize(next.rnc) !== normalize(prev.rnc) ||
      normalize(next.phone) !== normalize(prev.phone) ||
      normalize(next.centerType) !== normalize(prev.centerType);

    const hasCoordinatesChanges = !sameCoords(next.coordinates, prev.coordinates);

    const hasLocationChanges =
      normalize(next.address) !== normalize(prev.address) ||
      normalize(next.codigoPostal) !== normalize(prev.codigoPostal) ||
      normalize(next.barrioId) !== normalize(prev.barrioId) ||
      hasCoordinatesChanges;

    if (!hasGeneralChanges && !hasLocationChanges) {
      toast.info(t("verification.identification.noChanges"));
      setIsEditing(false);
      return;
    }

    const requests: Promise<unknown>[] = [];
    let locationRequestIndex = -1;

    if (hasGeneralChanges) {
      requests.push(
        centerService.updateProfile({
          nombreComercial: normalize(next.name),
          rnc: normalize(next.rnc),
          tipoCentroId: Number(next.centerType),
          sitio_web: normalize(next.website),
          descripcion: normalize(next.description),
          telefono: normalize(next.phone),
        })
      );
    }

    if (hasLocationChanges) {
      const barrioId = Number(next.barrioId || prev.barrioId || 0);

      if (!barrioId || !normalize(next.address)) {
        toast.error(t("verification.identification.locationRequiredError"));
        return;
      }

      const locationPayload: UpdateCenterLocationRequest = {
        barrioId,
        direccion: normalize(next.address),
        codigoPostal: normalize(next.codigoPostal) || undefined,
      };

      if (
        hasCoordinatesChanges &&
        typeof next.coordinates?.latitude === "number" &&
        typeof next.coordinates?.longitude === "number"
      ) {
        locationPayload.latitud = next.coordinates.latitude;
        locationPayload.longitud = next.coordinates.longitude;
      }

      requests.push(centerService.updateMyLocation(locationPayload));
      locationRequestIndex = requests.length - 1;
    }

    setIsSubmitting(true);
    try {
      const responses = await Promise.all(requests);

      if (hasLocationChanges && locationRequestIndex >= 0) {
        const locationResponse = responses[locationRequestIndex] as UpdateCenterLocationResponse;

        queryClient.setQueryData(
          [...QUERY_KEYS.CENTERS, "me", i18n.language],
          (oldData: any) => {
            if (!oldData) return oldData;

            const wrapper = oldData?.data ? oldData : { data: oldData };
            const payload = wrapper.data || {};
            const currentUbicacion = payload.ubicacion || {};

            return {
              ...wrapper,
              data: {
                ...payload,
                ubicacion: {
                  ...currentUbicacion,
                  barrioId: locationResponse?.data?.barrioId ?? currentUbicacion.barrioId,
                  direccion: locationResponse?.data?.direccion ?? currentUbicacion.direccion,
                  direccionCompleta:
                    locationResponse?.data?.direccion ?? currentUbicacion.direccionCompleta,
                  codigoPostal:
                    locationResponse?.data?.codigoPostal ?? currentUbicacion.codigoPostal,
                  latitud: next.coordinates?.latitude ?? currentUbicacion.latitud,
                  longitud: next.coordinates?.longitude ?? currentUbicacion.longitud,
                },
              },
            };
          }
        );
      }

      await queryClient.invalidateQueries({
        queryKey: [...QUERY_KEYS.CENTERS, "me"],
      });
      await refetchCenter();

      const updatedData = {
        ...next,
        verificationStatus: "PENDING" as const,
      };

      setCenterInfo(updatedData);
      setIsEditing(false);

      if (!hasGeneralChanges && hasLocationChanges && locationRequestIndex >= 0) {
        const locationResponse = responses[locationRequestIndex] as UpdateCenterLocationResponse;
        toast.success(locationResponse?.message || t("verification.identification.updateSuccess"));
      } else {
        toast.success(t("verification.identification.updateSuccess"));
      }
    } catch (error: any) {
      const serverMessage =
        error?.response?.data?.message ||
        error?.message ||
        t("verification.identification.updateError");

      toast.error(serverMessage);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <MCDashboardContent mainWidth="w-[100%]" noBg>
      <div className="min-h-screen w-full">
        <div className="max-w-6xl mx-auto px-2 sm:px-6 lg:px-8">
          {/* Error / Loading / Content flow for both roles */}
          {(isDoctor && doctorError) || (!isDoctor && centerError) ? (
            <div className="bg-destructive/10 border border-destructive/20 rounded-lg p-4 mb-4">
              <h3 className="font-semibold text-destructive mb-2">Error al cargar el perfil</h3>
              <p className="text-sm text-destructive/80">
                {(isDoctor ? doctorError?.message : centerError?.message) || 'No se pudo cargar la información del perfil. Por favor, intenta nuevamente.'}
              </p>
              <div className="mt-3 flex gap-2">
                <MCButton size="sm" onClick={() => { if (isDoctor) refetchDoctor?.(); else refetchCenter?.(); }}>
                  Reintentar
                </MCButton>
              </div>
            </div>
          ) : (isDoctor && isDoctorLoading) || (!isDoctor && isCenterLoading) ? (
            <VerifyInfoSkeleton />
          ) : (
            <section className="flex flex-col gap-4 sm:grid sm:grid-cols-[3fr_7fr]">
              <VerificationProgressSidebar
                activeTab={activeTab}
                currentStatus={currentStatus}
                documentsStatus={documentsStatus}
                isDoctor={isDoctor}
                onTabChange={setActiveTab}
              />

              <main className="mt-4 sm:mt-0">
                {activeTab === "identificacion" && currentInfo && (
                  <IdentificationCard
                    isDoctor={isDoctor}
                    isEditing={isEditing}
                    isSubmitting={isSubmitting}
                    currentStatus={currentStatus}
                    currentInfo={currentInfo as any}
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
