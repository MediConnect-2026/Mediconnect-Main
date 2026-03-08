import { format, isSameDay } from "date-fns";
import { es } from "date-fns/locale";
import type { Appointment } from "@/types/CalendarTypes";
import { Clock, MapPin, Video } from "lucide-react";
import { cn } from "@/lib/utils";
import type { AppointmentStatus } from "@/types/CalendarTypes";
import { useAppStore } from "@/stores/useAppStore";
import { Avatar, AvatarFallback, AvatarImage } from "@/shared/ui/avatar";
import { MCUserAvatar } from "@/shared/navigation/userMenu/MCUserAvatar";
import { useTranslation } from "react-i18next";
import { useIsMobile } from "@/lib/hooks/useIsMobile";

const hours = Array.from({ length: 24 }, (_, i) => i); // 0 AM to 11 PM (full day)

const statusColors: Record<AppointmentStatus, string> = {
  scheduled: "border-l-[#6A1B9A] bg-[#6A1B9A]/10",
  pending: "border-l-[#C77A1F] bg-[#C77A1F]/10",
  in_progress: "border-l-[#1565C0] bg-[#1565C0]/10",
  completed: "border-l-[#2E7D32] bg-[#2E7D32]/10",
  cancelled: "border-l-[#C62828] bg-[#C62828]/10",
};

type DayViewProps = {
  currentDate: Date;
  appointments: Appointment[];
  onSelectAppointment: (appointment: Appointment) => void;
};

