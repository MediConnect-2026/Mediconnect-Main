import MCImageUpload from "@/shared/components/MCAuthImageUpload";
import documentImg from "@/assets/doctorOnbording/profile-picture.png";
import { useAppStore } from "@/stores/useAppStore";

type ProfilePhotoUploadProps = {
  children?: React.ReactNode;
};

export function ProfilePhotoUploadTrigger({
  children,
  ...modalProps
}: ProfilePhotoUploadProps) {
  const doctorOnboardingData = useAppStore(
    (state) => state.doctorOnboardingData
  );

  const setDoctorOnboardingData = useAppStore(
    (state) => state.setDoctorOnboardingData
  );

  const handleFileUpload = (fileUrl: string) => {
    if (!doctorOnboardingData || !setDoctorOnboardingData) return;

    setDoctorOnboardingData({
      ...doctorOnboardingData,
      urlImg: fileUrl,
    });
  };

  const handleFileRemove = () => {
    if (!doctorOnboardingData || !setDoctorOnboardingData) return;

    setDoctorOnboardingData({
      ...doctorOnboardingData,
      urlImg: "",
    });
  };

  return (
    <MCImageUpload
      title="Foto de perfil"
      description="Sube una foto clara y profesional para tu perfil."
      imageSrc={documentImg}
      modalId="profile-photo"
      cropTitle="Recorta tu foto de perfil"
      aspectRatio={1}
      isCircular={true}
      accept="image/*"
      onFileUpload={handleFileUpload}
      onFileRemove={handleFileRemove}
      uploadedFiles={
        doctorOnboardingData?.urlImg
          ? [
              {
                url: doctorOnboardingData.urlImg,
                type: "image",
                name: "Foto de perfil",
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
