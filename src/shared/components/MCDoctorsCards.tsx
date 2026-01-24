import { useTranslation } from "react-i18next";
import { Card, CardContent, CardTitle } from "@/shared/ui/card";
import { Star, Languages, ShieldCheck, Stethoscope } from "lucide-react";
import MCButton from "./forms/MCButton";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "../ui/tooltip";
import { MCUserAvatar } from "@/shared/navigation/userMenu/MCUserAvatar";
import { useIsMobile } from "@/lib/hooks/useIsMobile";
import { Heart as HeartFilled, Heart as HeartOutlined } from "lucide-react";
import { useAppStore } from "@/stores/useAppStore";

export type DoctorCardVariant = "s" | "m" | "default";

interface Doctor {
  key?: number;
  name: string;
  specialty: string;
  rating: number;
  yearsOfExperience?: number;
  languages?: string[];
  insuranceAccepted?: string[];
  isFavorite?: boolean;
  urlImage?: string;
  variant?: DoctorCardVariant;
  lastAppointment?: string;
  onToggleFavorite?: () => void;
}

const VARIANT_STYLES = {
  s: {
    imageHeight: "h-28",
    title: "text-sm",
    subtitle: "text-xs",
    gap: "gap-1",
    buttonSize: "xs" as const,
    showExtraInfo: false,
  },
  m: {
    imageHeight: "h-48",
    title: "text-base",
    subtitle: "text-sm",
    gap: "gap-1.5",
    buttonSize: "xs" as const,
    showExtraInfo: true,
  },
  default: {
    imageHeight: "h-64",
    title: "text-xl",
    subtitle: "text-lg",
    gap: "gap-2",
    buttonSize: "s" as const,
    showExtraInfo: true,
  },
};

function MCDoctorsCards({
  name,
  specialty,
  rating,
  yearsOfExperience,
  languages,
  insuranceAccepted,
  isFavorite,
  urlImage,
  variant = "default",
  lastAppointment,
  onToggleFavorite,
}: Doctor) {
  const styles = VARIANT_STYLES[variant];
  const isMobile = useIsMobile();
  const { t } = useTranslation("patient");

  const userRole = useAppStore((state) => state.user?.role);

  const handleFavoriteClick = () => {};

  return (
    <Card className="rounded-3xl bg-transparent border border-primary/10 shadow-sm hover:shadow-lg transition-shadow h-full flex flex-col">
      <div className="relative overflow-hidden rounded-3xl border border-primary/5">
        {urlImage ? (
          <img
            src={urlImage}
            alt={name}
            className={`w-full object-cover transition-transform duration-500 hover:scale-110 ${styles.imageHeight}`}
          />
        ) : (
          <div
            className={`
              flex items-center justify-center w-full
              ${isMobile ? "h-48" : styles.imageHeight} bg-muted
            `}
          >
            <div className="min-w-[96px] w-full">
              <MCUserAvatar
                name={name}
                square
                size={
                  isMobile
                    ? 96
                    : variant === "s"
                      ? 56
                      : variant === "m"
                        ? 96
                        : 128
                }
                className="w-full h-auto object-cover transition-transform duration-500 hover:scale-110"
              />
            </div>
          </div>
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
              WebkitBackdropFilter: "blur(16px) saturate(180%) contrast(120%)",
            }}
            onClick={onToggleFavorite} // <-- Usa el prop
          >
            {isFavorite ? (
              <HeartFilled size={20} fill="red" className="text-red-500" />
            ) : (
              <HeartOutlined size={20} className="text-white/50 stroke-2" />
            )}
          </div>
        )}
      </div>

      {/* CONTENT */}
      <CardContent className="pt-3 pb-2">
        {/* HEADER */}
        <div className="flex items-start justify-between">
          <div>
            <CardTitle className={`font-semibold text-primary ${styles.title}`}>
              {name}
            </CardTitle>
            <p className={`text-primary/80 ${styles.subtitle}`}>{specialty}</p>
          </div>

          <div className="flex items-center gap-1">
            <Star size={16} fill="#F7B500" className="text-[#F7B500]" />
            <span className="text-sm font-medium">{rating}</span>
          </div>
        </div>

        {/* DIVIDER */}
        {variant === "default" && (
          <div className="my-3 h-[1.5px] w-full rounded-full bg-gradient-to-r from-primary/5 via-primary/30 to-primary/5" />
        )}

        {/* BODY */}
        <div className={`flex flex-col text-primary ${styles.gap}`}>
          {/* Mostrar lastAppointment en "s" y "m" */}
          {(variant === "s" || variant === "m") && lastAppointment && (
            <span className="text-xs text-primary/50 my-1">
              {t("doctors.lastAppointment", "Last appointment")}:{" "}
              {lastAppointment}
            </span>
          )}

          {/* Mostrar experiencia, idiomas y seguros solo en "default" */}
          {variant === "default" && (
            <>
              <div className="flex items-center gap-2">
                <Stethoscope size={16} className="text-secondary" />
                <span className="text-sm">
                  {yearsOfExperience
                    ? t("doctors.experience", {
                        count: yearsOfExperience,
                        years: yearsOfExperience,
                      })
                    : t("doctors.noExperience", "Experience not specified")}
                </span>
              </div>

              <div className="flex items-center gap-2">
                <Languages size={16} className="text-secondary" />
                <span className="text-sm truncate">
                  {languages?.length
                    ? languages.join(", ")
                    : t("doctors.noLanguages", "Languages not specified")}
                </span>
              </div>

              {insuranceAccepted && (
                <div className="flex items-start gap-2">
                  <ShieldCheck size={16} className="text-secondary mt-0.5" />
                  <TooltipProvider>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <div className="cursor-pointer">
                          <span className="font-semibold text-sm">
                            {t(
                              "doctors.acceptedInsurances",
                              "Accepted insurances",
                            )}
                            :
                          </span>
                          <p className="text-sm truncate max-w-[220px]">
                            {insuranceAccepted.join(", ")}
                          </p>
                        </div>
                      </TooltipTrigger>
                      <TooltipContent>
                        {insuranceAccepted.join(", ")}
                      </TooltipContent>
                    </Tooltip>
                  </TooltipProvider>
                </div>
              )}
            </>
          )}
        </div>
      </CardContent>

      <div className="grid grid-cols-3 gap-2 ">
        <MCButton size={styles.buttonSize}>
          {t("doctors.schedule", "Schedule")}
        </MCButton>
        <MCButton size={styles.buttonSize} variant="secondary">
          {t("doctors.profile", "Profile")}
        </MCButton>
        <MCButton size={styles.buttonSize} variant="secondary">
          {t("doctors.history", "History")}
        </MCButton>
      </div>
    </Card>
  );
}

export default MCDoctorsCards;
