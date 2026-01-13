import MCImageUpload from "@/shared/components/MCAuthImageUpload";
import centerDocImg from "@/assets/centerOnboarding/center.png";
import { useAppStore } from "@/stores/useAppStore";
import React from "react";
import { useTranslation } from "react-i18next";

type HealthCertificateUploadProps = {
  children?: React.ReactNode;
};

export function HealthCertificateUpload({
  children,
  ...modalProps
}: HealthCertificateUploadProps) {
  const { t } = useTranslation("auth");
  const centerOnboardingData = useAppStore(
    (state) => state.centerOnboardingData
  );

  const setCenterOnboardingData = useAppStore(
    (state) => state.setCenterOnboardingData
  );

  const handleFileUpload = (fileUrl: string, fileType: string) => {
    if (!centerOnboardingData || !setCenterOnboardingData) return;

    setCenterOnboardingData({
      ...centerOnboardingData,
      healthCertificateFile: {
        url: fileUrl,
        type: fileType,
      },
    });
  };

  const handleFileRemove = () => {
    if (!centerOnboardingData || !setCenterOnboardingData) return;

    setCenterOnboardingData({
      ...centerOnboardingData,
      healthCertificateFile: undefined,
    });
  };

  return (
    <MCImageUpload
      title={t("healthCertificateUpload.title")}
      description={t("healthCertificateUpload.description")}
      imageSrc={centerDocImg}
      modalId="health-certificate"
      cropTitle={t("healthCertificateUpload.cropTitle")}
      aspectRatio={1.6}
      isCircular={false}
      accept="image/*"
      onFileUpload={handleFileUpload}
      onFileRemove={handleFileRemove}
      uploadedFiles={
        centerOnboardingData?.healthCertificateFile
          ? [centerOnboardingData.healthCertificateFile]
          : []
      }
      {...modalProps}
    >
      {children}
    </MCImageUpload>
  );
}

export default HealthCertificateUpload;
