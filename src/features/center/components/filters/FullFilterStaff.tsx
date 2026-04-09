import React from "react";
import { MCFilterPopover } from "@/shared/components/filters/MCFilterPopover";
import MCFilterSelect from "@/shared/components/filters/MCFilterSelect";
import MCFilterDates from "@/shared/components/filters/MCFilterDates";
import { Star } from "lucide-react";
import { useTranslation } from "react-i18next";
import type { JSX } from "react";
import { useEspecialidades } from "@/features/onboarding/services";
import { AVAILABLE_LANGUAGES } from "@/features/onboarding/constants/languages.constants";

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
  const { t, i18n } = useTranslation("center");
  const { data: specialties = [], isLoading: specialtiesLoading } =
    useEspecialidades();

  const handleFilterChange = (name: string, value: any) => {
    onFiltersChange({ [name]: value });
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

  const specialtyOptions: OptionType[] = React.useMemo(() => {
    const apiOptions = specialties.map((specialty) => ({
      value: String(specialty.value),
      label: specialty.label,
    }));

    return [{ value: "all", label: t("staff.filters.allSpecialties") }, ...apiOptions];
  }, [specialties, t]);

  const languagesOptions: OptionType[] = React.useMemo(
    () => [
      { value: "all", label: t("staff.filters.allLanguages") },
      ...AVAILABLE_LANGUAGES.map((language) => ({
        value: language.code,
        label: i18n.language.startsWith("en") ? language.labelEn : language.label,
      })),
    ],
    [i18n.language, t],
  );

  const experienceOptions: OptionType[] = [
    { value: "all", label: t("staff.filters.allExperience") },
    { value: "0-2", label: t("staff.experience.0-2") },
    { value: "3-5", label: t("staff.experience.3-5") },
    { value: "6-10", label: t("staff.experience.6-10") },
    { value: "11-15", label: t("staff.experience.11-15") },
    { value: "16-20", label: t("staff.experience.16-20") },
    { value: "21-25", label: t("staff.experience.21-25") },
    { value: "25+", label: t("staff.experience.25+") },
  ];

  const statusOptions: OptionType[] = [
    { value: "all", label: t("staff.filters.allStatuses") },
    { value: "active", label: t("staff.status.active") },
    { value: "inactive", label: t("staff.status.inactive") },
    { value: "pending", label: t("staff.status.pending") },
    { value: "suspended", label: t("staff.status.suspended") },
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
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 w-full">
        <MCFilterSelect
          name="specialty"
          label={t("staff.filters.specialties")}
          placeholder={t("staff.filters.specialtiesPlaceholder")}
          options={specialtyOptions}
          value={filters.specialty}
          onChange={(value) => handleFilterChange("specialty", value)}
          multiple={true}
          noBadges={true}
          searchable={true}
          disabled={specialtiesLoading}
          status={specialtiesLoading ? "loading" : "default"}
          statusMessage={
            specialtiesLoading
              ? t("staff.filters.loadingSpecialties")
              : undefined
          }
        />

        <MCFilterSelect
          name="rating"
          label={t("staff.filters.ratingMinimum")}
          placeholder={t("staff.filters.ratingSelectPlaceholder")}
          options={rankingOptions}
          value={filters.rating}
          onChange={(value) => handleFilterChange("rating", value)}
          multiple={true}
          noBadges={true}
        />

        <MCFilterSelect
          name="languages"
          label={t("staff.filters.languages")}
          placeholder={t("staff.filters.languagesPlaceholder")}
          options={languagesOptions}
          value={filters.languages}
          onChange={(value) => handleFilterChange("languages", value)}
          multiple={true}
          noBadges={true}
          searchable={true}
        />

        <MCFilterSelect
          name="experience"
          label={t("staff.filters.experience")}
          placeholder={t("staff.filters.experiencePlaceholder")}
          options={experienceOptions}
          value={filters.experience}
          onChange={(value) => handleFilterChange("experience", value)}
          multiple={true}
          noBadges={true}
        />

        <MCFilterSelect
          name="status"
          label={t("staff.filters.status")}
          placeholder={t("staff.filters.statusPlaceholder")}
          options={statusOptions}
          value={filters.status}
          onChange={(value) => handleFilterChange("status", value)}
          multiple={true}
          noBadges={true}
        />

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
    </MCFilterPopover>
  );
}

export default FullFilterStaff;
