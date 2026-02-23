import MCImageUpload from "@/shared/components/MCAuthImageUpload";

import { useAppStore } from "@/stores/useAppStore";
import { useTranslation } from "react-i18next";

type GovernmentIdUploadProps = {
  children?: React.ReactNode;
};

export function GovernmentIdUploadTrigger({
  children,
  ...modalProps
}: GovernmentIdUploadProps) {
  const { t } = useTranslation("auth");
  const doctorOnboardingData = useAppStore(
    (state) => state.doctorOnboardingData,
  );

  const setDoctorOnboardingData = useAppStore(
    (state) => state.setDoctorOnboardingData,
  );

  const handleFileUpload = (fileUrl: string, fileType: string) => {
    if (!doctorOnboardingData || !setDoctorOnboardingData) return;

    setDoctorOnboardingData({
      ...doctorOnboardingData,
      identityDocumentFile: {
        url: fileUrl,
        type: fileType,
      },
    });
  };

  const handleFileRemove = () => {
    if (!doctorOnboardingData || !setDoctorOnboardingData) return;

    setDoctorOnboardingData({
      ...doctorOnboardingData,
      identityDocumentFile: undefined,
    });
  };

  return (
    <MCImageUpload
      title={t("governmentIdUpload.title")}
      description={t("governmentIdUpload.description")}
      imageSrc="https://res.cloudinary.com/dy2wtanhl/image/upload/v1771700315/ChatGPT_Image_21_feb_2026_02_58_05_p.m._paem0h.png"
      modalId="government-id"
      cropTitle={t("governmentIdUpload.cropTitle")}
      aspectRatio={1.6}
      isCircular={false}
      accept="image/*"
      onFileUpload={handleFileUpload}
      onFileRemove={handleFileRemove}
      uploadedFiles={
        doctorOnboardingData?.identityDocumentFile
          ? [doctorOnboardingData.identityDocumentFile]
          : []
      }
      {...modalProps}
    >
      {children}
    </MCImageUpload>
  );
}

export default GovernmentIdUploadTrigger;
