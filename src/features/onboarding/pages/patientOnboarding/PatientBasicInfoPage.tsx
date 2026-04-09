import { useEffect, useState, useCallback } from "react";
import MCFormWrapper from "@/shared/components/forms/MCFormWrapper";
import AuthContentContainer from "@/features/auth/components/AuthContentContainer";
import MCInput from "@/shared/components/forms/MCInput";
import { useAppStore } from "@/stores/useAppStore";
import { useTranslation } from "react-i18next";
import AuthFooterContainer from "@/features/auth/components/AuthFooterContainer";
import { useNavigate } from "react-router-dom";
import { PatientBasicInfoSchema } from "@/schema/OnbordingSchema";
import type { PatientBasicInfoSchemaType } from "@/types/OnbordingTypes";
import MCSelect from "@/shared/components/forms/MCSelect";
import { authService } from "@/services/auth/auth.service";
import { Loader2, CheckCircle2, XCircle } from "lucide-react";
import { ValidateDominicanID } from "@/utils/ValidateDominicanID";

function PatientBasicInfoPage() {
  const { t } = useTranslation("auth");
  const navigate = useNavigate();

  const basicInfo = useAppStore((state) => state.patientOnboardingData);
  const setBasicInfo = useAppStore((state) => state.setPatientOnboardingData);
  const otpData = useAppStore((state) => state.otp);
  const selectedRole = useAppStore((state) => state.selectedRole);
  
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

  // Estado para saber si el formulario es válido
  const [isFormValid, setIsFormValid] = useState(false);

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
          message: t("personalIdentificationStep.documentNotAvailable") || response.message || "Este número de documento ya está registrado",
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
      const identityDocument = basicInfo?.identityDocument ?? "";
      if (identityDocument && ValidateDominicanID(identityDocument)) {
        verificarDocumento(identityDocument);
      } else {
        setDocumentoStatus({
          isChecking: false,
          isAvailable: null,
          message: "",
        });
      }
    }, 800); // Esperar 800ms después del último cambio

    return () => clearTimeout(timeoutId);
  }, [basicInfo?.identityDocument, verificarDocumento]);
  
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

  // Validar que exista OTP verificado antes de acceder a esta página
  useEffect(() => {
    if (!otpData || !basicInfo?.email) {
      console.log("No OTP or email found, redirecting to OTP verification...");
      navigate("/auth/otp-verification", { replace: true });
      return;
    }

    if (selectedRole !== "Patient") {
      console.log("Invalid role for patient onboarding, redirecting...");
      navigate("/auth/register", { replace: true });
    }
  }, [otpData, basicInfo?.email, selectedRole, navigate]);

  const handleSubmit = (data: PatientBasicInfoSchemaType) => {
    if (setBasicInfo && basicInfo) {
      setBasicInfo({
        ...basicInfo,
        name: data.name,
        lastName: data.lastName,
        role: "Patient",
        identityDocument: data.identityDocument,
        gender: data.gender,
        email: basicInfo.email,
        password: basicInfo.password ?? "",
        confirmPassword: basicInfo.confirmPassword ?? "",
        urlImg:
          typeof basicInfo.urlImg === "string" ? undefined : basicInfo.urlImg,
      });
      navigate("/auth/patient-onboarding/password-setup", { replace: true });
    }
  };

  // Early return si no hay OTP o email
  if (!otpData || !basicInfo?.email) {
    return null;
  }

  // Calcular si el botón debe estar deshabilitado
  const isDocumentValid = !!basicInfo?.identityDocument && ValidateDominicanID(basicInfo.identityDocument);
  const isButtonDisabled = 
    !isFormValid || // Formulario no válido
    documentoStatus.isChecking || // Mientras se verifica
    documentoStatus.isAvailable === false || // Si ya está en uso
    (isDocumentValid && documentoStatus.isAvailable === null) || // Si tiene 11 dígitos pero aún no se ha verificado
    documentoStatus.isAvailable !== true; // La cédula debe estar verificada y disponible

  return (
    <AuthContentContainer
      title={t("patientBasicInfo.title")}
      subtitle={t("patientBasicInfo.subtitle")}
    >
      <MCFormWrapper
        onSubmit={(data) => {
          handleSubmit(data);
        }}
        schema={PatientBasicInfoSchema((key) => t(key))}
        defaultValues={{
          name: basicInfo?.name || "",
          lastName: basicInfo?.lastName || "",
          identityDocument: basicInfo?.identityDocument || "",
          gender: basicInfo?.gender || "",
        }}
        onValidationChange={setIsFormValid}
        className="flex flex-col items-center w-full"
      >
        <div className="flex flex-col items-center w-full max-w-md mx-auto">
          <MCInput
            label={t("patientBasicInfo.nameLabel")}
            name="name"
            placeholder={t("patientBasicInfo.namePlaceholder")}
          />
          <MCInput
            label={t("patientBasicInfo.lastNameLabel")}
            name="lastName"
            placeholder={t("patientBasicInfo.lastNamePlaceholder")}
          />
          <MCSelect
              name="gender"
              label={t("personalIdentificationStep.genderLabel")}
              placeholder={t("personalIdentificationStep.genderPlaceholder")}
              options={genderOptions}
            />
          <div className="relative w-full">
            <MCInput
              label={t("patientBasicInfo.identityDocumentLabel")}
              name="identityDocument"
              variant="cedula"
              placeholder={t("patientBasicInfo.identityDocumentPlaceholder")}
              onChange={(e) => setBasicInfo?.({ ...basicInfo, identityDocument: e.target.value })}
            />
            {/* Indicador de verificación */}
            {basicInfo?.identityDocument && basicInfo.identityDocument.replace(/\D/g, "").length === 11 && (
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
        <AuthFooterContainer
          backButtonProps={{
            onClick() {
              navigate("/auth/otp-verification", { replace: true });
            },
          }}
          continueButtonProps={{
            disabled: isButtonDisabled,
          }}
        />
      </MCFormWrapper>
    </AuthContentContainer>
  );
}

export default PatientBasicInfoPage;
