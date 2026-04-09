import React, { useMemo } from "react";
import MCFilterSelect from "@/shared/components/filters/MCFilterSelect";
import MCFilterDates from "@/shared/components/filters/MCFilterDates";
import { useTranslation } from "react-i18next";
import useUbicaciones from "@/features/onboarding/services/useUbicaciones";
import usePatientServices from "@/features/patient/hooks/usePatientServices";

interface HistoryFilters {
  services: string[];
  dateRange?: [Date, Date];
  timeRange: string[];
  locations: string[];
}

interface FilterHistoryAppointmentsProps {
  filters: HistoryFilters;
  onFiltersChange: (filters: Partial<HistoryFilters>) => void;
  pacienteId?: string | number;
}

function FilterHistoryAppointments({
  filters,
  onFiltersChange,
  pacienteId,
}: FilterHistoryAppointmentsProps) {
  const { t } = useTranslation("patient");

  const {
    data: patientServicesResp,
    isLoading: isLoadingServices,
  } = usePatientServices(pacienteId);

  const {
    data: doctorLocations = [],
    isLoading: isLoadingLocations,
    isError: locationsError,
  } = useUbicaciones("doctor", {});

  // Opciones para servicios del historial
  const serviceOptions = useMemo(() => {
    if (pacienteId && isLoadingServices) return [];

    if (patientServicesResp?.success && Array.isArray(patientServicesResp.data) && patientServicesResp.data.length > 0) {
      return patientServicesResp.data.map((service: any) => ({
        value: service.nombre,
        label: service.nombre,
      }));
    }

    return [
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
    ];
  }, [t, patientServicesResp, isLoadingServices, pacienteId]);

  // Opciones para rangos de tiempo
  const timeRangeOptions = useMemo(
    () => [
      { value: "morning", label: t("filters.timeRanges.morning") },
      { value: "afternoon", label: t("filters.timeRanges.afternoon") },
      { value: "evening", label: t("filters.timeRanges.evening") },
    ],
    [t],
  );


  const locationOptions = useMemo(
    () =>
      doctorLocations.map((loc) => ({
        value: loc.id.toString(),
        label: loc.nombre,
      })),
    [doctorLocations]
  );

  return (
    <div className="grid grid-cols-2 md:grid-cols-2 gap-4">
      {/* Filtro de Servicios */}
      <MCFilterSelect
        name="services"
        label={t("filters.history.services")}
        placeholder={isLoadingServices ? "Cargando..." : "Seleccionar"}
        options={serviceOptions}
        multiple
        value={filters.services}
        noBadges
        onChange={(vals) => onFiltersChange({ services: vals as string[] })}
        searchable
        disabled={isLoadingServices}
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
        placeholder={isLoadingLocations ? "Cargando..." : "Seleccionar"}
        options={locationOptions}
        multiple
        value={filters.locations}
        noBadges
        onChange={(vals) => onFiltersChange({ locations: vals as string[] })}
        searchable
        disabled={isLoadingLocations}
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
