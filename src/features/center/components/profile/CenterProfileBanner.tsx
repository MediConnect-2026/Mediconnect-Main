import MCButton from "@/shared/components/forms/MCButton";
import {
  Settings,
  Copy,
  LogOut,
  Ellipsis,
  BadgeCheck,
  Star,
  Phone,
  Globe,
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

function CenterProfileBanner({
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
    <div className="shadow-md rounded-4xl border-0 mx-auto">
      <div className="relative h-60 flex items-end rounded-t-4xl bg-background">
        {center?.banner ? (
          <img
            src={center.banner}
            alt={t("profileForm.bannerImage")}
            className="absolute top-0 left-0 w-full h-full object-cover rounded-t-4xl"
            style={{ zIndex: 1 }}
          />
        ) : (
          <MCUserBanner
            className="absolute top-0 left-0 w-full h-full rounded-t-4xl"
            name={center?.name || "Centro Médico"}
          />
        )}
        <div
          className="absolute left-10 -bottom-20 w-full"
          style={{ zIndex: 2 }}
        >
          <div className="flex items-center w-[95%]">
            {center?.avatar ? (
              <UiAvatar className="w-40 h-40 rounded-full border-4 border-background">
                <AvatarImage
                  src={center.avatar}
                  alt={t("profileForm.profilePhoto")}
                />
                <AvatarFallback>
                  {center.name
                    .split(" ")
                    .map((n: any[]) => n[0])
                    .join("")
                    .toUpperCase()}
                </AvatarFallback>
              </UiAvatar>
            ) : (
              <MCUserAvatar
                name={center?.name || "Centro Médico"}
                size={180}
                className="border-5 border-background rounded-full h-full"
              />
            )}

            <div className="mt-25 w-full flex justify-between items-center px-6">
              <div className="flex flex-col gap-1">
                {/* Name */}
                <h3 className="text-primary font-semibold text-2xl flex items-center gap-2">
                  {center?.name || "-"}
                  <BadgeCheck
                    className="w-6 h-6 text-background"
                    fill="#8bb1ca"
                  />
                </h3>

                {/* Rating, Phone, Website in a row */}
                <div className="flex items-center gap-4 flex-wrap text-sm text-primary">
                  {/* Rating */}
                  <div className="flex items-center gap-1.5">
                    <Star className="w-4 h-4 fill-amber-400 text-amber-400" />
                    <span className="font-medium">{center?.rating}</span>
                    <span className="text-primary/70">
                      ({center?.reviewCount} {t("profileBanner.reviews")})
                    </span>
                  </div>

                  {/* Phone */}
                  <div className="flex items-center gap-1.5">
                    <Phone className="w-4 h-4 text-secondary" />
                    <span>{center?.phone || "-"}</span>
                  </div>

                  {/* Website */}
                  <div className="flex items-center gap-1.5">
                    <Globe className="w-4 h-4 text-secondary" />
                    <a
                      href={center?.website || "-"}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-secondary hover:underline"
                    >
                      {center?.website || "-"}
                    </a>
                  </div>
                </div>
              </div>

              {/* Action buttons */}
              <div className="flex items-center gap-3">
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
                            "font-medium rounded-full transition-colors transition-opacity transition-transform duration-200 focus:outline-none px-6 py-3 text-base md:px-8 md:py-6 md:text-lg",
                            isConnected === "not_connected" &&
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
                        onConfirm={
                          isConnected === "connected"
                            ? handleConfirmDisconnect
                            : undefined
                        }
                        isSubmitting={isConnecting}
                      >
                        <MCButton
                          variant={connectVariant}
                          size="m"
                          className={cn(
                            "font-medium rounded-full transition-colors transition-opacity transition-transform duration-200 focus:outline-none px-6 py-3 text-base md:px-8 md:py-6 md:text-lg",
                            isConnected === "connected" &&
                              "border-secondary text-secondary hover:bg-secondary/10 hover:border-secondary/80 active:bg-secondary/20 w-full",
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
                    className="font-medium rounded-full transition-colors transition-opacity transition-transform duration-200 focus:outline-none px-6 py-3 text-base md:px-8 md:py-6 md:text-lg bg-transparent border border-primary text-primary hover:bg-primary/10 hover:opacity-90 active:bg-primary/20 active:opacity-80 active:scale-95 active:shadow-inner"
                    onClick={() => setOpenSheet(true)}
                  >
                    {t("profileBanner.editProfile")}
                  </MCButton>
                ) : null}

                {/* Dropdown menu (only for CENTER role) */}
                {userRole === "CENTER" && (
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button className="font-medium rounded-full transition-colors transition-opacity transition-transform duration-200 focus:outline-none px-6 py-3 text-base md:px-8 md:py-6 md:text-lg bg-transparent border border-primary text-primary hover:bg-primary/10 hover:opacity-90 active:bg-primary/20 active:opacity-80 active:scale-95 active:shadow-inner">
                        <Ellipsis />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      {/* <DropdownMenuItem>
                        <History className="w-4 h-4 mr-2" />
                        {t("profileBanner.menu.history")}
                      </DropdownMenuItem> */}
                      <DropdownMenuItem
                        onClick={() => navigate(ROUTES.CENTER.SETTINGS)}
                      >
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
                      <DropdownMenuItem onClick={handleLogout}>
                        <LogOut className="w-4 h-4 mr-2 text-red-500" />
                        <span className="text-red-500">
                          {t("profileBanner.menu.logout")}
                        </span>
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
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

export default CenterProfileBanner;
