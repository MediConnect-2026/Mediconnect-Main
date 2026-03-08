import React from "react";
import { MCFilterPopover } from "@/shared/components/filters/MCFilterPopover";
import MCFilterSelect from "@/shared/components/filters/MCFilterSelect";
import MCFilterDates from "@/shared/components/filters/MCFilterDates";
import { Star } from "lucide-react";
import { useTranslation } from "react-i18next";
import type { JSX } from "react";

interface OptionType {
  value: string;
  label: string | JSX.Element;
}

interface FullFilterStaffProps {
  filters: {
    specialty: string | string[];
    rating: string | string[];
    languages: string | string[];
    experience: string | string[];
    status: string | string[];
    joinDate: { from: Date | null; to: Date | null };
  };
  onFiltersChange: (filters: any) => void;
  onClearFilters: () => void;
  activeFiltersCount: number;
}

function FullFilterStaff({
  filters,
  onFiltersChange,
  onClearFilters,
  activeFiltersCount,
}: FullFilterStaffProps) {
  const { t } = useTranslation("center");

  const handleFilterChange = (name: string, value: any) => {
    onFiltersChange({
      [name]: value,
    });
  };

  const rankingOptions: OptionType[] = [
    {
      value: "4.5",
      label: (
        <span className="flex items-center gap-1">
          {"4.5+"}
          <Star className="w-4 h-4 text-yellow-400" fill="currentColor" />
        </span>
      ),
    },
    {
      value: "4",
      label: (
        <span className="flex items-center gap-1">
          {"4.0+"}
          <Star className="w-4 h-4 text-yellow-400" fill="currentColor" />
        </span>
      ),
    },
    {
      value: "3.5",
      label: (
        <span className="flex items-center gap-1">
          {"3.5+"}
          <Star className="w-4 h-4 text-yellow-400" fill="currentColor" />
        </span>
      ),
    },
    {
      value: "3",
      label: (
        <span className="flex items-center gap-1">
          {"3.0+"}
          <Star className="w-4 h-4 text-yellow-400" fill="currentColor" />
        </span>
      ),
    },
    {
      value: "0",
      label: (
        <span className="flex items-center gap-1">
          {"Todas las calificaciones"}
        </span>
      ),
    },
  ];
  // Especialidades médicas
  const specialtyOptions: OptionType[] = [
    { value: "all", label: "Todas las especialidades" },
    { value: "Cardiología", label: "Cardiología" },
    { value: "Dermatología", label: "Dermatología" },
    { value: "Pediatría", label: "Pediatría" },
    { value: "Neurología", label: "Neurología" },
    { value: "Medicina Interna", label: "Medicina Interna" },
    { value: "Ginecología", label: "Ginecología" },
    { value: "Traumatología", label: "Traumatología" },
    { value: "Psiquiatría", label: "Psiquiatría" },
    { value: "Oftalmología", label: "Oftalmología" },
    { value: "Otorrinolaringología", label: "Otorrinolaringología" },
    { value: "Urología", label: "Urología" },
    { value: "Endocrinología", label: "Endocrinología" },
    { value: "Gastroenterología", label: "Gastroenterología" },
    { value: "Hematología", label: "Hematología" },
    { value: "Infectología", label: "Infectología" },
    { value: "Nefrología", label: "Nefrología" },
    { value: "Neumología", label: "Neumología" },
    { value: "Oncología", label: "Oncología" },
    { value: "Reumatología", label: "Reumatología" },
  ];

  // Idiomas disponibles
  const languagesOptions: OptionType[] = [
    { value: "all", label: "Todos los idiomas" },
    { value: "es", label: "Español" },
    { value: "en", label: "Inglés" },
    { value: "fr", label: "Francés" },
    { value: "it", label: "Italiano" },
    { value: "pt", label: "Portugués" },
    { value: "de", label: "Alemán" },
    { value: "ja", label: "Japonés" },
    { value: "ko", label: "Coreano" },
    { value: "zh", label: "Chino" },
    { value: "ru", label: "Ruso" },
    { value: "ar", label: "Árabe" },
  ];

  // Rangos de experiencia
  const experienceOptions: OptionType[] = [
    { value: "all", label: "Toda la experiencia" },
    { value: "0-2", label: "0-2 años (Recién graduado)" },
    { value: "3-5", label: "3-5 años (Junior)" },
    { value: "6-10", label: "6-10 años (Intermedio)" },
    { value: "11-15", label: "11-15 años (Senior)" },
    { value: "16-20", label: "16-20 años (Experto)" },
    { value: "21-25", label: "21-25 años (Veterano)" },
    { value: "25+", label: "Más de 25 años (Eminencia)" },
  ];

  // Estados disponibles
  const statusOptions: OptionType[] = [
    { value: "all", label: "Todos los estados" },
    { value: "active", label: "Activos" },
    { value: "inactive", label: "Inactivos" },
    { value: "pending", label: "Pendientes" },
    { value: "suspended", label: "Suspendidos" },
  ];

  // Convierte { from, to } → [Date, Date] | undefined para MCFilterDates
  const dateValue: [Date, Date] | undefined =
    filters.joinDate.from && filters.joinDate.to
      ? [filters.joinDate.from, filters.joinDate.to]
      : filters.joinDate.from
        ? [filters.joinDate.from, filters.joinDate.from]
        : undefined;

  return (
    <MCFilterPopover
      activeFiltersCount={activeFiltersCount}
      onClearFilters={onClearFilters}
    >
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 w-full">
        {/* Especialidades Médicas - Múltiple con búsqueda */}

        <MCFilterSelect
          name="specialty"
          label="Especialidades Médicas"
          placeholder="Seleccionar especialidades..."
          options={specialtyOptions}
          value={filters.specialty}
          onChange={(value) => handleFilterChange("specialty", value)}
          multiple={true}
          noBadges={true}
          searchable={true}
        />

        {/* Calificación - Múltiple */}

        <MCFilterSelect
          name="rating"
          label="Calificación Mínima"
          placeholder="Seleccionar calificaciones..."
          options={rankingOptions}
          value={filters.rating}
          onChange={(value) => handleFilterChange("rating", value)}
          multiple={true}
          noBadges={true}
        />

        <MCFilterSelect
          name="languages"
          label="Idiomas que Habla"
          placeholder="Seleccionar idiomas..."
          options={languagesOptions}
          value={filters.languages}
          onChange={(value) => handleFilterChange("languages", value)}
          multiple={true}
          noBadges={true}
          searchable={true}
        />

        <MCFilterSelect
          name="experience"
          label="Años de Experiencia"
          placeholder="Seleccionar experiencia..."
          options={experienceOptions}
          value={filters.experience}
          onChange={(value) => handleFilterChange("experience", value)}
          multiple={true}
          noBadges={true}
        />

        <MCFilterSelect
          name="status"
          label="Estado del Personal"
          placeholder="Seleccionar estados..."
          options={statusOptions}
          value={filters.status}
          onChange={(value) => handleFilterChange("status", value)}
          multiple={true}
          noBadges={true}
        />

        {/* Fecha de Conexión - Rango de fechas */}

        <MCFilterDates
          label="Fecha de Conexión"
          value={dateValue}
          onChange={(value) =>
            handleFilterChange("joinDate", {
              from: value?.[0] ?? null,
              to: value?.[1] ?? null,
            })
          }
        />
      </div>
    </MCFilterPopover>
  );
}

export default FullFilterStaff;
