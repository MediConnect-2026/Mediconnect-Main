import MCInput from "@/shared/components/forms/MCInput";
import MCSelect from "@/shared/components/forms/MCSelect";
import MCFormWrapper from "@/shared/components/forms/MCFormWrapper";
import { useAppStore } from "@/stores/useAppStore";
import { DoctorBasicInfoSchema } from "@/schema/OnbordingSchema";
import { useTranslation } from "react-i18next";
import MCPhoneInput from "@/shared/components/forms/MCPhoneInput";
import { useState, useEffect, useCallback, useMemo } from "react";
import { authService } from "@/services/auth/auth.service";
import { Loader2, CheckCircle2, XCircle } from "lucide-react";
import { AVAILABLE_LANGUAGES, PROFICIENCY_LEVELS } from "@/features/onboarding/constants/languages.constants";

type PersonalIdentificationStep1Props = {
  children?: React.ReactNode;
  onNext?: () => void;
  onValidationChange?: (isValid: boolean) => void;
};

function PersonalIdentificationStep1({
  children,
  onNext,
  onValidationChange,
}: PersonalIdentificationStep1Props) {
  const { t } = useTranslation("auth");
  const doctorOnboardingData = useAppStore(
    (state) => state.doctorOnboardingData,
  );
  const setDoctorField = useAppStore((state) => state.setDoctorField);

  // Estados para la verificación de documento
  const [documentoStatus, setDocumentoStatus] = useState<{
    isChecking: boolean;
    isAvailable: boolean | null;
    message: string;
  }>({
    isChecking: false,
    isAvailable: null,
    message: "",
  });

  // Estado para guardar la validación del formulario
  const [isFormValid, setIsFormValid] = useState(false);

  // Combinar validación del formulario con verificación de documento
  useEffect(() => {
    const isDocumentValid = documentoStatus.isAvailable !== false && !documentoStatus.isChecking;
    const isTotallyValid = isFormValid && isDocumentValid;
    onValidationChange?.(isTotallyValid);
  }, [isFormValid, documentoStatus, onValidationChange]);

  // Función para verificar el documento
  const verificarDocumento = useCallback(async (numero: string) => {
    // Limpiar formato y dejar solo números
    const numeroLimpio = numero.replace(/\D/g, "");

    // Solo verificar si tiene 11 dígitos (formato de cédula dominicana)
    if (numeroLimpio.length !== 11) {
      setDocumentoStatus({
        isChecking: false,
        isAvailable: null,
        message: "",
      });
      return;
    }

    setDocumentoStatus({
      isChecking: true,
      isAvailable: null,
      message: t("personalIdentificationStep.verifyingDocument") || "Verificando documento...",
    });

    try {
      const response = await authService.verificarDocumento(numeroLimpio);
      
      if (response.disponible) {
        setDocumentoStatus({
          isChecking: false,
          isAvailable: true,
          message: t("personalIdentificationStep.documentAvailable") || "Número de documento disponible",
        });
      } else {
        setDocumentoStatus({
          isChecking: false,
          isAvailable: false,
          message: response.message || t("personalIdentificationStep.documentNotAvailable") || "Este número de documento ya está registrado",
        });
      }
    } catch (error: any) {
      console.error("Error al verificar documento:", error);
      setDocumentoStatus({
        isChecking: false,
        isAvailable: null,
        message: t("personalIdentificationStep.verificationError") || "Error al verificar el documento",
      });
    }
  }, [t]);

  // useEffect con debounce para verificar el documento
  useEffect(() => {
    const timeoutId = setTimeout(() => {
      if (doctorOnboardingData?.identityDocument) {
        verificarDocumento(doctorOnboardingData.identityDocument);
      }
    }, 800); // Esperar 800ms después del último cambio

    return () => clearTimeout(timeoutId);
  }, [doctorOnboardingData?.identityDocument, verificarDocumento]);

  const genderOptions = [
    {
      value: "M",
      label: t("personalIdentificationStep.genderOptions.masculino"),
    },
    {
      value: "F",
      label: t("personalIdentificationStep.genderOptions.femenino"),
    },
    {
      value: "O",
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

  // Traducir opciones de idioma basado en el idioma actual
  const { i18n } = useTranslation();
  const currentLanguage = i18n.language;

  const languageOptions = useMemo(() => {
    return AVAILABLE_LANGUAGES.map((lang) => ({
      value: lang.value,
      label: currentLanguage === "en" ? lang.labelEn : lang.label,
    }));
  }, [currentLanguage]);

  const proficiencyOptions = useMemo(() => {
    return PROFICIENCY_LEVELS.map((level) => ({
      value: level.value,
      label: currentLanguage === "en" ? level.labelEn : level.label,
    }));
  }, [currentLanguage]);

  const handleSubmit = () => {
    onNext?.();
  };

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
        schema={DoctorBasicInfoSchema((key: string) => t(key))}
        onSubmit={handleSubmit}
        defaultValues={doctorOnboardingData}
        onValidationChange={setIsFormValid}
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
                  Array.isArray(value) ? value[0] : value,
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
                "personalIdentificationStep.nationalityPlaceholder",
              )}
              options={nationalityOptions}
              onChange={(value) =>
                setDoctorField?.(
                  "nationality",
                  Array.isArray(value) ? value[0] : value,
                )
              }
            />
            <div className="relative">
              <MCInput
                name="identityDocument"
                variant="cedula"
                label={t("personalIdentificationStep.identityDocumentLabel")}
                placeholder={t(
                  "personalIdentificationStep.identityDocumentPlaceholder",
                )}
                onChange={(e) =>
                  setDoctorField?.("identityDocument", e.target.value)
                }
              />
              {/* Indicador de verificación */}
              {doctorOnboardingData?.identityDocument && doctorOnboardingData.identityDocument.replace(/\D/g, "").length === 11 && (
                <div className="mt-2 flex items-center gap-2 text-sm">
                  {documentoStatus.isChecking && (
                    <>
                      <Loader2 className="size-4 animate-spin text-blue-500" />
                      <span className="text-blue-600">{documentoStatus.message}</span>
                    </>
                  )}
                  {!documentoStatus.isChecking && documentoStatus.isAvailable === true && (
                    <>
                      <CheckCircle2 className="size-4 text-green-500" />
                      <span className="text-green-600">{documentoStatus.message}</span>
                    </>
                  )}
                  {!documentoStatus.isChecking && documentoStatus.isAvailable === false && (
                    <>
                      <XCircle className="size-4 text-red-500" />
                      <span className="text-red-600">{documentoStatus.message}</span>
                    </>
                  )}
                </div>
              )}
            </div>
          </div>

          {/* Teléfono móvil */}
          <MCPhoneInput
            name="phone"
            label={t("personalIdentificationStep.phoneLabel")}
            placeholder={t("personalIdentificationStep.phonePlaceholder")}
            onChange={(e) => setDoctorField?.("phone", e.target.value)}
          />

          {/* Idioma y Nivel de Dominio */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <MCSelect
              name="language"
              label={t("personalIdentificationStep.languageLabel")}
              placeholder={t("personalIdentificationStep.languagePlaceholder")}
              options={languageOptions}
              onChange={(value) =>
                setDoctorField?.(
                  "language",
                  Array.isArray(value) ? value[0] : value,
                )
              }
            />
            <MCSelect
              name="proficiencyLevel"
              label={t("personalIdentificationStep.proficiencyLevelLabel")}
              placeholder={t("personalIdentificationStep.proficiencyLevelPlaceholder")}
              options={proficiencyOptions}
              onChange={(value) =>
                setDoctorField?.(
                  "proficiencyLevel",
                  Array.isArray(value) ? value[0] : value,
                )
              }
            />
          </div>
        </div>
        {children}
      </MCFormWrapper>
    </div>
  );
}

export default PersonalIdentificationStep1;
