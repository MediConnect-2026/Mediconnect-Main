import MCButton from "@/shared/components/forms/MCButton";
import MCInput from "@/shared/components/forms/MCInput";
import MCFormWrapper from "@/shared/components/forms/MCFormWrapper";
import MapSelectLocation from "@/shared/components/maps/MapSelectLocation";
import { useProfileStore } from "@/stores/useProfileStore";
import { useTranslation } from "react-i18next";
import { useIsMobile } from "@/lib/hooks/useIsMobile";
import { useState, useEffect, useRef, useCallback, useMemo } from "react";
import { centerLocationSchema } from "@/schema/profile.schema";
import { useQueryClient } from "@tanstack/react-query";
import { QUERY_KEYS } from "@/lib/react-query/config";
import { useFormContext } from "react-hook-form";
import type { Geometry } from "geojson";
import type { SelectOption } from "@/features/onboarding/services/ubicaciones.types";
import ubicacionesService from "@/features/onboarding/services/ubicaciones.services";
import MCSelect from "@/shared/components/forms/MCSelect";
import useUbicaciones from "@/features/onboarding/services/useUbicaciones";
import { useGlobalUIStore } from "@/stores/useGlobalUIStore";

interface LocationProps {
  onOpenChange?: (open: boolean) => void;
  locationId?: number;
}

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

