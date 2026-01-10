import MCImageUpload from "@/shared/components/MCAuthImageUpload";
import documentImg from "@/assets/doctorOnbording/documents.png";

type GovernmentIdUploadProps = {
  children?: React.ReactNode;
};

export function GovernmentIdUploadTrigger({
  children,
  ...modalProps
}: GovernmentIdUploadProps) {
  const handleFileUpload = (fileUrl: string, fileType: string) => {
    console.log("Archivo subido:", fileUrl, fileType);
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
      {...modalProps}
    >
      {children}
    </MCImageUpload>
  );
}

export default GovernmentIdUploadTrigger;
