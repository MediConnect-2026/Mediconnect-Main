import { Heart, Star } from "lucide-react";
import MCFilterSelect from "@/shared/components/filters/MCFilterSelect";
import { Label } from "@/shared/ui/label";
import { Switch } from "@/shared/ui/switch";
import { type JSX, useMemo } from "react";
import { useTranslation } from "react-i18next";
import { useIsMobile } from "@/lib/hooks/useIsMobile";
import { useEspecialidades } from "@/features/onboarding/services";
import { useAvailableInsurances } from "../../hooks";
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
  const isMobile = useIsMobile();
  const { data: specialityOptions = [], isLoading: isSpecialityLoading } = useEspecialidades();
  const { data: availableInsurances = [], isLoading: isInsurancesLoading } = useAvailableInsurances();

  // Memoize static language options
  const languages: OptionType[] = useMemo(
    () => [
      { value: "es", label: t("filters.languages.es", "Español") },
      { value: "en", label: t("filters.languages.en", "Inglés") },
      { value: "fr", label: t("filters.languages.fr", "Francés") },
      { value: "pt", label: t("filters.languages.pt", "Portugués") },
    ],
    [t]
  );

  // Memoize insurance options from API data
  const insurances: OptionType[] = useMemo(() => {
    if (!availableInsurances || availableInsurances.length === 0) {
      // Fallback vacío si no hay datos
      return [];
    }

    return availableInsurances.map((insurance: any) => ({
      value: String(insurance.id),
      label: insurance.nombre
    }));
  }, [availableInsurances]);

  // Memoize experience options
  const experienceOptions: OptionType[] = useMemo(
    () => [
      { value: "1", label: t("filters.experience.1", "1+ años") },
      { value: "3", label: t("filters.experience.3", "3+ años") },
      { value: "5", label: t("filters.experience.5", "5+ años") },
      { value: "10", label: t("filters.experience.10", "10+ años") },
    ],
    [t]
  );

  // Memoize ranking options with JSX elements
  const rankingOptions: OptionType[] = useMemo(
    () => [
      {
        value: "4.5",
        label: (
          <span className="flex items-center gap-1">
            {t("filters.ranking.4_5", "4.5+")}
            <Star className="w-4 h-4 text-yellow-400" fill="currentColor" />
          </span>
        ),
      },
      {
        value: "4",
        label: (
          <span className="flex items-center gap-1">
            {t("filters.ranking.4", "4.0+")}
            <Star className="w-4 h-4 text-yellow-400" fill="currentColor" />
          </span>
        ),
      },
      {
        value: "3.5",
        label: (
          <span className="flex items-center gap-1">
            {t("filters.ranking.3_5", "3.5+")}
            <Star className="w-4 h-4 text-yellow-400" fill="currentColor" />
          </span>
        ),
      },
      {
        value: "3",
        label: (
          <span className="flex items-center gap-1">
            {t("filters.ranking.3", "3.0+")}
            <Star className="w-4 h-4 text-yellow-400" fill="currentColor" />
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
    ],
    [t]
  );

  return (
    <div
      className={`w-full h-full gap-4 grid ${
        isMobile ? "grid-cols-2" : "grid-cols-2"
      }`}
    >
      <MCFilterSelect
        name="specialty"
        label={t("filters.labels.specialty", "Especialidad")}
        options={specialityOptions}
        placeholder={
          isSpecialityLoading
            ? t("filters.placeholders.loadingSpecialty", "Cargando especialidades...")
            : t("filters.placeholders.specialty", "Seleccionar especialidad")
        }
        value={filters.specialty}
        noBadges
        disabled={isSpecialityLoading}
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
        disabled={isInsurancesLoading}
        placeholder={
          isInsurancesLoading
            ? t("filters.placeholders.loadingInsurances", "Cargando seguros...")
            : t("filters.placeholders.insurances", "Seleccionar seguros")
        }
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
