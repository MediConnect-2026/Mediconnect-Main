import MCFilterSelect from "@/shared/components/filters/MCFilterSelect";
import { useTranslation } from "react-i18next";

interface SearchProviderFilters {
  name: string;
  insuranceAccepted: string[];
  providerType: string[];
  modality: string;
  specialty: string[];
  gender: string;
  yearsOfExperience: number | null;
  languages: string;
  scheduledAppointments: string;
  rating: number | null;
  radio?: number | null;
}

interface FiltersSearchProvidersProps {
  searchFilters: SearchProviderFilters;
  onFilterChange: (key: string, values: string[]) => void;
  onYearsChange: (value: number | null) => void;
  isLoadingCentro: boolean;
  tiposCentroOptions: { value: string; label: string }[];
  isLoadingEspecialidades: boolean;
  especialidadesOptions: { value: string; label: string }[];
}

function FiltersSearchProviders({
  searchFilters,
  onFilterChange,
  onYearsChange,
  isLoadingCentro,
  tiposCentroOptions,
  isLoadingEspecialidades,
  especialidadesOptions,
}: FiltersSearchProvidersProps) {
  const { t } = useTranslation("common");

  const RATING_OPTIONS = [
    { value: "all", label: t("search.options.all") },
    { value: "4.5", label: t("search.options.rating.4.5") },
    { value: "4", label: t("search.options.rating.4") },
    { value: "3.5", label: t("search.options.rating.3.5") },
    { value: "3", label: t("search.options.rating.3") },
  ];

  const YEARS_OF_EXPERIENCE_OPTIONS = [
    { value: "all", label: t("search.options.all") },
    { value: "1", label: t("search.options.years.1") },
    { value: "3", label: t("search.options.years.3") },
    { value: "5", label: t("search.options.years.5") },
    { value: "10", label: t("search.options.years.10") },
  ];

  const RADIO_OPTIONS = [
    { value: "all", label: t("search.options.all") },
    { value: "5", label: t("search.options.radio.1") },
    { value: "10", label: t("search.options.radio.2") },
    { value: "20", label: t("search.options.radio.3") },
    { value: "30", label: t("search.options.radio.4") },
    { value: "40", label: t("search.options.radio.5") },
    { value: "50", label: t("search.options.radio.6") },
  ];

  const IDIOMAS_OPTIONS = [
    { value: "all", label: t("search.options.all") },
    { value: "Español", label: t("search.options.languages.spanish") },
    { value: "Inglés", label: t("search.options.languages.english") },
    { value: "Francés", label: t("search.options.languages.french") },
  ];

  const MODALIDAD_OPTIONS = [
    { value: "all", label: t("search.options.all") },
    { value: "presencial", label: t("search.options.modality.Presencial") },
    { value: "teleconsulta", label: t("search.options.modality.Virtual") },
    { value: "Mixta", label: t("search.options.modality.hibrido") },
  ];

  const GENERO_OPTIONS = [
    { value: "all", label: t("search.options.all") },
    { value: "M", label: t("search.options.gender.masculino") },
    { value: "F", label: t("search.options.gender.femenino") },
    { value: "O", label: t("search.options.gender.other") },
  ];

  const HORARIO_OPTIONS = [
    { value: "all", label: t("search.options.all") },
    { value: "mañana", label: t("search.options.schedule.mañana") },
    { value: "tarde", label: t("search.options.schedule.tarde") },
    { value: "noche", label: t("search.options.schedule.noche") },
  ];

  return (
    <div className="grid grid-cols-2 gap-4 w-full">
      <MCFilterSelect
        name="providerType"
        label={t("search.providerType", "Tipo de Proveedor")}
        options={[{ value: "all", label: t("search.options.all") }, ...tiposCentroOptions]}
        multiple
        disabled={isLoadingCentro}
        value={searchFilters.providerType}
        onChange={(values) =>
          onFilterChange(
            "providerType",
            Array.isArray(values) ? values : [values],
          )
        }
        noBadges
      />
      <MCFilterSelect
        name="specialty"
        label={t("search.specialty", "Especialidad")}
        options={[{ value: "all", label: t("search.options.all") }, ...especialidadesOptions]}
        multiple
        disabled={isLoadingEspecialidades}
        value={searchFilters.specialty}
        onChange={(values) =>
          onFilterChange(
            "specialty",
            Array.isArray(values) ? values : [values],
          )
        }
        noBadges
      />
      <MCFilterSelect
        name="modality"
        label={t("search.modality", "Modalidad")}
        options={MODALIDAD_OPTIONS}
        multiple={false}
        value={searchFilters.modality}
        onChange={(values) => {
          const val = Array.isArray(values) ? values[0] : values;
          onFilterChange("modality", [val]);
        }}
        noBadges
      />
      <MCFilterSelect
        name="gender"
        label={t("search.gender", "Género")}
        options={GENERO_OPTIONS}
        multiple={false}
        value={searchFilters.gender}
        onChange={(values) => {
          const val = Array.isArray(values) ? values[0] : values;
          onFilterChange("gender", [val]);
        }}
        noBadges
      />
      <MCFilterSelect
        name="languages"
        label={t("search.languages", "Idiomas")}
        options={IDIOMAS_OPTIONS}
        multiple={false}
        value={searchFilters.languages}
        onChange={(values) => {
          const val = Array.isArray(values) ? values[0] : values;
          onFilterChange("languages", [val]);
        }}
        noBadges
      />
      <MCFilterSelect
        name="scheduledAppointments"
        label={t("search.schedule", "Horario")}
        options={HORARIO_OPTIONS}
        multiple={false}
        value={searchFilters.scheduledAppointments}
        onChange={(values) => {
          const val = Array.isArray(values) ? values[0] : values;
          onFilterChange("scheduledAppointments", [val]);
        }}
        noBadges
      />
      <MCFilterSelect
        name="rating"
        label={t("search.rating", "Calificación")}
        options={RATING_OPTIONS}
        multiple
        noBadges
        value={
          searchFilters.rating !== null
            ? [String(searchFilters.rating)]
            : ["all"]
        }
        onChange={(values) =>
          onFilterChange("rating", Array.isArray(values) ? values : [values])
        }
      />
      <MCFilterSelect
        name="yearsOfExperience"
        label={t("search.yearsOfExperience" , "Años de Experiencia")}
        options={YEARS_OF_EXPERIENCE_OPTIONS}
        multiple={false}
        noBadges
        value={
          searchFilters.yearsOfExperience !== null
            ? String(searchFilters.yearsOfExperience)
            : "all"
        }
        onChange={(values) => {
          const val = Array.isArray(values) ? values[0] : values;
          const parsed = val === "all" ? null : Number(val);
          onYearsChange(parsed);
        }}
      />
      <MCFilterSelect
        name="radio"
        label={t("search.radio")}
        options={RADIO_OPTIONS}
        multiple={false}
        noBadges
        value={
          searchFilters.radio !== null
            ? String(searchFilters.radio)
            : "all"
        }
        onChange={(values) => {
          const val = Array.isArray(values) ? values[0] : values;
          onFilterChange("radio", [val]);
        }}
      />
    </div>
  );
}

export default FiltersSearchProviders;
