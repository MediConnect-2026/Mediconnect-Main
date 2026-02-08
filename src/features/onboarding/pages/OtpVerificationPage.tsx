import { useEffect, useState } from "react";
import MCFormWrapper from "@/shared/components/forms/MCFormWrapper";
import AuthContentContainer from "@/features/auth//components/AuthContentContainer";
import MCOtpInput from "@/shared/components/forms/MCOtpInput";
import { OtpSchema } from "@/schema/AuthSchema";
import { useAppStore } from "@/stores/useAppStore";
import { useTranslation } from "react-i18next";
import AuthFooterContainer from "@/features/auth/components/AuthFooterContainer";
import MCButton from "@/shared/components/forms/MCButton";
import { useNavigate } from "react-router-dom";
import { authService } from "@/services/auth/auth.service";
import { toast } from "sonner";

function OtpVerificationPage() {
  const { t } = useTranslation("auth");
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(false);
  const [isResending, setIsResending] = useState(false);
  
  const otpData = useAppStore((state) => state.otp);
  const setOtp = useAppStore((state) => state.setOtp);
  const selectedRole = useAppStore((state) => state.selectedRole);
  const basicInfo = useAppStore((state) => state.patientOnboardingData);
  const doctorBasicInfo = useAppStore((state) => state.doctorOnboardingData);
  const centerBasicInfo = useAppStore((state) => state.centerOnboardingData);
  const setVerifyEmail = useAppStore((state) => state.setVerifyEmail);
  const setRegistrationToken = useAppStore((state) => state.setRegistrationToken);
  const confirmedEmail =
    selectedRole === "Patient"
      ? basicInfo?.email
      : selectedRole === "Doctor"
        ? doctorBasicInfo?.email
        : selectedRole === "Center"
          ? centerBasicInfo?.email
          : undefined;

  useEffect(() => {
    if (!selectedRole) {
      navigate("/auth/register", { replace: true });
      return;
    }

    if (!confirmedEmail) {
      navigate("/auth/reg-email-verification", { replace: true });
    }
  }, [confirmedEmail, selectedRole, navigate]);

  const handleSubmit = async (data: { otp: string }) => {
    if (!confirmedEmail) {
      toast.error("Email no encontrado");
      return;
    }

    setIsLoading(true);
    
    try {
      // Validar código OTP con la API
      const response = await authService.validarCodigoRegistro({
        email: confirmedEmail,
        codigo: data.otp,
      });

      if (response.success) {
        // Guardar OTP y token de registro
        setOtp(data.otp);
        setRegistrationToken(response.data.token);
        
        // Marcar email como verificado
        setVerifyEmail({ verified: true, email: confirmedEmail });

        // Mostrar mensaje de éxito
        toast.success(response.message || "Código verificado correctamente");
        
        // Navegar según el rol
        setTimeout(() => {
          if (selectedRole === "Patient") {
            navigate("/auth/patient-onboarding/basic-info", { replace: true });
          } else if (selectedRole === "Doctor") {
            navigate("/auth/doctor-onboarding", { replace: true });
          } else if (selectedRole === "Center") {
            navigate("/auth/center-onboarding", { replace: true });
          } else {
            navigate("/auth/register", { replace: true });
          }
        }, 300);
      }
    } catch (error: any) {
      console.error("Error al validar código OTP:", error);
      
      // Mostrar mensaje de error
      const errorMessage = 
        error?.response?.data?.message || 
        error?.message || 
        "Código inválido. Por favor, verifica e intenta de nuevo.";
      
      toast.error(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  const handleResendOtp = async () => {
    if (!confirmedEmail) {
      toast.error("Email no encontrado");
      return;
    }

    setIsResending(true);
    
    try {
      // Solicitar nuevo código OTP
      const response = await authService.solicitarCodigoRegistro({
        email: confirmedEmail,
      });

      if (response.success) {
        toast.success(response.message || "Código reenviado correctamente");
      }
    } catch (error: any) {
      console.error("Error al reenviar código OTP:", error);
      
      const errorMessage = 
        error?.response?.data?.message || 
        error?.message || 
        "Error al reenviar el código. Por favor, intenta de nuevo.";
      
      toast.error(errorMessage);
    } finally {
      setIsResending(false);
    }
  };

  if (!selectedRole || !confirmedEmail) {
    return null;
  }

  return (
    <AuthContentContainer
      title={t("verifyEmail.title")}
      subtitle={
        <div>
          {t("verifyEmail.subtitle")}
          <br />
          <span className="font-semibold text-primary">{confirmedEmail}</span>
        </div>
      }
    >
      <MCFormWrapper
        schema={OtpSchema((key) => t(key))}
        onSubmit={handleSubmit}
        defaultValues={{ otp: otpData || "" }}
        className="flex flex-col items-center w-full"
      >
        <div className="flex flex-col items-center w-full max-w-md mx-auto">
          <MCOtpInput
            onChange={(value) => {
              setOtp(value);
            }}
            disabled={isLoading}
          />
        </div>

        <div className="w-full max-w-md m-4 flex flex-col items-center gap-4">
          <p className="text-md text-primary/80 mb-2 text-center">
            <span className="font-semibold text-primary">
              {t("verifyEmail.tip").split(":")[0]}:
            </span>{" "}
            {t("verifyEmail.tip").split(":")[1]}
          </p>

          <MCButton
            variant="tercero"
            size="m"
            type="button"
            onClick={handleResendOtp}
            disabled={isLoading || isResending}
          >
            {isResending ? "Reenviando..." : t("verifyEmail.resend")}
          </MCButton>
        </div>

        <AuthFooterContainer
          backButtonProps={{
            onClick: () => {
              navigate("/auth/reg-email-verification", { replace: true });
            },
            disabled: isLoading,
          }}
          continueButtonProps={{
            disabled: isLoading,
          }}
        />
      </MCFormWrapper>
    </AuthContentContainer>
  );
}

export default OtpVerificationPage;
