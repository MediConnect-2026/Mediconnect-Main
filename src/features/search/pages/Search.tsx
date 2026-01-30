import { useState, useMemo, useCallback, memo } from "react";
import DoctorSearchBar from "@/features/patient/components/DoctorSearchBar";
import MCFilterSelect from "@/shared/components/filters/MCFilterSelect";
import { DoctorCards } from "../components/DoctorCards";
import { CenterCards } from "../components/CenterCards";
import {
  allProviders,
  type Provider,
  type Doctor,
  type Clinic,
} from "@/data/providers";
import {
  Empty,
  EmptyContent,
  EmptyDescription,
  EmptyTitle,
} from "@/shared/ui/empty";
import MapSearchProviders from "@/shared/components/maps/MapSearchProviders";
import { useTranslation } from "react-i18next";
import { fadeInUp } from "@/lib/animations/commonAnimations";
import { motion } from "framer-motion";
import MCButton from "@/shared/components/forms/MCButton";
import CompareModal from "../components/CompareModal";
import { useIsMobile } from "@/lib/hooks/useIsMobile";
import { Map as MapIcon, List as ListIcon } from "lucide-react";
import { MCFilterPopover } from "@/shared/components/filters/MCFilterPopover";
import FiltersSearchProviders from "../components/filters/FiltersSearchProviders";

// Interfaz para filtros de búsqueda
interface SearchProviderFilters {
  name: string;
  insuranceAccepted: string[];
  providerType: string[];
  modality: string[];
  specialty: string[];
  gender: string[];
  yearsOfExperience: number | null;
  languages: string[];
  scheduledAppointments: string[];
  rating: number | null;
}

// ✅ OPTIMIZACIÓN 1: Mover constantes fuera del componente
const TIPO_PROVEEDOR_OPTIONS = [
  { value: "all", label: "Todos" },
  { value: "doctor", label: "Doctor" },
  { value: "hospital", label: "Hospital" },
  { value: "clinic", label: "Clínica" },
];

const ESPECIALIDAD_OPTIONS = [
  { value: "all", label: "Todos" },
  { value: "Cardiología", label: "Cardiología" },
  { value: "Pediatría", label: "Pediatría" },
  { value: "Dermatología", label: "Dermatología" },
  { value: "Medicina General", label: "Medicina General" },
  { value: "Ginecología", label: "Ginecología" },
  { value: "Neurología", label: "Neurología" },
  { value: "Psiquiatría", label: "Psiquiatría" },
];

const MODALIDAD_OPTIONS = [
  { value: "all", label: "Todos" },
  { value: "presencial", label: "Presencial" },
  { value: "virtual", label: "Virtual" },
  { value: "hibrido", label: "Híbrido" },
];

const GENERO_OPTIONS = [
  { value: "all", label: "Todos" },
  { value: "masculino", label: "Masculino" },
  { value: "femenino", label: "Femenino" },
];

const IDIOMAS_OPTIONS = [
  { value: "all", label: "Todos" },
  { value: "Español", label: "Español" },
  { value: "Inglés", label: "Inglés" },
  { value: "Francés", label: "Francés" },
];

const HORARIO_OPTIONS = [
  { value: "all", label: "Todos" },
  { value: "mañana", label: "Mañana" },
  { value: "tarde", label: "Tarde" },
  { value: "noche", label: "Noche" },
];

const CALIFICACION_OPTIONS = [
  { value: "all", label: "Todos" },
  { value: "4.5", label: "4.5 estrellas o más" },
  { value: "4", label: "4 estrellas o más" },
  { value: "3.5", label: "3.5 estrellas o más" },
  { value: "3", label: "3 estrellas o más" },
];

const YEARS_OF_EXPERIENCE_OPTIONS = [
  { value: "all", label: "Todos" },
  { value: "1", label: "1 año o más" },
  { value: "3", label: "3 años o más" },
  { value: "5", label: "5 años o más" },
  { value: "10", label: "10 años o más" },
];

