import { useState } from "react";
import { useFormContext } from "react-hook-form";
import { format, addDays, startOfWeek, isSameDay } from "date-fns";
import { es, enUS } from "date-fns/locale";
import { MCModalBase } from "@/shared/components/MCModalBase";
import { Calendar } from "@/shared/ui/calendar";
import MCTextArea from "@/shared/components/forms/MCTextArea";
import MCSelect from "@/shared/components/forms/MCSelect";
import {
  MorphingPopover,
  MorphingPopoverTrigger,
  MorphingPopoverContent,
} from "@/shared/ui/morphing-popover";
import { appointmentSchema } from "@/schema/appointment.schema";
import { useTranslation } from "react-i18next";
import { useAppointmentStore } from "@/stores/useAppointmentStore";
import {
  CalendarIcon,
  Minus,
  Plus,
  BadgeCheck,
  ChevronRight,
} from "lucide-react";
import MCButton from "@/shared/components/forms/MCButton";
import { cn } from "@/lib/utils";
import type { scheduleAppointment } from "@/types/AppointmentTypes";
import { MCFilterPopover } from "@/shared/components/filters/MCFilterPopover";
import ServiceCards from "./ServiceCards";
import { useFiltersStore } from "@/stores/useFiltersStore";
import FilterAppointments from "@/features/patient/components/filters/FilterAppointments";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import MCFormWrapper from "@/shared/components/forms/MCFormWrapper";
import type React from "react"; // Cambia el import de React

interface Service {
  id: string;
  name: string;
  description: string;
  price: string;
  duration: string;
  modality: string;
  location: string;
  timeSlots: string[];
}

const SERVICES: Service[] = [
  {
    id: "1",
    name: "Consulta dermatológica general",
    description: "Evaluación completa de la piel",
    price: "RD$1500",
    duration: "30 minutos",
    modality: "Modalidad Mixta",
    location: "Av. Principal 123, San José",
    timeSlots: [
      "10:00 a.m.",
      "10:30 a.m.",
      "11:00 a.m.",
      "11:30 a.m.",
      "12:00 p.m.",
      "12:30 p.m.",
      "1:00 p.m.",
      "1:30 p.m.",
      "2:00 p.m.",
      "2:30 p.m.",
      "3:00 p.m.",
      "3:30 p.m.",
      "4:00 p.m.",
      "4:30 p.m.",
    ],
  },
  {
    id: "2",
    name: "Tratamiento de rejuvenecimiento facial",
    description: "Tratamiento con láser y productos especializados",
    price: "RD$1500",
    duration: "30 minutos",
    modality: "Modalidad Mixta",
    location: "Av. Principal 123, San José",
    timeSlots: [
      "10:00 a.m.",
      "10:30 a.m.",
      "11:00 a.m.",
      "11:30 a.m.",
      "12:00 p.m.",
      "12:30 p.m.",
      "1:00 p.m.",
      "1:30 p.m.",
      "2:00 p.m.",
      "2:30 p.m.",
      "3:00 p.m.",
      "3:30 p.m.",
      "4:00 p.m.",
      "4:30 p.m.",
    ],
  },
];

const INSURANCE_OPTIONS = [
  { value: "universal", label: "Seguro Universal" },
  { value: "humano", label: "Humano Seguros" },
  { value: "mapfre", label: "Mapfre Salud" },
  { value: "particular", label: "Particular" },
];

interface ScheduleAppointmentDialogProps {
  idProvider: string;
  children: React.ReactNode | React.ComponentType;
}

interface ScheduleAppointmentFormProps {
  selectedDate: Date;
  setSelectedDate: React.Dispatch<React.SetStateAction<Date>>;
  weekStart: Date;
  setWeekStart: React.Dispatch<React.SetStateAction<Date>>;
  patients: number;
  setPatients: React.Dispatch<React.SetStateAction<number>>;
  selectedTimeSlots: Record<string, string>;
  setSelectedTimeSlots: React.Dispatch<
    React.SetStateAction<Record<string, string>>
  >;
  selectedModality: Record<string, "presencial" | "teleconsulta">;
  setSelectedModality: React.Dispatch<
    React.SetStateAction<Record<string, "presencial" | "teleconsulta">>
  >;
}

