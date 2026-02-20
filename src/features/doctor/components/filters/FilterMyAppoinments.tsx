import { type JSX } from "react";
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
}

type OptionType = { value: string; label: string | JSX.Element };

function FilterMyAppointments({
  filters,
  onFiltersChange,
}: FilterMyAppointmentsProps) {
  const { t } = useTranslation("doctor");
  const isMobile = useIsMobile();

  const statusOptions: OptionType[] = [
    { value: "all", label: t("appointments.filters.status.all") },
    { value: "pending", label: t("appointments.filters.status.pending") },
    { value: "scheduled", label: t("appointments.filters.status.scheduled") },
    {
      value: "in_progress",
      label: t("appointments.filters.status.inProgress"),
    },
    { value: "completed", label: t("appointments.filters.status.completed") },
    { value: "cancelled", label: t("appointments.filters.status.cancelled") },
  ];

  const typeOptions: OptionType[] = [
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
  ];

  const specialtyOptions: OptionType[] = [
    { value: "all", label: t("appointments.filters.specialty.all") },
    {
      value: "medicina-familiar",
      label: t("appointments.filters.specialty.familyMedicine"),
    },
    {
      value: "cardiologia",
      label: t("appointments.filters.specialty.cardiology"),
    },
    {
      value: "medicina-interna",
      label: t("appointments.filters.specialty.internalMedicine"),
    },
    {
      value: "fisioterapia",
      label: t("appointments.filters.specialty.physiotherapy"),
    },
    {
      value: "nutricion",
      label: t("appointments.filters.specialty.nutrition"),
    },
  ];

  const serviceOptions: OptionType[] = [
    { value: "all", label: t("appointments.filters.service.all") },
    { value: "consulta-general", label: "Consulta General" },
    { value: "evaluacion-seguimiento", label: "Evaluación de Seguimiento" },
    { value: "control-presion", label: "Control de Presión" },
    { value: "rehabilitacion", label: "Rehabilitación Post-lesión" },
    { value: "plan-nutricional", label: "Plan Nutricional" },
    { value: "fisioterapia", label: "Sesión de Fisioterapia" },
  ];

  const dateRangeOptions: OptionType[] = [
    { value: "all", label: t("appointments.filters.dateRange.all") },
    {
      value: "today",
      label: t("appointments.filters.dateRange.today"),
    },
    {
      value: "this-week",
      label: t("appointments.filters.dateRange.thisWeek"),
    },
    {
      value: "this-month",
      label: t("appointments.filters.dateRange.thisMonth"),
    },
    {
      value: "next-7-days",
      label: t("appointments.filters.dateRange.next7Days"),
    },
    {
      value: "past",
      label: t("appointments.filters.dateRange.past"),
    },
  ];

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 w-full">
      <MCFilterSelect
        name="status"
        label={t("appointments.filters.labels.status")}
        options={statusOptions}
        placeholder={t("appointments.filters.placeholders.status")}
        value={filters.status}
        noBadges
        onChange={(v) =>
          onFiltersChange({
            status: typeof v === "string" ? v : (v[0] ?? ""),
          })
        }
      />

      <MCFilterSelect
        name="appointmentType"
        label={t("appointments.filters.labels.type")}
        options={typeOptions}
        placeholder={t("appointments.filters.placeholders.type")}
        value={filters.appointmentType}
        noBadges
        onChange={(v) =>
          onFiltersChange({
            appointmentType: typeof v === "string" ? v : (v[0] ?? ""),
          })
        }
      />

      <MCFilterSelect
        name="specialty"
        label={t("appointments.filters.labels.specialty")}
        options={specialtyOptions}
        placeholder={t("appointments.filters.placeholders.specialty")}
        value={filters.specialty}
        noBadges
        onChange={(v) =>
          onFiltersChange({
            specialty: typeof v === "string" ? v : (v[0] ?? ""),
          })
        }
      />

      <MCFilterSelect
        name="service"
        label={t("appointments.filters.labels.service")}
        options={serviceOptions}
        placeholder={t("appointments.filters.placeholders.service")}
        value={filters.service}
        noBadges
        onChange={(v) =>
          onFiltersChange({
            service: typeof v === "string" ? v : (v[0] ?? ""),
          })
        }
      />

      {/* Nuevo filtro de rango de fechas */}
      <div className="w-full ">
        <MCFilterDates
          label={t("appointments.filters.labels.dateRange")}
          value={filters.dateRange}
          onChange={(dateRange) => onFiltersChange({ dateRange })}
        />
      </div>
    </div>
  );
}

export default FilterMyAppointments;
