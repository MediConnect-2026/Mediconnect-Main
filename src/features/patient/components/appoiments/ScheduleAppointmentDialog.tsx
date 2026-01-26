import { useState } from "react";
import { format, addDays, startOfWeek, isSameDay } from "date-fns";
import { es } from "date-fns/locale";
import { enUS } from "date-fns/locale";
import { MCModalBase } from "@/shared/components/MCModalBase";
import { Calendar } from "@/shared/ui/calendar";
import MCTextArea from "@/shared/components/forms/MCTextArea";
import MCSelect from "@/shared/components/forms/MCSelect";
import {
  MorphingPopover,
  MorphingPopoverTrigger,
  MorphingPopoverContent,
} from "@/shared/ui/morphing-popover";
import MCFormWrapper from "@/shared/components/forms/MCFormWrapper";
import { appointmentSchema } from "@/schema/appointment.schema";
import { useTranslation } from "react-i18next";
import { useAppointmentStore } from "@/stores/useAppointmentStore";
import { CalendarIcon, Minus, Plus, BadgeCheck } from "lucide-react";
import MCButton from "@/shared/components/forms/MCButton";
import { cn } from "@/lib/utils";
import type { scheduleAppointment } from "@/types/AppointmentTypes";
import { MCFilterPopover } from "@/shared/components/filters/MCFilterPopover";
import ServiceCards from "./ServiceCards";
import { useFiltersStore } from "@/stores/useFiltersStore";
import FilterAppointments from "@/features/patient/components/filters/FilterAppointments";
import { useGlobalUIStore } from "@/stores/useGlobalUIStore";
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

const services: Service[] = [
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

interface ScheduleAppointmentDialogProps {
  idProvider: string;
  children: React.ReactNode | React.ComponentType;
}

function ScheduleAppointmentDialog({
  idProvider,
  children,
}: ScheduleAppointmentDialogProps) {
  const { t, i18n } = useTranslation("patient");
  const addAppointment = useAppointmentStore((state) => state.addAppointment);
  const currentLocale = i18n.language === "es" ? es : enUS;
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
  const [calendarOpen, setCalendarOpen] = useState(false);

  const weekDays = Array.from({ length: 7 }, (_, i) => addDays(weekStart, i));

  const handleDateSelect = (date: Date | undefined) => {
    if (date) {
      setSelectedDate(date);
      setWeekStart(startOfWeek(date, { weekStartsOn: 0 }));
      setCalendarOpen(false);
    }
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
    }
  };

  const handleModalitySelect = (
    serviceId: string,
    modality: "presencial" | "teleconsulta",
  ) => {
    setSelectedModality((prev) => ({ ...prev, [serviceId]: modality }));
  };

  const doctorAvatar =
    "https://images.unsplash.com/photo-1612349317150-e413f6a5b16d?w=400&h=400&fit=crop";

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

  const handleAppointmentSubmit = (data: any) => {
    const selectedServices = Object.keys(selectedTimeSlots).filter(
      (serviceId) => selectedTimeSlots[serviceId],
    );

    if (selectedServices.length === 0) {
      return;
    }

    const firstServiceWithTime = selectedServices[0];
    const selectedTimeSlot = selectedTimeSlots[firstServiceWithTime];
    const selectedModalityForService = selectedModality[firstServiceWithTime];

    if (!selectedModalityForService) {
      return;
    }

    const convertedTime = convertTimeToHour(selectedTimeSlot);

    const appointmentData: scheduleAppointment = {
      date: format(selectedDate, "yyyy-MM-dd"),
      time: convertedTime,
      reason: data.reason || "",
      insuranceProvider: data.insuranceProvider || "",
      selectedModality: selectedModalityForService,
      numberOfSessions: patients,
    };

    addAppointment(appointmentData);
  };

  const isSubmitDisabled =
    Object.keys(selectedTimeSlots).filter(
      (serviceId) => selectedTimeSlots[serviceId],
    ).length === 0 ||
    Object.keys(selectedModality).filter(
      (serviceId) => selectedModality[serviceId],
    ).length === 0;

  // Cuenta filtros activos (puedes ajustar la lógica según tus necesidades)
  const { filters, resetFilters } = useFiltersStore();
  const activeFiltersCount = [
    filters.serviceTypes.length,
    filters.specialties.length,
    filters.modalities.length,
    filters.priceRange[0] !== 0 || filters.priceRange[1] !== 10000 ? 1 : 0,
    filters.durations.length,
  ].reduce((a, b) => a + (b ? 1 : 0), 0);

  return (
    <MCModalBase
      id="schedule-appointment-modal"
      title={t("appointments.schedule", "Agendar Cita")}
      trigger={triggerNode}
      triggerClassName="w-full h-full"
      size="wider"
      actionOne={true}
    >
      <MCFormWrapper
        schema={appointmentSchema(t)}
        onSubmit={handleAppointmentSubmit}
      >
        <div className="px-6 pb-6 space-y-6">
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
                <BadgeCheck
                  className="w-5 h-5 text-background"
                  fill="#8bb1ca"
                />
              </div>
              <p className="text-primary">{t("doctors.specialty")}</p>
            </div>
          </div>

          <div className="space-y-2">
            <MCSelect
              name="insuranceProvider"
              label={t("insurance.title")}
              options={[
                {
                  value: "universal",
                  label: t("insurance.universal", "Seguro Universal"),
                },
                {
                  value: "humano",
                  label: t("insurance.humano", "Humano Seguros"),
                },
                {
                  value: "mapfre",
                  label: t("insurance.mapfre", "Mapfre Salud"),
                },
                {
                  value: "particular",
                  label: t("insurance.particular", "Particular"),
                },
              ]}
              placeholder={t("insurance.select")}
            />
          </div>

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
                      className=" rounded-full h-10 w-10"
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

            <div className="grid grid-cols-7 gap-1 text-center">
              {weekDays.map((day, index) => (
                <div key={index} className="flex flex-col items-center">
                  <span className="text-xs text-muted-foreground mb-1">
                    {format(day, "EEE", { locale: currentLocale })}
                  </span>
                  <MCButton
                    type="button"
                    variant={
                      isSameDay(day, selectedDate) ? "primary" : "outline"
                    }
                    size="sm"
                    className={cn(
                      "w-10 h-10 rounded-full flex items-center justify-center text-sm font-medium transition-colors",
                      !isSameDay(day, selectedDate) &&
                        "hover:bg-time-slot-hover",
                    )}
                    onClick={() => setSelectedDate(day)}
                  >
                    {format(day, "d")}
                  </MCButton>
                </div>
              ))}
            </div>
          </div>

          <div className="flex gap-2">
            <MCFilterPopover
              activeFiltersCount={activeFiltersCount}
              onClearFilters={resetFilters}
            >
              <FilterAppointments />
            </MCFilterPopover>
          </div>

          <ServiceCards
            services={services}
            selectedTimeSlots={selectedTimeSlots}
            selectedModality={selectedModality}
            onTimeSlotSelect={handleTimeSlotSelect}
            onModalitySelect={handleModalitySelect}
          />

          <MCButton
            type="submit"
            className="w-full"
            disabled={isSubmitDisabled}
          >
            {t("appointments.next", "Siguiente")}
          </MCButton>
        </div>
      </MCFormWrapper>
    </MCModalBase>
  );
}

export default ScheduleAppointmentDialog;
