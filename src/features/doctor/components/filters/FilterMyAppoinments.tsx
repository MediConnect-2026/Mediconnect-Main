import { type JSX, useMemo, useCallback } from "react";
import { memo } from "react";
// import { Calendar, User, Stethoscope } from "lucide-react";
import MCFilterSelect from "@/shared/components/filters/MCFilterSelect";
import MCFilterDates from "@/shared/components/filters/MCFilterDates";
import { useTranslation } from "react-i18next";
import { useIsMobile } from "@/lib/hooks/useIsMobile";

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

/**
 * Componente para filtrar citas del doctor
 * Memoizado para evitar re-renders innecesarios
 * Las opciones se generan dinámicamente desde los datos de citas
 */
const FilterMyAppointments = memo(function FilterMyAppointments({
  filters,
  onFiltersChange,
  specialtyOptions = [],
  serviceOptions = [],
}: FilterMyAppointmentsProps) {
  const { t } = useTranslation("doctor");
  const isMobile = useIsMobile();

  // Memoizar las opciones de estado para solo crearlas una vez
  const statusOptions: OptionType[] = useMemo(
    () => [
      { value: "all", label: t("appointments.filters.status.all") },
      { value: "scheduled", label: t("appointments.filters.status.scheduled") },
      {
        value: "in_progress",
        label: t("appointments.filters.status.inProgress"),
      },
      { value: "completed", label: t("appointments.filters.status.completed") },
      { value: "cancelled", label: t("appointments.filters.status.cancelled") },
    ],
    [t]
  );

  // Memoizar las opciones de tipo (virtual/presencial)
  const typeOptions: OptionType[] = useMemo(
    () => [
      { value: "all", label: t("appointments.filters.type.all") },
      {
        value: "virtual",
        label: (
          <span
            className={`flex items-center gap-1 ${isMobile ? "text-xs" : ""}`}
          >
            {t("appointments.filters.type.virtual")}
          </span>
        ),
      },
      {
        value: "in_person",
        label: (
          <span
            className={`flex items-center gap-1 ${isMobile ? "text-xs" : ""}`}
          >
            {t("appointments.filters.type.inPerson")}
          </span>
        ),
      },
    ],
    [t, isMobile]
  );

  // Convertir opciones dinámicas de especialidades a formato OptionType
  const specialtyOptionsFormatted: OptionType[] = useMemo(
    () => [
      { value: "all", label: t("appointments.filters.specialty.all") },
      ...specialtyOptions.map((spec) => ({
        value: spec,
        label: spec,
      })),
    ],
    [specialtyOptions, t]
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
    [serviceOptions, t]
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
        options={specialtyOptionsFormatted}
        placeholder={t("appointments.filters.placeholders.specialty")}
        value={filters.specialty}
        noBadges
        onChange={handleSpecialtyChange}
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
