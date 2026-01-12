import { useEffect } from "react";
import MCFormWrapper from "@/shared/components/forms/MCFormWrapper";
import AuthContentContainer from "@/features/auth/components/AuthContentContainer";
import MCInput from "@/shared/components/forms/MCInput";
import { ForgotPasswordSchema } from "@/schema/AuthSchema";
import { useAppStore } from "@/stores/useAppStore";
import { useTranslation } from "react-i18next";
import AuthFooterContainer from "@/features/auth/components/AuthFooterContainer";
import { useNavigate } from "react-router-dom";

function RegEmailVerificationPage() {
  const { t } = useTranslation("auth");
  const navigate = useNavigate();

  const selectedRole = useAppStore((state) => state.selectedRole);
  const patientBasicInfo = useAppStore((state) => state.patientOnboardingData);
  const setPatientEmail = useAppStore(
    (state) => state.setPatientOnboardingData
  );
  const doctorBasicInfo = useAppStore((state) => state.doctorOnboardingData);
  const setEmailDoctor = useAppStore((state) => state.setDoctorOnboardingData);
  const centerBasicInfo = useAppStore((state) => state.centerOnboardingData);
  const setEmailCenter = useAppStore((state) => state.setCenterOnboardingData);
  const setVerifyEmail = useAppStore((state) => state.setVerifyEmail);
  useEffect(() => {
    if (!selectedRole) {
      console.log("No role selected, redirecting...");
      navigate("/auth/register", { replace: true });
    }
  }, [selectedRole, navigate]);

  const handlesubmit = (data: { email: string }) => {
    setVerifyEmail({ email: data.email, verified: true }); // <-- Guarda email y verified: false

    if (selectedRole === "Doctor" && setEmailDoctor && doctorBasicInfo) {
      setEmailDoctor({
        ...doctorBasicInfo,
        email: data.email ?? "",
      });
      navigate("/auth/otp-verification", { replace: true });
    }

    if (selectedRole === "Patient" && setPatientEmail && patientBasicInfo) {
      setPatientEmail({
        ...patientBasicInfo,
        email: data.email ?? "",
      });
      navigate("/auth/otp-verification", { replace: true });
    }

    if (selectedRole === "Center" && setEmailCenter && centerBasicInfo) {
      setEmailCenter({
        ...centerBasicInfo,
        email: data.email ?? "",
      });
      navigate("/auth/otp-verification", { replace: true });
    }
  };

  if (!selectedRole) {
    return null;
  }

  return (
    <AuthContentContainer
      title={t("registerEmailVerifyPage.title")}
      subtitle={t("registerEmailVerifyPage.subtitle")}
    >
      <MCFormWrapper
        schema={ForgotPasswordSchema((key) => t(key))}
        onSubmit={(data) => {
          handlesubmit(data);
        }}
        defaultValues={{
          email:
            selectedRole === "Patient"
              ? patientBasicInfo?.email || ""
              : selectedRole === "Doctor"
              ? doctorBasicInfo?.email || ""
              : centerBasicInfo?.email || "",
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
          <p className="text-center mt-2 w-full">
            {selectedRole === "Patient"
              ? patientBasicInfo?.email
              : doctorBasicInfo?.email}
          </p>
        </div>
        <AuthFooterContainer
          backButtonProps={{
            onClick: () => {
              navigate("/auth/register");
            },
          }}
        />
      </MCFormWrapper>
      <p>{selectedRole}</p>
    </AuthContentContainer>
  );
}

export default RegEmailVerificationPage;
