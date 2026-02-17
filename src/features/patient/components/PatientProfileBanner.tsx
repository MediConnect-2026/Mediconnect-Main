import MCButton from "@/shared/components/forms/MCButton";
import {
  History,
  Settings,
  Shield,
  Copy,
  LogOut,
  Ellipsis,
  BadgeCheck,
} from "lucide-react";
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

function PatientProfileBanner({ user, setOpenSheet }: Props) {
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
    <div className="shadow-md rounded-4xl border-0 mx-auto">
      <div className="relative h-60 flex items-end rounded-t-4xl bg-background ">
        {user?.banner ? (
          <img
            src={user.banner}
            alt={t("profileForm.bannerImage")}
            className="absolute top-0 left-0 w-full h-full object-cover rounded-t-4xl"
            style={{ zIndex: 1 }}
          />
        ) : (
          <MCUserBanner
            className="absolute top-0 left-0 w-full h-full rounded-t-4xl"
            name={getUserFullName(user) || "IliaTopuria"}
          />
        )}
        <div
          className="absolute left-10 bottom-[-80px] w-full"
          style={{ zIndex: 2 }}
        >
          <div className="flex items-center w-[95%]">
            {getUserAvatar(user) ? (
              <UiAvatar className="w-40 h-40 rounded-full border-4 border-background">
                <AvatarImage
                  src={getUserAvatar(user)}
                  alt={t("profileForm.profilePhoto")}
                />
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
                size={180}
                className="border-5 border-background rounded-full h-full"
              />
            )}

            <div className="mt-25 w-full flex justify-between items-center px-6">
              <div className="flex flex-col">
                <h3 className="text-primary font-semibold text-2xl flex items-center gap-2">
                  {getUserFullName(user) || "Ilia Topuria"}
                  <BadgeCheck
                    className="w-6 h-6 text-background"
                    fill="#8bb1ca"
                  />
                </h3>
                <p className="text-primary">
                  <span className="font-medium">
                    {t("profileForm.patientSince")}
                  </span>{" "}
                  {getUserCreationDate(user.paciente, i18n.language)}
                </p>
              </div>

              <div className="flex items-center gap-3">
                <MCButton
                  variant="secondary"
                  size="m"
                  className="font-medium rounded-full transition-colors transition-opacity transition-transform duration-200 focus:outline-none px-6 py-3 text-base md:px-8 md:py-6 md:text-lg bg-transparent border border-primary text-primary hover:bg-primary/10 hover:opacity-90 active:bg-primary/20 active:opacity-80 active:scale-95 active:shadow-inner"
                  onClick={() => setOpenSheet()}
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
            </div>
          </div>
        </div>
      </div>
      <div className="bg-background h-35 rounded-b-4xl"></div>
    </div>
  );
}

export default PatientProfileBanner;
