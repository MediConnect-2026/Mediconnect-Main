import { useEffect, useRef, useState } from "react";
import AuthContentContainer from "@/features/auth/components/AuthContentContainer";
import { useTranslation } from "react-i18next";
import { useAppStore } from "@/stores/useAppStore";
import { useNavigate } from "react-router-dom";
import AuthFooterContainer from "@/features/auth/components/AuthFooterContainer";
import { Camera, Loader2 } from "lucide-react";
import MCProfileImageUploader from "@/shared/components/MCProfileImageUploader";
import { useIsMobile } from "@/lib/hooks/useIsMobile";
import { useGlobalUIStore } from "@/stores/useGlobalUIStore";
import patientRegistrationService from "@/features/onboarding/services/patient-registration.service";
import { base64ToFile, getMimeTypeFromBase64 } from "@/utils/base64ToFile";
import { toast } from "sonner";
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
  const isModalOpen = useGlobalUIStore((state) => state.modalOpen);
  const setIsModalOpen = useGlobalUIStore((state) => state.setModalOpen);
  const otpData = useAppStore((state) => state.otp);
  const selectedRole = useAppStore((state) => state.selectedRole);
  const setAccessPage = useGlobalUIStore((state) => state.setAccessPage);
  const registrationToken = useAppStore((state) => state.registrationToken);

  const [profile, setProfile] = useState<string>(
    typeof basicInfo?.urlImg === "object" && basicInfo.urlImg?.url
      ? basicInfo.urlImg.url
      : DEFAULT_PROFILE_IMAGE
  );
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [selectedImageSrc, setSelectedImageSrc] = useState<string>("");
  const profileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (!basicInfo?.password || !basicInfo?.confirmPassword) {
      navigate("/auth/patient-onboarding/password-setup", { replace: true });
      return;
    }

    if (selectedRole !== "Patient") {
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
        urlImg: {
          url: croppedImage,
          type: "image",
          name: "Foto de perfil",
        },
      });
    }
    setIsModalOpen(false);
  };

  const handleContinue = async () => {
    // Validaciones previas
    if (!basicInfo || !basicInfo.password) {
      toast.error(t("profilePhotoPage.errors.missingData") || "Faltan datos requeridos");
      return;
    }

    if (!registrationToken) {
      toast.error(t("profilePhotoPage.errors.missingToken") || "Token de registro no encontrado");
      navigate("/auth/patient-onboarding/otp-verification", { replace: true });
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      // Preparar datos para el registro
      const requestData: any = {
        token: registrationToken,
        nombre: basicInfo.name,
        apellido: basicInfo.lastName,
        numero_documento: basicInfo.identityDocument,
        tipo_documento: "Cédula" as const, // Por ahora solo soportamos cédulas dominicanas
        password: basicInfo.password,
      };

      // Agregar género si existe (mapear a valores de la API: M, F, O)
      if (basicInfo.gender) {
        const genderMap: Record<string, "M" | "F" | "O"> = {
          masculino: "M",
          femenino: "F",
          otro: "O",
        };
        requestData.genero = genderMap[basicInfo.gender] || "O";
      }

      // Agregar foto de perfil si existe y no es la imagen por defecto
      if (profile && profile !== DEFAULT_PROFILE_IMAGE) {
        try {  
          const mimeType = getMimeTypeFromBase64(profile);
          
          // Convertir base64 a File (mejor que Blob para FormData)
          const photoFile = base64ToFile(profile, "profile-photo.jpg", mimeType);
          
          requestData.fotoPerfil = photoFile;
        } catch (err) {
          console.error("❌ Error al procesar la foto de perfil:", err);
          toast.error(t("profilePhotoPage.errors.photoProcessing") || "Error al procesar la foto");
          // Continuar sin la foto si hay error
        }
      } else {
        console.log("ℹ️ No se agregará foto de perfil (usando imagen por defecto o no seleccionada)");
      }

      // Llamar al servicio de registro
      const response = await patientRegistrationService.registerPatient(requestData);

      if (response.success) {
        // Actualizar el store con los datos finales
        if (setPatientOnboardingData) {
          setPatientOnboardingData({
            ...basicInfo,
            urlImg:
              profile !== DEFAULT_PROFILE_IMAGE
                ? {
                    url: profile,
                    type: "image",
                    name: "Foto de perfil",
                  }
                : undefined,
          });
        }

        // Mostrar mensaje de éxito
        toast.success(t("profilePhotoPage.success") || response.message || "Registro exitoso" );

        // Navegar a la página de éxito
        setAccessPage(
          true,
          [{ page: "/auth/register-success", reason: "register" }],
          "register"
        );
        navigate("/auth/register-success", { replace: true });
      } else {
        // Si la respuesta no es exitosa, mostrar error y no navegar
        const errorMsg = response.message || t("profilePhotoPage.errors.registrationFailed") || "Error al completar el registro";
        setError(errorMsg);
        toast.error(errorMsg);
      }
    } catch (err: any) {
      console.error("Error al registrar paciente:", err);
      
      // Manejar diferentes tipos de errores
      let errorMessage = t("profilePhotoPage.errors.registrationFailed") || "Error al completar el registro";
      
      if (err.response?.data?.message) {
        errorMessage = err.response.data.message;
      } else if (err.message) {
        errorMessage = err.message;
      }

      setError(errorMessage);
      toast.error(errorMessage);
      
      // NO navegar - quedarse en la página actual
      return;
    } finally {
      setIsLoading(false);
    }
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

      {error && (
        <div className="w-full max-w-md mx-auto mb-4">
          <div className="bg-destructive/10 border border-destructive/20 rounded-lg p-4">
            <p className="text-destructive text-sm text-center">{error}</p>
          </div>
        </div>
      )}

      <AuthFooterContainer
        continueButtonProps={{
          onClick: handleContinue,
          disabled: isLoading,
          icon: isLoading ? <Loader2 className="animate-spin" /> : undefined,
          children: isLoading ? t("profilePhotoPage.loading") || "Registrando..." : undefined,
        }}
        backButtonProps={{
          onClick() {
            navigate("/auth/patient-onboarding/password-setup", {
              replace: true,
            });
          },
          disabled: isLoading,
        }}
      />
    </AuthContentContainer>
  );
}

export default PatientProfilePhotoPage;
