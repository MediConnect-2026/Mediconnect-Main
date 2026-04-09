import { useCreateServicesStore } from "@/stores/useCreateServicesStore";
import ServicesLayoutsSteps from "./ServicesLayoutsSteps";
import AuthFooterContainer from "@/features/auth/components/AuthFooterContainer";
import { useTranslation } from "react-i18next";
import { useIsMobile } from "@/lib/hooks/useIsMobile";
import PhotoGallery from "../PhotoGallery";
import MapScheduleLocation from "@/shared/components/maps/MapScheduleLocation";
import { useNavigate } from "react-router-dom";
import { mapDoctorServices } from "@/features/onboarding/services/doctor-registration.mapper";
import { doctorService } from "@/shared/navigation/userMenu/editProfile/doctor/services";
import { useGlobalUIStore } from "@/stores/useGlobalUIStore";
import { useState } from "react";
import { ROUTES } from "@/router/routes";

function ServiceReviewStep({ isEditMode = false, serviceId }: { isEditMode?: boolean; serviceId?: number }) {
  const { t } = useTranslation("doctor");
  const isMobile = useIsMobile();
  const navigate = useNavigate();
  const setToast = useGlobalUIStore((state) => state.setToast);

  const [isSubmitting, setIsSubmitting] = useState(false);

  const serviceCreateData = useCreateServicesStore((s) => s.createServiceData);
  const goToPreviousStep = useCreateServicesStore((s) => s.goToPreviousStep);
  const clearCreateServiceData = useCreateServicesStore((s) => s.clearComercialScheduleData); // ✅ Opcional: limpiar datos después de crear
  const locationData = useCreateServicesStore((s) => s.locationData);

  const handleSubmit = async () => {
    
    setIsSubmitting(true);

    try {
      // ✅ Mapear datos
      const request = await mapDoctorServices(serviceCreateData);
      
      // ✅ Crear servicio
      await doctorService.createService(request);

      // ✅ Mostrar mensaje de éxito
      setToast({
        type: "success",
        message: t("createService.review.successMessage"),
        open: true,
      });

      clearCreateServiceData();

      // ✅ Navegar a la página de servicios
      navigate("/doctor/services");

    } catch (error: any) {
      console.log("Error al crear el servicio:", error);

      // ✅ Determinar el mensaje de error apropiado
      let errorMessage = t("createService.review.errorMessage");

      // ✅ Caso 1: Error de Axios original (Opción 1)
      if (error.response?.data) {
        const errorData = error.response.data;
        
        // Si el backend envía un mensaje específico
        if (errorData.message) {
          errorMessage = errorData.message;
        }
        // Errores por código de estado
        else if (error.response.status === 400) {
          errorMessage = t("createService.review.validationError");
        }
        else if (error.response.status === 409) {
          errorMessage = t("createService.review.conflictError");
        }
        else if (error.response.status === 401 || error.response.status === 403) {
          errorMessage = t("createService.review.authError");
        }
        else if (error.response.status >= 500) {
          errorMessage = t("createService.review.serverError");
        }
      }
      // ✅ Caso 2: Error personalizado (Opción 2)
      else if (error.statusCode) {
        errorMessage = error.message;
        
        if (error.statusCode === 400) {
          errorMessage = error.message || t("createService.review.validationError");
        }
        else if (error.statusCode === 409) {
          errorMessage = t("createService.review.conflictError");
        }
        else if (error.statusCode === 401 || error.statusCode === 403) {
          errorMessage = t("createService.review.authError");
        }
        else if (error.statusCode >= 500) {
          errorMessage = t("createService.review.serverError");
        }
      }
      // ✅ Caso 3: Error de JavaScript simple
      else if (error.message) {
        errorMessage = error.message;
      }
      // ✅ Error de red
      else if (!error.response && error.code === "ERR_NETWORK") {
        errorMessage = t("createService.review.networkError");
      }

      // ✅ Mostrar mensaje de error
      setToast({
        type: "error",
        message: errorMessage,
        open: true,
      });

    } finally {
      setIsSubmitting(false);
    }
  };

  const handleUpdate = async () => {
    if (!serviceId) return;

    if(!serviceCreateData.location || serviceCreateData.location <= 0) {
      setToast({
        type: "error",
        message: t("createService.review.locationError"),
        open: true,
      });
      return;
    }
    // Lógica similar a handleSubmit pero para actualizar un servicio existente
    setIsSubmitting(true);

      try {
        // ✅ Mapear datos
        const mappedDataForUpdate = {
          especialidadId: Number(serviceCreateData.specialty),
          nombre: serviceCreateData.name,
          descripcion: serviceCreateData.description,
          precio: serviceCreateData.pricePerSession,
          duracionMinutos: (serviceCreateData.duration.hours * 60 + serviceCreateData.duration.minutes),
          sesiones: serviceCreateData.numberOfSessions,
          modalidad: serviceCreateData.selectedModality === 'presencial' ? "Presencial" : serviceCreateData.selectedModality === 'teleconsulta' ? "Teleconsulta" : "Mixta",
          ubicacionIds: [serviceCreateData.location || 0],
          horarioIds: serviceCreateData.comercial_schedule || [],
        };

        await doctorService.updateService(serviceId, mappedDataForUpdate);
        
        // ✅ Mostrar mensaje de éxito
        setToast({
          type: "success",
          message: t("createService.review.updateSuccessMessage"),
          open: true,
        });

        // ✅ Navegar a la página de servicios
        navigate(ROUTES.DOCTOR.SERVICES, { replace: true });
      } catch (error) {
        console.log("Error al actualizar el servicio:", error);
        setToast({
          type: "error",
          message: t("createService.review.updateErrorMessage"),
          open: true,
        });
      } finally {
        setIsSubmitting(false);
      }
  };

  const modality = serviceCreateData.selectedModality;
  const selectedEspecialty = serviceCreateData.specialityName || serviceCreateData.specialty || "";
  
  // Validar coordenadas antes de crear la ubicación
  const hasValidCoordinates = 
    locationData?.coordinates?.latitude !== undefined &&
    locationData?.coordinates?.longitude !== undefined &&
    !isNaN(locationData.coordinates.latitude) &&
    !isNaN(locationData.coordinates.longitude) &&
    isFinite(locationData.coordinates.latitude) &&
    isFinite(locationData.coordinates.longitude);

  const locationSelected = hasValidCoordinates ? [{
    lat: locationData.coordinates.latitude,
    lng: locationData.coordinates.longitude,
    label: locationData.name || "",
    color: "#e11d48",
  }] : [];

  return (
    <ServicesLayoutsSteps
      title={t("createService.review.title")}
      description={t("createService.review.description")}
    >
      <div className={`w-full flex flex-col ${isMobile ? "gap-3" : "gap-4"}`}>
        <PhotoGallery
          images={(serviceCreateData.images || []).map((img) => img.url)}
        />
        <div className="w-full flex flex-col">
          <h3 className={`${isMobile ? "text-2xl" : "text-3xl"} font-medium`}>
            {serviceCreateData.name}
          </h3>
          <p
            className={`${isMobile ? "text-base" : "text-lg"} text-primary/80`}
          >
            {serviceCreateData.description}
          </p>
        </div>

        <div
          className={`grid ${isMobile ? "grid-cols-2" : "grid-cols-3"} gap-4`}
        >
          <div>
            <h4
              className={`${isMobile ? "text-sm" : "text-md"} font-medium text-primary/75`}
            >
              {t("createService.review.specialty")}
            </h4>
            <p className={isMobile ? "text-base" : "text-lg"}>
              {selectedEspecialty}
            </p>
          </div>
          <div>
            <h4
              className={`${isMobile ? "text-sm" : "text-md"} font-medium text-primary/75`}
            >
              {t("createService.review.modality")}
            </h4>
            <p className={isMobile ? "text-base" : "text-lg"}>
              {serviceCreateData.selectedModality === "presencial" ? t("createService.review.modalityPresencial") : serviceCreateData.selectedModality === "teleconsulta" ? t("createService.review.modalityTeleconsulta") : t("createService.review.modalityMixta")}
            </p>
          </div>
          <div>
            <h4
              className={`${isMobile ? "text-sm" : "text-md"} font-medium text-primary/75`}
            >
              {t("createService.review.duration")}
            </h4>
            <p className={isMobile ? "text-base" : "text-lg"}>
              {formatDurationDisplay(serviceCreateData.duration)}
            </p>
          </div>
          <div>
            <h4
              className={`${isMobile ? "text-sm" : "text-md"} font-medium text-primary/75`}
            >
              {t("createService.review.pricePerSession")}
            </h4>
            <p className={isMobile ? "text-base" : "text-lg"}>
              ${serviceCreateData.pricePerSession}
            </p>
          </div>
          <div>
            <h4
              className={`${isMobile ? "text-sm" : "text-md"} font-medium text-primary/75`}
            >
              {t("createService.review.numberOfSessions")}
            </h4>
            <p className={isMobile ? "text-base" : "text-lg"}>
              {serviceCreateData.numberOfSessions}
            </p>
          </div>
        </div>

        {(modality === "presencial" || modality === "Mixta") && (
          <div className="flex flex-col gap-2">
            <h2 className={`${isMobile ? "text-lg" : "text-xl"} font-medium`}>
              {t("createService.review.location")}
            </h2>
            <MapScheduleLocation
              showAddressInfo={false}
              multipleLocations={locationSelected}
            />
          </div>
        )}

        {modality === "teleconsulta" && (
          <div className="flex flex-col">
            <h4
              className={`${isMobile ? "text-base" : "text-lg"} font-medium text-primary`}
            >
              {t("createService.review.virtualConsultation")}
            </h4>
            <p
              className={`text-primary opacity-75 ${isMobile ? "text-xs" : "text-sm"}`}
            >
              {t("createService.review.virtualConsultationDescription")}
            </p>
          </div>
        )}

        <AuthFooterContainer
          type="Save"
          continueButtonProps={{
            onClick: isEditMode ? handleUpdate : handleSubmit,
            children: isSubmitting 
              ? t("createService.review.saving") 
              : t("createService.review.save"),
            disabled: isSubmitting, // ✅ Deshabilitar mientras se envía
          }}
          backButtonProps={{
            onClick: () => goToPreviousStep(),
            disabled: isSubmitting, // ✅ Deshabilitar también el botón de atrás
          }}
        />
      </div>
    </ServicesLayoutsSteps>
  );
}

export default ServiceReviewStep;

function formatDurationDisplay(duration: any) {
  if (!duration) return "0m";
  if (typeof duration === "object" && duration !== null) {
    const h = parseInt(duration.hours, 10) || 0;
    const m = parseInt(duration.minutes, 10) || 0;
    if (h === 0) return `${m}m`;
    return `${h}h : ${m}m`;
  }
  if (typeof duration === "string") {
    const [hours, minutes] = duration.split(":");
    const h = parseInt(hours, 10) || 0;
    const m = parseInt(minutes, 10) || 0;
    if (h === 0) return `${m}m`;
    return `${h}h : ${m}m`;
  }
  return "0m";
}