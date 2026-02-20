import { type JSX } from "react";
import { Stethoscope, MapPin } from "lucide-react";
import MCFilterSelect from "@/shared/components/filters/MCFilterSelect";
import MCFilterDates from "@/shared/components/filters/MCFilterDates";
import { useTranslation } from "react-i18next";
import { useIsMobile } from "@/lib/hooks/useIsMobile";

interface MyPatientFilters {
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

type OptionType = { value: string; label: string | JSX.Element };

function FilterMyPatients({ filters, onFiltersChange }: FilterMyPatientsProps) {
  const { t } = useTranslation("doctor");
  const isMobile = useIsMobile();

  const genderOptions: OptionType[] = [
    { value: "all", label: t("patients.filters.gender.all") },
    { value: "male", label: t("patients.filters.gender.male") },
    { value: "female", label: t("patients.filters.gender.female") },
  ];

  const specialtyOptions: OptionType[] = [
    { value: "all", label: t("patients.filters.specialty.all") },
    {
      value: "cardiologia",
      label: t("patients.filters.specialty.cardiology"),
    },
    {
      value: "cirugia-general",
      label: t("patients.filters.specialty.generalSurgery"),
    },
    {
      value: "endocrinologia",
      label: t("patients.filters.specialty.endocrinology"),
    },
    {
      value: "medicina-familiar",
      label: t("patients.filters.specialty.familyMedicine"),
    },
    {
      value: "fisioterapia",
      label: t("patients.filters.specialty.physiotherapy"),
    },
  ];

  const locationOptions: OptionType[] = [
    { value: "all", label: t("patients.filters.location.all") },
    {
      value: "clinica-santo-domingo",
      label: "Clínica Santo Domingo",
    },
    {
      value: "clinica-norte",
      label: "Clínica Norte",
    },
  ];

  const conditionOptions: OptionType[] = [
    { value: "all", label: t("patients.filters.condition.all") },
    { value: "yes", label: t("patients.filters.condition.withCondition") },
    { value: "no", label: t("patients.filters.condition.withoutCondition") },
  ];

  const allergyOptions: OptionType[] = [
    { value: "all", label: t("patients.filters.allergy.all") },
    { value: "yes", label: t("patients.filters.allergy.withAllergy") },
    { value: "no", label: t("patients.filters.allergy.withoutAllergy") },
  ];

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 w-full">
      <MCFilterSelect
        name="gender"
        label={t("patients.filters.labels.gender")}
        options={genderOptions}
        placeholder={t("patients.filters.placeholders.gender")}
        value={filters.gender}
        noBadges
        onChange={(v) =>
          onFiltersChange({ gender: typeof v === "string" ? v : (v[0] ?? "") })
        }
      />

      <MCFilterSelect
        name="specialty"
        label={t("patients.filters.labels.specialty")}
        options={specialtyOptions}
        placeholder={t("patients.filters.placeholders.specialty")}
        value={filters.specialty}
        noBadges
        onChange={(v) =>
          onFiltersChange({
            specialty: typeof v === "string" ? v : (v[0] ?? ""),
          })
        }
      />

      <MCFilterSelect
        name="location"
        label={t("patients.filters.labels.location")}
        options={locationOptions}
        placeholder={t("patients.filters.placeholders.location")}
        value={filters.location}
        noBadges
        onChange={(v) =>
          onFiltersChange({
            location: typeof v === "string" ? v : (v[0] ?? ""),
          })
        }
      />

      <MCFilterSelect
        name="hasCondition"
        label={t("patients.filters.labels.condition")}
        options={conditionOptions}
        placeholder={t("patients.filters.placeholders.condition")}
        value={filters.hasCondition}
        noBadges
        onChange={(v) =>
          onFiltersChange({
            hasCondition: typeof v === "string" ? v : (v[0] ?? ""),
          })
        }
      />

      <MCFilterSelect
        name="hasAllergy"
        label={t("patients.filters.labels.allergy")}
        options={allergyOptions}
        placeholder={t("patients.filters.placeholders.allergy")}
        value={filters.hasAllergy}
        noBadges
        onChange={(v) =>
          onFiltersChange({
            hasAllergy: typeof v === "string" ? v : (v[0] ?? ""),
          })
        }
      />

      <div className="w-full">
        <MCFilterDates
          label={t("patients.filters.labels.lastVisit")}
          value={filters.lastVisitRange}
          onChange={(lastVisitRange) => onFiltersChange({ lastVisitRange })}
        />
      </div>
    </div>
  );
}

export default FilterMyPatients;
