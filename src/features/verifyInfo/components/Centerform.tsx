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

const DEFAULT_COORDS = {
  latitude: 18.4861,
  longitude: -69.9312,
};

const isNumericId = (value: string) => /^\d+$/.test(value);

function CenterForm() {
  const { t, i18n } = useTranslation("common");
  const currentLanguage = i18n.language;
  const { register, setValue, watch, getValues } = useFormContext();
  const queryClient = useQueryClient();

  const coordinates = watch("coordinates");

  const { data: centerTypeOptions = [], isLoading: isLoadingCenterTypes } =
    useTiposCentros();

  const [selectedProvince, setSelectedProvince] = useState<string>("");
  const [selectedMunicipality, setSelectedMunicipality] = useState<string>("");
  const [selectedDistrict, setSelectedDistrict] = useState<string>("");
  const [selectedSection, setSelectedSection] = useState<string>("");
  const [selectedNeighborhood, setSelectedNeighborhood] = useState<string>("");
  const [neighborhoodGeo, setNeighborhoodGeo] = useState<Geometry | null>(null);

  const [autocompleteOptions, setAutocompleteOptions] = useState<{
    municipios: SelectOption[] | null;
    distritos: SelectOption[] | null;
    secciones: SelectOption[] | null;
    barrios: SelectOption[] | null;
  }>({
    municipios: null,
    distritos: null,
    secciones: null,
    barrios: null,
  });

  const pointLookupRequestIdRef = useRef(0);
  const neighborhoodGeoRequestIdRef = useRef(0);
  // Track whether the one-time init has already run to prevent re-runs
  const initDoneRef = useRef(false);

  const { data: provinciasOptions = [], isLoading: isLoadingProvincias } =
    useUbicaciones("provincias");

  const municipiosParams = useMemo(
    () => (selectedProvince ? { idProvincia: selectedProvince } : undefined),
    [selectedProvince]
  );
  const { data: municipiosFromQuery = [], isLoading: isLoadingMunicipios } =
    useUbicaciones("municipios", municipiosParams);

  const distritosParams = useMemo(
    () =>
      selectedMunicipality ? { idMunicipio: selectedMunicipality } : undefined,
    [selectedMunicipality]
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
    [selectedSection]
  );
  const { data: barriosFromQuery = [], isLoading: isLoadingBarrios } =
    useUbicaciones("barrios", barriosParams);

  const municipiosOptions =
    autocompleteOptions.municipios ?? municipiosFromQuery;
  const distritosOptions = autocompleteOptions.distritos ?? distritosFromQuery;
  const seccionesOptions = autocompleteOptions.secciones ?? seccionesFromQuery;
  const barriosOptions = autocompleteOptions.barrios ?? barriosFromQuery;

  const invalidateAsyncLookups = useCallback(() => {
    pointLookupRequestIdRef.current += 1;
    neighborhoodGeoRequestIdRef.current += 1;
  }, []);

  const setFormField = useCallback(
    (field: string, value: string, shouldValidate: boolean, shouldDirty = true) => {
      setValue(field, value, {
        shouldDirty,
        shouldValidate,
      });
    },
    [setValue]
  );

  const fetchHierarchyOptions = useCallback(
    async (provId: string, munId: string, distId: string, secId: string) => {
      const [municipiosData, distritosData, seccionesData, barriosData] =
        await Promise.all([
          provId
            ? ubicacionesService.getMunicipios(currentLanguage, Number(provId))
            : Promise.resolve([]),
          munId
            ? ubicacionesService.getDistritos(currentLanguage, Number(munId))
            : Promise.resolve([]),
          distId
            ? ubicacionesService.getSecciones(currentLanguage, { idDistrito: distId })
            : munId
              ? ubicacionesService.getSecciones(currentLanguage, {
                  idMunicipio: munId,
                })
              : Promise.resolve([]),
          secId
            ? ubicacionesService.getBarrios(currentLanguage, Number(secId))
            : Promise.resolve([]),
        ]);

      return {
        municipiosData,
        distritosData,
        seccionesData,
        barriosData,
      };
    },
    [currentLanguage]
  );

  const syncHierarchyFromPoint = useCallback(
    async (lat: number, lng: number, markDirty: boolean) => {
      const requestId = ++pointLookupRequestIdRef.current;

      const data = await ubicacionesService.getDataBarrioFromGeoPoint(lng, lat);
      if (!data?.municipio?.id || requestId !== pointLookupRequestIdRef.current) {
        return false;
      }

      const provId = String(data.provincia?.id ?? "");
      const munId = String(data.municipio.id);
      const distId = data.distritoMunicipal?.id
        ? String(data.distritoMunicipal.id)
        : "";
      const secId = data.seccion?.id ? String(data.seccion.id) : "";
      const barrioId = data.id ? String(data.id) : "";

      const {
        municipiosData,
        distritosData,
        seccionesData,
        barriosData,
      } = await fetchHierarchyOptions(provId, munId, distId, secId);

      if (requestId !== pointLookupRequestIdRef.current) {
        return false;
      }

      queryClient.setQueryData(
        QUERY_KEYS.UBICACIONES("municipios", { idProvincia: provId }),
        municipiosData
      );
      queryClient.setQueryData(
        QUERY_KEYS.UBICACIONES("distritos", { idMunicipio: munId }),
        distritosData
      );
      queryClient.setQueryData(
        QUERY_KEYS.UBICACIONES(
          "secciones",
          distId ? { idDistrito: distId } : { idMunicipio: munId }
        ),
        seccionesData
      );
      if (secId) {
        queryClient.setQueryData(
          QUERY_KEYS.UBICACIONES("barrios", { idSeccion: secId }),
          barriosData
        );
      }

      setAutocompleteOptions({
        municipios: municipiosData,
        distritos: distritosData,
        secciones: seccionesData,
        barrios: secId ? barriosData : [],
      });

      setSelectedProvince(provId);
      setSelectedMunicipality(munId);
      setSelectedDistrict(distId);
      setSelectedSection(secId);
      setSelectedNeighborhood(barrioId);
      setNeighborhoodGeo(data.geom ?? null);

      setFormField("province", provId, markDirty, markDirty);
      setFormField("municipality", munId, markDirty, markDirty);
      setFormField("district", distId, false, markDirty);
      setFormField("section", secId, false, markDirty);
      setFormField("barrioId", barrioId, false, markDirty);

      return true;
    },
    [fetchHierarchyOptions, queryClient, setFormField]
  );

  // Keep a stable ref to syncHierarchyFromPoint so the init effect never
  // needs it as a dependency (avoids the re-run / cancel race condition).
  const syncHierarchyFromPointRef = useRef(syncHierarchyFromPoint);
  useEffect(() => {
    syncHierarchyFromPointRef.current = syncHierarchyFromPoint;
  }, [syncHierarchyFromPoint]);

  // Keep a stable ref to fetchHierarchyOptions for the same reason.
  const fetchHierarchyOptionsRef = useRef(fetchHierarchyOptions);
  useEffect(() => {
    fetchHierarchyOptionsRef.current = fetchHierarchyOptions;
  }, [fetchHierarchyOptions]);

  // ─── ONE-TIME INIT ────────────────────────────────────────────────────────
  // This effect must run exactly once when the form mounts so it can read the
  // defaultValues that react-hook-form has already injected into the form
  // state.  Previously it listed `syncHierarchyFromPoint` (and transitively
  // `fetchHierarchyOptions` / `currentLanguage`) as dependencies, which caused
  // it to fire multiple times in quick succession: each run cancelled the
  // previous one via the `cancelled` flag before the async chain had a chance
  // to complete — hence needing 3+ map clicks to "wake up" the autocomplete.
  //
  // Fix: run on mount only (empty deps) and call the latest version of the
  // helpers through refs so closures stay fresh without triggering re-runs.
  useEffect(() => {
    if (initDoneRef.current) return;
    initDoneRef.current = true;

    const initializeFromForm = async () => {
      const provIdRaw = String(getValues("province") || "").trim();
      const munIdRaw = String(getValues("municipality") || "").trim();
      const distIdRaw = String(getValues("district") || "").trim();
      const secIdRaw = String(getValues("section") || "").trim();
      const barrioIdRaw = String(getValues("barrioId") || "").trim();

      setSelectedProvince(provIdRaw);
      setSelectedMunicipality(munIdRaw);
      setSelectedDistrict(distIdRaw);
      setSelectedSection(secIdRaw);
      setSelectedNeighborhood(barrioIdRaw);

      const lat = Number(getValues("coordinates.latitude") || 0);
      const lng = Number(getValues("coordinates.longitude") || 0);
      const hasValidCoords =
        Number.isFinite(lat) &&
        Number.isFinite(lng) &&
        lat !== 0 &&
        lng !== 0;

      if (!lat || !lng) {
        setValue("coordinates.latitude", DEFAULT_COORDS.latitude, {
          shouldDirty: false,
          shouldValidate: false,
        });
        setValue("coordinates.longitude", DEFAULT_COORDS.longitude, {
          shouldDirty: false,
          shouldValidate: false,
        });
      }

      try {
        const hasNumericHierarchy =
          isNumericId(provIdRaw) && isNumericId(munIdRaw);

        if (hasNumericHierarchy) {
          const distId = isNumericId(distIdRaw) ? distIdRaw : "";
          const secId = isNumericId(secIdRaw) ? secIdRaw : "";

          const {
            municipiosData,
            distritosData,
            seccionesData,
            barriosData,
          } = await fetchHierarchyOptionsRef.current(provIdRaw, munIdRaw, distId, secId);

          setAutocompleteOptions({
            municipios: municipiosData,
            distritos: distritosData,
            secciones: seccionesData,
            barrios: barriosData,
          });

          if (barrioIdRaw && isNumericId(barrioIdRaw)) {
            const geoRequestId = ++neighborhoodGeoRequestIdRef.current;
            const geo = await ubicacionesService.getGeoPointsByBarrios(
              Number(barrioIdRaw)
            );
            if (geoRequestId === neighborhoodGeoRequestIdRef.current) {
              setNeighborhoodGeo(geo.geom ?? null);
            }
          } else {
            setNeighborhoodGeo(null);
          }

          return;
        }

        if (hasValidCoords) {
          const resolved = await syncHierarchyFromPointRef.current(lat, lng, false);
          if (resolved) return;
        }

        if (barrioIdRaw && isNumericId(barrioIdRaw)) {
          const geoRequestId = ++neighborhoodGeoRequestIdRef.current;
          const geo = await ubicacionesService.getGeoPointsByBarrios(
            Number(barrioIdRaw)
          );
          if (geoRequestId === neighborhoodGeoRequestIdRef.current) {
            setNeighborhoodGeo(geo.geom ?? null);
          }
        } else if (!provIdRaw && !munIdRaw && !distIdRaw && !secIdRaw) {
          setAutocompleteOptions({
            municipios: null,
            distritos: null,
            secciones: null,
            barrios: null,
          });
          setNeighborhoodGeo(null);
        }
      } catch (error) {
        console.error("Error inicializando jerarquia desde formulario:", error);
      }
    };

    void initializeFromForm();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []); // intentionally empty — runs once on mount

  const applyField = useCallback(
    (
      field: string,
      value: string,
      stateSetter: (value: string) => void,
      shouldValidate = true
    ) => {
      stateSetter(value);
      setFormField(field, value, shouldValidate);
    },
    [setFormField]
  );

  const handleProvinceChange = useCallback(
    (value: string | string[]) => {
      invalidateAsyncLookups();

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

      setFormField("municipality", "", true);
      setFormField("district", "", false);
      setFormField("section", "", false);
      setFormField("barrioId", "", false);

      applyField("province", province, setSelectedProvince, true);
    },
    [applyField, invalidateAsyncLookups, setFormField]
  );

  const handleMunicipalityChange = useCallback(
    (value: string | string[]) => {
      invalidateAsyncLookups();

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

      setFormField("district", "", false);
      setFormField("section", "", false);
      setFormField("barrioId", "", false);

      applyField("municipality", municipality, setSelectedMunicipality, true);
    },
    [applyField, invalidateAsyncLookups, setFormField]
  );

  const handleDistrictChange = useCallback(
    (value: string | string[]) => {
      invalidateAsyncLookups();

      const district = Array.isArray(value) ? value[0] : value;
      setSelectedSection("");
      setSelectedNeighborhood("");
      setNeighborhoodGeo(null);
      setAutocompleteOptions((prev) => ({
        ...prev,
        secciones: null,
        barrios: null,
      }));

      setFormField("section", "", false);
      setFormField("barrioId", "", false);

      applyField("district", district, setSelectedDistrict, false);
    },
    [applyField, invalidateAsyncLookups, setFormField]
  );

  const handleSectionChange = useCallback(
    (value: string | string[]) => {
      invalidateAsyncLookups();

      const section = Array.isArray(value) ? value[0] : value;
      setSelectedNeighborhood("");
      setNeighborhoodGeo(null);
      setAutocompleteOptions((prev) => ({ ...prev, barrios: null }));

      setFormField("barrioId", "", false);
      applyField("section", section, setSelectedSection, false);
    },
    [applyField, invalidateAsyncLookups, setFormField]
  );

  const handleNeighborhoodChange = useCallback(
    async (value: string | string[]) => {
      const neighborhood = Array.isArray(value) ? value[0] : value;
      setSelectedNeighborhood(neighborhood);
      setFormField("barrioId", neighborhood, false);

      const geoRequestId = ++neighborhoodGeoRequestIdRef.current;

      if (!neighborhood) {
        setNeighborhoodGeo(null);
        return;
      }

      try {
        const geo = await ubicacionesService.getGeoPointsByBarrios(
          Number(neighborhood)
        );

        if (geoRequestId !== neighborhoodGeoRequestIdRef.current) {
          return;
        }

        setNeighborhoodGeo(geo.geom ?? null);
      } catch (error) {
        if (geoRequestId === neighborhoodGeoRequestIdRef.current) {
          console.error("Error obteniendo geometria del barrio:", error);
          setNeighborhoodGeo(null);
        }
      }
    },
    [setFormField]
  );

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
    [setValue]
  );

  const handleLocationDetails = useCallback(
    (details: {
      address: string;
      neighborhood?: string;
      zipCode: string;
      province?: string;
      municipality?: string;
    }) => {
      setValue("address", details.address, {
        shouldDirty: true,
        shouldValidate: true,
      });
      setValue("codigoPostal", details.zipCode || "", {
        shouldDirty: true,
        shouldValidate: false,
      });
      // No escribir provincia/municipio desde geocoding (texto),
      // la jerarquia debe poblarse con IDs via onPointSelected.
    },
    [setValue]
  );

  const handlePointSelected = useCallback(
    async (lat: number, lng: number, isInsideNeighborhood: boolean) => {
      const province = String(getValues("province") || "").trim();
      const municipality = String(getValues("municipality") || "").trim();
      const section = String(getValues("section") || "").trim();
      const barrioId = String(getValues("barrioId") || "").trim();

      const hasHydratedHierarchy =
        isNumericId(province) &&
        isNumericId(municipality) &&
        isNumericId(section) &&
        isNumericId(barrioId);

      // If the point is already inside the polygon and IDs are already hydrated,
      // avoid redundant reverse-lookup requests.
      if (isInsideNeighborhood && hasHydratedHierarchy) return;

      try {
        await syncHierarchyFromPoint(lat, lng, true);
      } catch (error) {
        console.error("Error obteniendo barrio por punto en verificacion:", error);
      }
    },
    [getValues, syncHierarchyFromPoint]
  );

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

      <div className="space-y-4">
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
              ? t("verification.forms.loadingProvinces", "Cargando provincias...")
              : t("verification.forms.provincePlaceholder", "Seleccione provincia")
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
            isLoadingMunicipios
              ? t("verification.forms.loadingMunicipalities", "Cargando municipios...")
              : selectedProvince
                ? t("verification.forms.municipalityPlaceholder", "Seleccione municipio")
                : t(
                    "verification.forms.municipalityPlaceholderRequiredPrevValue",
                    "Selecciona una provincia"
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
            isLoadingDistritos
              ? t("verification.forms.loadingDistricts", "Cargando distritos...")
              : selectedMunicipality
                ? t("verification.forms.districtPlaceholder", "Seleccione distrito")
                : t(
                    "verification.forms.districtPlaceholderRequiredPrevValue",
                    "Selecciona un municipio"
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
            isLoadingSecciones
              ? t("verification.forms.loadingSections", "Cargando secciones...")
              : selectedMunicipality
                ? t("verification.forms.sectionPlaceholder", "Seleccione sección")
                : t(
                    "verification.forms.sectionPlaceholderRequiredPrevValue",
                    "Selecciona municipio o distrito"
                  )
          }
          value={selectedSection}
          options={seccionesOptions}
          searchable={true}
          size="small"
          disabled={
            (isLoadingSecciones && !autocompleteOptions.secciones) || !seccionesParams
          }
          onChange={handleSectionChange}
        />
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <MCSelect
          name="barrioId"
          label={t("verification.forms.neighborhood", "Barrio")}
          placeholder={
            isLoadingBarrios
              ? t("verification.forms.loadingNeighborhoods", "Cargando barrios...")
              : selectedSection
                ? t("verification.forms.neighborhoodPlaceholder", "Seleccione barrio")
                : t(
                    "verification.forms.neighborhoodPlaceholderRequiredPrevValue",
                    "Selecciona una sección"
                  )
          }
          value={selectedNeighborhood}
          options={barriosOptions}
          searchable={true}
          size="small"
          disabled={
            (isLoadingBarrios && !autocompleteOptions.barrios) || !selectedSection
          }
          onChange={handleNeighborhoodChange}
        />
      </div>

      <input type="hidden" {...register("barrioId")} />
      <input type="hidden" {...register("codigoPostal")} />
      <input type="hidden" {...register("district")} />
      <input type="hidden" {...register("section")} />

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 hidden">
        <MCInput
          name="coordinates.latitude"
          label={t("verification.forms.latitude")}
          type="number"
          placeholder={t("verification.forms.provincePlaceholder")}
          size="small"
          disabled
        />
        <MCInput
          name="coordinates.longitude"
          label={t("verification.forms.longitude")}
          type="number"
          placeholder={t("verification.forms.provincePlaceholder")}
          size="small"
          disabled
        />
      </div>
    </div>
  );
}

export default CenterForm;