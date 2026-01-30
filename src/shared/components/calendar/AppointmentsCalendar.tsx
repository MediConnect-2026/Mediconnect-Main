import { useState, useMemo } from "react";
import { format, isSameDay } from "date-fns";
import { enUS, es } from "date-fns/locale";
import { Calendar } from "@/shared/ui/calendar";
import { AppointmentCard } from "./AppointmentCard";
import { motion, AnimatePresence } from "framer-motion";
import { CalendarDays } from "lucide-react";
import { useIsMobile } from "@/lib/hooks/useIsMobile";
import type { Appointment, AppointmentStatus } from "./AppointmentCard";
import { fadeInUp, fadeInUpDelayed } from "@/lib/animations/commonAnimations";
import { useTranslation } from "react-i18next";

const appointmentsData: Appointment[] = [
  {
    id: "1",
    date: new Date(2026, 0, 20),
    clientName: "Alexander Gil",
    service: "Consulta interna",
    startTime: "9:00 AM",
    endTime: "10:00 AM",
    isVirtual: true,
    status: "scheduled" as AppointmentStatus,
  },
  {
    id: "2",
    date: new Date(2026, 0, 20),
    clientName: "Clay Gomera",
    clientImage:
      "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150&h=150&fit=crop&crop=face",
    service: "Fisioterapia",
    startTime: "10:00 AM",
    endTime: "11:00 AM",
    isVirtual: false,
    status: "pending" as AppointmentStatus,
  },
  {
    id: "3",
    date: new Date(2026, 0, 22),
    clientName: "María López",
    clientImage:
      "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=150&h=150&fit=crop&crop=face",
    service: "Terapia ocupacional",
    startTime: "2:00 PM",
    endTime: "3:00 PM",
    isVirtual: true,
    status: "in_progress" as AppointmentStatus,
  },
  {
    id: "4",
    date: new Date(2026, 0, 25),
    clientName: "Carlos Mendez",
    clientImage:
      "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&h=150&fit=crop&crop=face",
    service: "Consulta general",
    startTime: "11:00 AM",
    endTime: "12:00 PM",
    isVirtual: false,
    status: "completed" as AppointmentStatus,
  },
  {
    id: "5",
    date: new Date(2026, 0, 22),
    clientName: "María López",
    clientImage:
      "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=150&h=150&fit=crop&crop=face",
    service: "Terapia ocupacional",
    startTime: "2:00 PM",
    endTime: "3:00 PM",
    isVirtual: true,
    status: "cancelled" as AppointmentStatus,
  },
  {
    id: "6",
    date: new Date(2026, 0, 25),
    clientName: "Carlos Mendez",
    clientImage:
      "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&h=150&fit=crop&crop=face",
    service: "Consulta general",
    startTime: "11:00 AM",
    endTime: "12:00 PM",
    isVirtual: false,
    status: "scheduled" as AppointmentStatus,
  },
];

export function AppointmentsCalendar() {
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  const isMobile = useIsMobile();
  const { t, i18n } = useTranslation("patient");

  const appointmentsForDate = appointmentsData.filter((apt) =>
    isSameDay(apt.date, selectedDate),
  );

  // Calculate appointment counts per date
  const appointmentCounts = useMemo(() => {
    const counts = new Map<string, number>();
    appointmentsData.forEach((apt) => {
      const dateKey = apt.date.toDateString();
      counts.set(dateKey, (counts.get(dateKey) || 0) + 1);
    });
    return counts;
  }, []);

  // Get dates that have appointments for highlighting
  const appointmentDates = appointmentsData.map((apt) => apt.date);

  // Check if the appointments list is scrollable
  const isScrollable =
    (appointmentsForDate.length > 4 && !isMobile) ||
    (appointmentsForDate.length > 2 && isMobile);

  // Selecciona el locale según el idioma actual
  const calendarLocale = i18n.language === "es" ? es : enUS;

  // Formatea la fecha según el idioma
  const formattedDate = format(selectedDate, "d 'de' MMMM", {
    locale: calendarLocale,
  });

  // Determina qué key usar para el plural
  const appointmentCountKey =
    appointmentsForDate.length === 1
      ? "appointments.appointmentsCount"
      : "appointments.appointmentsCount_plural";

  return (
    <div className="w-full h-full grid grid-cols-1 lg:grid-cols-[40%_auto_1fr] gap-6 p-2 lg:p-6">
      {/* Calendar Section */}
      <motion.div
        {...fadeInUp}
        className="flex flex-col w-full min-h-0"
        style={{
          WebkitOverflowScrolling: "touch",
        }}
      >
        <h2
          className={`mb-6 flex-shrink-0 ${isMobile ? "text-lg" : "text-3xl"} font-semibold text-foreground`}
        >
          {t("navbar.calendar")}
        </h2>
        <div className="flex-1 w-full min-h-0 overflow-auto">
          <Calendar
            mode="single"
            selected={selectedDate}
            onSelect={(date) => date && setSelectedDate(date)}
            locale={calendarLocale}
            className="w-full h-fit"
            modifiers={{
              hasAppointment: appointmentDates,
            }}
            appointmentCounts={appointmentCounts}
          />
        </div>
      </motion.div>

      {/* Divider */}
      <div
        className="hidden lg:flex justify-center items-stretch"
        style={{ flexShrink: 0 }}
      >
        <div className="w-px bg-primary/10" style={{ minHeight: "100%" }} />
      </div>

      {/* Appointments Section */}
      <motion.div
        {...fadeInUpDelayed}
        className="flex flex-col w-full min-h-0"
        style={{
          WebkitOverflowScrolling: "touch",
          minWidth: 0,
        }}
      >
        <div className="flex items-center justify-between pb-6 flex-wrap gap-2 flex-shrink-0">
          <h2
            className={`${isMobile ? "text-lg" : "text-3xl"} font-semibold text-foreground`}
          >
            {t("appointments.appointmentsForDate", { date: formattedDate })}
          </h2>
          <span className="bg-sage-light text-primary text-sm font-medium px-3 py-1 rounded-full whitespace-nowrap">
            {t(appointmentCountKey, { count: appointmentsForDate.length })}
          </span>
        </div>

        <div
          className={`space-y-4 w-full flex-1 min-h-0 ${isScrollable ? "overflow-y-auto pr-2" : ""}`}
          style={
            isScrollable
              ? {
                  maxHeight: isMobile ? "400px" : "500px",
                  WebkitOverflowScrolling: "touch",
                  overflowX: "hidden",
                }
              : {}
          }
        >
          <AnimatePresence mode="wait">
            {appointmentsForDate.length > 0 ? (
              <motion.div
                key={selectedDate.toISOString()}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="space-y-4 w-full"
              >
                {appointmentsForDate.map((appointment, index) => (
                  <AppointmentCard
                    key={appointment.id}
                    appointment={appointment}
                    index={index}
                  />
                ))}
              </motion.div>
            ) : (
              <motion.div
                key="empty"
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                className="flex flex-col items-center justify-center h-[300px] text-center"
              >
                <div className="w-16 h-16 rounded-full bg-sage-light flex items-center justify-center mb-4">
                  <CalendarDays className="h-8 w-8 text-primary" />
                </div>
                <h3 className="text-xl font-medium text-foreground mb-2">
                  {t("appointments.emptyTitle")}
                </h3>
                <p className="text-muted-foreground max-w-xs">
                  {t("appointments.emptyDescription")}
                </p>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </motion.div>
    </div>
  );
}
