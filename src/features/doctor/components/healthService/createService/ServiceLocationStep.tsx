import MapScheduleLocation from "@/shared/components/maps/MapScheduleLocation";
import { useCreateServicesStore } from "@/stores/useCreateServicesStore";

import ServicesLayoutsSteps from "./ServicesLayoutsSteps";
import AuthFooterContainer from "@/features/auth/components/AuthFooterContainer";
import { ChevronRight } from "lucide-react";
import MCButton from "@/shared/components/forms/MCButton";
import { Button } from "@/shared/ui/button";
import {
  Tooltip,
  TooltipTrigger,
  TooltipContent,
  TooltipProvider,
} from "@/shared/ui/tooltip";
import ManageLocation from "./Modals/ManageLocation";
import { useRef, useState } from "react";

interface LocationCoordinate {
  lat: number;
  lng: number;
  label?: string;
  color?: string;
}

function ServiceLocationStep() {
  const locationSelected = useCreateServicesStore(
    (s) => s.createServiceData.location,
  );

  const setLocationData = useCreateServicesStore(
    (s) => s.setCreateServiceField,
  );

  const goToNextStep = useCreateServicesStore((s) => s.goToNextStep);
  const goToPreviousStep = useCreateServicesStore((s) => s.goToPreviousStep);

  console.log(locationSelected);

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
    {
      id: 3,
      name: "Centro Médico Moderno",
      address: "C. Dr. Defilló 6, Santo Domingo",
      latitude: 18.4732,
      longitude: -69.9451,
    },
    {
      id: 4,
      name: "Hospital General Plaza de la Salud",
      address: "Av. Ortega y Gasset, Santo Domingo",
      latitude: 18.4865,
      longitude: -69.9368,
    },
    {
      id: 5,
      name: "Centro Cardio-Neuro-Oftalmológico y Trasplante (Cecanot)",
      address: "Av. Dr. Fernando Defilló, Santo Domingo",
      latitude: 18.4741,
      longitude: -69.9442,
    },
    {
      id: 6,
      name: "Centro Médico Real",
      address: "Av. Charles Sumner 25, Santo Domingo",
      latitude: 18.4698,
      longitude: -69.9305,
    },
    {
      id: 7,
      name: "Clínica Independencia",
      address: "Av. Independencia 501, Santo Domingo",
      latitude: 18.4552,
      longitude: -69.9387,
    },
    {
      id: 8,
      name: "Centro Médico Dominicano",
      address: "Av. Bolívar 208, Santo Domingo",
      latitude: 18.4689,
      longitude: -69.9112,
    },
    {
      id: 9,
      name: "Clínica Gómez Patiño",
      address: "C. José Amado Soler 53, Santo Domingo",
      latitude: 18.4711,
      longitude: -69.9279,
    },
    {
      id: 10,
      name: "Centro Médico Vista del Jardín",
      address: "C. Euclides Morillo 53, Santo Domingo",
      latitude: 18.4892,
      longitude: -69.9301,
    },
    {
      id: 11,
      name: "Clínica Corominas",
      address: "Av. 27 de Febrero 301, Santo Domingo",
      latitude: 18.4715,
      longitude: -69.9223,
    },
  ];

  // Map locationsData to LocationCoordinate[]
  const mappedLocations: LocationCoordinate[] = locationsData.map((loc) => ({
    lat: loc.latitude,
    lng: loc.longitude,
    label: loc.name,
    color: "#e11d48", // Puedes personalizar el color si lo deseas
  }));

  // Helper para mostrar tooltip solo si el texto está truncado
  function TruncatableTooltip({
    text,
    className,
  }: {
    text: string;
    className: string;
  }) {
    const textRef = useRef<HTMLParagraphElement>(null);
    const [showTooltip, setShowTooltip] = useState(false);

    const handleMouseEnter = () => {
      const el = textRef.current;
      if (el && el.scrollWidth > el.clientWidth) {
        setShowTooltip(true);
      } else {
        setShowTooltip(false);
      }
    };

    return (
      <TooltipProvider>
        <Tooltip open={showTooltip}>
          <TooltipTrigger asChild>
            <p
              ref={textRef}
              className={className}
              onMouseEnter={handleMouseEnter}
              onMouseLeave={() => setShowTooltip(false)}
            >
              {text}
            </p>
          </TooltipTrigger>
          <TooltipContent>{text}</TooltipContent>
        </Tooltip>
      </TooltipProvider>
    );
  }

  return (
    <ServicesLayoutsSteps
      title="Confirma tu ubicación"
      description="Especifica la dirección donde ofrecerás tus consultas o servicios médicos para que los pacientes puedan encontrarte fácilmente."
    >
      <div className="flex flex-col gap-8 items-center ">
        <MapScheduleLocation
          showAddressInfo
          multipleLocations={mappedLocations}
        />
        <div
          className={`w-full ${locationsData.length > 4 ? "max-h-72 overflow-y-auto" : ""}`}
        >
          <div className="grid grid-cols-2 gap-4">
            {locationsData.map((loc) => (
              <div
                key={loc.id}
                className={`border w-full border-primary/15 p-3 rounded-2xl flex items-center justify-between cursor-pointer transition
                  ${locationSelected === loc.id ? "bg-accent/50 border-none " : ""}
                `}
                onClick={() =>
                  setLocationData(
                    "location",
                    locationSelected === loc.id ? null : loc.id,
                  )
                }
              >
                <div className="flex flex-col gap-1 max-w-[220px]">
                  <TruncatableTooltip
                    text={loc.name}
                    className="text-base font-medium truncate cursor-help"
                  />
                  <TruncatableTooltip
                    text={loc.address}
                    className="text-sm font-normal truncate cursor-help"
                  />
                </div>
                <ManageLocation
                  locationSelected={loc.id}
                  triggerClassName="p-0"
                >
                  <Button
                    variant="outline"
                    className=" rounded-4xl p-2 border-none bg-transparent shadow-none text-primary/75 hover:bg-primary/10 hover:text-primary focus:ring-0 focus:ring-offset-0 focus-visible:ring-0 data-[state=open]:bg-secondary"
                  >
                    <ChevronRight></ChevronRight>
                  </Button>
                </ManageLocation>
              </div>
            ))}
          </div>
        </div>
        <ManageLocation triggerClassName="w-full">
          <MCButton className="w-full rounded-xl" variant="tercero">
            Agregar Ubicacion
          </MCButton>
        </ManageLocation>

        <AuthFooterContainer
          continueButtonProps={{
            disabled: !locationSelected,
            onClick: () => goToNextStep(),
          }}
          backButtonProps={{
            onClick: () => goToPreviousStep(),
          }}
        />
      </div>
    </ServicesLayoutsSteps>
  );
}

export default ServiceLocationStep;
