import MCButton from "@/shared/components/forms/MCButton";
import { MapPin, Video } from "lucide-react";
import { useTranslation } from "react-i18next"; // <-- Agrega esto
import { Tooltip, TooltipContent, TooltipTrigger } from "@/shared/ui/tooltip";
import type { ServiceDetail } from "@/shared/navigation/userMenu/editProfile/doctor/services";
import { getAddressComplete } from "@/utils/addressParser";

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
  services: ServiceDetail[] | any[]; // Asegúrate de que ServiceDetails tenga los campos necesarios
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

  const to12Hour = (time24: string) => {
    if (!time24) return time24;
    const [hoursStr, minutesStr] = time24.split(":");
    const hours = parseInt(hoursStr, 10);
    const minutes = minutesStr || "00";
    const period = hours >= 12 ? "p.m." : "a.m.";
    let hour12 = hours % 12;
    if (hour12 === 0) hour12 = 12;
    return `${hour12}:${minutes} ${period}`;
  };

  const toMinutes = (time24: string) => {
    const [h = "0", m = "0"] = (time24 || "").split(":");
    return parseInt(h, 10) * 60 + parseInt(m, 10);
  };

  const convertTimeFroimMinutesToHours = (minutes: number) => {
    const hours = Math.floor(minutes / 60);
    const remainingMinutes = minutes % 60;
    return `${hours > 0 ? `${hours}h ` : ""}${remainingMinutes}m`;
  }

  console.debug("[ServiceCards] Servicios recibidos:", services);
  return (
    <div className="space-y-6">
      {services.map((service) => {
        const timeSelected = selectedTimeSlots[service.id.toString()];
        const modalitySelected = selectedModality[service.id.toString()] || "";

        const modalidadLower = (service.modalidad || "").toLowerCase();

        const isMixta = modalidadLower.includes("mixta") || modalidadLower.includes("mixed");
        // Check for both Spanish "presencial" and English "present"/"in-person"
        const isPresencial = modalidadLower.includes("presencial") || modalidadLower.includes("present") || modalidadLower.includes("in-person");
        // Also consider common virtual labels
        const isVirtual = modalidadLower.includes("teleconsulta") || modalidadLower.includes("virtual") || modalidadLower.includes("telehealth") || modalidadLower.includes("remote");
      
        // Verificar si este servicio está bloqueado por selección en otro servicio
        const isBlocked = hasTimeSlotInOtherService(service.id.toString());

        return (
          <div
            key={service.id}
            className={`border rounded-3xl border-primary/15 p-4 space-y-3 w-full ${
              isBlocked ? "opacity-50" : ""
            }`}
          >
            <div className="flex justify-between items-start">
              <div className="w-full">
                <h4 className="font-semibold text-primary">{service.nombre}</h4>
                <div className="space-y-1 w-full ">
                  <p className="text-sm  text-primary">{service.descripcion}</p>{" "}
                  <div className="flex  text-sm text-primary/65 gap-2 w-full ">
                    <span>
                      {service.precio} {t("serviceCards.perPatient")}
                    </span>
                    <span>•</span>
                    <span>{convertTimeFroimMinutesToHours(service.duracionMinutos)}</span>
                    <span>•</span>
                    <span>{service.modalidad}</span>
                    <span>•</span>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <span className="max-w-[290px] truncate inline-block align-middle cursor-pointer">
                          {getAddressComplete(service.ubicacion)}
                        </span>
                      </TooltipTrigger>
                      <TooltipContent>{getAddressComplete(service.ubicacion)}</TooltipContent>
                    </Tooltip>
                  </div>
                </div>{" "}
              </div>
            </div>

            {/* Time slots grid */}
            <div className="max-h-[80px] overflow-y-auto scrollbar-hide rounded bg-muted/40 px-1 w-full max-w-[700px]">
              {(!service.timeSlots || service.timeSlots.length === 0) ? (
                <div className="text-center text-xs text-muted-foreground py-4">
                  {t("serviceCards.noTimeSlots", "No hay horarios disponibles")}
                </div>
              ) : (
                <div className="grid grid-cols-6 gap-2">
                  {service.timeSlots
                    .slice()
                    .sort((a: string, b: string) => toMinutes(a) - toMinutes(b))
                    .map((time24: string) => {
                      const label = to12Hour(time24);
                      return (
                        <MCButton
                          key={time24}
                          variant={timeSelected === label ? "primary" : "outline"}
                          size="sm"
                          className={`h-7 w-24 md:p-4 md:text-xs ${
                            isBlocked && timeSelected !== label
                              ? "cursor-not-allowed opacity-50"
                              : ""
                          }`}
                          onClick={() => handleTimeSlotSelect(service.id.toString(), label)}
                          disabled={isBlocked && timeSelected !== label}
                        >
                          {label}
                        </MCButton>
                      );
                    })}
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
                      onClick={() => onModalitySelect(service.id.toString(), "presencial")}
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
                        onModalitySelect(service.id.toString(), "teleconsulta")
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
