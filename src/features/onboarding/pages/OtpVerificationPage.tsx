import { useEffect } from "react";
import MCFormWrapper from "@/shared/components/forms/MCFormWrapper";
import AuthContentContainer from "@/features/auth//components/AuthContentContainer";
import MCOtpInput from "@/shared/components/forms/MCOtpInput";
import { OtpSchema } from "@/schema/AuthSchema";
import { useAppStore } from "@/stores/useAppStore";
import { useTranslation } from "react-i18next";
import AuthFooterContainer from "@/features/auth/components/AuthFooterContainer";
import MCButton from "@/shared/components/forms/MCButton";
import { useNavigate } from "react-router-dom";

function OtpVerificationPage() {
  const { t } = useTranslation("auth");
  const navigate = useNavigate();
  const otpData = useAppStore((state) => state.otp);
  const setOtp = useAppStore((state) => state.setOtp);
  const selectedRole = useAppStore((state) => state.selectedRole);
  const basicInfo = useAppStore((state) => state.patientOnboardingData);
  const doctorBasicInfo = useAppStore((state) => state.doctorOnboardingData);
  const verifyEmail = useAppStore((state) => state.verifyEmail);
  const confirmedEmail =
    selectedRole === "Patient"
      ? basicInfo?.email
      : selectedRole === "Doctor"
      ? doctorBasicInfo?.email
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

  const handleSubmit = (data: { otp: string }) => {
    console.log("OTP Data:", data);

    setOtp(data.otp);
    verifyEmail.verified = true;
    verifyEmail.email = confirmedEmail ?? "";
    setTimeout(() => {
      if (selectedRole === "Patient") {
        navigate("/auth/patient-onboarding/basic-info", { replace: true });
      } else if (selectedRole === "Doctor") {
        navigate("/auth/doctor-onboarding", { replace: true });
      } else if (selectedRole === "Center") {
        navigate("/auth/center-onboarding", { replace: true });
      } else {
        // Si no hay rol, redirigir al registro
        navigate("/auth/register", { replace: true });
      }
    }, 0);
  };

  const handleResendOtp = () => {
    // TODO: Implementar lógica de reenvío de OTP
    console.log("Resending OTP to:", confirmedEmail);
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
          />

          {/* Debug info - remover en producción */}
          {otpData && (
            <p className="text-center mt-2 w-full text-sm text-gray-500">
              OTP actual: {otpData}
            </p>
          )}
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
          >
            {t("verifyEmail.resend")}
          </MCButton>
        </div>

        <AuthFooterContainer
          backButtonProps={{
            onClick: () => {
              navigate("/auth/reg-email-verification", { replace: true });
            },
          }}
        />
      </MCFormWrapper>
    </AuthContentContainer>
  );
}

export default OtpVerificationPage;
