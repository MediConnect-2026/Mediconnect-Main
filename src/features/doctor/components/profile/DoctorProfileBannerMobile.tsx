import { useEffect, useMemo, useState } from "react";
import MCButton from "@/shared/components/forms/MCButton";
import {
  Settings,
  Copy,
  LogOut,
  Ellipsis,
  BadgeCheck,
  Star,
  MessageCircle,
  Heart,
  HeartOff,
  Languages,
  Stethoscope,
} from "lucide-react";
import { doctorService } from "@/shared/navigation/userMenu/editProfile/doctor/services/doctor.service";
import type { Idioma } from "@/shared/navigation/userMenu/editProfile/doctor/services/doctor.types";
import { onDoctorLanguageChanged } from "@/lib/events/languageEvents";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/shared/ui/dropdown-menu";
import { Button } from "@/shared/ui/button";
import {
  Avatar as UiAvatar,
  AvatarFallback,
  AvatarImage,
} from "@/shared/ui/avatar";
import { MCUserAvatar } from "@/shared/navigation/userMenu/MCUserAvatar";
import { MCUserBanner } from "@/shared/navigation/userMenu/MCUserBanner";
import { useTranslation } from "react-i18next";
import { getDoctorRating, getUserAvatar, getUserFullName } from "@/services/auth/auth.types";
import { useAppStore } from "@/stores/useAppStore";
import { ROUTES } from "@/router/routes";
import { useNavigate } from "react-router-dom";
import { useVerifyInfoStore } from "@/stores/useVerifyInfoStore";
import { useGlobalUIStore } from "@/stores/useGlobalUIStore";
import { useStartConversation } from "@/lib/hooks/useStartConversation";
import { useAddDoctorToFavorites, useRemoveDoctorFromFavorites } from "@/lib/hooks/useFavoriteDoctor";
import { Spinner } from "@/shared/ui/spinner";
import { MCModalBase } from "@/shared/components/MCModalBase";

interface Props {
  doctor: any;
  setOpenSheet: (open: boolean) => void;
  onSendMessage?: () => void;
  onToggleFavorite?: () => void;
  isMyProfile?: boolean;
}

// Lista de idiomas disponibles para traducción
const AVAILABLE_LANGUAGES = [
  { label: "Español", labelEn: "Spanish" },
  { label: "Inglés", labelEn: "English" },
  { label: "Francés", labelEn: "French" },
  { label: "Alemán", labelEn: "German" },
  { label: "Italiano", labelEn: "Italian" },
  { label: "Portugués", labelEn: "Portuguese" },
  { label: "Chino", labelEn: "Chinese" },
  { label: "Japonés", labelEn: "Japanese" },
  { label: "Árabe", labelEn: "Arabic" },
  { label: "Ruso", labelEn: "Russian" },
];

