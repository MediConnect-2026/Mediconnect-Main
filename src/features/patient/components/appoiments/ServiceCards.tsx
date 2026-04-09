import MCButton from "@/shared/components/forms/MCButton";
import { MapPin, Video } from "lucide-react";
import { useTranslation } from "react-i18next";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/shared/ui/tooltip";
import type { ServiceDetail } from "@/shared/navigation/userMenu/editProfile/doctor/services";
import { getAddressComplete } from "@/utils/addressParser";

interface ServiceCardsProps {
  services: ServiceDetail[] | any[];
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
  const { t } = useTranslation("patient");

  const hasTimeSlotInOtherService = (currentServiceId: string) => {
    return Object.keys(selectedTimeSlots).some(
      (serviceId) =>
        serviceId !== currentServiceId && selectedTimeSlots[serviceId],
    );
  };

  const handleTimeSlotSelect = (serviceId: string, time: string) => {
    if (selectedTimeSlots[serviceId] === time) {
      onTimeSlotSelect(serviceId, "");
      return;
    }

    if (hasTimeSlotInOtherService(serviceId)) {
      return;
    }

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
  };

  return (
    <div className="space-y-4 sm:space-y-6">
      {services.map((service) => {
        const timeSelected = selectedTimeSlots[service.id.toString()];
        const modalitySelected = selectedModality[service.id.toString()] || "";

        const modalidadLower = (service.modalidad || "").toLowerCase();

        const isMixta = modalidadLower.includes("mixta") || modalidadLower.includes("mixed");
        const isPresencial = modalidadLower.includes("presencial") || modalidadLower.includes("present") || modalidadLower.includes("in-person");
        const isVirtual = modalidadLower.includes("teleconsulta") || modalidadLower.includes("virtual") || modalidadLower.includes("telehealth") || modalidadLower.includes("remote");
      
        const isBlocked = hasTimeSlotInOtherService(service.id.toString());

        return (
          <div
            key={service.id}
            className={`border rounded-2xl sm:rounded-3xl border-primary/15 p-3 sm:p-4 space-y-3 w-full ${
              isBlocked ? "opacity-50" : ""
            }`}
          >
            {/* Service Header */}
            <div className="flex flex-col gap-2">
              <h4 className="font-semibold text-primary text-base sm:text-lg">
                {service.nombre}
              </h4>
              
              {/* Description */}
              <p className="text-sm sm:text-base text-primary leading-relaxed">
                {service.descripcion}
              </p>
              
              {/* Service Details - Responsive Layout */}
              <div className="flex flex-col sm:flex-row sm:flex-wrap gap-1 sm:gap-2 text-xs sm:text-sm text-primary/65">
                {/* Price */}
                <div className="flex items-center gap-2">
                  <span className="font-medium">
                    {service.precio} {t("serviceCards.perPatient")}
                  </span>
                </div>
                
                {/* Duration */}
                <div className="flex items-center gap-2">
                  <span className="hidden sm:inline">•</span>
                  <span>{convertTimeFroimMinutesToHours(service.duracionMinutos)}</span>
                </div>
                
                {/* Modality */}
                <div className="flex items-center gap-2">
                  <span className="hidden sm:inline">•</span>
                  <span>{service.modalidad}</span>
                </div>
                
                {/* Location */}
                <div className="flex items-center gap-2 min-w-0">
                  <span className="hidden sm:inline">•</span>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <span className="truncate inline-block align-middle cursor-pointer max-w-[200px] sm:max-w-[250px] md:max-w-[300px]">
                        {getAddressComplete(service.ubicacion)}
                      </span>
                    </TooltipTrigger>
                    <TooltipContent className="max-w-[280px] sm:max-w-sm">
                      {getAddressComplete(service.ubicacion)}
                    </TooltipContent>
                  </Tooltip>
                </div>
              </div>
            </div>

            {/* Time Slots Grid - Fully Responsive */}
            <div className="max-h-[120px] sm:max-h-[100px] md:max-h-[80px] overflow-y-auto scrollbar-visible rounded bg-muted/40 p-2 pr-3 sm:px-3 sm:py-2 w-full">
              {(!service.timeSlots || service.timeSlots.length === 0) ? (
                <div className="text-center text-xs sm:text-sm text-muted-foreground py-4">
                  {t("serviceCards.noTimeSlots", "No hay horarios disponibles")}
                </div>
              ) : (
                <div className="grid grid-cols-2 xs:grid-cols-3 sm:grid-cols-4 md:grid-cols-5 lg:grid-cols-6 gap-2">
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
                          className={`h-8 sm:h-7 text-xs px-2 sm:px-3 w-full ${
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

            {/* Modality Selection - Responsive */}
            {timeSelected && (
              <div className="mt-3 sm:mt-4">
                <div className="text-sm sm:text-base mb-2 text-primary font-medium">
                  {t("serviceCards.howWantAppointment")}
                </div>
                <div className="flex flex-col xs:flex-row gap-2">
                  {(isMixta || isPresencial) && (
                    <MCButton
                      variant={
                        modalitySelected === "presencial"
                          ? "primary"
                          : "outline"
                      }
                      size="sm"
                      className="rounded-full w-full xs:w-auto"
                      onClick={() => onModalitySelect(service.id.toString(), "presencial")}
                    >
                      <MapPin className="w-4 h-4 mr-1.5" />
                      <span className="text-sm">{t("serviceCards.inPerson")}</span>
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
                      className="rounded-full w-full xs:w-auto"
                      onClick={() =>
                        onModalitySelect(service.id.toString(), "teleconsulta")
                      }
                    >
                      <Video className="w-4 h-4 mr-1.5" />
                      <span className="text-sm">{t("serviceCards.virtual")}</span>
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