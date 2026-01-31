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
import { useNavigate } from "react-router-dom";

import MCFormWrapper from "@/shared/components/forms/MCFormWrapper";
import { useState, useMemo, useCallback, useEffect } from "react";
import { useFormContext } from "react-hook-form";
import React from "react";

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

// Interfaz para los filtros de citas
interface AppointmentFilters {
  serviceTypes: string[];
  specialties: string[];
  modalities: string[];
  priceRange: [number, number];
}

// Actualiza los servicios con traducciones
const getServices = (t: any): Service[] => [
  {
    id: "1",
    name: t("services.consultation"),
    description: t("services.evaluation"),
    price: "RD$1500",
    duration: `30 ${t("services.duration")}`,
    modality: t("services.mixed"),
    location: t("services.location"),
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
    price: "RD$1500",
    duration: `30 ${t("services.duration")}`,
    modality: t("services.mixed"),
    location: t("services.location"),
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

// Actualiza las opciones de seguro con traducciones
const getInsuranceOptions = (t: any) => [
  { value: "universal", label: t("insurance.universal") },
  { value: "humano", label: t("insurance.humano") },
  { value: "mapfre", label: t("insurance.mapfre") },
  { value: "particular", label: t("insurance.particular") },
];

interface ScheduleAppointmentDialogProps {
  idProvider: string;
  idAppointment?: string;
  children: React.ReactNode;
}

// Función auxiliar para manejar fechas sin problemas de timezone
const formatDateForStorage = (date: Date): string => {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
};

// Función auxiliar para parsear fechas correctamente
const parseDateFromStorage = (dateString: string): Date => {
  const [year, month, day] = dateString.split("-").map(Number);
  return new Date(year, month - 1, day);
};

// Componente interno que usa el FormContext
function ScheduleAppointmentForm({
  isRescheduling,
}: {
  isRescheduling: boolean;
}) {
  const { t, i18n } = useTranslation("patient");
  const currentLocale = i18n.language === "es" ? es : enUS;
  const [calendarOpen, setCalendarOpen] = useState(false);

  // Obtener servicios y seguros traducidos
  const SERVICES = useMemo(() => getServices(t), [t]);
  const INSURANCE_OPTIONS = useMemo(() => getInsuranceOptions(t), [t]);

  // Estados locales para filtros con useState
  const [appointmentFilters, setAppointmentFilters] =
    useState<AppointmentFilters>({
      serviceTypes: [],
      specialties: [],
      modalities: [],
      priceRange: [0, 10000],
    });

  // Función para actualizar filtros
  const updateAppointmentFilters = (
    newFilters: Partial<AppointmentFilters>,
  ) => {
    setAppointmentFilters((prev) => ({ ...prev, ...newFilters }));
  };

  // Función para resetear filtros
  const resetAppointmentFilters = () => {
    setAppointmentFilters({
      serviceTypes: [],
      specialties: [],
      modalities: [],
      priceRange: [0, 10000],
    });
  };

  // Función para contar filtros activos
  const getActiveFiltersCount = () => {
    let count = 0;
    if (appointmentFilters.serviceTypes.length > 0) count++;
    if (appointmentFilters.specialties.length > 0) count++;
    if (appointmentFilters.modalities.length > 0) count++;
    if (
      appointmentFilters.priceRange[0] !== 0 ||
      appointmentFilters.priceRange[1] !== 10000
    )
      count++;
    return count;
  };

  // Obtener valores del formulario (react-hook-form)
  const { watch, setValue } = useFormContext<scheduleAppointment>();

  // Watch todos los valores del formulario
  const formValues = watch();

  // Obtener la fecha del formulario o usar hoy
  const selectedDate = formValues.date
    ? parseDateFromStorage(formValues.date)
    : new Date();

  const weekStart = startOfWeek(selectedDate, { weekStartsOn: 0 });
  const weekDays = Array.from({ length: 7 }, (_, i) => addDays(weekStart, i));

  // Crear un objeto para selectedTimeSlots basado en el formulario
  const selectedTimeSlots = useMemo(() => {
    if (formValues.serviceId && formValues.time) {
      // Convertir el tiempo de formato 24h a formato display (a.m./p.m.)
      const convertTo12Hour = (time24: string): string => {
        const [hours, minutes] = time24.split(":");
        let hour = parseInt(hours);
        const period = hour >= 12 ? "p.m." : "a.m.";

        if (hour > 12) hour -= 12;
        if (hour === 0) hour = 12;

        return `${hour}:${minutes} ${period}`;
      };

      return {
        [formValues.serviceId]: convertTo12Hour(formValues.time),
      };
    }
    return {};
  }, [formValues.serviceId, formValues.time]);

  // Crear un objeto para selectedModality basado en el formulario
  const selectedModalityByService = useMemo(() => {
    if (formValues.serviceId && formValues.selectedModality) {
      return {
        [formValues.serviceId]: formValues.selectedModality,
      };
    }
    return {};
  }, [formValues.serviceId, formValues.selectedModality]);

  // Calculate if submit should be disabled
  const isSubmitDisabled = useMemo(() => {
    const hasTimeSlot = !!formValues.time;
    const hasModality = !!formValues.selectedModality;
    const hasRequiredFields =
      formValues.date && formValues.insuranceProvider && formValues.reason;

    return !hasRequiredFields || !hasTimeSlot || !hasModality;
  }, [formValues]);

  const handleDateSelect = (date: Date | undefined) => {
    if (date) {
      const formattedDate = formatDateForStorage(date);
      setValue("date", formattedDate);
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
      // Deseleccionar
      setValue("time", "");
      setValue("serviceId", "");
      setValue("selectedModality", "presencial");
    } else {
      // Seleccionar nuevo horario
      const convertedTime = convertTimeToHour(time);
      setValue("time", convertedTime);
      setValue("serviceId", serviceId);

      // Si cambiamos de servicio, resetear la modalidad
      if (formValues.serviceId && formValues.serviceId !== serviceId) {
        setValue("selectedModality", "presencial");
      }
    }
  };

  const handleModalitySelect = (
    serviceId: string,
    modality: "presencial" | "teleconsulta",
  ) => {
    setValue("selectedModality", modality);
  };

  const handlePatientsChange = (newPatients: number) => {
    setValue("numberOfSessions", newPatients);
  };

  const DoctorHeader = () => {
    const doctorAvatar =
      "https://images.unsplash.com/photo-1612349317150-e413f6a5b16d?w=400&h=400&fit=crop";

    return (
      <div className="flex items-center gap-4">
        <img
          src={doctorAvatar}
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
            onClick={() => handleDateSelect(day)}
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
          options={INSURANCE_OPTIONS}
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
          activeFiltersCount={getActiveFiltersCount()}
          onClearFilters={resetAppointmentFilters}
        >
          <FilterAppointments
            filters={appointmentFilters}
            onFiltersChange={updateAppointmentFilters}
          />
        </MCFilterPopover>
      </div>

      {/* Service Cards */}
      <ServiceCards
        services={SERVICES}
        selectedTimeSlots={selectedTimeSlots}
        selectedModality={selectedModalityByService}
        onTimeSlotSelect={handleTimeSlotSelect}
        onModalitySelect={handleModalitySelect}
      />

      {/* Submit Button */}
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
  children,
}: ScheduleAppointmentDialogProps) {
  const { t } = useTranslation("patient");
  const navigate = useNavigate();

  const addAppointment = useAppointmentStore((s) => s.addAppointment);
  const appointment = useAppointmentStore((s) => s.appointment);
  const resetAppointment = useAppointmentStore((s) => s.clearAppointments);

  // Determinar si estamos en modo reagendar
  const isRescheduling = !!idAppointment;

  // ✨ Esta función se ejecuta cada vez que se hace clic en el trigger
  const handleTriggerClick = useCallback(async () => {
    // MODO REAGENDAR: Cargar datos de la cita desde la API
    if (isRescheduling && idAppointment) {
      // TODO: Aquí cargas los datos de la cita desde tu API
      // const appointmentData = await fetchAppointment(idAppointment);

      // Por ahora, usa datos de ejemplo o del store si ya existen
      addAppointment({
        ...appointment,
        doctorId: idProvider,
        appointmentId: idAppointment,
      });
      return;
    }

    // MODO CREAR NUEVA CITA
    // Si no hay doctor en el store, configurar el actual
    if (!appointment.doctorId) {
      addAppointment({
        ...appointment,
        doctorId: idProvider,
        appointmentId: undefined,
      });
      return;
    }

    // Si el doctor es diferente, resetear y configurar el nuevo
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
    // Si es el mismo doctor, no hacer nada (mantener formulario)
  }, [
    idProvider,
    appointment,
    addAppointment,
    resetAppointment,
    isRescheduling,
    idAppointment,
  ]);

  const onSubmit = (data: scheduleAppointment) => {
    if (isRescheduling && data.appointmentId) {
      // MODO EDITAR: Actualizar la cita existente
      console.log("Actualizando cita:", data.appointmentId, data);

      // TODO: Aquí integrarás la llamada API para actualizar
      // await updateAppointment(data.appointmentId, data);

      addAppointment(data);
      navigate("/patient/appointments");
    } else {
      // MODO CREAR: Flujo normal de crear nueva cita
      addAppointment(data);
      navigate("/patient/schedule-appointment");
    }
  };

  // Determinar valores por defecto según el modo
  const formDefaultValues = useMemo(() => {
    if (isRescheduling && idAppointment) {
      // En modo reagendar, usar los datos del store (que fueron cargados en handleTriggerClick)
      // o valores por defecto si aún no se han cargado
      return {
        ...appointment,
        doctorId: idProvider,
        appointmentId: idAppointment,
      };
    }

    // Valores por defecto para nueva cita
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

  // ✨ Envolver el trigger para agregar el onClick
  const triggerWithHandler = React.isValidElement(children)
    ? React.cloneElement(children as React.ReactElement<any>, {
        onClick: handleTriggerClick,
      })
    : children;

  // Título dinámico según el modo
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
      triggerClassName="w-full h-full flex-1"
      size="wider"
    >
      <MCFormWrapper
        schema={appointmentSchema(t)}
        defaultValues={formDefaultValues}
        onValidationChange={() => {}}
        onSubmit={onSubmit}
      >
        <ScheduleAppointmentForm isRescheduling={isRescheduling} />
      </MCFormWrapper>
    </MCModalBase>
  );
}

export default ScheduleAppointmentDialog;
