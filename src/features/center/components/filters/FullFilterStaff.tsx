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

  const specialtyOptions: OptionType[] = [
    { value: "all", label: t("staff.filters.allSpecialties") },
    { value: "Cardiología", label: t("staff.specialties.cardiology") },
    { value: "Dermatología", label: t("staff.specialties.dermatology") },
    { value: "Pediatría", label: t("staff.specialties.pediatrics") },
    { value: "Neurología", label: t("staff.specialties.neurology") },
    {
      value: "Medicina Interna",
      label: t("staff.specialties.internalMedicine"),
    },
    { value: "Ginecología", label: t("staff.specialties.gynecology") },
    { value: "Traumatología", label: t("staff.specialties.traumatology") },
    { value: "Psiquiatría", label: t("staff.specialties.psychiatry") },
    { value: "Oftalmología", label: t("staff.specialties.ophthalmology") },
    {
      value: "Otorrinolaringología",
      label: t("staff.specialties.otolaryngology"),
    },
    { value: "Urología", label: t("staff.specialties.urology") },
    { value: "Endocrinología", label: t("staff.specialties.endocrinology") },
    {
      value: "Gastroenterología",
      label: t("staff.specialties.gastroenterology"),
    },
    { value: "Hematología", label: t("staff.specialties.hematology") },
    { value: "Infectología", label: t("staff.specialties.infectology") },
    { value: "Nefrología", label: t("staff.specialties.nephrology") },
    { value: "Neumología", label: t("staff.specialties.pulmonology") },
    { value: "Oncología", label: t("staff.specialties.oncology") },
    { value: "Reumatología", label: t("staff.specialties.rheumatology") },
  ];

  const languagesOptions: OptionType[] = [
    { value: "all", label: t("staff.filters.allLanguages") },
    { value: "es", label: t("staff.languages.es") },
    { value: "en", label: t("staff.languages.en") },
    { value: "fr", label: t("staff.languages.fr") },
    { value: "it", label: t("staff.languages.it") },
    { value: "pt", label: t("staff.languages.pt") },
    { value: "de", label: t("staff.languages.de") },
    { value: "ja", label: t("staff.languages.ja") },
    { value: "ko", label: t("staff.languages.ko") },
    { value: "zh", label: t("staff.languages.zh") },
    { value: "ru", label: t("staff.languages.ru") },
    { value: "ar", label: t("staff.languages.ar") },
  ];

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
