import { memo, useMemo } from "react";
import { useTranslation } from "react-i18next";
import MCFilterSelect from "@/shared/components/filters/MCFilterSelect";
import MCFilterDates from "@/shared/components/filters/MCFilterDates";
import { useEspecialidades } from "@/features/onboarding/services/useEspecialidades";
import { useUbicaciones } from "@/features/onboarding/services/useUbicaciones";

// ─── Types ────────────────────────────────────────────────────────────────────
export interface MyPatientFilters {
  gender: string;
  specialty: string;
  location: string;
  hasCondition: string;
  hasAllergy: string;
  lastVisitRange?: [Date, Date];
}

interface FilterMyPatientsProps {
  filters: MyPatientFilters;
  onFiltersChange: (filters: Partial<MyPatientFilters>) => void;
}

type SelectValue = string | string[];
const firstString = (v: SelectValue): string =>
  typeof v === "string" ? v : (v[0] ?? "");

// ─── Static option arrays (defined outside to avoid re-creation) ──────────────
// These use translation keys — built inside the component only once via useMemo.

function FilterMyPatients({ filters, onFiltersChange }: FilterMyPatientsProps) {
  const { t } = useTranslation("doctor");

  const { data: especialidades = [], isLoading: especialidadesLoading } =
    useEspecialidades();
  const {
    data: doctorLocations = [],
    isLoading: isLoadingLocations,
    isError: locationsError,
  } = useUbicaciones("doctor", {});

  // ─── Static options — recreated only when `t` identity changes (language switch)
  const genderOptions = useMemo(
    () => [
      { value: "all", label: t("patients.filters.gender.all") },
      { value: "m", label: t("patients.filters.gender.male") },
      { value: "f", label: t("patients.filters.gender.female") },
    ],
    [t]
  );

  const conditionOptions = useMemo(
    () => [
      { value: "all", label: t("patients.filters.condition.all") },
      { value: "yes", label: t("patients.filters.condition.withCondition") },
      { value: "no", label: t("patients.filters.condition.withoutCondition") },
    ],
    [t]
  );

  const allergyOptions = useMemo(
    () => [
      { value: "all", label: t("patients.filters.allergy.all") },
      { value: "yes", label: t("patients.filters.allergy.withAllergy") },
      { value: "no", label: t("patients.filters.allergy.withoutAllergy") },
    ],
    [t]
  );

  // ─── Dynamic options from API data ───────────────────────────────────────
  const locationOptions = useMemo(
    () =>
      doctorLocations.map((loc) => ({
        value: loc.id.toString(),
        label: loc.nombre,
      })),
    [doctorLocations]
  );


  const handleGenderChange = useMemo(
    () => (v: SelectValue) => onFiltersChange({ gender: firstString(v) }),
    [onFiltersChange]
  );
  const handleSpecialtyChange = useMemo(
    () => (v: SelectValue) => onFiltersChange({ specialty: firstString(v) }),
    [onFiltersChange]
  );
  const handleLocationChange = useMemo(
    () => (v: SelectValue) => onFiltersChange({ location: firstString(v) }),
    [onFiltersChange]
  );
  const handleConditionChange = useMemo(
    () => (v: SelectValue) => onFiltersChange({ hasCondition: firstString(v) }),
    [onFiltersChange]
  );
  const handleAllergyChange = useMemo(
    () => (v: SelectValue) => onFiltersChange({ hasAllergy: firstString(v) }),
    [onFiltersChange]
  );
  const handleDateChange = useMemo(
    () => (lastVisitRange: [Date, Date] | undefined) =>
      onFiltersChange({ lastVisitRange }),
    [onFiltersChange]
  );

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 w-full">
      <MCFilterSelect
        name="gender"
        label={t("patients.filters.labels.gender")}
        options={genderOptions}
        placeholder={t("patients.filters.placeholders.gender")}
        value={filters.gender}
        noBadges
        onChange={handleGenderChange}
      />

      <MCFilterSelect
        name="specialty"
        label={t("patients.filters.labels.specialty")}
        options={especialidades}
        placeholder={
          especialidadesLoading
            ? t("filters.loading")
            : t("filters.placeholders.specialty")
        }
        value={filters.specialty}
        noBadges
        onChange={handleSpecialtyChange}
        disabled={especialidadesLoading}
      />

      <MCFilterSelect
        name="location"
        label={t("patients.filters.labels.location")}
        options={locationOptions}
        placeholder={
          isLoadingLocations
            ? t("filters.loading")
            : t("patients.filters.placeholders.location")
        }
        value={filters.location}
        noBadges
        onChange={handleLocationChange}
        disabled={isLoadingLocations || locationsError}
      />

      <MCFilterSelect
        name="hasCondition"
        label={t("patients.filters.labels.condition")}
        options={conditionOptions}
        placeholder={t("patients.filters.placeholders.condition")}
        value={filters.hasCondition}
        noBadges
        onChange={handleConditionChange}
      />

      <MCFilterSelect
        name="hasAllergy"
        label={t("patients.filters.labels.allergy")}
        options={allergyOptions}
        placeholder={t("patients.filters.placeholders.allergy")}
        value={filters.hasAllergy}
        noBadges
        onChange={handleAllergyChange}
      />

      <div className="w-full">
        <MCFilterDates
          label={t("patients.filters.labels.lastVisit")}
          value={filters.lastVisitRange}
          onChange={handleDateChange}
        />
      </div>
    </div>
  );
}

// memo: skips re-render when parent re-renders but props are shallowly equal
export default memo(FilterMyPatients);