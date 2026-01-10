import MCImageUpload from "@/shared/components/MCAuthImageUpload";
import documentImg from "@/assets/doctorOnbording/documents.png";
import { useAppStore } from "@/stores/useAppStore";

type GovernmentIdUploadProps = {
  children?: React.ReactNode;
};

export function GovernmentIdUploadTrigger({
  children,
  ...modalProps
}: GovernmentIdUploadProps) {
  const doctorOnboardingData = useAppStore(
    (state) => state.doctorOnboardingData
  );

  const setDoctorOnboardingData = useAppStore(
    (state) => state.setDoctorOnboardingData
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
      title="Documento de Identificación"
      description="Sube una imagen clara y legible de tu documento de identidad (frontal y posterior, o pasaporte)."
      imageSrc={documentImg}
      modalId="government-id"
      cropTitle="Recorta tu documento"
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
