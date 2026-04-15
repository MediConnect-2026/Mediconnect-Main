import MCInput from "@/shared/components/forms/MCInput";
import MCSelect from "@/shared/components/forms/MCSelect";
import MCFormWrapper from "@/shared/components/forms/MCFormWrapper";
import MCTextArea from "@/shared/components/forms/MCTextArea";
import MCPhoneInput from "@/shared/components/forms/MCPhoneInput";
import { useAppStore } from "@/stores/useAppStore";
import { CenterBasicInfoSchema } from "@/schema/OnbordingSchema";
import { useEffect } from "react";
import { useTranslation } from "react-i18next";
import { useTiposCentros } from "@/features/onboarding/services/useTiposCentros";

type CenterInfoStep1Props = {
  children?: React.ReactNode;
  onValidationChange?: (isValid: boolean) => void;
  onNext?: () => void;
};

function CenterInfoStep1({
  children,
  onValidationChange,
  onNext,
}: CenterInfoStep1Props) {
  const { t } = useTranslation("auth");
  const centerOnboardingData = useAppStore(
    (state) => state.centerOnboardingData,
  );
  const setCenterField = useAppStore((state) => state.setCenterField);
  const { data: tiposCentroOptions = [], isLoading: isLoadingCentro } =
    useTiposCentros();

  const handleSubmit = () => {
    onValidationChange?.(true);
    onNext?.();
  };

  useEffect(() => {}, [centerOnboardingData]);

  return (
    <div className="w-full">
      <div className="mb-5">
        <h1 className="text-2xl sm:text-3xl font-bold text-primary mb-2">
          {t("centerInfoStep.title")}
        </h1>
        <p className="text-primary/60 text-sm sm:text-base">
          {t("centerInfoStep.subtitle")}
        </p>
      </div>

      <MCFormWrapper
        schema={CenterBasicInfoSchema((key: string) => t(key))}
        onSubmit={handleSubmit}
        defaultValues={centerOnboardingData}
        onValidationChange={onValidationChange}
      >
        <div className="space-y-4">
          {/* Nombre y tipo de centro */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <MCInput
              name="name"
              label={t("centerInfoStep.nameLabel")}
              placeholder={t("centerInfoStep.namePlaceholder")}
              onChange={(e) => setCenterField?.("name", e.target.value)}
            />
            <MCSelect
              name="centerType"
              label={t("centerInfoStep.centerTypeLabel")}
              placeholder={
                isLoadingCentro
                  ? t("centerInfoStep.loadingCenterTypes")
                  : t("centerInfoStep.centerTypePlaceholder")
              }
              options={tiposCentroOptions}
              disabled={isLoadingCentro}
              onChange={(value) => {
                if (Array.isArray(value)) {
                  setCenterField?.("centerType", value[0]);
                } else {
                  setCenterField?.("centerType", value);
                }
              }}
            />
          </div>

          {/* Descripción */}
          <MCTextArea
            name="Description"
            label={t("centerInfoStep.descriptionLabel")}
            placeholder={t("centerInfoStep.descriptionPlaceholder")}
            onChange={(e) => setCenterField?.("Description", e.target.value)}
          />

          {/* Website y RNC */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <MCInput
              name="website"
              label={t("centerInfoStep.websiteLabel")}
              placeholder={t("centerInfoStep.websitePlaceholder")}
              onChange={(e) => setCenterField?.("website", e.target.value)}
            />
            <MCInput
              name="rnc"
              variant="cedula"
              label={t("centerInfoStep.rncLabel")}
              placeholder={t("centerInfoStep.rncPlaceholder")}
              onChange={(e) => setCenterField?.("rnc", e.target.value)}
            />
          </div>

          {/* Teléfono */}
          <MCPhoneInput
            name="phone"
            label={t("centerInfoStep.phoneLabel")}
            placeholder={t("centerInfoStep.phonePlaceholder")}
            onChange={(e) => setCenterField?.("phone", e.target.value)}
          />
        </div>
        {children}
      </MCFormWrapper>
    </div>
  );
}

export default CenterInfoStep1;
