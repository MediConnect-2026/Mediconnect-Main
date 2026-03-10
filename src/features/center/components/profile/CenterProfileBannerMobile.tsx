import {
  Ellipsis,
  History,
  Settings,
  Shield,
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

interface Props {
  center: any;
  setOpenSheet?: (open: boolean) => void;
  isConnected?: "connected" | "not_connected" | "pending";
  onConnect?: (id: string) => void;
}

function CenterProfileBannerMobile({
  center,
  setOpenSheet,
  isConnected = "not_connected",
  onConnect,
}: Props) {
  const { t } = useTranslation("center");
  const userRole = useAppStore((state) => state.user?.role);

  const handleConfirmConnect = () => {
    onConnect?.(center?.id);
  };

  let connectBtnText = t("profileBanner.connect");
  let connectBtnDisabled = false;
  let connectVariant: "primary" | "outline" = "outline";

  if (isConnected === "connected") {
    connectBtnText = t("profileBanner.connected");
    connectVariant = "primary";
  } else if (isConnected === "pending") {
    connectBtnText = t("profileBanner.pending");
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
                {center?.name || "Hospital Dario Contreras"}
              </h3>
              <BadgeCheck className="w-4 h-4 text-background" fill="#8bb1ca" />
            </div>

            {/* Rating */}
            <div className="flex items-center gap-1.5 mt-1">
              <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
              <span className="text-sm font-medium text-foreground">
                {center?.rating || "4.8"}
              </span>
              <span className="text-sm text-muted-foreground">
                ({center?.reviewCount || 12} {t("profileBanner.reviews")})
              </span>
            </div>

            {/* Phone */}
            {(center?.phone || true) && (
              <div className="flex items-center gap-1.5 mt-1.5 text-muted-foreground">
                <Phone className="w-3.5 h-3.5 text-secondary" />
                <span className="text-sm">
                  {center?.phone || "809-093-2342"}
                </span>
              </div>
            )}

            {/* Website */}
            {(center?.website || true) && (
              <div className="flex items-center gap-1.5 mt-1 text-muted-foreground">
                <Globe className="w-3.5 h-3.5 text-secondary" />
                <a
                  href={center?.website || "https://www.dariocontreras.gob.do"}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-sm text-secondary hover:underline truncate max-w-50"
                >
                  {center?.website || "www.dariocontreras.gob.do"}
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
                <DropdownMenuItem>
                  <History className="w-4 h-4 mr-2" />
                  {t("profileBanner.menu.history")}
                </DropdownMenuItem>
                <DropdownMenuItem>
                  <Settings className="w-4 h-4 mr-2" />
                  {t("profileBanner.menu.settings")}
                </DropdownMenuItem>
                <DropdownMenuItem>
                  <Shield className="w-4 h-4 mr-2" />
                  {t("profileBanner.menu.privacy")}
                </DropdownMenuItem>
                <DropdownMenuItem>
                  <Copy className="w-4 h-4 mr-2" />
                  {t("profileBanner.menu.copyProfile")}
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem className="text-red-500">
                  <LogOut className="w-4 h-4 mr-2" />
                  {t("profileBanner.menu.logout")}
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          )}
        </div>

        {/* Action Buttons */}
        <div className="flex gap-2">
          {userRole === "DOCTOR" ? (
            <>
              <ToogleConfirmConnection
                status={isConnected}
                id={parseInt(center?.id || "0")}
                onConfirm={handleConfirmConnect}
              >
                <MCButton
                  variant={connectVariant}
                  size="m"
                  className={cn(
                    "rounded-full flex-1",
                    isConnected === "connected" &&
                      "bg-secondary hover:bg-secondary/90 text-white border-none active:bg-secondary/80",
                    isConnected === "not_connected" &&
                      "border-secondary text-secondary hover:bg-secondary/10 hover:border-secondary/80 active:bg-secondary/20",
                    isConnected === "pending" &&
                      "border-gray-300 text-gray-500 bg-gray-100 cursor-not-allowed",
                  )}
                  disabled={connectBtnDisabled}
                >
                  {connectBtnText}
                </MCButton>
              </ToogleConfirmConnection>
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