// ✅ OPTIMIZACIÓN 2: Función pura para filtrar (fuera del componente)
const filterProvider = (
  provider: Provider,
  searchFilters: SearchProviderFilters,
): boolean => {
  // Filtro por nombre
  if (
    searchFilters.name &&
    !provider.name.toLowerCase().includes(searchFilters.name.toLowerCase())
  ) {
    return false;
  }

  // Filtro por tipo de proveedor
  if (
    searchFilters.providerType?.length > 0 &&
    !searchFilters.providerType.includes("all") &&
    !searchFilters.providerType.includes(provider.type)
  ) {
    return false;
  }

  // Filtro por especialidad (solo para doctores)
  if (
    searchFilters.specialty?.length > 0 &&
    !searchFilters.specialty.includes("all") &&
    provider.type === "doctor"
  ) {
    const doctor = provider as Doctor;
    if (
      !doctor.specialty ||
      !searchFilters.specialty.includes(doctor.specialty)
    ) {
      return false;
    }
  }

  // Filtro por modalidad
  if (
    searchFilters.modality?.length > 0 &&
    !searchFilters.modality.includes("all")
  ) {
    const providerModality = (provider as any).modality;
    if (
      !providerModality ||
      !searchFilters.modality.includes(providerModality)
    ) {
      return false;
    }
  }

  // Filtro por género (solo para doctores)
  if (
    searchFilters.gender?.length > 0 &&
    !searchFilters.gender.includes("all") &&
    provider.type === "doctor"
  ) {
    const doctorGender = (provider as any).gender;
    if (!doctorGender || !searchFilters.gender.includes(doctorGender)) {
      return false;
    }
  }

  // Filtro por idiomas
  if (
    searchFilters.languages?.length > 0 &&
    !searchFilters.languages.includes("all")
  ) {
    const providerLanguages = (provider as any).languages || [];
    const hasMatchingLanguage = searchFilters.languages.some((lang: string) =>
      providerLanguages.includes(lang),
    );
    if (!hasMatchingLanguage) {
      return false;
    }
  }

  // Filtro por horarios disponibles
  if (
    searchFilters.scheduledAppointments?.length > 0 &&
    !searchFilters.scheduledAppointments.includes("all")
  ) {
    const providerSchedule = (provider as any).schedule || [];
    const hasMatchingSchedule = searchFilters.scheduledAppointments.some(
      (schedule: string) => providerSchedule.includes(schedule),
    );
    if (!hasMatchingSchedule) {
      return false;
    }
  }

  // Filtro por calificación
  if (searchFilters.rating !== null && searchFilters.rating !== undefined) {
    const ratingArray = Array.isArray(searchFilters.rating)
      ? searchFilters.rating
      : [String(searchFilters.rating)];

    if (!ratingArray.includes("all") && ratingArray.length > 0) {
      const minRating = Math.min(
        ...ratingArray
          .map((r: any) => Number(r))
          .filter((r: number) => !isNaN(r)),
      );
      if (!provider.rating || provider.rating < minRating) {
        return false;
      }
    }
  }

  // Filtro por años de experiencia (solo para doctores)
  if (searchFilters.yearsOfExperience !== null && provider.type === "doctor") {
    const doctorExperience = (provider as any).yearsOfExperience;
    if (
      !doctorExperience ||
      doctorExperience < searchFilters.yearsOfExperience
    ) {
      return false;
    }
  }

  // Filtro por seguros aceptados
  if (
    searchFilters.insuranceAccepted?.length > 0 &&
    !searchFilters.insuranceAccepted.includes("all")
  ) {
    const providerInsurance = (provider as any).insuranceAccepted || [];
    const hasMatchingInsurance = searchFilters.insuranceAccepted.some(
      (insurance: string) => providerInsurance.includes(insurance),
    );
    if (!hasMatchingInsurance) {
      return false;
    }
  }

  return true;
};

// ✅ OPTIMIZACIÓN 3: Memoizar componente de lista vacía
const EmptyState = memo(() => {
  const { t } = useTranslation("common");
  return (
    <Empty>
      <EmptyContent>
        <EmptyTitle>
          {t("search.noProvidersFound", "Sin resultados")}
        </EmptyTitle>
        <EmptyDescription className="text-xs sm:text-sm">
          {t(
            "search.noResultsDescription",
            "Intenta cambiar los filtros o la búsqueda.",
          )}
        </EmptyDescription>
      </EmptyContent>
    </Empty>
  );
});
EmptyState.displayName = "EmptyState";

