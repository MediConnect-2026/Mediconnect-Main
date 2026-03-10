import { useState, useMemo, useCallback, memo, useEffect } from "react";
import DoctorSearchBar from "@/features/patient/components/DoctorSearchBar";
import MCFilterSelect from "@/shared/components/filters/MCFilterSelect";
import { DoctorCards } from "../components/DoctorCards";
import { CenterCards } from "../components/CenterCards";
import {
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
import useTiposCentros from "@/features/onboarding/services/useTiposCentros";
import { useEspecialidades } from "@/features/onboarding/services";
import { useSearchDoctors } from "../hooks/useSearchDoctors";

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

const ProviderCard = memo(
  ({
    provider,
    isSelected,
    onSelect,
    onConnect,
    onViewProfile,
  }: {
    provider: Provider;
    isSelected: boolean;
    onSelect: (id: string) => void;
    onConnect?: (id: string) => void;
    onViewProfile: (id: string) => void;
  }) => {
    console.log("Rendering ProviderCard for:", provider);
    if (provider.type === "doctor") {
      return (
        <DoctorCards
          doctor={provider as Doctor}
          isSelected={isSelected}
          onSelect={onSelect}
          onViewProfile={onViewProfile}
          connectionStatus={
            (provider as Doctor).connectionStatus ?? "not_connected"
          }
          onConnect={onConnect || (() => {})}
        />
      );
    } else {
      return (
        <CenterCards
          clinic={provider as Clinic}
          isConnected={(provider as Clinic).connectionStatus ?? "not_connected"}
          onConnect={onConnect || (() => {})}
          onViewProfile={onViewProfile}
        />
      );
    }
  },
);
ProviderCard.displayName = "ProviderCard";

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

const DesktopFilters = memo(
  ({
    searchFilters,
    onFilterChange,
    onYearsChange,
    t,
    isLoadingCentro,
    tiposCentroOptions,
    isLoadingEspecialidades,
    especialidadesOptions
  }: {
    searchFilters: SearchProviderFilters;
    onFilterChange: (key: string, values: string[]) => void;
    onYearsChange: (value: number | null) => void;
    t: any;
    isLoadingCentro: boolean;
    tiposCentroOptions: { value: string; label: string }[];
    isLoadingEspecialidades: boolean;
    especialidadesOptions: { value: string; label: string }[];
  }) => {

    const IDIOMAS_OPTIONS = [
      { value: "all", label: t("search.options.all", "Todos") },
      { value: "Español", label: t("search.options.languages.spanish") },
      { value: "Inglés", label: t("search.options.languages.english") },
      { value: "Francés", label: t("search.options.languages.french") },
    ];

    const MODALIDAD_OPTIONS = [
      { value: "all", label: t("search.options.all", "Todos") },
      { value: "presencial", label: t("search.options.modality.Presencial") },
      { value: "teleconsulta", label: t("search.options.modality.Virtual") },
      { value: "Mixta", label: t("search.options.modality.hibrido") },
    ];

    const GENERO_OPTIONS = [
      { value: "all", label: t("search.options.all", "Todos") },
      { value: "M", label: t("search.options.gender.masculino") },
      { value: "F", label: t("search.options.gender.femenino") },
      { value: "O", label: t("search.options.gender.other") }
    ];

    const HORARIO_OPTIONS = [
      { value: "all", label: t("search.options.all", "Todos") },
      { value: "mañana", label: t("search.options.schedule.mañana") },
      { value: "tarde", label: t("search.options.schedule.tarde") },
      { value: "noche", label: t("search.options.schedule.noche") },
    ];

    const CALIFICACION_OPTIONS = [
      { value: "all", label: t("search.options.all", "Todos") },
      { value: "4.5", label: t("search.options.rating.4.5") },
      { value: "4", label: t("search.options.rating.4") },
      { value: "3.5", label: t("search.options.rating.3.5") },
      { value: "3", label: t("search.options.rating.3") },
    ];

    const YEARS_OF_EXPERIENCE_OPTIONS = [
      { value: "all", label: t("search.options.all", "Todos") },
      { value: "1", label: t("search.options.years.1") },
      { value: "3", label: t("search.options.years.3") },
      { value: "5", label: t("search.options.years.5") },
      { value: "10", label: t("search.options.years.10") },
    ];

    return (
      <div className="flex gap-2 w-full justify-end max-w-6xl">
        <MCFilterSelect
          name="providerType"
          placeholder={isLoadingCentro ? t("search.loadingProviderTypes") : t("search.providerType", "Tipo")}
          options={[{value: "all", label: t("search.options.all", "Todos")}, ...tiposCentroOptions]}
          multiple
          noBadges
          disabled={isLoadingCentro}
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
          placeholder={ isLoadingEspecialidades ? t("search.loadingSpecialties") : t("search.specialty", "Especialidad")}
          options={[{value: "all", label: t("search.options.all", "Todos")}, ...especialidadesOptions]}
          multiple
          noBadges
          disabled={isLoadingEspecialidades}
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
  const { t, i18n } = useTranslation("common");
  const isMobile = useIsMobile();
  const [locationPermission, setLocationPermission] = useState<'unknown' | 'granted' | 'denied'>('unknown');
  const [coords, setCoords] = useState<{ lat: number; lng: number } | null>(null);
  const [showMap, setShowMap] = useState(false);
  const [selectedProviders, setSelectedProviders] = useState<string[]>([]);
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

  const { data: tiposCentroOptions = [], isLoading: isLoadingCentro } = useTiposCentros();
  const { data: especialidadesOptions = [], isLoading: isLoadingEspecialidades } = useEspecialidades();
  
  // Use the search doctors hook with real API integration
  const {
    filteredProviders,
    isLoading: isLoadingDoctors,
  } = useSearchDoctors({
    lat: coords?.lat ?? null,
    lng: coords?.lng ?? null,
    radiusKm: 15,
    filters: searchFilters,
    language: i18n.language || "es",
    enabled: true, // Always enabled, will return empty if no coords
    especialidadesOptions,
  });

  // Handle geolocation
  useEffect(() => {
    if (!('geolocation' in navigator)) {
      setLocationPermission('denied');
      console.warn("Geolocalización no soportada por el navegador.");
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (position) => {
        const p = { lat: position.coords.latitude, lng: position.coords.longitude };
        setCoords(p);
        setLocationPermission('granted');
      },
      (error) => {
        if (error.code === error.PERMISSION_DENIED) {
          setLocationPermission('denied');
        } else {
          setLocationPermission('denied');
        }
        console.warn("Error obteniendo ubicación:", error);
      },
      { enableHighAccuracy: false, timeout: 5000 },
    );
  }, []); // Run only once on mount

  const activeFiltersCount = useMemo(() => {
    let count = 0;
    Object.entries(searchFilters).forEach(([_key, value]) => {
      if (Array.isArray(value) && value.length > 0 && !value.includes("all"))
        count++;
      else if (typeof value === "string" && value.trim() !== "") count++;
      else if (typeof value === "number" && value !== null) count++;
    });
    return count;
  }, [searchFilters]);

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

  const updateSearchFilters = useCallback(
    (newFilters: Partial<SearchProviderFilters>) => {
      setSearchFilters((prev) => ({ ...prev, ...newFilters }));
    },
    [],
  );

  const handleProviderSelect = useCallback((id: string) => {
    setSelectedProviders((prev) =>
      prev.includes(id)
        ? prev.filter((pid) => pid !== id)
        : prev.length < 5
          ? [...prev, id]
          : prev,
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

  const handleSearchChange = useCallback(
    (searchTerm: string) => {
      updateSearchFilters({ name: searchTerm });
    },
    [updateSearchFilters],
  );

  const handleInsuranceChange = useCallback(
    (insurance: string) => {
      if (insurance.trim()) {
        updateSearchFilters({ insuranceAccepted: [insurance] });
      } else {
        updateSearchFilters({ insuranceAccepted: ["all"] });
      }
    },
    [updateSearchFilters],
  );

  const toggleMapView = useCallback(() => {
    setShowMap((prev) => !prev);
  }, []);

  const selectedProvidersData = useMemo(
    () =>
      filteredProviders.filter((provider) =>
        selectedProviders.includes(provider.id),
      ),
    [selectedProviders, filteredProviders],
  );
  
  return (
    <div className="min-h-screen flex flex-col bg-background rounded-4xl">
      <motion.div
        {...fadeInUp}
        className="top-0 z-20 bg-background rounded-t-4xl"
      >
        <div className="px-3 py-4 sm:px-4 sm:py-6 md:px-6 md:py-8 lg:px-12">
          <div className="flex flex-col gap-4 justify-center items-center">
            <DoctorSearchBar 
              onSearchChange={handleSearchChange}
              onInsuranceChange={handleInsuranceChange}
            />
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
                isLoadingCentro={isLoadingCentro}
                tiposCentroOptions={tiposCentroOptions}
                isLoadingEspecialidades={isLoadingEspecialidades}
                especialidadesOptions={especialidadesOptions}
                t={t}
              />
            )}
          </div>
        </div>
      </motion.div>
      <ComparisonBar
        selectedCount={selectedProviders.length}
        providers={selectedProvidersData}
        onRemove={handleRemoveFromComparison}
      />
      <main className="flex-1 p-3 sm:p-4 pb-20 sm:pb-4">
        <div className="grid grid-cols-1 lg:grid-cols-[4fr_6fr] gap-4 lg:h-[calc(100vh-200px)]">
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
              {isLoadingDoctors ? (
                <div className="flex flex-col items-center justify-center py-12">
                  <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
                  <p className="mt-4 text-sm text-muted-foreground">
                    {t("search.loading", "Buscando doctores...")}
                  </p>
                </div>
              ) : filteredProviders.length === 0 ? (
                <EmptyState />
              ) : (
                filteredProviders.map((provider) => (
                  <ProviderCard
                    key={provider.id}
                    provider={provider}
                    isSelected={selectedProviders.includes(provider.id)}
                    onSelect={handleProviderSelect}
                    onViewProfile={handleViewProfile}
                  />
                ))
              )}
            </div>
          </motion.div>
          <motion.div
            {...fadeInUp}
            className={`bg-card rounded-xl border border-border h-[500px] sm:h-[600px] lg:h-full ${
              isMobile && !showMap ? "hidden" : "block"
            }`}
          >
            <div className="h-full rounded-xl overflow-hidden relative">
                <MapSearchProviders
                  providers={filteredProviders}
                  selectedProviders={selectedProviders}
                  onProviderSelect={handleProviderSelect}
                />
                {locationPermission === 'denied' && (
                  <div className="absolute inset-0 z-40 flex items-center justify-center pointer-events-none">
                    <div className="pointer-events-auto bg-yellow-50 border border-yellow-400 text-yellow-900 px-4 py-2 rounded max-w-lg mx-4 text-center">
                      {t(
                        'search.locationWarning',
                        'Debe permitir el acceso a la ubicación para listar los servicios por cercanía.',
                      )}
                    </div>
                  </div>
                )}
              </div>
          </motion.div>
        </div>
      </main>
    </div>
  );
}

export default Search;
