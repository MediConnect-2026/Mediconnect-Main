import { useEffect, useRef, useState } from "react";
import AuthContentContainer from "@/features/auth/components/AuthContentContainer";
import { useTranslation } from "react-i18next";
import { useAppStore } from "@/stores/useAppStore";
import { useNavigate } from "react-router-dom";
import AuthFooterContainer from "@/features/auth/components/AuthFooterContainer";
import { Camera } from "lucide-react";
import MCProfileImageUploader from "@/shared/components/MCProfileImageUploader";
import { useIsMobile } from "@/lib/hooks/useIsMobile";

const DEFAULT_PROFILE_IMAGE =
  "https://i.pinimg.com/736x/2c/bb/0e/2cbb0ee6c1c55b1041642128c902dadd.jpg";

function PatientProfilePhotoPage() {
  const { t } = useTranslation("auth");
  const navigate = useNavigate();
  const ismobile = useIsMobile();
  const setPatientOnboardingData = useAppStore(
    (state) => state.setPatientOnboardingData
  );
  const basicInfo = useAppStore((state) => state.patientOnboardingData);
  const isModalOpen = useAppStore((state) => state.modalOpen);
  const setIsModalOpen = useAppStore((state) => state.setModalOpen);
  const otpData = useAppStore((state) => state.otp);
  const selectedRole = useAppStore((state) => state.selectedRole);
  const setAccessPage = useAppStore((state) => state.setAccessPage);

  const [profile, setProfile] = useState<string>(
    typeof basicInfo?.urlImg === "string" && basicInfo.urlImg
      ? basicInfo.urlImg
      : DEFAULT_PROFILE_IMAGE
  );

  const [selectedImageSrc, setSelectedImageSrc] = useState<string>("");
  const profileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (!basicInfo?.password || !basicInfo?.confirmPassword) {
      console.log("Credentials not set, redirecting to password setup...");
      navigate("/auth/patient-onboarding/password-setup", { replace: true });
      return;
    }

    if (selectedRole !== "Patient") {
      console.log("Invalid role for patient onboarding, redirecting...");
      navigate("/auth/register", { replace: true });
    }
  }, [otpData, basicInfo, selectedRole, navigate]);

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
    if (setPatientOnboardingData && basicInfo) {
      setPatientOnboardingData({
        ...basicInfo,
        name: basicInfo.name,
        lastName: basicInfo.lastName,
        role: "Patient",
        identityDocument: basicInfo.identityDocument,
        email: basicInfo.email,
        password: basicInfo.password,
        confirmPassword: basicInfo.confirmPassword,
        urlImg: croppedImage,
      });
    }
    setIsModalOpen(false);
  };

  const handleContinue = () => {
    if (setPatientOnboardingData && basicInfo) {
      setPatientOnboardingData({
        ...basicInfo,
        urlImg: profile,
      });
    }
    setAccessPage(true, ["/auth/register-success"]);
    navigate("/auth/register-success", { replace: true });
  };

  return (
    <AuthContentContainer
      title={t("profilePhotoPage.title")}
      subtitle={t("profilePhotoPage.subtitle")}
    >
      <div className="flex flex-col gap-6 items-center w-full max-w-md mx-auto ">
        <div className={`flex items-center gap-4  ${ismobile ? "mb-4" : ""}`}>
          <div className="relative">
            <div
              className="relative w-70 h-70 rounded-full bg-gradient-to-br from-primary/10 to-primary/5 overflow-hidden cursor-pointer group flex items-center justify-center border-4 border-primary/10 hover:border-primary/20 transition-all duration-300 shadow-lg hover:shadow-xl"
              onClick={() => profileInputRef.current?.click()}
            >
              <img
                src={profile}
                alt={t("profilePhotoPage.photoLabel")}
                className="w-full h-full object-cover rounded-full"
              />

              <input
                ref={profileInputRef}
                type="file"
                accept="image/*"
                className="hidden"
                onChange={handleImageChange}
              />

              <div className="absolute inset-0 bg-primary/15 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity rounded-full">
                <div className="flex flex-col items-center gap-2">
                  <Camera className="w-6 h-6 text-white" />
                  <span className="text-white font-medium text-sm text-center">
                    {profile === DEFAULT_PROFILE_IMAGE
                      ? t("profilePhotoPage.addPhoto")
                      : t("profilePhotoPage.changeImage")}
                  </span>
                </div>
              </div>
            </div>

            {/* Camera icon indicator */}
            <div className="absolute bottom-3 right-3 w-14 h-14 bg-primary rounded-full flex items-center justify-center shadow-lg border-4 border-white">
              <Camera className="w-7 h-7 text-white" />
            </div>
          </div>
        </div>
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
            navigate("/auth/patient-onboarding/password-setup", {
              replace: true,
            });
          },
        }}
      />
    </AuthContentContainer>
  );
}

export default PatientProfilePhotoPage;