export const DayView = ({
  currentDate,
  appointments,
  onSelectAppointment,
}: DayViewProps) => {
  const { t } = useTranslation("common");
  const isMobile = useIsMobile();
  const dayAppointments = appointments.filter((apt) =>
    isSameDay(apt.date, currentDate),
  );

  const getAppointmentsForHour = (hour: number) => {
    return dayAppointments.filter((apt) => {
      const aptHour = parseInt(apt.time.split(":")[0]);
      return aptHour === hour;
    });
  };

  const userRole = useAppStore((state) => state.user?.role);

  return (
    <div className="flex flex-col h-full overflow-hidden">
      {/* Day header - Fixed */}
      <div className="p-3 sm:p-4 md:p-6 border-b border-primary/15 bg-accent/40 dark:bg-accent/20 rounded-t-2xl flex-shrink-0">
        <h2 className="text-lg sm:text-xl md:text-2xl font-bold">
          {format(currentDate, "EEEE, d 'de' MMMM", { locale: es })}
        </h2>
        <p className="text-muted-foreground text-sm mt-1">
          {t("calendar.appointmentsScheduled", {
            count: dayAppointments.length,
          })}
        </p>
      </div>

      {/* Time slots - Scrollable */}
      <div className="flex-1 overflow-auto">
        <div className="divide-y divide-primary/15">
          {hours.map((hour) => {
            const hourAppointments = getAppointmentsForHour(hour);

            return (
              <div
                key={hour}
                className={cn(
                  "grid min-h-[80px] sm:min-h-[100px] w-full",
                  isMobile ? "grid-cols-[60px_1fr]" : "grid-cols-[80px_1fr]",
                )}
              >
                <div
                  className={cn(
                    "p-2 sm:p-4 text-xs sm:text-sm text-muted-foreground text-right bg-muted/30 border-r border-primary/15",
                  )}
                >
                  {hour.toString().padStart(2, "0")}:00
                </div>
                <div className="p-2 sm:p-3 space-y-2">
                  {hourAppointments.map((apt) => (
                    <button
                      key={apt.id}
                      onClick={() => onSelectAppointment(apt)}
                      className={cn(
                        "w-full text-left p-2 sm:p-3 md:p-4 rounded-xl border-l-4 transition-all hover:shadow-md",
                        statusColors[apt.status],
                        "overflow-hidden",
                      )}
                    >
                      <div className="flex items-start justify-between gap-2 w-full overflow-hidden">
                        <div className="flex items-center gap-2 sm:gap-3 min-w-0 w-full overflow-hidden">
                          {/* Avatar */}
                          <div
                            className={cn(
                              "relative overflow-hidden rounded-full border border-primary/10 bg-muted flex items-center justify-center flex-shrink-0",
                              isMobile
                                ? "h-8 w-8"
                                : "h-10 w-10 sm:h-12 sm:w-12",
                            )}
                          >
                            {userRole === "DOCTOR" ? (
                              apt.patientAvatarUrl ? (
                                <Avatar
                                  className={cn(
                                    "rounded-full overflow-hidden",
                                    isMobile
                                      ? "h-8 w-8"
                                      : "h-10 w-10 sm:h-12 sm:w-12",
                                  )}
                                >
                                  <AvatarImage
                                    src={apt.patientAvatarUrl}
                                    alt={apt.patientName}
                                    className="w-full h-full object-cover transition-transform duration-500 hover:scale-110"
                                  />
                                  <AvatarFallback className="bg-muted text-muted-foreground text-xs">
                                    {apt.patientName
                                      .split(" ")
                                      .map((n) => n[0])
                                      .join("")}
                                  </AvatarFallback>
                                </Avatar>
                              ) : (
                                <MCUserAvatar
                                  name={apt.patientName}
                                  square
                                  size={isMobile ? 32 : 48}
                                  className="w-full h-full object-cover transition-transform duration-500 hover:scale-110"
                                />
                              )
                            ) : apt.doctorAvatarUrl ? (
                              <Avatar
                                className={cn(
                                  "rounded-full overflow-hidden",
                                  isMobile
                                    ? "h-8 w-8"
                                    : "h-10 w-10 sm:h-12 sm:w-12",
                                )}
                              >
                                <AvatarImage
                                  src={apt.doctorAvatarUrl}
                                  alt={apt.doctorName}
                                  className="w-full h-full object-cover transition-transform duration-500 hover:scale-110"
                                />
                                <AvatarFallback className="bg-muted text-muted-foreground text-xs">
                                  {apt.doctorName
                                    .split(" ")
                                    .map((n) => n[0])
                                    .join("")}
                                </AvatarFallback>
                              </Avatar>
                            ) : (
                              <MCUserAvatar
                                name={apt.doctorName}
                                square
                                size={isMobile ? 32 : 48}
                                className="w-full h-full object-cover transition-transform duration-500 hover:scale-110"
                              />
                            )}
                          </div>

                          <div className="min-w-0 w-full overflow-hidden">
                            <span className="font-semibold text-sm sm:text-base md:text-lg block truncate">
                              {userRole === "DOCTOR"
                                ? apt.patientName
                                : apt.doctorName}
                            </span>
                            <div className="flex flex-wrap items-center gap-2 sm:gap-4 text-xs sm:text-sm text-muted-foreground w-full overflow-hidden">
                              <span className="flex items-center gap-1 truncate">
                                <Clock className="w-3 h-3" />
                                {apt.time} - {apt.duration} min
                              </span>
                              {!isMobile && <span className="mx-1">·</span>}
                              {apt.modality === "presencial" ? (
                                <span className="flex items-center gap-1 truncate">
                                  <MapPin className="w-3 h-3 flex-shrink-0" />
                                  <span className="truncate">
                                    {apt.address}
                                  </span>
                                </span>
                              ) : apt.modality === "virtual" ? (
                                <span className="flex items-center gap-1 truncate">
                                  <Video className="w-3 h-3" />
                                  {t("calendar.modality.virtual")}
                                </span>
                              ) : null}
                            </div>
                          </div>
                        </div>
                      </div>
                      {!isMobile && apt.notes && (
                        <div className="flex flex-wrap items-center gap-4 text-sm text-muted-foreground mt-2">
                          <span className="flex items-center gap-1">
                            <span className="truncate">{apt.type}</span>
                            <span className="mx-1">·</span>
                            <span className="truncate">
                              {apt.notes.length > 80
                                ? apt.notes.slice(0, 80) + "..."
                                : apt.notes}
                            </span>
                          </span>
                        </div>
                      )}
                    </button>
                  ))}
                  {hourAppointments.length === 0 && (
                    <div className="h-full flex items-center justify-center text-xs sm:text-sm text-muted-foreground">
                      {t("calendar.available")}
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
