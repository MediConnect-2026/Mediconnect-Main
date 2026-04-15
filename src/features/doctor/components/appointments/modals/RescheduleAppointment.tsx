import React, { useCallback, useEffect, useRef, useState } from "react";
import { MCModalBase } from "@/shared/components/MCModalBase";
import { useTranslation } from "react-i18next";
import { useGlobalUIStore } from "@/stores/useGlobalUIStore";
import { rescheduleAppointmentByDoctorSchema } from "@/schema/appointment.schema";
import MCFormWrapper from "@/shared/components/forms/MCFormWrapper";
import { Calendar } from "@/shared/ui/calendar";
import { Avatar, AvatarFallback, AvatarImage } from "@/shared/ui/avatar";
import MCButton from "@/shared/components/forms/MCButton";
import { format, addDays, startOfWeek, isSameDay } from "date-fns";
import { es, enUS } from "date-fns/locale";
import { CalendarIcon, AlertCircle, Loader2 } from "lucide-react";
import {
  MorphingPopover,
  MorphingPopoverTrigger,
  MorphingPopoverContent,
} from "@/shared/ui/morphing-popover";
import { cn } from "@/lib/utils";
import { getCitaById } from "@/services/api/appointments.service";
import { doctorService } from "@/shared/navigation/userMenu/editProfile/doctor/services";
import { useRescheduleAppointment } from "@/lib/hooks/useAppointmentMutations";
import type { CitaDetalle } from "@/types/AppointmentTypes";
import { formatTimeTo12h } from "@/utils/appointmentMapper";

// ─── Types ────────────────────────────────────────────────────────────────────

interface RescheduleAppointmentProps {
  children?: React.ReactNode;
  appointmentId: string;
  /** Called after a successful reschedule (e.g. to refresh a parent list) */
  onSuccess?: () => void;
}

interface SlotItem {
  /** Display label already formatted by the backend (e.g. "10:00 AM") */
  label: string;
  /** 24-hour value ("HH:mm") sent to the API */
  hora24: string;
  /** horarioId required by PATCH /citas/{id}/reprogramar */
  horarioId: number;
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

const formatDateForStorage = (date: Date): string => {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, "0");
  const d = String(date.getDate()).padStart(2, "0");
  return `${y}-${m}-${d}`;
};

// ─── Component ────────────────────────────────────────────────────────────────

