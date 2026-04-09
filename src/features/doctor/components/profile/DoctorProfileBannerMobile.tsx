import { useEffect, useState } from "react";
import MCButton from "@/shared/components/forms/MCButton";
import {
  Settings,
  Shield,
  Copy,
  LogOut,
  Ellipsis,
  BadgeCheck,
  Star,
  Share2,
  VolumeX,
  Ban,
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
import { getDoctorRating, getUserFullName } from "@/services/auth/auth.types";

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
  const [languages, setLanguages] = useState<Idioma[]>([]);

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

  const getLanguageLabel = (nombre: string) => {
    const lang = AVAILABLE_LANGUAGES.find(l => l.label === nombre);
    return i18n.language === 'en' ? (lang?.labelEn || nombre) : nombre;
  };

  return (
    <div className="w-full rounded-3xl shadow-md bg-background overflow-hidden">
      {/* Banner */}
      <div className="relative h-36">
        {doctor?.banner ? (
          <img
            src={doctor.banner}
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
          {doctor?.avatar ? (
            <UiAvatar className="w-28 h-28 border-4 border-background">
              <AvatarImage
                src={doctor.avatar}
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
          <div className="flex-1">
            <div className="flex items-center gap-1 mb-1">
              <h3 className="text-lg font-semibold text-foreground">
                {getUserFullName(doctor) || "Ilia Topuria"}
              </h3>
              <BadgeCheck className="w-4 h-4 text-background" fill="#8bb1ca" />
            </div>

            <p className="text-sm text-foreground font-medium mb-2">
              {doctor.specialty}
            </p>

            <div className="flex flex-col gap-1 text-xs text-muted-foreground">
              <div className="flex items-center gap-1">
                <Star fill="#F7B500" size={14} className="text-[#F7B500]" />
                <span>{getDoctorRating(doctor.calificacionPromedio)}</span>
              </div>
              <div className="flex items-center gap-1">
                <Stethoscope size={14} className="text-secondary" />
                <span>
                  {doctor.yearsOfExperience} {t("profileForm.yearsExperience")}
                </span>
              </div>
              {languages.length > 0 && (
                <div className="flex items-center gap-1">
                  <Languages size={14} className="text-secondary" />
                  <span>
                    {languages.map((lang) => getLanguageLabel(lang.nombre)).join(", ")}
                  </span>
                </div>
              )}
            </div>
          </div>

          {/* Menu */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button size="icon" variant="outline" className="rounded-full">
                <Ellipsis />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              {isMyProfile ? (
                <>
                  <DropdownMenuItem>
                    <Settings className="w-4 h-4 mr-2" />
                    {t("profileForm.menu.settings")}
                  </DropdownMenuItem>
                  <DropdownMenuItem>
                    <Shield className="w-4 h-4 mr-2" />
                    {t("profileForm.menu.privacy")}
                  </DropdownMenuItem>
                  <DropdownMenuItem>
                    <Copy className="w-4 h-4 mr-2" />
                    {t("profileForm.menu.copyProfile")}
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem className="text-red-500">
                    <LogOut className="w-4 h-4 mr-2" />
                    {t("profileForm.menu.logout")}
                  </DropdownMenuItem>
                </>
              ) : (
                <>
                  <DropdownMenuItem>
                    <Share2 className="w-4 h-4 mr-2" />
                    {t("profileForm.menu.shareProfile")}
                  </DropdownMenuItem>
                  <DropdownMenuItem>
                    <VolumeX className="w-4 h-4 mr-2" />
                    {t("profileForm.menu.mute")}
                  </DropdownMenuItem>
                  <DropdownMenuItem className="text-red-500">
                    <Ban className="w-4 h-4 mr-2" />
                    {t("profileForm.menu.block")}
                  </DropdownMenuItem>
                </>
              )}
            </DropdownMenuContent>
          </DropdownMenu>
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
              <MCButton
                variant="primary"
                size="m"
                className="rounded-full flex-1"
                onClick={onSendMessage}
              >
                <MessageCircle className="w-4 h-4 mr-2" />
                {t("profileForm.sendMessage")}
              </MCButton>
              <MCButton
                variant={doctor.isFavorite ? "secondary" : "outline"}
                size="m"
                className="rounded-full px-3"
                onClick={onToggleFavorite}
              >
                {doctor.isFavorite ? (
                  <HeartOff className="w-4 h-4 text-red-500" />
                ) : (
                  <Heart fill="red" className="w-4 h-4 text-red-500" />
                )}
              </MCButton>
            </>
          )}
        </div>
      </div>
    </div>
  );
}

export default DoctorProfileBannerMobile;
