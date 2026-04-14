import { MCModalBase } from "@/shared/components/MCModalBase";
import MapSelectLocation from "@/shared/components/maps/MapSelectLocation";
import MCInput from "@/shared/components/forms/MCInput";
import MCSelect from "@/shared/components/forms/MCSelect";
import { useCreateServicesStore } from "@/stores/useCreateServicesStore";
import { locationSchema } from "@/schema/createService.schema";
import { useTranslation } from "react-i18next";
import MCFormWrapper from "@/shared/components/forms/MCFormWrapper";
import { useRef, useState, useEffect, useCallback, useMemo } from "react";
import React from "react";
import { useUbicaciones } from "@/features/onboarding/services/useUbicaciones";
import { useQueryClient, useMutation } from "@tanstack/react-query";
import { QUERY_KEYS } from "@/lib/react-query/config";
import { useFormContext } from "react-hook-form";
import type { Geometry } from "geojson";
import type {
  SelectOption,
  createLocationRequest,
} from "@/features/onboarding/services/ubicaciones.types";
import ubicacionesService from "@/features/onboarding/services/ubicaciones.services";
import { toast } from "sonner";

interface manageLocationProps {
  children: React.ReactNode;
  triggerClassName?: string;
  // Props para modo lectura (view-only)
  locationToView?: any;
  isReadOnly?: boolean;
  onCloseModal?: () => void;
  // Props para modo edición
  locationId?: number;
  onLocationUpdated?: () => void;
}

// FormBridge para exponer setValue del FormContext
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

