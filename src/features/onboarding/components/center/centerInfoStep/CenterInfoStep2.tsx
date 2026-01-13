import MCInput from "@/shared/components/forms/MCInput";
import MCFormWrapper from "@/shared/components/forms/MCFormWrapper";
import { useAppStore } from "@/stores/useAppStore";
import { CenterLocationInfoSchema } from "@/schema/OnbordingSchema";
import MapSelectLocation from "@/shared/components/maps/MapSelectLocation";
import { useTranslation } from "react-i18next";

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
    (state) => state.centerOnboardingData
  );
  const setCenterField = useAppStore((state) => state.setCenterField);

  const handleSubmit = (data: any) => {
    onValidationChange?.(true);
    onNext?.();
  };

  const handleLocationDetails = (details: {
    address: string;
    neighborhood: string;
    zipCode: string;
    province?: string;
    municipality?: string;
  }) => {
    setCenterField?.("address", details.address);
    if (details.province) setCenterField?.("province", details.province);
    if (details.municipality)
      setCenterField?.("municipality", details.municipality);
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
        schema={CenterLocationInfoSchema((t) => t)}
        onSubmit={handleSubmit}
        defaultValues={centerOnboardingData}
        onValidationChange={onValidationChange}
        key={`${centerOnboardingData?.address}-${centerOnboardingData?.province}-${centerOnboardingData?.municipality}`}
      >
        <div className="space-y-4 py-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <MCInput
              name="address"
              label={t("centerInfoStep.addressLabel")}
              placeholder={t("centerInfoStep.addressPlaceholder")}
              onChange={(e) => setCenterField?.("address", e.target.value)}
            />
            <MCInput
              name="province"
              label={t("centerInfoStep.provinceLabel")}
              placeholder={t("centerInfoStep.provincePlaceholder")}
              onChange={(e) => setCenterField?.("province", e.target.value)}
            />
          </div>

          <MCInput
            name="municipality"
            label={t("centerInfoStep.municipalityLabel")}
            placeholder={t("centerInfoStep.municipalityPlaceholder")}
            onChange={(e) => setCenterField?.("municipality", e.target.value)}
          />
        </div>
        {children}
      </MCFormWrapper>
    </div>
  );
}

export default CenterInfoStep2;
