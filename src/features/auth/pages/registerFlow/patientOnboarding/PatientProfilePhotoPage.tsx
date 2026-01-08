import AuthContentContainer from "@/features/auth/components/AuthContentContainer";
import { useTranslation } from "react-i18next";
import { useAppStore } from "@/stores/useAppStore";
import { useNavigate } from "react-router-dom";
import AuthFooterContainer from "@/features/auth/components/AuthFooterContainer";
import { useRef, useState } from "react";
import { User, Camera } from "lucide-react";
import MCProfileImageUploader from "@/shared/components/MCProfileImageUploader";

function PatientProfilePhotoPage() {
  const { t } = useTranslation("auth");
  const navigate = useNavigate();
  const setPatientOnboardingData = useAppStore(
    (state) => state.setPatientOnboardingData
  );
  const basicInfo = useAppStore((state) => state.patientOnboardingData);

  const [profile, setProfile] = useState<string>(
    typeof basicInfo?.urlImg === "string"
      ? basicInfo.urlImg
      : "/default-profile.png"
  );
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedImageSrc, setSelectedImageSrc] = useState<string>("");
  const profileInputRef = useRef<HTMLInputElement>(null);

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (ev) => {
        const imageUrl = ev.target?.result as string;
        setSelectedImageSrc(imageUrl);
        setIsModalOpen(true);
      };
      reader.readAsDataURL(file);
    }
    e.target.value = "";
  };

  const handleCropComplete = (croppedImage: string) => {
    setProfile(croppedImage);
    if (setPatientOnboardingData) {
      setPatientOnboardingData({
        name: basicInfo?.name ?? "",
        lastName: basicInfo?.lastName ?? "",
        identityDocument: basicInfo?.identityDocument ?? "",
        email: basicInfo?.email ?? "",
        password: basicInfo?.password ?? "",
        confirmPassword: basicInfo?.confirmPassword ?? "",
        urlImg: croppedImage,
      });
    }
    setIsModalOpen(false);
  };

  const handleContinue = () => {
    navigate("/auth/patient-onboarding/finish");
  };

  return (
    <AuthContentContainer
      title={t("profilePhotoPage.title")}
      subtitle={t("profilePhotoPage.subtitle")}
    >
      <div className="flex flex-col gap-6 items-center w-full max-w-md mx-auto">
        <h3 className="text-lg font-medium">
          {t("profilePhotoPage.photoLabel")}
        </h3>

        <div className="flex items-center gap-4">
          <div className="relative">
            <div
              className="relative w-40 h-40 rounded-full bg-gradient-to-br from-primary/10 to-primary/5 overflow-hidden cursor-pointer group flex items-center justify-center border-4 border-primary/10 hover:border-primary/20 transition-all duration-300 shadow-lg hover:shadow-xl"
              onClick={() => profileInputRef.current?.click()}
            >
              {profile === "/default-profile.png" ? (
                <User className="w-24 h-24 text-muted-foreground group-hover:text-primary transition-colors" />
              ) : (
                <img
                  src={profile}
                  alt={t("profilePhotoPage.photoLabel")}
                  className="w-full h-full object-cover"
                />
              )}

              <input
                ref={profileInputRef}
                type="file"
                accept="image/*"
                className="hidden"
                onChange={handleImageChange}
              />

              <div className="absolute inset-0 bg-black/50 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity rounded-full">
                <div className="flex flex-col items-center gap-2">
                  <Camera className="w-6 h-6 text-white" />
                  <span className="text-white font-medium text-sm text-center">
                    {profile === "/default-profile.png"
                      ? t("profilePhotoPage.addPhoto")
                      : t("profilePhotoPage.changeImage")}
                  </span>
                </div>
              </div>
            </div>

            {/* Camera icon indicator */}
            <div className="absolute bottom-2 right-2 w-10 h-10 bg-primary rounded-full flex items-center justify-center shadow-lg border-4 border-white">
              <Camera className="w-5 h-5 text-white" />
            </div>
          </div>
        </div>

        <p className="text-sm text-muted-foreground text-center max-w-sm">
          {t("profilePhotoPage.photoDescription")}
        </p>
      </div>

      {/* Image Crop Modal */}
      <MCProfileImageUploader
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        imageSrc={selectedImageSrc}
        aspectRatio={1}
        isCircular={true}
        onCropComplete={handleCropComplete}
        title={t("profilePhotoPage.cropTitle")}
      />

      <AuthFooterContainer
        continueButtonProps={{
          onClick: handleContinue,
        }}
        backButtonProps={{
          onClick() {
            navigate("/auth/patient-onboarding/set-credentials");
          },
        }}
      />
    </AuthContentContainer>
  );
}

export default PatientProfilePhotoPage;
