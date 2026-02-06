import { useState } from "react";
import {
  format,
  addMonths,
  subMonths,
  addWeeks,
  subWeeks,
  addDays,
  subDays,
} from "date-fns";
import { es } from "date-fns/locale";
import { ChevronLeft, ChevronRight, X } from "lucide-react";
import { Button } from "@/shared/ui/button";
import type { CalendarView, Appointment } from "@/types/CalendarTypes";
import { mockAppointments } from "@/data/mockAppointments";
import { useTranslation } from "react-i18next";
import { ViewSelector } from "../components/ViewSelector";
import { MonthView } from "../components/MonthView";
import { WeekView } from "../components/WeekView";
import { DayView } from "../components/DayView";
import { ListView } from "../components/ListView";
import { AppointmentDetails } from "../components/AppointmentDetails";
import MCButton from "@/shared/components/forms/MCButton";
import { useIsMobile } from "@/lib/hooks/useIsMobile";
import { cn } from "@/lib/utils";
import { fadeInUp } from "@/lib/animations/commonAnimations";
import { motion } from "framer-motion";
export const CalendarPage = () => {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [selectedAppointment, setSelectedAppointment] =
    useState<Appointment | null>(null);
  const [view, setView] = useState<CalendarView>("month");
  const [showMobileDetails, setShowMobileDetails] = useState(false);
  const { t } = useTranslation("common");
  const isMobile = useIsMobile();

  const navigatePrevious = () => {
    switch (view) {
      case "month":
        setCurrentDate(subMonths(currentDate, 1));
        break;
      case "week":
        setCurrentDate(subWeeks(currentDate, 1));
        break;
      case "day":
        setCurrentDate(subDays(currentDate, 1));
        break;
    }
  };

  const navigateNext = () => {
    switch (view) {
      case "month":
        setCurrentDate(addMonths(currentDate, 1));
        break;
      case "week":
        setCurrentDate(addWeeks(currentDate, 1));
        break;
      case "day":
        setCurrentDate(addDays(currentDate, 1));
        break;
    }
  };

  const goToToday = () => {
    setCurrentDate(new Date());
    setSelectedDate(new Date());
  };

  const handleSelectDate = (date: Date) => {
    setSelectedDate(date);
    if (view === "month") {
      setCurrentDate(date);
      setView("day");
    }
  };

  const handleSelectAppointment = (appointment: Appointment) => {
    setSelectedAppointment(appointment);
    if (isMobile) {
      setShowMobileDetails(true);
    }
  };

  const handleCloseMobileDetails = () => {
    setShowMobileDetails(false);
    setSelectedAppointment(null);
  };

  const getTitle = () => {
    switch (view) {
      case "month":
        return format(currentDate, "MMMM 'de' yyyy", { locale: es });
      case "week":
        return t("calendar.weekOf", {
          defaultValue: "Semana del {{date}}",
          date: format(currentDate, "d 'de' MMMM", { locale: es }),
        });
      case "day":
        return format(currentDate, "EEEE, d 'de' MMMM", { locale: es });
      default:
        return t("calendar.noUpcomingAppointments", {
          defaultValue: "Próximas citas",
        });
    }
  };

  return (
    <motion.div
      className="min-h-screen rounded-4xl bg-background transition-all duration-300 ease-in-out"
      initial={fadeInUp.initial}
      animate={fadeInUp.animate}
      exit={fadeInUp.exit}
      transition={fadeInUp.transition}
    >
      <motion.div
        className={cn(
          "flex h-screen transition-all  rounded-4xl  duration-300",
          isMobile ? "flex-col" : "",
        )}
        initial={fadeInUp.initial}
        animate={fadeInUp.animate}
        exit={fadeInUp.exit}
        transition={fadeInUp.transition}
      >
        {/* Main content */}
        <motion.div
          className="flex-1 flex flex-col transition-all   rounded-4xl  duration-300"
          initial={fadeInUp.initial}
          animate={fadeInUp.animate}
          exit={fadeInUp.exit}
          transition={fadeInUp.transition}
        >
          {/* Mobile Header */}
          {isMobile && (
            <motion.div
              className="sticky top-0 z-10 bg-background/95 backdrop-blur-sm  rounded-4xl   p-4"
              initial={fadeInUp.initial}
              animate={fadeInUp.animate}
              exit={fadeInUp.exit}
              transition={fadeInUp.transition}
            >
              {/* Título arriba */}
              <h1 className="text-lg font-semibold truncate max-w-full mb-2">
                {getTitle()}
              </h1>
              <div className="flex items-center justify-between">
                <ViewSelector currentView={view} onViewChange={setView} />
              </div>
              <div className="flex items-center justify-between mt-3">
                <div className="flex items-center gap-2">
                  {view !== "list" && (
                    <>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={navigatePrevious}
                        className="rounded-full h-8 w-8 p-0 hover:scale-105 transition-transform duration-200"
                      >
                        <ChevronLeft className="w-4 h-4" />
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={navigateNext}
                        className="rounded-full h-8 w-8 p-0 hover:scale-105 transition-transform duration-200"
                      >
                        <ChevronRight className="w-4 h-4" />
                      </Button>
                    </>
                  )}
                </div>
                <MCButton
                  variant="outline"
                  size="s"
                  onClick={goToToday}
                  className="hover:scale-105 transition-transform duration-200"
                >
                  {t("calendar.today", { defaultValue: "Hoy" })}
                </MCButton>
              </div>
            </motion.div>
          )}

          {/* Desktop Header */}
          {!isMobile && (
            <motion.div
              className="p-6 pb-4"
              initial={fadeInUp.initial}
              animate={fadeInUp.animate}
              exit={fadeInUp.exit}
              transition={fadeInUp.transition}
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <h1 className="text-2xl font-bold capitalize transition-all duration-300">
                    {getTitle()}
                  </h1>
                  {view !== "list" && (
                    <div className="flex items-center gap-1">
                      <Button
                        variant="outline"
                        size="icon"
                        onClick={navigatePrevious}
                        className="rounded-full hover:scale-105 transition-transform duration-200"
                      >
                        <ChevronLeft className="w-4 h-4" />
                      </Button>
                      <Button
                        variant="outline"
                        size="icon"
                        onClick={navigateNext}
                        className="rounded-full hover:scale-105 transition-transform duration-200"
                      >
                        <ChevronRight className="w-4 h-4" />
                      </Button>
                    </div>
                  )}
                </div>

                <div className="flex items-center gap-4">
                  <MCButton
                    variant="outline"
                    size="s"
                    onClick={goToToday}
                    className="hover:scale-105 transition-transform duration-200"
                  >
                    {t("calendar.today", { defaultValue: "Hoy" })}
                  </MCButton>
                  <ViewSelector currentView={view} onViewChange={setView} />
                </div>
              </div>
            </motion.div>
          )}

          {/* Calendar Views */}
          <motion.div
            className={cn(
              "flex flex-1 min-h-0 transition-all duration-300",
              isMobile ? "flex-col px-4 pb-4" : "px-6",
            )}
            initial={fadeInUp.initial}
            animate={fadeInUp.animate}
            exit={fadeInUp.exit}
            transition={fadeInUp.transition}
          >
            <div className="flex-1 flex flex-col min-h-0">
              <div className="flex-1 overflow-hidden rounded-2xl  backdrop-blur-sm">
                {view === "month" && (
                  <MonthView
                    currentDate={currentDate}
                    appointments={mockAppointments}
                    onSelectDate={handleSelectDate}
                    onSelectAppointment={handleSelectAppointment}
                    selectedDate={selectedDate}
                  />
                )}
                {view === "week" && (
                  <WeekView
                    currentDate={currentDate}
                    appointments={mockAppointments}
                    onSelectDate={handleSelectDate}
                    onSelectAppointment={handleSelectAppointment}
                    selectedDate={selectedDate}
                  />
                )}
                {view === "day" && (
                  <DayView
                    currentDate={currentDate}
                    appointments={mockAppointments}
                    onSelectAppointment={handleSelectAppointment}
                  />
                )}
                {view === "list" && (
                  <ListView
                    appointments={mockAppointments}
                    onSelectAppointment={handleSelectAppointment}
                  />
                )}
              </div>
            </div>

            {/* Desktop Details panel */}
            {!isMobile && (
              <motion.div
                className="w-[380px] min-h-0 ml-4 py-2 "
                initial={fadeInUp.initial}
                animate={fadeInUp.animate}
                exit={fadeInUp.exit}
                transition={fadeInUp.transition}
              >
                <div className="h-full overflow-y-auto scrollbar-hide rounded-2xl  backdrop-blur-sm transition-all duration-300">
                  <AppointmentDetails
                    appointment={selectedAppointment}
                    onClose={() => setSelectedAppointment(null)}
                  />
                </div>
              </motion.div>
            )}
          </motion.div>
        </motion.div>
      </motion.div>

      {/* Mobile Details Modal */}
      {isMobile && showMobileDetails && (
        <motion.div
          className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm"
          initial={fadeInUp.initial}
          animate={fadeInUp.animate}
          exit={fadeInUp.exit}
          transition={fadeInUp.transition}
        >
          <div className="fixed inset-x-0 bottom-0 h-[90vh] bg-background rounded-t-3xl animate-in slide-in-from-bottom duration-300 flex flex-col">
            {selectedAppointment ? (
              <AppointmentDetails
                appointment={selectedAppointment}
                onClose={handleCloseMobileDetails}
              />
            ) : (
              <div className="flex flex-1 items-center justify-center p-6">
                <span className="text-center text-muted-foreground">
                  No hay cita seleccionada.
                </span>
              </div>
            )}
          </div>
        </motion.div>
      )}
    </motion.div>
  );
};
