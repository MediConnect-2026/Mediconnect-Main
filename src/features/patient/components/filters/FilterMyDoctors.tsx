import React from "react";
import { Heart, Star } from "lucide-react";
import MCFilterSelect from "@/shared/components/filters/MCFilterSelect";
import { Label } from "@/shared/ui/label";
import { Switch } from "@/shared/ui/switch";
import { type JSX } from "react";
import { useTranslation } from "react-i18next";

interface DoctorFilters {
  specialty: string;
  languages: string[];
  acceptingInsurance: string[];
  yearsOfExperience: number | null;
  rating: number | null;
  isFavorite: boolean | null;
}

interface FilterMyDoctorsProps {
  filters: DoctorFilters;
  onFiltersChange: (filters: Partial<DoctorFilters>) => void;
}

type OptionType = { value: string; label: string | JSX.Element };

function FilterMyDoctors({ filters, onFiltersChange }: FilterMyDoctorsProps) {
  const { t } = useTranslation("patient");

  const specialties: OptionType[] = [
    {
      value: "cardiology",
      label: t("filters.specialties.cardiology", "Cardiología"),
    },
    {
      value: "dermatology",
      label: t("filters.specialties.dermatology", "Dermatología"),
    },
    {
      value: "pediatrics",
      label: t("filters.specialties.pediatrics", "Pediatría"),
    },
    {
      value: "neurology",
      label: t("filters.specialties.neurology", "Neurología"),
    },
    {
      value: "orthopedics",
      label: t("filters.specialties.orthopedics", "Ortopedia"),
    },
  ];

  const languages: OptionType[] = [
    { value: "es", label: t("filters.languages.es", "Español") },
    { value: "en", label: t("filters.languages.en", "Inglés") },
    { value: "fr", label: t("filters.languages.fr", "Francés") },
    { value: "pt", label: t("filters.languages.pt", "Portugués") },
  ];

  const insurances: OptionType[] = [
    { value: "senasa", label: t("filters.insurances.senasa", "SENASA") },
    { value: "palic", label: t("filters.insurances.palic", "PALIC") },
    { value: "humano", label: t("filters.insurances.humano", "Humano") },
    {
      value: "universal",
      label: t("filters.insurances.universal", "Universal"),
    },
  ];

  const experienceOptions: OptionType[] = [
    { value: "1", label: t("filters.experience.1", "1+ años") },
    { value: "3", label: t("filters.experience.3", "3+ años") },
    { value: "5", label: t("filters.experience.5", "5+ años") },
    { value: "10", label: t("filters.experience.10", "10+ años") },
  ];

  const rankingOptions: OptionType[] = [
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
    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 w-full h-full">
      <MCFilterSelect
        name="specialty"
        label={t("filters.labels.specialty", "Especialidad")}
        options={specialties}
        placeholder={t(
          "filters.placeholders.specialty",
          "Seleccionar especialidad",
        )}
        value={filters.specialty}
        noBadges
        onChange={(v) =>
          onFiltersChange({
            specialty: typeof v === "string" ? v : (v[0] ?? ""),
          })
        }
      />

      <MCFilterSelect
        name="languages"
        label={t("filters.labels.languages", "Idiomas")}
        options={languages}
        multiple
        searchable
        noBadges
        placeholder={t("filters.placeholders.languages", "Seleccionar idiomas")}
        value={filters.languages}
        onChange={(v) =>
          onFiltersChange({
            languages: Array.isArray(v) ? v : [v],
          })
        }
      />

      <MCFilterSelect
        name="acceptingInsurance"
        label={t("filters.labels.insurances", "Seguros")}
        options={insurances}
        multiple
        searchable
        noBadges
        placeholder={t(
          "filters.placeholders.insurances",
          "Seleccionar seguros",
        )}
        value={filters.acceptingInsurance}
        onChange={(v) =>
          onFiltersChange({
            acceptingInsurance: Array.isArray(v) ? v : [v],
          })
        }
      />

      <MCFilterSelect
        name="yearsOfExperience"
        label={t("filters.labels.experience", "Experiencia")}
        options={experienceOptions}
        noBadges
        placeholder={t(
          "filters.placeholders.yearsOfExperience",
          "Años de experiencia",
        )}
        value={
          filters.yearsOfExperience !== null
            ? String(filters.yearsOfExperience)
            : ""
        }
        onChange={(v) =>
          onFiltersChange({
            yearsOfExperience: v ? Number(Array.isArray(v) ? v[0] : v) : null,
          })
        }
      />

      <MCFilterSelect
        name="rating"
        label={t("filters.labels.ranking", "Calificación")}
        options={rankingOptions}
        noBadges
        placeholder={t("filters.placeholders.ranking", "Calificación mínima")}
        value={filters.rating !== null ? String(filters.rating) : "0"}
        onChange={(v) =>
          onFiltersChange({
            rating: v ? Number(Array.isArray(v) ? v[0] : v) : null,
          })
        }
      />

      <div className="flex items-center gap-2">
        <Switch
          checked={filters.isFavorite === true}
          onCheckedChange={(v) =>
            onFiltersChange({
              isFavorite: v ? true : null,
            })
          }
          id="only-favorites"
        />
        <Label
          htmlFor="only-favorites"
          className="text-primary flex items-center gap-2 cursor-pointer"
        >
          {t("filters.labels.onlyFavorites", "Solo favoritos")}
          <Heart className="w-5 h-5 text-red-500" fill="red" />
        </Label>
      </div>
    </div>
  );
}

export default FilterMyDoctors;
