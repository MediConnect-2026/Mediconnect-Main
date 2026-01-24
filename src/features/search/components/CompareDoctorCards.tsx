import { Card, CardHeader, CardContent, CardFooter } from "@/shared/ui/card";
import { Badge } from "@/shared/ui/badge";
import {
  Tooltip,
  TooltipTrigger,
  TooltipContent,
  TooltipProvider,
} from "@/shared/ui/tooltip";
import { Star, X } from "lucide-react";
import type { Doctor, Provider } from "@/data/providers";
import MCButton from "@/shared/components/forms/MCButton";
import { useTranslation } from "react-i18next";
import { Avatar, AvatarFallback, AvatarImage } from "@/shared/ui/avatar";
import { useIsMobile } from "@/lib/hooks/useIsMobile";
import { useAppStore } from "@/stores/useAppStore";
interface CompareDoctorCardsProps {
  selectedProviders: Provider[];
  onRemoveProvider?: (id: string) => void;
}

function CompareDoctorCards({
  selectedProviders,
  onRemoveProvider,
}: CompareDoctorCardsProps) {
  const { t } = useTranslation("common");
  const isMobile = useIsMobile();
  const userRole = useAppStore((state) => state.user?.role);

  // Filter only doctors for comparison
  const doctors = selectedProviders.filter(
    (provider) => provider.type === "doctor",
  ) as Doctor[];

  if (doctors.length === 0) {
    return (
      <div className="text-center py-8">
        <p className="text-muted-foreground">
          {t(
            "compare.noDoctors",
            "No hay doctores seleccionados para comparar",
          )}
        </p>
      </div>
    );
  }

  return (
    <div
      className="flex flex-row flex-nowrap justify-center items-center gap-3 md:gap-4 lg:gap-4 overflow-x-auto overflow-y-hidden px-2 scrollbar-thin scrollbar-thumb-gray-300 scrollbar-track-gray-100 "
      style={{ height: "100%" }}
    >
      {doctors.map((doctor) => (
        <Card
          key={doctor.id}
          className="relative min-w-[280px] md:min-w-[320px] lg:min-w-[340px] w-[240px] md:w-80 lg:w-96  rounded-3xl border border-primary/20"
          style={{ height: "95%" }}
        >
          {/* Remove button */}
          {onRemoveProvider && (
            <button
              onClick={() => onRemoveProvider(doctor.id)}
              className="absolute top-2 right-2 z-10 bg-transparent rounded-full p-1 hover:bg-accent transition-colors"
              aria-label={t("compare.removeDoctor", "Remover doctor")}
            >
              <X className="h-4 w-4 md:h-5 md:w-5 text-muted-foreground" />
            </button>
          )}

          <CardHeader className="text-center  ">
            <div className="flex flex-col items-center ">
              <Avatar className="w-16 h-16 md:w-20 md:h-20 border border-primary/20">
                <AvatarImage
                  src={doctor.image}
                  alt={doctor.name}
                  className="object-cover"
                />
                <AvatarFallback className="text-base md:text-lg">
                  {doctor.name
                    .split(" ")
                    .map((n) => n[0])
                    .join("")
                    .slice(0, 2)}
                </AvatarFallback>
              </Avatar>

              <div>
                <h3 className="font-semibold text-base md:text-lg leading-tight line-clamp-1">
                  {doctor.name}
                </h3>
              </div>

              <div className="flex items-center gap-1">
                <p className="text-xs md:text-sm text-muted-foreground">
                  {doctor.specialty}
                </p>{" "}
                <span className="text-muted-foreground hidden sm:inline">
                  ·
                </span>
                <div className="flex items-center justify-center gap-1">
                  <Star className="h-3 w-3 md:h-4 md:w-4 fill-yellow-400 text-yellow-400" />
                  <span className="text-xs sm:text-sm font-medium">
                    {doctor.rating}
                  </span>
                  {doctor.reviewCount && (
                    <span className="text-xs text-muted-foreground">
                      ({doctor.reviewCount})
                    </span>
                  )}
                </div>
              </div>
            </div>
          </CardHeader>

          <CardContent className="space-y-2 md:space-y-3 pb-3 md:pb-4 flex-1 overflow-y-auto">
            {/* Years of Experience */}
            <div>
              <h4 className="font-medium text-xs md:text-sm mb-1 md:mb-2">
                {t("compare.experience", "Años de Experiencia")}
              </h4>
              <p className="text-xs md:text-sm">{doctor.experience} años</p>
            </div>

            {/* Specialties */}
            <div>
              <h4 className="font-medium text-xs md:text-sm mb-1 md:mb-2">
                {t("compare.specialties", "Especialidades")}
              </h4>
              <div className="flex flex-wrap gap-1">
                {doctor.specialties.map((specialty) => (
                  <Badge
                    key={specialty}
                    className="bg-accent text-primary dark:bg-bg-btn-secondary dark:text-primary text-[10px] md:text-xs"
                  >
                    {specialty}
                  </Badge>
                ))}
              </div>
            </div>

            {/* Languages */}
            <div>
              <h4 className="font-medium text-xs md:text-sm mb-1 md:mb-2">
                {t("compare.languages", "Idiomas")}
              </h4>
              <div className="flex flex-wrap gap-1">
                {doctor.languages.map((language) => (
                  <Badge
                    key={language}
                    className="bg-accent text-primary dark:bg-bg-btn-secondary dark:text-primary text-[10px] md:text-xs"
                  >
                    {language}
                  </Badge>
                ))}
              </div>
            </div>

            {/* Services */}
            <div>
              <h4 className="font-medium text-xs md:text-sm mb-1 md:mb-2">
                {t("compare.services", "Servicios Ofrecidos")}
              </h4>
              <div className="flex flex-wrap gap-1">
                {doctor.modality.map((modality) => (
                  <Badge
                    key={modality}
                    className="bg-accent text-primary dark:bg-bg-btn-secondary dark:text-primary text-[10px] md:text-xs"
                  >
                    {modality}
                  </Badge>
                ))}
              </div>
            </div>

            {/* Insurance */}
            <div>
              <h4 className="font-medium text-xs md:text-sm mb-1 md:mb-2">
                {t("compare.insurance", "Seguros Aceptados")}
              </h4>
              <div className="flex flex-wrap gap-1">
                {doctor.insurances
                  .slice(0, isMobile ? 2 : 3)
                  .map((insurance) => (
                    <Badge
                      key={insurance}
                      className="bg-accent text-primary dark:bg-bg-btn-secondary dark:text-primary text-[10px] md:text-xs"
                    >
                      {insurance}
                    </Badge>
                  ))}
                {doctor.insurances.length > (isMobile ? 2 : 3) && (
                  <TooltipProvider>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <Badge className="bg-accent text-primary dark:bg-background dark:text-primary text-[10px] md:text-xs cursor-help">
                          +{doctor.insurances.length - (isMobile ? 2 : 3)}
                        </Badge>
                      </TooltipTrigger>
                      <TooltipContent>
                        <div className="space-y-1">
                          {doctor.insurances
                            .slice(isMobile ? 2 : 3)
                            .map((insurance) => (
                              <p key={insurance} className="text-xs">
                                {insurance}
                              </p>
                            ))}
                        </div>
                      </TooltipContent>
                    </Tooltip>
                  </TooltipProvider>
                )}
              </div>
            </div>

            {/* Biography */}
            <div>
              <h4 className="font-medium text-xs md:text-sm mb-1 md:mb-2">
                {t("compare.biography", "Biografía")}
              </h4>
              <p className="text-[10px] md:text-xs text-muted-foreground line-clamp-3">
                {doctor.bio}
              </p>
            </div>
          </CardContent>

          <CardFooter className="p-3 md:p-4 pt-0">
            <MCButton
              className="w-full text-xs md:text-sm"
              size={isMobile ? "m" : "l"}
              onClick={() => console.log("Agendar cita con:", doctor.name)}
            >
              {t("compare.scheduleAppointment", "Agendar Cita")}
            </MCButton>
          </CardFooter>
        </Card>
      ))}
    </div>
  );
}

export default CompareDoctorCards;
