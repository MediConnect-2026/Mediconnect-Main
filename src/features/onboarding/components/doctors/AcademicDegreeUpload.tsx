import MCImageUpload from "@/shared/components/MCAuthImageUpload";
// import academicImg from "@/assets/doctorOnbording/studies.png";
import { useAppStore } from "@/stores/useAppStore";
import { useTranslation } from "react-i18next";

type AcademicDegreeUploadProps = {
  children?: React.ReactNode;
};

export function AcademicDegreeUploadTrigger({
  children,
  ...modalProps
}: AcademicDegreeUploadProps) {
  const { t } = useTranslation("auth");
  const doctorOnboardingData = useAppStore(
    (state) => state.doctorOnboardingData,
  );

  const setDoctorOnboardingData = useAppStore(
    (state) => state.setDoctorOnboardingData,
  );

  const handleFileUpload = (fileUrl: string, fileType: string) => {
    if (!doctorOnboardingData || !setDoctorOnboardingData) return;

    setDoctorOnboardingData({
      ...doctorOnboardingData,
      academicTitle: {
        url: fileUrl,
        type: fileType,
      },
    });
  };

  const handleFileRemove = () => {
    if (!doctorOnboardingData || !setDoctorOnboardingData) return;

    setDoctorOnboardingData({
      ...doctorOnboardingData,
      academicTitle: undefined,
    });
  };

  return (
    <MCImageUpload
      title={t("academicDegreeUpload.title")}
      description={t("academicDegreeUpload.description")}
      imageSrc="https://res.cloudinary.com/dy2wtanhl/image/upload/v1771699898/studies_tuhyqv.png"
      modalId="academic-degree"
      cropTitle={t("academicDegreeUpload.cropTitle")}
      aspectRatio={1.4}
      isCircular={false}
      accept="image/*,application/pdf"
      onFileUpload={handleFileUpload}
      onFileRemove={handleFileRemove}
      uploadedFiles={
        doctorOnboardingData?.academicTitle
          ? [doctorOnboardingData.academicTitle]
          : []
      }
      {...modalProps}
    >
      {children}
    </MCImageUpload>
  );
}

export default AcademicDegreeUploadTrigger;
