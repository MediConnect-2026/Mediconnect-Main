import { useEffect } from "react";
import MCFormWrapper from "@/shared/components/forms/MCFormWrapper";
import AuthContentContainer from "@/features/auth/components/AuthContentContainer";
import MCInput from "@/shared/components/forms/MCInput";
import { useAppStore } from "@/stores/useAppStore";
import { useTranslation } from "react-i18next";
import AuthFooterContainer from "@/features/auth/components/AuthFooterContainer";
import { useNavigate } from "react-router-dom";
import { PatientBasicInfoSchema } from "@/schema/OnbordingSchema";
import type { PatientBasicInfoSchemaType } from "@/types/OnbordingTypes";

function PatientBasicInfoPage() {
  const { t } = useTranslation("auth");
  const navigate = useNavigate();

  const basicInfo = useAppStore((state) => state.patientOnboardingData);
  const setBasicInfo = useAppStore((state) => state.setPatientOnboardingData);
  const otpData = useAppStore((state) => state.otp);
  const selectedRole = useAppStore((state) => state.selectedRole);
  console.log(basicInfo);
  // Validar que exista OTP verificado antes de acceder a esta página
  useEffect(() => {
    if (!otpData || !basicInfo?.email) {
      console.log("No OTP or email found, redirecting to OTP verification...");
      navigate("/auth/otp-verification", { replace: true });
      return;
    }

    if (selectedRole !== "Patient") {
      console.log("Invalid role for patient onboarding, redirecting...");
      navigate("/auth/register", { replace: true });
    }
  }, [otpData, basicInfo?.email, selectedRole, navigate]);

  const handleSubmit = (data: PatientBasicInfoSchemaType) => {
    if (setBasicInfo && basicInfo) {
      setBasicInfo({
        ...basicInfo,
        name: data.name,
        lastName: data.lastName,
        role: "Patient",
        identityDocument: data.identityDocument,
        email: basicInfo.email,
        password: basicInfo.password ?? "",
        confirmPassword: basicInfo.confirmPassword ?? "",
        urlImg: basicInfo.urlImg ?? "",
      });
      navigate("/auth/patient-onboarding/password-setup", { replace: true });
    }
  };

  // Early return si no hay OTP o email
  if (!otpData || !basicInfo?.email) {
    return null;
  }

  return (
    <AuthContentContainer
      title={t("patientBasicInfo.title")}
      subtitle={t("patientBasicInfo.subtitle")}
    >
      <MCFormWrapper
        onSubmit={(data) => {
          handleSubmit(data);
        }}
        schema={PatientBasicInfoSchema((key) => t(key))}
        defaultValues={{
          name: basicInfo?.name || "",
          lastName: basicInfo?.lastName || "",
          identityDocument: basicInfo?.identityDocument || "",
        }}
        className="flex flex-col items-center w-full"
      >
        <div className="flex flex-col items-center w-full max-w-md mx-auto">
          <MCInput
            label={t("patientBasicInfo.nameLabel")}
            name="name"
            placeholder={t("patientBasicInfo.namePlaceholder")}
          />
          <MCInput
            label={t("patientBasicInfo.lastNameLabel")}
            name="lastName"
            placeholder={t("patientBasicInfo.lastNamePlaceholder")}
          />
          <MCInput
            label={t("patientBasicInfo.identityDocumentLabel")}
            name="identityDocument"
            placeholder={t("patientBasicInfo.identityDocumentPlaceholder")}
          />
        </div>
        <AuthFooterContainer
          backButtonProps={{
            onClick() {
              navigate("/auth/otp-verification", { replace: true });
            },
          }}
        />
      </MCFormWrapper>
    </AuthContentContainer>
  );
}

export default PatientBasicInfoPage;
