import MCImageUpload from "@/shared/components/MCAuthImageUpload";
// import centerImg from "@/assets/centerOnboarding/centerpfp.png";
import { useAppStore } from "@/stores/useAppStore";
import React from "react";
import { useTranslation } from "react-i18next";

type ProfilePhotoUploadProps = {
  children?: React.ReactNode;
};

export function ProfilePhotoUpload({
  children,
  ...modalProps
}: ProfilePhotoUploadProps) {
  const { t } = useTranslation("auth");
  const centerOnboardingData = useAppStore(
    (state) => state.centerOnboardingData,
  );

  const setCenterOnboardingData = useAppStore(
    (state) => state.setCenterOnboardingData,
  );

  const handleFileUpload = (fileUrl: string) => {
    if (!centerOnboardingData || !setCenterOnboardingData) return;

    setCenterOnboardingData({
      ...centerOnboardingData,
      urlImg: {
        url: fileUrl,
        type: "image",
        name: t("centerProfilePhotoUpload.title"),
      },
    });
  };

  const handleFileRemove = () => {
    if (!centerOnboardingData || !setCenterOnboardingData) return;

    setCenterOnboardingData({
      ...centerOnboardingData,
      urlImg: undefined,
    });
  };

  return (
    <MCImageUpload
      title={t("centerProfilePhotoUpload.title")}
      description={t("centerProfilePhotoUpload.description")}
      imageSrc="https://res.cloudinary.com/dy2wtanhl/image/upload/v1771700522/centerpfp_ub2xr2.png"
      modalId="center-profile-photo"
      cropTitle={t("centerProfilePhotoUpload.cropTitle")}
      aspectRatio={1}
      isCircular={true}
      accept="image/*"
      onFileUpload={handleFileUpload}
      onFileRemove={handleFileRemove}
      uploadedFiles={
        centerOnboardingData?.urlImg
          ? [
              {
                url: centerOnboardingData.urlImg.url,
                type: centerOnboardingData.urlImg.type,
                name: centerOnboardingData.urlImg.name,
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

export default ProfilePhotoUpload;
