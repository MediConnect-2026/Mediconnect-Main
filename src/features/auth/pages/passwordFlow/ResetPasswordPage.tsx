import MCFormWrapper from "@/shared/components/forms/MCFormWrapper";
import AuthContentContainer from "../../components/AuthContentContainer";
import MCInput from "@/shared/components/forms/MCInput";
import { useAppStore } from "@/stores/useAppStore";
import { useTranslation } from "react-i18next";
import AuthFooterContainer from "../../components/AuthFooterContainer";
import { useNavigate, useLocation } from "react-router-dom";
import { ResetPasswordSchema } from "@/schema/AuthSchema";
import { useEffect, useState } from "react";
import { useGlobalUIStore } from "@/stores/useGlobalUIStore";
import { ROUTES } from "@/router/routes";
import { toast } from "sonner";
import { authService } from "@/services/auth/auth.service";


function ResetPasswordPage() {
  const { t } = useTranslation("auth");
  const navigate = useNavigate();
  const location = useLocation();
  const [isLoading, setIsLoading] = useState(false);
  
  const resetPassword = useAppStore((state) => state.resetPassword);
  const setResetPassword = useAppStore((state) => state.setResetPassword);
  const setAccessPage = useGlobalUIStore((state) => state.setAccessPage);
  const setForgotPassword = useAppStore((state) => state.setForgotPassword);
  
  // Intentar obtener el email del estado de navegación primero, luego del store
  const emailFromNavigation = (location.state as { email?: string })?.email;
  const emailFromStore = useAppStore((state) => state.forgotPassword.email);
  const forgotPasswordEmail = emailFromNavigation || emailFromStore;
  
  // Obtener el token de recuperación
  const resetToken = useAppStore((state) => state.forgotPassword.resetToken);
  
  const otp = useAppStore((state) => state.otp);

  useEffect(() => {
    // Si hay email de navegación pero no está en el store, guardarlo
    if (emailFromNavigation && !emailFromStore) {
      setForgotPassword({ email: emailFromNavigation });
    }
    
    // Si no hay email, OTP o token, redirigir
    if (!forgotPasswordEmail || !otp || !resetToken) {
      navigate(ROUTES.FORGOT_PASSWORD, { replace: true });
    }
  }, [forgotPasswordEmail, otp, resetToken, emailFromNavigation, emailFromStore, setForgotPassword, navigate]);

  const handleSubmit = async (data: {
    password: string;
    confirmPassword: string;
  }) => {
    if (!resetToken) {
      toast.error(t("resetPassword.tokenNotFound") || "Token no encontrado. Por favor, inicia el proceso nuevamente.");
      navigate(ROUTES.FORGOT_PASSWORD, { replace: true });
      return;
    }

    setIsLoading(true);

    try {
      const response = await authService.cambiarPassword(
        {
          nuevaPassword: data.password,
          confirmarPassword: data.confirmPassword,
        },
        resetToken
      );

      if (response.success) {
        toast.success(t("resetPassword.success") || "Contraseña actualizada correctamente");
        
        // Guardar en el store
        setResetPassword({
          password: data.password,
          confirmPassword: data.confirmPassword,
        });
        
        // Configurar acceso a la página de éxito
        setAccessPage(
          true,
          [{ page: ROUTES.PASSWORD_SUCCESS, reason: "password" }],
          "password"
        );
        
        // Navegar a la página de éxito
        navigate(ROUTES.PASSWORD_SUCCESS, { replace: true });
      }
    } catch (error: any) {
      const errorMessage = t("resetPassword.error") || error?.response?.data?.message || "Error al actualizar la contraseña";

      toast.error(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <AuthContentContainer
      title={t("resetPassword.title")}
      subtitle={t("resetPassword.subtitle")}
    >
      <MCFormWrapper
        schema={ResetPasswordSchema((key) => t(key))}
        onSubmit={handleSubmit}
        defaultValues={{
          password: resetPassword.password,
          confirmPassword: resetPassword.confirmPassword,
        }}
        className="flex flex-col items-center w-full"
      >
        <div className="flex flex-col items-center w-full max-w-md mx-auto">
          <MCInput
            name="password"
            type="password"
            label={t("resetPassword.passwordLabel")}
            placeholder={t("resetPassword.passwordPlaceholder")}
          />
          <MCInput
            name="confirmPassword"
            type="password"
            label={t("resetPassword.confirmPasswordLabel")}
            placeholder={t("resetPassword.confirmPasswordPlaceholder")}
          />
        </div>
        <AuthFooterContainer
          continueButtonProps={{
            children: t("footer.continue"),
            disabled: isLoading,
          }}
          backButtonProps={{
            onClick: () => navigate("/auth/verify-email", { replace: true }),
            disabled: isLoading,
          }}
        />
      </MCFormWrapper>
    </AuthContentContainer>
  );
}

export default ResetPasswordPage;
