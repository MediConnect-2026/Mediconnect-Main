import MCFilterSelect from "@/shared/components/filters/MCFilterSelect";
import { useTranslation } from "react-i18next";
import { Star } from "lucide-react";
interface AppointmentFilters {
  serviceTypes: string[];
  specialties: string[];
  modalities: string[];
  priceRange: [number, number];
  rating: number;
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

  // Opciones de tipos de servicio
  const serviceTypeOptions = [
    {
      value: "consultation",
      label: t("filters.serviceTypes.consultation", "Consulta General"),
    },
    {
      value: "treatment",
      label: t("filters.serviceTypes.treatment", "Tratamiento"),
    },
    {
      value: "therapy",
      label: t("filters.serviceTypes.therapy", "Terapia"),
    },
    {
      value: "exam",
      label: t("filters.serviceTypes.exam", "Examen"),
    },
  ];

  // Opciones de especialidades
  const specialtyOptions = [
    {
      value: "cardiology",
      label: t("filters.specialties.cardiology", "Cardiología"),
    },
    {
      value: "dermatology",
      label: t("filters.specialties.dermatology", "Dermatología"),
    },
    {
      value: "psychology",
      label: t("filters.specialties.psychology", "Psicología"),
    },
    {
      value: "nutrition",
      label: t("filters.specialties.nutrition", "Nutrición"),
    },
    {
      value: "pediatrics",
      label: t("filters.specialties.pediatrics", "Pediatría"),
    },
  ];

  // Opciones de modalidad
  const modalityOptions = [
    {
      value: "presencial",
      label: t("filters.modalities.inPerson", "Presencial"),
    },
    {
      value: "teleconsulta",
      label: t("filters.modalities.virtual", "Teleconsulta"),
    },
    {
      value: "mixta",
      label: t("filters.modalities.mixed", "Mixta"),
    },
  ];

  // Opciones de rating
  const rankingOptions = [
    {
      value: "4.5",
      label: (
        <span className="flex items-center gap-1">
          {t("filters.ranking.4_5", "4.5+")}
          <Star className="w-4 h-4 text-yellow-400" />
        </span>
      ),
    },
    {
      value: "4",
      label: (
        <span className="flex items-center gap-1">
          {t("filters.ranking.4", "4.0+")}
          <Star className="w-4 h-4 text-yellow-400" />
        </span>
      ),
    },
    {
      value: "3.5",
      label: (
        <span className="flex items-center gap-1">
          {t("filters.ranking.3_5", "3.5+")}
          <Star className="w-4 h-4 text-yellow-400" />
        </span>
      ),
    },
    {
      value: "3",
      label: (
        <span className="flex items-center gap-1">
          {t("filters.ranking.3", "3.0+")}
          <Star className="w-4 h-4 text-yellow-400" />
        </span>
      ),
    },
    {
      value: "0",
      label: (
        <span className="flex items-center gap-1">
          {t("filters.ranking.all", "Todas las calificaciones")}
        </span>
      ),
    },
  ];

  return (
    <div className="grid grid-cols-2 gap-4">
      {/* Filtro de Tipo de Servicio */}
      <MCFilterSelect
        name="serviceTypes"
        label={t("filters.labels.serviceType", "Tipo de Servicio")}
        options={serviceTypeOptions}
        multiple
        noBadges
        value={filters.serviceTypes}
        onChange={(vals) => onFiltersChange({ serviceTypes: vals as string[] })}
        searchable
      />

      {/* Filtro de Especialidad */}
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

      {/* Filtro de Modalidad */}
      <MCFilterSelect
        name="modalities"
        label={t("filters.labels.modalities", "Modalidad")}
        options={modalityOptions}
        multiple
        noBadges
        value={filters.modalities}
        onChange={(vals) => onFiltersChange({ modalities: vals as string[] })}
      />

      {/* Filtro de Rating */}
      <MCFilterSelect
        name="rating"
        label={t("filters.labels.rating", "Calificación")}
        options={rankingOptions}
        value={filters.rating.toString()}
        onChange={(val) => onFiltersChange({ rating: Number(val) })}
      />

      {/* Filtro de Rango de Precio */}
      <div className="col-span-2">
        <label className="block mb-2 text-sm font-medium text-primary">
          {t("filters.labels.price", "Rango de Precio")}
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
        <div className="flex justify-between text-xs mt-2 text-primary/70">
          <span>RD${filters.priceRange[0].toLocaleString()}</span>
          <span>RD${filters.priceRange[1].toLocaleString()}</span>
        </div>
      </div>
    </div>
  );
}

export default FilterAppointments;
