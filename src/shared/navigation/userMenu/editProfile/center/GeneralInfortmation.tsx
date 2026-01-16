import MCButton from "@/shared/components/forms/MCButton";
import MCInput from "@/shared/components/forms/MCInput";
import MCFormWrapper from "@/shared/components/forms/MCFormWrapper";
import MCProfileImageUploader from "@/shared/components/MCProfileImageUploader";
import MCTextArea from "@/shared/components/forms/MCTextArea";
import { useProfileStore } from "@/stores/useProfileStore";
import { MCUserAvatar } from "@/shared/navigation/userMenu/MCUserAvatar";
import { MCUserBanner } from "../../MCUserBanner";
import { Trash2 } from "lucide-react";
import { useTranslation } from "react-i18next";
import { MCDialogBase } from "@/shared/components/MCDialogBase";
import { useIsMobile } from "@/lib/hooks/useIsMobile";
import { useState, useRef } from "react";
import { centerProfileSchema } from "@/schema/profile.schema";

type CropType = "banner" | "profile";

interface GeneralInfortmationProps {
  onOpenChange: (open: boolean) => void;
}

function GeneralInfortmation({ onOpenChange }: GeneralInfortmationProps) {
  const { t } = useTranslation("center");
  const isMobile = useIsMobile();
  const centerProfile = useProfileStore((s) => s.centerProfile);
  const setCenterProfile = useProfileStore((s) => s.setCenterProfile);

  const [cropModalOpen, setCropModalOpen] = useState(false);
  const [cropType, setCropType] = useState<CropType>("profile");
  const [tempImage, setTempImage] = useState<string>("");

  const [bannerImage, setBannerImage] = useState<string>(
    centerProfile?.banner?.url || ""
  );
  const [profileImage, setProfileImage] = useState<string>(
    centerProfile?.avatar?.url || ""
  );

  const bannerInputRef = useRef<HTMLInputElement>(null);
  const profileInputRef = useRef<HTMLInputElement>(null);

  const [showDeleteProfileModal, setShowDeleteProfileModal] = useState(false);
  const [showDeleteBannerModal, setShowDeleteBannerModal] = useState(false);

  const handleImageChange = (
    e: React.ChangeEvent<HTMLInputElement>,
    type: CropType
  ) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (ev) => {
        setTempImage(ev.target?.result as string);
        setCropType(type);
        setCropModalOpen(true);
      };
      reader.readAsDataURL(file);
    }
    e.target.value = "";
  };

  const handleCropComplete = (croppedImage: string) => {
    if (cropType === "banner") {
      setBannerImage(croppedImage);
    } else {
      setProfileImage(croppedImage);
    }
    setCropModalOpen(false);
  };

  const handleRemoveProfileImage = () => {
    setProfileImage("");
    if (profileInputRef.current) {
      profileInputRef.current.value = "";
    }
    setShowDeleteProfileModal(false);
  };

  const handleRemoveBannerImage = () => {
    setBannerImage("");
    if (bannerInputRef.current) {
      bannerInputRef.current.value = "";
    }
    setShowDeleteBannerModal(false);
  };

  const handleSubmit = (data: any) => {
    if (data && centerProfile) {
      setCenterProfile({
        ...centerProfile,
        ...data,
        avatar: profileImage
          ? { url: profileImage, type: "image", name: "avatar" }
          : undefined,
        banner: bannerImage
          ? { url: bannerImage, type: "image", name: "banner" }
          : undefined,
      });
      onOpenChange(false);
    }
  };

  return (
    <>
      <MCProfileImageUploader
        isOpen={cropModalOpen}
        onClose={() => setCropModalOpen(false)}
        imageSrc={tempImage}
        aspectRatio={cropType === "banner" ? 3.5 : 1}
        isCircular={cropType === "profile"}
        onCropComplete={handleCropComplete}
        title={
          cropType === "banner"
            ? t("profileForm.cropBanner")
            : t("profileForm.cropProfilePhoto")
        }
      />

      <MCDialogBase
        open={showDeleteProfileModal}
        onOpenChange={setShowDeleteProfileModal}
        title={t("profileForm.confirmDeleteTitle")}
        onConfirm={handleRemoveProfileImage}
        onSecondary={() => setShowDeleteProfileModal(false)}
        variant="warning"
        size="sm"
      >
        <p>{t("profileForm.confirmDeleteDescription")}</p>
      </MCDialogBase>

      <MCDialogBase
        open={showDeleteBannerModal}
        onOpenChange={setShowDeleteBannerModal}
        title={t("profileForm.confirmDeleteBannerTitle")}
        onConfirm={handleRemoveBannerImage}
        onSecondary={() => setShowDeleteBannerModal(false)}
        variant="warning"
        size="sm"
      >
        <p className="text-sm text-muted-foreground">
          {t("profileForm.confirmDeleteBannerDescription")}
        </p>
      </MCDialogBase>

      <MCFormWrapper
        schema={centerProfileSchema(t)}
        defaultValues={centerProfile || undefined}
        onSubmit={handleSubmit}
        className="flex flex-col gap-4"
      >
        {/* Banner Image */}
        <div className="flex flex-col gap-3">
          <h3 className={`${isMobile ? "text-base" : "text-lg"} font-medium`}>
            {t("profileForm.bannerImage")}
          </h3>
          <div
            className={`relative w-full ${
              isMobile ? "h-28" : "h-40"
            } bg-accent/30 rounded-2xl overflow-hidden group`}
          >
            <label
              className="absolute inset-0 cursor-pointer"
              onClick={() => bannerInputRef.current?.click()}
            >
              {bannerImage ? (
                <img
                  src={bannerImage}
                  alt="Banner"
                  className="w-full h-full object-cover"
                />
              ) : (
                <MCUserBanner
                  name={
                    centerProfile?.fullName ||
                    t("profileForm.fullNamePlaceholder")
                  }
                />
              )}
              <input
                ref={bannerInputRef}
                type="file"
                accept="image/*"
                className="hidden"
                onChange={(e) => handleImageChange(e, "banner")}
              />
              <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                <span
                  className={`text-white font-semibold ${
                    isMobile ? "text-sm" : "text-lg"
                  }`}
                >
                  {t("profileForm.changeImage")}
                </span>
              </div>
            </label>
            {bannerImage && (
              <button
                type="button"
                className={`absolute top-2 right-3 bg-red-500 text-white rounded-full ${
                  isMobile ? "w-7 h-7" : "w-9 h-9"
                } flex items-center justify-center shadow-lg hover:bg-red-600 transition-colors z-20 border-2 border-white`}
                onClick={(e) => {
                  e.stopPropagation();
                  setShowDeleteBannerModal(true);
                }}
                aria-label={t("profileForm.deleteBanner")}
              >
                <Trash2 className={`${isMobile ? "w-4 h-4" : "w-5 h-5"}`} />
              </button>
            )}
          </div>
        </div>

        {/* Profile Photo */}
        <div className="flex flex-col gap-3">
          <h3 className={`${isMobile ? "text-base" : "text-lg"} font-medium`}>
            {t("profileForm.profilePhoto")}
          </h3>
          <div className="flex items-center gap-4">
            <div
              className={`relative ${
                isMobile ? "w-24 h-24" : "w-32 h-32"
              } overflow-hidden group`}
            >
              <div className="w-full h-full rounded-full border-4">
                <label
                  className="absolute inset-0 cursor-pointer"
                  onClick={() => profileInputRef.current?.click()}
                >
                  {profileImage ? (
                    <img
                      src={profileImage}
                      alt="Perfil"
                      className="w-full h-full object-cover rounded-full"
                    />
                  ) : (
                    <MCUserAvatar
                      name={
                        centerProfile?.fullName ||
                        t("profileForm.fullNamePlaceholder")
                      }
                      size={isMobile ? 96 : 128}
                      className="w-full h-full"
                    />
                  )}
                  <input
                    ref={profileInputRef}
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={(e) => handleImageChange(e, "profile")}
                  />
                  <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity rounded-full">
                    <span
                      className={`text-white font-semibold ${
                        isMobile ? "text-xs text-center px-2" : "text-sm"
                      }`}
                    >
                      {t("profileForm.changeImage")}
                    </span>
                  </div>
                </label>
              </div>
              {profileImage && (
                <button
                  type="button"
                  className={`absolute top-0 right-0 bg-red-500 text-white rounded-full ${
                    isMobile ? "w-7 h-7" : "w-9 h-9"
                  } flex items-center justify-center shadow-lg hover:bg-red-600 transition-colors z-20 border-2 border-white`}
                  onClick={(e) => {
                    e.stopPropagation();
                    setShowDeleteProfileModal(true);
                  }}
                  aria-label={t("profileForm.deleteProfilePhoto")}
                >
                  <Trash2 className={`${isMobile ? "w-4 h-4" : "w-5 h-5"}`} />
                </button>
              )}
            </div>
            <div className="flex flex-col gap-2">
              <p
                className={`${
                  isMobile ? "text-xs" : "text-sm"
                } text-muted-foreground`}
              >
                {t("profileForm.recommended")}
              </p>
            </div>
          </div>
        </div>

        {/* Form Inputs */}
        <MCInput
          name="fullName"
          label={t("profileForm.fullName")}
          type="text"
          placeholder={t("profileForm.fullNamePlaceholder")}
        />

        <MCInput
          name="centerType"
          label={t("centerForm.centerType")}
          type="text"
          placeholder={t("centerForm.centerTypePlaceholder")}
        />

        <MCInput
          name="phone"
          label={t("profileForm.phone")}
          type="tel"
          placeholder={t("profileForm.phonePlaceholder")}
        />

        <MCInput
          name="website"
          label={t("centerForm.website")}
          type="url"
          placeholder={t("centerForm.websitePlaceholder")}
        />

        <MCInput
          name="taxId"
          label={t("centerForm.taxId")}
          type="text"
          placeholder={t("centerForm.taxIdPlaceholder")}
        />

        <MCInput
          name="address"
          label={t("centerForm.address")}
          type="text"
          placeholder={t("centerForm.addressPlaceholder")}
        />

        <MCTextArea
          name="description"
          label={t("centerForm.description")}
          placeholder={t("centerForm.descriptionPlaceholder")}
        />

        <div
          className={`flex ${isMobile ? "flex-col" : "flex-row"} gap-3 mt-4`}
        >
          <MCButton
            variant="primary"
            size="m"
            type="submit"
            className={isMobile ? "w-full" : ""}
          >
            {t("profileForm.saveChanges")}
          </MCButton>
          <MCButton
            variant="secondary"
            size="m"
            onClick={() => onOpenChange(false)}
            className={isMobile ? "w-full" : ""}
          >
            {t("profileForm.cancel")}
          </MCButton>
        </div>
      </MCFormWrapper>
    </>
  );
}

export default GeneralInfortmation;
