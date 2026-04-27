import MCButton from "@/shared/components/forms/MCButton";
import MCInput from "@/shared/components/forms/MCInput";
import MCFormWrapper from "@/shared/components/forms/MCFormWrapper";
import MCProfileImageUploader from "@/shared/components/MCProfileImageUploader";
import MCSelect from "@/shared/components/forms/MCSelect";
import MCTextArea from "@/shared/components/forms/MCTextArea";
import { useProfileStore } from "@/stores/useProfileStore";
import { MCUserAvatar } from "@/shared/navigation/userMenu/MCUserAvatar";
import { MCUserBanner } from "../../MCUserBanner";
import { Trash2, Loader2 } from "lucide-react";
import { useTranslation } from "react-i18next";
import { MCDialogBase } from "@/shared/components/MCDialogBase";
import { useIsMobile } from "@/lib/hooks/useIsMobile";
import { useState, useRef, useEffect, useMemo } from "react";
import { doctorProfileSchema } from "@/schema/profile.schema";
import type { UseFormReturn } from "react-hook-form";
import MCPhoneInput from "@/shared/components/forms/MCPhoneInput";
import { useAppStore } from "@/stores/useAppStore";
import { getUserAvatar, getUserFullName } from "@/services/auth/auth.types";
import { especialidadesService } from "@/features/onboarding/services/especialidades.service";
import type { SelectOption } from "@/features/onboarding/services/especialidades.types";
import i18n from "@/i18n/config";
import { doctorService } from "./services/doctor.service";
import type { UpdateDoctorProfileRequest } from "./services/doctor.types";
import { toast } from "sonner";
import { base64ToFile } from "@/utils/base64ToFile";
import { formatPhone } from "@/utils/phoneFormat";
import { formatDominicanCedula } from "@/utils/identityDocument";
import { useQueryClient } from "@tanstack/react-query";
import { QUERY_KEYS } from "@/lib/react-query/config";
type CropType = "banner" | "profile";

interface GeneralInformationProps {
  onOpenChange: (open: boolean) => void;
}

