import { useMemo } from "react";
import {
  format,
  startOfWeek,
  endOfWeek,
  eachDayOfInterval,
  isSameDay,
  isToday,
  isWeekend,
} from "date-fns";
import { es } from "date-fns/locale";
import type { Appointment } from "@/types/CalendarTypes";
import { AppointmentBadge } from "./AppointmentBadge";
import { cn } from "@/lib/utils";
import { useTranslation } from "react-i18next";
import { useIsMobile } from "@/lib/hooks/useIsMobile";

interface WeekViewProps {
  currentDate: Date;
  appointments: Appointment[];
  onSelectDate: (date: Date) => void;
  onSelectAppointment: (appointment: Appointment) => void;
  selectedDate: Date | null;
}

const hours = Array.from({ length: 24 }, (_, i) => i); // 0 AM to 11 PM (full day)

export const WeekView = ({
  currentDate,
  appointments,
  onSelectDate,
  onSelectAppointment,
  selectedDate,
}: WeekViewProps) => {
  const { t } = useTranslation("common");
  const isMobile = useIsMobile();

  const weekDays = useMemo(() => {
    const weekStart = startOfWeek(currentDate);
    const weekEnd = endOfWeek(currentDate);
    return eachDayOfInterval({ start: weekStart, end: weekEnd });
  }, [currentDate]);

  const getAppointmentsForDayAndHour = (date: Date, hour: number) => {
    return appointments.filter((apt) => {
      if (!isSameDay(apt.date, date)) return false;
      const aptHour = parseInt(apt.time.split(":")[0]);
      return aptHour === hour;
    });
  };

  return (
    <div className="flex-1 overflow-auto h-full">
      <div className="min-w-[600px] sm:min-w-[700px] md:min-w-[800px]">
        {/* Header with days */}
        <div className="grid grid-cols-8 border-b border-primary/15 sticky top-0 bg-accent/40 dark:bg-accent/20 rounded-t-3xl z-10">
          <div className="p-2 sm:p-3 text-center text-xs sm:text-sm text-muted-foreground rounded-tl-3xl">
            {t("calendar.today")}
          </div>
          {weekDays.map((day, idx) => {
            const isWeekendDay = isWeekend(day);
            const isDayToday = isToday(day);
            const isSaturday = day.getDay() === 6;
            return (
              <div
                key={day.toISOString()}
                onClick={() => onSelectDate(day)}
                className={cn(
                  "p-2 sm:p-3 text-center cursor-pointer transition-colors",
                  isWeekendDay && "calendar-cell-weekend",
                  isDayToday && "calendar-cell-today",
                  selectedDate &&
                    isSameDay(day, selectedDate) &&
                    "bg-accent dark:bg-primary/20",
                  isSaturday && "rounded-tr-3xl",
                )}
              >
                <div className="text-xs uppercase text-muted-foreground">
                  {format(day, "EEE", { locale: es })}
                </div>
                <div
                  className={cn(
                    "text-base sm:text-lg font-semibold mt-1",
                    isDayToday && "text-primary",
                  )}
                >
                  {format(day, "d")}
                </div>
              </div>
            );
          })}
        </div>

        {/* Time grid */}
        <div className="divide-y divide-primary/10">
          {hours.map((hour) => (
            <div
              key={hour}
              className="grid grid-cols-8 min-h-[70px] sm:min-h-[80px]"
            >
              <div className="p-2 text-xs sm:text-sm text-muted-foreground text-right pr-3 sm:pr-4 border-r border-primary/10 bg-muted/30">
                {hour.toString().padStart(2, "0")}:00
              </div>
              {weekDays.map((day) => {
                const hourAppointments = getAppointmentsForDayAndHour(
                  day,
                  hour,
                );
                const isWeekendDay = isWeekend(day);
                return (
                  <div
                    key={`${day.toISOString()}-${hour}`}
                    className={cn(
                      "p-1 border-r border-primary/10 transition-colors hover:bg-muted/50 flex flex-col",
                      isWeekendDay && "calendar-cell-weekend",
                    )}
                  >
                    <div className="space-y-1 flex-1 overflow-hidden">
                      {hourAppointments.map((apt) => (
                        <AppointmentBadge
                          key={apt.id}
                          appointment={apt}
                          onClick={() => onSelectAppointment(apt)}
                        />
                      ))}
                    </div>
                  </div>
                );
              })}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