function Location({ onOpenChange, locationId }: LocationProps) {
  const { t, i18n } = useTranslation("center");
  const currentLanguage = i18n.language;
  const isMobile = useIsMobile();
  const centerLocation = useProfileStore((s) => s.centerLocation);
  const setCenterLocation = useProfileStore((s) => s.setCenterLocation);
  const setToast = useGlobalUIStore((s) => s.setToast);

  const queryClient = useQueryClient();
  const [formKey] = useState(0);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [coordinates, setCoordinates] = useState({
    lat: centerLocation?.coordinates?.latitude || 18.4861,
    lng: centerLocation?.coordinates?.longitude || -69.9312,
  });

  const [selectedProvince, setSelectedProvince] = useState<string>(
    centerLocation?.province || "",
  );
  const [selectedMunicipality, setSelectedMunicipality] = useState<string>(
    centerLocation?.municipality || "",
  );
  const [selectedDistrict, setSelectedDistrict] = useState<string>(
    centerLocation?.district || "",
  );
  const [selectedSection, setSelectedSection] = useState<string>(
    centerLocation?.section || "",
  );
  const [selectedNeighborhood, setSelectedNeighborhood] = useState<string>(
    centerLocation?.neighborhood || "",
  );
  const [neighborhoodGeo, setNeighborhoodGeo] = useState<Geometry | null>(null);

  const [autocompleteOptions, setAutocompleteOptions] = useState<{
    municipios: SelectOption[] | null;
    distritos: SelectOption[] | null;
    secciones: SelectOption[] | null;
    barrios: SelectOption[] | null;
  }>({ municipios: null, distritos: null, secciones: null, barrios: null });

  const formSetValueRef = useRef<((name: string, value: any) => void) | null>(
    null,
  );

  const updateStoreField = useCallback(
    (field: string, value: any) => {
      setCenterLocation({
        address: centerLocation?.address || "",
        province: centerLocation?.province || "",
        municipality: centerLocation?.municipality || "",
        section: centerLocation?.section || "",
        neighborhood: centerLocation?.neighborhood || "",
        district: centerLocation?.district || "",
        coordinates: centerLocation?.coordinates || {
          latitude: 18.4861,
          longitude: -69.9312,
        },
        ...centerLocation,
        [field]: value,
      });
    },
    [centerLocation, setCenterLocation],
  );

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

  const municipiosOptions =
    autocompleteOptions.municipios ?? municipiosFromQuery;
  const distritosOptions = autocompleteOptions.distritos ?? distritosFromQuery;
  const seccionesOptions = autocompleteOptions.secciones ?? seccionesFromQuery;
  const barriosOptions = autocompleteOptions.barrios ?? barriosFromQuery;

  const handlePointSelected = useCallback(
    async (lat: number, lng: number, isInsideNeighborhood: boolean) => {
      setCoordinates({ lat, lng });
      updateStoreField("coordinates", { latitude: lat, longitude: lng });

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

        const newSeccionesParams = distId
          ? { idDistrito: distId }
          : { idMunicipio: munId };
        const newBarriosParams = { idSeccion: secId };

        const [municipiosData, distritosData, seccionesData, barriosData] =
          await Promise.all([
            ubicacionesService.getMunicipios(currentLanguage, Number(provId)),
            ubicacionesService.getDistritos(currentLanguage, Number(munId)),
            ubicacionesService.getSecciones(
              currentLanguage,
              newSeccionesParams,
            ),
            ubicacionesService.getBarrios(currentLanguage, Number(secId)),
          ]);

        queryClient.setQueryData(
          QUERY_KEYS.UBICACIONES("municipios", { idProvincia: provId }),
          municipiosData,
        );
        queryClient.setQueryData(
          QUERY_KEYS.UBICACIONES("distritos", { idMunicipio: munId }),
          distritosData,
        );
        if (distId) {
          queryClient.setQueryData(
            QUERY_KEYS.UBICACIONES("secciones", { idDistrito: distId }),
            seccionesData,
          );
        } else {
          queryClient.setQueryData(
            QUERY_KEYS.UBICACIONES("secciones", { idMunicipio: munId }),
            seccionesData,
          );
        }
        queryClient.setQueryData(
          QUERY_KEYS.UBICACIONES("barrios", newBarriosParams),
          barriosData,
        );

        setAutocompleteOptions({
          municipios: municipiosData,
          distritos: distritosData,
          secciones: seccionesData,
          barrios: newBarriosParams ? barriosData : [],
        });

        setSelectedProvince(provId);
        setSelectedMunicipality(munId);
        setSelectedDistrict(distId || "");
        setSelectedSection(secId || "");
        setSelectedNeighborhood(barrioId || "");
        setNeighborhoodGeo(data.geom ?? null);

        setCenterLocation({
          address: centerLocation?.address || "",
          coordinates: { latitude: lat, longitude: lng },
          province: provId,
          municipality: munId,
          district: distId || "",
          section: secId || "",
          neighborhood: barrioId || "",
        });

        setTimeout(() => {
          if (formSetValueRef.current) {
            formSetValueRef.current("province", provId);
            formSetValueRef.current("municipality", munId);
            formSetValueRef.current("district", distId || "");
            formSetValueRef.current("section", secId || "");
            formSetValueRef.current("neighborhood", barrioId || "");
          }
        }, 0);
      } catch (err) {
        console.error("Error obteniendo barrio por punto:", err);
      }
    },
    [
      updateStoreField,
      queryClient,
      currentLanguage,
      centerLocation,
      setCenterLocation,
    ],
  );

  // ─── EFECTO MODO EDICIÓN: Cargar datos si existe locationId ────────────
  const loadedLocationIdRef = useRef<number | null>(null);

  useEffect(() => {
    if (locationId && loadedLocationIdRef.current !== locationId) {
      loadedLocationIdRef.current = locationId;
      const loadLocationForEdit = async () => {
        try {
          const locationData =
            await ubicacionesService.getLocationById(locationId);
          if (locationData?.data || locationData?.id) {
            const location = locationData.data || locationData;
            const lng = location.puntoGeografico.coordinates[0];
            const lat = location.puntoGeografico.coordinates[1];

            setCoordinates({ lat, lng });
            updateStoreField("address", location.direccion);
            updateStoreField("coordinates", { latitude: lat, longitude: lng });

            if (formSetValueRef.current) {
              formSetValueRef.current("address", location.direccion);
            }

            // Cargar la jerarquía geográfica
            await handlePointSelected(lat, lng, false);
          }
        } catch (error) {
          console.error("Error cargando ubicación para editar:", error);
        }
      };

      loadLocationForEdit();
    }
  }, [locationId, updateStoreField, handlePointSelected]);

  const handleProvinceChange = useCallback(
    (value: string | string[]) => {
      setAutocompleteOptions({
        municipios: null,
        distritos: null,
        secciones: null,
        barrios: null,
      });
      const provinceValue = Array.isArray(value) ? value[0] : value;
      setSelectedProvince(provinceValue);
      setSelectedMunicipality("");
      setSelectedDistrict("");
      setSelectedSection("");
      setSelectedNeighborhood("");

      setCenterLocation({
        address: centerLocation?.address || "",
        coordinates: centerLocation?.coordinates || {
          latitude: 18.4861,
          longitude: -69.9312,
        },
        section: centerLocation?.section || "",
        neighborhood: centerLocation?.neighborhood || "",
        ...centerLocation,
        province: provinceValue,
        municipality: "",
        district: "",
      });

      if (formSetValueRef.current) {
        formSetValueRef.current("province", provinceValue);
        formSetValueRef.current("municipality", "");
        formSetValueRef.current("district", "");
        formSetValueRef.current("section", "");
        formSetValueRef.current("neighborhood", "");
      }
    },
    [setCenterLocation, centerLocation],
  );

  const handleMunicipalityChange = useCallback(
    (value: string | string[]) => {
      const municipalityValue = Array.isArray(value) ? value[0] : value;
      setAutocompleteOptions((prev) => ({
        ...prev,
        distritos: null,
        secciones: null,
        barrios: null,
      }));
      setSelectedMunicipality(municipalityValue);
      setSelectedDistrict("");
      setSelectedSection("");
      setSelectedNeighborhood("");

      setCenterLocation({
        address: centerLocation?.address || "",
        coordinates: centerLocation?.coordinates || {
          latitude: 18.4861,
          longitude: -69.9312,
        },
        section: centerLocation?.section || "",
        neighborhood: centerLocation?.neighborhood || "",
        province: centerLocation?.province || "",
        ...centerLocation,
        municipality: municipalityValue,
        district: "",
      });

      if (formSetValueRef.current) {
        formSetValueRef.current("municipality", municipalityValue);
        formSetValueRef.current("district", "");
        formSetValueRef.current("section", "");
        formSetValueRef.current("neighborhood", "");
      }
    },
    [setCenterLocation, centerLocation],
  );

  const handleDistrictChange = useCallback(
    (value: string | string[]) => {
      const districtValue = Array.isArray(value) ? value[0] : value;
      setAutocompleteOptions((prev) => ({
        ...prev,
        secciones: null,
        barrios: null,
      }));
      setSelectedDistrict(districtValue);
      setSelectedSection("");
      setSelectedNeighborhood("");

      setCenterLocation({
        address: centerLocation?.address || "",
        coordinates: centerLocation?.coordinates || {
          latitude: 18.4861,
          longitude: -69.9312,
        },
        section: centerLocation?.section || "",
        neighborhood: centerLocation?.neighborhood || "",
        province: centerLocation?.province || "",
        municipality: centerLocation?.municipality || "",
        ...centerLocation,
        district: districtValue,
      });

      if (formSetValueRef.current) {
        formSetValueRef.current("district", districtValue);
        formSetValueRef.current("section", "");
        formSetValueRef.current("neighborhood", "");
      }
    },
    [setCenterLocation, centerLocation],
  );

  const handleSectionChange = useCallback(
    (value: string | string[]) => {
      const sectionValue = Array.isArray(value) ? value[0] : value;
      setAutocompleteOptions((prev) => ({ ...prev, barrios: null }));
      setSelectedSection(sectionValue);
      setSelectedNeighborhood("");

      setCenterLocation({
        address: centerLocation?.address || "",
        coordinates: centerLocation?.coordinates || {
          latitude: 18.4861,
          longitude: -69.9312,
        },
        neighborhood: centerLocation?.neighborhood || "",
        province: centerLocation?.province || "",
        municipality: centerLocation?.municipality || "",
        district: centerLocation?.district || "",
        ...centerLocation,
        section: sectionValue,
      });

      if (formSetValueRef.current) {
        formSetValueRef.current("section", sectionValue);
        formSetValueRef.current("neighborhood", "");
      }
    },
    [setCenterLocation, centerLocation],
  );

  const handleNeighborhoodChange = useCallback(
    async (value: string | string[]) => {
      const neighborhoodValue = Array.isArray(value) ? value[0] : value;
      setSelectedNeighborhood(neighborhoodValue);
      updateStoreField("neighborhood", neighborhoodValue);

      if (formSetValueRef.current) {
        formSetValueRef.current("neighborhood", neighborhoodValue);
      }

      const selectedBarrio = barriosOptions.find(
        (b) => (b as SelectOption).value === neighborhoodValue,
      );
      if (selectedBarrio) {
        try {
          const geo = await ubicacionesService.getGeoPointsByBarrios(
            Number((selectedBarrio as SelectOption).value),
          );
          setNeighborhoodGeo(geo.geom ?? null);
        } catch (error) {
          console.error("Error obteniendo geometría del barrio:", error);
          setNeighborhoodGeo(null);
        }
      }
    },
    [updateStoreField, barriosOptions],
  );

  const handleMapChange = (lat: number, lng: number) => {
    setCoordinates({ lat, lng });
    updateStoreField("coordinates", { latitude: lat, longitude: lng });
    if (formSetValueRef.current) {
      formSetValueRef.current("coordinates", {
        latitude: lat,
        longitude: lng,
      });
    }
  };

  const handleLocationDetails = (details: {
    address: string;
    neighborhood?: string;
    zipCode?: string;
    province?: string;
    municipality?: string;
  }) => {
    updateStoreField("address", details.address);
    if (formSetValueRef.current) {
      formSetValueRef.current("address", details.address);
    }
  };

  const handleSubmit = async (data: any) => {
    const barrioIdToUse = Number(data.neighborhood || selectedNeighborhood);

    if (!barrioIdToUse || !locationId) {
      setToast({
        message: t(
          "locationForm.errors.selectNeighborhood",
          "Por favor, selecciona un barrio.",
        ),
        type: "error",
        open: true,
      });
      return;
    }

    setIsSubmitting(true);

    try {
      console.log(coordinates);
      await ubicacionesService.updateCenterLocation({
        locationId: locationId || 0,
        barrioId: barrioIdToUse,
        direccion: data.address || centerLocation?.address || "",
        codigoPostal: "10109", // Hardcoded o mapear si se agrega en el form
        coordinates: {
          latitude: coordinates.lat,
          longitude: coordinates.lng,
        },
      });

      setCenterLocation({
        ...centerLocation,
        ...data,
        coordinates: centerLocation?.coordinates || coordinates,
      });

      setToast({
        message: t(
          "locationForm.success",
          "Ubicación actualizada correctamente",
        ),
        type: "success",
        open: true,
      });

      // Invalidate location cache and center profile so pages reflect the update
      try {
        queryClient.invalidateQueries({
          queryKey: QUERY_KEYS.UBICACIONES("location", {
            id: locationId,
            lang: currentLanguage,
          }),
        });
        queryClient.invalidateQueries({
          queryKey: ["center-profile", currentLanguage],
        });
      } catch (err) {
        console.error("Error invalidating queries after location update:", err);
      }

      if (onOpenChange) onOpenChange(false);
    } catch {
      setToast({
        message: t(
          "locationForm.errors.updateFailed",
          "Error al actualizar la ubicación.",
        ),
        type: "error",
        open: true,
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="w-full flex flex-col gap-4">
      <div className="mb-5">
        <h1 className="text-2xl sm:text-3xl font-bold text-primary mb-2">
          {t("locationForm.title", "Location of the Health Center")}
        </h1>
        <p className="text-primary/60 text-sm sm:text-base">
          {t(
            "locationForm.subtitle",
            "Select the exact location and fill in the address details.",
          )}
        </p>
      </div>

      <div className="h-[350px] mb-6">
        <MapSelectLocation
          value={coordinates}
          onChange={handleMapChange}
          onLocationDetails={handleLocationDetails}
          onPointSelected={handlePointSelected}
          neighborhoodGeo={neighborhoodGeo}
        />
      </div>

      <MCFormWrapper
        schema={centerLocationSchema(t)}
        onSubmit={handleSubmit}
        defaultValues={
          centerLocation || {
            address: "",
            province: "",
            municipality: "",
            district: "",
            section: "",
            neighborhood: "",
            coordinates: {
              latitude: coordinates.lat,
              longitude: coordinates.lng,
            },
          }
        }
        key={formKey}
        className="flex flex-col gap-4"
      >
        <FormBridge formSetValueRef={formSetValueRef} />

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <MCInput
            name="address"
            label={t("locationForm.addressLabel", "Address")}
            placeholder={t(
              "locationForm.addressPlaceholder",
              "Street, number, etc.",
            )}
            onChange={(e) => updateStoreField("address", e.target.value)}
          />
          <MCSelect
            name="province"
            label={t("locationForm.provinceLabel", "Province")}
            placeholder={
              isLoadingProvincias
                ? t("locationForm.loadingProvinces", "Cargando provincias...")
                : t("locationForm.provincePlaceholder", "Province")
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
            label={t("locationForm.municipalityLabel", "Municipality")}
            placeholder={
              isLoadingMunicipios
                ? t(
                    "locationForm.loadingMunicipalities",
                    "Cargando municipios...",
                  )
                : selectedProvince
                  ? t("locationForm.municipalityPlaceholder", "Municipality")
                  : t(
                      "locationForm.selectProvinceFirst",
                      "Select a province first",
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
            label={t("locationForm.districtLabel", "District")}
            placeholder={
              isLoadingDistritos
                ? t("locationForm.loadingDistricts", "Cargando distritos...")
                : selectedMunicipality
                  ? t("locationForm.districtPlaceholder", "District")
                  : t(
                      "locationForm.selectMunicipalityFirst",
                      "Select a municipality first",
                    )
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
            label={t("locationForm.sectionLabel", "Section")}
            placeholder={
              isLoadingSecciones
                ? t("locationForm.loadingSections", "Cargando secciones...")
                : selectedMunicipality
                  ? t("locationForm.sectionPlaceholder", "Section")
                  : t(
                      "locationForm.selectMunicipalityFirst",
                      "Select a municipality first",
                    )
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
            label={t("locationForm.neighborhoodLabel", "Neighborhood")}
            placeholder={
              isLoadingBarrios
                ? t("locationForm.loadingNeighborhoods", "Cargando barrios...")
                : selectedSection
                  ? t("locationForm.neighborhoodPlaceholder", "Neighborhood")
                  : t(
                      "locationForm.selectSectionFirst",
                      "Select a section first",
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

        <div
          className={`flex ${isMobile ? "flex-col" : "flex-row"} gap-3 mt-4`}
        >
          <MCButton
            variant="primary"
            size="m"
            type="submit"
            className={isMobile ? "w-full" : ""}
            disabled={isSubmitting}
          >
            {isSubmitting
              ? t("profileForm.loading", "Guardando...")
              : t("profileForm.saveChanges", "Save Changes")}
          </MCButton>
          {onOpenChange && (
            <MCButton
              variant="secondary"
              size="m"
              onClick={() => onOpenChange(false)}
              className={isMobile ? "w-full" : ""}
              disabled={isSubmitting}
            >
              {t("profileForm.cancel", "Cancel")}
            </MCButton>
          )}
        </div>
      </MCFormWrapper>
    </div>
  );
}

export default Location;
