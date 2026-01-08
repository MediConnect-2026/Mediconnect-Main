import AuthContentContainer from "@/features/auth/components/AuthContentContainer";
import MCFormWrapper from "@/shared/components/forms/MCFormWrapper";
import MCInput from "@/shared/components/forms/MCInput";
import { PatientCreatePasswordSchema } from "@/schema/OnbordingSchema";
import { useTranslation } from "react-i18next";
import { useAppStore } from "@/stores/useAppStore";
import { useNavigate } from "react-router-dom";
import AuthFooterContainer from "@/features/auth/components/AuthFooterContainer";
import type { PatientCreatePasswordSchemaType } from "@/types/OnbordingTypes";
function SetCredentialsPage() {
  const { t } = useTranslation("auth");
  const navigate = useNavigate();
  const selectedRole = useAppStore((state) => state.selectedRole);

  const setPatientOnboardingData = useAppStore(
    (state) => state.setPatientOnboardingData
  );

  const basicInfo = useAppStore((state) => state.patientOnboardingData);

  const handleSubmit = (data: PatientCreatePasswordSchemaType) => {
    navigate("/auth/patient-onboarding/profile-photo");
    if (selectedRole === "Patient" && setPatientOnboardingData) {
      setPatientOnboardingData({
        ...basicInfo,
        password: data.password,
        confirmPassword: data.confirmPassword,
        name: basicInfo!.name || "",
        lastName: basicInfo!.lastName ?? "",
        identityDocument: basicInfo!.identityDocument || "",
        email: basicInfo!.email ?? "",

        urlImg: basicInfo?.urlImg || undefined,
      });
    }
  };

  return (
    <AuthContentContainer
      title={t("setCredentialsPage.title")}
      subtitle={t("setCredentialsPage.subtitle")}
    >
      <MCFormWrapper
        onSubmit={(data) => {
          handleSubmit(data);
        }}
        schema={PatientCreatePasswordSchema((key) => t(key))}
        defaultValues={{
          password: basicInfo!.password || "",
          confirmPassword: basicInfo!.confirmPassword || "",
        }}
        className="flex flex-col items-center w-full"
      >
        <div className="flex flex-col items-center w-full max-w-md mx-auto">
          <MCInput
            label={t("setCredentialsPage.passwordLabel")}
            name="password"
            type="password"
            placeholder={t("setCredentialsPage.passwordPlaceholder")}
            required
          />
          <MCInput
            label={t("setCredentialsPage.confirmPasswordLabel")}
            name="confirmPassword"
            type="password"
            placeholder={t("setCredentialsPage.confirmPasswordPlaceholder")}
            required
          />
        </div>{" "}
        <AuthFooterContainer
          backButtonProps={{
            onClick() {
              navigate("/auth/patient-onboarding/basic-info");
            },
          }}
        ></AuthFooterContainer>
      </MCFormWrapper>
    </AuthContentContainer>
  );
}

export default SetCredentialsPage;
