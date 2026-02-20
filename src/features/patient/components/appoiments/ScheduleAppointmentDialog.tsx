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
import { MorphingDialogClose } from "@/shared/ui/morphing-dialog";
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
import FilterAppointments from "@/features/patient/components/filters/FilterAppointments";
import MCFormWrapper from "@/shared/components/forms/MCFormWrapper";
import { useState, useMemo, useCallback, useEffect, useRef } from "react";
import { useFormContext } from "react-hook-form";
import React from "react";

interface Service {
  id: string;
  name: string;
  description: string;
  price: string;
  duration: string;
  modality: "mixta" | "presencial" | "teleconsulta";
  modalityLabel: string;
  location: string;
  timeSlots: string[];
  serviceType?: string;
  specialty?: string;
  rating?: number;
  priceValue?: number;
}

interface AppointmentFilters {
  serviceTypes: string[];
  specialties: string[];
  modalities: string[];
  priceRange: [number, number];
  rating: number;
}

const getServices = (t: any): Service[] => [
  {
    id: "1",
    name: t("services.consultation"),
    description: t("services.evaluation"),
    price: "RD$1500",
    priceValue: 1500,
    duration: `30 ${t("services.duration")}`,
    modality: "presencial",
    modalityLabel: t("services.presencial"),
    location: t("services.location"),
    serviceType: "consultation",
    specialty: "cardiology",
    rating: 4.8,
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
    name: t("services.treatment"),
    description: t("services.laser"),
    price: "RD$2500",
    priceValue: 2500,
    duration: `45 ${t("services.duration")}`,
    modality: "mixta",
    modalityLabel: t("services.mixed"),
    location: t("services.location"),
    serviceType: "treatment",
    specialty: "dermatology",
    rating: 4.5,
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
    id: "3",
    name: t("services.therapy", "Terapia Psicológica"),
    description: t("services.therapyDesc", "Sesión de terapia individual"),
    price: "RD$1800",
    priceValue: 1800,
    duration: `50 ${t("services.duration")}`,
    modality: "teleconsulta",
    modalityLabel: t("services.virtual"),
    location: t("services.online"),
    serviceType: "therapy",
    specialty: "psychology",
    rating: 4.9,
    timeSlots: [
      "9:00 a.m.",
      "10:00 a.m.",
      "11:00 a.m.",
      "2:00 p.m.",
      "3:00 p.m.",
      "4:00 p.m.",
    ],
  },
];

const getInsuranceOptions = (t: any) => [
  { value: "universal", label: t("insurance.universal") },
  { value: "humano", label: t("insurance.humano") },
  { value: "mapfre", label: t("insurance.mapfre") },
  { value: "particular", label: t("insurance.particular") },
];

interface ScheduleAppointmentDialogProps {
  idProvider: string;
  idAppointment?: string;
  idService?: string;
  children: React.ReactNode;
}

const formatDateForStorage = (date: Date): string => {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
};

const parseDateFromStorage = (dateString: string): Date => {
  const [year, month, day] = dateString.split("-").map(Number);
  return new Date(year, month - 1, day);
};