// Componente interno que usa el FormContext
function ScheduleAppointmentForm({
  selectedDate,
  setSelectedDate,
  weekStart,
  setWeekStart,
  patients,
  setPatients,
  selectedTimeSlots,
  setSelectedTimeSlots,
  selectedModality,
  setSelectedModality,
}: ScheduleAppointmentFormProps) {
  const { t, i18n } = useTranslation("patient");
  const currentLocale = i18n.language === "es" ? es : enUS;
  const { filters, resetFilters } = useFiltersStore();
  const [calendarOpen, setCalendarOpen] = useState(false);

  // Ahora podemos usar useFormContext porque estamos dentro del MCFormWrapper
  const { setValue, watch } = useFormContext<scheduleAppointment>();

  const activeFiltersCount = [
    filters.serviceTypes.length,
    filters.specialties.length,
    filters.modalities.length,
    filters.priceRange[0] !== 0 || filters.priceRange[1] !== 10000 ? 1 : 0,
    filters.durations.length,
  ].reduce((a, b) => a + (b ? 1 : 0), 0);

  const weekDays = Array.from({ length: 7 }, (_, i) => addDays(weekStart, i));

  const handleDateSelect = (date: Date | undefined) => {
    if (date) {
      setSelectedDate(date);
      setWeekStart(startOfWeek(date, { weekStartsOn: 0 }));
      setValue("date", format(date, "yyyy-MM-dd"));
      setCalendarOpen(false);
    }
  };

  const convertTimeToHour = (timeSlot: string): string => {
    const time = timeSlot.replace(/\s*(a\.m\.|p\.m\.)/g, "");
    const [hours, minutes] = time.split(":");
    let hour24 = parseInt(hours);

    if (timeSlot.includes("p.m.") && hour24 !== 12) {
      hour24 += 12;
    } else if (timeSlot.includes("a.m.") && hour24 === 12) {
      hour24 = 0;
    }

    return `${hour24.toString().padStart(2, "0")}:${minutes}`;
  };

  const handleTimeSlotSelect = (serviceId: string, time: string) => {
    if (time === "") {
      setSelectedTimeSlots((prev) => {
        const newSlots = { ...prev };
        delete newSlots[serviceId];
        return newSlots;
      });
      setSelectedModality((prev) => {
        const newModality = { ...prev };
        delete newModality[serviceId];
        return newModality;
      });
      setValue("time", "");
    } else {
      const hasOtherSelection = Object.keys(selectedTimeSlots).some(
        (id) => id !== serviceId && selectedTimeSlots[id],
      );

      if (hasOtherSelection) {
        setSelectedTimeSlots({ [serviceId]: time });
        setSelectedModality({});
      } else {
        setSelectedTimeSlots((prev) => ({ ...prev, [serviceId]: time }));
      }
      setValue("time", convertTimeToHour(time));
    }
  };

  const handleModalitySelect = (
    serviceId: string,
    modality: "presencial" | "teleconsulta",
  ) => {
    setSelectedModality((prev) => ({ ...prev, [serviceId]: modality }));
    setValue("selectedModality", modality);
  };

  const isSubmitDisabled =
    Object.keys(selectedTimeSlots).filter(
      (serviceId) => selectedTimeSlots[serviceId],
    ).length === 0 ||
    Object.keys(selectedModality).filter(
      (serviceId) => selectedModality[serviceId],
    ).length === 0 ||
    !watch("insuranceProvider") ||
    (watch("reason")?.length || 0) < 10;

  const DoctorHeader = () => {
    const doctorAvatar =
      "https://images.unsplash.com/photo-1612349317150-e413f6a5b16d?w=400&h=400&fit=crop";

    return (
      <div className="flex items-center gap-4">
        <img
          src={doctorAvatar}
          alt={t("doctors.profile", "Dr. Cristiano Ronaldo")}
          className="w-20 h-20 rounded-full object-cover"
        />
        <div>
          <div className="flex items-center gap-2">
            <h3 className="text-lg font-semibold text-primary">
              {t("doctors.profile")}
            </h3>
            <BadgeCheck className="w-5 h-5 text-background" fill="#8bb1ca" />
          </div>
          <p className="text-primary">{t("doctors.specialty")}</p>
        </div>
      </div>
    );
  };

  const PatientCounter = () => (
    <div className="flex items-center justify-between text-primary">
      <span className="font-medium">
        {patients} {t("appointments.patient")}
        {patients > 1 ? t("appointments.patient_plural") : ""}
      </span>
      <div className="flex items-center gap-2">
        <MCButton
          type="button"
          variant="outline"
          size="sm"
          className="h-8 w-8 rounded-full"
          onClick={() => setPatients(Math.max(1, patients - 1))}
          disabled={patients <= 1}
          icon={<Minus className="h-4 w-4" />}
        />
        <MCButton
          type="button"
          variant="outline"
          size="sm"
          className="h-8 w-8 rounded-full"
          onClick={() => setPatients(patients + 1)}
          icon={<Plus className="h-4 w-4" />}
        />
      </div>
    </div>
  );

  const WeekDaySelector = () => (
    <div className="grid grid-cols-7 gap-1 text-center">
      {weekDays.map((day, index) => (
        <div key={index} className="flex flex-col items-center">
          <span className="text-xs text-muted-foreground mb-1">
            {format(day, "EEE", { locale: currentLocale })}
          </span>
          <MCButton
            type="button"
            variant={isSameDay(day, selectedDate) ? "primary" : "outline"}
            size="sm"
            className={cn(
              "w-10 h-10 rounded-full flex items-center justify-center text-sm font-medium transition-colors",
              !isSameDay(day, selectedDate) && "hover:bg-time-slot-hover",
            )}
            onClick={() => setSelectedDate(day)}
          >
            {format(day, "d")}
          </MCButton>
        </div>
      ))}
    </div>
  );

  return (
    <div className="px-6 pb-6 space-y-6">
      {/* Doctor Info */}
      <DoctorHeader />

      {/* Insurance Selection */}
      <div className="space-y-2">
        <MCSelect
          name="insuranceProvider"
          label={t("insurance.title")}
          options={INSURANCE_OPTIONS.map((option) => ({
            value: option.value,
            label: t(`insurance.${option.value}`, option.label),
          }))}
          placeholder={t("insurance.select")}
          required
        />
      </div>

      {/* Reason for Visit */}
      <div className="space-y-2">
        <MCTextArea
          name="reason"
          label={t("appointments.reason")}
          className="rounded-2xl"
          placeholder={t("appointments.reasonPlaceholder")}
          charLimit={100}
          showCharCount
        />
      </div>

      {/* Patient Counter */}
      <PatientCounter />

      {/* Date Selection */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <span className="font-medium capitalize text-primary">
            {format(
              selectedDate,
              i18n.language === "en" ? "MMMM yyyy" : "MMMM 'de' yyyy",
              { locale: currentLocale },
            )}
          </span>
          <div className="flex items-center gap-2">
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
                  initialFocus
                  compact
                  className="p-3 pointer-events-auto"
                />
              </MorphingPopoverContent>
            </MorphingPopover>
          </div>
        </div>

        <WeekDaySelector />
      </div>

      {/* Filters */}
      <div className="flex gap-2">
        <MCFilterPopover
          activeFiltersCount={activeFiltersCount}
          onClearFilters={resetFilters}
        >
          <FilterAppointments />
        </MCFilterPopover>
      </div>

      {/* Service Cards */}
      <ServiceCards
        services={SERVICES}
        selectedTimeSlots={selectedTimeSlots}
        selectedModality={selectedModality}
        onTimeSlotSelect={handleTimeSlotSelect}
        onModalitySelect={handleModalitySelect}
      />

      {/* Submit Button */}
      <MCButton type="submit" className="w-full" disabled={isSubmitDisabled}>
        {t("appointments.next", "Siguiente")}
        <ChevronRight className="ml-2 h-5 w-5" />
      </MCButton>
    </div>
  );
}

function ScheduleAppointmentDialog({
  idProvider,
  children,
}: ScheduleAppointmentDialogProps) {
  const { t } = useTranslation("patient");
  const navigate = useNavigate();
  const addAppointment = useAppointmentStore((state) => state.addAppointment);

  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  const [weekStart, setWeekStart] = useState<Date>(
    startOfWeek(new Date(), { weekStartsOn: 0 }),
  );
  const [patients, setPatients] = useState(1);
  const [selectedTimeSlots, setSelectedTimeSlots] = useState<
    Record<string, string>
  >({});
  const [selectedModality, setSelectedModality] = useState<
    Record<string, "presencial" | "teleconsulta">
  >({});

  const triggerNode = (
    <div className="w-full h-full">
      {typeof children === "function" ||
      (typeof children === "object" &&
        (children as any)?.prototype?.isReactComponent)
        ? (() => {
            const Comp = children as React.ComponentType;
            return <Comp />;
          })()
        : children}
    </div>
  );

  const convertTimeToHour = (timeSlot: string): string => {
    const time = timeSlot.replace(/\s*(a\.m\.|p\.m\.)/g, "");
    const [hours, minutes] = time.split(":");
    let hour24 = parseInt(hours);

    if (timeSlot.includes("p.m.") && hour24 !== 12) {
      hour24 += 12;
    } else if (timeSlot.includes("a.m.") && hour24 === 12) {
      hour24 = 0;
    }

    return `${hour24.toString().padStart(2, "0")}:${minutes}`;
  };

  const onSubmit = (data: scheduleAppointment) => {
    const selectedServices = Object.keys(selectedTimeSlots).filter(
      (serviceId) => selectedTimeSlots[serviceId],
    );

    if (selectedServices.length === 0) {
      toast.error(
        t("appointments.noServiceSelected", "Please select a service"),
      );
      return;
    }

    const firstServiceWithTime = selectedServices[0];
    const selectedTimeSlot = selectedTimeSlots[firstServiceWithTime];
    const selectedModalityForService = selectedModality[firstServiceWithTime];

    if (!selectedModalityForService) {
      toast.error(
        t("appointments.noModalitySelected", "Please select a modality"),
      );
      return;
    }

    const appointmentData: scheduleAppointment = {
      date: format(selectedDate, "yyyy-MM-dd"),
      time: convertTimeToHour(selectedTimeSlot),
      reason: data.reason,
      insuranceProvider: data.insuranceProvider,
      selectedModality: selectedModalityForService,
      numberOfSessions: patients,
    };

    addAppointment(appointmentData);
    console.log(appointmentData);

    navigate("/patient/schedule-appointment");
  };

  return (
    <MCModalBase
      id="schedule-appointment-modal"
      title={t("appointments.schedule", "Agendar Cita")}
      trigger={triggerNode}
      triggerClassName="w-full h-full"
      size="wider"
    >
      <MCFormWrapper
        schema={appointmentSchema(t)}
        defaultValues={{
          date: format(new Date(), "yyyy-MM-dd"),
          time: "",
          selectedModality: "presencial" as const,
          numberOfSessions: 1,
          reason: "",
          insuranceProvider: "",
        }}
        onSubmit={onSubmit}
      >
        <ScheduleAppointmentForm
          selectedDate={selectedDate}
          setSelectedDate={setSelectedDate}
          weekStart={weekStart}
          setWeekStart={setWeekStart}
          patients={patients}
          setPatients={setPatients}
          selectedTimeSlots={selectedTimeSlots}
          setSelectedTimeSlots={setSelectedTimeSlots}
          selectedModality={selectedModality}
          setSelectedModality={setSelectedModality}
        />
      </MCFormWrapper>
    </MCModalBase>
  );
}

export default ScheduleAppointmentDialog;
