import {
  Ellipsis,
  Settings,
  Copy,
  LogOut,
  BadgeCheck,
  Star,
  Phone,
  Globe,
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
import { useAppStore } from "@/stores/useAppStore";
import { cn } from "@/lib/utils";
import ToogleConfirmConnection from "@/features/request/components/ToogleConfirmConnection";
import { useNavigate } from "react-router-dom";
import { ROUTES } from "@/router/routes";
import useLogout from "@/lib/hooks/useLogout";
import { useGlobalUIStore } from "@/stores/useGlobalUIStore";

interface Props {
  center: any;
  setOpenSheet?: (open: boolean) => void;
  isConnected?: "connected" | "not_connected" | "pending";
  onConnect?: (id: string, message?: string) => void;
  onDisconnect?: (id: string) => void;
  isConnecting?: boolean;
}

function CenterProfileBannerMobile({
  center,
  setOpenSheet,
  isConnected = "not_connected",
  onConnect,
  onDisconnect,
  isConnecting = false,
}: Props) {
  const { t } = useTranslation("center");
  const user = useAppStore((state) => state.user);
  const userRole = user?.rol;
  const logoutUser = useLogout();
  const setToast = useGlobalUIStore((state) => state.setToast);
  const navigate = useNavigate();

  const doctorVerificationStatus = user?.doctor?.estadoVerificacion;
  const isDoctorVerified =
    typeof doctorVerificationStatus === "string" &&
    ["verificado", "aprobado", "approved", "aproved"].includes(
      doctorVerificationStatus.toLowerCase().trim(),
    );
  const isDoctorRole = userRole === "DOCTOR" || userRole === "Doctor";
  const disableConnectForUnverifiedDoctor = isDoctorRole && !isDoctorVerified;

  const handleConfirmConnect = (message?: string) => {
    onConnect?.(String(center?.id ?? ""), message);
  };

  const handleConfirmDisconnect = () => {
    onDisconnect?.(String(center?.id ?? ""));
  };

  const handleLogout = () => {
    logoutUser();
  };

  const handleCopyProfile = async () => {
    const profileUrl = `${window.location.origin}${ROUTES.CENTER.CENTER_PROFILE_PUBLIC.replace(":centerId", String(center?.id ?? ""))}`;
    try {
      await navigator.clipboard.writeText(profileUrl);
      setToast?.({
        message: t("profileBanner.menu.profileCopied"),
        type: "success",
        open: true,
      });
    } catch {
      setToast?.({
        message: t("profileBanner.menu.copyProfileError"),
        type: "error",
        open: true,
      });
    }
  };

  let connectBtnText = t("profileBanner.connect");
  let connectBtnDisabled = false;
  let connectVariant: "primary" | "outline" = "outline";

  if (isConnected === "connected") {
    connectBtnText = t("profileBanner.connected");
    connectVariant = "outline";
  } else if (isConnected === "pending") {
    connectBtnText = t("profileBanner.pending");
    connectBtnDisabled = true;
  }

  if (disableConnectForUnverifiedDoctor) {
    connectBtnDisabled = true;
  }

  return (
    <div className="w-full rounded-3xl shadow-md bg-background overflow-hidden">
      {/* Banner */}
      <div className="relative h-36">
        {center?.banner ? (
          <img
            src={center.banner}
            alt={t("profileForm.bannerImage")}
            className="w-full h-full object-cover"
          />
        ) : (
          <MCUserBanner
            name={center?.name || "Centro Médico"}
            className="w-full h-full"
          />
        )}

        {/* Avatar */}
        <div className="absolute -bottom-14 left-4">
          {center?.avatar ? (
            <UiAvatar className="w-28 h-28 border-4 border-background">
              <AvatarImage src={center.avatar} />
              <AvatarFallback>
                {center?.name
                  ?.split(" ")
                  .map((n: string) => n[0])
                  .join("")
                  .toUpperCase()}
              </AvatarFallback>
            </UiAvatar>
          ) : (
            <MCUserAvatar
              name={center?.name || "Centro Médico"}
              size={112}
              className="border-4 border-background rounded-full h-full w-full"
            />
          )}
        </div>
      </div>

      {/* Info */}
      <div className="pt-16 px-4 pb-4 flex flex-col gap-3">
        <div className="flex justify-between items-start">
          <div>
            {/* Name */}
            <div className="flex items-center gap-1">
              <h3 className="text-lg font-semibold text-foreground">
                {center?.name || "-"}
              </h3>
              <BadgeCheck className="w-4 h-4 text-background" fill="#8bb1ca" />
            </div>

            {/* Rating */}
            <div className="flex items-center gap-1.5 mt-1">
              <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
              <span className="text-sm font-medium text-foreground">
                {center?.rating}
              </span>
              <span className="text-sm text-muted-foreground">
                ({center?.reviewCount} {t("profileBanner.reviews")})
              </span>
            </div>

            {/* Phone */}
            {(center?.phone || true) && (
              <div className="flex items-center gap-1.5 mt-1.5 text-muted-foreground">
                <Phone className="w-3.5 h-3.5 text-secondary" />
                <span className="text-sm">
                  {center?.phone || "-"}
                </span>
              </div>
            )}

            {/* Website */}
            {(center?.website || true) && (
              <div className="flex items-center gap-1.5 mt-1 text-muted-foreground">
                <Globe className="w-3.5 h-3.5 text-secondary" />
                <a
                  href={center?.website || "-"}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-sm text-secondary hover:underline truncate max-w-50"
                >
                  {center?.website || "-"}
                </a>
              </div>
            )}
          </div>

          {/* Menu (only for CENTER role / own profile) */}
          {userRole === "CENTER" && (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button size="icon" variant="outline" className="rounded-full">
                  <Ellipsis />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                {/* <DropdownMenuItem>
                  <History className="w-4 h-4 mr-2" />
                  {t("profileBanner.menu.history")}
                </DropdownMenuItem> */}
                <DropdownMenuItem onClick={() => navigate(ROUTES.CENTER.SETTINGS)}>
                  <Settings className="w-4 h-4 mr-2" />
                  {t("profileBanner.menu.settings")}
                </DropdownMenuItem>
                {/* <DropdownMenuItem>
                  <Shield className="w-4 h-4 mr-2" />
                  {t("profileBanner.menu.privacy")}
                </DropdownMenuItem> */}
                <DropdownMenuItem onClick={handleCopyProfile}>
                  <Copy className="w-4 h-4 mr-2" />
                  {t("profileBanner.menu.copyProfile")}
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem className="text-red-500" onClick={handleLogout}>
                  <LogOut className="w-4 h-4 mr-2" />
                  {t("profileBanner.menu.logout")}
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          )}
        </div>

        {/* Action Buttons */}
        <div className="flex gap-2">
          {isDoctorRole ? (
            <>
              {isConnected === "not_connected" ? (
                <ToogleConfirmConnection
                  status={isConnected}
                  id={parseInt(center?.id || "0", 10)}
                  onConfirm={handleConfirmConnect}
                  isSubmitting={isConnecting}
                  enableMessageInput
                >
                  <MCButton
                    variant={connectVariant}
                    size="m"
                    className={cn(
                      "rounded-full flex-1",
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
                  id={parseInt(center?.id || "0", 10)}
                  onConfirm={isConnected === "connected" ? handleConfirmDisconnect : undefined}
                  isSubmitting={isConnecting}
                >
                  <MCButton
                    variant={connectVariant}
                    size="m"
                    className={cn(
                      "rounded-full flex-1",
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
            </>
          ) : userRole === "CENTER" && setOpenSheet ? (
            <MCButton
              variant="secondary"
              size="m"
              className="rounded-full w-full"
              onClick={() => setOpenSheet(true)}
            >
              {t("profileBanner.editProfile")}
            </MCButton>
          ) : null}
        </div>
      </div>
    </div>
  );
}

export default CenterProfileBannerMobile;
