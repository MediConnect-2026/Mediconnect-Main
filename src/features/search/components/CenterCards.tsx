import { Star, MapPin, Globe, Phone, Shield } from "lucide-react";
import { type Clinic } from "@/data/providers";
import { cn } from "@/lib/utils";
import { useAppStore } from "@/stores/useAppStore";
import MCButton from "@/shared/components/forms/MCButton";
import { useNavigate } from "react-router-dom";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/shared/ui/tooltip";
import { useIsMobile } from "@/lib/hooks/useIsMobile";
import { useTranslation } from "react-i18next";
import { memo } from "react";
import { formatPhone } from "@/utils/phoneFormat";

import ToogleConfirmConnection from "@/features/request/components/ToogleConfirmConnection";

interface ClinicCardProps {
  clinic: Clinic;
  isConnected: "connected" | "not_connected" | "pending";
  onConnect: (id: string, message?: string) => void;
  onDisconnect?: (id: string) => void;
  onViewProfile: (id: string) => void;
  isConnecting?: boolean;
}

const CenterCardsComponent = ({
  clinic,
  isConnected,
  onConnect,
  onDisconnect,
  isConnecting = false,
}: ClinicCardProps) => {
  const user = useAppStore((state) => state.user);
  const userRole = user?.rol;
  const navigate = useNavigate();
  const isMobile = useIsMobile();
  const { t } = useTranslation("common");

  const doctorVerificationStatus = user?.doctor?.estadoVerificacion;
  const isDoctorVerified =
    typeof doctorVerificationStatus === "string" &&
    ["verificado", "aprobado", "approved", "aproved"].includes(
      doctorVerificationStatus.toLowerCase().trim(),
    );
  const isDoctorRole = userRole === "DOCTOR" || userRole === "Doctor";
  const disableConnectForUnverifiedDoctor = isDoctorRole && !isDoctorVerified;

  const handleProfile = () => {
    navigate(`/center/profile/${clinic.id}`);
  };

  const handleConfirmConnect = (message?: string) => {
    onConnect(clinic.id, message);
  };

  const handleConfirmDisconnect = () => {
    onDisconnect?.(clinic.id);
  };

  // Nuevo texto y estado para el botón
  let connectBtnText = t("clinicCard.connect");
  let connectBtnDisabled = false;
  let connectVariant: "primary" | "outline" = "outline";

  if (isConnected === "connected") {
    connectBtnText = t("clinicCard.allied", "Aliado");
    connectBtnDisabled = false;
    connectVariant = "outline";
  } else if (isConnected === "pending") {
    connectBtnText = t("clinicCard.pending");
    connectBtnDisabled = true;
  }

  if (disableConnectForUnverifiedDoctor) {
    connectBtnDisabled = true;
  }

  return (
    <div
      className={cn(
        "bg-background p-3 sm:p-4 border-b transition-all duration-200",
        "border-primary/15 hover:bg-muted/30 rounded-t-2xl sm:rounded-t-4xl",
      )}
    >
      <div className="flex gap-3 sm:gap-4 h-full">
        {/* Clinic Image */}
        <div
          className={cn(
            "relative overflow-hidden rounded-2xl sm:rounded-3xl border border-primary/5 flex-shrink-0",
            isMobile ? "w-20 h-20 rounded-full" : "",
          )}
        >
          <img
            src={clinic.image}
            alt={clinic.name}
            className="w-30 h-full md:w-45 md:h-full object-cover transition-transform duration-500 hover:scale-110"
          />
        </div>

        {/* Clinic Info */}
        <div className="flex-1 min-w-0">
          {/* Header */}
          <div className="flex items-start justify-between gap-2">
            <div className="flex-1 min-w-0">
              <h3
                className={cn(
                  "font-semibold text-foreground leading-tight hover:underline cursor-pointer",
                  isMobile ? "text-sm" : "text-base md:text-lg",
                )}
                onClick={handleProfile}
              >
                {clinic.name}
              </h3>
              {/* Rating */}
              <div
                className={cn(
                  "flex items-center gap-1.5 mt-1",
                  isMobile && "text-xs",
                )}
              >
                <div className="flex items-center gap-1">
                  <Star
                    className={cn(
                      "fill-amber-400 text-amber-400",
                      isMobile ? "w-3 h-3" : "w-4 h-4",
                    )}
                  />
                  <span className="text-xs sm:text-sm font-medium">
                    {clinic.rating}
                  </span>
                  {!isMobile && clinic.reviewCount && (
                    <span className="text-muted-foreground text-xs sm:text-sm">
                      ({clinic.reviewCount} {t("clinicCard.reviews")})
                    </span>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Address */}
          <div
            className={cn(
              "flex items-start gap-1.5 mt-2 text-muted-foreground",
              isMobile ? "text-xs" : "text-sm",
            )}
          >
            <MapPin
              className={cn(
                "flex-shrink-0 mt-0.5 text-secondary",
                isMobile ? "w-3 h-3" : "w-4 h-4",
              )}
            />
            <span className="line-clamp-1">{clinic.address}</span>
          </div>

          {/* Languages & Phone */}
          <div
            className={cn(
              "flex flex-wrap items-center gap-x-4 gap-y-1 mt-2",
              isMobile ? "text-xs" : "text-sm",
            )}
          >
            <div className="flex items-center gap-1.5 text-muted-foreground">
              <Globe
                className={cn(
                  "text-secondary",
                  isMobile ? "w-3 h-3" : "w-4 h-4",
                )}
              />
              {clinic.languages.length > 2 ? (
                <Tooltip>
                  <TooltipTrigger asChild>
                    <span className="cursor-pointer">
                      {clinic.languages[0]}
                      <span className="text-secondary ml-1">
                        {t("clinicCard.andOtherLanguages", {
                          count: clinic.languages.length - 1,
                        })}
                      </span>
                    </span>
                  </TooltipTrigger>
                  <TooltipContent>
                    <span>{clinic.languages.join(", ")}</span>
                  </TooltipContent>
                </Tooltip>
              ) : (
                <span>{clinic.languages.length > 0 ? clinic.languages.join(", ") : t("clinicCard.noLanguages", "No disponible")}</span>
              )}
            </div>
            {clinic.phone && (
              <div className="flex items-center gap-1.5 text-muted-foreground">
                <Phone
                  className={cn(
                    "text-secondary",
                    isMobile ? "w-3 h-3" : "w-4 h-4",
                  )}
                />
                <span>{formatPhone(clinic.phone)}</span>
              </div>
            )}
          </div>

          {/* Insurances */}
          <div
            className={cn(
              "flex items-start gap-1.5 mt-2 text-muted-foreground",
              isMobile ? "text-xs" : "text-sm",
            )}
          >
            <Shield
              className={cn(
                "flex-shrink-0 mt-0.5 text-secondary",
                isMobile ? "w-3 h-3" : "w-4 h-4",
              )}
            />
            <span className="font-medium">
              {isMobile
                ? t("clinicCard.insurances")
                : t("clinicCard.acceptedInsurances")}
            </span>
            {clinic.insurances.length > 2 ? (
              <Tooltip>
                <TooltipTrigger asChild>
                  <span className="cursor-pointer truncate">
                    {isMobile
                      ? clinic.insurances[0]
                      : clinic.insurances.slice(0, 2).join(", ")}
                    <span className="text-secondary ml-1">
                      {t("clinicCard.andMore", {
                        count: clinic.insurances.length - (isMobile ? 1 : 2),
                      })}
                    </span>
                  </span>
                </TooltipTrigger>
                <TooltipContent>
                  <span>{clinic.insurances.join(", ")}</span>
                </TooltipContent>
              </Tooltip>
            ) : (
              <span className="truncate">
                {clinic.insurances.length > 0
                  ? clinic.insurances.join(", ")
                  : t("clinicCard.noInsurances", "No disponible")}
              </span>
            )}
          </div>

          {/* Action buttons */}
          <div
            className={cn("flex gap-2 sm:gap-3", isMobile ? "mt-3" : "mt-4")}
          >
            {isDoctorRole ? (
              <>
                {isConnected === "not_connected" ? (
                  <ToogleConfirmConnection
                    status={isConnected}
                    id={parseInt(clinic.id, 10)}
                    onConfirm={handleConfirmConnect}
                    isSubmitting={isConnecting}
                    enableMessageInput
                  >
                    <MCButton
                      variant={connectVariant}
                      size={isMobile ? "xs" : "sm"}
                      className={cn(
                        "flex-1",
                        isMobile && "text-xs px-2",
                        "border-secondary text-secondary hover:bg-secondary/10 hover:border-secondary/80 active:bg-secondary/20",
                      )}
                      disabled={connectBtnDisabled}
                    >
                      {connectBtnText}
                    </MCButton>
                  </ToogleConfirmConnection>
                ) : (
                  <ToogleConfirmConnection
                    status={isConnected}
                    id={parseInt(clinic.id, 10)}
                    onConfirm={isConnected === "connected" ? handleConfirmDisconnect : undefined}
                    isSubmitting={isConnecting}
                  >
                    <MCButton
                      variant={connectVariant}
                      size={isMobile ? "xs" : "sm"}
                      className={cn(
                        "flex-1",
                        isMobile && "text-xs px-2",
                        isConnected === "connected" &&
                          "border-emerald-500 text-emerald-700 bg-emerald-50 hover:bg-emerald-100 dark:border-emerald-400 dark:text-emerald-300 dark:bg-emerald-950/30",
                        isConnected === "pending" &&
                          "border-gray-300 text-gray-500 bg-gray-100 cursor-not-allowed",
                      )}
                      disabled={connectBtnDisabled || isConnecting}
                    >
                      {connectBtnText}
                    </MCButton>
                  </ToogleConfirmConnection>
                )}
                <MCButton
                  variant="outline"
                  size={isMobile ? "xs" : "sm"}
                  className={cn("flex-1", isMobile && "text-xs px-2")}
                  onClick={handleProfile}
                >
                  {t("clinicCard.viewProfile")}
                </MCButton>
              </>
            ) : (
              <MCButton
                variant="outline"
                size={isMobile ? "xs" : "sm"}
                className={cn("flex-1", isMobile && "text-xs px-2")}
                onClick={handleProfile}
              >
                {t("clinicCard.viewProfile")}
              </MCButton>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export const CenterCards = memo(CenterCardsComponent);