function ManageLocation({
  children,
  triggerClassName,
  locationToView,
  isReadOnly = false,
  onCloseModal,
  locationId,
  onLocationUpdated,
}: manageLocationProps) {
  const { t } = useTranslation("doctor");
  const { i18n } = useTranslation();
  const currentLanguage = i18n.language;
  const formRef = useRef<any>(null);
  const queryClient = useQueryClient();

  const locatonFormSchema = locationSchema(t);

  const setlocationField = useCreateServicesStore((s) => s.setlocationField);
  const locationData = useCreateServicesStore((s) => s.locationData);
  const clearLocationData = useCreateServicesStore((s) => s.clearLocationData);

  const [coordinates, setCoordinates] = useState({
    lat: 18.4861,
    lng: -69.9312,
  });

  // ─── Estado de selects (valores seleccionados) ────────────────────────────
  const [selectedProvince, setSelectedProvince] = useState<string>("");
  const [selectedMunicipality, setSelectedMunicipality] = useState<string>("");
  const [selectedDistrict, setSelectedDistrict] = useState<string>("");
  const [selectedSection, setSelectedSection] = useState<string>("");
  const [selectedNeighborhood, setSelectedNeighborhood] = useState<string>("");
  const [neighborhoodGeo, setNeighborhoodGeo] = useState<Geometry | null>(null);

  // ─── Estado de opciones (override del autocompletado) ────────────────────
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

  // ─── Estado para controlar si el botón de confirmar está habilitado ───────
  const [isFormValid, setIsFormValid] = useState(false);

  // ─── Mutación para actualizar ubicación ──────────────────────────────────
  const updateLocationMutation = useMutation({
    mutationFn: (data: any) => {
      if (!locationId) throw new Error("Location ID is required for update");
      const updatePayload: any = {
        barrioId: Number(data.neighborhood || selectedNeighborhood),
        direccion: data.address,
        codigoPostal: data.codigoPostal || "",
        estado: "Activo" as const,
        puntoGeografico: {
          type: "Point",
          coordinates: [coordinates.lng, coordinates.lat],
        },
      };
      return ubicacionesService.updateLocation(locationId, updatePayload);
    },
    onSuccess: () => {
      toast.success(
        t(
          "createService.location.locationUpdatedSuccess",
          "Ubicación actualizada correctamente",
        ),
      );
      queryClient.invalidateQueries({
        queryKey: QUERY_KEYS.UBICACIONES("doctor", {}),
      });
      if (onLocationUpdated) onLocationUpdated();
      handleClose();
    },
    onError: (error: any) => {
      console.error("Error actualizando ubicación:", error);
      toast.error(
        error?.response?.data?.message ||
          t(
            "createService.location.locationUpdatedError",
            "Error al actualizar la ubicación",
          ),
      );
    },
  });

  // ─── Mutación para crear ubicación ────────────────────────────────────────
  const createLocationMutation = useMutation({
    mutationFn: (data: any) => ubicacionesService.createLocation(data),
    onSuccess: () => {
      toast.success(t("createService.location.locationCreatedSuccess"));
      queryClient.invalidateQueries({
        queryKey: QUERY_KEYS.UBICACIONES("doctor", {}),
      });
      handleClose();
    },
    onError: (error: any) => {
      console.error("Error creando ubicación:", error);
      toast.error(
        error?.response?.data?.message ||
          t("createService.location.locationCreatedError"),
      );
    },
  });

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

  const municipiosOptions =
    autocompleteOptions.municipios ?? municipiosFromQuery;
  const distritosOptions = autocompleteOptions.distritos ?? distritosFromQuery;
  const seccionesOptions = autocompleteOptions.secciones ?? seccionesFromQuery;
  const barriosOptions = autocompleteOptions.barrios ?? barriosFromQuery;

  // ─── Handlers de ubicación ────────────────────────────────────────────────

  const handlePointSelected = useCallback(
    async (lat: number, lng: number, isInsideNeighborhood: boolean) => {
      setCoordinates({ lat, lng });
      setlocationField("coordinates", { latitude: lat, longitude: lng });

      if (isInsideNeighborhood) return;

      try {
        const data = await ubicacionesService.getDataBarrioFromGeoPoint(
          lng,
          lat,
        );

        if (!data?.municipio?.id) {
          console.warn("Punto sin datos completos de ubicación");
          return;
        }

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

        setlocationField("province", provId);
        setlocationField("municipality", munId);
        setlocationField("district", distId || "");
        setlocationField("section", secId || "");
        setlocationField("neighborhood", barrioId || "");

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
    [setlocationField, queryClient, currentLanguage],
  );

  // ─── EFECTO MODO LECTURA: Poblar datos si existe locationToView ───────────
  useEffect(() => {
    if (locationToView && isReadOnly) {
      const lng = locationToView.puntoGeografico.coordinates[0];
      const lat = locationToView.puntoGeografico.coordinates[1];

      setCoordinates({ lat, lng });
      setlocationField("name", locationToView.nombre);
      setlocationField("address", locationToView.direccion);
      setlocationField("coordinates", { latitude: lat, longitude: lng });

      if (formSetValueRef.current) {
        formSetValueRef.current("name", locationToView.nombre);
        formSetValueRef.current("address", locationToView.direccion);
      }

      // Llamada programática para obtener el resto de la jerarquía (provincia, municipio, etc.)
      handlePointSelected(lat, lng, false);
    }
  }, [locationToView, isReadOnly, setlocationField, handlePointSelected]);

  // ─── EFECTO MODO EDICIÓN: Cargar datos si existe locationId ────────────
  useEffect(() => {
    if (locationId && !isReadOnly) {
      const loadLocationForEdit = async () => {
        try {
          const locationData =
            await ubicacionesService.getLocationById(locationId);
          if (locationData?.data || locationData?.id) {
            const location = locationData.data || locationData;
            const lng = location.puntoGeografico.coordinates[0];
            const lat = location.puntoGeografico.coordinates[1];

            setCoordinates({ lat, lng });
            setlocationField("name", location.nombre);
            setlocationField("address", location.direccion);
            setlocationField("coordinates", { latitude: lat, longitude: lng });

            if (formSetValueRef.current) {
              formSetValueRef.current("name", location.nombre);
              formSetValueRef.current("address", location.direccion);
            }

            // Cargar la jerarquía geográfica
            await handlePointSelected(lat, lng, false);
          }
        } catch (error) {
          console.error("Error cargando ubicación para editar:", error);
          toast.error(
            t(
              "createService.location.errorLoadingLocation",
              "Error al cargar la ubicación",
            ),
          );
        }
      };

      loadLocationForEdit();
    }
  }, [locationId, isReadOnly, setlocationField, handlePointSelected]);

  // ─── Validar formulario para habilitar/deshabilitar botón de confirmar ────
  useEffect(() => {
    const isValid =
      !!locationData.name?.trim() &&
      !!locationData.address?.trim() &&
      !!selectedProvince &&
      !!selectedMunicipality &&
      !!selectedSection &&
      !!selectedNeighborhood;

    setIsFormValid(isValid);
  }, [
    locationData.name,
    locationData.address,
    selectedProvince,
    selectedMunicipality,
    selectedSection,
    selectedNeighborhood,
  ]);

  // ─── Handlers de cambio de selects (interacción manual) ───────────────────

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
      setlocationField("province", provinceValue);
      setlocationField("municipality", "");
      setlocationField("district", "");
      setlocationField("section", "");
      setlocationField("neighborhood", "");

      if (formSetValueRef.current) {
        formSetValueRef.current("province", provinceValue);
        formSetValueRef.current("municipality", "");
        formSetValueRef.current("district", "");
        formSetValueRef.current("section", "");
        formSetValueRef.current("neighborhood", "");
      }
    },
    [setlocationField],
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
      setlocationField("municipality", municipalityValue);
      setlocationField("district", "");
      setlocationField("section", "");
      setlocationField("neighborhood", "");

      if (formSetValueRef.current) {
        formSetValueRef.current("municipality", municipalityValue);
        formSetValueRef.current("district", "");
        formSetValueRef.current("section", "");
        formSetValueRef.current("neighborhood", "");
      }
    },
    [setlocationField],
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
      setlocationField("district", districtValue);
      setlocationField("section", "");
      setlocationField("neighborhood", "");

      if (formSetValueRef.current) {
        formSetValueRef.current("district", districtValue);
        formSetValueRef.current("section", "");
        formSetValueRef.current("neighborhood", "");
      }
    },
    [setlocationField],
  );

  const handleSectionChange = useCallback(
    (value: string | string[]) => {
      const sectionValue = Array.isArray(value) ? value[0] : value;
      setAutocompleteOptions((prev) => ({ ...prev, barrios: null }));
      setSelectedSection(sectionValue);
      setSelectedNeighborhood("");
      setlocationField("section", sectionValue);
      setlocationField("neighborhood", "");

      if (formSetValueRef.current) {
        formSetValueRef.current("section", sectionValue);
        formSetValueRef.current("neighborhood", "");
      }
    },
    [setlocationField],
  );

  const handleNeighborhoodChange = useCallback(
    async (value: string | string[]) => {
      const neighborhoodValue = Array.isArray(value) ? value[0] : value;
      setSelectedNeighborhood(neighborhoodValue);
      setlocationField("neighborhood", neighborhoodValue);

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
    [setlocationField, barriosOptions],
  );

  // ─── Handler de cambio de mapa ─────────────────────────────────────────────

  const handleMapChange = (lat: number, lng: number) => {
    setCoordinates({ lat, lng });
    setlocationField("coordinates", { latitude: lat, longitude: lng });
    if (formRef.current) {
      formRef.current.setValue("coordinates", {
        latitude: lat,
        longitude: lng,
      });
    }
  };

  const handleLocationDetails = (details: {
    address: string;
    neighborhood?: string;
    zipCode: string;
    province?: string;
    municipality?: string;
  }) => {
    setlocationField("address", details.address);
    setlocationField("province", details.province || "");
    setlocationField("municipality", details.municipality || "");

    if (formRef.current) {
      formRef.current.setValue("address", details.address);
      formRef.current.setValue("province", details.province || "");
      formRef.current.setValue("municipality", details.municipality || "");
    }
  };

  // ─── Handlers de submit y confirmación ────────────────────────────────────

  const handleSubmit = (data: any) => {
    if (isReadOnly) return; // Salvaguardia extra
    if (!selectedNeighborhood || !data.name || !data.address) {
      toast.error(t("createService.location.missingRequiredFields"));
      return;
    }

    if (locationId) {
      // Modo edición: actualizar ubicación existente
      updateLocationMutation.mutate(data);
    } else {
      // Modo creación: crear nueva ubicación
      const locationPayload: createLocationRequest = {
        barrioId: Number(selectedNeighborhood),
        direccion: data.address,
        nombre: data.name,
        codigoPostal: data.codigoPostal || "",
        puntoGeografico: {
          type: "Point",
          coordinates: [coordinates.lng, coordinates.lat],
        },
      };
      createLocationMutation.mutate(locationPayload);
    }
  };

  const submitRef = useRef<any>(null);
  const handleConfirm = () => {
    if (!isFormValid || isReadOnly) {
      toast.error(t("createService.location.invalidFormData"));
      return;
    }
    submitRef.current?.();
  };

  const handleClose = () => {
    clearLocationData();
    setSelectedProvince("");
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
    setCoordinates({ lat: 18.4861, lng: -69.9312 });

    // Notificar al padre que se cerró (importante para limpiar el estado de visualización)
    if (onCloseModal) onCloseModal();
  };

  // ─── Reset del form cuando cambian los datos ──────────────────────────────
  useEffect(() => {
    if (formRef.current && formRef.current.reset) {
      formRef.current.reset({
        name: locationData.name || "",
        address: locationData.address || "",
        province: selectedProvince || locationData.province || "",
        municipality: selectedMunicipality || locationData.municipality || "",
        district: selectedDistrict || locationData.district || "",
        section: selectedSection || locationData.section || "",
        neighborhood: selectedNeighborhood || locationData.neighborhood || "",
        coordinates: {
          latitude: coordinates.lat,
          longitude: coordinates.lng,
        },
      });
    }
  }, [
    locationData,
    coordinates,
    selectedProvince,
    selectedMunicipality,
    selectedDistrict,
    selectedSection,
    selectedNeighborhood,
  ]);

  return (
    <MCModalBase
      id="manage-location-modal"
      title={
        isReadOnly
          ? t("createService.location.viewLocation", "Detalles de Ubicación")
          : locationId
            ? t("createService.location.editLocation", "Editar Ubicación")
            : t("createService.location.manageLocation")
      }
      size="lgAuto"
      variant="decide"
      onConfirm={handleConfirm}
      onClose={handleClose}
      trigger={children}
      triggerClassName={triggerClassName}
      disabledConfirm={
        !isFormValid ||
        createLocationMutation.isPending ||
        updateLocationMutation.isPending ||
        isReadOnly
      }
      hideConfirm={isReadOnly}
      showConfirm={!isReadOnly}
      secondaryText={isReadOnly ? t("common.close", "Cerrar") : undefined}
    >
      <div className="flex flex-col gap-8">
        <MapSelectLocation
          value={coordinates}
          // Prevenimos que el usuario interactúe con el mapa si es readOnly pasando undefined a los eventos
          onChange={isReadOnly ? undefined : handleMapChange}
          onLocationDetails={isReadOnly ? undefined : handleLocationDetails}
          onPointSelected={isReadOnly ? undefined : handlePointSelected}
          neighborhoodGeo={neighborhoodGeo}
          readonly={isReadOnly}
        />
        <MCFormWrapper
          submitRef={submitRef}
          schema={locatonFormSchema}
          onSubmit={handleSubmit}
          defaultValues={{
            name: "",
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
          }}
          formRef={formRef}
        >
          <FormBridge formSetValueRef={formSetValueRef} />

          <div className="w-full grid grid-cols-2 gap-4">
            <MCInput
              name="name"
              label={t("form.locationName")}
              maxLength={30}
              placeholder={t("form.locationNamePlaceholder")}
              onChange={(e) => setlocationField("name", e.target.value)}
              disabled={isReadOnly}
            />
            <MCInput
              name="address"
              label={t("form.address")}
              placeholder={t("form.addressPlaceholder")}
              value={locationData.address}
              onChange={(e) => setlocationField("address", e.target.value)}
              disabled={isReadOnly}
            />
            <MCSelect
              name="province"
              label={t("form.province")}
              placeholder={
                isLoadingProvincias
                  ? t("form.loadingProvinces")
                  : t("form.provincePlaceholder")
              }
              value={selectedProvince}
              options={provinciasOptions}
              disabled={isReadOnly || isLoadingProvincias}
              onChange={handleProvinceChange}
            />
            <MCSelect
              name="municipality"
              label={t("form.municipality")}
              placeholder={
                isLoadingMunicipios
                  ? t("form.loadingMunicipalities")
                  : selectedProvince
                    ? t("form.municipalityPlaceholder")
                    : t("form.selectProvinceFirst")
              }
              value={selectedMunicipality}
              options={municipiosOptions}
              searchable={true}
              disabled={
                isReadOnly ||
                (isLoadingMunicipios && !autocompleteOptions.municipios) ||
                !selectedProvince
              }
              onChange={handleMunicipalityChange}
            />
            <MCSelect
              name="district"
              label={t("form.district")}
              placeholder={
                isLoadingDistritos
                  ? t("form.loadingDistricts")
                  : selectedMunicipality
                    ? t("form.districtPlaceholder")
                    : t("form.selectMunicipalityFirst")
              }
              value={selectedDistrict}
              options={distritosOptions}
              disabled={
                isReadOnly ||
                (isLoadingDistritos && !autocompleteOptions.distritos) ||
                !selectedMunicipality
              }
              searchable={true}
              onChange={handleDistrictChange}
            />
            <MCSelect
              name="section"
              label={t("form.section")}
              placeholder={
                isLoadingSecciones
                  ? t("form.loadingSections")
                  : selectedMunicipality
                    ? t("form.sectionPlaceholder")
                    : t("form.selectMunicipalityFirst")
              }
              value={selectedSection}
              options={seccionesOptions}
              searchable={true}
              disabled={
                isReadOnly ||
                (isLoadingSecciones && !autocompleteOptions.secciones) ||
                !seccionesParams
              }
              onChange={handleSectionChange}
            />
            <MCSelect
              name="neighborhood"
              label={t("form.neighborhood")}
              placeholder={
                isLoadingBarrios
                  ? t("form.loadingNeighborhoods")
                  : selectedSection
                    ? t("form.neighborhoodPlaceholder")
                    : t("form.selectSectionFirst")
              }
              value={selectedNeighborhood}
              options={barriosOptions}
              disabled={
                isReadOnly ||
                (isLoadingBarrios && !autocompleteOptions.barrios) ||
                !selectedSection
              }
              searchable={true}
              onChange={handleNeighborhoodChange}
            />
          </div>
        </MCFormWrapper>
      </div>
    </MCModalBase>
  );
}

export default ManageLocation;
