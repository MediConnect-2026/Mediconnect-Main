import { format, isAfter, isSameDay, startOfToday } from "date-fns";
import { es } from "date-fns/locale";
import type { Appointment } from "@/types/CalendarTypes";
import { Clock, Calendar, ChevronRight, MapPin, Video } from "lucide-react";
import { cn } from "@/lib/utils";
import { Badge } from "@/shared/ui/badge";
import type { AppointmentStatus } from "@/types/CalendarTypes";
import { useAppStore } from "@/stores/useAppStore";
import { Avatar, AvatarFallback, AvatarImage } from "@/shared/ui/avatar";
import { MCUserAvatar } from "@/shared/navigation/userMenu/MCUserAvatar";
import { useTranslation } from "react-i18next";
import { useIsMobile } from "@/lib/hooks/useIsMobile";
import { formatTimeTo12h } from "@/utils/appointmentMapper";

interface ListViewProps {
  appointments: Appointment[];
  onSelectAppointment: (appointment: Appointment) => void;
}

export const ListView = ({
  appointments,
  onSelectAppointment,
}: ListViewProps) => {
  const { t } = useTranslation("common");
  const isMobile = useIsMobile();
  const today = startOfToday();
  const userRole = useAppStore((state) => state.user?.rol);

  const statusLabels: Record<AppointmentStatus, string> = {
    scheduled: t("calendar.status.scheduled"),
    pending: t("calendar.status.pending"),
    in_progress: t("calendar.status.in_progress"),
    completed: t("calendar.status.completed"),
    cancelled: t("calendar.status.cancelled"),
  };

  const statusColors: Record<AppointmentStatus, string> = {
    scheduled: "bg-[#6A1B9A]/15 text-[#6A1B9A]",
    pending: "bg-[#C77A1F]/15 text-[#C77A1F]",
    in_progress: "bg-[#1565C0]/15 text-[#1565C0]",
    completed: "bg-[#2E7D32]/15 text-[#2E7D32]",
    cancelled: "bg-[#C62828]/15 text-[#C62828]",
  };

  // Filter and sort appointments (upcoming first)
  const sortedAppointments = [...appointments]
    .filter((apt) => isAfter(apt.date, today) || isSameDay(apt.date, today))
    .sort((a, b) => {
      const dateCompare = a.date.getTime() - b.date.getTime();
      if (dateCompare !== 0) return dateCompare;
      return a.time.localeCompare(b.time);
    });

  // Group by date
  const groupedAppointments = sortedAppointments.reduce(
    (groups, apt) => {
      const dateKey = format(apt.date, "yyyy-MM-dd");
      if (!groups[dateKey]) {
        groups[dateKey] = [];
      }
      groups[dateKey].push(apt);
      return groups;
    },
    {} as Record<string, Appointment[]>,
  );

  if (sortedAppointments.length === 0) {
    return (
      <div className="flex-1 flex items-center justify-center p-4">
        <div className="text-center">
          <div className="w-12 h-12 sm:w-16 sm:h-16 bg-muted rounded-2xl flex items-center justify-center mx-auto mb-4">
            <Calendar className="w-6 h-6 sm:w-8 sm:h-8 text-muted-foreground" />
          </div>
          <h3 className="text-base sm:text-lg font-semibold mb-2">
            {t("calendar.noUpcomingAppointments")}
          </h3>
          <p className="text-sm text-muted-foreground">
            {t("calendar.upcomingAppointmentsDescription")}
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex-1 overflow-auto p-3 sm:p-4 md:p-6 space-y-4 sm:space-y-6 h-full">
      {Object.entries(groupedAppointments).map(([dateKey, dayAppointments]) => {
        // Parsear el dateKey correctamente para evitar problemas de zona horaria
        const [year, month, day] = dateKey.split('-').map(Number);
        const date = new Date(year, month - 1, day);
        const isToday = isSameDay(date, today);

        return (
          <div key={dateKey}>
            <div className="flex items-center gap-2 sm:gap-3 mb-2 sm:mb-3">
              <div
                className={cn(
                  "px-2 sm:px-3 py-1 sm:py-1.5 rounded-lg text-xs sm:text-sm font-medium",
                  isToday
                    ? "bg-primary text-primary-foreground"
                    : "bg-muted text-muted-foreground",
                )}
              >
                {isToday
                  ? t("calendar.today")
                  : format(date, "EEEE, d 'de' MMMM", { locale: es })}
              </div>
              <div className="flex-1 h-px bg-primary/15" />
              <span className="text-xs sm:text-sm text-muted-foreground whitespace-nowrap">
                {dayAppointments.length}{" "}
                {dayAppointments.length === 1
                  ? t("calendar.appointment")
                  : t("calendar.appointments")}
              </span>
            </div>

            <div className="space-y-2 sm:space-y-3">
              {dayAppointments.map((apt) => (
                <button
                  key={apt.id}
                  onClick={() => onSelectAppointment(apt)}
                  className="w-full text-left p-3 sm:p-4 bg-background rounded-2xl sm:rounded-4xl border border-primary/15 hover:border-primary/30 hover:shadow-md transition-all group"
                >
                  <div className="flex items-center justify-between gap-2">
                    <div className="flex items-center gap-2 sm:gap-3 md:gap-4 min-w-0 flex-1">
                      <div
                        className={cn(
                          "relative overflow-hidden rounded-full border border-primary/10 bg-muted flex items-center justify-center flex-shrink-0",
                          isMobile ? "h-9 w-9" : "h-10 w-10",
                        )}
                      >
                        {userRole === "DOCTOR" ? (
                          apt.patientAvatarUrl ? (
                            <Avatar
                              className={cn(
                                "rounded-full overflow-hidden",
                                isMobile ? "h-9 w-9" : "h-10 w-10",
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
                              size={isMobile ? 36 : 40}
                              className="w-full h-full object-cover transition-transform duration-500 hover:scale-110"
                            />
                          )
                        ) : apt.doctorAvatarUrl ? (
                          <Avatar
                            className={cn(
                              "rounded-full overflow-hidden",
                              isMobile ? "h-9 w-9" : "h-10 w-10",
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
                            size={isMobile ? 36 : 40}
                            className="w-full h-full object-cover transition-transform duration-500 hover:scale-110"
                          />
                        )}
                      </div>

                      <div className="min-w-0 flex-1">
                        <div className="flex items-center gap-2 mb-1 flex-wrap">
                          <span className="font-semibold text-sm sm:text-base truncate">
                            {userRole === "DOCTOR"
                              ? apt.patientName
                              : apt.doctorName}
                          </span>
                          <Badge
                            className={cn(
                              "text-xs whitespace-nowrap",
                              statusColors[apt.status],
                            )}
                          >
                            {statusLabels[apt.status]}
                          </Badge>
                        </div>
                        <div className="flex flex-wrap items-center gap-2 sm:gap-4 text-xs sm:text-sm text-muted-foreground">
                          <span className="flex items-center gap-1">
                            <Clock className="w-3 h-3 flex-shrink-0" />
                            {formatTimeTo12h(apt.time)} - {apt.duration} min
                          </span>
                          {!isMobile && <span className="mx-1">·</span>}
                          {apt.modality === "presencial" ? (
                            <span className="flex items-center gap-1 min-w-0">
                              <MapPin className="w-3 h-3 flex-shrink-0" />
                              <span className="truncate">{apt.address}</span>
                            </span>
                          ) : apt.modality === "virtual" ? (
                            <span className="flex items-center gap-1">
                              <Video className="w-3 h-3 flex-shrink-0" />
                              {t("calendar.modality.virtual")}
                            </span>
                          ) : null}
                        </div>
                      </div>
                    </div>
                    <ChevronRight className="w-4 h-4 sm:w-5 sm:h-5 text-muted-foreground group-hover:text-foreground transition-colors flex-shrink-0" />
                  </div>
                </button>
              ))}
            </div>
          </div>
        );
      })}
    </div>
  );
};
