import MCButton from "@/shared/components/forms/MCButton";
import MCInput from "@/shared/components/forms/MCInput";
import MCFormWrapper from "@/shared/components/forms/MCFormWrapper";
import MCProfileImageUploader from "@/shared/components/MCProfileImageUploader";
import MCTextArea from "@/shared/components/forms/MCTextArea";
import MCPhoneInput from "@/shared/components/forms/MCPhoneInput";
import { useProfileStore } from "@/stores/useProfileStore";
import { MCUserAvatar } from "@/shared/navigation/userMenu/MCUserAvatar";
import { MCUserBanner } from "../../MCUserBanner";
import { Trash2 } from "lucide-react";
import { useTranslation } from "react-i18next";
import { MCDialogBase } from "@/shared/components/MCDialogBase";
import { useIsMobile } from "@/lib/hooks/useIsMobile";
import { useState, useRef, useMemo } from "react";
import { centerProfileSchema } from "@/schema/profile.schema";
import useTiposCentros from "@/features/onboarding/services/useTiposCentros";
import MCSelect from "@/shared/components/forms/MCSelect";
import { useAppStore } from "@/stores/useAppStore";
import { getUserAvatar } from "@/services/auth/auth.types";
import { toast } from "sonner";
import { base64ToFile } from "@/utils/base64ToFile";
import { patientService } from "../patient/services/patient.service";
import type { UpdateCenterProfileRequest } from "./services/center.types";
import centerService from "./services/center.services";

type CropType = "banner" | "profile";

interface GeneralInfortmationProps {
  onOpenChange: (open: boolean) => void;
}

