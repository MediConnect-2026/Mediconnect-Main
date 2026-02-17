import React from "react";
import { useTranslation } from "react-i18next";
import MCDashboardContent from "@/shared/layout/MCDashboardContent";
import MCInput from "@/shared/components/forms/MCInput";
import MCFormWrapper from "@/shared/components/forms/MCFormWrapper";
import { useProfileStore } from "@/stores/useProfileStore";
import { verifyAccountSchema } from "@/schema/account.schema";
import { useNavigate } from "react-router-dom";
import { useAppStore } from "@/stores/useAppStore";
import MCButton from "@/shared/components/forms/MCButton";
import { ArrowRight } from "lucide-react";
import { useGlobalUIStore } from "@/stores/useGlobalUIStore";
import { useIsMobile } from "@/lib/hooks/useIsMobile";
import { useMutation } from "@tanstack/react-query";
import { authService } from "@/services/auth/auth.service";
import type { AxiosError } from "axios";
import type { ApiErrorResponse } from "@/services/api/client";
import { getAuthErrorMessage } from "@/lib/hooks/useAuthErrors";

const CONTEXT_ROUTES: Record<string, string> = {
  CHANGE_EMAIL: "/settings/change-email",
  CHANGE_PASSWORD: "/settings/change-password",
  DELETE_ACCOUNT: "/settings/delete-account",
};

function VerifyIdentityPage() {
  const { t } = useTranslation("common");
  const { t: tAuth } = useTranslation("auth");
  const isMobile = useIsMobile();
  const navigate = useNavigate();

  const sessionUser = useAppStore((state) => state.user);
  const setVerifyAccountPassword = useProfileStore(
    (state) => state.setVerifyAccountPassword,
  );

  const setToast = useGlobalUIStore((state) => state.setToast);

  const verificationContext = useGlobalUIStore(
    (state) => state.verificationContext,
  );
  const setVerificationStatus = useGlobalUIStore(
    (state) => state.setVerificationContextStatus,
  );

  React.useEffect(() => {
    if (!verificationContext) {
      navigate("/settings");
    }
  }, [verificationContext, navigate]);

  // Mutación para verificar la contraseña usando el API de login
  const verifyPasswordMutation = useMutation({
    mutationFn: (password: string) => {
      if (!sessionUser?.email) {
        throw new Error("No user email found");
      }
      return authService.login({
        email: sessionUser.email,
        password: password,
      });
    },
    onSuccess: async (_data, password) => {
      // La contraseña es correcta
      setVerificationStatus("VERIFIED");
      setVerifyAccountPassword({ password });
      
      // Si el contexto es CHANGE_PASSWORD, enviar OTP al email del usuario
      if (verificationContext === "CHANGE_PASSWORD") {
        try {
          const otpResponse = await authService.solicitarCodigoPassword({
            email: sessionUser?.email || "",
          });
          
          if (otpResponse.success) {
            setToast({
              type: "success",
              message: t(
                "verifyIdentity.otpSentMessage",
                "Verification code sent to your email.",
              ),
              open: true,
            });
            // Redirigir a la página de verificación OTP (reutilizando VerifyNewEmailPage)
            navigate("/settings/verify-email");
          }
        } catch (error) {
          setToast({
            type: "error",
            message: t(
              "verifyIdentity.otpSendError",
              "Failed to send verification code. Please try again.",
            ),
            open: true,
          });
        }
      } else {
        // Para otros contextos, continuar con el flujo normal
        setToast({
          type: "success",
          message: t(
            "verifyIdentity.successMessage", 
            "Identity verified successfully.",
          ),
          open: true,
        });
        
        if (verificationContext && CONTEXT_ROUTES[verificationContext]) {
          navigate(CONTEXT_ROUTES[verificationContext]);
        } else {
          navigate("/settings");
        }
      }
    },
    onError: (error: AxiosError<ApiErrorResponse>) => {
      // La contraseña es incorrecta
      const errorMessage = getAuthErrorMessage(error, tAuth);

      setToast({
        message: errorMessage,
        type: "error",
        open: true,
      });
    },
  });

  const handleSubmitSuccess = (data: { password: string }) => {
    // Verificar la contraseña haciendo login
    verifyPasswordMutation.mutate(data.password);
  };

  return (
    <MCDashboardContent mainWidth={isMobile ? "w-full" : "max-w-2xl"}>
      <div
        className={`flex flex-col gap-6 items-center justify-center w-full mb-8 ${
          isMobile ? "px-4" : "px-0"
        }`}
      >
        <div
          className={`w-full flex flex-col gap-2 justify-center items-center ${
            isMobile ? "min-w-0" : "min-w-xl"
          }`}
        >
          <h1
            className={`font-medium mb-2 text-center ${
              isMobile ? "text-3xl" : "text-5xl"
            }`}
          >
            {t("verifyIdentity.title", "Verify your identity")}
          </h1>
          <p className="text-muted-foreground text-base max-w-md text-center">
            {t(
              "verifyIdentity.description",
              "For security, we need to verify it's you. Enter your current password.",
            )}
          </p>
          <MCFormWrapper
            schema={verifyAccountSchema(t)}
            onSubmit={handleSubmitSuccess}
            defaultValues={{
              password: "",
            }}
            className={`mt-4 flex flex-col items-center gap-4 h-full ${
              isMobile ? "w-full" : "w-md"
            }`}
          >
            <MCInput
              label={t("verifyIdentity.passwordLabel", "Password")}
              type="password"
              name="password"
              placeholder={t(
                "verifyIdentity.passwordPlaceholder",
                "Enter your password",
              )}
              className="w-full"
            />
            <MCButton
              type="submit"
              className={isMobile ? "w-full" : "w-xs"}
              icon={<ArrowRight size={isMobile ? 20 : 24} />}
              iconPosition="right"
              disabled={verifyPasswordMutation.isPending}
            >
              {verifyPasswordMutation.isPending
                ? tAuth("errors.loading", "Loading...")
                : t("verifyIdentity.verifyButton", "Verify")}
            </MCButton>
          </MCFormWrapper>
        </div>
      </div>
    </MCDashboardContent>
  );
}

export default VerifyIdentityPage;
