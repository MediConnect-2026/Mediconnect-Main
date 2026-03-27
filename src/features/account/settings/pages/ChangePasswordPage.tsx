import { useEffect, useState } from "react";
import MCDashboardContent from "@/shared/layout/MCDashboardContent";
import MCInput from "@/shared/components/forms/MCInput";
import MCFormWrapper from "@/shared/components/forms/MCFormWrapper";
import { useProfileStore } from "@/stores/useProfileStore";
import { useNavigate } from "react-router-dom";
import { useAppStore } from "@/stores/useAppStore";
import MCButton from "@/shared/components/forms/MCButton";
import { ArrowRight } from "lucide-react";
import { useGlobalUIStore } from "@/stores/useGlobalUIStore";
import { z } from "zod";
import { useTranslation } from "react-i18next";
import { useIsMobile } from "@/lib/hooks/useIsMobile";
import { authService } from "@/services/auth/auth.service";

function ChangePasswordPage() {
  const { t } = useTranslation("common");
  const { t: tAuth } = useTranslation("auth");
  const isMobile = useIsMobile();
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(false);
  const sessionUser = useAppStore((state) => state.user);

  const changePasswordData = useProfileStore(
    (state) => state.changePasswordData,
  );
  const clearChangePasswordData = useProfileStore(
    (state) => state.clearChangePasswordData,
  );
  const setToast = useGlobalUIStore((state) => state.setToast);
  const setVerificationContext = useGlobalUIStore(
    (state) => state.setVerificationContext,
  );
  const setVerificationContextStatus = useGlobalUIStore(
    (state) => state.setVerificationContextStatus,
  );

  const VerificationContext = useGlobalUIStore(
    (state) => state.verificationContext,
  );
  const VerificationContextStatus = useGlobalUIStore(
    (state) => state.verificationContextStatus,
  );
  
  // Redirige si el usuario no está autenticado
  useEffect(() => {
    if (!sessionUser) {
      navigate("/settings");
    }
  }, [sessionUser, navigate]);

  // Redirige si no está en el contexto correcto o no tiene token de recuperación
  useEffect(() => {
    if (
      VerificationContext !== "CHANGE_PASSWORD" ||
      VerificationContextStatus !== "VERIFIED" ||
      !changePasswordData?.recoveryToken
    ) {
      navigate("/settings");
    }
  }, [VerificationContext, VerificationContextStatus, changePasswordData, navigate]);

  // Schema Zod replicando las validaciones de CreatePasswordSchema
  const PASSWORD_SECURITY_REGEX = /^(?=.*[A-Z])(?=.*\d)(?=.*[^A-Za-z0-9]).{6,}$/;

  const passwordWithSecurity = (t: (key: string) => string) =>
    z
      .string()
      .min(
        8,
        t("validation.passwordMin") || "Password must be at least 8 characters",
      )
      .refine((val) => PASSWORD_SECURITY_REGEX.test(val), {
        message:
          t("validation.passwordSecurity") ||
          "Password must include at least one uppercase letter, one number, and one special character.",
      });

  const passwordSchema = z
    .object({
      newPassword: passwordWithSecurity(t),
      confirmNewPassword: passwordWithSecurity(t),
    })
    .superRefine((data, ctx) => {
      if (data.newPassword !== data.confirmNewPassword) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: t("validation.passwordsMustMatch") || "Passwords must match",
          path: ["confirmNewPassword"],
        });
      }
    });

  const handleSubmit = async (data: {
    confirmNewPassword: string;
    newPassword: string;
  }) => {
    if (!changePasswordData?.recoveryToken) {
      setToast({
        message: t("changePassword.noToken", "Recovery token not found. Please try again."),
        type: "error",
        open: true,
      });
      return;
    }

    setIsLoading(true);

    try {
      const response = await authService.cambiarPassword(
        {
          nuevaPassword: data.newPassword,
          confirmarPassword: data.confirmNewPassword,
        },
        changePasswordData.recoveryToken
      );

      if (response.success) {
        setToast({
          message: t("changePassword.successMessage", "Password changed successfully!"),
          type: "success",
          open: true,
        });

        // Limpiar datos y contexto
        clearChangePasswordData();
        setVerificationContext(null);
        setVerificationContextStatus(null);

        // Redirigir a settings
        navigate("/settings");
      }
    } catch (error: any) {
      const errorMessage = 
        t("changePassword.errorMessage", "Error changing password. Please try again.") || error.message || "Error changing password. Please try again.";
      
      setToast({
        message: errorMessage,
        type: "error",
        open: true,
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <MCDashboardContent mainWidth={isMobile ? "w-full" : "max-w-2xl"}>
      <div className={`flex flex-col gap-6 items-center justify-center w-full mb-8 ${isMobile ? "px-4" : "px-0"}`}>
        <div className={`w-full flex flex-col gap-2 justify-center items-center ${isMobile ? "min-w-0" : "min-w-xl"}`}>
          <h1 className={`font-medium mb-2 ${isMobile ? "text-3xl" : "text-5xl"}`}>
            {t("changePassword.title")}
          </h1>
          <p className="text-muted-foreground text-base max-w-md text-center">
            {t("changePassword.description")}
          </p>
          <MCFormWrapper
            schema={passwordSchema}
            onSubmit={handleSubmit}
            defaultValues={{
              newPassword: "",
              confirmNewPassword: "",
            }}
            className={`mt-4 flex flex-col items-center gap-4 h-full ${isMobile ? "w-full" : "w-md"}`}
          >
            <MCInput
              label={t("changePassword.newPasswordLabel")}
              name="newPassword"
              type="password"
              placeholder={t("changePassword.newPasswordPlaceholder")}
              className="w-full"
            />
            <MCInput
              label={t("changePassword.confirmPasswordLabel")}
              name="confirmNewPassword"
              type="password"
              placeholder={t("changePassword.confirmPasswordPlaceholder")}
              className="w-full"
            />
            <MCButton
              type="submit"
              className={isMobile ? "w-full" : "w-xs"}
              icon={<ArrowRight />}
              iconPosition="right"
              disabled={isLoading}
            >
              {isLoading
                ? tAuth("errors.loading", "Loading...")
                : t("changePassword.changeButton")}
            </MCButton>
          </MCFormWrapper>
        </div>
      </div>
    </MCDashboardContent>
  );
}

export default ChangePasswordPage;
