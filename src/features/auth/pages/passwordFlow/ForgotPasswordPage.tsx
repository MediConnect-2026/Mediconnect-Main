import MCFormWrapper from "@/shared/components/forms/MCFormWrapper";
import AuthContentContainer from "../../components/AuthContentContainer";
import MCInput from "@/shared/components/forms/MCInput";
import { ForgotPasswordSchema } from "@/schema/AuthSchema";
import { useAppStore } from "@/stores/useAppStore";
import { useTranslation } from "react-i18next";
import AuthFooterContainer from "../../components/AuthFooterContainer";
import { useNavigate } from "react-router-dom";
import { ROUTES } from "@/router/routes";
import { Loader2 } from "lucide-react";
import  { toast } from "sonner";
import { authService } from "@/services/auth/auth.service";
import { useState } from "react";

function ForgotPasswordPage() {
  const { t } = useTranslation("auth");
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(false);
  
  const forgotPasswordData = useAppStore((state) => state.forgotPassword);
  const setForgotPassword = useAppStore((state) => state.setForgotPassword);

  const handlesubmit = async (data: { email: string }) => {
    setIsLoading(true);

    try {
      // Llamar a la API para solicitar código OTP
      // Si el email no existe, el backend devolverá un error
      const response = await authService.solicitarCodigoPassword({
        email: data.email,
      });

      // Guardar email para el flujo de restablecimiento de contraseña
      setForgotPassword({ email: data.email });

      // Mostrar mensaje de éxito
      toast.success(t("forgotPassword.successTitleEmailSent") || response.message || "Código enviado correctamente");
      
      // Redirigir a la página de verificación de email, pasando el email en el estado
      navigate(ROUTES.VERIFY_EMAIL, { 
        replace: true,
        state: { email: data.email }
      });

    } catch (error: any) {
      console.error("Error al solicitar código OTP:", error);

      const errorMessage = error.response?.data?.message || t("forgotPassword.errors.sendingEmail") || "Error al enviar el correo de restablecimiento de contraseña. Por favor, inténtalo de nuevo.";

      if (error.response?.data?.message.includes("No existe un usuario registrado con este correo")) {
        toast.error(t("forgotPassword.errors.emailNotFound") || "Correo no encontrado. Por favor, verifica e inténtalo de nuevo.");
        return;
      }

      console.log("Error message to display:", errorMessage);
      toast.error(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <AuthContentContainer
      title={t("forgotPassword.title")}
      subtitle={t("forgotPassword.subtitle")}
    >
      <MCFormWrapper
        schema={ForgotPasswordSchema((key) => t(key))}
        onSubmit={async (data) => {
          await handlesubmit(data);
        }}
        defaultValues={{
          email: forgotPasswordData?.email || "",
        }}
        className="flex flex-col items-center w-full"
      >
        <div className="flex flex-col items-center w-full max-w-md mx-auto">
          <MCInput
            name="email"
            type="email"
            label={t("forgotPassword.emailLabel")}
            placeholder={t("forgotPassword.emailPlaceholder")}
          />
        </div>
        <AuthFooterContainer
          backButtonProps={{
            disabled: isLoading,
          }}
          continueButtonProps={{
            disabled: isLoading,
            icon: isLoading ? <Loader2 className="animate-spin" /> : undefined,
          }}
        />
      </MCFormWrapper>
    </AuthContentContainer>
  );
}

export default ForgotPasswordPage;
