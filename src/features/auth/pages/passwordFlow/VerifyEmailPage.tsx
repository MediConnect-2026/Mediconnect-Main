import MCFormWrapper from "@/shared/components/forms/MCFormWrapper";
import AuthContentContainer from "../../components/AuthContentContainer";
import MCOtpInput from "@/shared/components/forms/MCOtpInput";
import { OtpSchema } from "@/schema/AuthSchema";
import { useAppStore } from "@/stores/useAppStore";
import { useTranslation } from "react-i18next";
import AuthFooterContainer from "../../components/AuthFooterContainer";
import MCButton from "@/shared/components/forms/MCButton";
import { useNavigate, useLocation } from "react-router-dom";
import { useEffect, useState } from "react";
import { ROUTES } from "@/router/routes";
import { toast } from "sonner";
import { authService } from "@/services/auth/auth.service";

function VerifyEmailPage() {
  const { t } = useTranslation("auth");
  const navigate = useNavigate();
  const location = useLocation();
  const [isLoading, setIsLoading] = useState(false);

  const setForgotPassword = useAppStore((state) => state.setForgotPassword);
  
  // Intentar obtener el email del estado de navegación primero, luego del store
  const emailFromNavigation = (location.state as { email?: string })?.email;
  const emailFromStore = useAppStore((state) => state.forgotPassword.email);
  const confirmedEmail = emailFromNavigation || emailFromStore;
  
  const otpData = useAppStore((state) => state.otp);
  const setOtp = useAppStore((state) => state.setOtp);

  useEffect(() => {
    // Si hay email de navegación pero no está en el store, guardarlo
    if (emailFromNavigation && !emailFromStore) {
      setForgotPassword({ email: emailFromNavigation });
    }
    
    // Si no hay email de ninguna fuente, redirigir
    if (!confirmedEmail) {
      navigate(ROUTES.FORGOT_PASSWORD, { replace: true });
    }
  }, [confirmedEmail, emailFromNavigation, emailFromStore, setForgotPassword, navigate]);

  const handleSubmit = async (data: { otp: string }) => {
    if (!confirmedEmail) {
      toast.error(t("forgotPassword.emailNotFound") || "Email no encontrado");
      return;
    }

    setIsLoading(true);

    try {
      const response = await authService.validarCodigoPassword({
        email: confirmedEmail,
        codigo: data.otp,
      });

      if (response.success) {
        toast.success(response.message || t("verifyEmail.success") || "Código validado correctamente");
        
        // Guardar el token en el store para usarlo en el siguiente paso
        setForgotPassword({ 
          email: confirmedEmail,
          resetToken: response.data.token 
        });
        
        // Navegar a la página de reseteo de contraseña
        navigate(ROUTES.RESET_PASSWORD, { replace: true });
      }
    } catch (error: any) {
      // Mostrar mensaje de error
      const errorMessage = 
        error?.response?.data?.message || 
        error?.message || 
        t("registerEmailVerifyPage.errors.otpInvalid") || "Código inválido. Por favor, verifica e intenta de nuevo.";
      
      if (error?.response?.data?.message?.toLowerCase().includes("expirado")) {
        toast.error(t("registerEmailVerifyPage.errors.otpExpired") || "El código ha expirado. Por favor, solicita un nuevo código.");
        return;
      } else if (error?.response?.data?.message?.toLowerCase().includes("inválido")) {
        toast.error(t("registerEmailVerifyPage.errors.invalidOtp") || "El código es inválido. Por favor, verifica e intenta de nuevo.");
        return;
      }
      
      console.error("Error al validar código OTP:", error);
      toast.error(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

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
        defaultValues={{ otp: otpData }}
        className="flex flex-col items-center w-full"
      >
        <div className="flex flex-col items-center w-full max-w-md mx-auto">
          <MCOtpInput
            onChange={(value) => {
              setOtp(value);
            }}
          />
        </div>
        <div className="w-md max-w-md m-4 flex flex-col items-center gap-4">
          <p className="text-md text-primary/80  mb-2 text-center">
            <span className="font-semibold text-primary">
              {t("verifyEmail.tip").split(":")[0]}:
            </span>{" "}
            {t("verifyEmail.tip").split(":")[1]}
          </p>
          <MCButton variant="tercero" size="m" disabled={isLoading}>
            {t("verifyEmail.resend")}
          </MCButton>
        </div>
        <AuthFooterContainer
          backButtonProps={{
            disabled: isLoading,
            onClick: () => {
              navigate(ROUTES.FORGOT_PASSWORD, { replace: true });
            },
          }}
        />
      </MCFormWrapper>
    </AuthContentContainer>
  );
}

export default VerifyEmailPage;