function DoctorProfileBannerMobile({
  doctor,
  setOpenSheet,
  onSendMessage,
  onToggleFavorite,
  isMyProfile,
}: Props) {
  const { t, i18n } = useTranslation("doctor");
  const navigate = useNavigate();
  const logout = useAppStore((state) => state.logout);
  const setToast = useGlobalUIStore((state) => state.setToast);
  const clearAllVerifyInfo = useVerifyInfoStore((state) => state.clearAll);
  const currentUser = useAppStore((s) => s.user);
  const [languages, setLanguages] = useState<Idioma[]>([]);
  const [isFavorite, setIsFavorite] = useState<boolean>(Boolean(doctor?.isFavorite));
  const { startConversation, isLoading: isStartingConversation } = useStartConversation();
  const { mutate: addToFavorites, isPending: isAddingFavorite } = useAddDoctorToFavorites();
  const { mutate: removeFromFavorites, isPending: isRemovingFavorite } = useRemoveDoctorFromFavorites();

  const doctorUserId: number | undefined = doctor?.id ?? doctor?.usuarioId;
  const canMessage = !isMyProfile && currentUser?.rol === "PATIENT" && !!doctorUserId;
  const isDoctorViewerOtherProfile =
    !isMyProfile &&
    (currentUser?.rol === "DOCTOR" || currentUser?.rol === "Doctor");
  const verificationStatusRaw =
    doctor?.doctor?.estadoVerificacion ?? doctor?.estadoVerificacion;
  const isDoctorVerified =
    typeof verificationStatusRaw === "string" &&
    ["aprobado", "aproved", "approved"].includes(
      verificationStatusRaw.toLowerCase().trim(),
    );

  const fetchLanguages = async () => {
    if (!isMyProfile) return; // Solo cargar si es mi perfil
    try {
      const response = await doctorService.getDoctorLanguages();
      setLanguages(response.data || []);
    } catch (err) {
      console.error("Error al obtener idiomas del doctor:", err);
    }
  };

  useEffect(() => {
    fetchLanguages();
  }, [isMyProfile]);

  useEffect(() => {
    const unsubscribe = onDoctorLanguageChanged(() => {
      fetchLanguages();
    });
    return unsubscribe;
  }, []);

  useEffect(() => {
    setIsFavorite(Boolean(doctor?.isFavorite));
  }, [doctor?.isFavorite, doctor?.id, doctor?.usuarioId]);

  const getLanguageLabel = (nombre: string) => {
    const lang = AVAILABLE_LANGUAGES.find((l) => l.label === nombre);
    return i18n.language === "en" ? (lang?.labelEn || nombre) : nombre;
  };

  const getDoctorSpecialty = (especialidades: any) => {
    if (!Array.isArray(especialidades) || especialidades.length === 0) {
      return t("profileForm.generalPractitioner", "Sin especialidad");
    }

    const specialtyNames = especialidades
      .map((item: any) => {
        if (typeof item === "string") return item.trim();
        if (!item || typeof item !== "object") return "";

        const nestedName = item.especialidades?.nombre;
        if (typeof nestedName === "string") return nestedName.trim();

        if (typeof item.nombre === "string") return item.nombre.trim();
        return "";
      })
      .filter((name: string) => name.length > 0);

    return specialtyNames.length > 0
      ? specialtyNames.join(", ")
      : t("profileForm.generalPractitioner", "Sin especialidad");
  };

  const specialtyText = useMemo(
    () => getDoctorSpecialty(doctor?.doctor?.especialidades ?? doctor?.especialidades),
    [doctor],
  );

  const doctorRating =
    getDoctorRating(doctor?.doctor?.calificacionPromedio ?? doctor?.calificacionPromedio) ||
    t("profileForm.noRating", "Sin calificación");
  const yearsOfExperience = doctor?.doctor?.anosExperiencia ?? doctor?.anosExperiencia;

  const handleLogout = () => {
    logout();
    clearAllVerifyInfo();
    setToast({
      message: t("profileForm.menu.logoutSuccess", "Sesión cerrada exitosamente"),
      type: "success",
      open: true,
    });
    navigate(ROUTES.LOGIN);
  };

  const handleCopyProfile = () => {
    navigator.clipboard.writeText(window.location.href);
    setToast({
      message: t("profileForm.menu.profileCopied", "Enlace de perfil copiado al portapapeles"),
      type: "success",
      open: true,
    });
  };

  const handleToggleFavorite = () => {
    const doctorIdNum = Number(doctor?.id ?? doctor?.usuarioId);
    if (!doctorIdNum) return;

    if (isFavorite) {
      removeFromFavorites(doctorIdNum, {
        onSuccess: () => {
          setIsFavorite(false);
          onToggleFavorite?.();
          setToast({
            message:
              t("doctorCard.favoriteRemoved", { ns: "common" }) ||
              t("doctorCard.favoriteAdded", { ns: "common" }),
            type: "success",
            open: true,
          });
        },
        onError: (err: any) => {
          setToast({
            message:
              err?.message ||
              t("doctorCard.favoriteRemoveError", { ns: "common" }) ||
              t("doctorCard.favoriteAddError", { ns: "common" }),
            type: "error",
            open: true,
          });
        },
      });
      return;
    }

    addToFavorites(doctorIdNum, {
      onSuccess: () => {
        setIsFavorite(true);
        onToggleFavorite?.();
        setToast({
          message: t("doctorCard.favoriteAdded", { ns: "common" }),
          type: "success",
          open: true,
        });
      },
      onError: (err: any) => {
        setToast({
          message: err?.message || t("doctorCard.favoriteAddError", { ns: "common" }),
          type: "error",
          open: true,
        });
      },
    });
  };

  const favoriteConfirmTitle = isFavorite
    ? t("doctorCard.confirmRemoveFavoriteTitle", { ns: "common" })
    : t("doctorCard.confirmFavoriteTitle", { ns: "common" });
  const favoriteConfirmDescription = isFavorite
    ? t("doctorCard.confirmRemoveFavoriteDescription", {
      name: getUserFullName(doctor),
      ns: "common",
    })
    : t("doctorCard.confirmFavoriteDescription", {
      name: getUserFullName(doctor),
      ns: "common",
    });

  return (
    <div className="w-full rounded-3xl shadow-md bg-background overflow-hidden border border-primary/10">
      {/* Banner */}
      <div className="relative h-40">
        {doctor?.banner || doctor?.usuario?.banner ? (
          <img
            src={doctor?.banner || doctor?.usuario?.banner}
            alt={t("profileForm.bannerImage")}
            className="w-full h-full object-cover"
          />
        ) : (
          <MCUserBanner
            name={getUserFullName(doctor) || "IliaTopuria"}
            className="w-full h-full"
          />
        )}

        {/* Avatar */}
        <div className="absolute -bottom-14 left-4">
          {getUserAvatar(doctor) ? (
            <UiAvatar className="w-28 h-28 border-4 border-background">
              <AvatarImage
                src={getUserAvatar(doctor)}
                alt={t("profileForm.profilePhoto")}
              />
              <AvatarFallback>
                {getUserFullName(doctor)
                  .split(" ")
                  .map((n: string) => n[0])
                  .join("")
                  .toUpperCase()}
              </AvatarFallback>
            </UiAvatar>
          ) : (
            <MCUserAvatar
              name={getUserFullName(doctor) || "IliaTopuria"}
              size={112}
              className="border-4 border-background rounded-full h-full w-full"
            />
          )}
        </div>
      </div>

      {/* Info */}
      <div className="pt-16 px-4 pb-4 flex flex-col gap-4">
        <div className="flex justify-between items-start">
          <div className="flex-1 min-w-0 pr-2">
            <div className="flex items-center gap-1 mb-1">
              <h3 className="text-lg font-semibold text-foreground truncate">
                {getUserFullName(doctor) || "Ilia Topuria"}
              </h3>
              {isDoctorVerified ? (
                <BadgeCheck className="w-4 h-4 text-background shrink-0" fill="#8bb1ca" />
              ) : null}
            </div>

            <p className="text-sm text-foreground font-medium mb-2 line-clamp-2">
              {specialtyText}
            </p>

            <div className="flex flex-col gap-1 text-xs text-muted-foreground">
              <div className="flex items-center gap-1">
                <Star fill="#F7B500" size={14} className="text-[#F7B500]" />
                <span>{doctorRating}</span>
              </div>
              <div className="flex items-center gap-1">
                <Stethoscope size={14} className="text-secondary" />
                <span>
                  {yearsOfExperience ?? 0} {t("profileForm.yearsExperience")}
                </span>
              </div>
              {languages.length > 0 && (
                <div className="flex items-center gap-1 min-w-0">
                  <Languages size={14} className="text-secondary" />
                  <span className="truncate">
                    {languages.map((lang) => getLanguageLabel(lang.nombre)).join(", ")}
                  </span>
                </div>
              )}
            </div>
          </div>

          {/* Menu */}
          {(isMyProfile || !isDoctorViewerOtherProfile) ? (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button size="icon" variant="outline" className="rounded-full shrink-0">
                  <Ellipsis />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                {isMyProfile ? (
                  <>
                    <DropdownMenuItem onClick={() => navigate(ROUTES.SETTINGS.ROOT)}>
                      <Settings className="w-4 h-4 mr-2" />
                      {t("profileForm.menu.settings")}
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={handleCopyProfile}>
                      <Copy className="w-4 h-4 mr-2" />
                      {t("profileForm.menu.copyProfile")}
                    </DropdownMenuItem>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem className="text-red-500" onClick={handleLogout}>
                      <LogOut className="w-4 h-4 mr-2" />
                      {t("profileForm.menu.logout")}
                    </DropdownMenuItem>
                  </>
                ) : (
                  <>
                    <DropdownMenuItem onClick={handleCopyProfile}>
                      <Copy className="w-4 h-4 mr-2" />
                      {t("profileForm.menu.copyProfile")}
                    </DropdownMenuItem>
                  </>
                )}
              </DropdownMenuContent>
            </DropdownMenu>
          ) : null}
        </div>

        {/* Action Buttons */}
        <div className="flex gap-2">
          {isMyProfile ? (
            <MCButton
              variant="secondary"
              size="m"
              className="rounded-full flex-1"
              onClick={() => setOpenSheet(true)}
            >
              {t("profileForm.editProfile")}
            </MCButton>
          ) : (
            <>
              {canMessage ? (
                <MCButton
                  variant="primary"
                  size="m"
                  className="rounded-full flex-1"
                  onClick={() => {
                    if (onSendMessage) {
                      onSendMessage();
                    } else if (doctorUserId) {
                      startConversation(doctorUserId);
                    }
                  }}
                  disabled={isStartingConversation}
                >
                  <MessageCircle className="w-4 h-4 mr-2" />
                  {isStartingConversation
                    ? t("profileForm.openingChat", "Abriendo chat...")
                    : t("profileForm.sendMessage")}
                </MCButton>
              ) : null}
              {!isDoctorViewerOtherProfile ? (
                <MCModalBase
                  id={`fav-mobile-${doctor?.id ?? doctor?.usuarioId}`}
                  title={favoriteConfirmTitle}
                  trigger={
                    <MCButton
                      variant={isFavorite ? "secondary" : "outline"}
                      size="m"
                      className={`rounded-full px-3 ${canMessage ? "" : "flex-1"}`}
                      disabled={isAddingFavorite || isRemovingFavorite}
                    >
                      {(isAddingFavorite || isRemovingFavorite) ? (
                        <Spinner className="text-red-500" />
                      ) : isFavorite ? (
                        <HeartOff className="w-4 h-4 text-red-500" />
                      ) : (
                        <Heart fill="red" className="w-4 h-4 text-red-500" />
                      )}
                    </MCButton>
                  }
                  size="sm"
                  variant="confirm"
                  confirmText={t("confirm", { ns: "common" })}
                  secondaryText={t("back", { ns: "patient" })}
                  onConfirm={handleToggleFavorite}
                  disabledConfirm={isAddingFavorite || isRemovingFavorite}
                >
                  <div className="py-4 px-2">
                    <p className="text-sm text-muted-foreground">
                      {favoriteConfirmDescription}
                    </p>
                  </div>
                </MCModalBase>
              ) : null}
            </>
          )}
        </div>
      </div>
    </div>
  );
}

export default DoctorProfileBannerMobile;
