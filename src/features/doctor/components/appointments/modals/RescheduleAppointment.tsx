import React, { useState, useMemo, useRef } from "react";
import { MCModalBase } from "@/shared/components/MCModalBase";
import { useTranslation } from "react-i18next";
import { useGlobalUIStore } from "@/stores/useGlobalUIStore";
import { useAppointmentStore } from "@/stores/useAppointmentStore";
import type { RescheduleAppointmentByDoctorFormData } from "@/schema/appointment.schema";
import { rescheduleAppointmentByDoctorSchema } from "@/schema/appointment.schema";
import MCFormWrapper from "@/shared/components/forms/MCFormWrapper";
import { Calendar } from "@/shared/ui/calendar";
import { MCUserAvatar } from "@/shared/navigation/userMenu/MCUserAvatar";
import { Avatar, AvatarFallback, AvatarImage } from "@/shared/ui/avatar";
import MCButton from "@/shared/components/forms/MCButton";
import { format, addDays, startOfWeek, isSameDay } from "date-fns";
import { es, enUS } from "date-fns/locale";
import { CalendarIcon } from "lucide-react";
import {
  MorphingPopover,
  MorphingPopoverTrigger,
  MorphingPopoverContent,
} from "@/shared/ui/morphing-popover";
import { cn } from "@/lib/utils";

interface RescheduleAppointmentProps {
  children?: React.ReactNode;
  appointmentId: string;
}

const timeSlots = [
  "9:00 am",
  "9:30 am",
  "10:00 am",
  "10:30 am",
  "11:00 am",
  "11:30 am",
  "12:00 pm",
  "12:30 pm",
  "1:00 pm",
  "1:30 pm",
  "2:00 pm",
  "2:30 pm",
  "3:00 pm",
  "3:30 pm",
  "4:00 pm",
  "4:30 pm",
];

