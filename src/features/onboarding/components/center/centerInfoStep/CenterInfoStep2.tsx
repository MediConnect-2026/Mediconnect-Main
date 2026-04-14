import MCInput from "@/shared/components/forms/MCInput";
import MCFormWrapper from "@/shared/components/forms/MCFormWrapper";
import { useAppStore } from "@/stores/useAppStore";
import { CenterLocationInfoSchema } from "@/schema/OnbordingSchema";
import MapSelectLocation from "@/shared/components/maps/MapSelectLocation";
import { useTranslation } from "react-i18next";
import { useGlobalUIStore } from "@/stores/useGlobalUIStore";
import { useUbicaciones } from "@/features/onboarding/services/useUbicaciones";
import MCSelect from "@/shared/components/forms/MCSelect";
import { useEffect, useMemo, useRef, useState, useCallback } from "react";
import { useFormContext } from "react-hook-form";
import { useQueryClient } from "@tanstack/react-query";
import { QUERY_KEYS } from "@/lib/react-query/config";
import type { Geometry } from "geojson";
import type { SelectOption } from "@/features/onboarding/services/ubicaciones.types";
import ubicacionesService from "@/features/onboarding/services/ubicaciones.services";

// ─── Tipos ───────────────────────────────────────────────────────────────────

type CenterInfoStep2Props = {
  children?: React.ReactNode;
  onValidationChange?: (isValid: boolean) => void;
  onNext?: () => void;
};

// FormBridge fuera del componente para evitar re-creaciones en cada render.
// Expone setValue del FormContext hacia arriba mediante un ref.
function FormBridge({
  formSetValueRef,
}: {
  formSetValueRef: React.MutableRefObject<
    ((name: string, value: any) => void) | null
  >;
}) {
  const { setValue } = useFormContext();
  useEffect(() => {
    formSetValueRef.current = (name: string, value: any) =>
      setValue(name, value, { shouldValidate: true, shouldDirty: true });
  }, [setValue, formSetValueRef]);
  return null;
}

// ─── Componente ──────────────────────────────────────────────────────────────

