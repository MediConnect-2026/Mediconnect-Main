import MCImageUpload from "@/shared/components/MCAuthImageUpload";
import Certifciades from "@/assets/doctorOnbording/certificates.png";
import { useAppStore } from "@/stores/useAppStore";

type AdditionalCertificationsUploadProps = {
  children?: React.ReactNode;
};

export function AdditionalCertificationsUploadTrigger({
  children,
  ...modalProps
}: AdditionalCertificationsUploadProps) {
  const doctorOnboardingData = useAppStore(
    (state) => state.doctorOnboardingData
  );

  const setDoctorOnboardingData = useAppStore(
    (state) => state.setDoctorOnboardingData
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
      title="Certificaciones adicionales"
      description="Adjunta también tus certificaciones profesionales, asegurándote de que todos los archivos sean visibles y estén en formato PDF o imagen."
      imageSrc={Certifciades}
      modalId="additional-certifications"
      cropTitle="Recorta tu certificación"
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
