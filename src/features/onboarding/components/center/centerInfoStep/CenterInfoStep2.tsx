import MCInput from "@/shared/components/forms/MCInput";
import MCFormWrapper from "@/shared/components/forms/MCFormWrapper";
import { useAppStore } from "@/stores/useAppStore";
import { CenterLocationInfoSchema } from "@/schema/OnbordingSchema";
import MapSelectLocation from "@/shared/components/maps/MapSelectLocation";
import { useTranslation } from "react-i18next";
import { useGlobalUIStore } from "@/stores/useGlobalUIStore";
import { useUbicaciones } from "@/features/onboarding/services/useUbicaciones";
import MCSelect from "@/shared/components/forms/MCSelect";

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
  const { data: provinciasOptions = [], isLoading: isLoadingProvincias } = useUbicaciones("provincias");
  const { data: municipiosOptions = [], isLoading: isLoadingMunicipios } = useUbicaciones("municipios", { idProvincia: centerOnboardingData?.province });
  const { data: distritosOptions = [], isLoading: isLoadingDistritos } = useUbicaciones("distritos", { idMunicipio: centerOnboardingData?.municipality });
  const { data: seccionesOptions = [], isLoading: isLoadingSecciones } = useUbicaciones("secciones", { idDistrito: centerOnboardingData?.district });
  const { data: barriosOptions = [], isLoading: isLoadingBarrios } = useUbicaciones("barrios", { idSeccion: centerOnboardingData?.section });
  const { data: subBarriosOptions = [], isLoading: isLoadingSubBarrios } = useUbicaciones("subbarrios", { idBarrio: centerOnboardingData?.neighborhood });


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
    setCenterField?.("address", details.address);
    if (details.province) setCenterField?.("province", details.province);
    if (details.municipality)setCenterField?.("municipality", details.municipality);
    if (details.district) setCenterField?.("district", details.district);
    if (details.section) setCenterField?.("section", details.section);
    if (details.neighborhood) setCenterField?.("neighborhood", details.neighborhood);
    if (details.subNeighborhood) setCenterField?.("subNeighborhood", details.subNeighborhood);
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
        />
      </div>

      <MCFormWrapper
        schema={CenterLocationInfoSchema((key: string) => t(key))}
        onSubmit={handleSubmit}
        onValidationChange={onValidationChange}
      >
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
              placeholder={isLoadingProvincias ? t("centerInfoStep.loadingProvincias") : t("centerInfoStep.provincePlaceholder")}
              options={provinciasOptions}
              disabled={isLoadingProvincias}
              onChange={(value) => {
                const provinciaValue = Array.isArray(value) ? value[0] : value;
                setCenterField?.("province", provinciaValue);
                // Reiniciar dependientes
                setCenterField?.("municipality", "");
                setCenterField?.("district", "");
                setCenterField?.("section", "");
                setCenterField?.("neighborhood", "");
                setCenterField?.("subNeighborhood", "");
              }}
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <MCSelect
              name="municipality"
              label={t("centerInfoStep.municipalityLabel")}
              placeholder={isLoadingMunicipios ? t("centerInfoStep.loadingMunicipios") : centerOnboardingData?.province?.length && centerOnboardingData?.province.length > 0 ? t("centerInfoStep.municipalityPlaceholder") : t("centerInfoStep.municipalityPlaceholderRequiredPrevValue")}
              options={municipiosOptions}
              searchable={true}
              disabled={isLoadingMunicipios || !centerOnboardingData?.province || centerOnboardingData?.province.length === 0}
              onChange={(value) => {
                const municipioValue = Array.isArray(value) ? value[0] : value;
                setCenterField?.("municipality", municipioValue);
                // Reiniciar dependientes
                setCenterField?.("district", "");
                setCenterField?.("section", "");
                setCenterField?.("neighborhood", "");
                setCenterField?.("subNeighborhood", "");
              }}
            />

            <MCSelect
              name="district"
              label={t("centerInfoStep.districtLabel")}
              placeholder={isLoadingDistritos ? t("centerInfoStep.loadingDistritos") : centerOnboardingData?.municipality?.length && centerOnboardingData?.municipality.length > 0 ? t("centerInfoStep.districtPlaceholder") : t("centerInfoStep.districtPlaceholderRequiredPrevValue")}
              options={distritosOptions}
              disabled={isLoadingDistritos || !centerOnboardingData?.municipality || centerOnboardingData?.municipality.length === 0}
              searchable={true}
              onChange={(value) => {
                const distritoValue = Array.isArray(value) ? value[0] : value;
                setCenterField?.("district", distritoValue);
                // Reiniciar dependientes
                setCenterField?.("section", "");
                setCenterField?.("neighborhood", "");
                setCenterField?.("subNeighborhood", "");
              }}
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <MCSelect
              name="section"
              label={t("centerInfoStep.sectionLabel")}
              placeholder={isLoadingSecciones ? t("centerInfoStep.loadingSecciones") : centerOnboardingData?.municipality?.length && centerOnboardingData?.municipality.length > 0 ? t("centerInfoStep.sectionPlaceholder") : t("centerInfoStep.sectionPlaceholderRequiredPrevValue")}
              options={seccionesOptions}
              searchable={true}
              disabled={isLoadingSecciones || !centerOnboardingData?.municipality || centerOnboardingData?.municipality.length === 0}
              onChange={(value) => {
                const sectionValue = Array.isArray(value) ? value[0] : value;
                setCenterField?.("section", sectionValue);
                // Reiniciar dependientes
                setCenterField?.("neighborhood", "");
                setCenterField?.("subNeighborhood", "");
              }}
            />

            <MCSelect
              name="neighborhood"
              label={t("centerInfoStep.neighborhoodLabel")}
              placeholder={isLoadingBarrios ? t("centerInfoStep.loadingBarrios") : centerOnboardingData?.section?.length && centerOnboardingData?.section.length > 0 ? t("centerInfoStep.neighborhoodPlaceholder") : t("centerInfoStep.neighborhoodPlaceholderRequiredPrevValue")}
              options={barriosOptions}
              disabled={isLoadingBarrios || !centerOnboardingData?.section || centerOnboardingData?.section.length === 0}
              searchable={true}
              onChange={(value) => {
                const neighborhoodValue = Array.isArray(value) ? value[0] : value;
                setCenterField?.("neighborhood", neighborhoodValue);
                // Reiniciar dependientes
                setCenterField?.("subNeighborhood", "");
              }}
            />
          </div>
          
          {
            subBarriosOptions.length > 0 && (
              <MCSelect
                name="subNeighborhood"
                label={t("centerInfoStep.subNeighborhoodLabel")}
                placeholder={isLoadingSubBarrios ? t("centerInfoStep.loadingSubBarrios") : centerOnboardingData?.neighborhood?.length && centerOnboardingData?.neighborhood.length > 0 ? t("centerInfoStep.subNeighborhoodPlaceholder") : t("centerInfoStep.subNeighborhoodPlaceholderRequiredPrevValue")}
                options={subBarriosOptions}
                disabled={isLoadingSubBarrios || !centerOnboardingData?.neighborhood || centerOnboardingData?.neighborhood.length === 0}
                searchable={true}
                onChange={(value) => {
                  const subNeighborhoodValue = Array.isArray(value) ? value[0] : value;
                  setCenterField?.("subNeighborhood", subNeighborhoodValue);
                }}
              />
            )
          }
          
        </div>
        {children}
      </MCFormWrapper>
    </div>
  );
}

export default CenterInfoStep2;
