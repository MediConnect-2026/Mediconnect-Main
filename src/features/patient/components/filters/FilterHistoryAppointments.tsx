import React, { useMemo } from "react";
import MCFilterSelect from "@/shared/components/filters/MCFilterSelect";
import MCFilterDates from "@/shared/components/filters/MCFilterDates";
import { useTranslation } from "react-i18next";

interface HistoryFilters {
  services: string[];
  dateRange?: [Date, Date];
  timeRange: string[];
  locations: string[];
}

interface FilterHistoryAppointmentsProps {
  filters: HistoryFilters;
  onFiltersChange: (filters: Partial<HistoryFilters>) => void;
}

function FilterHistoryAppointments({
  filters,
  onFiltersChange,
}: FilterHistoryAppointmentsProps) {
  const { t } = useTranslation("patient");

  // Opciones para servicios del historial
  const serviceOptions = useMemo(
    () => [
      {
        value: "Consulta Cardiología",
        label: t("filters.services.cardiology"),
      },
      { value: "Terapia Física", label: t("filters.services.physicalTherapy") },
      {
        value: "Consulta General",
        label: t("filters.services.generalConsultation"),
      },
      { value: "Dermatología", label: t("filters.services.dermatology") },
      { value: "Ginecología", label: t("filters.services.gynecology") },
      { value: "Pediatría", label: t("filters.services.pediatrics") },
      { value: "Oftalmología", label: t("filters.services.ophthalmology") },
    ],
    [t],
  );

  // Opciones para rangos de tiempo
  const timeRangeOptions = useMemo(
    () => [
      { value: "morning", label: t("filters.timeRanges.morning") },
      { value: "afternoon", label: t("filters.timeRanges.afternoon") },
      { value: "evening", label: t("filters.timeRanges.evening") },
    ],
    [t],
  );

  // Opciones para ubicaciones
  const locationOptions = useMemo(
    () => [
      {
        value: "Centro Médico Norte",
        label: t("filters.locations.northMedicalCenter"),
      },
      {
        value: "Hospital General",
        label: t("filters.locations.generalHospital"),
      },
      {
        value: "Clínica Santa María",
        label: t("filters.locations.santaMariaClinic"),
      },
      {
        value: "Centro Especializado",
        label: t("filters.locations.specializedCenter"),
      },
      {
        value: "Consulta Virtual",
        label: t("filters.locations.virtualConsultation"),
      },
    ],
    [t],
  );

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      {/* Filtro de Servicios */}
      <MCFilterSelect
        name="services"
        label={t("filters.history.services")}
        options={serviceOptions}
        multiple
        value={filters.services}
        noBadges
        onChange={(vals) => onFiltersChange({ services: vals as string[] })}
        searchable
      />

      {/* Filtro de Horarios */}
      <MCFilterSelect
        name="timeRange"
        label={t("filters.history.timeRange")}
        options={timeRangeOptions}
        multiple
        value={filters.timeRange}
        noBadges
        onChange={(vals) => onFiltersChange({ timeRange: vals as string[] })}
      />

      {/* Filtro de Ubicaciones */}
      <MCFilterSelect
        name="locations"
        label={t("filters.history.locations")}
        options={locationOptions}
        multiple
        value={filters.locations}
        noBadges
        onChange={(vals) => onFiltersChange({ locations: vals as string[] })}
        searchable
      />

      {/* Filtro de Rango de Fechas */}
      <div className="md:col-span-1">
        <MCFilterDates
          label={t("filters.history.dateRange")}
          value={filters.dateRange}
          onChange={(dateRange) => onFiltersChange({ dateRange })}
        />
      </div>
    </div>
  );
}

export default FilterHistoryAppointments;
