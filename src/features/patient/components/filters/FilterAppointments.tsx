import React from "react";
import MCFilterSelect from "@/shared/components/filters/MCFilterSelect";
import { useTranslation } from "react-i18next";

interface AppointmentFilters {
  serviceTypes: string[];
  specialties: string[];
  modalities: string[];
  priceRange: [number, number];
}

interface FilterAppointmentsProps {
  filters: AppointmentFilters;
  onFiltersChange: (filters: Partial<AppointmentFilters>) => void;
}

function FilterAppointments({
  filters,
  onFiltersChange,
}: FilterAppointmentsProps) {
  const { t } = useTranslation("patient");

  // Opciones traducidas
  const serviceTypeOptions = [
    {
      value: "consulta",
      label: t("filters.specialties.cardiology", "Consulta"),
    },
    { value: "terapia", label: t("filters.labels.languages", "Terapia") },
    { value: "examen", label: t("filters.labels.experience", "Examen") },
  ];

  const specialtyOptions = [
    {
      value: "cardiologia",
      label: t("filters.specialties.cardiology", "Cardiología"),
    },
    {
      value: "psicologia",
      label: t("filters.specialties.dermatology", "Psicología"),
    },
    {
      value: "nutricion",
      label: t("filters.specialties.pediatrics", "Nutrición"),
    },
  ];

  const modalityOptions = [
    { value: "presencial", label: t("serviceCards.inPerson", "Presencial") },
    { value: "online", label: t("serviceCards.virtual", "Online") },
  ];

  return (
    <div className="grid grid-cols-2 gap-4">
      <MCFilterSelect
        name="serviceTypes"
        label={t("filters.labels.specialty", "Tipo de servicio")}
        options={serviceTypeOptions}
        multiple
        noBadges
        value={filters.serviceTypes}
        onChange={(vals) => onFiltersChange({ serviceTypes: vals as string[] })}
        searchable
      />

      <MCFilterSelect
        name="specialties"
        label={t("filters.labels.specialty", "Especialidad")}
        options={specialtyOptions}
        multiple
        noBadges
        value={filters.specialties}
        onChange={(vals) => onFiltersChange({ specialties: vals as string[] })}
        searchable
      />

      <MCFilterSelect
        name="modalities"
        label={t("filters.labels.modalities", "Modalidad")}
        options={modalityOptions}
        multiple
        noBadges
        value={filters.modalities}
        onChange={(vals) => onFiltersChange({ modalities: vals as string[] })}
      />

      {/* Filtro de rango de precio */}
      <div>
        <label className="block mb-1 text-primary">
          {t("filters.labels.experience", "Precio")}
        </label>
        <input
          type="range"
          min={0}
          max={10000}
          step={100}
          value={filters.priceRange[1]}
          onChange={(e) =>
            onFiltersChange({
              priceRange: [filters.priceRange[0], Number(e.target.value)],
            })
          }
          className="w-full accent-accent h-2 rounded-lg bg-primary/20"
        />
        <div className="flex justify-between text-xs mt-1">
          <span>${filters.priceRange[0]}</span>
          <span>${filters.priceRange[1]}</span>
        </div>
      </div>
    </div>
  );
}

export default FilterAppointments;
