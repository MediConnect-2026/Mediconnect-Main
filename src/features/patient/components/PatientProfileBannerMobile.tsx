import React from "react";
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

interface Props {
  user: any;
  setOpenSheet: (open: boolean) => void;
}

function PatientProfileBannerMobile({ user, setOpenSheet }: Props) {
  const { t } = useTranslation("patient");

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
            name={user?.name || "IliaTopuria"}
            className="w-full h-full"
          />
        )}

        {/* Avatar */}
        <div className="absolute -bottom-14 left-4">
          {user?.avatar ? (
            <UiAvatar className="w-28 h-28 border-4 border-background">
              <AvatarImage src={user.avatar} />
              <AvatarFallback>
                {user?.name
                  ?.split(" ")
                  .map((n: string) => n[0])
                  .join("")
                  .toUpperCase()}
              </AvatarFallback>
            </UiAvatar>
          ) : (
            <MCUserAvatar
              name={user?.name || "IliaTopuria"}
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
                {user?.name || "Ilia Topuria"}
              </h3>
              <BadgeCheck className="w-4 h-4 text-primary" />
            </div>

            <p className="text-sm text-muted-foreground">
              <span className="font-medium">
                {t("profileForm.patientSince")}
              </span>{" "}
              15 de Enero, 2025
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
              <DropdownMenuItem>
                <History className="w-4 h-4 mr-2" />
                {t("profileForm.menu.history")}
              </DropdownMenuItem>
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
            </DropdownMenuContent>
          </DropdownMenu>
        </div>

        {/* Edit Button */}
        <MCButton
          variant="secondary"
          size="m"
          className="rounded-full w-full"
          onClick={() => setOpenSheet(true)}
        >
          {t("profileForm.editProfile")}
        </MCButton>
      </div>
    </div>
  );
}

export default PatientProfileBannerMobile;