function GeneralInfortmation({ onOpenChange }: GeneralInfortmationProps) {
  const { t } = useTranslation("center");
  const isMobile = useIsMobile();
  const centerProfile = useProfileStore((s) => s.centerProfile);
  const setCenterProfile = useProfileStore((s) => s.setCenterProfile);
  const user = useAppStore((state) => state.user);

  const [cropModalOpen, setCropModalOpen] = useState(false);
  const [cropType, setCropType] = useState<CropType>("profile");
  const [tempImage, setTempImage] = useState<string>("");

  const [bannerImage, setBannerImage] = useState<string>(user?.banner || "");
  const [profileImage, setProfileImage] = useState<string>(
    getUserAvatar(user) || "",
  );

  const bannerInputRef = useRef<HTMLInputElement>(null);
  const profileInputRef = useRef<HTMLInputElement>(null);

  const [showDeleteProfileModal, setShowDeleteProfileModal] = useState(false);
  const [showDeleteBannerModal, setShowDeleteBannerModal] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const originalProfileImage = getUserAvatar(user) || "";
  const originalBannerImage = user?.banner || "";

  const { data: tiposCentroOptions = [], isLoading: isLoadingCentro } =
    useTiposCentros();

  // ✅ FIX 1: Memoizar defaultValues para que RHF no se reinicialice en cada render
  const centerData = useMemo(
    () => ({
      role: "CENTER" as const,
      fullName: user?.centroSalud?.nombreComercial || "",
      email: user?.email || "",
      centerType: user?.centroSalud?.tipoCentroId?.toString() || "",
      phone: user?.telefono || "",
      taxId: user?.centroSalud?.rnc || "",
      website: user?.centroSalud?.sitio_web || "",
      address: user?.centroSalud?.ubicacionId?.toString() || "",
      description: user?.centroSalud?.descripcion || "",
    }),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [user?.id], // Solo recalcular cuando cambie el usuario, no en cada render
  );

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
    if (profileInputRef.current) profileInputRef.current.value = "";
    setShowDeleteProfileModal(false);
  };

  const handleRemoveBannerImage = () => {
    setBannerImage("");
    if (bannerInputRef.current) bannerInputRef.current.value = "";
    setShowDeleteBannerModal(false);
  };

  const handleSubmit = async (data: any) => {
    if (!user) {
      toast.error(t("profileForm.errorNoUser", "Usuario no encontrado"));
      return;
    }

    setIsSubmitting(true);
    try {
      // 1. Actualizar foto de perfil si cambió
      let newProfilePhotoUrl = originalProfileImage;
      const profileImageChanged =
        profileImage !== originalProfileImage && profileImage;

      if (profileImageChanged) {
        try {
          const photoFile = base64ToFile(profileImage, "profile-photo.jpg", "image/jpeg");
          const photoResponse = await patientService.updateProfilePhoto(photoFile);

          if (photoResponse.success && photoResponse.data.fotoPerfilUrl) {
            newProfilePhotoUrl = `${photoResponse.data.fotoPerfilUrl}?t=${Date.now()}`;
            setProfileImage(newProfilePhotoUrl);
            toast.success(t("profileForm.photoUpdated", "Foto de perfil actualizada exitosamente"));
          }
        } catch (photoError) {
          console.error("Error al actualizar foto de perfil:", photoError);
          toast.error(
            photoError instanceof Error
              ? photoError.message
              : t("profileForm.errorPhotoUpdate", "Error al actualizar la foto de perfil"),
          );
        }
      }

      // 2. Actualizar banner si cambió
      let newBannerUrl = originalBannerImage;
      const bannerImageChanged = bannerImage !== originalBannerImage && bannerImage;

      if (bannerImageChanged) {
        try {
          const bannerFile = base64ToFile(bannerImage, "banner.jpg", "image/jpeg");
          const bannerResponse = await patientService.updateBanner(bannerFile);

          if (bannerResponse.success && bannerResponse.data.bannerUrl) {
            newBannerUrl = `${bannerResponse.data.bannerUrl}?t=${Date.now()}`;
            setBannerImage(newBannerUrl);
            toast.success(t("profileForm.bannerUpdated", "Banner actualizado exitosamente"));
          }
        } catch (bannerError) {
          console.error("Error al actualizar banner:", bannerError);
          toast.error(
            bannerError instanceof Error
              ? bannerError.message
              : t("profileForm.errorBannerUpdate", "Error al actualizar el banner"),
          );
        }
      }

      // 3. Actualizar datos del centro
      // ✅ FIX 2: Tipado correcto — los campos opcionales usan undefined explícito
      const updateData: UpdateCenterProfileRequest = {
        nombreComercial: data.fullName,
        tipoCentroId: Number(data.centerType),
        telefono: data.phone,
        rnc: data.taxId,
        sitio_web: data.website,
        descripcion: data.description,
      };

      console.log(data);

      const response = await centerService.updateProfile(updateData);

      if (response.success) {
        const photoUrlWithCacheBust = newProfilePhotoUrl
          ? `${newProfilePhotoUrl}?t=${Date.now()}`
          : newProfilePhotoUrl;
        const bannerUrlWithCacheBust = newBannerUrl
          ? `${newBannerUrl}?t=${Date.now()}`
          : newBannerUrl;

        useAppStore.getState().updateUser({
          ...user,
          fotoPerfil: photoUrlWithCacheBust,
          banner: bannerUrlWithCacheBust || null,
          centroSalud: user.centroSalud
            ? {
              ...user.centroSalud,
              ...response.data,
              fotoPerfil: photoUrlWithCacheBust,
            }
            : null,
        });

        if (centerProfile) {
          setCenterProfile({
            ...centerProfile,
            ...data,
            avatar: newProfilePhotoUrl
              ? { url: newProfilePhotoUrl, type: "image", name: "avatar" }
              : undefined,
            banner: newBannerUrl
              ? { url: newBannerUrl, type: "image", name: "banner" }
              : undefined,
          });
        }

        toast.success(
          response.message ||
          t("profileForm.successUpdate", "Perfil actualizado exitosamente"),
        );
        onOpenChange(false);
      }
    } catch (error) {
      console.error("Error al actualizar perfil:", error);
      toast.error(
        error instanceof Error
          ? error.message
          : t("profileForm.errorUpdate", "Error al actualizar el perfil"),
      );
    } finally {
      setIsSubmitting(false);
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
        defaultValues={centerData}
        onSubmit={handleSubmit}
        className="flex flex-col gap-4"
      >
        <input type="hidden" name="role" value="CENTER" />
        <input type="hidden" name="email" value={user?.email || ""} />
        <input type="hidden" name="address" value={centerData?.address || ""} />

        {/* Banner Image */}
        <div className="flex flex-col gap-3">
          <h3 className={`${isMobile ? "text-base" : "text-lg"} font-medium`}>
            {t("profileForm.bannerImage")}
          </h3>
          <div
            className={`relative w-full ${isMobile ? "h-28" : "h-40"
              } bg-accent/30 rounded-2xl overflow-hidden group`}
          >
            <label htmlFor="banner-input" className="absolute inset-0 cursor-pointer">
              {bannerImage ? (
                <img
                  src={bannerImage}
                  alt="Banner"
                  className="w-full h-full object-cover"
                />
              ) : (
                <MCUserBanner
                  name={centerData?.fullName || t("profileForm.fullNamePlaceholder")}
                />
              )}
              <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                <span
                  className={`text-white font-semibold ${isMobile ? "text-sm" : "text-lg"
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
                className={`absolute top-2 right-3 bg-red-500 text-white rounded-full ${isMobile ? "w-7 h-7" : "w-9 h-9"
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
              className={`relative ${isMobile ? "w-24 h-24" : "w-32 h-32"
                } overflow-hidden group`}
            >
              <div className="w-full h-full rounded-full border-4">
                <label
                  htmlFor="profile-input"
                  className="absolute inset-0 cursor-pointer"
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
                        centerData?.fullName ||
                        t("profileForm.fullNamePlaceholder")
                      }
                      size={isMobile ? 96 : 128}
                      className="w-full h-full"
                    />
                  )}
                  <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity rounded-full">
                    <span
                      className={`text-white font-semibold ${isMobile ? "text-xs text-center px-2" : "text-sm"
                        }`}
                    >
                      {t("profileForm.changeImage")}
                    </span>
                  </div>
                </label>
                <input
                  id="profile-input"
                  ref={profileInputRef}
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={(e) => handleImageChange(e, "profile")}
                />
              </div>
              {profileImage && (
                <button
                  type="button"
                  className={`absolute top-0 right-0 bg-red-500 text-white rounded-full ${isMobile ? "w-7 h-7" : "w-9 h-9"
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
                className={`${isMobile ? "text-xs" : "text-sm"
                  } text-muted-foreground`}
              >
                {t("profileForm.recommended")}
              </p>
            </div>
          </div>
        </div>

        {/* ✅ FIX 4: Eliminado `value` de todos los MCInput — RHF gestiona
            el valor internamente a través de defaultValues. Pasar `value`
            directamente crea un conflicto controlled/uncontrolled. */}
        <MCInput
          name="fullName"
          label={t("profileForm.fullName")}
          type="text"
          placeholder={t("profileForm.fullNamePlaceholder")}
        />

        <MCSelect
          name="centerType"
          label={t("centerForm.centerType")}
          options={tiposCentroOptions}
          placeholder={
            isLoadingCentro
              ? t("centerForm.loading")
              : t("centerForm.centerTypePlaceholder")
          }
          disabled={isLoadingCentro}
        />

        <MCPhoneInput
          name="phone"
          label={t("profileForm.phone")}
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
          variant="cedula"
          placeholder={t("centerForm.taxIdPlaceholder")}
        />

        <MCTextArea
          name="description"
          label={t("centerForm.description")}
          placeholder={t("centerForm.descriptionPlaceholder")}
        />

        <div className={`flex ${isMobile ? "flex-col" : "flex-row"} gap-3 mt-4`}>
          <MCButton
            variant="primary"
            size="m"
            type="submit"
            disabled={isSubmitting}
            className={isMobile ? "w-full" : ""}
          >
            {isSubmitting
              ? t("profileForm.saving", "Guardando...")
              : t("profileForm.saveChanges")}
          </MCButton>
          <MCButton
            variant="secondary"
            size="m"
            type="button"
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