import React from "react";
import { Star, MapPin, Globe, Shield, Phone, Loader2 } from "lucide-react";
import { type Doctor } from "@/data/providers";
import { Card, CardContent, CardTitle } from "@/shared/ui/card";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/shared/ui/tooltip";
import MCButton from "../forms/MCButton";
import { fadeInUp } from "@/lib/animations/commonAnimations";
import { motion } from "framer-motion";
import { useTranslation } from "react-i18next";
import { formatPhone } from "@/utils/phoneFormat";

type DoctorPopupProps = {
  provider: Doctor;
  isConnected?: boolean;
  onConnect?: (id: string) => void;
  onScheduleAppointment?: (providerId: string) => void;
  navigateFn?: (path: string) => void;
  userRole?: string | null;
  isMobile?: boolean;
  onContact?: (providerId: string) => void;
  isContactLoading?: boolean;
};

const DoctorPopup: React.FC<DoctorPopupProps> = ({
  provider,
  onConnect,
  onScheduleAppointment,
  navigateFn,
  userRole,
  isMobile = false,
  onContact,
  isContactLoading = false,
}) => {
  const { t } = useTranslation("common");

  // Helpers
  const locations = (
    Array.isArray(provider.address) ? provider.address : [provider.address]
  ).filter(Boolean) as string[];
  const languages = provider.languages?.filter(Boolean) ?? [];
  const hasPhone = !!provider.phone?.trim();
  const insurances = provider.insurances?.filter(Boolean) ?? [];

  const connectBtnText = t("clinicCard.connect");
  const viewProfileText = t("clinicCard.viewProfile");
  const scheduleAppointmentText = t("clinicCard.scheduleAppointment");
  const contactText = t("clinicCard.contact");

  const cardSize = isMobile ? "w-[260px] rounded-2xl" : "w-[480px] rounded-3xl";
  const imgHeight = isMobile ? "h-28" : "h-36";
  const textXs = isMobile ? "text-[11px]" : "text-xs";

  const handleProfileClick = () => {
    if (provider.id && navigateFn) {
      navigateFn(`/doctor/profile/${provider.id}`);
    }
  };

  const handleConnect = () => {
    onConnect?.(provider.id);
  };

  const handleSchedule = () => {
    onScheduleAppointment?.(provider.id);
  };

  const handleContactClick = () => {
    onContact?.(provider.id);
  };

  return (
    <motion.div {...fadeInUp}>
      <Card
        className={`bg-background border border-primary/10 shadow-sm hover:shadow-lg transition-shadow flex flex-col ${cardSize}`}
      >
        {/* Imagen */}
        <div
          className={`overflow-hidden rounded-xl border border-primary/15 ${imgHeight}`}
        >
          <img
            src={provider.image}
            alt={provider.name}
            className="w-full h-full object-cover transition-transform hover:scale-105"
          />
        </div>

        {/* Nombre + rating */}
        <div className="flex justify-between px-3 pt-2">
          <CardTitle
            className={
              isMobile ? "text-sm font-semibold" : "text-base font-bold"
            }
          >
            {provider.name}
          </CardTitle>
          <div className="flex items-center gap-1">
            <Star className="w-4 h-4 fill-amber-400 text-amber-400" />
            <span className="text-xs font-bold">{provider.rating}</span>
          </div>
        </div>

        <CardContent className="p-2 space-y-2">
          <div className={`${textXs} text-muted-foreground font-medium`}>
            {provider.specialty}
          </div>

          <div
            className={
              isMobile ? "space-y-2" : "grid grid-cols-2 gap-x-3 gap-y-2"
            }
          >
            {/* Ubicaciones — oculto si vacío */}
            {locations.length > 0 && (
              <Tooltip>
                <TooltipTrigger asChild>
                  <div
                    className={`flex gap-1.5 cursor-pointer ${textXs} text-muted-foreground`}
                  >
                    <MapPin className="w-3 h-3 mt-0.5 text-secondary" />
                    <span className="truncate">{locations[0]}</span>
                    {locations.length > 1 && (
                      <span className="text-secondary">
                        +{locations.length - 1}
                      </span>
                    )}
                  </div>
                </TooltipTrigger>
                <TooltipContent className="max-w-xs">
                  {locations.join(" • ")}
                </TooltipContent>
              </Tooltip>
            )}

            {/* Idiomas — oculto si array vacío */}
            {languages.length > 0 && (
              <Tooltip>
                <TooltipTrigger asChild>
                  <div
                    className={`flex gap-1 cursor-pointer ${textXs} text-muted-foreground`}
                  >
                    <Globe className="w-3 h-3 text-secondary" />
                    <span className="truncate max-w-[150px]">
                      {languages.join(", ")}
                    </span>
                  </div>
                </TooltipTrigger>
                <TooltipContent>{languages.join(", ")}</TooltipContent>
              </Tooltip>
            )}

            {/* Teléfono — oculto si vacío */}
            {hasPhone && (
              <a
                href={`tel:${provider.phone}`}
                className={`flex gap-1 ${textXs} text-secondary`}
              >
                <Phone className="w-3 h-3" />
                <span className="text-primary">
                  {formatPhone(provider.phone)}
                </span>
              </a>
            )}

            {/* Seguros — oculto si array vacío */}
            {insurances.length > 0 && (
              <Tooltip>
                <TooltipTrigger asChild>
                  <div className={`flex gap-1 cursor-pointer ${textXs}`}>
                    <Shield className="w-3 h-3 text-secondary" />
                    <span className="truncate max-w-[150px]">
                      {insurances.join(", ")}
                    </span>
                  </div>
                </TooltipTrigger>
                <TooltipContent>{insurances.join(", ")}</TooltipContent>
              </Tooltip>
            )}
          </div>

          <div className="my-3 h-[1px] w-full rounded-full bg-gradient-to-r from-primary/5 via-primary/30 to-primary/5" />

          {/* Botones */}
          <div
            className={`flex gap-2 mt-3 ${isMobile ? "flex-col" : "flex-row"}`}
          >
            {userRole === "CENTER" && (
              <MCButton
                size="xs"
                variant="outline"
                className="flex-1 w-full"
                onClick={handleConnect}
              >
                {connectBtnText}
              </MCButton>
            )}

            {userRole === "PATIENT" && (
              <>
                <MCButton
                  size="xs"
                  variant="primary"
                  className="flex-1 w-full"
                  onClick={handleSchedule}
                >
                  {scheduleAppointmentText}
                </MCButton>
                <MCButton
                  size="xs"
                  variant="outline"
                  className="flex-1 w-full"
                  onClick={handleContactClick}
                  disabled={isContactLoading}
                >
                  {isContactLoading ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : (
                    contactText
                  )}
                </MCButton>
              </>
            )}

            <MCButton
              size="xs"
              variant="outline"
              className="flex-1 w-full"
              onClick={handleProfileClick}
            >
              {viewProfileText}
            </MCButton>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
};

export default DoctorPopup;