function RescheduleAppointment({
  children,
  appointmentId,
  onSuccess,
}: RescheduleAppointmentProps) {
  const { t, i18n } = useTranslation("doctor");
  const currentLocale = i18n.language === "es" ? es : enUS;
  const setToast = useGlobalUIStore((state) => state.setToast);
  const submitRef = useRef<(() => void) | null>(null);

  // ── Calendar state ──────────────────────────────────────────────────────────
  const [calendarOpen, setCalendarOpen] = useState(false);
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  const [selectedSlot, setSelectedSlot] = useState<SlotItem | null>(null);

  // ── Appointment data (header info) ──────────────────────────────────────────
  const [citaData, setCitaData] = useState<CitaDetalle | null>(null);
  const [isLoadingCita, setIsLoadingCita] = useState(false);

  // ── Available slots ─────────────────────────────────────────────────────────
  const [slots, setSlots] = useState<SlotItem[]>([]);
  const [isLoadingSlots, setIsLoadingSlots] = useState(false);
  const [slotsError, setSlotsError] = useState<string | null>(null);

  // ── Submit error banner ──────────────────────────────────────────────────────
  const [submitError, setSubmitError] = useState<string | null>(null);

  const { mutate: reschedule, isPending } = useRescheduleAppointment();

  const today = new Date();
  today.setHours(0, 0, 0, 0);

  // ── Load appointment data on mount ──────────────────────────────────────────
  useEffect(() => {
    if (!appointmentId) return;
    let cancelled = false;

    const load = async () => {
      setIsLoadingCita(true);
      try {
        const res = await getCitaById(appointmentId);
        if (cancelled) return;
        if (res.success && res.data) {
          const cita = Array.isArray(res.data?.cita)
            ? res.data?.cita[0]
            : res.data?.cita;
          if (cita) setCitaData(cita);
        }
      } catch (err) {
        console.error("Error loading appointment data:", err);
      } finally {
        if (!cancelled) setIsLoadingCita(false);
      }
    };

    load();
    return () => { cancelled = true; };
  }, [appointmentId]);

  // ── Load slots whenever date or servicioId changes ──────────────────────────
  const loadSlots = useCallback(async (date: Date, servicioId: number) => {
    setIsLoadingSlots(true);
    setSlotsError(null);
    setSelectedSlot(null);

    try {
      const res = await doctorService.getSlotsAvailableForService(servicioId, {
        fecha: formatDateForStorage(date),
      });

      if (res?.data && Array.isArray(res.data)) {
        setSlots(
          res.data.map((s) => ({
            label: s.horaInicioFormateada,
            hora24: s.horaInicio,
            horarioId: s.horarioId,
          }))
        );
      } else {
        setSlots([]);
      }
    } catch (err) {
      console.error("Error loading slots:", err);
      setSlotsError("No se pudieron cargar los horarios disponibles");
      setSlots([]);
    } finally {
      setIsLoadingSlots(false);
    }
  }, []);

  useEffect(() => {
    const servicioId = citaData?.servicio?.id;
    if (!servicioId) return;
    loadSlots(selectedDate, servicioId);
  }, [selectedDate, citaData?.servicio?.id, loadSlots]);

  // ── Handlers ─────────────────────────────────────────────────────────────────

  const handleDateSelect = (date: Date | undefined) => {
    if (date) {
      setSelectedDate(date);
      setCalendarOpen(false);
    }
  };

  const handleConfirm = () => {
    if (!selectedSlot) return;
    setSubmitError(null);

    reschedule(
      {
        appointmentId,
        horarioId: selectedSlot.horarioId,
        fecha: formatDateForStorage(selectedDate),
        hora: selectedSlot.hora24,
      },
      {
        onSuccess: () => {
          onSuccess?.();
        },
        onError: (err: unknown) => {
          const msg =
            err instanceof Error
              ? err.message
              : "Error al reprogramar la cita";
          setSubmitError(msg);
          // Also show a toast via store for consistency
          setToast({ message: msg, type: "error", open: true });
        },
      }
    );
  };

  // ── Week day grid ─────────────────────────────────────────────────────────────
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
                !isSameDay(day, selectedDate) && !isPast && "hover:bg-time-slot-hover",
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

  // ── Derived display values 
  const patientName = citaData
    ? `${citaData.paciente.nombre} ${citaData.paciente.apellido}`
    : "—";
  const patientInitials = citaData
    ? `${citaData.paciente.nombre[0] ?? ""}${citaData.paciente.apellido[0] ?? ""}`
    : "—";
  const patientAvatar = citaData?.paciente?.usuario?.fotoPerfil ?? "";
  const servicioNombre = citaData?.servicio?.nombre ?? "—";
  const fechaActual = citaData?.fechaInicio
    ? format(new Date(citaData.fechaInicio + "T00:00:00"), "dd/MM/yyyy")
    : "—";
  const horaActual = citaData
    ? `${formatTimeTo12h(citaData.horaInicio?.slice(0, 5))} – ${formatTimeTo12h(citaData.horaFin?.slice(0, 5))}`
    : "—";

  const canConfirm = !!selectedSlot && !isPending;

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
      confirmText={
        isPending
          ? t("appointment.rescheduling", "Reprogramando…")
          : t("appointment.confirmReschedule", "Reprogramar")
      }
      disabledConfirm={!canConfirm}
    >
      {/* Hidden form wrapper to satisfy MCModalBase's submitRef pattern */}
      <MCFormWrapper
        submitRef={submitRef}
        schema={rescheduleAppointmentByDoctorSchema(t)}
        onSubmit={() => { }}
        defaultValues={{
          appointmentId,
          newDate: formatDateForStorage(selectedDate),
          newTime: selectedSlot?.hora24 ?? "",
        }}
      >
        <div className="space-y-6 px-3 pb-3">

          {/* ── Patient info header ── */}
          <div className="bg-muted/30 rounded-2xl py-4 px-3 flex gap-6 items-start">
            {isLoadingCita ? (
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <Loader2 className="w-4 h-4 animate-spin" />
                Cargando información…
              </div>
            ) : (
              <>
                <div className="flex items-start gap-3">
                  <Avatar className="w-12 h-12">
                    <AvatarImage src={patientAvatar} />
                    <AvatarFallback className="bg-primary text-white uppercase">
                      {patientInitials}
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <p className="font-medium text-primary">{patientName}</p>
                    <p className="text-sm text-muted-foreground">{servicioNombre}</p>
                  </div>
                </div>
                <div className="flex flex-wrap gap-6 ml-auto">
                  <div className="flex flex-col">
                    <p className="font-medium text-primary text-sm">Fecha actual</p>
                    <p className="text-sm text-muted-foreground">{fechaActual}</p>
                  </div>
                  <div className="flex flex-col">
                    <p className="font-medium text-primary text-sm">Hora actual</p>
                    <p className="text-sm text-muted-foreground">{horaActual}</p>
                  </div>
                </div>
              </>
            )}
          </div>

          {/* ── Date selector ── */}
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

          {/* ── Available time slots ── */}
          <div className="space-y-3">
            <h4 className="font-medium text-primary">
              {t("appointments.availableTimes", "Horarios Disponibles")}
            </h4>

            {isLoadingSlots ? (
              <div className="flex items-center gap-2 text-sm text-muted-foreground py-4 justify-center">
                <Loader2 className="w-4 h-4 animate-spin" />
                Cargando horarios…
              </div>
            ) : slotsError ? (
              <div className="flex items-center gap-2 text-sm text-amber-600 rounded-lg bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-700 p-3">
                <AlertCircle className="w-4 h-4 shrink-0" />
                {slotsError}
              </div>
            ) : slots.length === 0 ? (
              <p className="text-sm text-muted-foreground text-center py-4">
                No hay horarios disponibles para esta fecha.
              </p>
            ) : (
              <div className="rounded bg-muted/40 p-3">
                <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 gap-2">
                  {slots.map((slot) => (
                    <MCButton
                      key={`${slot.horarioId}-${slot.hora24}`}
                      type="button"
                      variant={
                        selectedSlot?.horarioId === slot.horarioId
                          ? "primary"
                          : "outline"
                      }
                      size="sm"
                      className="h-8 text-xs"
                      onClick={() => setSelectedSlot(slot)}
                    >
                      {slot.label}
                    </MCButton>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* ── Summary card ── */}
          {selectedSlot && (
            <div className="rounded-xl bg-accent/30 dark:bg-primary/5 p-4 space-y-3">
              <p className="text-sm font-semibold text-foreground">Nueva Fecha y Hora</p>
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">Nueva fecha</span>
                <span className="text-sm font-medium text-foreground">
                  {format(selectedDate, "dd/MM/yyyy")}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">Nueva hora</span>
                <span className="text-sm font-medium text-foreground">
                  {selectedSlot.label}
                </span>
              </div>
            </div>
          )}

          {/* ── Submit error banner ── */}
          {submitError && (
            <div className="flex items-center gap-2 rounded-lg bg-red-500/10 border border-red-500/30 px-3 py-2 text-sm text-red-600">
              <AlertCircle className="w-4 h-4 shrink-0" />
              {submitError}
            </div>
          )}

          {/* Hidden fields keep MCFormWrapper happy */}
          <input type="hidden" name="appointmentId" value={appointmentId} />
          <input type="hidden" name="newDate" value={formatDateForStorage(selectedDate)} />
          <input type="hidden" name="newTime" value={selectedSlot?.hora24 ?? ""} />
        </div>
      </MCFormWrapper>
    </MCModalBase>
  );
}

export default RescheduleAppointment;
