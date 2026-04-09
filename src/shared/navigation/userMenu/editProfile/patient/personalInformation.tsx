import MCButton from "../../../../components/forms/MCButton";
import MCInput from "../../../../components/forms/MCInput";
import MCSelect from "../../../../components/forms/MCSelect";
import { useState, useRef } from "react";
import MCFormWrapper from "../../../../components/forms/MCFormWrapper";
import MCProfileImageUploader from "../../../../components/MCProfileImageUploader";
import { useProfileStore } from "@/stores/useProfileStore";
import { MCUserAvatar } from "@/shared/navigation/userMenu/MCUserAvatar";
import { MCUserBanner } from "../../MCUserBanner";
import { Trash2, Loader2 } from "lucide-react";
import { useTranslation } from "react-i18next";
import { MCDialogBase } from "@/shared/components/MCDialogBase";
import { useIsMobile } from "@/lib/hooks/useIsMobile";
import { getUserAvatar, getUserFullName } from "@/services/auth/auth.types";
import { useAppStore } from "@/stores/useAppStore";
import { patientService } from "./services/patient.service";
import type { UpdatePatientProfileRequest } from "./services/patient.types";
import { toast } from "sonner";
import { base64ToFile } from "@/utils/base64ToFile";
import { formatDominicanCedula } from "@/utils/identityDocument";

interface PersonalInformationProps {
  schema: any;
  onOpenChange: (open: boolean) => void;
}

type CropType = "banner" | "profile";

