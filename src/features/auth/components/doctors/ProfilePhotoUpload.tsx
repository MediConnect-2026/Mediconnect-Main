import MCImageUpload from "@/shared/components/MCAuthImageUpload";
import documentImg from "@/assets/doctorOnbording/profile-picture.png";

type ProfilePhotoUploadProps = {
  children?: React.ReactNode;
};

export function ProfilePhotoUploadTrigger({
  children,
  ...modalProps
}: ProfilePhotoUploadProps) {
  const handleFileUpload = (fileUrl: string, fileType: string) => {
    console.log("Archivo subido:", fileUrl, fileType);
  };

  return (
    <MCImageUpload
      title="Foto de perfil"
      description="Sube una foto clara y profesional para tu perfil. Esto ayuda a que otros usuarios te reconozcan fácilmente y mejora la confianza en la plataforma."
      imageSrc={documentImg}
      modalId="profile-photo"
      cropTitle="Recorta tu foto de perfil"
      aspectRatio={1}
      isCircular={true}
      accept="image/*"
      onFileUpload={handleFileUpload}
      {...modalProps}
    >
      {children}
    </MCImageUpload>
  );
}

export default ProfilePhotoUploadTrigger;
