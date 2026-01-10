import MCImageUpload from "@/shared/components/MCAuthImageUpload";
import Certifciades from "@/assets/doctorOnbording/certificates.png";

type AdditionalCertificationsUploadProps = {
  children?: React.ReactNode;
};

export function AdditionalCertificationsUploadTrigger({
  children,
  ...modalProps
}: AdditionalCertificationsUploadProps) {
  const handleFileUpload = (fileUrl: string, fileType: string) => {
    console.log("Archivo subido:", fileUrl, fileType);
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
      maxFiles={5}
      allowMultiple={true}
      {...modalProps}
    >
      {children}
    </MCImageUpload>
  );
}

export default AdditionalCertificationsUploadTrigger;
