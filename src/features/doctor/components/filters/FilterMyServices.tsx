import { type JSX } from "react";
import { Star, DollarSign } from "lucide-react";
import MCFilterSelect from "@/shared/components/filters/MCFilterSelect";
import { useTranslation } from "react-i18next";
import { useIsMobile } from "@/lib/hooks/useIsMobile";
import { useEspecialidades } from "@/features/onboarding/services/useEspecialidades";

interface MyServiceFilters {
  servicio: string;
  especialidad: string;
  modalidad: string;
  precio: string;
  duracion: string;
  rating: number | null;
  estado: string;
}

interface FilterMyServicesProps {
  filters: MyServiceFilters;
  onFiltersChange: (filters: Partial<MyServiceFilters>) => void;
}

type OptionType = { value: string; label: string | JSX.Element };

function FilterMyServices({ filters, onFiltersChange }: FilterMyServicesProps) {
  const { t } = useTranslation("doctor");
  const isMobile = useIsMobile();

  const { data: especialidades = [], isLoading: isLoadingEspecialidades } = useEspecialidades();
  

  const modalidadOptions: OptionType[] = [
    { value: "presencial", label: t("filters.serviceTypes.presencial") },
    { value: "virtual", label: t("filters.serviceTypes.virtual") },
    { value: "mixta", label: t("filters.serviceTypes.mixta") },
  ];

  const precioOptions: OptionType[] = [
    {
      value: "0-1000",
      label: (
        <span
          className={`flex items-center gap-1 ${isMobile ? "text-xs" : ""}`}
        >
          <DollarSign className={isMobile ? "w-3 h-3" : "w-4 h-4"} />
          {t("filters.priceRanges.0_1000")}
        </span>
      ),
    },
    {
      value: "1000-3000",
      label: (
        <span
          className={`flex items-center gap-1 ${isMobile ? "text-xs" : ""}`}
        >
          <DollarSign className={isMobile ? "w-3 h-3" : "w-4 h-4"} />
          {t("filters.priceRanges.1000_3000")}
        </span>
      ),
    },
    {
      value: "3000-5000",
      label: (
        <span
          className={`flex items-center gap-1 ${isMobile ? "text-xs" : ""}`}
        >
          <DollarSign className={isMobile ? "w-3 h-3" : "w-4 h-4"} />
          {t("filters.priceRanges.3000_5000")}
        </span>
      ),
    },
    {
      value: "5000+",
      label: (
        <span
          className={`flex items-center gap-1 ${isMobile ? "text-xs" : ""}`}
        >
          <DollarSign className={isMobile ? "w-3 h-3" : "w-4 h-4"} />
          {t("filters.priceRanges.5000_plus")}
        </span>
      ),
    },
  ];

  const duracionOptions: OptionType[] = [
    {
      value: "corta",
      label: (
        <span
          className={`flex items-center gap-1 ${isMobile ? "text-xs" : ""}`}
        >
          {t("filters.duration.short")}
        </span>
      ),
    },
    {
      value: "media",
      label: (
        <span
          className={`flex items-center gap-1 ${isMobile ? "text-xs" : ""}`}
        >
          {t("filters.duration.medium")}
        </span>
      ),
    },
    {
      value: "larga",
      label: (
        <span
          className={`flex items-center gap-1 ${isMobile ? "text-xs" : ""}`}
        >
          {t("filters.duration.long")}
        </span>
      ),
    },
    {
      value: "extendida",
      label: (
        <span
          className={`flex items-center gap-1 ${isMobile ? "text-xs" : ""}`}
        >
          {t("filters.duration.extended")}
        </span>
      ),
    },
  ];

  const ratingOptions: OptionType[] = [
    {
      value: "4.5",
      label: (
        <span
          className={`flex items-center gap-1 ${isMobile ? "text-xs" : ""}`}
        >
          {t("filters.rating.4_5")}
          <Star
            className={`text-yellow-400 ${isMobile ? "w-3 h-3" : "w-4 h-4"}`}
            fill="currentColor"
          />
        </span>
      ),
    },
    {
      value: "4",
      label: (
        <span
          className={`flex items-center gap-1 ${isMobile ? "text-xs" : ""}`}
        >
          {t("filters.rating.4")}
          <Star
            className={`text-yellow-400 ${isMobile ? "w-3 h-3" : "w-4 h-4"}`}
            fill="currentColor"
          />
        </span>
      ),
    },
    {
      value: "3.5",
      label: (
        <span
          className={`flex items-center gap-1 ${isMobile ? "text-xs" : ""}`}
        >
          {t("filters.rating.3_5")}
          <Star
            className={`text-yellow-400 ${isMobile ? "w-3 h-3" : "w-4 h-4"}`}
            fill="currentColor"
          />
        </span>
      ),
    },
    {
      value: "0",
      label: (
        <span className={isMobile ? "text-xs" : ""}>
          {t("filters.rating.all")}
        </span>
      ),
    },
  ];

  const estadoOptions: OptionType[] = [
    { value: "all", label: t("filters.status.all") },
    { value: "active", label: t("filters.status.active") },
    { value: "inactive", label: t("filters.status.inactive") },
  ];

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 w-full">
      <MCFilterSelect
        name="especialidad"
        searchable
        label={t("filters.labels.specialty")}
        options={isLoadingEspecialidades ? [] : especialidades.map(e => ({ value: e.value, label: e.label }))}
        placeholder={isLoadingEspecialidades ? t("filters.loading") : t("filters.placeholders.specialty")}
        value={filters.especialidad}
        noBadges
        onChange={(v) =>
          onFiltersChange({
            especialidad: typeof v === "string" ? v : (v[0] ?? ""),
          })
        }
      />

      <MCFilterSelect
        name="tipo"
        label={t("filters.labels.serviceType")}
        options={modalidadOptions}
        placeholder={t("filters.placeholders.serviceType")}
        value={filters.modalidad}
        noBadges
        onChange={(v) =>
          onFiltersChange({
            modalidad: typeof v === "string" ? v : (v[0] ?? ""),
          })
        }
      />

      <MCFilterSelect
        name="precio"
        label={t("filters.labels.priceRange")}
        options={precioOptions}
        placeholder={t("filters.placeholders.priceRange")}
        value={filters.precio}
        noBadges
        onChange={(v) =>
          onFiltersChange({
            precio: typeof v === "string" ? v : (v[0] ?? ""),
          })
        }
      />

      <MCFilterSelect
        name="duracion"
        label={t("filters.labels.duration")}
        options={duracionOptions}
        placeholder={t("filters.placeholders.duration")}
        value={filters.duracion}
        noBadges
        onChange={(v) =>
          onFiltersChange({
            duracion: typeof v === "string" ? v : (v[0] ?? ""),
          })
        }
      />

      <MCFilterSelect
        name="rating"
        label={t("filters.labels.rating")}
        options={ratingOptions}
        placeholder={t("filters.placeholders.rating")}
        value={filters.rating !== null ? String(filters.rating) : "0"}
        noBadges
        onChange={(v) =>
          onFiltersChange({
            rating: v ? Number(Array.isArray(v) ? v[0] : v) : null,
          })
        }
      />

      <MCFilterSelect
        name="estado"
        label={t("filters.labels.status")}
        options={estadoOptions}
        placeholder={t("filters.placeholders.status")}
        value={filters.estado}
        noBadges
        onChange={(v) =>
          onFiltersChange({
            estado: typeof v === "string" ? v : (v[0] ?? ""),
          })
        }
      />
    </div>
  );
}

export default FilterMyServices;