// ✅ OPTIMIZACIÓN 4: Memoizar componente de card individual
const ProviderCard = memo(
  ({
    provider,
    isSelected,
    isConnected,
    onSelect,
    onConnect,
    onViewProfile,
  }: {
    provider: Provider;
    isSelected: boolean;
    isConnected: boolean;
    onSelect: (id: string) => void;
    onConnect: (id: string) => void;
    onViewProfile: (id: string) => void;
  }) => {
    if (provider.type === "doctor") {
      return (
        <DoctorCards
          doctor={provider as Doctor}
          isSelected={isSelected}
          onSelect={onSelect}
          onViewProfile={onViewProfile}
        />
      );
    } else {
      return (
        <CenterCards
          clinic={provider as Clinic}
          isConnected={isConnected}
          onConnect={onConnect}
          onViewProfile={onViewProfile}
        />
      );
    }
  },
);
ProviderCard.displayName = "ProviderCard";

// ✅ OPTIMIZACIÓN 5: Memoizar barra de comparación
const ComparisonBar = memo(
  ({
    selectedCount,
    providers,
    onRemove,
  }: {
    selectedCount: number;
    providers: Provider[];
    onRemove: (id: string) => void;
  }) => {
    const { t } = useTranslation("common");

    if (selectedCount === 0) return null;

    return (
      <motion.div
        initial={{ y: 100, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        exit={{ y: 100, opacity: 0 }}
        transition={{ type: "spring", stiffness: 300, damping: 30 }}
        className="fixed bottom-0 left-0 right-0 z-30 bg-background dark:bg-bg-btn-secondary shadow-lg border-t border-primary/15 md:max-w-lg md:left-1/2 md:right-auto md:-translate-x-1/2 md:rounded-t-2xl md:border md:border-b-0"
      >
        <div className="flex items-center gap-4 px-3 py-2.5 sm:px-4 w-fit">
          <span className="text-xs sm:text-sm text-primary">
            {t("search.selectedProviders", {
              count: selectedCount,
              max: 5,
              defaultValue: "{{count}}/{{max}} para comparar",
            })}
          </span>
          <CompareModal
            selectedProviders={providers}
            onRemoveProvider={onRemove}
          >
            <MCButton className={selectedCount < 2 ? "hidden" : ""} size="s">
              {t("search.compare", "Comparar")}
            </MCButton>
          </CompareModal>
        </div>
      </motion.div>
    );
  },
);
ComparisonBar.displayName = "ComparisonBar";

// ✅ OPTIMIZACIÓN 6: Memoizar filtros de desktop
const DesktopFilters = memo(
  ({
    searchFilters,
    onFilterChange,
    onYearsChange,
    t,
  }: {
    searchFilters: SearchProviderFilters;
    onFilterChange: (key: string, values: string[]) => void;
    onYearsChange: (value: number | null) => void;
    t: any;
  }) => {
    return (
      <div className="flex gap-2 w-full justify-end max-w-6xl">
        <MCFilterSelect
          name="providerType"
          placeholder={t("search.providerType", "Tipo")}
          options={TIPO_PROVEEDOR_OPTIONS}
          multiple
          noBadges
          value={searchFilters.providerType}
          onChange={(values) =>
            onFilterChange(
              "providerType",
              Array.isArray(values) ? values : [values],
            )
          }
        />
        <MCFilterSelect
          name="specialty"
          placeholder={t("search.specialty", "Especialidad")}
          options={ESPECIALIDAD_OPTIONS}
          multiple
          noBadges
          value={searchFilters.specialty}
          onChange={(values) =>
            onFilterChange(
              "specialty",
              Array.isArray(values) ? values : [values],
            )
          }
        />
        <MCFilterSelect
          name="modality"
          placeholder={t("search.modality", "Modalidad")}
          options={MODALIDAD_OPTIONS}
          multiple
          noBadges
          value={searchFilters.modality}
          onChange={(values) =>
            onFilterChange(
              "modality",
              Array.isArray(values) ? values : [values],
            )
          }
        />
        <MCFilterSelect
          name="gender"
          placeholder={t("search.gender", "Género")}
          options={GENERO_OPTIONS}
          multiple
          noBadges
          value={searchFilters.gender}
          onChange={(values) =>
            onFilterChange("gender", Array.isArray(values) ? values : [values])
          }
        />
        <MCFilterSelect
          name="languages"
          placeholder={t("search.languages", "Idiomas")}
          options={IDIOMAS_OPTIONS}
          multiple
          noBadges
          value={searchFilters.languages}
          onChange={(values) =>
            onFilterChange(
              "languages",
              Array.isArray(values) ? values : [values],
            )
          }
        />
        <MCFilterSelect
          name="scheduledAppointments"
          placeholder={t("search.schedule", "Horario")}
          options={HORARIO_OPTIONS}
          multiple
          noBadges
          value={searchFilters.scheduledAppointments}
          onChange={(values) =>
            onFilterChange(
              "scheduledAppointments",
              Array.isArray(values) ? values : [values],
            )
          }
        />
        <MCFilterSelect
          name="rating"
          placeholder={t("search.rating", "Calificación")}
          options={CALIFICACION_OPTIONS}
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
          placeholder={t("search.yearsOfExperience")}
          options={YEARS_OF_EXPERIENCE_OPTIONS}
          multiple={false}
          noBadges
          value={
            searchFilters.yearsOfExperience !== null
              ? [String(searchFilters.yearsOfExperience)]
              : ["all"]
          }
          onChange={(values) => {
            const val =
              Array.isArray(values) && values[0] !== "all"
                ? Number(values[0])
                : null;
            onYearsChange(val);
          }}
        />
      </div>
    );
  },
);
DesktopFilters.displayName = "DesktopFilters";

function Search() {
  const { t } = useTranslation("common");
  const isMobile = useIsMobile();
  const [showMap, setShowMap] = useState(false);

  // Estados para selección
  const [selectedProviders, setSelectedProviders] = useState<string[]>([]);
  const [connectedClinics, setConnectedClinics] = useState<string[]>([]);

  // Estados locales para filtros con useState
  const [searchFilters, setSearchFilters] = useState<SearchProviderFilters>({
    name: "",
    insuranceAccepted: ["all"],
    providerType: ["all"],
    modality: ["all"],
    specialty: ["all"],
    gender: ["all"],
    yearsOfExperience: null,
    languages: ["all"],
    scheduledAppointments: ["all"],
    rating: null,
  });

  // ✅ OPTIMIZACIÓN 7: Memoizar conteo de filtros activos
  const activeFiltersCount = useMemo(() => {
    let count = 0;
    Object.entries(searchFilters).forEach(([key, value]) => {
      if (Array.isArray(value) && value.length > 0 && !value.includes("all"))
        count++;
      else if (typeof value === "string" && value.trim() !== "") count++;
      else if (typeof value === "number" && value !== null) count++;
    });
    return count;
  }, [searchFilters]);

  // ✅ OPTIMIZACIÓN 8: useCallback para limpiar filtros
  const handleClearFilters = useCallback(() => {
    setSearchFilters({
      name: "",
      insuranceAccepted: ["all"],
      providerType: ["all"],
      modality: ["all"],
      specialty: ["all"],
      gender: ["all"],
      yearsOfExperience: null,
      languages: ["all"],
      scheduledAppointments: ["all"],
      rating: null,
    });
  }, []);

  // Función para actualizar filtros
  const updateSearchFilters = useCallback(
    (newFilters: Partial<SearchProviderFilters>) => {
      setSearchFilters((prev) => ({ ...prev, ...newFilters }));
    },
    [],
  );

  // ✅ OPTIMIZACIÓN 9: Memoizar proveedores filtrados
  const filteredProviders = useMemo(() => {
    return allProviders.filter((provider) =>
      filterProvider(provider, searchFilters),
    );
  }, [searchFilters]);

  // ✅ OPTIMIZACIÓN 10: useCallback para handlers
  const handleProviderSelect = useCallback((id: string) => {
    setSelectedProviders((prev) =>
      prev.includes(id)
        ? prev.filter((pid) => pid !== id)
        : prev.length < 5
          ? [...prev, id]
          : prev,
    );
  }, []);

  const handleClinicConnect = useCallback((id: string) => {
    setConnectedClinics((prev) =>
      prev.includes(id) ? prev.filter((cid) => cid !== id) : [...prev, id],
    );
  }, []);

  const handleViewProfile = useCallback((id: string) => {
    console.log("Ver perfil de:", id);
  }, []);

  const handleRemoveFromComparison = useCallback((id: string) => {
    setSelectedProviders((prev) => prev.filter((pid) => pid !== id));
  }, []);

  const handleFilterChange = useCallback(
    (filterKey: string, values: string[]) => {
      updateSearchFilters({
        [filterKey]: values,
      });
    },
    [updateSearchFilters],
  );

  const handleYearsChange = useCallback(
    (value: number | null) => {
      updateSearchFilters({
        yearsOfExperience: value,
      });
    },
    [updateSearchFilters],
  );

  const toggleMapView = useCallback(() => {
    setShowMap((prev) => !prev);
  }, []);

  // ✅ OPTIMIZACIÓN 11: Memoizar proveedores seleccionados
  const selectedProvidersData = useMemo(
    () =>
      allProviders.filter((provider) =>
        selectedProviders.includes(provider.id),
      ),
    [selectedProviders],
  );

  return (
    <div className="min-h-screen flex flex-col bg-background rounded-4xl">
      {/* Barra de búsqueda */}
      <motion.div
        {...fadeInUp}
        className="top-0 z-20 bg-background rounded-t-4xl"
      >
        <div className="px-3 py-4 sm:px-4 sm:py-6 md:px-6 md:py-8 lg:px-12">
          <div className="flex flex-col gap-4 justify-center items-center">
            <DoctorSearchBar />

            {/* Filtros - Mobile usa popover, Desktop usa grid */}
            {isMobile ? (
              <div className="flex gap-2 w-full">
                <MCFilterPopover
                  activeFiltersCount={activeFiltersCount}
                  onClearFilters={handleClearFilters}
                >
                  <FiltersSearchProviders
                    searchProviderFilters={searchFilters}
                    setSearchProviderFilters={updateSearchFilters}
                  />
                </MCFilterPopover>
                <MCButton
                  variant="outline"
                  size="sm"
                  onClick={toggleMapView}
                  className="flex items-center gap-2"
                >
                  {showMap ? <ListIcon size={16} /> : <MapIcon size={16} />}
                  {showMap
                    ? t("search.viewList", "Ver Lista")
                    : t("search.viewMap", "Ver Mapa")}
                </MCButton>
              </div>
            ) : (
              <DesktopFilters
                searchFilters={searchFilters}
                onFilterChange={handleFilterChange}
                onYearsChange={handleYearsChange}
                t={t}
              />
            )}
          </div>
        </div>
      </motion.div>

      {/* Contador de seleccionados */}
      <ComparisonBar
        selectedCount={selectedProviders.length}
        providers={selectedProvidersData}
        onRemove={handleRemoveFromComparison}
      />

      {/* Contenido principal */}
      <main className="flex-1 p-3 sm:p-4 pb-20 sm:pb-4">
        <div className="grid grid-cols-1 lg:grid-cols-[4fr_6fr] gap-4 lg:h-[calc(100vh-200px)]">
          {/* Lista de proveedores */}
          <motion.div
            {...fadeInUp}
            className={`space-y-3 sm:space-y-4 overflow-y-auto ${
              isMobile && showMap ? "hidden" : "block"
            }`}
            style={{
              scrollbarWidth: "none",
              msOverflowStyle: "none",
            }}
          >
            <div className="flex items-center justify-between">
              <h2 className="text-xs sm:text-sm font-medium opacity-70">
                {t("search.providersFound", {
                  count: filteredProviders.length,
                  defaultValue: "{{count}} encontrados",
                })}
              </h2>
            </div>

            <div className="space-y-3 sm:space-y-4">
              {filteredProviders.length === 0 ? (
                <EmptyState />
              ) : (
                filteredProviders.map((provider) => (
                  <ProviderCard
                    key={provider.id}
                    provider={provider}
                    isSelected={selectedProviders.includes(provider.id)}
                    isConnected={connectedClinics.includes(provider.id)}
                    onSelect={handleProviderSelect}
                    onConnect={handleClinicConnect}
                    onViewProfile={handleViewProfile}
                  />
                ))
              )}
            </div>
          </motion.div>

          {/* Mapa */}
          <motion.div
            {...fadeInUp}
            className={`bg-card rounded-xl border border-border h-[500px] sm:h-[600px] lg:h-full ${
              isMobile && !showMap ? "hidden" : "block"
            }`}
          >
            <div className="h-full rounded-xl overflow-hidden">
              <MapSearchProviders
                providers={filteredProviders}
                selectedProviders={selectedProviders}
                onProviderSelect={handleProviderSelect}
              />
            </div>
          </motion.div>
        </div>
      </main>
    </div>
  );
}

export default Search;
