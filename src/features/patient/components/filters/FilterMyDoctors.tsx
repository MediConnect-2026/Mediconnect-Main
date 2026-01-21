import { Heart, Star } from "lucide-react";
import MCFilterSelect from "@/shared/components/filters/MCFilterSelect";
import { Label } from "@/shared/ui/label";
import { Switch } from "@/shared/ui/switch";
import { type JSX } from "react";
import { type DoctorFiltersSlice } from "@/stores/filters/doctorFilters.slice";
import { useTranslation } from "react-i18next";

type OptionType = { value: string; label: string | JSX.Element };

function FilterMyDoctors({
  doctorFilters,
  setDoctorFilters,
}: {
  doctorFilters: DoctorFiltersSlice["doctorFilters"];
  setDoctorFilters: DoctorFiltersSlice["setDoctorFilters"];
}) {
  const { t } = useTranslation("patient");

  const specialties: OptionType[] = [
    { value: "cardiology", label: t("filters.specialties.cardiology") },
    { value: "dermatology", label: t("filters.specialties.dermatology") },
    { value: "pediatrics", label: t("filters.specialties.pediatrics") },
    // ...otras especialidades
  ];

  const languages: OptionType[] = [
    { value: "es", label: t("filters.languages.es") },
    { value: "en", label: t("filters.languages.en") },
    { value: "fr", label: t("filters.languages.fr") },
    // ...otros idiomas
  ];

  const insurances: OptionType[] = [
    { value: "senasa", label: t("filters.insurances.senasa") },
    { value: "palic", label: t("filters.insurances.palic") },
    { value: "humano", label: t("filters.insurances.humano") },
    // ...otros seguros
  ];

  const experienceOptions: OptionType[] = [
    { value: "1", label: t("filters.experience.1") },
    { value: "3", label: t("filters.experience.3") },
    { value: "5", label: t("filters.experience.5") },
    { value: "10", label: t("filters.experience.10") },
  ];

  const rankingOptions: OptionType[] = [
    {
      value: "4.5",
      label: (
        <span className="flex items-center gap-1">
          {t("filters.ranking.4_5")}{" "}
          <Star className="w-4 h-4 text-yellow-400" />
        </span>
      ),
    },
    {
      value: "4",
      label: (
        <span className="flex items-center gap-1">
          {t("filters.ranking.4")} <Star className="w-4 h-4 text-yellow-400" />
        </span>
      ),
    },
    {
      value: "3.5",
      label: (
        <span className="flex items-center gap-1">
          {t("filters.ranking.3_5")}{" "}
          <Star className="w-4 h-4 text-yellow-400" />
        </span>
      ),
    },
    {
      value: "3",
      label: (
        <span className="flex items-center gap-1">
          {t("filters.ranking.3")} <Star className="w-4 h-4 text-yellow-400" />
        </span>
      ),
    },
    {
      value: "0",
      label: (
        <span className="flex items-center gap-1">
          {t("filters.ranking.all")}
        </span>
      ),
    },
  ];

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 w-full h-full">
      <MCFilterSelect
        name="specialty"
        label={t("filters.labels.specialty")}
        options={specialties}
        placeholder={t("filters.placeholders.specialty")}
        value={doctorFilters.specialty}
        onChange={(v) =>
          setDoctorFilters({
            ...doctorFilters,
            specialty: typeof v === "string" ? v : (v[0] ?? ""),
          })
        }
      />
      <MCFilterSelect
        name="languages"
        label={t("filters.labels.languages")}
        options={languages}
        multiple
        searchable
        placeholder={t("filters.placeholders.languages")}
        value={doctorFilters.languages}
        onChange={(v) =>
          setDoctorFilters({
            ...doctorFilters,
            languages: Array.isArray(v) ? v : [v],
          })
        }
      />
      <MCFilterSelect
        name="acceptingInsurance"
        label={t("filters.labels.insurances")}
        options={insurances}
        multiple
        searchable
        placeholder={t("filters.placeholders.insurances")}
        value={doctorFilters.acceptingInsurance}
        onChange={(v) =>
          setDoctorFilters({
            ...doctorFilters,
            acceptingInsurance: Array.isArray(v) ? v : [v],
          })
        }
      />
      <MCFilterSelect
        name="yearsOfExperience"
        label={t("filters.labels.experience")}
        options={experienceOptions}
        placeholder={t("filters.placeholders.yearsOfExperience")}
        value={
          doctorFilters.yearsOfExperience !== null
            ? String(doctorFilters.yearsOfExperience)
            : ""
        }
        onChange={(v) =>
          setDoctorFilters({
            ...doctorFilters,
            yearsOfExperience: v ? Number(Array.isArray(v) ? v[0] : v) : null,
          })
        }
      />
      <MCFilterSelect
        name="rating"
        label={t("filters.labels.ranking")}
        options={rankingOptions}
        placeholder={t("filters.placeholders.ranking")}
        value={
          doctorFilters.rating !== null ? String(doctorFilters.rating) : "0"
        }
        onChange={(v) =>
          setDoctorFilters({
            ...doctorFilters,
            rating: v ? Number(Array.isArray(v) ? v[0] : v) : null,
          })
        }
      />
      <div className="flex items-center gap-2">
        <Switch
          checked={doctorFilters.isFavorite === true}
          onCheckedChange={(v) =>
            setDoctorFilters({
              ...doctorFilters,
              isFavorite: v ? true : null,
            })
          }
          id="only-favorites"
        />
        <Label
          htmlFor="only-favorites"
          className="text-primary flex items-center gap-2 cursor-pointer"
        >
          {t("filters.labels.onlyFavorites")}{" "}
          <Heart className="w-5 h-5 text-red-500" fill="red" />
        </Label>
      </div>
    </div>
  );
}

export default FilterMyDoctors;
