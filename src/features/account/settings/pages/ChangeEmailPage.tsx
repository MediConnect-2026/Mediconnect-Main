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
import { changeEmailSchema } from "@/schema/account.schema";
import { useIsMobile } from "@/lib/hooks/useIsMobile";
import { useTranslation } from "react-i18next";
import { authService } from "@/services/auth/auth.service";
import type { AxiosError } from "axios";
import type { ApiErrorResponse } from "@/services/api/client";

function ChangeEmailPage() {
  const { t } = useTranslation("common");
  const isMobile = useIsMobile();
  const navigate = useNavigate();
  const sessionUser = useAppStore((state) => state.user);
  const [isLoading, setIsLoading] = useState(false);

  const VerificationContext = useGlobalUIStore(
    (state) => state.verificationContext,
  );
  const VerificationContextStatus = useGlobalUIStore(
    (state) => state.verificationContextStatus,
  );
  const setVerificationContextStatus = useGlobalUIStore(
    (state) => state.setVerificationContextStatus,
  );
  const setVerificationContext = useGlobalUIStore(
    (state) => state.setVerificationContext,
  );
  const setToast = useGlobalUIStore((state) => state.setToast);
  const changeEmailData = useProfileStore((state) => state.changeEmailData);
  const setChangeEmailData = useProfileStore(
    (state) => state.setChangeEmailData,
  );

  useEffect(() => {
    if (!sessionUser) {
      navigate("/settings");
    }
  }, [sessionUser, navigate]);

  useEffect(() => {
    if (
      VerificationContext !== "CHANGE_EMAIL" ||
      VerificationContextStatus !== "VERIFIED"
    ) {
      navigate("/settings");
    }
  }, [VerificationContext, VerificationContextStatus, navigate]);

  // Usa t para el schema
  const newEmailSchema = changeEmailSchema(t).pick({ newEmail: true });

  const handleSubmit = async (data: { newEmail: string }) => {
    if (data.newEmail === sessionUser?.email) {
      setToast({
        message: t("changeEmail.sameEmailError", "The new email cannot be the same as the current one."),
        type: "error",
        open: true,
      });
      return;
    }

    setIsLoading(true);

    try {
      // Solicitar código OTP al nuevo email
      const response = await authService.solicitarCodigoEmail({
        email: data.newEmail,
      });

      if (response.success) {
        // Guardar el nuevo email en el store
        setChangeEmailData({
          ...changeEmailData,
          newEmail: data.newEmail,
          otp: changeEmailData?.otp ?? "",
        });
        setVerificationContextStatus("VERIFIED");
        setVerificationContext("CHANGE_EMAIL");

        setToast({
          message: t("changeEmail.otpSentSuccess", "Verification code sent to your new email.") || response.message,
          type: "success",
          open: true,
        });

        // Redirigir a la página de verificación de email
        navigate("/settings/verify-email");
      }
    } catch (error: any) {
      const axiosError = error as AxiosError<ApiErrorResponse>;
      const errorMessage = 
        axiosError?.response?.data?.message || 
        error?.message || 
        t("changeEmail.otpSendError", "Error sending verification code. Please try again.");

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
      <div
        className={`flex flex-col gap-6 items-center justify-center w-full mb-8 ${isMobile ? "px-4" : "px-0"}`}
      >
        <div
          className={`w-full flex flex-col gap-2 justify-center items-center ${isMobile ? "min-w-0" : "min-w-xl"}`}
        >
          <h1
            className={`font-medium mb-2 text-center ${isMobile ? "text-3xl" : "text-5xl"}`}
          >
            {t("changeEmail.title")}
          </h1>
          <p className="text-muted-foreground text-base max-w-md text-center">
            {t("changeEmail.description")}
          </p>
          <MCFormWrapper
            schema={newEmailSchema}
            onSubmit={handleSubmit}
            defaultValues={{
              newEmail: changeEmailData?.newEmail || "",
            }}
            className={`mt-4 flex flex-col items-center gap-4 h-full ${isMobile ? "w-full" : "w-md"}`}
          >
            <MCInput
              label={t("changeEmail.newEmailLabel")}
              name="newEmail"
              placeholder={t("changeEmail.newEmailPlaceholder")}
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
                ? t("changeEmail.sending", "Sending...")
                : t("changeEmail.changeButton")}
            </MCButton>
          </MCFormWrapper>
        </div>
      </div>
    </MCDashboardContent>
  );
}

export default ChangeEmailPage;
