import MCButton from "@/shared/components/forms/MCButton";
import MCInput from "@/shared/components/forms/MCInput";
import MCFormWrapper from "@/shared/components/forms/MCFormWrapper";
import MCProfileImageUploader from "@/shared/components/MCProfileImageUploader";
import MCSelect from "@/shared/components/forms/MCSelect";
import MCTextArea from "@/shared/components/forms/MCTextArea";
import { useProfileStore } from "@/stores/useProfileStore";
import { MCUserAvatar } from "@/shared/navigation/userMenu/MCUserAvatar";
import { MCUserBanner } from "../../MCUserBanner";
import { Trash2 } from "lucide-react";
import { useTranslation } from "react-i18next";
import { MCDialogBase } from "@/shared/components/MCDialogBase";
import { useIsMobile } from "@/lib/hooks/useIsMobile";
import { useState, useRef, useEffect, useMemo } from "react";
import { doctorProfileSchema } from "@/schema/profile.schema";
import type { UseFormReturn } from "react-hook-form";
import MCPhoneInput from "@/shared/components/forms/MCPhoneInput";
import { useAppStore } from "@/stores/useAppStore";
import { getUserAvatar, getUserFullName } from "@/services/auth/auth.types";
type CropType = "banner" | "profile";

interface GeneralInformationProps {
  onOpenChange: (open: boolean) => void;
}

function GeneralInformation({ onOpenChange }: GeneralInformationProps) {
  const { t } = useTranslation("doctor");
  const isMobile = useIsMobile();
  const doctorProfile = useProfileStore((s) => s.doctorProfile);
  const setDoctorProfile = useProfileStore((s) => s.setDoctorProfile);
  const user = useAppStore((s) => s.user);

  const [cropModalOpen, setCropModalOpen] = useState(false);
  const [cropType, setCropType] = useState<CropType>("profile");
  const [tempImage, setTempImage] = useState<string>("");

  console.log("Doctor Profile in GeneralInformation:", user);
  
  // Mapear los datos del doctor a los valores del formulario
  const defaultValues = useMemo(
    () =>
      user?.doctor
        ? {
            role: "DOCTOR" as const,
            fullName: `${user.doctor.nombre} ${user.doctor.apellido}`.trim(),
            specialty:
              user.doctor.especialidades?.find((e) => e.es_principal)
                ?.especialidades.nombre || "",
            secondarySpecialties:
              user.doctor.especialidades
                ?.filter((e) => !e.es_principal)
                .map((e) => e.especialidades.nombre) || [],
            email: user.email || "",
            phone: user.doctor.telefono || "",
            yearsExperience: user.doctor.anosExperiencia?.toString() || "",
            licenseNumber: user.doctor.exequatur || "",
            identityDocument: user.doctor.numeroDocumentoIdentificacion || "",
            nationality: user.doctor.nacionalidad || "",
            birthDate: user.doctor.fechaNacimiento || "",
            biography: user.doctor.biografia || "",
          }
        : undefined,
    [user]
  );

  const [bannerImage, setBannerImage] = useState<string>(
    user?.doctor?.banner?.url || user?.banner?.url || "",
  );
  const [profileImage, setProfileImage] = useState<string>(
    user?.doctor?.fotoPerfil || user?.fotoPerfil || "",
  );

  const bannerInputRef = useRef<HTMLInputElement>(null);
  const profileInputRef = useRef<HTMLInputElement>(null);
  const formRef = useRef<UseFormReturn<any> | null>(null);

  const [showDeleteProfileModal, setShowDeleteProfileModal] = useState(false);
  const [showDeleteBannerModal, setShowDeleteBannerModal] = useState(false);

  // Resetear el formulario cuando cambien los defaultValues
  useEffect(() => {
    if (formRef.current && defaultValues) {
      formRef.current.reset(defaultValues);
    }
  }, [defaultValues]);

  const handleImageChange = (
    e: React.ChangeEvent<HTMLInputElement>,
    type: CropType,
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
    if (data && doctorProfile) {
      setDoctorProfile({
        ...doctorProfile,
        ...data,
        yearsExperience:
          data.yearsExperience !== undefined && data.yearsExperience !== ""
            ? Number(data.yearsExperience)
            : undefined,
        secondarySpecialties: Array.isArray(data.secondarySpecialties)
          ? data.secondarySpecialties
          : data.secondarySpecialties
            ? [data.secondarySpecialties]
            : [],
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

  console.log("Default Values for GeneralInformation form:", defaultValues);
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
        schema={doctorProfileSchema(t)}
        defaultValues={defaultValues}
        onSubmit={handleSubmit}
        className="flex flex-col gap-4"
        formRef={formRef}
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
              htmlFor="banner-input"
              className="absolute inset-0 cursor-pointer"
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
                    getUserFullName(user) ||
                    t("profileForm.fullNamePlaceholder")
                  }
                />
              )}
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
            <input
              id="banner-input"
              ref={bannerInputRef}
              type="file"
              accept="image/*"
              className="hidden"
              onChange={(e) => handleImageChange(e, "banner")}
            />
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
                        getUserAvatar(user) ||
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
          name="specialty"
          label={t("profileForm.specialty")}
          type="text"
          placeholder={t("profileForm.specialtyPlaceholder")}
        />

        <MCSelect
          name="secondarySpecialties"
          label={t("profileForm.secondarySpecialties")}
          placeholder={t("profileForm.secondarySpecialtiesPlaceholder")}
          options={[
            { value: "cardiology", label: t("specialties.cardiology") },
            { value: "dermatology", label: t("specialties.dermatology") },
            { value: "neurology", label: t("specialties.neurology") },
            // ...agrega más opciones según tus necesidades...
          ]}
          multiple
        />

        <MCInput
          name="email"
          label={t("profileForm.email")}
          type="email"
          placeholder={t("profileForm.emailPlaceholder")}
        />

        <MCPhoneInput
          name="phone"
          label={t("profileForm.phone")}
          placeholder={t("profileForm.phonePlaceholder")}
        />

        <MCInput
          name="yearsExperience"
          label={t("profileForm.yearsExperience")}
          type="number"
          placeholder={t("profileForm.yearsExperiencePlaceholder")}
        />

        <MCInput
          name="licenseNumber"
          label={t("profileForm.licenseNumber")}
          type="text"
          placeholder={t("profileForm.licenseNumberPlaceholder")}
        />

        <MCInput
          name="identityDocument"
          label={t("profileForm.identityDocument")}
          variant="cedula"
          placeholder={t("profileForm.identityDocumentPlaceholder")}
        />

        <MCInput
          name="nationality"
          label={t("profileForm.nationality")}
          type="text"
          placeholder={t("profileForm.nationalityPlaceholder")}
        />

        <MCInput
          name="birthDate"
          label={t("profileForm.birthDate")}
          type="date"
          placeholder={t("profileForm.birthDatePlaceholder")}
        />

        <MCTextArea
          name="biography"
          label={t("profileForm.biography")}
          placeholder={t("profileForm.biographyPlaceholder")}
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

export default GeneralInformation;
