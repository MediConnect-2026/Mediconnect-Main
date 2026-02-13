import MCInput from "@/shared/components/forms/MCInput";
import MCSelect from "@/shared/components/forms/MCSelect";
import MCFormWrapper from "@/shared/components/forms/MCFormWrapper";
import { useAppStore } from "@/stores/useAppStore";
import { DoctorProfessionalInfoSchema } from "@/schema/OnbordingSchema";
import { useEffect } from "react";
import { useGlobalUIStore } from "@/stores/useGlobalUIStore";
import { useTranslation } from "react-i18next";
import { useEspecialidades } from "@/features/onboarding/services";

type PersonalIdentificationStep2Props = {
  children?: React.ReactNode;
  onValidationChange?: (isValid: boolean) => void;
  onNext?: () => void;
};

function PersonalIdentificationStep2({
  children,
  onValidationChange,
  onNext,
}: PersonalIdentificationStep2Props) {
  const { t } = useTranslation("auth");
  const doctorOnboardingData = useAppStore(
    (state) => state.doctorOnboardingData,
  );
  const setDoctorField = useAppStore((state) => state.setDoctorField);
  const setCurrent = useGlobalUIStore((s) => s.setDoctorOnboardingStep);

  // Obtener especialidades con traducción automática según el idioma actual
  const { data: especialidades = [], isLoading: isLoadingEspecialidades } = useEspecialidades();
  const handleSubmit = (_data: any) => {
    setCurrent(0);
    onValidationChange?.(true);
    onNext?.();
  };

  useEffect(() => {}, [doctorOnboardingData]);

  return (
    <div className="w-full">
      <div className="mb-5">
        <h1 className="text-2xl sm:text-3xl font-bold text-primary mb-2">
          {t("professionalIdentificationStep.title")}
        </h1>
        <p className="text-primary/60 text-sm sm:text-base">
          {t("professionalIdentificationStep.subtitle")}
        </p>
      </div>

      <MCFormWrapper
        schema={DoctorProfessionalInfoSchema((key: string) => t(key))}
        onSubmit={handleSubmit}
        defaultValues={doctorOnboardingData}
        onValidationChange={onValidationChange}
      >
        <div className="space-y-4">
          <MCInput
            name="exequatur"
            variant="exequatur"
            label={t("professionalIdentificationStep.exequaturLabel")}
            placeholder={t(
              "professionalIdentificationStep.exequaturPlaceholder",
            )}
            onChange={(e) => setDoctorField?.("exequatur", e.target.value)}
          />
          <MCSelect
            name="mainSpecialty"
            label={t("professionalIdentificationStep.mainSpecialtyLabel")}
            options={especialidades}
            disabled={isLoadingEspecialidades}
            placeholder={
              isLoadingEspecialidades
                ? t("professionalIdentificationStep.loadingSpecialties", "Cargando especialidades...")
                : t("professionalIdentificationStep.mainSpecialtyPlaceholder", "Selecciona tu especialidad principal")
            }
            onChange={(value) => {
              if (Array.isArray(value)) {
                setDoctorField?.("mainSpecialty", value[0] ?? "");
              } else {
                setDoctorField?.("mainSpecialty", value);
              }
            }}
          />
          <MCSelect
            name="secondarySpecialties"
            label={t(
              "professionalIdentificationStep.secondarySpecialtiesLabel",
            )}
            options={especialidades}
            disabled={isLoadingEspecialidades}
            placeholder={
              isLoadingEspecialidades
                ? t("professionalIdentificationStep.loadingSpecialties", "Cargando especialidades...")
                : t("professionalIdentificationStep.secondarySpecialtiesPlaceholder", "Selecciona especialidades secundarias (opcional)")
            }
            multiple
            onChange={(value) => {
              if (Array.isArray(value)) {
                setDoctorField?.("secondarySpecialties", value);
              } else if (typeof value === "string") {
                setDoctorField?.("secondarySpecialties", [value]);
              } else {
                setDoctorField?.("secondarySpecialties", []);
              }
            }}
          />
        </div>
        {children}
      </MCFormWrapper>
    </div>
  );
}

export default PersonalIdentificationStep2;