function CenterInfoStep2({
  children,
  onValidationChange,
  onNext,
}: CenterInfoStep2Props) {
  const { t } = useTranslation("auth");
  const { i18n } = useTranslation();
  const currentLanguage = i18n.language;

  const centerOnboardingData = useAppStore(
    (state) => state.centerOnboardingData,
  );
  const setOnboardingStep = useGlobalUIStore(
    (state) => state.setOnboardingStep,
  );
  const setCenterField = useAppStore((state) => state.setCenterField);
  const queryClient = useQueryClient();

  // ─── Estado de selects (valores seleccionados) ────────────────────────────
  const [selectedProvince, setSelectedProvince] = useState<string>("");
  const [selectedMunicipality, setSelectedMunicipality] = useState<string>("");
  const [selectedDistrict, setSelectedDistrict] = useState<string>("");
  const [selectedSection, setSelectedSection] = useState<string>("");
  const [selectedNeighborhood, setSelectedNeighborhood] = useState<string>("");
  const [neighborhoodGeo, setNeighborhoodGeo] = useState<Geometry | null>(null);

  // ─── Estado de opciones (override del autocompletado) ────────────────────
  // Durante el autocompletado por punto, los datos fetcheados se inyectan
  // aquí directamente. Los selects los leen de forma combinada: si hay opciones
  // locales las usan; si no, usan las del hook. Esto evita depender del ciclo
  // de React Query para mostrar los valores inmediatamente.
  const [autocompleteOptions, setAutocompleteOptions] = useState<{
    municipios: SelectOption[] | null;
    distritos: SelectOption[] | null;
    secciones: SelectOption[] | null;
    barrios: SelectOption[] | null;
  }>({ municipios: null, distritos: null, secciones: null, barrios: null });

  // Ref para acceder a setValue del form desde fuera del MCFormWrapper
  const formSetValueRef = useRef<((name: string, value: any) => void) | null>(
    null,
  );

  // ─── Hooks de ubicaciones (para interacción manual) ───────────────────────

  const { data: provinciasOptions = [], isLoading: isLoadingProvincias } =
    useUbicaciones("provincias");

  const municipiosParams = useMemo(
    () => (selectedProvince ? { idProvincia: selectedProvince } : undefined),
    [selectedProvince],
  );
  const { data: municipiosFromQuery = [], isLoading: isLoadingMunicipios } =
    useUbicaciones("municipios", municipiosParams);

  const distritosParams = useMemo(
    () =>
      selectedMunicipality ? { idMunicipio: selectedMunicipality } : undefined,
    [selectedMunicipality],
  );
  const { data: distritosFromQuery = [], isLoading: isLoadingDistritos } =
    useUbicaciones("distritos", distritosParams);

  const seccionesParams = useMemo(() => {
    if (selectedDistrict) return { idDistrito: selectedDistrict };
    if (selectedMunicipality) return { idMunicipio: selectedMunicipality };
    return undefined;
  }, [selectedDistrict, selectedMunicipality]);

  const { data: seccionesFromQuery = [], isLoading: isLoadingSecciones } =
    useUbicaciones("secciones", seccionesParams);

  const barriosParams = useMemo(
    () => (selectedSection ? { idSeccion: selectedSection } : undefined),
    [selectedSection],
  );
  const { data: barriosFromQuery = [], isLoading: isLoadingBarrios } =
    useUbicaciones("barrios", barriosParams);

  // ─── Opciones combinadas: autocompletado tiene prioridad sobre el hook ────
  // Cuando el autocompletado setea opciones locales, los selects las usan
  // inmediatamente sin esperar el ciclo de React Query. La interacción manual
  // limpia autocompleteOptions y vuelve a usar las del hook.
  const municipiosOptions =
    autocompleteOptions.municipios ?? municipiosFromQuery;
  const distritosOptions = autocompleteOptions.distritos ?? distritosFromQuery;
  const seccionesOptions = autocompleteOptions.secciones ?? seccionesFromQuery;
  const barriosOptions = autocompleteOptions.barrios ?? barriosFromQuery;

  // ─── Inicializar valores desde el store al montar ────────────────────────
  useEffect(() => {
    const initializeFromStore = async () => {
      if (!centerOnboardingData) return;

      const {
        province: provId,
        municipality: munId,
        district: distId,
        section: secId,
        neighborhood: barrioId,
      } = centerOnboardingData;

      if (!provId) return;

      try {
        // 1. OBTENER DATOS PRIMERO (Sin tocar el estado local aún)
        const [municipiosData, distritosData, seccionesData, barriosData] =
          await Promise.all([
            ubicacionesService.getMunicipios(currentLanguage, Number(provId)),
            munId
              ? ubicacionesService.getDistritos(currentLanguage, Number(munId))
              : Promise.resolve([]),
            distId
              ? ubicacionesService.getSecciones(currentLanguage, {
                  idDistrito: distId,
                })
              : munId
                ? ubicacionesService.getSecciones(currentLanguage, {
                    idMunicipio: munId,
                  })
                : Promise.resolve([]),
            secId
              ? ubicacionesService.getBarrios(currentLanguage, Number(secId))
              : Promise.resolve([]),
          ]);

        // 2. POBLAR CACHÉ DE REACT QUERY Y AUTOCOMPLETE
        setAutocompleteOptions({
          municipios: municipiosData,
          distritos: distritosData,
          secciones: seccionesData,
          barrios: barriosData,
        });

        queryClient.setQueryData(
          QUERY_KEYS.UBICACIONES("municipios", { idProvincia: provId }),
          municipiosData,
        );

        if (munId) {
          queryClient.setQueryData(
            QUERY_KEYS.UBICACIONES("distritos", { idMunicipio: munId }),
            distritosData,
          );
        }

        if (distId) {
          queryClient.setQueryData(
            QUERY_KEYS.UBICACIONES("secciones", { idDistrito: distId }),
            seccionesData,
          );
        } else if (munId) {
          queryClient.setQueryData(
            QUERY_KEYS.UBICACIONES("secciones", { idMunicipio: munId }),
            seccionesData,
          );
        }

        if (secId) {
          queryClient.setQueryData(
            QUERY_KEYS.UBICACIONES("barrios", { idSeccion: secId }),
            barriosData,
          );
        }

        // 3. AHORA SÍ, SETEAR ESTADOS (React Query los verá como resueltos al instante)
        setSelectedProvince(provId);
        if (munId) setSelectedMunicipality(munId);
        if (distId) setSelectedDistrict(distId);
        if (secId) setSelectedSection(secId);
        if (barrioId) setSelectedNeighborhood(barrioId);

        if (barrioId) {
          const geo = await ubicacionesService.getGeoPointsByBarrios(
            Number(barrioId),
          );
          setNeighborhoodGeo(geo.geom ?? null);
        }

        // 4. ACTUALIZAR STORE Y FORMULARIO
        setCenterField?.("province", provId);
        setCenterField?.("municipality", munId);
        setCenterField?.("district", distId);
        setCenterField?.("section", secId);
        setCenterField?.("neighborhood", barrioId);

        setTimeout(() => {
          if (formSetValueRef.current) {
            formSetValueRef.current("province", provId);
            formSetValueRef.current("municipality", munId);
            formSetValueRef.current("district", distId);
            formSetValueRef.current("section", secId);
            formSetValueRef.current("neighborhood", barrioId);
          }
        }, 0);
      } catch (err) {
        console.error("Error inicializando datos desde el store:", err);
      }
    };

    initializeFromStore();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []); // Solo al montar

  // ─── Submit ───────────────────────────────────────────────────────────────

  const handleSubmit = () => {
    setOnboardingStep?.(0);
    onValidationChange?.(true);
    onNext?.();
  };

  // ─── Handler: dirección desde Mapbox (solo address) ──────────────────────
  const handleLocationDetails = useCallback(
    (details: { address: string; zipCode: string }) => {
      setCenterField?.("address", details.address);
      formSetValueRef.current?.("address", details.address);
    },
    [setCenterField],
  );

  // ─── Helper: sincronizar estado + store + form ────────────────────────────
  const applyField = useCallback(
    (
      field: string,
      value: string,
      stateSetter: React.Dispatch<React.SetStateAction<string>>,
    ) => {
      stateSetter(value);
      setCenterField?.(field as any, value);
      formSetValueRef.current?.(field, value);
    },
    [setCenterField],
  );

  // ─── Handlers manuales con reset en cascada ───────────────────────────────
  // Al interactuar manualmente, se limpian las opciones del autocompletado
  // para que los hooks de React Query vuelvan a tomar el control.

  const handleProvinceChange = useCallback(
    (value: string | string[]) => {
      const province = Array.isArray(value) ? value[0] : value;
      setSelectedMunicipality("");
      setSelectedDistrict("");
      setSelectedSection("");
      setSelectedNeighborhood("");
      setNeighborhoodGeo(null);
      // Limpiar todas las opciones del autocompletado al cambiar provincia
      setAutocompleteOptions({
        municipios: null,
        distritos: null,
        secciones: null,
        barrios: null,
      });
      setCenterField?.("municipality", "");
      setCenterField?.("district", "");
      setCenterField?.("section", "");
      setCenterField?.("neighborhood", "");
      setCenterField?.("subNeighborhood", "");
      applyField("province", province, setSelectedProvince);
    },
    [applyField, setCenterField],
  );

  const handleMunicipalityChange = useCallback(
    (value: string | string[]) => {
      const municipality = Array.isArray(value) ? value[0] : value;
      setSelectedDistrict("");
      setSelectedSection("");
      setSelectedNeighborhood("");
      setNeighborhoodGeo(null);
      setAutocompleteOptions((prev) => ({
        ...prev,
        distritos: null,
        secciones: null,
        barrios: null,
      }));
      setCenterField?.("district", "");
      setCenterField?.("section", "");
      setCenterField?.("neighborhood", "");
      setCenterField?.("subNeighborhood", "");
      applyField("municipality", municipality, setSelectedMunicipality);
    },
    [applyField, setCenterField],
  );

  const handleDistrictChange = useCallback(
    (value: string | string[]) => {
      const district = Array.isArray(value) ? value[0] : value;
      setSelectedSection("");
      setSelectedNeighborhood("");
      setNeighborhoodGeo(null);
      setAutocompleteOptions((prev) => ({
        ...prev,
        secciones: null,
        barrios: null,
      }));
      setCenterField?.("section", "");
      setCenterField?.("neighborhood", "");
      setCenterField?.("subNeighborhood", "");
      applyField("district", district, setSelectedDistrict);
    },
    [applyField, setCenterField],
  );

  const handleSectionChange = useCallback(
    (value: string | string[]) => {
      const section = Array.isArray(value) ? value[0] : value;
      setSelectedNeighborhood("");
      setNeighborhoodGeo(null);
      setAutocompleteOptions((prev) => ({ ...prev, barrios: null }));
      setCenterField?.("neighborhood", "");
      setCenterField?.("subNeighborhood", "");
      applyField("section", section, setSelectedSection);
    },
    [applyField, setCenterField],
  );

  const handleNeighborhoodChange = useCallback(
    async (value: string | string[]) => {
      const neighborhood = Array.isArray(value) ? value[0] : value;
      applyField("neighborhood", neighborhood, setSelectedNeighborhood);

      if (!neighborhood) {
        setNeighborhoodGeo(null);
        return;
      }

      try {
        const geo = await ubicacionesService.getGeoPointsByBarrios(
          Number(neighborhood),
        );
        setNeighborhoodGeo(geo.geom ?? null);
      } catch (err) {
        console.error("Error obteniendo geometría del barrio:", err);
        setNeighborhoodGeo(null);
      }
    },
    [applyField, setCenterField],
  );

  // ─── Handler: punto seleccionado en el mapa ───────────────────────────────
  //
  // Estrategia CORREGIDA:
  // 1. Fetch geopoint → jerarquía completa.
  // 2. Fetch paralelo de todos los niveles dependientes al servicio.
  // 3. Inyectar datos en cache de React Query Y en estado local simultáneamente.
  // 4. Setear valores una sola vez: estado local + store + form (sin llamadas redundantes).

  const handlePointSelected = useCallback(
    async (lat: number, lng: number, isInsideNeighborhood: boolean) => {
      setCenterField?.("coordinates", { latitude: lat, longitude: lng });

      if (isInsideNeighborhood) return;

      try {
        const data = await ubicacionesService.getDataBarrioFromGeoPoint(
          lng,
          lat,
        );
        if (!data?.municipio?.id) return;

        const provId = String(data.provincia?.id ?? "");
        const munId = String(data.municipio.id);
        const distId = data.distritoMunicipal?.id
          ? String(data.distritoMunicipal.id)
          : "";
        const secId = data.seccion?.id ? String(data.seccion.id) : "";
        const barrioId = data.id ? String(data.id) : "";

        const newMunicipiosParams = { idProvincia: provId };
        const newDistritosParams = { idMunicipio: munId };
        const newSeccionesParams = distId
          ? { idDistrito: distId }
          : { idMunicipio: munId };
        const newBarriosParams = secId ? { idSeccion: secId } : null;

        // Fetch paralelo de todos los niveles
        const [municipiosData, distritosData, seccionesData, barriosData] =
          await Promise.all([
            ubicacionesService.getMunicipios(currentLanguage, Number(provId)),
            ubicacionesService.getDistritos(currentLanguage, Number(munId)),
            ubicacionesService.getSecciones(
              currentLanguage,
              newSeccionesParams,
            ),
            newBarriosParams
              ? ubicacionesService.getBarrios(currentLanguage, Number(secId))
              : Promise.resolve([]),
          ]);

        // Inyectar en cache de React Query (para navegación futura y selects manuales)
        queryClient.setQueryData(
          QUERY_KEYS.UBICACIONES("municipios", newMunicipiosParams),
          municipiosData,
        );
        queryClient.setQueryData(
          QUERY_KEYS.UBICACIONES("distritos", newDistritosParams),
          distritosData,
        );
        queryClient.setQueryData(
          QUERY_KEYS.UBICACIONES("secciones", newSeccionesParams),
          seccionesData,
        );
        if (newBarriosParams) {
          queryClient.setQueryData(
            QUERY_KEYS.UBICACIONES("barrios", newBarriosParams),
            barriosData,
          );
        }

        // Inyectar en estado local → los selects tienen las opciones disponibles
        // en el MISMO render en que reciben el valor seleccionado.
        setAutocompleteOptions({
          municipios: municipiosData,
          distritos: distritosData,
          secciones: seccionesData,
          barrios: newBarriosParams ? barriosData : [],
        });

        // Setear valores en estado local
        setSelectedProvince(provId);
        setSelectedMunicipality(munId);
        setSelectedDistrict(distId);
        setSelectedSection(secId);
        setSelectedNeighborhood(barrioId);
        setNeighborhoodGeo(data.geom ?? null);

        // Setear valores en store
        setCenterField?.("province", provId);
        setCenterField?.("municipality", munId);
        setCenterField?.("district", distId);
        setCenterField?.("section", secId);
        setCenterField?.("neighborhood", barrioId);

        // Setear valores en el form usando el ref
        // Usar setTimeout para asegurar que el form context esté disponible
        setTimeout(() => {
          if (formSetValueRef.current) {
            formSetValueRef.current("province", provId);
            formSetValueRef.current("municipality", munId);
            formSetValueRef.current("district", distId);
            formSetValueRef.current("section", secId);
            formSetValueRef.current("neighborhood", barrioId);
          }
        }, 0);
      } catch (err) {
        console.error("Error obteniendo barrio por punto:", err);
      }
    },
    [setCenterField, queryClient, currentLanguage],
  );

  // ─── Render ───────────────────────────────────────────────────────────────

  return (
    <div className="w-full flex flex-col gap-4">
      <div className="mb-5">
        <h1 className="text-2xl sm:text-3xl font-bold text-primary mb-2">
          {t("centerInfoStep.locationTitle")}
        </h1>
        <p className="text-primary/60 text-sm sm:text-base">
          {t("centerInfoStep.locationSubtitle")}
        </p>
      </div>

      <div className="h-[350px] mb-6">
        <MapSelectLocation
          value={{
            lat: centerOnboardingData?.coordinates?.latitude || 0,
            lng: centerOnboardingData?.coordinates?.longitude || 0,
          }}
          onChange={(lat, lng) =>
            setCenterField?.("coordinates", { latitude: lat, longitude: lng })
          }
          onLocationDetails={handleLocationDetails}
          neighborhoodGeo={neighborhoodGeo}
          onPointSelected={handlePointSelected}
        />
      </div>

      <MCFormWrapper
        schema={CenterLocationInfoSchema((key: string) => t(key))}
        onSubmit={handleSubmit}
        onValidationChange={onValidationChange}
        defaultValues={{
          address: centerOnboardingData?.address || "",
          province: centerOnboardingData?.province || "",
          municipality: centerOnboardingData?.municipality || "",
          district: centerOnboardingData?.district || "",
          section: centerOnboardingData?.section || "",
          neighborhood: centerOnboardingData?.neighborhood || "",
          coordinates: centerOnboardingData?.coordinates || {
            latitude: 0,
            longitude: 0,
          },
        }}
      >
        <FormBridge formSetValueRef={formSetValueRef} />

        <div className="space-y-4 py-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <MCInput
              name="address"
              label={t("centerInfoStep.addressLabel")}
              placeholder={t("centerInfoStep.addressPlaceholder")}
              value={centerOnboardingData?.address}
              onChange={(e) => setCenterField?.("address", e.target.value)}
            />
            <MCSelect
              name="province"
              label={t("centerInfoStep.provinceLabel")}
              placeholder={
                isLoadingProvincias
                  ? t("centerInfoStep.loadingProvincias")
                  : t("centerInfoStep.provincePlaceholder")
              }
              value={selectedProvince}
              options={provinciasOptions}
              disabled={isLoadingProvincias}
              onChange={handleProvinceChange}
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <MCSelect
              name="municipality"
              label={t("centerInfoStep.municipalityLabel")}
              placeholder={
                isLoadingMunicipios
                  ? t("centerInfoStep.loadingMunicipios")
                  : selectedProvince
                    ? t("centerInfoStep.municipalityPlaceholder")
                    : t(
                        "centerInfoStep.municipalityPlaceholderRequiredPrevValue",
                      )
              }
              value={selectedMunicipality}
              options={municipiosOptions}
              searchable={true}
              disabled={
                (isLoadingMunicipios && !autocompleteOptions.municipios) ||
                !selectedProvince
              }
              onChange={handleMunicipalityChange}
            />

            <MCSelect
              name="district"
              label={t("centerInfoStep.districtLabel")}
              placeholder={
                isLoadingDistritos
                  ? t("centerInfoStep.loadingDistritos")
                  : selectedMunicipality
                    ? t("centerInfoStep.districtPlaceholder")
                    : t("centerInfoStep.districtPlaceholderRequiredPrevValue")
              }
              value={selectedDistrict}
              options={distritosOptions}
              disabled={
                (isLoadingDistritos && !autocompleteOptions.distritos) ||
                !selectedMunicipality
              }
              searchable={true}
              onChange={handleDistrictChange}
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <MCSelect
              name="section"
              label={t("centerInfoStep.sectionLabel")}
              placeholder={
                isLoadingSecciones
                  ? t("centerInfoStep.loadingSecciones")
                  : selectedMunicipality
                    ? t("centerInfoStep.sectionPlaceholder")
                    : t("centerInfoStep.sectionPlaceholderRequiredPrevValue")
              }
              value={selectedSection}
              options={seccionesOptions}
              searchable={true}
              disabled={
                (isLoadingSecciones && !autocompleteOptions.secciones) ||
                !seccionesParams
              }
              onChange={handleSectionChange}
            />

            <MCSelect
              name="neighborhood"
              label={t("centerInfoStep.neighborhoodLabel")}
              placeholder={
                isLoadingBarrios
                  ? t("centerInfoStep.loadingBarrios")
                  : selectedSection
                    ? t("centerInfoStep.neighborhoodPlaceholder")
                    : t(
                        "centerInfoStep.neighborhoodPlaceholderRequiredPrevValue",
                      )
              }
              value={selectedNeighborhood}
              options={barriosOptions}
              disabled={
                (isLoadingBarrios && !autocompleteOptions.barrios) ||
                !selectedSection
              }
              searchable={true}
              onChange={handleNeighborhoodChange}
            />
          </div>
        </div>
        {children}
      </MCFormWrapper>
    </div>
  );
}

export default CenterInfoStep2;
