import { useMemo } from "react";
import {
  format,
  startOfMonth,
  endOfMonth,
  startOfWeek,
  endOfWeek,
  eachDayOfInterval,
  isSameMonth,
  isSameDay,
  isWeekend,
  isToday,
} from "date-fns";

import type { Appointment } from "@/types/CalendarTypes";
import { AppointmentBadge } from "./AppointmentBadge";
import { cn } from "@/lib/utils";
import { useTranslation } from "react-i18next";
import { useIsMobile } from "@/lib/hooks/useIsMobile";

interface MonthViewProps {
  currentDate: Date;
  appointments: Appointment[];
  onSelectDate: (date: Date) => void;
  onSelectAppointment: (appointment: Appointment) => void;
  selectedDate: Date | null;
}

export const MonthView = ({
  currentDate,
  appointments,
  onSelectDate,
  onSelectAppointment,
  selectedDate,
}: MonthViewProps) => {
  const { t } = useTranslation("common");
  const isMobile = useIsMobile();

  const weekDays = [
    t("calendar.weekDays.sun"),
    t("calendar.weekDays.mon"),
    t("calendar.weekDays.tue"),
    t("calendar.weekDays.wed"),
    t("calendar.weekDays.thu"),
    t("calendar.weekDays.fri"),
    t("calendar.weekDays.sat"),
  ];

  const calendarDays = useMemo(() => {
    const monthStart = startOfMonth(currentDate);
    const monthEnd = endOfMonth(currentDate);
    const calendarStart = startOfWeek(monthStart);
    const calendarEnd = endOfWeek(monthEnd);

    return eachDayOfInterval({ start: calendarStart, end: calendarEnd });
  }, [currentDate]);

  const getAppointmentsForDay = (date: Date) => {
    return appointments.filter((apt) => isSameDay(apt.date, date));
  };

  return (
    <div className="flex flex-col h-full p-2 sm:p-4">
      {/* Week day headers */}
      <div className="grid grid-cols-7 mb-1 sm:mb-2">
        {weekDays.map((day) => (
          <div
            key={day}
            className="text-center py-2 sm:py-3 text-xs sm:text-sm font-semibold text-muted-foreground"
          >
            {day}
          </div>
        ))}
      </div>

      {/* Calendar grid */}
      <div className="grid grid-cols-7 gap-1 sm:gap-2 flex-1 auto-rows-fr">
        {calendarDays.map((day) => {
          const dayAppointments = getAppointmentsForDay(day);
          const isCurrentMonth = isSameMonth(day, currentDate);
          const isSelected = selectedDate && isSameDay(day, selectedDate);
          const isDayToday = isToday(day);
          const isWeekendDay = isWeekend(day);

          return (
            <div
              key={day.toISOString()}
              onClick={() => onSelectDate(day)}
              className={cn(
                "calendar-cell cursor-pointer rounded-lg sm:rounded-2xl border border-primary/15 p-1 sm:p-2 min-h-[60px] sm:min-h-[100px] flex flex-col",
                !isCurrentMonth && "opacity-40",
                isWeekendDay &&
                  isCurrentMonth &&
                  "bg-accent/0 dark:bg-accent/0",
                isDayToday && "calendar-cell-today",
                isSelected && "ring-2 ring-primary ring-offset-2",
              )}
            >
              <div className="flex justify-end mb-1 sm:mb-2">
                <span
                  className={cn(
                    "w-5 h-5 sm:w-7 sm:h-7 flex items-center justify-center rounded-full text-xs sm:text-sm font-medium",
                    isDayToday && "bg-primary text-primary-foreground",
                  )}
                >
                  {format(day, "d")}
                </span>
              </div>

              <div className="space-y-0.5 sm:space-y-1 flex-1 overflow-hidden">
                {isMobile ? (
                  // Mobile: show dots for appointments
                  dayAppointments.length > 0 && (
                    <div className="flex gap-1 justify-center flex-wrap">
                      {dayAppointments.slice(0, 3).map((apt) => (
                        <div
                          key={apt.id}
                          className="w-1.5 h-1.5 rounded-full bg-primary"
                        />
                      ))}
                    </div>
                  )
                ) : (
                  // Desktop: show appointment badges
                  <>
                    {dayAppointments.slice(0, 2).map((apt) => (
                      <AppointmentBadge
                        key={apt.id}
                        appointment={apt}
                        onClick={() => onSelectAppointment(apt)}
                      />
                    ))}
                    {dayAppointments.length > 2 && (
                      <div className="text-xs text-muted-foreground text-center py-1">
                        {t("calendar.more", {
                          count: dayAppointments.length - 2,
                        })}
                      </div>
                    )}
                  </>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
