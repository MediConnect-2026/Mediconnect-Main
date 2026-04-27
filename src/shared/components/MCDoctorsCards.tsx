import { useTranslation } from "react-i18next";
import { useState, useEffect } from "react";
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
import ScheduleAppointmentDialog from "@/features/patient/components/appoiments/ScheduleAppointmentDialog";
import { useNavigate } from "react-router-dom";
import HistoryDialog from "@/features/patient/components/doctors/HistoryDialog";
import ToogleConfirmConnection from "@/features/request/components/ToogleConfirmConnection";
import { MCDialogBase } from "@/shared/components/MCDialogBase";
import { useGlobalUIStore } from "@/stores/useGlobalUIStore";
import { doctorService } from "@/shared/navigation/userMenu/editProfile/doctor/services";

export type DoctorCardVariant = "s" | "m" | "default";

interface Doctor {
  id?: number | string;

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
  connectionStatus?: "connected" | "not_connected" | "pending"; // <-- Agrega esto si no está
  onConnect?: (id: string | number) => void; // <-- Agrega esto si quieres manejar la conexión
  isConnectionSubmitting?: boolean;
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
  id,
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
  connectionStatus = "not_connected", // <-- default
  onConnect,
  isConnectionSubmitting = false,
}: Doctor) {
  const styles = VARIANT_STYLES[variant];
  const isMobile = useIsMobile();
  const { t } = useTranslation(["patient", "common"]);
  const navigate = useNavigate();
  const setToast = useGlobalUIStore((state) => state.setToast);

  const [isFavoriteLocal, setIsFavoriteLocal] = useState(isFavorite ?? false);
  const [favoriteDialogOpen, setFavoriteDialogOpen] = useState(false);
  const [favoriteLoading, setFavoriteLoading] = useState(false);

  useEffect(() => {
    if (isFavorite !== undefined) {
      setIsFavoriteLocal(isFavorite);
    }
  }, [isFavorite]);

  const handleFavoriteToggle = (e: React.MouseEvent) => {
    e.stopPropagation();
    setFavoriteDialogOpen(true);
  };

  const confirmToggleFavorite = async () => {
    if (!id) return;
    setFavoriteLoading(true);
    try {
      if (isFavoriteLocal) {
        await doctorService.removeDoctorFromFavorites(Number(id));
        setIsFavoriteLocal(false);
        setToast?.({
          type: "success",
          message: t(
            "common:doctorCard.favoriteRemoved",
            "Doctor eliminado de favoritos",
          ),
          open: true,
        });
      } else {
        await doctorService.addDoctorToFavorites(Number(id));
        setIsFavoriteLocal(true);
        setToast?.({
          type: "success",
          message: t(
            "common:doctorCard.favoriteAdded",
            "Doctor agregado a favoritos",
          ),
          open: true,
        });
      }
      setFavoriteDialogOpen(false);
      if (onToggleFavorite) onToggleFavorite();
    } catch (err: any) {
      console.error("Failed to toggle favorite", err);
      setToast?.({
        type: "error",
        message:
          err?.message ||
          (isFavoriteLocal
            ? t(
                "common:doctorCard.favoriteRemoveError",
                "No se pudo eliminar de favoritos",
              )
            : t(
                "common:doctorCard.favoriteAddError",
                "No se pudo agregar a favoritos",
              )),
        open: true,
      });
    } finally {
      setFavoriteLoading(false);
    }
  };

  const userRole = useAppStore((state) => state.user?.rol);

  const handleProfileClick = () => {
    if (id) {
      navigate(`/doctor/profile/${id}`);
    }
  };

  // --- NUEVO: Lógica de botón de conexión ---
  let connectBtnText = t("clinicCard.connect");
  let connectBtnDisabled = false;
  let connectVariant: "primary" | "outline" = "outline";
  if (connectionStatus === "connected") {
    connectBtnText = t("clinicCard.connected");
    connectVariant = "primary";
  } else if (connectionStatus === "pending") {
    connectBtnText = t("clinicCard.pending");
    connectBtnDisabled = true;
  }
  const handleConfirmConnect = () => {
    if (onConnect && id) onConnect(id);
  };

  return (
    <>
      <MCDialogBase
        open={favoriteDialogOpen}
        onOpenChange={(o) => setFavoriteDialogOpen(o)}
        title={
          isFavoriteLocal
            ? t(
                "common:doctorCard.confirmRemoveFavoriteTitle",
                "Eliminar de favoritos",
              )
            : t("common:doctorCard.confirmFavoriteTitle", "Agregar a favoritos")
        }
        description={
          isFavoriteLocal
            ? t("common:doctorCard.confirmRemoveFavoriteDescription", {
                name: name,
                defaultValue: `¿Deseas eliminar a ${name} de tus favoritos?`,
              })
            : t("common:doctorCard.confirmFavoriteDescription", {
                name: name,
                defaultValue: `¿Deseas agregar a ${name} a tus favoritos?`,
              })
        }
        confirmText={t("common:common.confirm", "Confirmar")}
        secondaryText={t("common:common.cancel", "Cancelar")}
        onConfirm={confirmToggleFavorite}
        onSecondary={() => setFavoriteDialogOpen(false)}
        variant="confirm"
        loading={favoriteLoading}
      >
        <span className="hidden"></span>
      </MCDialogBase>
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
                WebkitBackdropFilter:
                  "blur(16px) saturate(180%) contrast(120%)",
              }}
              onClick={handleFavoriteToggle}
            >
              {isFavoriteLocal ? (
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
              <CardTitle
                className={`font-semibold text-primary ${styles.title}`}
              >
                {name}
              </CardTitle>
              <p className={`text-primary/80 ${styles.subtitle}`}>
                {specialty}
              </p>
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

        <div className="flex justify-between gap-3">
          {userRole === "CENTER" && (
            <>
              <ToogleConfirmConnection
                status={connectionStatus}
                id={typeof id === "string" ? parseInt(id) : (id ?? 0)}
                onConfirm={handleConfirmConnect}
                isSubmitting={isConnectionSubmitting}
              >
                <MCButton
                  size={styles.buttonSize}
                  variant={connectVariant}
                  className={[
                    "flex-1 w-full",
                    connectionStatus === "connected" &&
                      "bg-secondary hover:bg-secondary/90 text-white border-none active:bg-secondary/80",
                    connectionStatus === "not_connected" &&
                      "border-secondary text-secondary hover:bg-secondary/10 hover:border-secondary/80 active:bg-secondary/20",
                    connectionStatus === "pending" &&
                      "border-gray-300 text-gray-500 bg-gray-100 cursor-not-allowed",
                  ]
                    .filter(Boolean)
                    .join(" ")}
                  disabled={connectBtnDisabled}
                >
                  {connectBtnText}
                </MCButton>
              </ToogleConfirmConnection>
              <MCButton
                size={styles.buttonSize}
                variant="secondary"
                className="w-full flex-1"
                onClick={handleProfileClick}
              >
                {t("doctors.profile")}
              </MCButton>
            </>
          )}
          {userRole === "DOCTOR" && (
            <MCButton
              size={styles.buttonSize}
              variant="secondary"
              className="w-full"
              onClick={handleProfileClick}
            >
              {t("doctors.profile")}
            </MCButton>
          )}
          {userRole === "PATIENT" && (
            <>
              <ScheduleAppointmentDialog idProvider={id?.toString() ?? ""}>
                <MCButton size={styles.buttonSize} className="w-full">
                  {t("doctors.schedule")}
                </MCButton>
              </ScheduleAppointmentDialog>
              <MCButton
                size={styles.buttonSize}
                variant="secondary"
                className="w-full"
                onClick={handleProfileClick}
              >
                {t("doctors.profile")}
              </MCButton>
              <HistoryDialog doctorId={id?.toString() ?? ""}>
                <MCButton
                  size={styles.buttonSize}
                  className="w-full"
                  variant="secondary"
                >
                  {t("doctors.history")}
                </MCButton>
              </HistoryDialog>
            </>
          )}
        </div>
      </Card>
    </>
  );
}

export default MCDoctorsCards;
