import { useEffect, useState } from "react";
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
  Stethoscope,
  Languages,
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
import { ROUTES } from "@/router/routes";
import { useNavigate } from "react-router-dom";
import { useVerifyInfoStore } from "@/stores/useVerifyInfoStore";
import { useGlobalUIStore } from "@/stores/useGlobalUIStore";
import { useAppStore } from "@/stores/useAppStore";
import { useStartConversation } from "@/lib/hooks/useStartConversation";
import { useAddDoctorToFavorites, useRemoveDoctorFromFavorites } from "@/lib/hooks/useFavoriteDoctor";
import { MCModalBase } from "@/shared/components/MCModalBase";
import { Spinner } from "@/shared/ui/spinner";

interface Props {
  doctor: any;
  setOpenSheet: (open: boolean) => void;
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

function DoctorProfileBanner({ 
  doctor,
  setOpenSheet,
  onToggleFavorite,
  isMyProfile,
}: Props) {
  const { t, i18n } = useTranslation("doctor");
  const navigate = useNavigate();
  const [languages, setLanguages] = useState<Idioma[]>([]);
  const [isFavorite, setIsFavorite] = useState<boolean>(Boolean(doctor?.isFavorite));

  const logout = useAppStore((state) => state.logout);
  const setToast = useGlobalUIStore((state) => state.setToast);
  const clearAllVerifyInfo = useVerifyInfoStore((state) => state.clearAll);
  const currentUser = useAppStore((state) => state.user);

  const { startConversation, isLoading: isStartingConversation } = useStartConversation();
  const { mutate: addToFavorites, isPending: isAddingFavorite } = useAddDoctorToFavorites();
  const { mutate: removeFromFavorites, isPending: isRemovingFavorite } = useRemoveDoctorFromFavorites();

  // El ID de usuario del doctor que se está viendo
  const doctorUserId: number | undefined = doctor?.id ?? doctor?.usuarioId;

  // Solo los pacientes pueden iniciar conversaciones con doctores
  const canMessage = !isMyProfile && currentUser?.rol === 'PATIENT' && !!doctorUserId;
  const isDoctorViewerOtherProfile =
    !isMyProfile &&
    (currentUser?.rol === "DOCTOR" || currentUser?.rol === "Doctor");
  const verificationStatusRaw =
    doctor?.doctor?.estadoVerificacion ?? doctor?.estadoVerificacion;
  const isDoctorVerified =
    typeof verificationStatusRaw === "string" &&
    ["aprobado", "aproved", "approved"].includes(
      verificationStatusRaw.toLowerCase().trim()
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
    const lang = AVAILABLE_LANGUAGES.find(l => l.label === nombre);
    return i18n.language === 'en' ? (lang?.labelEn || nombre) : nombre;
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
  
  const handleLogout = () => {
    logout();
    clearAllVerifyInfo(); // Limpiar datos de verificación
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

  const handleAddToFavorites = () => {
    const doctorIdNum = Number(doctor?.id ?? doctor?.usuarioId);
    if (!doctorIdNum) return;

    // If it's already favorite, call remove mutation
    if (isFavorite) {
      removeFromFavorites(doctorIdNum, {
        onSuccess: () => {
          setIsFavorite(false);
          onToggleFavorite?.();
          setToast({
            message: t('doctorCard.favoriteRemoved', { ns: 'common' }) || t('doctorCard.favoriteAdded', { ns: 'common' }),
            type: 'success',
            open: true,
          });
        },
        onError: (err: any) => {
          setToast({
            message: err?.message || t('doctorCard.favoriteRemoveError', { ns: 'common' }) || t('doctorCard.favoriteAddError', { ns: 'common' }),
            type: 'error',
            open: true,
          });
        },
      });
      return;
    }

    // Otherwise add to favorites
    addToFavorites(doctorIdNum, {
      onSuccess: () => {
        setIsFavorite(true);
        onToggleFavorite?.();
        setToast({
          message: t('doctorCard.favoriteAdded', { ns: 'common' }),
          type: 'success',
          open: true,
        });
      },
      onError: (err: any) => {
        setToast({
          message: err?.message || t('doctorCard.favoriteAddError', { ns: 'common' }),
          type: 'error',
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
    <div className="shadow-md rounded-4xl border-0 mx-auto">
      <div className="relative h-60 flex items-end rounded-t-4xl  ">
        {doctor?.banner || doctor?.usuario?.banner ? (
          <img
            src={doctor?.banner || doctor?.usuario?.banner}
            alt={t("profileForm.bannerImage")}
            className="absolute top-0 left-0 w-full h-full object-cover rounded-t-4xl "
            style={{ zIndex: 1 }}
          />
        ) : (
          <MCUserBanner
            className="absolute top-0 left-0 w-full h-full rounded-t-4xl"
            name={getUserFullName(doctor) || "IliaTopuria"}
          />
        )}
        <div
          className="absolute left-10 bottom-[-100px] w-full"
          style={{ zIndex: 2 }}
        >
          <div className="flex items-center w-[95%]">
            {getUserAvatar(doctor) ? (
              <UiAvatar className="w-40 h-40 rounded-full border-4 border-background">
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
                size={180}
                className="border-5 border-background rounded-full h-full"
              />
            )}

            <div className="mt-25 w-full flex justify-between items-center px-6">
              <div className="flex flex-col gap-1">
                <h3 className="text-primary font-semibold text-2xl flex items-center gap-2">
                  {getUserFullName(doctor) || "Ilia Topuria"}
                  {isDoctorVerified ? (
                    <BadgeCheck
                      className="w-6 h-6 text-background"
                      fill="#8bb1ca"
                    />
                  ) : null}
                </h3>
                <p className="text-primary">{getDoctorSpecialty(doctor?.doctor?.especialidades ?? doctor.especialidades)}</p>
                <div>
                  <span className="text-sm mt-1 text-muted-foreground font-medium flex items-center gap-2">
                    <span className="flex items-center gap-1">
                      <Star
                        fill="#F7B500"
                        size={18}
                        className="text-[#F7B500]"
                      />
                      {getDoctorRating(doctor?.doctor?.calificacionPromedio ?? doctor.calificacionPromedio) || t("profileForm.noRating", "Sin calificación")}
                    </span>
                    &#8226;{" "}
                    <span className="flex items-center gap-1">
                      <Stethoscope size={18} className="text-secondary" />
                      {doctor?.doctor?.anosExperiencia ?? doctor.anosExperiencia}{" "}
                      {t("profileForm.yearsExperience")}
                    </span>
                    {languages.length > 0 && (
                      <>
                        &#8226;{" "}
                        <span className="flex items-center gap-1">
                          <Languages size={18} className="text-secondary" />
                          {languages.map((lang) => getLanguageLabel(lang.nombre)).join(", ")}
                        </span>
                      </>
                    )}
                  </span>
                </div>
              </div>

              <div className="flex items-center gap-3">
                {isMyProfile ? (
                  <>
                    <MCButton
                      variant="secondary"
                      size="m"
                      className="font-medium rounded-full transition-colors transition-opacity transition-transform duration-200 focus:outline-none px-6 py-3 text-base md:px-8 md:py-6 md:text-lg bg-transparent border border-primary text-primary hover:bg-primary/10 hover:opacity-90 active:bg-primary/20 active:opacity-80 active:scale-95 active:shadow-inner"
                      onClick={() => setOpenSheet(true)}
                    >
                      {t("profileForm.editProfile")}
                    </MCButton>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button className="font-medium rounded-full transition-colors transition-opacity transition-transform duration-200 focus:outline-none px-6 py-3 text-base md:px-8 md:py-6 md:text-lg bg-transparent border border-primary text-primary hover:bg-primary/10 hover:opacity-90 active:bg-primary/20 active:opacity-80 active:scale-95 active:shadow-inner">
                          <Ellipsis />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem onClick={() => navigate(ROUTES.SETTINGS.ROOT)}>
                          <Settings className="w-4 h-4 mr-2" />
                          {t("profileForm.menu.settings")}
                        </DropdownMenuItem>
                        {/* <DropdownMenuItem onClick={() => navigate(ROUTES.PRIVACY.ROOT)}>
                          <Shield className="w-4 h-4 mr-2" />
                          {t("profileForm.menu.privacy")}
                        </DropdownMenuItem> */}
                        <DropdownMenuItem onClick={handleCopyProfile}>
                          <Copy className="w-4 h-4 mr-2" />
                          {t("profileForm.menu.copyProfile")}
                        </DropdownMenuItem>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem onClick={handleLogout}>
                          <LogOut className="w-4 h-4 mr-2 text-red-500" />
                          <span className="text-red-500">
                            {t("profileForm.menu.logout")}
                          </span>
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </>
                ) : (
                  <>
                    {canMessage && (
                      <MCButton
                        variant="primary"
                        size="m"
                        className="font-medium rounded-full transition-colors transition-opacity transition-transform duration-200 focus:outline-none px-6 py-3 text-base md:px-8 md:py-6 md:text-lg bg-transparent border border-primary text-primary hover:bg-primary/10 hover:opacity-90 active:bg-primary/20 active:opacity-80 active:scale-95 active:shadow-inner"
                        onClick={() => startConversation(doctorUserId!)}
                        disabled={isStartingConversation}
                      >
                        <MessageCircle className="w-5 h-5 mr-2" />
                        {isStartingConversation
                          ? t("profileForm.openingChat", "Abriendo chat...")
                          : t("profileForm.sendMessage")}
                      </MCButton>
                    )}

                    {!isDoctorViewerOtherProfile ? (
                      <>
                        <MCModalBase
                          id={`fav-${doctor?.id ?? doctor?.usuarioId}`}
                          title={favoriteConfirmTitle}
                          trigger={
                            <MCButton
                              variant={isFavorite ? "secondary" : "outline"}
                              size="m"
                              className="font-medium rounded-full transition-colors transition-opacity transition-transform duration-200 focus:outline-none px-6 py-3 text-base md:px-8 md:py-6 md:text-lg bg-transparent border border-primary text-primary hover:bg-primary/10 hover:opacity-90 active:bg-primary/20 active:opacity-80 active:scale-95 active:shadow-inner"
                            >
                              { (isAddingFavorite || isRemovingFavorite) ? (
                                <Spinner className="text-red-500" />
                              ) : isFavorite ? (
                                <HeartOff className=" text-red-500" />
                              ) : (
                                <Heart fill="red" className="text-red-500" />
                              )}
                            </MCButton>
                          }
                          size="sm"
                          variant="confirm"
                          confirmText={t('confirm', { ns: 'common' })}
                          secondaryText={t('back', { ns: 'patient' })}
                          onConfirm={() => handleAddToFavorites()}
                          disabledConfirm={isAddingFavorite || isRemovingFavorite}
                        >
                          <div className="py-4 px-2">
                            <p className="text-sm text-muted-foreground">
                              {favoriteConfirmDescription}
                            </p>
                          </div>
                        </MCModalBase>
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button className="font-medium rounded-full transition-colors transition-opacity transition-transform duration-200 focus:outline-none px-6 py-3 text-base md:px-8 md:py-6 md:text-lg bg-transparent border border-primary text-primary hover:bg-primary/10 hover:opacity-90 active:bg-primary/20 active:opacity-80 active:scale-95 active:shadow-inner">
                              <Ellipsis />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem onClick={handleCopyProfile}>
                              <Copy className="w-4 h-4 mr-2" />
                              {t("profileForm.menu.copyProfile")}
                            </DropdownMenuItem>
                            {/* <DropdownMenuItem>
                              <VolumeX className="w-4 h-4 mr-2" />
                              {t("profileForm.menu.mute")}
                            </DropdownMenuItem> */}
                            {/* <DropdownMenuItem>
                              <Ban className="w-4 h-4 mr-2 text-red-500" />
                              <span className="text-red-500">{t("profileForm.menu.block")}</span>
                            </DropdownMenuItem> */}
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </>
                    ) : null}
                  </>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
      <div className="bg-background h-35 rounded-b-4xl"></div>
    </div>
  );
}

export default DoctorProfileBanner;