function ScheduleAppointmentForm({
  isRescheduling,
  idService,
}: {
  isRescheduling: boolean;
  idService?: string;
}) {
  const { t, i18n } = useTranslation("patient");
  const currentLocale = i18n.language === "es" ? es : enUS;
  const [calendarOpen, setCalendarOpen] = useState(false);
  const { watch, setValue } = useFormContext<scheduleAppointment>();
  const formValues = watch();
  const initialValuesRef = useRef<scheduleAppointment | null>(null);

  const today = new Date();
  today.setHours(0, 0, 0, 0);

  useEffect(() => {
    if (isRescheduling && !initialValuesRef.current) {
      initialValuesRef.current = { ...formValues };
    }
  }, [isRescheduling, formValues]);

  const SERVICES = useMemo(() => getServices(t), [t]);
  const INSURANCE_OPTIONS = useMemo(() => getInsuranceOptions(t), [t]);

  const [appointmentFilters, setAppointmentFilters] =
    useState<AppointmentFilters>({
      serviceTypes: [],
      specialties: [],
      modalities: [],
      priceRange: [0, 10000],
      rating: 0,
    });

  const updateAppointmentFilters = (
    newFilters: Partial<AppointmentFilters>,
  ) => {
    setAppointmentFilters((prev) => ({ ...prev, ...newFilters }));
  };

  const resetAppointmentFilters = () => {
    setAppointmentFilters({
      serviceTypes: [],
      specialties: [],
      modalities: [],
      priceRange: [0, 10000],
      rating: 0,
    });
  };

  const filteredServices = useMemo(() => {
    return SERVICES.filter((service) => {
      if (
        appointmentFilters.serviceTypes.length > 0 &&
        !appointmentFilters.serviceTypes.includes(service.serviceType || "")
      ) {
        return false;
      }
      if (
        appointmentFilters.specialties.length > 0 &&
        !appointmentFilters.specialties.includes(service.specialty || "")
      ) {
        return false;
      }
      if (
        appointmentFilters.modalities.length > 0 &&
        !appointmentFilters.modalities.includes(service.modality)
      ) {
        return false;
      }
      if (
        service.priceValue &&
        (service.priceValue < appointmentFilters.priceRange[0] ||
          service.priceValue > appointmentFilters.priceRange[1])
      ) {
        return false;
      }
      if (
        appointmentFilters.rating > 0 &&
        service.rating &&
        service.rating < appointmentFilters.rating
      ) {
        return false;
      }
      return true;
    });
  }, [SERVICES, appointmentFilters]);

  const getActiveFiltersCount = () => {
    let count = 0;
    if (appointmentFilters.serviceTypes.length) count++;
    if (appointmentFilters.specialties.length) count++;
    if (appointmentFilters.modalities.length) count++;
    if (
      appointmentFilters.priceRange[0] !== 0 ||
      appointmentFilters.priceRange[1] !== 10000
    )
      count++;
    if (appointmentFilters.rating > 0) count++;
    return count;
  };

  const selectedDate = formValues.date
    ? parseDateFromStorage(formValues.date)
    : new Date();
  const weekStart = startOfWeek(selectedDate, { weekStartsOn: 0 });
  const weekDays = Array.from({ length: 7 }, (_, i) => addDays(weekStart, i));

  const selectedTimeSlots = useMemo(() => {
    if (formValues.serviceId && formValues.time) {
      const convertTo12Hour = (time24: string): string => {
        const [hours, minutes] = time24.split(":");
        let hour = parseInt(hours);
        const period = hour >= 12 ? "p.m." : "a.m.";
        if (hour > 12) hour -= 12;
        if (hour === 0) hour = 12;
        return `${hour}:${minutes} ${period}`;
      };
      return { [formValues.serviceId]: convertTo12Hour(formValues.time) };
    }
    return {};
  }, [formValues.serviceId, formValues.time]);

  const selectedModalityByService = useMemo(() => {
    if (formValues.serviceId && formValues.selectedModality) {
      return { [formValues.serviceId]: formValues.selectedModality };
    }
    return {};
  }, [formValues.serviceId, formValues.selectedModality]);

  const isSubmitDisabled = useMemo(() => {
    const hasTimeSlot = !!formValues.time;
    const hasModality = !!formValues.selectedModality;
    const hasRequiredFields =
      formValues.date && formValues.insuranceProvider && formValues.reason;

    if (!isRescheduling) {
      return !hasRequiredFields || !hasTimeSlot || !hasModality;
    }

    const hasAllFields = hasRequiredFields && hasTimeSlot && hasModality;
    if (!initialValuesRef.current) return true;

    const hasChanges =
      formValues.date !== initialValuesRef.current.date ||
      formValues.time !== initialValuesRef.current.time ||
      formValues.selectedModality !==
        initialValuesRef.current.selectedModality ||
      formValues.numberOfSessions !==
        initialValuesRef.current.numberOfSessions ||
      formValues.reason !== initialValuesRef.current.reason ||
      formValues.insuranceProvider !==
        initialValuesRef.current.insuranceProvider ||
      formValues.serviceId !== initialValuesRef.current.serviceId;

    return !hasAllFields || !hasChanges;
  }, [formValues, isRescheduling]);

  const handleDateSelect = (date: Date | undefined) => {
    if (date) {
      setValue("date", formatDateForStorage(date));
      setCalendarOpen(false);
    }
  };

  const convertTimeToHour = (timeSlot: string): string => {
    const time = timeSlot.replace(/\s*(a\.m\.|p\.m\.)/g, "");
    const [hours, minutes] = time.split(":");
    let hour24 = parseInt(hours);
    if (timeSlot.includes("p.m.") && hour24 !== 12) hour24 += 12;
    else if (timeSlot.includes("a.m.") && hour24 === 12) hour24 = 0;
    return `${hour24.toString().padStart(2, "0")}:${minutes}`;
  };

  const handleTimeSlotSelect = (serviceId: string, time: string) => {
    if (time === "") {
      setValue("time", "");
      setValue("serviceId", "");
      setValue("selectedModality", "presencial");
    } else {
      setValue("time", convertTimeToHour(time));
      setValue("serviceId", serviceId);
      if (!formValues.selectedModality || formValues.serviceId !== serviceId) {
        setValue("selectedModality", "presencial");
      }
    }
  };

  const handleModalitySelect = (
    _: string,
    modality: "presencial" | "teleconsulta",
  ) => {
    setValue("selectedModality", modality);
  };

  const handlePatientsChange = (newPatients: number) => {
    setValue("numberOfSessions", newPatients);
  };

  const DoctorHeader = () => (
    <div className="flex items-center gap-4">
      <img
        src="https://images.unsplash.com/photo-1612349317150-e413f6a5b16d?w=400&h=400&fit=crop"
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

  const PatientCounter = () => (
    <div className="flex items-center justify-between text-primary">
      <span className="font-medium">
        {formValues.numberOfSessions} {t("appointments.patient")}
        {formValues.numberOfSessions > 1
          ? t("appointments.patient_plural")
          : ""}
      </span>
      <div className="flex items-center gap-2">
        <MCButton
          type="button"
          variant="outline"
          size="sm"
          className="h-8 w-8 rounded-full"
          onClick={() =>
            handlePatientsChange(Math.max(1, formValues.numberOfSessions - 1))
          }
          disabled={formValues.numberOfSessions <= 1}
          icon={<Minus className="h-4 w-4" />}
        />
        <MCButton
          type="button"
          variant="outline"
          size="sm"
          className="h-8 w-8 rounded-full"
          onClick={() => handlePatientsChange(formValues.numberOfSessions + 1)}
          icon={<Plus className="h-4 w-4" />}
        />
      </div>
    </div>
  );

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
    <div className="px-6 pb-6 space-y-6">
      <DoctorHeader />
      <div className="space-y-2">
        <MCSelect
          name="insuranceProvider"
          label={t("insurance.title")}
          options={INSURANCE_OPTIONS}
          placeholder={t("insurance.select")}
          required
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
      <PatientCounter />
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
                  disabled={{ before: new Date() }}
                  initialFocus
                  className="p-3 pointer-events-auto"
                />
              </MorphingPopoverContent>
            </MorphingPopover>
          </div>
        </div>
        <WeekDaySelector />
      </div>
      <div className="flex gap-2">
        <MCFilterPopover
          activeFiltersCount={getActiveFiltersCount()}
          onClearFilters={resetAppointmentFilters}
        >
          <FilterAppointments
            filters={appointmentFilters}
            onFiltersChange={updateAppointmentFilters}
          />
        </MCFilterPopover>
      </div>

      {filteredServices.length === 0 ? (
        <div className="text-center py-8 text-muted-foreground">
          <p>
            {t(
              "filters.noResults",
              "No hay servicios que coincidan con los filtros seleccionados",
            )}
          </p>
        </div>
      ) : (
        <ServiceCards
          services={filteredServices}
          selectedTimeSlots={selectedTimeSlots}
          selectedModality={selectedModalityByService}
          onTimeSlotSelect={handleTimeSlotSelect}
          onModalitySelect={handleModalitySelect}
        />
      )}

      <MorphingDialogClose className="w-full">
        <MCButton type="submit" className="w-full" disabled={isSubmitDisabled}>
          {isRescheduling
            ? t("appointments.reschedule")
            : t("appointments.next")}
          <ChevronRight className="ml-2 h-5 w-5" />
        </MCButton>
      </MorphingDialogClose>
    </div>
  );
}

