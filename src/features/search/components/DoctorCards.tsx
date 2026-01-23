import {
  Star,
  MapPin,
  Globe,
  Monitor,
  Shield,
  Calendar,
  Check,
} from "lucide-react";
import { type Doctor } from "@/data/providers";
import { cn } from "@/lib/utils";
import { useAppStore } from "@/stores/useAppStore";
import MCButton from "@/shared/components/forms/MCButton";
import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/shared/ui/tooltip";
import { useIsMobile } from "@/lib/hooks/useIsMobile";
import { useTranslation } from "react-i18next";
import { Heart as HeartFilled, Heart as HeartOutlined } from "lucide-react";
interface DoctorCardsProps {
  doctor: Doctor;
  isSelected: boolean;
  onSelect: (id: string) => void;
  onViewProfile: (id: string) => void;
}

export const DoctorCards = ({
  doctor,
  isSelected,
  onSelect,
  onViewProfile,
}: DoctorCardsProps) => {
  const userRole = useAppStore((state) => state.user?.role);
  const [isConnected, setIsConnected] = useState(doctor.isConnected ?? false);
  const [isFavorite, setIsFavorite] = useState(doctor.isFavorite ?? false); // <-- Nuevo estado
  const isMobile = useIsMobile();
  const navigate = useNavigate();
  const { t } = useTranslation("common");

  const handleConnectToggle = () => {
    setIsConnected((prev) => !prev);
  };

  const handleFavoriteToggle = (e: React.MouseEvent) => {
    e.stopPropagation();
    setIsFavorite((prev) => !prev);
  };

  return (
    <div
      className={cn(
        "bg-background p-3 sm:p-4 border-b transition-all duration-200",
        isSelected
          ? "border-b-primary border-b-2 bg-primary/5 dark:bg-primary/10 rounded-t-2xl sm:rounded-t-4xl"
          : "border-primary/15 hover:bg-muted/30",
      )}
    >
      <div className="flex gap-3 sm:gap-4 h-full">
        {/* Doctor Image - Responsive sizing */}
        <div
          className={cn(
            "relative overflow-hidden rounded-2xl sm:rounded-3xl border border-primary/5 doctor-image flex-shrink-0",
            isMobile ? "w-20 h-20 rounded-full" : "",
          )}
        >
          {/* Imagen del doctor */}
          {doctor.image ? (
            <img
              src={doctor.image}
              alt={doctor.name}
              className="w-30 h-full md:w-45 md:h-full object-cover transition-transform duration-500 hover:scale-110"
            />
          ) : (
            <img
              src="https://i.pinimg.com/736x/2c/bb/0e/2cbb0ee6c1c55b1041642128c902dadd.jpg"
              alt="Doctor por defecto"
              className="w-30 h-full md:w-45 md:h-full object-cover transition-transform duration-500 hover:scale-110"
            />
          )}

          {/* FAVORITE ICON SOLO PARA PACIENTES */}
          {userRole === "PATIENT" && (
            <div
              className={`
                absolute top-3 right-3
                flex flex-col justify-center items-center
                rounded-full border-none border-white/60
                bg-black/20 backdrop-blur-xl shadow-2xl
                transition-all duration-700 ease-[cubic-bezier(0.175,0.885,0.32,2.2)]
                z-20 p-1.5
              `}
              style={{
                backdropFilter: "blur(16px) saturate(180%) contrast(120%)",
                WebkitBackdropFilter:
                  "blur(16px) saturate(180%) contrast(120%)",
              }}
              onClick={handleFavoriteToggle} // <-- Toggle favorito
            >
              {isFavorite ? (
                <HeartFilled size={20} fill="red" className="text-red-500" />
              ) : (
                <HeartOutlined size={20} className="text-white/50 stroke-2" />
              )}
            </div>
          )}
        </div>
        {/* Doctor Info - Flexible container */}
        <div className="flex-1 min-w-0">
          {/* Header with name and selection */}
          <div className="flex items-start justify-between gap-2">
            <div className="flex-1 min-w-0">
              <h3
                className={cn(
                  "font-semibold text-foreground leading-tight hover:underline cursor-pointer",
                  isMobile ? "text-sm" : "text-base md:text-lg",
                )}
                onClick={(e) => {
                  e.stopPropagation();
                  navigate(`/doctor/profile/${doctor.id}`);
                }}
              >
                {doctor.name}
              </h3>

              {/* Rating and specialty */}
              <div
                className={cn(
                  "flex items-center gap-1.5 sm:gap-2 mt-1 flex-wrap",
                  isMobile && "text-xs",
                )}
              >
                <span className="text-primary text-xs sm:text-sm truncate max-w-[120px] sm:max-w-none">
                  {doctor.specialty}
                </span>
                <span className="text-muted-foreground hidden sm:inline">
                  ·
                </span>
                <div className="flex items-center gap-1">
                  <Star
                    className={cn(
                      "fill-amber-400 text-amber-400",
                      isMobile ? "w-3 h-3" : "w-4 h-4",
                    )}
                  />
                  <span className="text-xs sm:text-sm font-medium">
                    {doctor.rating}
                  </span>
                  {!isMobile && (
                    <span className="text-muted-foreground text-xs sm:text-sm">
                      ({doctor.reviewCount} {t("clinicCard.reviews")})
                    </span>
                  )}
                </div>
              </div>
            </div>

            {/* Selection checkbox */}
            {userRole !== "DOCTOR" && userRole !== "CENTER" && (
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  onSelect(doctor.id);
                }}
                className={cn(
                  "rounded-full border flex items-center justify-center transition-all flex-shrink-0",
                  isMobile ? "w-5 h-5" : "w-6 h-6",
                  isSelected
                    ? "bg-primary border-primary text-primary-foreground scale-110"
                    : "border-primary/40 hover:border-primary hover:scale-105",
                )}
              >
                {isSelected && (
                  <Check
                    className={cn(isMobile ? "w-3 h-3" : "w-4 h-4", "stroke-3")}
                  />
                )}
              </button>
            )}
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
            {Array.isArray(doctor.address) && doctor.address.length > 1 ? (
              <Tooltip>
                <TooltipTrigger asChild>
                  <span className="truncate cursor-pointer">
                    {isMobile
                      ? `${doctor.address[0].substring(0, 25)}...`
                      : doctor.address[0]}
                    <span className="text-secondary ml-1">
                      {!isMobile &&
                        t("clinicCard.andMore", {
                          count: doctor.address.length - 1,
                        })}
                    </span>
                  </span>
                </TooltipTrigger>
                <TooltipContent>
                  <div className="flex flex-col gap-1">
                    {doctor.address.map((addr, idx) => (
                      <span key={idx}>{addr}</span>
                    ))}
                  </div>
                </TooltipContent>
              </Tooltip>
            ) : (
              <span className="line-clamp-1">
                {Array.isArray(doctor.address)
                  ? doctor.address[0]
                  : doctor.address}
              </span>
            )}
          </div>

          {/* Languages & Modality - Now visible on all devices */}
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
              {doctor.languages.length > 2 ? (
                <Tooltip>
                  <TooltipTrigger asChild>
                    <span className="cursor-pointer">
                      {doctor.languages[0]}
                      <span className="text-secondary ml-1">
                        {t("clinicCard.andOtherLanguages", {
                          count: doctor.languages.length - 1,
                        })}
                      </span>
                    </span>
                  </TooltipTrigger>
                  <TooltipContent>
                    <span>{doctor.languages.join(", ")}</span>
                  </TooltipContent>
                </Tooltip>
              ) : (
                <span>{doctor.languages.join(", ")}</span>
              )}
            </div>
            <div className="flex items-center gap-1.5 text-muted-foreground">
              <Monitor
                className={cn(
                  "text-secondary",
                  isMobile ? "w-3 h-3" : "w-4 h-4",
                )}
              />
              <span>{doctor.modality.join(" / ")}</span>
            </div>
          </div>

          {/* Insurances - Simplified on mobile */}
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
            {doctor.insurances.length > 2 ? (
              <Tooltip>
                <TooltipTrigger asChild>
                  <span className="cursor-pointer truncate">
                    {isMobile
                      ? doctor.insurances[0]
                      : doctor.insurances.slice(0, 2).join(", ")}
                    <span className="text-secondary ml-1">
                      {t("clinicCard.andMore", {
                        count: doctor.insurances.length - (isMobile ? 1 : 2),
                      })}
                    </span>
                  </span>
                </TooltipTrigger>
                <TooltipContent>
                  <span>{doctor.insurances.join(", ")}</span>
                </TooltipContent>
              </Tooltip>
            ) : (
              <span className="truncate">{doctor.insurances.join(", ")}</span>
            )}
          </div>

          {/* Availability - Adjusted for mobile */}
          {userRole !== "DOCTOR" && userRole !== "CENTER" && (
            <div className="mt-3">
              <div
                className={cn(
                  "flex items-center gap-1.5 text-muted-foreground mb-2",
                  isMobile ? "text-xs" : "text-sm",
                )}
              >
                <Calendar
                  className={cn(
                    "text-secondary",
                    isMobile ? "w-3 h-3" : "w-4 h-4",
                  )}
                />
                <span>
                  {isMobile
                    ? t("doctorCard.availability")
                    : t("doctorCard.availableAvailability")}
                </span>
              </div>
              <div className="flex gap-1 sm:gap-1.5 overflow-x-auto pb-1 scrollbar-hide">
                {doctor.availability
                  .slice(0, isMobile ? 4 : 6)
                  .map((slot, idx) => (
                    <div
                      key={idx}
                      className={cn(
                        "flex flex-col items-center px-1.5 sm:px-2 py-1 sm:py-1.5 rounded-lg text-xs doctor-slot flex-shrink-0",
                        isMobile ? "min-w-[45px]" : "min-w-[50px]",
                        slot.slots === 0
                          ? "bg-primary/5 dark:bg-primary/10 border-primary/10 text-primary/25 cursor-not-allowed"
                          : "bg-accent text-accent-foreground border-border cursor-pointer transition-colors hover:border-primary hover:bg-accent/80 active:bg-accent/70",
                      )}
                      onClick={(e) => e.preventDefault()}
                      tabIndex={slot.slots === 0 ? -1 : 0}
                      aria-disabled={slot.slots === 0}
                    >
                      <span
                        className={cn("font-medium", isMobile && "text-[10px]")}
                      >
                        {isMobile ? slot.dayName.substring(0, 3) : slot.dayName}
                      </span>
                      <span className="text-muted-foreground text-[9px] sm:text-[10px]">
                        {slot.date}
                      </span>
                      <span
                        className={cn(
                          "mt-1 font-semibold",
                          isMobile ? "text-xs" : "text-sm",
                          slot.slots === 0
                            ? "text-muted-foreground"
                            : "text-primary dark:text-black",
                        )}
                      >
                        {slot.slots === 0
                          ? t("doctorCard.noSlots")
                          : slot.slots}
                      </span>
                      <span className="text-muted-foreground text-[9px] sm:text-[10px]">
                        {t("doctorCard.appointments")}
                      </span>
                    </div>
                  ))}
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    onViewProfile(doctor.id);
                  }}
                  className={cn(
                    "flex items-center justify-center px-2 sm:px-3 py-1.5 rounded-lg border border-primary/5 font-medium text-foreground transition-colors flex-shrink-0",
                    isMobile ? "min-w-[45px] text-xs" : "min-w-[50px] text-sm",
                    "hover:bg-primary/10 hover:border-primary/40 hover:text-primary active:bg-primary/8 active:border-primary active:text-primary",
                  )}
                >
                  {t("doctorCard.more")}
                </button>
              </div>
            </div>
          )}

          {/* Action buttons - Responsive layout */}
          <div
            className={cn("flex gap-2 sm:gap-3", isMobile ? "mt-3" : "mt-4")}
          >
            {userRole === "CENTER" ? (
              <>
                <MCButton
                  variant={isConnected ? "primary" : "outline"}
                  size={isMobile ? "xs" : "sm"}
                  className={cn(
                    "flex-1",
                    isMobile && "text-xs px-2",
                    isConnected &&
                      "bg-secondary hover:bg-secondary/90 text-white border-none active:bg-secondary/80",
                    !isConnected &&
                      "border-secondary text-secondary hover:bg-secondary/10 hover:border-secondary/80 active:bg-secondary/20",
                  )}
                  onClick={handleConnectToggle}
                >
                  {isConnected
                    ? t("clinicCard.connected")
                    : t("clinicCard.connect")}
                </MCButton>
                <MCButton
                  variant="outline"
                  size={isMobile ? "xs" : "sm"}
                  className={cn("flex-1", isMobile && "text-xs px-2")}
                  onClick={() => navigate(`/doctor/profile/${doctor.id}`)}
                >
                  {t("clinicCard.viewProfile")}
                </MCButton>
              </>
            ) : (
              userRole !== "PATIENT" && (
                <MCButton
                  variant="outline"
                  size={isMobile ? "xs" : "sm"}
                  className={cn("flex-1", isMobile && "text-xs px-2")}
                  onClick={() => navigate(`/doctor/profile/${doctor.id}`)}
                >
                  {t("clinicCard.viewProfile")}
                </MCButton>
              )
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
