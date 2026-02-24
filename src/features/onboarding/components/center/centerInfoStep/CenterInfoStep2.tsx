import MCInput from "@/shared/components/forms/MCInput";
import MCFormWrapper from "@/shared/components/forms/MCFormWrapper";
import { useAppStore } from "@/stores/useAppStore";
import { CenterLocationInfoSchema } from "@/schema/OnbordingSchema";
import MapSelectLocation from "@/shared/components/maps/MapSelectLocation";
import { useTranslation } from "react-i18next";
import { useGlobalUIStore } from "@/stores/useGlobalUIStore";
import { useUbicaciones } from "@/features/onboarding/services/useUbicaciones";
import MCSelect from "@/shared/components/forms/MCSelect";
import { useEffect, useMemo, useRef, useState } from "react";
import { useFormContext } from "react-hook-form";
import type { Geometry } from "geojson";
import ubicacionesService from "@/features/onboarding/services/ubicaciones.services";

type CenterInfoStep2Props = {
  children?: React.ReactNode;
  onValidationChange?: (isValid: boolean) => void;
  onNext?: () => void;
};

function CenterInfoStep2({
  children,
  onValidationChange,
  onNext,
}: CenterInfoStep2Props) {
  const { t } = useTranslation("auth");
  const centerOnboardingData = useAppStore(
    (state) => state.centerOnboardingData,
  );
  const setOnboardingStep = useGlobalUIStore(
    (state) => state.setOnboardingStep,
  );
  const setCenterField = useAppStore((state) => state.setCenterField);

  // Estado local para controlar exactamente cuándo se dispara cada búsqueda.
  // Al resetear un nivel, sus dependientes se limpian aquí antes de que
  // useUbicaciones haga el fetch, evitando peticiones con IDs obsoletos.
  const [selectedProvince, setSelectedProvince] = useState<string>("");
  const [selectedMunicipality, setSelectedMunicipality] = useState<string>("");
  const [selectedDistrict, setSelectedDistrict] = useState<string>("");
  const [selectedSection, setSelectedSection] = useState<string>("");
  const [selectedNeighborhood, setSelectedNeighborhood] = useState<string>("");
  const [neighborhoodGeo, setNeighborhoodGeo] = useState<Geometry | null>(null);
  // Cuando el autocompletado por punto setea la sección, los barrios aún no han
  // llegado del servidor. Guardamos el ID pendiente y lo aplicamos cuando lleguen.
  const [pendingNeighborhoodId, setPendingNeighborhoodId] = useState<string | null>(null);


  const { data: provinciasOptions = [], isLoading: isLoadingProvincias } =
    useUbicaciones("provincias");

  const municipiosParams = useMemo(
    () => selectedProvince ? { idProvincia: selectedProvince } : undefined,
    [selectedProvince]
  );
  const { data: municipiosOptions = [], isLoading: isLoadingMunicipios } =
    useUbicaciones("municipios", municipiosParams);

  const distritosParams = useMemo(
    () => selectedMunicipality ? { idMunicipio: selectedMunicipality } : undefined,
    [selectedMunicipality]
  );
  const { data: distritosOptions = [], isLoading: isLoadingDistritos } =
    useUbicaciones("distritos", distritosParams);

  // Secciones: si hay distrito → fetch por distrito; si no y hay municipio → fetch por municipio.
  // useMemo estabiliza el objeto params para que React Query no lo trate como nuevo en cada render.
  const seccionesParams = useMemo(() => {
    if (selectedDistrict) return { idDistrito: selectedDistrict };
    if (selectedMunicipality) return { idMunicipio: selectedMunicipality };
    return undefined;
  }, [selectedDistrict, selectedMunicipality]);

  const { data: seccionesOptions = [], isLoading: isLoadingSecciones } =
    useUbicaciones("secciones", seccionesParams);

  const barriosParams = useMemo(
    () => selectedSection ? { idSeccion: selectedSection } : undefined,
    [selectedSection]
  );
  const { data: barriosOptions = [], isLoading: isLoadingBarrios } =
    useUbicaciones("barrios", barriosParams);

  // Cuando llegan las opciones de barrios y hay un ID pendiente por seleccionar
  // (caso: autocompletado por punto en el mapa), aplicar la selección ahora que
  // las opciones ya están disponibles en el select.
  useEffect(() => {
    if (!pendingNeighborhoodId || isLoadingBarrios || barriosOptions.length === 0) return;
    const exists = barriosOptions.some(
      (opt: { value: string }) => String(opt.value) === String(pendingNeighborhoodId)
    );
    if (exists) {
      setSelectedNeighborhood(pendingNeighborhoodId);
      setCenterField?.("neighborhood", pendingNeighborhoodId);
      setPendingNeighborhoodId(null);
    }
  }, [barriosOptions, isLoadingBarrios, pendingNeighborhoodId]);

  // Al montar, limpiar el store para que los selects arranquen siempre vacíos.
  useEffect(() => {
    setCenterField?.("province", "");
    setCenterField?.("municipality", "");
    setCenterField?.("district", "");
    setCenterField?.("section", "");
    setCenterField?.("neighborhood", "");
    setCenterField?.("subNeighborhood", "");
  }, []);

  // Ref para acceder a setValue del form desde fuera del MCFormWrapper
  const formSetValueRef = useRef<((name: string, value: any) => void) | null>(null);

  // Componente puente: vive dentro del FormContext y expone setValue hacia arriba
  // sin necesidad de prop-drilling ni de refactorizar MCFormWrapper.
  const FormBridge = () => {
    const { setValue } = useFormContext();
    useEffect(() => {
      formSetValueRef.current = (name: string, value: any) =>
        setValue(name, value, { shouldValidate: true, shouldDirty: true });
    }, [setValue]);
    return null;
  };

  const handleSubmit = (data: any) => {
    console.log("Step 2 submitted with data:", data);
    setOnboardingStep?.(0);
    onValidationChange?.(true);
    onNext?.();
  };

  const handleLocationDetails = (details: {
    address: string;
    zipCode: string;
    province?: string;
    municipality?: string;
    district?: string;
    section?: string;
    neighborhood?: string;
    subNeighborhood?: string;
  }) => {
    console.log("Detalles de ubicación recibidos:", details);
    setCenterField?.("address", details.address);
    // Sincronizar address en el form context para que MCInput lo muestre
    formSetValueRef.current?.("address", details.address);

    if (details.province) {
      setCenterField?.("province", details.province);
      setSelectedProvince(details.province);
    }
    if (details.municipality) {
      setCenterField?.("municipality", details.municipality);
      setSelectedMunicipality(details.municipality);
    }
    if (details.district) {
      setCenterField?.("district", details.district);
      setSelectedDistrict(details.district);
    }
    if (details.section) {
      setCenterField?.("section", details.section);
      setSelectedSection(details.section);
    }
    if (details.neighborhood) {
      setCenterField?.("neighborhood", details.neighborhood);
      setSelectedNeighborhood(details.neighborhood);
    }
    if (details.subNeighborhood) {
      setCenterField?.("subNeighborhood", details.subNeighborhood);
    }
  };

  // ─── Handlers con reset en cascada ───────────────────────────────────────

  const handleProvinceChange = (value: string | string[]) => {
    const province = Array.isArray(value) ? value[0] : value;
    // 1. Limpiar estado local → los hooks dejan de fetchear con IDs obsoletos
    setSelectedMunicipality("");
    setSelectedDistrict("");
    setSelectedSection("");
    setSelectedNeighborhood("");
    setNeighborhoodGeo(null);
    // 2. Limpiar store
    setCenterField?.("municipality", "");
    setCenterField?.("district", "");
    setCenterField?.("section", "");
    setCenterField?.("neighborhood", "");
    setCenterField?.("subNeighborhood", "");
    // 3. Setear el nuevo valor → dispara el fetch de municipios
    setSelectedProvince(province);
    setCenterField?.("province", province);
  };

  const handleMunicipalityChange = (value: string | string[]) => {
    const municipality = Array.isArray(value) ? value[0] : value;
    setSelectedDistrict("");
    setSelectedSection("");
    setSelectedNeighborhood("");
    setNeighborhoodGeo(null);
    setCenterField?.("district", "");
    setCenterField?.("section", "");
    setCenterField?.("neighborhood", "");
    setCenterField?.("subNeighborhood", "");
    setSelectedMunicipality(municipality);
    setCenterField?.("municipality", municipality);
  };

  const handleDistrictChange = (value: string | string[]) => {
    const district = Array.isArray(value) ? value[0] : value;
    setSelectedSection("");
    setSelectedNeighborhood("");
    setNeighborhoodGeo(null);
    setCenterField?.("section", "");
    setCenterField?.("neighborhood", "");
    setCenterField?.("subNeighborhood", "");
    setSelectedDistrict(district);
    setCenterField?.("district", district);
  };

  const handleSectionChange = (value: string | string[]) => {
    const section = Array.isArray(value) ? value[0] : value;
    setSelectedNeighborhood("");
    setNeighborhoodGeo(null);
    setCenterField?.("neighborhood", "");
    setCenterField?.("subNeighborhood", "");
    setSelectedSection(section);
    setCenterField?.("section", section);
  };

  const handleNeighborhoodChange = async (value: string | string[]) => {
    const neighborhood = Array.isArray(value) ? value[0] : value;
    setCenterField?.("subNeighborhood", "");
    setSelectedNeighborhood(neighborhood);
    setCenterField?.("neighborhood", neighborhood);

    // Limpiar polígono si se deselecciona el barrio
    if (!neighborhood) {
      setNeighborhoodGeo(null);
      return;
    }

    // Obtener geometría del barrio para centrar el mapa
    try {
      const geo = await ubicacionesService.getGeoPointsByBarrios(Number(neighborhood)); // tu función de request existente
      console.log("Geometría del barrio obtenida:", geo);
      setNeighborhoodGeo(geo.geom ?? null);
    } catch (err) {
      console.error("Error obteniendo geometría del barrio:", err);
      setNeighborhoodGeo(null);
    }
  };

  const handlePointSelected = async (lat: number, lng: number, isInsideNeighborhood: boolean) => {
    // Siempre actualizar las coordenadas en el store
    setCenterField?.("coordinates", { latitude: lat, longitude: lng });

    if (isInsideNeighborhood) {
      // El punto está dentro del barrio seleccionado → solo guardar coordenadas.
      // Los selects ya tienen los valores correctos, no hace falta tocarlos.
      return;
    }

    // El punto está fuera del barrio activo → consultar la jerarquía completa
    // por las nuevas coordenadas y autocompletar todos los selects.
    try {
      const data = await ubicacionesService.getDataBarrioFromGeoPoint(lng, lat); // tu función existente → GET /barrios/geo/punto
      if (!data) return;

      console.log("Datos de ubicación obtenidos por punto:", data);
      // Resetear estado local en cascada antes de setear los nuevos valores
      // para que useUbicaciones re-fetche con los IDs correctos
      setSelectedMunicipality("");
      setSelectedDistrict("");
      setSelectedSection("");
      setSelectedNeighborhood("");
      setNeighborhoodGeo(null);

      // Provincia
      if (data.provincia?.id) {
        const provId = String(data.provincia.id);
        setSelectedProvince(provId);
        setCenterField?.("province", provId);
        formSetValueRef.current?.("province", provId);
      }
      // Municipio
      if (data.municipio?.id) {
        const munId = String(data.municipio.id);
        setSelectedMunicipality(munId);
        setCenterField?.("municipality", munId);
        formSetValueRef.current?.("municipality", munId);
      }
      // Distrito municipal (puede ser null)
      if (data.distritoMunicipal?.id) {
        const distId = String(data.distritoMunicipal.id);
        setSelectedDistrict(distId);
        setCenterField?.("district", distId);
        formSetValueRef.current?.("district", distId);
      } else {
        // Sin distrito → seccionesParams usará idMunicipio automáticamente
        setSelectedDistrict("");
        setCenterField?.("district", "");
      }
      // Sección
      if (data.seccion?.id) {
        const secId = String(data.seccion.id);
        setSelectedSection(secId);
        setCenterField?.("section", secId);
        formSetValueRef.current?.("section", secId);
      }
      // Barrio + polígono
      // No seteamos selectedNeighborhood aquí todavía: useUbicaciones necesita
      // primero re-fetchear los barrios con el nuevo selectedSection. Guardamos
      // el ID como pendiente y el useEffect lo aplicará cuando lleguen las opciones.
      if (data.id) {
        const barrioId = String(data.id);
        setPendingNeighborhoodId(barrioId);
        // Cargar el polígono del nuevo barrio para que el mapa lo dibuje
        if (data.geom) {
          setNeighborhoodGeo(data.geom);
        }
      }
    } catch (err) {
      console.error("Error obteniendo barrio por punto:", err);
    }
  };

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
          onChange={(lat, lng) =>
            setCenterField?.("coordinates", {
              latitude: lat,
              longitude: lng,
            })
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
      >
        <FormBridge />
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
              value={centerOnboardingData?.province ?? ""}
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
                    : t("centerInfoStep.municipalityPlaceholderRequiredPrevValue")
              }
              value={centerOnboardingData?.municipality ?? ""}
              options={municipiosOptions}
              searchable={true}
              disabled={isLoadingMunicipios || !selectedProvince}
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
              value={centerOnboardingData?.district ?? ""}
              options={distritosOptions}
              disabled={isLoadingDistritos || !selectedMunicipality}
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
              value={centerOnboardingData?.section ?? ""}
              options={seccionesOptions}
              searchable={true}
              disabled={isLoadingSecciones || !seccionesParams}
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
                    : t("centerInfoStep.neighborhoodPlaceholderRequiredPrevValue")
              }
              value={centerOnboardingData?.neighborhood ?? ""}
              options={barriosOptions}
              disabled={isLoadingBarrios || !selectedSection}
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