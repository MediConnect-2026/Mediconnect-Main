import { type JSX } from "react";
import { Star, DollarSign } from "lucide-react";
import MCFilterSelect from "@/shared/components/filters/MCFilterSelect";
import { useTranslation } from "react-i18next";

interface ServiceFilters {
  modalidad: string;
  priceRange: string;
  duration: string;
  rating: number | null;
  status: string;
}

interface FiltersServicesProps {
  filters: ServiceFilters;
  onFiltersChange: (filters: Partial<ServiceFilters>) => void;
  owner?: boolean;
}

type OptionType = { value: string; label: string | JSX.Element };

function FiltersServices({
  filters,
  onFiltersChange,
  owner = false,
}: FiltersServicesProps) {
  const { t } = useTranslation("doctor");

  const serviceTypes: OptionType[] = [
    {
      value: "presencial",
      label: t("filters.serviceTypes.presencial", "Presencial"),
    },
    {
      value: "virtual",
      label: t("filters.serviceTypes.virtual", "Virtual"),
    },
    {
      value: "mixta",
      label: t("filters.serviceTypes.mixta", "Mixta"),
    },
  ];

  const priceRanges: OptionType[] = [
    {
      value: "0-1000",
      label: (
        <span className="flex items-center gap-1">
          <DollarSign className="w-4 h-4" />
          {t("filters.priceRanges.0_1000", "RD$0 - RD$1,000")}
        </span>
      ),
    },
    {
      value: "1000-3000",
      label: (
        <span className="flex items-center gap-1">
          <DollarSign className="w-4 h-4" />
          {t("filters.priceRanges.1000_3000", "RD$1,000 - RD$3,000")}
        </span>
      ),
    },
    {
      value: "3000-5000",
      label: (
        <span className="flex items-center gap-1">
          <DollarSign className="w-4 h-4" />
          {t("filters.priceRanges.3000_5000", "RD$3,000 - RD$5,000")}
        </span>
      ),
    },
    {
      value: "5000+",
      label: (
        <span className="flex items-center gap-1">
          <DollarSign className="w-4 h-4" />
          {t("filters.priceRanges.5000_plus", "RD$5,000+")}
        </span>
      ),
    },
  ];

  const durationOptions: OptionType[] = [
    {
      value: "corta",
      label: (
        <span className="flex items-center gap-1">
          {t("filters.duration.short", "Consulta corta (15-30 min)")}
        </span>
      ),
    },
    {
      value: "media",
      label: (
        <span className="flex items-center gap-1">
          {t("filters.duration.medium", "Consulta estándar (30-45 min)")}
        </span>
      ),
    },
    {
      value: "larga",
      label: (
        <span className="flex items-center gap-1">
          {t("filters.duration.long", "Consulta extendida (45-60 min)")}
        </span>
      ),
    },
    {
      value: "extendida",
      label: (
        <span className="flex items-center gap-1">
          {t("filters.duration.extended", "Consulta especializada (60+ min)")}
        </span>
      ),
    },
  ];

  const statusOptions: OptionType[] = [
    {
      value: "all",
      label: t("filters.status.all", "Todos"),
    },
    {
      value: "active",
      label: t("filters.status.active", "Activos"),
    },
    {
      value: "inactive",
      label: t("filters.status.inactive", "Inactivos"),
    },
  ];

  const ratingOptions: OptionType[] = [
    {
      value: "4.5",
      label: (
        <span className="flex items-center gap-1">
          {t("filters.rating.4_5", "4.5+")}
          <Star className="w-4 h-4 text-yellow-400" fill="currentColor" />
        </span>
      ),
    },
    {
      value: "4",
      label: (
        <span className="flex items-center gap-1">
          {t("filters.rating.4", "4.0+")}
          <Star className="w-4 h-4 text-yellow-400" fill="currentColor" />
        </span>
      ),
    },
    {
      value: "3.5",
      label: (
        <span className="flex items-center gap-1">
          {t("filters.rating.3_5", "3.5+")}
          <Star className="w-4 h-4 text-yellow-400" fill="currentColor" />
        </span>
      ),
    },
    {
      value: "3",
      label: (
        <span className="flex items-center gap-1">
          {t("filters.rating.3", "3.0+")}
          <Star className="w-4 h-4 text-yellow-400" fill="currentColor" />
        </span>
      ),
    },
    {
      value: "0",
      label: (
        <span className="flex items-center gap-1">
          {t("filters.rating.all", "Todas las calificaciones")}
        </span>
      ),
    },
  ];

  return (
    <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-3 gap-4 w-full h-full">
      <MCFilterSelect
        name="type"
        label={t("filters.labels.serviceType", "Tipo de servicio")}
        options={serviceTypes}
        placeholder={t("filters.placeholders.serviceType", "Seleccionar tipo")}
        value={filters.modalidad}
        noBadges
        onChange={(v) =>
          onFiltersChange({
            modalidad: typeof v === "string" ? v : (v[0] ?? ""),
          })
        }
      />

      <MCFilterSelect
        name="priceRange"
        label={t("filters.labels.priceRange", "Rango de precio")}
        options={priceRanges}
        placeholder={t("filters.placeholders.priceRange", "Seleccionar rango")}
        value={filters.priceRange}
        noBadges
        onChange={(v) =>
          onFiltersChange({
            priceRange: typeof v === "string" ? v : (v[0] ?? ""),
          })
        }
      />

      <MCFilterSelect
        name="duration"
        label={t("filters.labels.duration", "Duración de consulta")}
        options={durationOptions}
        placeholder={t("filters.placeholders.duration", "Seleccionar duración")}
        value={filters.duration}
        noBadges
        onChange={(v) =>
          onFiltersChange({
            duration: typeof v === "string" ? v : (v[0] ?? ""),
          })
        }
      />

      <MCFilterSelect
        name="rating"
        label={t("filters.labels.rating", "Calificación")}
        options={ratingOptions}
        noBadges
        placeholder={t("filters.placeholders.rating", "Calificación mínima")}
        value={filters.rating !== null ? String(filters.rating) : "0"}
        onChange={(v) =>
          onFiltersChange({
            rating: v ? Number(Array.isArray(v) ? v[0] : v) : null,
          })
        }
      />

      {/* Solo el owner puede filtrar por status */}
      {owner && (
        <MCFilterSelect
          name="status"
          label={t("filters.labels.status", "Estado")}
          options={statusOptions}
          placeholder={t("filters.placeholders.status", "Seleccionar estado")}
          value={filters.status}
          noBadges
          onChange={(v) =>
            onFiltersChange({
              status: typeof v === "string" ? v : (v[0] ?? ""),
            })
          }
        />
      )}
    </div>
  );
}

export default FiltersServices;
