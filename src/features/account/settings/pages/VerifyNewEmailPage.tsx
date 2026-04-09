import { useEffect, useState } from "react";
import MCDashboardContent from "@/shared/layout/MCDashboardContent";
import MCFormWrapper from "@/shared/components/forms/MCFormWrapper";
import MCOtpInput from "@/shared/components/forms/MCOtpInput";
import MCButton from "@/shared/components/forms/MCButton";
import { ArrowRight } from "lucide-react";
import { useProfileStore } from "@/stores/useProfileStore";
import { useNavigate } from "react-router-dom";
import { useAppStore } from "@/stores/useAppStore";
import { useGlobalUIStore } from "@/stores/useGlobalUIStore";
import { changeEmailSchema } from "@/schema/account.schema";
import { useTranslation } from "react-i18next";
import { useIsMobile } from "@/lib/hooks/useIsMobile";
import { authService } from "@/services/auth/auth.service";
import type { AxiosError } from "axios";
import type { ApiErrorResponse } from "@/services/api/client";

function VerifyNewEmailPage() {
  const { t } = useTranslation("common");
  const { t: tAuth } = useTranslation("auth");
  const isMobile = useIsMobile();
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(false);

  const sessionUser = useAppStore((state) => state.user);
  const changeEmailData = useProfileStore((state) => state.changeEmailData);
  const setChangeEmailData = useProfileStore(
    (state) => state.setChangeEmailData,
  );
  const changePasswordData = useProfileStore(
    (state) => state.changePasswordData,
  );
  const setChangePasswordData = useProfileStore(
    (state) => state.setChangePasswordData,
  );
  const VerificationContext = useGlobalUIStore(
    (state) => state.verificationContext,
  );
  const VerificationContextStatus = useGlobalUIStore(
    (state) => state.verificationContextStatus,
  );
  const setToast = useGlobalUIStore((state) => state.setToast);

  // Determinar el email de destino según el contexto
  const isChangePassword = VerificationContext === "CHANGE_PASSWORD";
  const targetEmail = isChangePassword 
    ? sessionUser?.email 
    : changeEmailData?.newEmail;

  // Usa t para el schema
  const otpSchema = changeEmailSchema(t).pick({ otp: true });

  useEffect(() => {
    if (isChangePassword) {
      // Validación para cambio de contraseña
      if (!sessionUser?.email || VerificationContextStatus !== "VERIFIED") {
        navigate("/settings");
      }
    } else {
      // Validación para cambio de email
      if (
        VerificationContext !== "CHANGE_EMAIL" ||
        !changeEmailData?.newEmail ||
        VerificationContextStatus !== "VERIFIED"
      ) {
        navigate("/settings");
      }
    }
  }, [
    VerificationContext,
    changeEmailData,
    VerificationContextStatus,
    sessionUser,
    isChangePassword,
    navigate,
  ]);

  const handleSubmit = async (data: { otp: string }) => {
    if (!targetEmail) {
      setToast({
        message: t("verifyEmail.emailNotFound", "Email not found"),
        type: "error",
        open: true,
      });
      return;
    }

    setIsLoading(true);

    try {
      if (isChangePassword) {
        // Validar código OTP para cambio de contraseña
        const response = await authService.validarCodigoPassword({
          email: targetEmail,
          codigo: data.otp,
        });

        if (response.success) {
          setToast({
            message: tAuth("forgotPassword.successTitle", "Email verified successfully!"),
            type: "success",
            open: true,
          });

          // Guardar el token de recuperación en el store
          setChangePasswordData({
            newPassword: changePasswordData?.newPassword || "",
            confirmNewPassword: changePasswordData?.confirmNewPassword || "",
            recoveryToken: response.data.token,
            otp: data.otp,
          });

          // Redirigir a la página de cambio de contraseña
          navigate("/settings/change-password");
        }
      } else {
        // Lógica para cambio de email
        const verifyAccountPassword = useProfileStore.getState().verifyAccountPassword?.password;
        
        if (!verifyAccountPassword) {
          setToast({
            message: t("verifyEmail.passwordNotFound", "Password verification required. Please restart the process."),
            type: "error",
            open: true,
          });
          navigate("/settings");
          return;
        }

        if (!changeEmailData?.newEmail) {
          setToast({
            message: t("verifyEmail.newEmailNotFound", "New email not found. Please restart the process."),
            type: "error",
            open: true,
          });
          navigate("/settings");
          return;
        }

        // PASO 1: Validar el código OTP primero
        const validationResponse = await authService.validarCodigoEmail({
          email: changeEmailData.newEmail,
          codigo: data.otp,
        });

        if (!validationResponse.success) {
          setToast({
            message: t("verifyEmail.invalidCode", "Invalid verification code.") || validationResponse.message,
            type: "error",
            open: true,
          });
          return;
        }

        // PASO 2: Si el código es válido, cambiar el email
        const response = await authService.cambiarEmail({
          nuevoEmail: changeEmailData.newEmail,
          password: verifyAccountPassword,
        });

        if (response.success) {
          setToast({
            message: t("verifyEmail.emailChangedSuccess", "Email changed successfully!") || response.message,
            type: "success",
            open: true,
          });

          // Actualizar el email en el store del usuario
          const updateUser = useAppStore.getState().updateUser;
          if (sessionUser) {
            updateUser({
              ...sessionUser,
              email: changeEmailData.newEmail,
            });
          }

          // Limpiar los datos del cambio de email
          setChangeEmailData({
            newEmail: "",
            otp: "",
          });

          // Redirigir a settings
          navigate("/settings");
        }
      }
    } catch (error: any) {
      const axiosError = error as AxiosError<ApiErrorResponse>;
      
      // Mensajes de error específicos
      if (axiosError?.response?.data?.message?.toLowerCase().includes("expirado")) {
        setToast({
          message: tAuth("registerEmailVerifyPage.errors.otpExpired", "The code has expired. Please request a new one."),
          type: "error",
          open: true,
        });
      } else if (axiosError?.response?.data?.message?.toLowerCase().includes("inválido")) {
        setToast({
          message: tAuth("registerEmailVerifyPage.errors.invalidOtp", "Invalid code. Please verify and try again."),
          type: "error",
          open: true,
        });
      } else if (axiosError?.response?.data?.message?.toLowerCase().includes("contraseña incorrecta")) {
        setToast({
          message: t("verifyEmail.incorrectPassword", "Incorrect password. Please restart the process."),
          type: "error",
          open: true,
        });
      } else if (axiosError?.response?.data?.message?.toLowerCase().includes("ya está registrado")) {
        setToast({
          message: t("verifyEmail.emailAlreadyRegistered", "This email is already registered."),
          type: "error",
          open: true,
        });
      } else {
        const errorMessage = 
          axiosError?.response?.data?.message || 
          error?.message || 
          t("verifyEmail.error", "Error validating code. Please try again.");
        
        setToast({
          message: errorMessage,
          type: "error",
          open: true,
        });
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleResendOtp = async () => {
    if (!targetEmail) return;

    try {
      if (isChangePassword) {
        await authService.solicitarCodigoPassword({ email: targetEmail });
        setToast({
          message: t("verifyEmail.resendSuccess", "Code resent successfully"),
          type: "success",
          open: true,
        });
      } else {
        // Reenviar código para cambio de email
        await authService.solicitarCodigoEmail({ email: targetEmail });
        setToast({
          message: t("verifyEmail.resendSuccess", "Code resent successfully"),
          type: "success",
          open: true,
        });
      }
    } catch (error) {
      setToast({
        message: t("verifyEmail.resendError", "Error resending code"),
        type: "error",
        open: true,
      });
    }
  };

  return (
    <MCDashboardContent mainWidth={isMobile ? "w-full" : "max-w-2xl"}>
      <div
        className={`flex flex-col gap-6 items-center justify-center w-full mb-8 ${isMobile ? "px-4" : "px-0"}`}
      >
        <div
          className={`w-full flex flex-col gap-2 justify-center items-center ${isMobile ? "min-w-0" : "min-w-xl"}`}
        >
          <h1
            className={`font-medium mb-2 text-center ${isMobile ? "text-3xl" : "text-5xl"}`}
          >
            {isChangePassword 
              ? t("verifyOtp.passwordTitle", "Verify your identity")
              : t("verifyEmail.title", "Verify your new email")}
          </h1>
          <p className="text-muted-foreground text-base max-w-md text-center">
            {isChangePassword
              ? t(
                  "verifyOtp.passwordInstructions",
                  "Enter the verification code sent to"
                )
              : t(
                  "verifyEmail.instructions",
                  "Enter the verification code sent to"
                )}{" "}
            <b>{targetEmail}</b>
          </p>
          <MCFormWrapper
            schema={otpSchema}
            onSubmit={handleSubmit}
            defaultValues={{
              otp: changeEmailData?.otp || changePasswordData?.otp || "",
            }}
            className={`mt-4 flex flex-col items-center gap-4 h-full ${isMobile ? "w-full" : "w-md"}`}
          >
            <div className="flex flex-col items-center w-full max-w-md mx-auto">
              <MCOtpInput />
            </div>
            <div className="w-full max-w-md m-4 flex flex-col items-center gap-4">
              <p className="text-md text-primary/80 mb-2 text-center">
                <span className="font-semibold text-primary">
                  {
                    t(
                      "verifyEmail.tip",
                      "¿No recibiste el código?:Revisa tu carpeta de spam o espera unos minutos.",
                    ).split(":")[0]
                  }
                  :
                </span>{" "}
                {
                  t(
                    "verifyEmail.tip",
                    "¿No recibiste el código?:Revisa tu carpeta de spam o espera unos minutos.",
                  ).split(":")[1]
                }
              </p>
              <MCButton
                variant="tercero"
                size="ml"
                onClick={handleResendOtp}
                className={isMobile ? "w-full" : ""}
                disabled={isLoading}
              >
                {t("verifyEmail.resend", "Reenviar código")}
              </MCButton>
            </div>
            <MCButton
              type="submit"
              className={isMobile ? "w-full" : "w-xs"}
              icon={<ArrowRight />}
              iconPosition="right"
              disabled={isLoading}
            >
              {isLoading
                ? tAuth("errors.loading", "Loading...")
                : t("verifyEmail.verify", "Verificar")}
            </MCButton>
          </MCFormWrapper>
        </div>
      </div>
    </MCDashboardContent>
  );
}

export default VerifyNewEmailPage;
