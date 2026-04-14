import { useTranslation } from "react-i18next";
import MCInput from "@/shared/components/forms/MCInput";
import MCSelect from "@/shared/components/forms/MCSelect";
import MCPhoneInput from "@/shared/components/forms/MCPhoneInput";
import MapSelectLocation from "@/shared/components/maps/MapSelectLocation";
import { useFormContext } from "react-hook-form";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import useTiposCentros from "@/features/onboarding/services/useTiposCentros";
import { useUbicaciones } from "@/features/onboarding/services/useUbicaciones";
import ubicacionesService from "@/features/onboarding/services/ubicaciones.services";
import { useQueryClient } from "@tanstack/react-query";
import { QUERY_KEYS } from "@/lib/react-query/config";
import type { Geometry } from "geojson";
import type { SelectOption } from "@/features/onboarding/services/ubicaciones.types";

const DEFAULT_COORDS = { latitude: 18.4861, longitude: -69.9312 };

const isNumericId = (value: string) => /^\d+$/.test(value.trim());

function CenterForm() {
  const { t, i18n } = useTranslation("common");
  const currentLanguage = i18n.language;

  // ─── Declarar getValues ANTES de los useState para que los lazy initializers lo usen ───
  const { register, setValue, watch, getValues } = useFormContext();

  const queryClient = useQueryClient();

  const coordinates = watch("coordinates");

  const { data: centerTypeOptions = [], isLoading: isLoadingCenterTypes } =
    useTiposCentros();

  // ─── Location hierarchy state — inicializado síncronamente desde el form ──
  // El mismo patrón que usa el componente Location con el store:
  // leer el valor ya disponible en getValues() en el primer render, sin esperar
  // al useEffect asíncrono, para que los selects nunca aparezcan vacíos.
  const [selectedProvince, setSelectedProvince] = useState<string>(() =>
    String(getValues("province") || "").trim(),
  );
  const [selectedMunicipality, setSelectedMunicipality] = useState<string>(() =>
    String(getValues("municipality") || "").trim(),
  );
  const [selectedDistrict, setSelectedDistrict] = useState<string>(() => {
    const v = String(getValues("district") || "").trim();
    return isNumericId(v) ? v : "";
  });
  const [selectedSection, setSelectedSection] = useState<string>(() => {
    const v = String(getValues("section") || "").trim();
    return isNumericId(v) ? v : "";
  });
  const [selectedNeighborhood, setSelectedNeighborhood] = useState<string>(
    () => {
      const v = String(getValues("barrioId") || "").trim();
      return isNumericId(v) ? v : "";
    },
  );
  const [neighborhoodGeo, setNeighborhoodGeo] = useState<Geometry | null>(null);

  /**
   * Dropdown options fetched on-demand (from a geo-point or init fetch).
   * When set, these take precedence over the React Query results so that
   * all selects are populated immediately — without waiting for each
   * dependent query to independently re-run.
   *
   * null  → fall back to the React Query hook result
   * []    → explicitly empty (e.g. no distritos for this municipio)
   */
  const [autocompleteOptions, setAutocompleteOptions] = useState<{
    municipios: SelectOption[] | null;
    distritos: SelectOption[] | null;
    secciones: SelectOption[] | null;
    barrios: SelectOption[] | null;
  }>({ municipios: null, distritos: null, secciones: null, barrios: null });

  // Cancellation counters — increment before any async call to discard stale results
  const activeRequestIdRef = useRef(0);
  const neighborhoodGeoRequestIdRef = useRef(0);

  // ─── React Query hooks (secondary source, used after autocomplete is cleared) ──
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

  // Prefer on-demand options; fall back to React Query results
  const municipiosOptions =
    autocompleteOptions.municipios ?? municipiosFromQuery;
  const distritosOptions = autocompleteOptions.distritos ?? distritosFromQuery;
  const seccionesOptions = autocompleteOptions.secciones ?? seccionesFromQuery;
  const barriosOptions = autocompleteOptions.barrios ?? barriosFromQuery;

  // ─── Core helper: write all IDs to state + form atomically ────────────────
  /**
   * Applies a complete hierarchy snapshot in one synchronous batch.
   * Always call this AFTER autocompleteOptions has been set so that the
   * options are available in the same render cycle as the selected values.
   */
  const applyHierarchy = useCallback(
    (ids: {
      province: string;
      municipality: string;
      district: string;
      section: string;
      barrioId: string;
    }) => {
      const { province, municipality, district, section, barrioId } = ids;

      setSelectedProvince(province);
      setSelectedMunicipality(municipality);
      setSelectedDistrict(district);
      setSelectedSection(section);
      setSelectedNeighborhood(barrioId);

      setValue("province", province, {
        shouldDirty: true,
        shouldValidate: true,
      });
      setValue("municipality", municipality, {
        shouldDirty: true,
        shouldValidate: true,
      });
      setValue("district", district, { shouldDirty: false });
      setValue("section", section, { shouldDirty: false });
      setValue("barrioId", barrioId, { shouldDirty: false });
    },
    [setValue],
  );

  // ─── Core helper: fetch all option lists and populate React Query cache ───
  const fetchAndCacheHierarchy = useCallback(
    async (
      provId: string,
      munId: string,
      distId: string,
      secId: string,
    ): Promise<{
      municipiosData: SelectOption[];
      distritosData: SelectOption[];
      seccionesData: SelectOption[];
      barriosData: SelectOption[];
    }> => {
      const [municipiosData, distritosData, seccionesData, barriosData] =
        await Promise.all([
          provId
            ? ubicacionesService.getMunicipios(currentLanguage, Number(provId))
            : Promise.resolve([] as SelectOption[]),
          munId
            ? ubicacionesService.getDistritos(currentLanguage, Number(munId))
            : Promise.resolve([] as SelectOption[]),
          distId
            ? ubicacionesService.getSecciones(currentLanguage, {
                idDistrito: distId,
              })
            : munId
              ? ubicacionesService.getSecciones(currentLanguage, {
                  idMunicipio: munId,
                })
              : Promise.resolve([] as SelectOption[]),
          secId
            ? ubicacionesService.getBarrios(currentLanguage, Number(secId))
            : Promise.resolve([] as SelectOption[]),
        ]);

      // Seed React Query cache so dependent hooks resolve instantly on next render
      if (provId) {
        queryClient.setQueryData(
          QUERY_KEYS.UBICACIONES("municipios", { idProvincia: provId }),
          municipiosData,
        );
      }
      if (munId) {
        queryClient.setQueryData(
          QUERY_KEYS.UBICACIONES("distritos", { idMunicipio: munId }),
          distritosData,
        );
        queryClient.setQueryData(
          QUERY_KEYS.UBICACIONES(
            "secciones",
            distId ? { idDistrito: distId } : { idMunicipio: munId },
          ),
          seccionesData,
        );
      }
      if (secId) {
        queryClient.setQueryData(
          QUERY_KEYS.UBICACIONES("barrios", { idSeccion: secId }),
          barriosData,
        );
      }

      return { municipiosData, distritosData, seccionesData, barriosData };
    },
    [currentLanguage, queryClient],
  );

  // ─── ONE-TIME INIT ────────────────────────────────────────────────────────
  /**
   * Runs exactly once per component mount (useRef resets on every mount so
   * re-opening the edit form always triggers a fresh init).
   *
   * Los estados locales ya tienen los valores correctos desde el primer render
   * gracias a los lazy initializers de useState. Este efecto solo necesita
   * cargar las OPCIONES de los dropdowns en segundo plano, sin producir ningún
   * flash de selects vacíos.
   *
   * Order of operations is critical:
   *   1. Read all IDs from the form's defaultValues
   *   2. Fetch ALL option lists in parallel (fetchAndCacheHierarchy)
   *   3. Set autocompleteOptions  ← options must exist BEFORE applyHierarchy
   *   4. Call applyHierarchy      ← now React can render selected + options together
   *
   * This ensures selects render fully populated (selected value + option list)
   * in the very first meaningful render, without requiring a map interaction.
   */
  const initDoneRef = useRef(false);

  useEffect(() => {
    if (initDoneRef.current) return;
    initDoneRef.current = true;

    const initialize = async () => {
      const provId = String(getValues("province") || "").trim();
      const munId = String(getValues("municipality") || "").trim();
      const distId = String(getValues("district") || "").trim();
      const secId = String(getValues("section") || "").trim();
      const barrioId = String(getValues("barrioId") || "").trim();
      const lat = Number(getValues("coordinates.latitude") || 0);
      const lng = Number(getValues("coordinates.longitude") || 0);

      // Ensure the map always has a valid marker position
      if (!lat || !lng) {
        setValue("coordinates.latitude", DEFAULT_COORDS.latitude, {
          shouldDirty: false,
        });
        setValue("coordinates.longitude", DEFAULT_COORDS.longitude, {
          shouldDirty: false,
        });
      }

      const safeDistId = isNumericId(distId) ? distId : "";
      const safeSecId = isNumericId(secId) ? secId : "";
      const safeBarrioId = isNumericId(barrioId) ? barrioId : "";

      if (isNumericId(provId) && isNumericId(munId)) {
        // ── Fast path: stored IDs are available ──────────────────────────
        // Fetch all option lists first, THEN apply the hierarchy so both the
        // options and the selected values land in the same render cycle.
        try {
          const { municipiosData, distritosData, seccionesData, barriosData } =
            await fetchAndCacheHierarchy(provId, munId, safeDistId, safeSecId);

          // 1. Options first
          setAutocompleteOptions({
            municipios: municipiosData,
            distritos: distritosData,
            secciones: seccionesData,
            barrios: barriosData,
          });

          // 2. Selected values second (same flush, React batches these together)
          applyHierarchy({
            province: provId,
            municipality: munId,
            district: safeDistId,
            section: safeSecId,
            barrioId: safeBarrioId,
          });
        } catch (err) {
          console.error("Error cargando opciones de jerarquía en init:", err);
        }

        // Fetch neighborhood polygon (non-blocking, non-critical)
        if (isNumericId(barrioId)) {
          const geoReqId = ++neighborhoodGeoRequestIdRef.current;
          try {
            const geo = await ubicacionesService.getGeoPointsByBarrios(
              Number(barrioId),
            );
            if (geoReqId === neighborhoodGeoRequestIdRef.current) {
              setNeighborhoodGeo(geo.geom ?? null);
            }
          } catch {
            // Non-critical
          }
        }

        return;
      }

      // ── Fallback: no stored IDs, derive from coordinates ───────────────
      const hasCoords =
        Number.isFinite(lat) && Number.isFinite(lng) && lat !== 0 && lng !== 0;

      if (hasCoords) {
        await syncHierarchyFromPoint(lat, lng, false);
      }
    };

    void initialize();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []); // Empty — intentional, runs once per mount

  // ─── Sync hierarchy from a geo-point (map click / drag) ──────────────────
  const syncHierarchyFromPoint = useCallback(
    async (
      lat: number,
      lng: number,
      isInsideNeighborhood?: boolean,
    ): Promise<boolean> => {
      void isInsideNeighborhood;
      // Capture ID BEFORE the first await — critical for correct cancellation
      const requestId = ++activeRequestIdRef.current;

      let data: Awaited<
        ReturnType<typeof ubicacionesService.getDataBarrioFromGeoPoint>
      >;
      try {
        data = await ubicacionesService.getDataBarrioFromGeoPoint(lng, lat);
      } catch {
        return false;
      }

      if (requestId !== activeRequestIdRef.current || !data?.municipio?.id)
        return false;

      const provId = String(data.provincia?.id ?? "");
      const munId = String(data.municipio.id);
      const distId = data.distritoMunicipal?.id
        ? String(data.distritoMunicipal.id)
        : "";
      const secId = data.seccion?.id ? String(data.seccion.id) : "";
      const barrioId = data.id ? String(data.id) : "";

      let municipiosData: SelectOption[] = [];
      let distritosData: SelectOption[] = [];
      let seccionesData: SelectOption[] = [];
      let barriosData: SelectOption[] = [];

      try {
        ({ municipiosData, distritosData, seccionesData, barriosData } =
          await fetchAndCacheHierarchy(provId, munId, distId, secId));
      } catch {
        return false;
      }

      // Discard stale result if superseded by a newer call
      if (requestId !== activeRequestIdRef.current) return false;

      // Options first, then selected values — same pattern as init
      setAutocompleteOptions({
        municipios: municipiosData,
        distritos: distritosData,
        secciones: seccionesData,
        barrios: secId ? barriosData : [],
      });

      applyHierarchy({
        province: provId,
        municipality: munId,
        district: distId,
        section: secId,
        barrioId,
      });

      setNeighborhoodGeo(data.geom ?? null);

      return true;
    },
    [fetchAndCacheHierarchy, applyHierarchy],
  );

  // ─── Map event handlers ────────────────────────────────────────────────────
  const handleLocationChange = useCallback(
    (lat: number, lng: number) => {
      setValue("coordinates.latitude", lat, {
        shouldDirty: true,
        shouldValidate: true,
      });
      setValue("coordinates.longitude", lng, {
        shouldDirty: true,
        shouldValidate: true,
      });
    },
    [setValue],
  );

  const handleLocationDetails = useCallback(
    (details: { address: string; neighborhood?: string; zipCode: string }) => {
      setValue("address", details.address, {
        shouldDirty: true,
        shouldValidate: true,
      });
      setValue("codigoPostal", details.zipCode || "", { shouldDirty: true });
    },
    [setValue],
  );

  const handlePointSelected = useCallback(
    async (lat: number, lng: number, isInsideNeighborhood: boolean) => {
      const province = String(getValues("province") || "").trim();
      const municipality = String(getValues("municipality") || "").trim();
      const section = String(getValues("section") || "").trim();
      const barrioId = String(getValues("barrioId") || "").trim();

      const allIdsHydrated =
        isNumericId(province) &&
        isNumericId(municipality) &&
        isNumericId(section) &&
        isNumericId(barrioId);

      // Skip only when the point is confirmed inside the current polygon AND
      // all IDs are already fully populated — the only truly redundant case
      if (isInsideNeighborhood && allIdsHydrated) return;

      try {
        await syncHierarchyFromPoint(lat, lng, true);
      } catch (err) {
        console.error("Error al sincronizar jerarquía desde el mapa:", err);
      }
    },
    [getValues, syncHierarchyFromPoint],
  );

  // ─── Manual select change handlers ────────────────────────────────────────
  const handleProvinceChange = useCallback(
    (value: string | string[]) => {
      activeRequestIdRef.current += 1;
      neighborhoodGeoRequestIdRef.current += 1;

      const province = Array.isArray(value) ? value[0] : value;

      setSelectedMunicipality("");
      setSelectedDistrict("");
      setSelectedSection("");
      setSelectedNeighborhood("");
      setNeighborhoodGeo(null);
      setAutocompleteOptions({
        municipios: null,
        distritos: null,
        secciones: null,
        barrios: null,
      });

      setValue("municipality", "", { shouldDirty: true });
      setValue("district", "");
      setValue("section", "");
      setValue("barrioId", "");

      setSelectedProvince(province);
      setValue("province", province, {
        shouldDirty: true,
        shouldValidate: true,
      });
    },
    [setValue],
  );

  const handleMunicipalityChange = useCallback(
    (value: string | string[]) => {
      activeRequestIdRef.current += 1;
      neighborhoodGeoRequestIdRef.current += 1;

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

      setValue("district", "");
      setValue("section", "");
      setValue("barrioId", "");

      setSelectedMunicipality(municipality);
      setValue("municipality", municipality, {
        shouldDirty: true,
        shouldValidate: true,
      });
    },
    [setValue],
  );

  const handleDistrictChange = useCallback(
    (value: string | string[]) => {
      activeRequestIdRef.current += 1;
      neighborhoodGeoRequestIdRef.current += 1;

      const district = Array.isArray(value) ? value[0] : value;

      setSelectedSection("");
      setSelectedNeighborhood("");
      setNeighborhoodGeo(null);
      setAutocompleteOptions((prev) => ({
        ...prev,
        secciones: null,
        barrios: null,
      }));

      setValue("section", "");
      setValue("barrioId", "");

      setSelectedDistrict(district);
      setValue("district", district);
    },
    [setValue],
  );

  const handleSectionChange = useCallback(
    (value: string | string[]) => {
      activeRequestIdRef.current += 1;
      neighborhoodGeoRequestIdRef.current += 1;

      const section = Array.isArray(value) ? value[0] : value;

      setSelectedNeighborhood("");
      setNeighborhoodGeo(null);
      setAutocompleteOptions((prev) => ({ ...prev, barrios: null }));

      setValue("barrioId", "");

      setSelectedSection(section);
      setValue("section", section);
    },
    [setValue],
  );

  const handleNeighborhoodChange = useCallback(
    async (value: string | string[]) => {
      const neighborhood = Array.isArray(value) ? value[0] : value;
      const geoReqId = ++neighborhoodGeoRequestIdRef.current;

      setSelectedNeighborhood(neighborhood);
      setValue("barrioId", neighborhood);

      if (!neighborhood) {
        setNeighborhoodGeo(null);
        return;
      }

      try {
        const geo = await ubicacionesService.getGeoPointsByBarrios(
          Number(neighborhood),
        );
        if (geoReqId === neighborhoodGeoRequestIdRef.current) {
          setNeighborhoodGeo(geo.geom ?? null);
        }
      } catch (err) {
        if (geoReqId === neighborhoodGeoRequestIdRef.current) {
          console.error("Error obteniendo geometría del barrio:", err);
          setNeighborhoodGeo(null);
        }
      }
    },
    [setValue],
  );

  // ─── Render ────────────────────────────────────────────────────────────────
  return (
    <div className="space-y-4">
      <MCInput
        name="name"
        label={t("verification.forms.centerName")}
        placeholder={t("verification.forms.centerNamePlaceholder")}
        size="small"
      />
      <MCInput
        name="description"
        label={t("verification.forms.description")}
        placeholder={t("verification.forms.descriptionPlaceholder")}
        size="small"
      />
      <MCInput
        name="website"
        label={t("verification.forms.website")}
        placeholder={t("verification.forms.websitePlaceholder")}
        size="small"
      />

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <MCInput
          name="rnc"
          label={t("verification.forms.rnc")}
          placeholder={t("verification.forms.rncPlaceholder")}
          size="small"
          variant="cedula"
        />
        <MCSelect
          name="centerType"
          label={t("verification.forms.centerType")}
          placeholder={
            isLoadingCenterTypes
              ? t("verification.forms.loadingCenterTypes")
              : t("verification.forms.centerTypePlaceholder")
          }
          options={centerTypeOptions}
          size="small"
          disabled={isLoadingCenterTypes}
        />
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <MCPhoneInput
          name="phone"
          label={t("verification.forms.phone")}
          placeholder={t("verification.forms.phonePlaceholder")}
          size="small"
        />
        <MCInput
          name="email"
          label={t("verification.forms.email")}
          type="email"
          placeholder={t("verification.forms.emailPlaceholder")}
          size="small"
        />
      </div>

      <div className="space-y-2">
        <label className="block text-sm sm:text-base font-medium text-primary">
          {t("verification.forms.selectLocation")}
        </label>
        <MapSelectLocation
          value={
            coordinates?.latitude && coordinates?.longitude
              ? { lat: coordinates.latitude, lng: coordinates.longitude }
              : undefined
          }
          onChange={handleLocationChange}
          onLocationDetails={handleLocationDetails}
          neighborhoodGeo={neighborhoodGeo}
          onPointSelected={handlePointSelected}
        />
      </div>

      <MCInput
        name="address"
        label={t("verification.forms.address")}
        placeholder={t("verification.forms.addressPlaceholder")}
        size="small"
        disabled
      />

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <MCSelect
          name="province"
          label={t("verification.forms.province")}
          placeholder={
            isLoadingProvincias
              ? t(
                  "verification.forms.loadingProvinces",
                  "Cargando provincias...",
                )
              : t(
                  "verification.forms.provincePlaceholder",
                  "Seleccione provincia",
                )
          }
          value={selectedProvince}
          options={provinciasOptions}
          size="small"
          disabled={isLoadingProvincias}
          onChange={handleProvinceChange}
        />
        <MCSelect
          name="municipality"
          label={t("verification.forms.municipality")}
          placeholder={
            isLoadingMunicipios && !autocompleteOptions.municipios
              ? t(
                  "verification.forms.loadingMunicipalities",
                  "Cargando municipios...",
                )
              : selectedProvince
                ? t(
                    "verification.forms.municipalityPlaceholder",
                    "Seleccione municipio",
                  )
                : t(
                    "verification.forms.municipalityPlaceholderRequiredPrevValue",
                    "Selecciona una provincia",
                  )
          }
          value={selectedMunicipality}
          options={municipiosOptions}
          searchable={true}
          size="small"
          disabled={
            (isLoadingMunicipios && !autocompleteOptions.municipios) ||
            !selectedProvince
          }
          onChange={handleMunicipalityChange}
        />
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <MCSelect
          name="district"
          label={t("verification.forms.district", "Distrito")}
          placeholder={
            isLoadingDistritos && !autocompleteOptions.distritos
              ? t(
                  "verification.forms.loadingDistricts",
                  "Cargando distritos...",
                )
              : selectedMunicipality
                ? t(
                    "verification.forms.districtPlaceholder",
                    "Seleccione distrito",
                  )
                : t(
                    "verification.forms.districtPlaceholderRequiredPrevValue",
                    "Selecciona un municipio",
                  )
          }
          value={selectedDistrict}
          options={distritosOptions}
          searchable={true}
          size="small"
          disabled={
            (isLoadingDistritos && !autocompleteOptions.distritos) ||
            !selectedMunicipality
          }
          onChange={handleDistrictChange}
        />
        <MCSelect
          name="section"
          label={t("verification.forms.section", "Sección")}
          placeholder={
            isLoadingSecciones && !autocompleteOptions.secciones
              ? t("verification.forms.loadingSections", "Cargando secciones...")
              : selectedMunicipality
                ? t(
                    "verification.forms.sectionPlaceholder",
                    "Seleccione sección",
                  )
                : t(
                    "verification.forms.sectionPlaceholderRequiredPrevValue",
                    "Selecciona municipio o distrito",
                  )
          }
          value={selectedSection}
          options={seccionesOptions}
          searchable={true}
          size="small"
          disabled={
            (isLoadingSecciones && !autocompleteOptions.secciones) ||
            !seccionesParams
          }
          onChange={handleSectionChange}
        />
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <MCSelect
          name="barrioId"
          label={t("verification.forms.neighborhood", "Barrio")}
          placeholder={
            isLoadingBarrios && !autocompleteOptions.barrios
              ? t(
                  "verification.forms.loadingNeighborhoods",
                  "Cargando barrios...",
                )
              : selectedSection
                ? t(
                    "verification.forms.neighborhoodPlaceholder",
                    "Seleccione barrio",
                  )
                : t(
                    "verification.forms.neighborhoodPlaceholderRequiredPrevValue",
                    "Selecciona una sección",
                  )
          }
          value={selectedNeighborhood}
          options={barriosOptions}
          searchable={true}
          size="small"
          disabled={
            (isLoadingBarrios && !autocompleteOptions.barrios) ||
            !selectedSection
          }
          onChange={handleNeighborhoodChange}
        />
      </div>

      {/* Hidden fields for react-hook-form registration */}
      <input type="hidden" {...register("barrioId")} />
      <input type="hidden" {...register("codigoPostal")} />
      <input type="hidden" {...register("district")} />
      <input type="hidden" {...register("section")} />

      {/* Hidden coordinate inputs */}
      <div className="hidden">
        <MCInput
          name="coordinates.latitude"
          label=""
          type="number"
          size="small"
          disabled
        />
        <MCInput
          name="coordinates.longitude"
          label=""
          type="number"
          size="small"
          disabled
        />
      </div>
    </div>
  );
}

export default CenterForm;
