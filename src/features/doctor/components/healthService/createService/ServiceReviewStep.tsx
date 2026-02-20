import { useCreateServicesStore } from "@/stores/useCreateServicesStore";
import ServicesLayoutsSteps from "./ServicesLayoutsSteps";
import AuthFooterContainer from "@/features/auth/components/AuthFooterContainer";
import { useTranslation } from "react-i18next";
import { useIsMobile } from "@/lib/hooks/useIsMobile";
import PhotoGallery from "../PhotoGallery";
import MapScheduleLocation from "@/shared/components/maps/MapScheduleLocation";
import { useNavigate } from "react-router-dom";

const locationsData = [
  {
    id: 1,
    name: "Clínica Abreu",
    address: "Av. Independencia 105, Santo Domingo",
    latitude: 18.4636,
    longitude: -69.9271,
  },
  {
    id: 2,
    name: "Centro Médico UCE",
    address: "Av. Máximo Gómez 46, Santo Domingo",
    latitude: 18.4762,
    longitude: -69.9117,
  },
];

const mappedLocations = locationsData.map((loc) => ({
  lat: loc.latitude,
  lng: loc.longitude,
  label: loc.name || loc.address,
  color: "#e11d48",
}));

function ServiceReviewStep() {
  const { t } = useTranslation("doctor");
  const isMobile = useIsMobile();

  const serviceCreateData = useCreateServicesStore((s) => s.createServiceData);
  const goToPreviousStep = useCreateServicesStore((s) => s.goToPreviousStep);
  const navigate = useNavigate();

  const handleSubmit = () => {
    navigate("/doctor/services");
  };

  const modality = serviceCreateData.selectedModality;

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
              {serviceCreateData.specialty}
            </p>
          </div>
          <div>
            <h4
              className={`${isMobile ? "text-sm" : "text-md"} font-medium text-primary/75`}
            >
              {t("createService.review.modality")}
            </h4>
            <p className={isMobile ? "text-base" : "text-lg"}>
              {serviceCreateData.selectedModality}
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
              showAddressInfo
              multipleLocations={mappedLocations}
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
            onClick: handleSubmit,
            children: t("createService.review.save"),
          }}
          backButtonProps={{
            onClick: () => goToPreviousStep(),
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
