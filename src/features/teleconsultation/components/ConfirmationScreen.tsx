import { Calendar, Clock, Loader2, Stethoscope, Video } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/shared/ui/avatar";
import MCButton from "@/shared/components/forms/MCButton";
import { MCUserAvatar } from "@/shared/navigation/userMenu/MCUserAvatar";
import { useIsMobile } from "@/lib/hooks/useIsMobile";
import { useTranslation } from "react-i18next";
import { useAppStore } from "@/stores/useAppStore";
import { getUserAppRole } from "@/services/auth/auth.types";
interface ConfirmationScreenProps {
  onJoinCall: () => void;
  isLoading?: boolean;
  appointment?: {
    doctorAvatar?: string;
    doctorName: string;
    doctorSpecialty: string;
    date: string;
    time: string;
    service: string;
  };
}

export const ConfirmationScreen = ({
  onJoinCall,
  isLoading = false,
  appointment,
}: ConfirmationScreenProps) => {
  const { t } = useTranslation("common");
  const doctorName = appointment?.doctorName || "Dr. Cristiano Ronaldo";
  const doctorAvatar = appointment?.doctorAvatar;
  const doctorSpecialty =
    appointment?.doctorSpecialty || "Especialista en Medicina Interna";

  const user = useAppStore((state) => state.user);
  const appRole = user ? getUserAppRole(user) : null;

  const date = appointment?.date || "15 de octubre, 2025";
  const time = appointment?.time || "10:00 AM - 10:45 AM";
  const service = appointment?.service || "Plan Nutricional";
  const isMobile = useIsMobile();

  return (
    <div className="flex items-center justify-center p-3 md:p-4 min-h-screen md:min-h-0">
      <div className="w-full max-w-2xl">
        {/* Header */}
        <div className="w-full flex flex-col justify-center items-center text-primary text-center mb-6 md:mb-8">
          <h1 className="text-xl md:text-2xl lg:text-4xl font-semibold mb-2">
            {t("confirmationScreen.title")}
          </h1>
          <p className="opacity-80 text-sm md:text-base lg:text-lg">
            {t("confirmationScreen.subtitle")}
          </p>
        </div>

        {/* Doctor info card */}
        <div className="bg-background border border-primary/10 p-4 md:p-6 lg:p-8 rounded-2xl md:rounded-3xl mb-4 md:mb-6">
          {/* Mobile: Vertical layout */}
          {isMobile ? (
            <div className="flex flex-col space-y-4">
              {/* Doctor avatar and basic info */}
              <div className="flex items-center gap-3">
                <div className="h-16 w-16 relative overflow-hidden rounded-full border border-primary/10 bg-muted flex items-center justify-center flex-shrink-0">
                  {doctorAvatar ? (
                    <Avatar className="h-16 w-16 rounded-full overflow-hidden">
                      <AvatarImage
                        src={doctorAvatar}
                        alt={doctorName}
                        className="w-full h-full object-cover"
                      />
                      <AvatarFallback className="bg-muted text-muted-foreground">
                        {(doctorName ?? "")
                          .split(" ")
                          .map((n) => n[0])
                          .join("")}
                      </AvatarFallback>
                    </Avatar>
                  ) : (
                    <MCUserAvatar
                      name={doctorName}
                      square
                      size={64}
                      className="w-full h-full object-cover"
                    />
                  )}
                </div>
                <div className="text-left flex-1 min-w-0">
                  <p className="font-semibold text-base truncate">
                    {doctorName}
                  </p>
                  {appRole === "PATIENT" && (
                    <p className="text-sm text-muted-foreground line-clamp-2">
                      {doctorSpecialty}
                    </p>
                  )}
                </div>
              </div>

              {/* Appointment details */}
              <div className="space-y-2.5 pl-1">
                <div className="flex items-center gap-2.5 text-sm text-muted-foreground">
                  <Calendar className="w-4 h-4 flex-shrink-0" />
                  <span>{date}</span>
                </div>
                <div className="flex items-center gap-2.5 text-sm text-muted-foreground">
                  <Clock className="w-4 h-4 flex-shrink-0" />
                  <span>{time}</span>
                </div>
                <div className="flex items-center gap-2.5 text-sm text-muted-foreground">
                  <Stethoscope className="w-4 h-4 flex-shrink-0" />
                  <span>{service}</span>
                </div>
              </div>
            </div>
          ) : (
            /* Desktop: Horizontal layout */
            <div className="flex items-center gap-4">
              <div className="h-20 w-20 relative overflow-hidden rounded-full border border-primary/10 bg-muted flex items-center justify-center flex-shrink-0">
                {doctorAvatar ? (
                  <Avatar className="h-20 w-20 rounded-full overflow-hidden">
                    <AvatarImage
                      src={doctorAvatar}
                      alt={doctorName}
                      className="w-full h-full object-cover transition-transform duration-500 hover:scale-110"
                    />
                    <AvatarFallback className="bg-muted text-muted-foreground">
                      {(doctorName ?? "")
                        .split(" ")
                        .map((n) => n[0])
                        .join("")}
                    </AvatarFallback>
                  </Avatar>
                ) : (
                  <MCUserAvatar
                    name={doctorName}
                    square
                    size={96}
                    className="w-full h-full object-cover transition-transform duration-500 hover:scale-110"
                  />
                )}
              </div>
              <div className="text-left">
                <p className="font-semibold">{doctorName}</p>
                {appRole === "PATIENT" && (
                  <p className="text-sm text-muted-foreground">
                    {doctorSpecialty}
                  </p>
                )}
              </div>
              <div className="ml-auto text-left space-y-2">
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <Calendar className="w-4 h-4" />
                  <span>{date}</span>
                </div>
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <Clock className="w-4 h-4" />
                  <span>{time}</span>
                </div>
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <Stethoscope className="w-4 h-4" />
                  <span>{service}</span>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Join button */}
        <MCButton
          onClick={onJoinCall}
          className="w-full gap-2"
          size="l"
          disabled={isLoading}
        >
          {isLoading ? (
            <Loader2 className="w-4 h-4 md:w-5 md:h-5 animate-spin" />
          ) : (
            <Video className="w-4 h-4 md:w-5 md:h-5" />
          )}
          <span className="text-sm md:text-base">
            {isLoading
              ? "Conectando..."
              : t("confirmationScreen.joinButton")}
          </span>
        </MCButton>
      </div>
    </div>
  );
};
