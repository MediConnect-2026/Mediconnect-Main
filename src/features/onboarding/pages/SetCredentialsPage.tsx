import { useEffect } from "react";
import AuthContentContainer from "@/features/auth/components/AuthContentContainer";
import MCFormWrapper from "@/shared/components/forms/MCFormWrapper";
import MCInput from "@/shared/components/forms/MCInput";
import { CreatePasswordSchema } from "@/schema/OnbordingSchema";
import { useTranslation } from "react-i18next";
import { useAppStore } from "@/stores/useAppStore";
import { useNavigate } from "react-router-dom";
import AuthFooterContainer from "@/features/auth/components/AuthFooterContainer";
import type { PatientCreatePasswordSchemaType } from "@/types/OnbordingTypes";

function SetCredentialsPage() {
  const { t } = useTranslation("auth");
  const navigate = useNavigate();

  const selectedRole = useAppStore((state) => state.selectedRole);
  const basicInfo = useAppStore((state) => state.patientOnboardingData);
  const setPatientOnboardingData = useAppStore(
    (state) => state.setPatientOnboardingData
  );
  const otpData = useAppStore((state) => state.otp);
  const doctorBasicInfo = useAppStore((state) => state.doctorOnboardingData);
  const setDoctorOnboardingData = useAppStore(
    (state) => state.setDoctorOnboardingData
  );

  useEffect(() => {
    // Validar OTP
    if (!otpData) {
      navigate("/auth/otp-verification", { replace: true });
      return;
    }

    if (selectedRole === "Patient") {
      if (
        !basicInfo?.name ||
        !basicInfo?.lastName ||
        !basicInfo?.identityDocument ||
        !basicInfo?.email
      ) {
        navigate("/auth/patient-onboarding/basic-info", { replace: true });
        return;
      }
    }

    if (selectedRole === "Doctor") {
      if (
        !doctorBasicInfo?.name ||
        !doctorBasicInfo?.lastName ||
        !doctorBasicInfo?.identityDocument ||
        !doctorBasicInfo?.email
      ) {
        navigate("/auth/doctor-onboarding/basic-info", { replace: true });
        return;
      }
    }

    if (!selectedRole) {
      navigate("/auth/register", { replace: true });
    }
  }, [otpData, basicInfo, doctorBasicInfo, selectedRole, navigate]);

  const handleSubmit = (data: PatientCreatePasswordSchemaType) => {
    if (selectedRole === "Patient" && setPatientOnboardingData && basicInfo) {
      setPatientOnboardingData({
        ...basicInfo,
        password: data.password,
        confirmPassword: data.confirmPassword,
        role: "Patient",
        name: basicInfo.name,
        lastName: basicInfo.lastName,
        identityDocument: basicInfo.identityDocument,
        email: basicInfo.email,
        urlImg: basicInfo.urlImg ?? "",
      });
      navigate("/auth/patient-onboarding/profile-photo", { replace: true });
    }

    if (
      selectedRole === "Doctor" &&
      setDoctorOnboardingData &&
      doctorBasicInfo
    ) {
      setDoctorOnboardingData({
        ...doctorBasicInfo,
        password: data.password,
        confirmPassword: data.confirmPassword,
        role: "Doctor",
        name: doctorBasicInfo.name,
        lastName: doctorBasicInfo.lastName,
        identityDocument: doctorBasicInfo.identityDocument,
        email: doctorBasicInfo.email,
        urlImg: doctorBasicInfo.urlImg ?? "",
      });
      navigate("/auth/doctor-onboarding/profile-photo", { replace: true });
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
        schema={CreatePasswordSchema((key) => t(key))}
        defaultValues={{
          password: basicInfo?.password || "",
          confirmPassword: basicInfo?.confirmPassword || "",
        }}
        className="flex flex-col items-center w-full"
      >
        <div className="flex flex-col items-center w-full max-w-md mx-auto">
          <MCInput
            label={t("setCredentialsPage.passwordLabel")}
            name="password"
            type="password"
            placeholder={t("setCredentialsPage.passwordPlaceholder")}
          />
          <MCInput
            label={t("setCredentialsPage.confirmPasswordLabel")}
            name="confirmPassword"
            type="password"
            placeholder={t("setCredentialsPage.confirmPasswordPlaceholder")}
          />
        </div>
        <AuthFooterContainer
          backButtonProps={{
            onClick() {
              navigate("/auth/patient-onboarding/basic-info", {
                replace: true,
              });
            },
          }}
        />
      </MCFormWrapper>
    </AuthContentContainer>
  );
}

export default SetCredentialsPage;
