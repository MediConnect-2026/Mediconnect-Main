import {
  Ellipsis,
  History,
  Settings,
  Shield,
  Copy,
  LogOut,
  BadgeCheck,
} from "lucide-react";
import { Button } from "@/shared/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/shared/ui/dropdown-menu";
import {
  Avatar as UiAvatar,
  AvatarFallback,
  AvatarImage,
} from "@/shared/ui/avatar";
import { MCUserAvatar } from "@/shared/navigation/userMenu/MCUserAvatar";
import { MCUserBanner } from "@/shared/navigation/userMenu/MCUserBanner";
import MCButton from "@/shared/components/forms/MCButton";
import { useTranslation } from "react-i18next";
import { getUserAvatar, getUserCreationDate, getUserFullName } from "@/services/auth/auth.types";
import { useNavigate } from "react-router-dom";
import { ROUTES } from "@/router/routes";
import { useAppStore } from "@/stores/useAppStore";
import { useGlobalUIStore } from "@/stores/useGlobalUIStore";
import { useVerifyInfoStore } from "@/stores/useVerifyInfoStore";

interface Props {
  user: any;
  setOpenSheet: (tab?: "general" | "history" | "insurance") => void;
}

function PatientProfileBannerMobile({ user, setOpenSheet }: Props) {
  const { t, i18n } = useTranslation("patient");
  const navigate = useNavigate();
  const logout = useAppStore((state) => state.logout);
  const setToast = useGlobalUIStore((state) => state.setToast);
  const clearAllVerifyInfo = useVerifyInfoStore((state) => state.clearAll);

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
    const profileUrl = `${window.location.origin}${ROUTES.PATIENT.PATIENT_PROFILE_PUBLIC.replace(":patientId", user?.id || "")}`;
    navigator.clipboard.writeText(profileUrl);
    setToast({
      message: t("profileForm.menu.profileCopied", "Enlace de perfil copiado al portapapeles"),
      type: "success",
      open: true,
    });
  };

  return (
    <div className="w-full rounded-3xl shadow-md bg-background overflow-hidden">
      {/* Banner */}
      <div className="relative h-36">
        {user?.banner ? (
          <img
            src={user.banner}
            alt={t("profileForm.bannerImage")}
            className="w-full h-full object-cover"
          />
        ) : (
          <MCUserBanner
            name={getUserFullName(user) || "IliaTopuria"}
            className="w-full h-full"
          />
        )}

        {/* Avatar */}
        <div className="absolute -bottom-14 left-4">
          {getUserAvatar(user) ? (
            <UiAvatar className="w-28 h-28 border-4 border-background">
              <AvatarImage src={getUserAvatar(user)} />
              <AvatarFallback>
                {getUserFullName(user)
                  .split(" ")
                  .map((n: string) => n[0])
                  .join("")
                  .toUpperCase()}
              </AvatarFallback>
            </UiAvatar>
          ) : (
            <MCUserAvatar
              name={getUserFullName(user) || "IliaTopuria"}
              size={112}
              className="border-4 border-background rounded-full h-full w-full"
            />
          )}
        </div>
      </div>

      {/* Info */}
      <div className="pt-16 px-4 pb-4 flex flex-col gap-4">
        <div className="flex justify-between items-start">
          <div>
            <div className="flex items-center gap-1">
              <h3 className="text-lg font-semibold text-foreground">
                {getUserFullName(user) || "Ilia Topuria"}
              </h3>
              <BadgeCheck className="w-4 h-4 text-background" fill="#8bb1ca" />
            </div>

            <p className="text-sm text-muted-foreground">
              <span className="font-medium">
                {t("profileForm.patientSince")}
              </span>{" "}
              {getUserCreationDate(user.paciente, i18n.language)}
            </p>
          </div>

          {/* Menu */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button size="icon" variant="outline" className="rounded-full">
                <Ellipsis />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={() => setOpenSheet("history")}>
                <History className="w-4 h-4 mr-2" />
                {t("profileForm.menu.history")}
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => navigate(ROUTES.SETTINGS.ROOT)}>
                <Settings className="w-4 h-4 mr-2" />
                {t("profileForm.menu.settings")}
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => navigate(ROUTES.PRIVACY.ROOT)}>
                <Shield className="w-4 h-4 mr-2" />
                {t("profileForm.menu.privacy")}
              </DropdownMenuItem>
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
        </div>

        {/* Edit Button */}
        <MCButton
          variant="secondary"
          size="m"
          className="rounded-full w-full"
          onClick={() => setOpenSheet()}
        >
          {t("profileForm.editProfile")}
        </MCButton>
      </div>
    </div>
  );
}

export default PatientProfileBannerMobile;
