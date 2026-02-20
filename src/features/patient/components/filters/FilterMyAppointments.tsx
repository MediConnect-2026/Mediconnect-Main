import MCFilterSelect from "@/shared/components/filters/MCFilterSelect";
import MCFilterDates from "@/shared/components/filters/MCFilterDates";
import { useTranslation } from "react-i18next";

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
}

function FilterMyAppointments({
  filters,
  onFiltersChange,
}: FilterMyAppointmentsProps) {
  const { t } = useTranslation("patient");

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

  // Opciones para especialidades
  const specialtyOptions = [
    { value: "Terapeuta", label: t("specialties.therapy", "Terapeuta") },
    { value: "Ginecología", label: t("specialties.gynecology", "Ginecología") },
    { value: "Cardiología", label: t("specialties.cardiology", "Cardiología") },
    {
      value: "Medicina General",
      label: t("specialties.general", "Medicina General"),
    },
    {
      value: "Dermatología",
      label: t("specialties.dermatology", "Dermatología"),
    },
    { value: "Pediatría", label: t("specialties.pediatrics", "Pediatría") },
    {
      value: "Oftalmología",
      label: t("specialties.ophthalmology", "Oftalmología"),
    },
    {
      value: "Endocrinología",
      label: t("specialties.endocrinology", "Endocrinología"),
    },
    { value: "Neurología", label: t("specialties.neurology", "Neurología") },
  ];

  // Opciones para modalidades
  const modalityOptions = [
    { value: "virtual", label: t("appointments.modality.virtual", "Virtual") },
    {
      value: "in_person",
      label: t("appointments.modality.in_person", "Presencial"),
    },
  ];

  // Opciones para tipos de evaluación/servicio
  const serviceNameOptions = [
    {
      value: "Evaluación Cardíaca Integral",
      label: "Evaluación Cardíaca Integral",
    },
    { value: "Chequeo Cardiovascular", label: "Chequeo Cardiovascular" },
    { value: "Consulta General", label: "Consulta General" },
    { value: "Consulta Dermatológica", label: "Consulta Dermatológica" },
    { value: "Chequeo Pediátrico", label: "Chequeo Pediátrico" },
    { value: "Evaluación Visual", label: "Evaluación Visual" },
    { value: "Control de Diabetes", label: "Control de Diabetes" },
    { value: "Consulta Neurológica", label: "Consulta Neurológica" },
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
        options={specialtyOptions}
        multiple
        value={filters.specialties}
        onChange={(vals) => onFiltersChange({ specialties: vals as string[] })}
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

      {/* Filtro de Tipo de Servicio */}
      <MCFilterSelect
        name="serviceName"
        label={t("filters.labels.service", "Tipo de Servicio")}
        options={serviceNameOptions}
        multiple
        noBadges
        value={filters.ServiceName}
        onChange={(vals) => onFiltersChange({ ServiceName: vals as string[] })}
        searchable
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
