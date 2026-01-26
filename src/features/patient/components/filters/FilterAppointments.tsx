import React from "react";
import MCFilterSelect from "@/shared/components/filters/MCFilterSelect";
import { useFiltersStore } from "@/stores/useFiltersStore";

// Opciones de ejemplo, reemplaza por tus datos reales
const serviceTypeOptions = [
  { value: "consulta", label: "Consulta" },
  { value: "terapia", label: "Terapia" },
  { value: "examen", label: "Examen" },
];
const specialtyOptions = [
  { value: "cardiologia", label: "Cardiología" },
  { value: "psicologia", label: "Psicología" },
  { value: "nutricion", label: "Nutrición" },
];
const modalityOptions = [
  { value: "presencial", label: "Presencial" },
  { value: "online", label: "Online" },
];

function FilterAppointments() {
  const { filters, setFilters } = useFiltersStore();

  return (
    <div className="flex flex-col gap-4">
      <MCFilterSelect
        name="serviceTypes"
        label="Tipo de servicio"
        options={serviceTypeOptions}
        multiple
        value={filters.serviceTypes}
        onChange={(vals) => setFilters({ serviceTypes: vals as string[] })}
        searchable
      />
      <MCFilterSelect
        name="specialties"
        label="Especialidad"
        options={specialtyOptions}
        multiple
        value={filters.specialties}
        onChange={(vals) => setFilters({ specialties: vals as string[] })}
        searchable
      />
      <MCFilterSelect
        name="modalities"
        label="Modalidad"
        options={modalityOptions}
        multiple
        value={filters.modalities}
        onChange={(vals) => setFilters({ modalities: vals as string[] })}
      />
      {/* Ejemplo de filtro de rango de precio */}
      <div>
        <label className="block mb-1 text-primary">Precio</label>
        <input
          type="range"
          min={0}
          max={10000}
          step={100}
          value={filters.priceRange[1]}
          onChange={(e) =>
            setFilters({
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
