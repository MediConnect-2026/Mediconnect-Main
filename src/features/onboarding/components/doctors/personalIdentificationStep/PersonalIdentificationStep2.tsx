import MCInput from "@/shared/components/forms/MCInput";
import MCSelect from "@/shared/components/forms/MCSelect";
import MCFormWrapper from "@/shared/components/forms/MCFormWrapper";
import { useAppStore } from "@/stores/useAppStore";
import { DoctorProfessionalInfoSchema } from "@/schema/OnbordingSchema";
import { useEffect } from "react";
import { useGlobalUIStore } from "@/stores/useGlobalUIStore";
import { useTranslation } from "react-i18next";

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
    (state) => state.doctorOnboardingData
  );
  const setDoctorField = useAppStore((state) => state.setDoctorField);
  const setOnboardingStep = useGlobalUIStore(
    (state) => state.setOnboardingStep
  );

  const specialtyOptions = [
    {
      value: "medicina_general",
      label: t(
        "professionalIdentificationStep.specialtyOptions.medicina_general"
      ),
    },
    {
      value: "pediatria",
      label: t("professionalIdentificationStep.specialtyOptions.pediatria"),
    },
    {
      value: "cardiologia",
      label: t("professionalIdentificationStep.specialtyOptions.cardiologia"),
    },
    {
      value: "dermatologia",
      label: t("professionalIdentificationStep.specialtyOptions.dermatologia"),
    },
    {
      value: "ginecologia",
      label: t("professionalIdentificationStep.specialtyOptions.ginecologia"),
    },
    {
      value: "otra",
      label: t("professionalIdentificationStep.specialtyOptions.otra"),
    },
  ];

  const handleSubmit = (data: any) => {
    setOnboardingStep(0);
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
        schema={DoctorProfessionalInfoSchema((t) => t)}
        onSubmit={handleSubmit}
        defaultValues={doctorOnboardingData}
        onValidationChange={onValidationChange}
      >
        <div className="space-y-4">
          <MCInput
            name="exequatur"
            label={t("professionalIdentificationStep.exequaturLabel")}
            placeholder={t(
              "professionalIdentificationStep.exequaturPlaceholder"
            )}
            onChange={(e) => setDoctorField?.("exequatur", e.target.value)}
          />
          <MCSelect
            name="mainSpecialty"
            label={t("professionalIdentificationStep.mainSpecialtyLabel")}
            placeholder={t(
              "professionalIdentificationStep.selectSpecialtyPlaceholder"
            )}
            options={specialtyOptions}
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
              "professionalIdentificationStep.secondarySpecialtiesLabel"
            )}
            placeholder={t(
              "professionalIdentificationStep.selectSpecialtiesPlaceholder"
            )}
            options={specialtyOptions}
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