function RescheduleAppointment({
  children,
  appointmentId,
}: RescheduleAppointmentProps) {
  const { t, i18n } = useTranslation("doctor");
  const currentLocale = i18n.language === "es" ? es : enUS;
  const setToast = useGlobalUIStore((state) => state.setToast);
  const setRescheduleAppointmentByDoctor = useAppointmentStore(
    (state) => state.setRescheduleAppointmentByDoctor,
  );
  const appointment = useAppointmentStore(
    (state) => state.rescheduleAppointmentByDoctor,
  );
  const submitRef = useRef<(() => void) | null>(null);
  const [calendarOpen, setCalendarOpen] = useState(false);
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  const [selectedTime, setSelectedTime] = useState<string>("");

  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const formatDateForStorage = (date: Date): string => {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const day = String(date.getDate()).padStart(2, "0");
    return `${year}-${month}-${day}`;
  };

  const convertTimeToHour = (timeSlot: string): string => {
    const time = timeSlot.replace(/\s*(a\.m\.|p\.m\.)/g, "");
    const [hours, minutes] = time.split(":");
    let hour24 = parseInt(hours);
    if (timeSlot.includes("p.m.") && hour24 !== 12) hour24 += 12;
    else if (timeSlot.includes("a.m.") && hour24 === 12) hour24 = 0;
    return `${hour24.toString().padStart(2, "0")}:${minutes}`;
  };

  const handleSubmit = (data: any) => {
    console.log("Datos enviados desde modal:", data);
    if (setRescheduleAppointmentByDoctor) {
      setRescheduleAppointmentByDoctor({
        appointmentId: data.appointmentId,
        newDate: data.newDate,
        newTime: data.newTime,
      });
    }
  };

  const handleConfirm = () => {
    submitRef.current?.();
    setToast({
      message: t(
        "appointment.rescheduleSuccess",
        "Cita reprogramada correctamente",
      ),
      type: "success",
      open: true,
    });
    console.log(
      "Cita reprogramada:",
      appointmentId,
      selectedDate,
      selectedTime,
    );
  };

  const handleDateSelect = (date: Date | undefined) => {
    if (date) {
      setSelectedDate(date);
      setCalendarOpen(false);
    }
  };

  const weekStart = startOfWeek(selectedDate, { weekStartsOn: 0 });
  const weekDays = Array.from({ length: 7 }, (_, i) => addDays(weekStart, i));

  const WeekDaySelector = () => (
    <div className="grid grid-cols-7 gap-1 text-center">
      {weekDays.map((day, index) => {
        const isPast = day < today;
        return (
          <div key={index} className="flex flex-col items-center">
            <span className="text-xs text-muted-foreground mb-1">
              {format(day, "EEE", { locale: currentLocale })}
            </span>
            <MCButton
              type="button"
              variant={isSameDay(day, selectedDate) ? "primary" : "outline"}
              size="sm"
              disabled={isPast}
              className={cn(
                "w-10 h-10 rounded-full flex items-center justify-center text-sm font-medium transition-colors",
                !isSameDay(day, selectedDate) &&
                  !isPast &&
                  "hover:bg-time-slot-hover",
                isPast && "opacity-40 cursor-not-allowed",
              )}
              onClick={() => !isPast && handleDateSelect(day)}
            >
              {format(day, "d")}
            </MCButton>
          </div>
        );
      })}
    </div>
  );

  return (
    <MCModalBase
      id="rescheduleAppointment"
      title={t("appointment.rescheduleTitle", "Reprogramar cita")}
      trigger={children}
      description={t(
        "appointment.rescheduleDescription",
        "Selecciona la nueva fecha y hora para la cita. El paciente será notificado automáticamente.",
      )}
      triggerClassName="w-full flex-1"
      variant="decide"
      size="lg"
      onConfirm={handleConfirm}
      confirmText={t("appointment.confirmReschedule", "Reprogramar")}
    >
      <MCFormWrapper
        submitRef={submitRef}
        schema={rescheduleAppointmentByDoctorSchema(t)}
        onSubmit={handleSubmit}
        defaultValues={{
          appointmentId: appointment?.appointmentId || appointmentId,
          newDate: appointment?.newDate || "",
          newTime: appointment?.newTime || "",
        }}
      >
        <div className="space-y-6 px-3 pb-3">
          {/* Información del paciente */}
          <div className="bg-muted/30 rounded-2xl py-4 flex gap-6 items-start">
            <div className="flex items-start gap-3">
              <Avatar className="w-12 h-12">
                <AvatarImage src="" />
                <AvatarFallback className="bg-primary text-white">
                  JM
                </AvatarFallback>
              </Avatar>
              <div className="">
                <p className="font-medium text-primary">Jackson Martínez</p>
                <p className="text-sm text-muted-foreground">
                  Rehabilitación post-lesión
                </p>
              </div>
            </div>
            <div className="flex flex-wrap gap-8">
              <div className="flex flex-col">
                <p className="font-medium text-primary">Fecha actual</p>
                <p className="text-sm text-muted-foreground">12/10/2025</p>
              </div>
              <div className="flex flex-col">
                <p className="font-medium text-primary">Hora actual</p>
                <p className="text-sm text-muted-foreground">
                  9:00 AM - 9:45 AM
                </p>
              </div>
            </div>
          </div>

          {/* Selección de fecha */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="font-medium capitalize text-primary">
                {format(
                  selectedDate,
                  i18n.language === "en" ? "MMMM yyyy" : "MMMM 'de' yyyy",
                  { locale: currentLocale },
                )}
              </span>
              <MorphingPopover
                open={calendarOpen}
                onOpenChange={setCalendarOpen}
                className="relative"
              >
                <MorphingPopoverTrigger>
                  <MCButton
                    type="button"
                    variant="outline"
                    size="ml"
                    className="rounded-full h-10 w-10"
                    icon={<CalendarIcon className="h-6 w-6" />}
                  />
                </MorphingPopoverTrigger>
                <MorphingPopoverContent className="w-auto p-0 right-0 top-10 z-[9999] rounded-3xl">
                  <Calendar
                    mode="single"
                    selected={selectedDate}
                    onSelect={handleDateSelect}
                    disabled={{ before: new Date() }}
                    initialFocus
                    className="p-3 pointer-events-auto"
                  />
                </MorphingPopoverContent>
              </MorphingPopover>
            </div>
            <WeekDaySelector />
          </div>

          {/* Selección de horarios */}
          <div className="space-y-3">
            <h4 className="font-medium text-primary">
              {t("appointments.availableTimes", "Horarios Disponibles")}
            </h4>
            <div className="rounded bg-muted/40 p-3">
              <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 gap-2">
                {timeSlots.map((time) => (
                  <MCButton
                    key={time}
                    type="button"
                    variant={selectedTime === time ? "primary" : "outline"}
                    size="sm"
                    className="h-8 text-xs"
                    onClick={() => setSelectedTime(time)}
                  >
                    {time}
                  </MCButton>
                ))}
              </div>
            </div>
          </div>

          {/* Resumen de nueva fecha y hora */}
          {selectedTime && (
            <div className="rounded-xl bg-accent/30 dark:bg-primary/5 p-4 space-y-3 mt-4">
              <p className="text-sm font-semibold text-foreground">
                Nueva Fecha y Hora
              </p>
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">
                  Nueva fecha
                </span>
                <span className="text-sm font-medium text-foreground">
                  {format(selectedDate, "dd/MM/yyyy")}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">
                  Nueva hora
                </span>
                <span className="text-sm font-medium text-foreground">
                  {selectedTime}
                </span>
              </div>
            </div>
          )}

          <input type="hidden" name="appointmentId" value={appointmentId} />
          <input
            type="hidden"
            name="newDate"
            value={formatDateForStorage(selectedDate)}
          />
          <input
            type="hidden"
            name="newTime"
            value={convertTimeToHour(selectedTime)}
          />
        </div>
      </MCFormWrapper>
    </MCModalBase>
  );
}

export default RescheduleAppointment;
