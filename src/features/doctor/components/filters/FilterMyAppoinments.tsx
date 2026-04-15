import { type JSX, useMemo, useCallback } from "react";
import { memo } from "react";
// import { Calendar, User, Stethoscope } from "lucide-react";
import MCFilterSelect from "@/shared/components/filters/MCFilterSelect";
import MCFilterDates from "@/shared/components/filters/MCFilterDates";
import { useTranslation } from "react-i18next";
import { useIsMobile } from "@/lib/hooks/useIsMobile";
import { useEspecialidades } from "@/features/onboarding/services/useEspecialidades";

interface MyAppointmentFilters {
  status: string;
  appointmentType: string;
  specialty: string;
  service: string;
  dateRange?: [Date, Date]; // Cambiado de string a [Date, Date]
}

interface FilterMyAppointmentsProps {
  filters: MyAppointmentFilters;
  onFiltersChange: (filters: Partial<MyAppointmentFilters>) => void;
  specialtyOptions?: string[];
  serviceOptions?: string[];
}

type OptionType = { value: string; label: string | JSX.Element };

const STATUS_FILTER_VALUES = {
  all: "appointments.filters.values.status.all",
  scheduled: "appointments.filters.values.status.scheduled",
  inProgress: "appointments.filters.values.status.inProgress",
  completed: "appointments.filters.values.status.completed",
  cancelled: "appointments.filters.values.status.cancelled",
} as const;

const APPOINTMENT_TYPE_FILTER_VALUES = {
  all: "appointments.filters.values.type.all",
  virtual: "appointments.filters.values.type.virtual",
  inPerson: "appointments.filters.values.type.inPerson",
} as const;

/**
 * Componente para filtrar citas del doctor
 * Memoizado para evitar re-renders innecesarios
 * Las opciones se generan dinámicamente desde los datos de citas
 */
const FilterMyAppointments = memo(function FilterMyAppointments({
  filters,
  onFiltersChange,
  serviceOptions = [],
}: FilterMyAppointmentsProps) {
  const { t, i18n } = useTranslation("doctor");
  const isMobile = useIsMobile();

  const { data: especialidadesOptions = [], isLoading: isLoadingEspecialidades } = useEspecialidades();

  // Memoizar las opciones de estado para solo crearlas una vez
  const statusOptions: OptionType[] = useMemo(
    () => [
      {
        value: STATUS_FILTER_VALUES.all,
        label: t("appointments.filters.status.all"),
      },
      {
        value: STATUS_FILTER_VALUES.scheduled,
        label: t("appointments.filters.status.scheduled"),
      },
      {
        value: STATUS_FILTER_VALUES.inProgress,
        label: t("appointments.filters.status.inProgress"),
      },
      {
        value: STATUS_FILTER_VALUES.completed,
        label: t("appointments.filters.status.completed"),
      },
      {
        value: STATUS_FILTER_VALUES.cancelled,
        label: t("appointments.filters.status.cancelled"),
      },
    ],
    [t, i18n.language]
  );

  // Memoizar las opciones de tipo (virtual/presencial)
  const typeOptions: OptionType[] = useMemo(
    () => [
      {
        value: APPOINTMENT_TYPE_FILTER_VALUES.all,
        label: t("appointments.filters.type.all"),
      },
      {
        value: APPOINTMENT_TYPE_FILTER_VALUES.virtual,
        label: (
          <span
            className={`flex items-center gap-1 ${isMobile ? "text-xs" : ""}`}
          >
            {t("appointments.filters.type.virtual")}
          </span>
        ),
      },
      {
        value: APPOINTMENT_TYPE_FILTER_VALUES.inPerson,
        label: (
          <span
            className={`flex items-center gap-1 ${isMobile ? "text-xs" : ""}`}
          >
            {t("appointments.filters.type.inPerson")}
          </span>
        ),
      },
    ],
    [t, i18n.language, isMobile]
  );


  // Convertir opciones dinámicas de servicios a formato OptionType
  const serviceOptionsFormatted: OptionType[] = useMemo(
    () => [
      { value: "all", label: t("appointments.filters.service.all") },
      ...serviceOptions.map((svc) => ({
        value: svc,
        label: svc,
      })),
    ],
    [serviceOptions, t, i18n.language]
  );

  // Memoizar los callbacks para evitar recrearlos en cada render
  const handleStatusChange = useCallback(
    (v: string | string[]) => {
      onFiltersChange({
        status: typeof v === "string" ? v : v[0] ?? "",
      });
    },
    [onFiltersChange]
  );

  const handleTypeChange = useCallback(
    (v: string | string[]) => {
      onFiltersChange({
        appointmentType: typeof v === "string" ? v : v[0] ?? "",
      });
    },
    [onFiltersChange]
  );

  const handleSpecialtyChange = useCallback(
    (v: string | string[]) => {
      onFiltersChange({
        specialty: typeof v === "string" ? v : v[0] ?? "",
      });
    },
    [onFiltersChange]
  );

  const handleServiceChange = useCallback(
    (v: string | string[]) => {
      onFiltersChange({
        service: typeof v === "string" ? v : v[0] ?? "",
      });
    },
    [onFiltersChange]
  );

  const handleDateRangeChange = useCallback(
    (dateRange: [Date, Date] | undefined) => {
      onFiltersChange({ dateRange });
    },
    [onFiltersChange]
  );

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 w-full">
      <MCFilterSelect
        name="status"
        label={t("appointments.filters.labels.status")}
        options={statusOptions}
        placeholder={t("appointments.filters.placeholders.status")}
        value={filters.status}
        noBadges
        onChange={handleStatusChange}
      />

      <MCFilterSelect
        name="appointmentType"
        label={t("appointments.filters.labels.type")}
        options={typeOptions}
        placeholder={t("appointments.filters.placeholders.type")}
        value={filters.appointmentType}
        noBadges
        onChange={handleTypeChange}
      />

      <MCFilterSelect
        name="specialty"
        label={t("appointments.filters.labels.specialty")}
        options={especialidadesOptions}
        placeholder={isLoadingEspecialidades ? t("appointments.filters.loading") : t("appointments.filters.placeholders.specialty")}
        value={filters.specialty}
        noBadges
        onChange={handleSpecialtyChange}
        disabled={isLoadingEspecialidades}
      />

      <MCFilterSelect
        name="service"
        label={t("appointments.filters.labels.service")}
        options={serviceOptionsFormatted}
        placeholder={t("appointments.filters.placeholders.service")}
        value={filters.service}
        noBadges
        onChange={handleServiceChange}
      />

      {/* Filtro de rango de fechas */}
      <div className="w-full">
        <MCFilterDates
          label={t("appointments.filters.labels.dateRange")}
          value={filters.dateRange}
          onChange={handleDateRangeChange}
        />
      </div>
    </div>
  );
});

FilterMyAppointments.displayName = "FilterMyAppointments";

export default FilterMyAppointments;
