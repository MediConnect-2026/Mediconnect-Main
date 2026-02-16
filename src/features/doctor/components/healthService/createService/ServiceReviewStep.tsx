import { Plus, X } from "lucide-react";
import { useRef, useState, useEffect } from "react";
import { useCreateServicesStore } from "@/stores/useCreateServicesStore";
import ServicesLayoutsSteps from "./ServicesLayoutsSteps";
import AuthFooterContainer from "@/features/auth/components/AuthFooterContainer";
import { useTranslation } from "react-i18next";
import { ImageCarouselModal } from "../ImageCarouselModal";
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

// Mapea la data al formato requerido por MapScheduleLocation
const mappedLocations = locationsData.map((loc) => ({
  lat: loc.latitude,
  lng: loc.longitude,
  label: loc.name || loc.address,
  color: "#e11d48", // Puedes personalizar el color si lo deseas
}));

function ServiceReviewStep() {
  const { t } = useTranslation("doctor");
  const serviceCreateData = useCreateServicesStore((s) => s.createServiceData);
  const goToPreviousStep = useCreateServicesStore((s) => s.goToPreviousStep);
  const navigate = useNavigate();

  const handleSubmit = () => {
    // Aquí puedes agregar lógica para guardar el servicio si es necesario
    navigate("/doctor/services");
  };

  const modality = serviceCreateData.selectedModality;
  return (
    <ServicesLayoutsSteps
      title="Revisar Servicio"
      description="Revisa toda la información de tu servicio antes de publicarlo. Asegúrate de que todo esté correcto para atraer a más pacientes y brindarles la mejor experiencia posible."
    >
      <div className="w-full flex flex-col gap-4">
        <PhotoGallery
          images={(serviceCreateData.images || []).map((img) => img.url)}
        />
        <div className="w-full flex flex-col">
          <h3 className="text-3xl font-medium">{serviceCreateData.name}</h3>
          <p className="text-lg text-primary/80">
            {serviceCreateData.description}
          </p>
        </div>

        <div className="grid grid-cols-3 gap-4">
          <div>
            <h4 className="text-md font-medium text-primary/75 ">
              Especialidad
            </h4>
            <p className="text-lg">{serviceCreateData.specialty}</p>
          </div>
          <div>
            <h4 className="text-md font-medium text-primary/75 ">Modalidad</h4>
            <p className="text-lg">{serviceCreateData.selectedModality}</p>
          </div>
          <div>
            <h4 className="text-md font-medium text-primary/75 ">Duración</h4>
            <p className="text-lg">
              {formatDurationDisplay(serviceCreateData.duration)}
            </p>
          </div>
          <div>
            <h4 className="text-md font-medium text-primary/75 ">
              Precio por sesión
            </h4>
            <p className="text-lg">${serviceCreateData.pricePerSession}</p>
          </div>
          <div>
            <h4 className="text-md  font-medium text-primary/75 ">
              Número de sesiones
            </h4>
            <p className="text-lg">{serviceCreateData.numberOfSessions}</p>
          </div>
        </div>

        <div className="flex flex-col gap-2">
          <h2 className="text-xl font-medium">Ubicación</h2>
          {modality === "presencial" || modality === "Mixta" ? (
            <MapScheduleLocation
              showAddressInfo
              multipleLocations={mappedLocations}
            />
          ) : (
            <div>
              <h4 className="text-lg font-semibold text-primary mb-1">
                Consulta virtual
              </h4>
              <p className="text-primary opacity-75 text-sm">
                La consulta se realizará a través de la plataforma de
                teleconsultas de Mediconnect. Recibirás un enlace por correo
                electrónico antes de la cita.
              </p>
            </div>
          )}
        </div>
        <AuthFooterContainer
          type="Save"
          continueButtonProps={{
            onClick: handleSubmit,
            children: "Guardar",
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
