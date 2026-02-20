import MCButton from "@/shared/components/forms/MCButton";
import { MapPin, Video } from "lucide-react";
import { useTranslation } from "react-i18next"; // <-- Agrega esto
import { Tooltip, TooltipContent, TooltipTrigger } from "@/shared/ui/tooltip";

interface Service {
  id: string;
  name: string;
  description: string;
  price: string;
  duration: string;
  modality: "mixta" | "presencial" | "teleconsulta"; // valor fijo
  modalityLabel: string; // texto traducido
  location: string;
  timeSlots: string[];
}

interface ServiceCardsProps {
  services: Service[];
  selectedTimeSlots: Record<string, string>;
  selectedModality: Record<string, "presencial" | "teleconsulta">;
  onTimeSlotSelect: (serviceId: string, time: string) => void;
  onModalitySelect: (
    serviceId: string,
    modality: "presencial" | "teleconsulta",
  ) => void;
}

function ServiceCards({
  services,
  selectedTimeSlots,
  selectedModality,
  onTimeSlotSelect,
  onModalitySelect,
}: ServiceCardsProps) {
  const { t } = useTranslation("patient"); // <-- Agrega esto

  // Función para verificar si ya hay una hora seleccionada en otro servicio
  const hasTimeSlotInOtherService = (currentServiceId: string) => {
    return Object.keys(selectedTimeSlots).some(
      (serviceId) =>
        serviceId !== currentServiceId && selectedTimeSlots[serviceId],
    );
  };

  // Función para manejar la selección de horarios
  const handleTimeSlotSelect = (serviceId: string, time: string) => {
    // Si ya hay una hora seleccionada en este servicio y es la misma, la deseleccionamos
    if (selectedTimeSlots[serviceId] === time) {
      onTimeSlotSelect(serviceId, "");
      return;
    }

    // Si hay una hora seleccionada en otro servicio, no permitir seleccionar
    if (hasTimeSlotInOtherService(serviceId)) {
      return;
    }

    // Seleccionar la nueva hora
    onTimeSlotSelect(serviceId, time);
  };

  return (
    <div className="space-y-6">
      {services.map((service) => {
        const timeSelected = selectedTimeSlots[service.id];
        const modalitySelected = selectedModality[service.id];
        const isMixta = service.modality.toLowerCase().includes("mixta");
        const isPresencial = service.modality
          .toLowerCase()
          .includes("presencial");
        const isVirtual = service.modality
          .toLowerCase()
          .includes("teleconsulta");

        // Verificar si este servicio está bloqueado por selección en otro servicio
        const isBlocked = hasTimeSlotInOtherService(service.id);

        return (
          <div
            key={service.id}
            className={`border rounded-3xl border-primary/15 p-4 space-y-3 w-full ${
              isBlocked ? "opacity-50" : ""
            }`}
          >
            <div className="flex justify-between items-start">
              <div className="w-full">
                <h4 className="font-semibold text-primary">{service.name}</h4>
                <div className="space-y-1 w-full ">
                  <p className="text-sm  text-primary">{service.description}</p>{" "}
                  <div className="flex  text-sm text-primary/65 gap-2 w-full ">
                    <span>
                      {service.price} {t("serviceCards.perPatient")}
                    </span>
                    <span>•</span>
                    <span>{service.duration}</span>
                    <span>•</span>
                    <span>{service.modality}</span>
                    <span>•</span>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <span className="max-w-[290px] truncate inline-block align-middle cursor-pointer">
                          {service.location}
                        </span>
                      </TooltipTrigger>
                      <TooltipContent>{service.location}</TooltipContent>
                    </Tooltip>
                  </div>
                </div>{" "}
              </div>
            </div>

            {/* Time slots grid */}
            <div className="max-h-[80px] overflow-y-auto scrollbar-hide rounded bg-muted/40 px-1 w-full max-w-[700px]">
              {service.timeSlots.length === 0 ? (
                <div className="text-center text-xs text-muted-foreground py-4">
                  {t("serviceCards.noTimeSlots", "No hay horarios disponibles")}
                </div>
              ) : (
                <div className="grid grid-cols-6 gap-2">
                  {service.timeSlots.map((time) => (
                    <MCButton
                      key={time}
                      variant={timeSelected === time ? "primary" : "outline"}
                      size="sm"
                      className={`h-7 w-24 md:p-4 md:text-xs ${
                        isBlocked && timeSelected !== time
                          ? "cursor-not-allowed opacity-50"
                          : ""
                      }`}
                      onClick={() => handleTimeSlotSelect(service.id, time)}
                      disabled={isBlocked && timeSelected !== time}
                    >
                      {time}
                    </MCButton>
                  ))}
                </div>
              )}
            </div>

            {/* Modality selection */}
            {timeSelected && (
              <div className="mt-4">
                <div className="text-sm mb-2 text-primary font-medium">
                  {t("serviceCards.howWantAppointment")}
                </div>
                <div className="flex gap-2">
                  {(isMixta || isPresencial) && (
                    <MCButton
                      variant={
                        modalitySelected === "presencial"
                          ? "primary"
                          : "outline"
                      }
                      size="sm"
                      className="rounded-full"
                      onClick={() => onModalitySelect(service.id, "presencial")}
                    >
                      <MapPin className="w-4 h-4 mr-1" />
                      {t("serviceCards.inPerson")}
                    </MCButton>
                  )}
                  {(isMixta || isVirtual) && (
                    <MCButton
                      variant={
                        modalitySelected === "teleconsulta"
                          ? "primary"
                          : "outline"
                      }
                      size="sm"
                      className="rounded-full"
                      onClick={() =>
                        onModalitySelect(service.id, "teleconsulta")
                      }
                    >
                      <Video className="w-4 h-4 mr-1" />
                      {t("serviceCards.virtual")}
                    </MCButton>
                  )}
                </div>
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}

export default ServiceCards;
