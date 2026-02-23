import MCImageUpload from "@/shared/components/MCAuthImageUpload";

import { useAppStore } from "@/stores/useAppStore";
import { useTranslation } from "react-i18next";

type ProfilePhotoUploadProps = {
  children?: React.ReactNode;
};

export function ProfilePhotoUploadTrigger({
  children,
  ...modalProps
}: ProfilePhotoUploadProps) {
  const { t } = useTranslation("auth");
  const doctorOnboardingData = useAppStore(
    (state) => state.doctorOnboardingData,
  );

  const setDoctorOnboardingData = useAppStore(
    (state) => state.setDoctorOnboardingData,
  );

  const handleFileUpload = (fileUrl: string) => {
    if (!doctorOnboardingData || !setDoctorOnboardingData) return;

    setDoctorOnboardingData({
      ...doctorOnboardingData,
      urlImg: {
        url: fileUrl,
        type: "image",
        name: t("profilePhotoUpload.title"),
      },
    });
  };

  const handleFileRemove = () => {
    if (!doctorOnboardingData || !setDoctorOnboardingData) return;

    setDoctorOnboardingData({
      ...doctorOnboardingData,
      urlImg: undefined,
    });
  };

  return (
    <MCImageUpload
      title={t("profilePhotoUpload.title")}
      description={t("profilePhotoUpload.description")}
      imageSrc="https://res.cloudinary.com/dy2wtanhl/image/upload/v1771699897/profile-picture_t3ezpd.png"
      modalId="profile-photo"
      cropTitle={t("profilePhotoUpload.cropTitle")}
      aspectRatio={1}
      isCircular={true}
      accept="image/*"
      onFileUpload={handleFileUpload}
      onFileRemove={handleFileRemove}
      uploadedFiles={
        doctorOnboardingData?.urlImg
          ? [
              {
                url: doctorOnboardingData.urlImg.url,
                type: doctorOnboardingData.urlImg.type,
                name: doctorOnboardingData.urlImg.name,
              },
            ]
          : []
      }
      {...modalProps}
    >
      {children}
    </MCImageUpload>
  );
}

export default ProfilePhotoUploadTrigger;
