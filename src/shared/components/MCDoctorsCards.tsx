import React from "react";
import { Card, CardContent, CardTitle } from "@/shared/ui/card";
import { Star, Heart, Languages, ShieldCheck, Stethoscope } from "lucide-react";
import MCButton from "./forms/MCButton";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "../ui/tooltip";
import { MCUserAvatar } from "@/shared/navigation/userMenu/MCUserAvatar";
import { useIsMobile } from "@/lib/hooks/useIsMobile";

/* =========================
   TYPES
========================= */

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
  lastAppointment?: string; // solo S
}

/* =========================
   VARIANT STYLES
========================= */

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
    imageHeight: "h-40",
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

/* =========================
   COMPONENT
========================= */

function MCDoctorsCards({
  name,
  specialty,
  rating,
  yearsOfExperience,
  languages,
  insuranceAccepted,
  isFavorite,
  urlImage,
  variant = "m",
  lastAppointment,
}: Doctor) {
  const styles = VARIANT_STYLES[variant];
  const isMobile = useIsMobile();

  return (
    <Card className="rounded-3xl bg-transparent border border-primary/10 shadow-sm hover:shadow-lg transition-shadow h-full flex flex-col">
      {/* IMAGE */}
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

        {isFavorite && (
          <div className="absolute top-3 right-3 bg-background/30 rounded-full p-1">
            <Heart size={16} fill="red" className="text-red-500" />
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
            <p className={`text-secondary ${styles.subtitle}`}>{specialty}</p>
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
            <span className="text-xs text-muted-foreground">
              Última cita: {lastAppointment}
            </span>
          )}

          {/* Mostrar experiencia, idiomas y seguros solo en "default" */}
          {variant === "default" && (
            <>
              <div className="flex items-center gap-2">
                <Stethoscope size={16} className="text-secondary" />
                <span className="text-sm">
                  {yearsOfExperience
                    ? `${yearsOfExperience}+ años de experiencia`
                    : "Experiencia no especificada"}
                </span>
              </div>

              <div className="flex items-center gap-2">
                <Languages size={16} className="text-secondary" />
                <span className="text-sm truncate">
                  {languages?.join(", ") || "Idiomas no especificados"}
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
                            Seguros aceptados:
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

      {/* ACTIONS */}
      <div className="mt-auto px-4 pb-4 grid grid-cols-3 gap-2">
        <MCButton size={styles.buttonSize}>Agendar</MCButton>
        <MCButton size={styles.buttonSize} variant="secondary">
          Perfil
        </MCButton>

        <MCButton size={styles.buttonSize} variant="secondary">
          Historial
        </MCButton>
      </div>
    </Card>
  );
}

export default MCDoctorsCards;