function GeneralInformation({ onOpenChange }: GeneralInformationProps) {
  const { t } = useTranslation("doctor");
  const queryClient = useQueryClient();
  const isMobile = useIsMobile();
  const doctorProfile = useProfileStore((s) => s.doctorProfile);
  const setDoctorProfile = useProfileStore((s) => s.setDoctorProfile);
  const user = useAppStore((s) => s.user);

  const [cropModalOpen, setCropModalOpen] = useState(false);
  const [cropType, setCropType] = useState<CropType>("profile");
  const [tempImage, setTempImage] = useState<string>("");
  const [especialidadesOptions, setEspecialidadesOptions] = useState<SelectOption[]>([]);
  const [loadingEspecialidades, setLoadingEspecialidades] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Guardar las imágenes originales para detectar cambios
  const originalProfileImage = getUserAvatar(user) || "";
  const originalBannerImage = user?.doctor?.banner || user?.banner || "";

  // Opciones de nacionalidad
  const nationalityOptions = [
    {
      value: "dominicana",
      label: t("personalIdentificationStep.nationalityOptions.dominicana", { ns: "auth" }),
    },
    {
      value: "estadounidense",
      label: t("personalIdentificationStep.nationalityOptions.estadounidense", { ns: "auth" }),
    },
    {
      value: "mexicana",
      label: t("personalIdentificationStep.nationalityOptions.mexicana", { ns: "auth" }),
    },
    {
      value: "colombiana",
      label: t("personalIdentificationStep.nationalityOptions.colombiana", { ns: "auth" }),
    },
    {
      value: "venezolana",
      label: t("personalIdentificationStep.nationalityOptions.venezolana", { ns: "auth" }),
    },
    {
      value: "otra",
      label: t("personalIdentificationStep.nationalityOptions.otra", { ns: "auth" }),
    },
  ];

  const formattedIdentityDocument = useMemo(
    () => formatDominicanCedula(user?.doctor?.numeroDocumentoIdentificacion),
    [user?.doctor?.numeroDocumentoIdentificacion]
  );

  const formattedLicenseNumber = useMemo(() => {
    const rawValue = String(user?.doctor?.exequatur || "").replace(/\D/g, "").slice(0, 5);
    if (rawValue.length <= 3) return rawValue;
    return `${rawValue.slice(0, 3)}-${rawValue.slice(3)}`;
  }, [user?.doctor?.exequatur]);
  
  // Mapear los datos del doctor a los valores del formulario
  const defaultValues = useMemo(
    () =>
      user?.doctor
        ? {
            role: "DOCTOR" as const,
            name: user.doctor.nombre || "",
            lastName: user.doctor.apellido || "",
            specialty:
              user.doctor.especialidades?.find((e) => e.es_principal)
                ?.id_especialidad?.toString() || "",
            secondarySpecialties:
              user.doctor.especialidades
                ?.filter((e) => !e.es_principal)
                .map((e) => e.id_especialidad.toString()) || [],
            email: user.email || "",
            phone: formatPhone(user.telefono || ""),
            yearsExperience: user.doctor.anosExperiencia?.toString() || "",
            licenseNumber: user.doctor.exequatur || "",
            identityDocument: formattedIdentityDocument,
            nationality: user.doctor.nacionalidad || "",
            birthDate: user.doctor.fechaNacimiento ? user.doctor.fechaNacimiento.split('T')[0] : "",
            biography: user.doctor.biografia || "",
          }
        : undefined,
    [user, formattedIdentityDocument]
  );

  const [bannerImage, setBannerImage] = useState<string>(
    user?.doctor?.banner || user?.banner || "",
  );
  const [profileImage, setProfileImage] = useState<string>(
    user?.doctor?.fotoPerfil || user?.fotoPerfil || "",
  );

  const bannerInputRef = useRef<HTMLInputElement>(null);
  const profileInputRef = useRef<HTMLInputElement>(null);
  const formRef = useRef<UseFormReturn<any> | null>(null);

  const [showDeleteProfileModal, setShowDeleteProfileModal] = useState(false);
  const [showDeleteBannerModal, setShowDeleteBannerModal] = useState(false);

  // Cargar especialidades con soporte multilenguaje
  useEffect(() => {
    const loadEspecialidades = async () => {
      setLoadingEspecialidades(true);
      try {
        const language = i18n.language === "es" ? undefined : i18n.language;
        const options = await especialidadesService.getAllActiveEspecialidades(language);
        setEspecialidadesOptions(options);
      } catch (error) {
        console.error("Error cargando especialidades:", error);
        setEspecialidadesOptions([]);
      } finally {
        setLoadingEspecialidades(false);
      }
    };

    loadEspecialidades();
  }, [i18n.language]);

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

  const handleSubmit = async (data: any) => {
    if (!user) {
      toast.error(t("profileForm.errorNoUser"));
      return;
    }

    setIsSubmitting(true);

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
          const photoResponse = await doctorService.updateProfilePhoto(photoFile);

          const uploadedProfilePhotoUrl =
            photoResponse.data.fotoPerfilUrl || photoResponse.data.fotoPerfil;

          if (photoResponse.success && uploadedProfilePhotoUrl) {
            // Agregar timestamp para evitar caché del navegador
            newProfilePhotoUrl = `${uploadedProfilePhotoUrl}?t=${Date.now()}`;
            
            // Actualizar también el estado local para preview inmediata
            setProfileImage(newProfilePhotoUrl);
            
            toast.success(t("profileForm.photoUpdated"));
          }
        } catch (photoError) {
          console.error("Error al actualizar foto de perfil:", photoError);
          const photoErrorMessage = photoError instanceof Error 
            ? photoError.message 
            : t("profileForm.errorPhotoUpdate");
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
          const bannerResponse = await doctorService.updateBanner(bannerFile);

          if (bannerResponse.success && bannerResponse.data.bannerUrl) {
            // Agregar timestamp para evitar caché del navegador
            newBannerUrl = `${bannerResponse.data.bannerUrl}?t=${Date.now()}`;
            
            // Actualizar también el estado local para preview inmediata
            setBannerImage(newBannerUrl);
            
            toast.success(t("profileForm.bannerUpdated"));
          }
        } catch (bannerError) {
          console.error("Error al actualizar banner:", bannerError);
          const bannerErrorMessage = bannerError instanceof Error 
            ? bannerError.message 
            : t("profileForm.errorBannerUpdate");
          toast.error(bannerErrorMessage);
          // Continuar con la actualización de datos personales aunque falle el banner
        }
      }

      // 3. Actualizar datos personales del doctor
      const updateData: UpdateDoctorProfileRequest = {
        nombre: data.name || undefined,
        apellido: data.lastName || undefined,
        telefono: data.phone || undefined,
        biografia: data.biography || undefined,
        anosExperiencia: data.yearsExperience ? Number(data.yearsExperience) : undefined,
        fechaNacimiento: data.birthDate || undefined,
        nacionalidad: data.nationality || undefined,
      };

      // Llamar al servicio para actualizar el perfil
      const response = await doctorService.updateProfile(updateData);

      if (response.success) {
        const latestUser = useAppStore.getState().user;
        if (!latestUser) {
          toast.error(t("profileForm.errorNoUser"));
          return;
        }

        // Actualizar el usuario en el store con los nuevos datos
        useAppStore.getState().updateUser({
          ...latestUser,
          fotoPerfil: newProfilePhotoUrl,
          telefono: data.phone || latestUser.telefono,
          banner: newBannerUrl || null,
          doctor: latestUser.doctor ? {
            ...latestUser.doctor,
            ...response.data,
            fotoPerfil: newProfilePhotoUrl,
            banner: newBannerUrl || null,
          } : null,
        });

        // Guardar avatar y banner en el store de perfil (cache local)
        if (doctorProfile) {
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
            avatar: newProfilePhotoUrl
              ? { url: newProfilePhotoUrl, type: "image", name: "avatar" }
              : undefined,
            banner: newBannerUrl
              ? { url: newBannerUrl, type: "image", name: "banner" }
              : undefined,
          });
        }

        // Fuerza sincronizacion del perfil autenticado en toda la app
        // incluso en vistas inactivas con refetchOnMount deshabilitado.
        await Promise.all([
          queryClient.invalidateQueries({
            queryKey: [...QUERY_KEYS.DOCTORS, "me"],
            refetchType: "all",
          }),
          queryClient.invalidateQueries({
            queryKey: QUERY_KEYS.DOCTORS,
            refetchType: "all",
          }),
          queryClient.invalidateQueries({
            queryKey: QUERY_KEYS.ME,
            refetchType: "all",
          }),
          queryClient.invalidateQueries({
            queryKey: QUERY_KEYS.USER_PROFILE,
            refetchType: "all",
          }),
        ]);

        toast.success(t("profileForm.success"));
        
        // Cerrar el modal
        onOpenChange(false);
      }
    } catch (error) {
      console.error("Error al actualizar perfil del doctor:", error);
      const errorMessage = error instanceof Error 
        ? error.message 
        : t("profileForm.error");
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
          name="name"
          label={t("profileForm.name")}
          type="text"
          placeholder={t("profileForm.namePlaceholder")}
        />

        <MCInput
          name="lastName"
          label={t("profileForm.lastName")}
          type="text"
          placeholder={t("profileForm.lastNamePlaceholder")}
        />

        <MCSelect
          name="specialty"
          label={t("profileForm.specialty")}
          placeholder={t("profileForm.specialtyPlaceholder")}
          options={especialidadesOptions}
          disabled={loadingEspecialidades}
          searchable={true}
        />

        <MCSelect
          name="secondarySpecialties"
          label={t("profileForm.secondarySpecialties")}
          placeholder={t("profileForm.secondarySpecialtiesPlaceholder")}
          options={especialidadesOptions}
          disabled={loadingEspecialidades}
          searchable={true}
          multiple
        />

        <MCInput
          name="email"
          label={t("profileForm.email")}
          type="email"
          placeholder={t("profileForm.emailPlaceholder")}
          disabled
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
          key={`license-number-${formattedLicenseNumber}`}
          name="licenseNumber"
          label={t("profileForm.licenseNumber")}
          variant="exequatur"
          placeholder={t("profileForm.licenseNumberPlaceholder")}
          value={formattedLicenseNumber}
          disabled
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

        <MCSelect
          name="nationality"
          label={t("profileForm.nationality")}
          placeholder={t("profileForm.nationalityPlaceholder")}
          options={nationalityOptions}
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
            disabled={isSubmitting}
          >
            {isSubmitting ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                {t("profileForm.saving")}
              </>
            ) : (
              t("profileForm.saveChanges")
            )}
          </MCButton>
          <MCButton
            variant="secondary"
            size="m"
            onClick={() => onOpenChange(false)}
            className={isMobile ? "w-full" : ""}
            disabled={isSubmitting}
          >
            {t("profileForm.cancel")}
          </MCButton>
        </div>
      </MCFormWrapper>
    </>
  );
}

export default GeneralInformation;
