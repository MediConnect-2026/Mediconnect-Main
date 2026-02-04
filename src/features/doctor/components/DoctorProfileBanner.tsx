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
  Edit,
  Languages,
  Stethoscope,
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

interface Props {
  doctor: {
    name: string;
    avatar?: string;
    banner?: string;
    specialty: string;
    rating: number;
    yearsOfExperience: number;
    languages: string[];
    isFavorite?: boolean;
  };
  setOpenSheet: (open: boolean) => void;
  onSendMessage?: () => void;
  onToggleFavorite?: () => void;
  isMyProfile?: boolean;
}

function DoctorProfileBanner({
  doctor,
  setOpenSheet,
  onSendMessage,
  onToggleFavorite,
  isMyProfile,
}: Props) {
  const { t } = useTranslation("doctor");

  return (
    <div className="w-[90%] shadow-md rounded-4xl border-0 mx-auto">
      <div className="relative h-60 flex items-end rounded-t-4xl  ">
        {doctor?.banner ? (
          <img
            src={doctor.banner}
            alt={t("profileForm.bannerImage")}
            className="absolute top-0 left-0 w-full h-full object-cover rounded-t-4xl "
            style={{ zIndex: 1 }}
          />
        ) : (
          <MCUserBanner
            className="absolute top-0 left-0 w-full h-full rounded-t-4xl"
            name={doctor?.name || "IliaTopuria"}
          />
        )}
        <div
          className="absolute left-10 bottom-[-100px] w-full"
          style={{ zIndex: 2 }}
        >
          <div className="flex items-center w-[95%]">
            {doctor?.avatar ? (
              <UiAvatar className="w-40 h-40 rounded-full border-4 border-background">
                <AvatarImage
                  src={doctor.avatar}
                  alt={t("profileForm.profilePhoto")}
                />
                <AvatarFallback>
                  {doctor.name
                    .split(" ")
                    .map((n: string) => n[0])
                    .join("")
                    .toUpperCase()}
                </AvatarFallback>
              </UiAvatar>
            ) : (
              <MCUserAvatar
                name={doctor?.name || "IliaTopuria"}
                size={180}
                className="border-5 border-background rounded-full h-full"
              />
            )}

            <div className="mt-25 w-full flex justify-between items-center px-6">
              <div className="flex flex-col gap-1">
                <h3 className="text-primary font-semibold text-2xl flex items-center gap-2">
                  {doctor?.name || "Ilia Topuria"}
                  <BadgeCheck
                    className="w-6 h-6 text-background"
                    fill="#8bb1ca"
                  />
                </h3>
                <p className="text-primary">{doctor.specialty}</p>
                <div>
                  <span className="text-sm mt-1 text-muted-foreground font-medium flex items-center gap-2">
                    <span className="flex items-center gap-1">
                      <Star
                        fill="#F7B500"
                        size={18}
                        className="text-[#F7B500]"
                      />
                      {doctor.rating.toFixed(1)}
                    </span>
                    &#8226;{" "}
                    <span className="flex items-center gap-1">
                      <Stethoscope size={18} className="text-secondary" />
                      {doctor.yearsOfExperience}{" "}
                      {t("profileForm.yearsExperience")}
                    </span>
                    &#8226;{" "}
                    <span className="flex items-center gap-1">
                      <Languages size={18} className="text-secondary" />
                      {doctor.languages.join(", ")}
                    </span>
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
                        <DropdownMenuItem>
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
                    <MCButton
                      variant="primary"
                      size="m"
                      className="font-medium rounded-full transition-colors transition-opacity transition-transform duration-200 focus:outline-none px-6 py-3 text-base md:px-8 md:py-6 md:text-lg bg-transparent border border-primary text-primary hover:bg-primary/10 hover:opacity-90 active:bg-primary/20 active:opacity-80 active:scale-95 active:shadow-inner"
                      onClick={onSendMessage}
                    >
                      <MessageCircle className="w-5 h-5 mr-2" />
                      {t("profileForm.sendMessage")}
                    </MCButton>
                    <MCButton
                      variant={doctor.isFavorite ? "secondary" : "outline"}
                      size="m"
                      className="font-medium rounded-full transition-colors transition-opacity transition-transform duration-200 focus:outline-none px-6 py-3 text-base md:px-8 md:py-6 md:text-lg bg-transparent border border-primary text-primary hover:bg-primary/10 hover:opacity-90 active:bg-primary/20 active:opacity-80 active:scale-95 active:shadow-inner"
                      onClick={onToggleFavorite}
                    >
                      {doctor.isFavorite ? (
                        <>
                          <HeartOff className=" text-red-500" />
                        </>
                      ) : (
                        <>
                          <Heart fill="red" className="text-red-500" />
                        </>
                      )}
                    </MCButton>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button className="font-medium rounded-full transition-colors transition-opacity transition-transform duration-200 focus:outline-none px-6 py-3 text-base md:px-8 md:py-6 md:text-lg bg-transparent border border-primary text-primary hover:bg-primary/10 hover:opacity-90 active:bg-primary/20 active:opacity-80 active:scale-95 active:shadow-inner">
                          <Ellipsis />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem>
                          <Share2 className="w-4 h-4 mr-2" />
                          {t("profileForm.menu.shareProfile")}
                        </DropdownMenuItem>
                        <DropdownMenuItem>
                          <VolumeX className="w-4 h-4 mr-2" />
                          {t("profileForm.menu.mute")}
                        </DropdownMenuItem>
                        <DropdownMenuItem>
                          <Ban className="w-4 h-4 mr-2 text-red-500" />
                          <span className="text-red-500">
                            {t("profileForm.menu.block")}
                          </span>
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
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
