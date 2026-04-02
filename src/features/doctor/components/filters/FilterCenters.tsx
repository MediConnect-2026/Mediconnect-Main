import { Star } from "lucide-react";
import MCFilterSelect from "@/shared/components/filters/MCFilterSelect";
import { type JSX } from "react";
import { useTranslation } from "react-i18next";
import { useIsMobile } from "@/lib/hooks/useIsMobile";

interface CenterFilters {
  type: string;
  rating: number | null;
  isConnected: boolean | null;
}

interface FilterCentersProps {
  filters: CenterFilters;
  centerTypeOptions: OptionType[];
  isLoadingCenterTypes?: boolean;
  onFiltersChange: (filters: Partial<CenterFilters>) => void;
}

type OptionType = { value: string; label: string | JSX.Element };

function FilterCenters({
  filters,
  centerTypeOptions,
  isLoadingCenterTypes = false,
  onFiltersChange,
}: FilterCentersProps) {
  const { t } = useTranslation("doctor");
  const isMobile = useIsMobile();

  const ratingOptions: OptionType[] = [
    {
      value: "4.5",
      label: (
        <span className="flex items-center gap-1">
          {t("filters.rating.4_5", "4.5+")}
          <Star className="w-4 h-4 text-yellow-400" />
        </span>
      ),
    },
    {
      value: "4",
      label: (
        <span className="flex items-center gap-1">
          {t("filters.rating.4", "4.0+")}
          <Star className="w-4 h-4 text-yellow-400" />
        </span>
      ),
    },
    {
      value: "3.5",
      label: (
        <span className="flex items-center gap-1">
          {t("filters.rating.3_5", "3.5+")}
          <Star className="w-4 h-4 text-yellow-400" />
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
    <div
      className={`w-full h-full gap-4 ${
        isMobile ? "grid grid-cols-2" : "grid grid-cols-1 sm:grid-cols-2"
      }`}
    >
      {/* Filtros que pueden ver todos los usuarios */}
      <MCFilterSelect
        name="type"
        label={t("filters.labels.centerType", "Tipo de centro")}
        options={centerTypeOptions}
        placeholder={
          isLoadingCenterTypes
            ? t("filters.loadingCenterTypes", "Cargando tipos...")
            : t("filters.placeholders.centerType", "Seleccionar tipo")
        }
        disabled={isLoadingCenterTypes}
        value={filters.type}
        noBadges
        onChange={(v) =>
          onFiltersChange({
            type: typeof v === "string" ? v : (v[0] ?? ""),
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

    </div>
  );
}

export default FilterCenters;
