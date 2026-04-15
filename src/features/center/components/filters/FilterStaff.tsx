import { MCFilterPopover } from "@/shared/components/filters/MCFilterPopover";
import MCFilterSelect from "@/shared/components/filters/MCFilterSelect";
import MCFilterDates from "@/shared/components/filters/MCFilterDates";
import { Star } from "lucide-react";
import { useTranslation } from "react-i18next";
import type { JSX } from "react";
import { useEspecialidades } from "@/features/onboarding/services";

interface OptionType {
  value: string;
  label: string | JSX.Element;
}

interface FilterStaffProps {
  filters: {
    specialty: string | string[];
    rating: string | string[];
    joinDate: { from: Date | null; to: Date | null };
  };
  onFiltersChange: (filters: any) => void;
  onClearFilters: () => void;
  activeFiltersCount: number;
}

function FilterStaff({
  filters,
  onFiltersChange,
  onClearFilters,
  activeFiltersCount,
}: FilterStaffProps) {
  const { t } = useTranslation("center");

  const { data: especialidadesOptions = [], isLoading: isLoadingEspecialidades } = useEspecialidades();

  const specialtyLabel = isLoadingEspecialidades
    ? `${t("staff.filters.specialty")} (${t("staff.filters.loadingSpecialties")})`
    : t("staff.filters.specialty");

  const specialtyPlaceholder = isLoadingEspecialidades
    ? t("staff.filters.loadingSpecialties")
    : t("staff.filters.specialtyPlaceholder");

  const handleFilterChange = (name: string, value: any) => {
    onFiltersChange({ ...filters, [name]: value });
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
          {t("staff.filters.allRatings")}
        </span>
      ),
    },
  ];

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
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 w-full">
        <MCFilterSelect
          name="specialty"
          label={specialtyLabel}
          placeholder={specialtyPlaceholder}
          options={especialidadesOptions}
          value={filters.specialty}
          disabled={isLoadingEspecialidades}
          onChange={(value) => handleFilterChange("specialty", value)}
        />

        <MCFilterSelect
          name="rating"
          label={t("staff.filters.rating")}
          placeholder={t("staff.filters.ratingPlaceholder")}
          options={rankingOptions}
          value={filters.rating}
          onChange={(value) => handleFilterChange("rating", value)}
        />

        <div className="sm:col-span-2">
          <MCFilterDates
            label={t("staff.filters.connectionDate")}
            value={dateValue}
            onChange={(value) =>
              handleFilterChange("joinDate", {
                from: value?.[0] ?? null,
                to: value?.[1] ?? null,
              })
            }
          />
        </div>
      </div>
    </MCFilterPopover>
  );
}

export default FilterStaff;
