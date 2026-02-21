import MCImageUpload from "@/shared/components/MCAuthImageUpload";

import { useAppStore } from "@/stores/useAppStore";
import { useTranslation } from "react-i18next";

type AdditionalCertificationsUploadProps = {
  children?: React.ReactNode;
};

export function AdditionalCertificationsUploadTrigger({
  children,
  ...modalProps
}: AdditionalCertificationsUploadProps) {
  const { t } = useTranslation("auth");
  const doctorOnboardingData = useAppStore(
    (state) => state.doctorOnboardingData,
  );

  const setDoctorOnboardingData = useAppStore(
    (state) => state.setDoctorOnboardingData,
  );

  const handleFileUpload = (fileUrl: string, fileType: string) => {
    if (!doctorOnboardingData || !setDoctorOnboardingData) return;

    const newCertification = {
      url: fileUrl,
      type: fileType,
    };

    setDoctorOnboardingData({
      ...doctorOnboardingData,
      certifications: [
        ...(doctorOnboardingData.certifications ?? []),
        newCertification,
      ],
    });
  };

  const handleFileRemove = (index: number) => {
    if (!doctorOnboardingData || !setDoctorOnboardingData) return;

    const updatedCertifications = (
      doctorOnboardingData.certifications ?? []
    ).filter((_, i) => i !== index);

    setDoctorOnboardingData({
      ...doctorOnboardingData,
      certifications: updatedCertifications,
    });
  };

  return (
    <MCImageUpload
      title={t("additionalCertificationsUpload.title")}
      description={t("additionalCertificationsUpload.description")}
      imageSrc="https://res.cloudinary.com/dy2wtanhl/image/upload/v1771699903/certificates_bbuaiq.png"
      modalId="additional-certifications"
      cropTitle={t("additionalCertificationsUpload.cropTitle")}
      aspectRatio={1.4}
      isCircular={false}
      accept="image/*,application/pdf"
      onFileUpload={handleFileUpload}
      onFileRemove={handleFileRemove}
      maxFiles={5}
      allowMultiple={false}
      uploadedFiles={doctorOnboardingData?.certifications ?? []}
      {...modalProps}
    >
      {children}
    </MCImageUpload>
  );
}

export default AdditionalCertificationsUploadTrigger;
