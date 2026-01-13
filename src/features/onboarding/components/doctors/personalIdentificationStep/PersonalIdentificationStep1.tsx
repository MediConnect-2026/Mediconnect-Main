import MCInput from "@/shared/components/forms/MCInput";
import MCSelect from "@/shared/components/forms/MCSelect";
import MCFormWrapper from "@/shared/components/forms/MCFormWrapper";
import { useAppStore } from "@/stores/useAppStore";
import { type DoctorBasicInfoSchemaType } from "@/types/OnbordingTypes";
import { DoctorBasicInfoSchema } from "@/schema/OnbordingSchema";
import { useEffect } from "react";
import { useTranslation } from "react-i18next";

type PersonalIdentificationStep1Props = {
  children?: React.ReactNode;
  onValidationChange?: (isValid: boolean) => void;
  onNext?: () => void;
};

function PersonalIdentificationStep1({
  children,
  onValidationChange,
  onNext,
}: PersonalIdentificationStep1Props) {
  const { t } = useTranslation("auth");
  const doctorOnboardingData = useAppStore(
    (state) => state.doctorOnboardingData
  );
  const setDoctorField = useAppStore((state) => state.setDoctorField);

  const genderOptions = [
    {
      value: "masculino",
      label: t("personalIdentificationStep.genderOptions.masculino"),
    },
    {
      value: "femenino",
      label: t("personalIdentificationStep.genderOptions.femenino"),
    },
    {
      value: "otro",
      label: t("personalIdentificationStep.genderOptions.otro"),
    },
  ];

  const nationalityOptions = [
    {
      value: "dominicana",
      label: t("personalIdentificationStep.nationalityOptions.dominicana"),
    },
    {
      value: "estadounidense",
      label: t("personalIdentificationStep.nationalityOptions.estadounidense"),
    },
    {
      value: "mexicana",
      label: t("personalIdentificationStep.nationalityOptions.mexicana"),
    },
    {
      value: "colombiana",
      label: t("personalIdentificationStep.nationalityOptions.colombiana"),
    },
    {
      value: "venezolana",
      label: t("personalIdentificationStep.nationalityOptions.venezolana"),
    },
    {
      value: "otra",
      label: t("personalIdentificationStep.nationalityOptions.otra"),
    },
  ];

  const handleSubmit = (data: DoctorBasicInfoSchemaType) => {
    onValidationChange?.(true);
    onNext?.();
  };

  useEffect(() => {
    console.log("Doctor Onboarding Data:", doctorOnboardingData);
  }, [doctorOnboardingData]);

  return (
    <div className="w-full ">
      <div className="mb-5">
        <h1 className="text-2xl sm:text-3xl font-bold text-primary mb-2">
          {t("personalIdentificationStep.title")}
        </h1>
        <p className="text-primary/60 text-sm sm:text-base">
          {t("personalIdentificationStep.subtitle")}
        </p>
      </div>

      <MCFormWrapper
        schema={DoctorBasicInfoSchema((t) => t)}
        onSubmit={handleSubmit}
        defaultValues={doctorOnboardingData}
        onValidationChange={onValidationChange}
      >
        <div className="space-y-4">
          {/* Nombre y Apellido */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <MCInput
              name="name"
              label={t("personalIdentificationStep.nameLabel")}
              placeholder={t("personalIdentificationStep.namePlaceholder")}
              onChange={(e) => setDoctorField?.("name", e.target.value)}
            />
            <MCInput
              name="lastName"
              label={t("personalIdentificationStep.lastNameLabel")}
              placeholder={t("personalIdentificationStep.lastNamePlaceholder")}
              onChange={(e) => setDoctorField?.("lastName", e.target.value)}
            />
          </div>

          {/* Género y Fecha de Nacimiento */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <MCSelect
              name="gender"
              label={t("personalIdentificationStep.genderLabel")}
              placeholder={t("personalIdentificationStep.genderPlaceholder")}
              options={genderOptions}
              onChange={(value) =>
                setDoctorField?.(
                  "gender",
                  Array.isArray(value) ? value[0] : value
                )
              }
            />
            <MCInput
              name="birthDate"
              label={t("personalIdentificationStep.birthDateLabel")}
              type="date"
              placeholder={t("personalIdentificationStep.birthDatePlaceholder")}
              onChange={(e) => setDoctorField?.("birthDate", e.target.value)}
            />
          </div>

          {/* Nacionalidad y Número de Identificación */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <MCSelect
              name="nationality"
              label={t("personalIdentificationStep.nationalityLabel")}
              placeholder={t(
                "personalIdentificationStep.nationalityPlaceholder"
              )}
              options={nationalityOptions}
              onChange={(value) =>
                setDoctorField?.(
                  "nationality",
                  Array.isArray(value) ? value[0] : value
                )
              }
            />
            <MCInput
              name="identityDocument"
              label={t("personalIdentificationStep.identityDocumentLabel")}
              placeholder={t(
                "personalIdentificationStep.identityDocumentPlaceholder"
              )}
              onChange={(e) =>
                setDoctorField?.("identityDocument", e.target.value)
              }
            />
          </div>

          {/* Teléfono móvil */}
          <MCInput
            name="phone"
            label={t("personalIdentificationStep.phoneLabel")}
            type="tel"
            placeholder={t("personalIdentificationStep.phonePlaceholder")}
            onChange={(e) => setDoctorField?.("phone", e.target.value)}
          />
        </div>
        {children}
      </MCFormWrapper>
    </div>
  );
}

export default PersonalIdentificationStep1;
