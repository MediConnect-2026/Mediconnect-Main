import MCImageUpload from "@/shared/components/MCAuthImageUpload";
import academicImg from "@/assets/doctorOnbording/studies.png";

type AcademicDegreeUploadProps = {
  children?: React.ReactNode;
};

export function AcademicDegreeUploadTrigger({
  children,
  ...modalProps
}: AcademicDegreeUploadProps) {
  const handleFileUpload = (fileUrl: string, fileType: string) => {
    console.log("Archivo subido:", fileUrl, fileType);
  };

  return (
    <MCImageUpload
      title="Título académico"
      description="Sube una imagen o PDF claro de tu título académico. Esto ayuda a verificar tus credenciales y mejora la confianza en la plataforma."
      imageSrc={academicImg}
      modalId="academic-degree"
      cropTitle="Recorta tu título académico"
      aspectRatio={1.4}
      isCircular={false}
      accept="image/*,application/pdf"
      onFileUpload={handleFileUpload}
      {...modalProps}
    >
      {children}
    </MCImageUpload>
  );
}

export default AcademicDegreeUploadTrigger;