function PersonalInformation({
  schema,
  onOpenChange,
}: PersonalInformationProps) {
  const { t } = useTranslation("patient");
  const isMobile = useIsMobile();
  const patientProfile = useProfileStore((s) => s.patientProfile);
  const setPatientProfile = useProfileStore((s) => s.setPatientProfile);
  const user = useAppStore((state) => state.user);

  const [cropModalOpen, setCropModalOpen] = useState(false);
  const [cropType, setCropType] = useState<CropType>("profile");
  const [tempImage, setTempImage] = useState<string>("");

  const [bannerImage, setBannerImage] = useState<string>(
    user?.banner || "",
  );
  const [profileImage, setProfileImage] = useState<string>(
    getUserAvatar(user) || "",
  );

  const bannerInputRef = useRef<HTMLInputElement>(null);
  const profileInputRef = useRef<HTMLInputElement>(null);

  const [showDeleteProfileModal, setShowDeleteProfileModal] = useState(false);
  const [showDeleteBannerModal, setShowDeleteBannerModal] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Guardar la imagen original del perfil para detectar cambios
  const originalProfileImage = getUserAvatar(user) || "";

  // Guardar la imagen original del banner para detectar cambios
  const originalBannerImage = user?.banner || "";

  // Opciones de tipos de sangre
  const bloodTypeOptions = [
    { value: "A+", label: "A+" },
    { value: "A-", label: "A-" },
    { value: "B+", label: "B+" },
    { value: "B-", label: "B-" },
    { value: "AB+", label: "AB+" },
    { value: "AB-", label: "AB-" },
    { value: "O+", label: "O+" },
    { value: "O-", label: "O-" },
  ];

  // Obtener datos del paciente logueado
  // birthDate debe estar en formato YYYY-MM-DD para inputs tipo date
  let birthDateValue = "";
  if (user?.paciente?.fechaNacimiento) {
    const fecha = user.paciente.fechaNacimiento;
    // Si es un string tipo YYYY-MM-DD, usarlo directamente
    if (/^\d{4}-\d{2}-\d{2}$/.test(fecha)) {
      birthDateValue = fecha;
    } else {
      // Si es un string de otro formato o un timestamp, intentar convertir
      const dateObj = new Date(fecha);
      if (!isNaN(dateObj.getTime())) {
        birthDateValue = dateObj.toISOString().split('T')[0];
      }
    }
  }
  const patientData = {
    role: "PATIENT" as const,
    fullName: getUserFullName(user) || "",
    nombre: user?.paciente?.nombre || "",
    apellido: user?.paciente?.apellido || "",
    identityDocument: user?.paciente?.numero_documento_identificacion || "",
    email: user?.email || "",
    birthDate: birthDateValue,
    height: user?.paciente?.altura?.toString() || "",
    weight: user?.paciente?.peso?.toString() || "",
    bloodType: user?.paciente?.tipoSangre || "",
  };

  const formattedIdentityDocument = formatDominicanCedula(
    user?.paciente?.numero_documento_identificacion
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

  const handleSubmit = async (data: any) => {
    if (!user) {
      toast.error(t("profileForm.errorNoUser", "Usuario no encontrado"));
      return;
    }

    setIsSubmitting(true);
    console.log("Datos a enviar al servicio:", data);
    try {
      // 1. Si la foto de perfil cambió, actualizarla primero
      let newProfilePhotoUrl = originalProfileImage;
      const profileImageChanged = profileImage !== originalProfileImage && profileImage;

      if (profileImageChanged) {
        try {
          // Convertir la imagen base64 a File
          const photoFile = base64ToFile(
            profileImage,
            'profile-photo.jpg',
            'image/jpeg'
          );

          // Llamar al servicio para actualizar la foto de perfil
          const photoResponse = await patientService.updateProfilePhoto(photoFile);

          if (photoResponse.success && photoResponse.data.fotoPerfilUrl) {
            // Agregar timestamp para evitar caché del navegador
            newProfilePhotoUrl = `${photoResponse.data.fotoPerfilUrl}?t=${Date.now()}`;
            
            // Actualizar también el estado local para preview inmediata
            setProfileImage(newProfilePhotoUrl);
            
            toast.success(
              t("profileForm.photoUpdated", "Foto de perfil actualizada exitosamente")
            );
          }
        } catch (photoError) {
          console.error("Error al actualizar foto de perfil:", photoError);
          const photoErrorMessage = photoError instanceof Error 
            ? photoError.message 
            : t("profileForm.errorPhotoUpdate", "Error al actualizar la foto de perfil");
          toast.error(photoErrorMessage);
          // Continuar con la actualización de datos personales aunque falle la foto
        }
      }

      // 2. Si el banner cambió, actualizarlo
      let newBannerUrl = originalBannerImage;
      const bannerImageChanged = bannerImage !== originalBannerImage && bannerImage;

      if (bannerImageChanged) {
        try {
          // Convertir la imagen base64 a File
          const bannerFile = base64ToFile(
            bannerImage,
            'banner.jpg',
            'image/jpeg'
          );

          // Llamar al servicio para actualizar el banner
          const bannerResponse = await patientService.updateBanner(bannerFile);

          if (bannerResponse.success && bannerResponse.data.bannerUrl) {
            // Agregar timestamp para evitar caché del navegador
            newBannerUrl = `${bannerResponse.data.bannerUrl}?t=${Date.now()}`;
            
            // Actualizar también el estado local para preview inmediata
            setBannerImage(newBannerUrl);
            
            toast.success(
              t("profileForm.bannerUpdated", "Banner actualizado exitosamente")
            );
          }
        } catch (bannerError) {
          console.error("Error al actualizar banner:", bannerError);
          const bannerErrorMessage = bannerError instanceof Error 
            ? bannerError.message 
            : t("profileForm.errorBannerUpdate", "Error al actualizar el banner");
          toast.error(bannerErrorMessage);
          // Continuar con la actualización de datos personales aunque falle el banner
        }
      }

      // 3. Actualizar datos personales (altura, peso, tipo de sangre, fecha de nacimiento)
      const updateData: UpdatePatientProfileRequest = {
        altura: data.height ? Number(data.height) : undefined,
        peso: data.weight ? Number(data.weight) : undefined,
        fechaNacimiento: data.birthDate || undefined,
        tipoSangre: data.bloodType || undefined,
      };

      // Llamar al servicio para actualizar el perfil (el token se agrega automáticamente)
      const response = await patientService.updateProfile(updateData);

      if (response.success) {
        // Agregar timestamp para evitar caché del navegador
        const photoUrlWithCacheBust = newProfilePhotoUrl 
          ? `${newProfilePhotoUrl}?t=${Date.now()}` 
          : newProfilePhotoUrl;

        const bannerUrlWithCacheBust = newBannerUrl 
          ? `${newBannerUrl}?t=${Date.now()}` 
          : newBannerUrl;

        // Actualizar el usuario en el store con los nuevos datos
        useAppStore.getState().updateUser({
          ...user,
          fotoPerfil: photoUrlWithCacheBust,
          banner: bannerUrlWithCacheBust ? bannerUrlWithCacheBust : null,
          paciente: user.paciente ? {
            ...user.paciente,
            ...response.data,
            fotoPerfil: photoUrlWithCacheBust, // Actualizar también en paciente
          } : null,
        });

        // Guardar avatar y banner en el store de perfil (cache local)
        if (patientProfile) {
          setPatientProfile({
            ...patientProfile,
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
          response.message || t("profileForm.successUpdate", "Perfil actualizado exitosamente")
        );
        onOpenChange(false);
      }
    } catch (error) {
      console.error("Error al actualizar perfil:", error);
      const errorMessage = error instanceof Error 
        ? error.message 
        : t("profileForm.errorUpdate", "Error al actualizar el perfil");
      toast.error(errorMessage);
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
        schema={schema}
        defaultValues={patientData}
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
                <MCUserBanner name={getUserFullName(user) || ""} />
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
                      name={getUserFullName(user) || ""}
                      size={isMobile ? 96 : 128}
                      className="w-full h-full"
                    />
                  )}
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
          key={`identity-document-${formattedIdentityDocument}`}
          name="identityDocument"
          label={t("profileForm.identityDocument")}
          variant="cedula"
          placeholder={t("profileForm.identityDocumentPlaceholder")}
          value={formattedIdentityDocument}
          disabled
        />

        <MCInput
          name="email"
          label={t("profileForm.email")}
          type="email"
          placeholder={t("profileForm.emailPlaceholder")}
          disabled
        />

        <MCInput
          name="birthDate"
          label={t("profileForm.birthDate")}
          type="date"
          placeholder={t("profileForm.birthDatePlaceholder")}
        />

        <MCInput
          name="height"
          label={t("profileForm.height")}
          type="number"
          placeholder={t("profileForm.heightPlaceholder")}
        />

        <MCInput
          name="weight"
          label={t("profileForm.weight")}
          type="number"
          placeholder={t("profileForm.weightPlaceholder")}
        />

        <MCSelect
          name="bloodType"
          label={t("profileForm.bloodType")}
          placeholder={t("profileForm.bloodTypePlaceholder")}
          options={bloodTypeOptions}
        />

        <div
          className={`flex ${isMobile ? "flex-col" : "flex-row"} gap-3 mt-4`}
        >
          <MCButton
            variant="primary"
            size="m"
            type="submit"
            disabled={isSubmitting}
            className={isMobile ? "w-full" : ""}
          >
            {isSubmitting ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                {t("profileForm.saving", "Guardando...")}
              </>
            ) : (
              t("profileForm.saveChanges")
            )}
          </MCButton>
          <MCButton
            variant="secondary"
            size="m"
            onClick={() => onOpenChange(false)}
            disabled={isSubmitting}
            className={isMobile ? "w-full" : ""}
          >
            {t("profileForm.cancel")}
          </MCButton>
        </div>
      </MCFormWrapper>
    </>
  );
}

export default PersonalInformation;
