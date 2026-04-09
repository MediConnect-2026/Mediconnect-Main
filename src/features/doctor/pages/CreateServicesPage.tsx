import MCDashboardContent from "@/shared/layout/MCDashboardContent";
import MCStepper from "@/shared/components/MCStepper";
import { useTranslation } from "react-i18next";
import {
  MapPin,
  Image,
  Stethoscope,
  Calendar,
  CircleCheck,
} from "lucide-react";
import type { StepStatus } from "@/shared/components/MCStepper";
import { useCreateServicesStore } from "@/stores/useCreateServicesStore";
import { useParams, useLocation, useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import { ROUTES } from "@/router/routes";
import { doctorService } from "@/shared/navigation/userMenu/editProfile/doctor/services";
import ServiceTittleStep from "../components/healthService/createService/ServiceTittleStep";
import ServiceBasicInfoStep from "../components/healthService/createService/ServiceBasicInfoStep";
import ServiceLocationStep from "../components/healthService/createService/ServiceLocationStep";
import ServiceScheduleStep from "../components/healthService/createService/ServiceScheduleStep";
import ServiceImagesStep from "../components/healthService/createService/ServiceImagesStep";
import ServiceReviewStep from "../components/healthService/createService/ServiceReviewStep";

function CreateServicesPage() {
  const { t } = useTranslation("doctor");
  const { serviceId } = useParams<{ serviceId?: string }>();
  const isEditMode = Boolean(serviceId);

  const navigate = useNavigate();

  const stepsStatus = useCreateServicesStore(
    (state) => state.createServiceStep,
  );
  const currentFirst = useCreateServicesStore((state) => state.isTitleSeted);
  const currentStep = useCreateServicesStore((state) => state.currentStep);
  const createServiceData = useCreateServicesStore((s) => s.createServiceData);
  const setCreateServiceData = useCreateServicesStore((s) => s.setCreateServiceData);
  const setLocationDataInStore = useCreateServicesStore((s) => s.setLocationData);

  const location = useLocation();
  const [loadingService, setLoadingService] = useState(false);

  const [serviceError, setServiceError] = useState<string | null>(null);

  const isTeleconsulta = createServiceData.selectedModality === "teleconsulta";

  const titleByStep = [
    t("createService.steps.serviceDetails"),
    t("createService.steps.location"),
    t("createService.steps.comercialSchedule"),
    t("createService.steps.images"),
    t("createService.steps.summary"),
  ];

  const stepIcons = [
    <Stethoscope key="stethoscope" />,
    <MapPin key="mappin" />,
    <Calendar key="calendar" />,
    <Image key="image" />,
    <CircleCheck key="check" />,
  ];

  const filteredStepIcons = isTeleconsulta
    ? [stepIcons[0], stepIcons[2], stepIcons[3], stepIcons[4]]
    : stepIcons;

  const filteredTitleByStep = isTeleconsulta
    ? [titleByStep[0], titleByStep[2], titleByStep[3], titleByStep[4]]
    : titleByStep;

  const filteredStepsStatus = isTeleconsulta
    ? stepsStatus.filter((_, idx) => idx !== 1)
    : stepsStatus;

  const steps = filteredStepsStatus.map((step, idx) => {
    const key = Object.keys(step)[0];
    const stepObj = step[key as keyof typeof step] as { status: StepStatus };

    return {
      icon: filteredStepIcons[idx],
      status: stepObj.status,
    };
  });

  useEffect(() => {
    let ac: AbortController | null = null;

    const normalizeModalidad = (modalidad: string | undefined) => {
      if (!modalidad) return "presencial";
      const m = modalidad.toLowerCase();
      if (m.includes("mixta")) return "Mixta";
      if (m.includes("tele") || m.includes("virtual")) return "teleconsulta";
      return "presencial";
    };

    const loadService = async (rawId: string) => {
      const parsed = Number(rawId);
      if (!Number.isInteger(parsed) || parsed <= 0) {
        navigate(ROUTES.DOCTOR.SERVICES, { replace: true });
        return;
      }

      ac = new AbortController();
      setLoadingService(true);
      setServiceError(null);

      try {
        const res = await doctorService.getServiceById(parsed);
        if (ac?.signal?.aborted) return;

        const svc = res?.data ?? res;
        if (!svc) throw new Error("Servicio no encontrado");

        const mapped = {
          name: svc.nombre || "",
          description: svc.descripcion || "",
          specialty: svc.especialidad?.id ? String(svc.especialidad.id) : "",
          specialityName: svc.especialidad?.nombre || "",
          selectedModality: normalizeModalidad(svc.modalidad),
          pricePerSession: typeof svc.precio === "number" ? svc.precio : Number(svc.precio) || 1,
          numberOfSessions: 1,
          duration: {
            hours: Math.floor((svc.duracionMinutos || 0) / 60),
            minutes: (svc.duracionMinutos || 0) % 60,
          },
          images: Array.isArray(svc.imagenes)
            ? svc.imagenes.map((img: any) => ({ id: img.id, url: img.url, name: img.name || "", type: img.type || "image" }))
            : [],
          location: svc.ubicacionId ?? undefined,
          comercial_schedule: Array.isArray(svc.horarios) && svc.horarios.length > 0
            ? svc.horarios.map((h: any) => h.horarioId || h.horario?.id).filter(Boolean)
            : null,
        };

        const provinceInLocation = {
          id: svc.ubicacion[0]?.barrio?.seccion?.municipio?.provincia?.id || undefined,
          name: svc.ubicacion[0]?.barrio?.seccion?.municipio?.provincia?.nombre || "",
        };

        const municipalityInLocation = {
          id: svc.ubicacion[0]?.barrio?.seccion?.municipio?.id || undefined,
          name: svc.ubicacion[0]?.barrio?.seccion?.municipio?.nombre || "",
        };

        const sectionInLocation = {
          id: svc.ubicacion[0]?.barrio?.seccion?.id || undefined,
          name: svc.ubicacion[0]?.barrio?.seccion?.nombre || "",
        };

        const districtInLocation = {
          id: svc.ubicacion[0]?.barrio?.seccion?.distritoMunicipal?.id || undefined,
          name: svc.ubicacion[0]?.barrio?.seccion?.distritoMunicipal?.nombre || "",
        };

        const neighborhoodInLocation = {
          id: svc.ubicacion[0]?.barrio?.id || undefined,
          name: svc.ubicacion[0]?.barrio?.nombre || "",
        };

        const locationData = {
          name: svc.ubicacion[0]?.nombre || "",
          address: svc.ubicacion[0]?.direccion || "",
          province: provinceInLocation.id ? String(provinceInLocation.id) : "",
          municipality: municipalityInLocation.id ? String(municipalityInLocation.id) : "",
          section: sectionInLocation.id ? String(sectionInLocation.id) : "",
          district: districtInLocation.id ? String(districtInLocation.id) : "",
          neighborhood: neighborhoodInLocation.id ? String(neighborhoodInLocation.id) : "",
          coordinates: {
            latitude: svc.ubicacion[0]?.latitud ?? undefined,
            longitude: svc.ubicacion[0]?.longitud ?? undefined,
          },
        };

        setLocationDataInStore(locationData);
        setCreateServiceData(mapped as any);
      } catch (err: any) {
        if (err?.name === "AbortError") return;
        console.error("Error loading service for edit:", err);
        setServiceError(err?.message || "Error al cargar el servicio");
      } finally {
        setLoadingService(false);
      }
    };
    
    if (isEditMode && serviceId) {
      if (serviceId.startsWith(":")) {
        const parts = location.pathname.split("/").filter(Boolean);
        const last = parts[parts.length - 1];
        if (last && last !== serviceId) {
          navigate(`/doctor/services/edit/${last}`, { replace: true });
          loadService(last);
        } else {
          navigate(ROUTES.DOCTOR.SERVICES, { replace: true });
        }
      } else {
        loadService(serviceId);
      }
    }

    return () => { if (ac) ac.abort(); };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isEditMode, serviceId, location.pathname]);

  const renderStepComponent = () => {
    if (!currentFirst) {
      return <ServiceTittleStep />;
    }

    if (isTeleconsulta) {
      switch (currentStep) {
        case 0:
          return <ServiceBasicInfoStep />;
        case 2:
          return <ServiceScheduleStep isEditMode={isEditMode} />;
        case 3:
          return <ServiceImagesStep isEditMode={isEditMode} serviceId={serviceId ? Number(serviceId) : undefined} />;
        case 4:
          return <ServiceReviewStep isEditMode={isEditMode} serviceId={serviceId ? Number(serviceId) : undefined} />;
        default:
          return <ServiceBasicInfoStep />;
      }
    } else {
      switch (currentStep) {
        case 0:
          return <ServiceBasicInfoStep />;
        case 1:
          return <ServiceLocationStep />;
        case 2:
          return <ServiceScheduleStep isEditMode={isEditMode} />;
        case 3:
          return <ServiceImagesStep isEditMode={isEditMode} serviceId={serviceId ? Number(serviceId) : undefined} />;
        case 4:
          return <ServiceReviewStep isEditMode={isEditMode} serviceId={serviceId ? Number(serviceId) : undefined} />;
        default:
          return <ServiceBasicInfoStep />;
      }
    }
  };

  const getVisibleStepNumber = () => {
    if (!currentFirst) return 1;
    if (isTeleconsulta && currentStep >= 2) {
      return currentStep - 1;
    }
    return currentStep + 1;
  };

  const getTotalSteps = () => {
    return isTeleconsulta ? 4 : 5;
  };

  return (
    <MCDashboardContent create={true}>
      <div className="w-full flex flex-col items-center justify-center">
        <div className="flex flex-col justify-center items-center">
          <h1 className="text-lg text-center text-primary mt-1">
            {filteredTitleByStep[getVisibleStepNumber() - 1]}
          </h1>
          <span className="opacity-40">
            {t("createService.common.step")} {getVisibleStepNumber()}{" "}
            {t("createService.common.of")} {getTotalSteps()}
          </span>
        </div>
        <div className="w-full mt-4">
          <MCStepper items={steps} />
        </div>
      </div>

      {loadingService && (
        <div className="flex justify-center items-center p-8 w-full">
          <div className="w-12 h-12 border-4 border-primary/30 border-t-primary rounded-full animate-spin" />
        </div>
      )}

      {serviceError && (
        <div className="my-4 p-3 rounded bg-destructive/10 text-destructive w-full text-center">
          {serviceError}
        </div>
      )}

      <div>{renderStepComponent()}</div>
      <div className="w-full py-4">
        <div className="w-full px-4 sm:px-6"></div>
      </div>
    </MCDashboardContent>
  );
}

export default CreateServicesPage;