function ScheduleAppointmentDialog({
  idProvider,
  idAppointment,
  idService,
  children,
}: ScheduleAppointmentDialogProps) {
  const { t } = useTranslation("patient");
  const addAppointment = useAppointmentStore((s) => s.addAppointment);
  const appointment = useAppointmentStore((s) => s.appointment);
  const resetAppointment = useAppointmentStore((s) => s.clearAppointments);
  const isRescheduling = !!idAppointment;
  const [shouldLoadData, setShouldLoadData] = useState(false);

  const handleTriggerClick = useCallback(() => setShouldLoadData(true), []);

  useEffect(() => {
    if (!shouldLoadData) return;
    if (isRescheduling && idAppointment) {
      addAppointment({
        ...appointment,
        doctorId: idProvider,
        appointmentId: idAppointment,
      });
      setShouldLoadData(false);
      return;
    }
    if (!appointment.doctorId) {
      addAppointment({
        ...appointment,
        doctorId: idProvider,
        appointmentId: undefined,
      });
      setShouldLoadData(false);
      return;
    }
    if (appointment.doctorId !== idProvider) {
      resetAppointment();
      addAppointment({
        doctorId: idProvider,
        date: formatDateForStorage(new Date()),
        time: "",
        selectedModality: "presencial",
        numberOfSessions: 1,
        reason: "",
        insuranceProvider: "",
        serviceId: "",
        appointmentId: undefined,
      });
    }
    setShouldLoadData(false);
  }, [
    shouldLoadData,
    idProvider,
    appointment,
    addAppointment,
    resetAppointment,
    isRescheduling,
    idAppointment,
  ]);

  const onSubmit = (data: scheduleAppointment) => {
    if (isRescheduling && data.appointmentId) {
      addAppointment(data);
      window.location.href = "/patient/schedule-appointment";
    } else {
      addAppointment(data);
      window.location.href = "/patient/schedule-appointment";
    }
  };

  const formDefaultValues = useMemo(() => {
    if (isRescheduling && idAppointment) {
      return {
        ...appointment,
        doctorId: idProvider,
        appointmentId: idAppointment,
      };
    }
    return {
      date: appointment.date || formatDateForStorage(new Date()),
      time: appointment.time || "",
      selectedModality: appointment.selectedModality || "presencial",
      numberOfSessions: appointment.numberOfSessions || 1,
      reason: appointment.reason || "",
      insuranceProvider: appointment.insuranceProvider || "",
      serviceId: appointment.serviceId || "",
      doctorId: appointment.doctorId || idProvider,
      appointmentId: undefined,
    };
  }, [isRescheduling, appointment, idProvider, idAppointment]);

  const triggerWithHandler = React.isValidElement(children)
    ? React.cloneElement(children as React.ReactElement<any>, {
        onClick: handleTriggerClick,
      })
    : children;

  const modalTitle = isRescheduling
    ? t("appointments.rescheduleTitle")
    : t("appointments.schedule");

  return (
    <MCModalBase
      id={
        isRescheduling
          ? `reschedule-appointment-${idAppointment}`
          : "schedule-appointment-modal"
      }
      title={modalTitle}
      trigger={triggerWithHandler}
      triggerClassName="w-full"
      size="xl"
    >
      <MCFormWrapper
        key={
          isRescheduling
            ? `reschedule-${idAppointment}-${appointment.date}`
            : `new-appointment-${appointment.doctorId}`
        }
        schema={appointmentSchema(t)}
        defaultValues={formDefaultValues}
        onValidationChange={() => {}}
        onSubmit={onSubmit}
      >
        <ScheduleAppointmentForm
          isRescheduling={isRescheduling}
          idService={idService}
        />
      </MCFormWrapper>
    </MCModalBase>
  );
}

export default ScheduleAppointmentDialog;
