import MCFilterSelect from "@/shared/components/filters/MCFilterSelect";
import MCFilterDates from "@/shared/components/filters/MCFilterDates";
import { useTranslation } from "react-i18next";
import { useEspecialidades } from "@/features/onboarding/services";

interface AppointmentFilters {
  status: string[];
  specialties: string[];
  modalities: string[];
  ServiceName: string[];
  dateRange?: [Date, Date];
  doctorName?: string;
}

interface FilterMyAppointmentsProps {
  filters: AppointmentFilters;
  onFiltersChange: (filters: Partial<AppointmentFilters>) => void;
  resetTrigger?: number;
}

function FilterMyAppointments({
  filters,
  onFiltersChange,
}: FilterMyAppointmentsProps) {
  const { t } = useTranslation("patient");

  const { data: specialtyOptions, isLoading: isLoadingSpecialties } =
    useEspecialidades();

  // Opciones para estado de cita
  const statusOptions = [
    {
      value: "scheduled",
      label: t("appointments.status.scheduled", "Programada"),
    },
    { value: "pending", label: t("appointments.status.pending", "Pendiente") },
    {
      value: "in_progress",
      label: t("appointments.status.in_progress", "En Progreso"),
    },
    {
      value: "completed",
      label: t("appointments.status.completed", "Completada"),
    },
    {
      value: "cancelled",
      label: t("appointments.status.cancelled", "Cancelada"),
    },
  ];

  // Opciones para modalidades
  const modalityOptions = [
    { value: "virtual", label: t("appointments.modality.virtual", "Virtual") },
    {
      value: "in_person",
      label: t("appointments.modality.in_person", "Presencial"),
    },
  ];

  return (
    <div className="grid grid-cols-2 md:grid-cols-2 gap-4">
      {/* Filtro de Estado */}
      <MCFilterSelect
        name="status"
        label={t("filters.labels.status", "Estado")}
        options={statusOptions}
        multiple
        value={filters.status}
        noBadges
        onChange={(vals) => onFiltersChange({ status: vals as string[] })}
      />

      {/* Filtro de Especialidades */}
      <MCFilterSelect
        name="specialties"
        label={t("filters.labels.specialty", "Especialidades")}
        options={specialtyOptions || []}
        multiple
        value={filters.specialties}
        onChange={(vals) => onFiltersChange({ specialties: vals as string[] })}
        disabled={isLoadingSpecialties}
        noBadges
        searchable
      />

      {/* Filtro de Modalidades */}
      <MCFilterSelect
        name="modalities"
        label={t("filters.labels.modalities", "Modalidad")}
        options={modalityOptions}
        multiple
        noBadges
        value={filters.modalities}
        onChange={(vals) => onFiltersChange({ modalities: vals as string[] })}
      />

      {/* Filtro de Rango de Fechas */}
      <div className="md:col-span-2">
        <MCFilterDates
          label={t("filters.labels.dateRange", "Rango de Fechas")}
          value={filters.dateRange}
          onChange={(dateRange) => onFiltersChange({ dateRange })}
        />
      </div>
    </div>
  );
}

export default FilterMyAppointments;
