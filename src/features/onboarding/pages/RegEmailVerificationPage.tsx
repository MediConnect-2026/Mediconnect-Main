import { useEffect, useState } from "react";
import MCFormWrapper from "@/shared/components/forms/MCFormWrapper";
import AuthContentContainer from "@/features/auth/components/AuthContentContainer";
import MCInput from "@/shared/components/forms/MCInput";
import { ForgotPasswordSchema } from "@/schema/AuthSchema";
import { useAppStore } from "@/stores/useAppStore";
import { useTranslation } from "react-i18next";
import AuthFooterContainer from "@/features/auth/components/AuthFooterContainer";
import { useNavigate } from "react-router-dom";
import { authService } from "@/services/auth/auth.service";
import { toast } from "sonner";
import { Loader2 } from "lucide-react";

function RegEmailVerificationPage() {
  const { t } = useTranslation("auth");
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(false);

  const selectedRole = useAppStore((state) => state.selectedRole);
  const patientBasicInfo = useAppStore((state) => state.patientOnboardingData);
  const setPatientEmail = useAppStore(
    (state) => state.setPatientOnboardingData
  );
  const doctorBasicInfo = useAppStore((state) => state.doctorOnboardingData);
  const setEmailDoctor = useAppStore((state) => state.setDoctorOnboardingData);
  const centerBasicInfo = useAppStore((state) => state.centerOnboardingData);
  const setEmailCenter = useAppStore((state) => state.setCenterOnboardingData);
  const setVerifyEmail = useAppStore((state) => state.setVerifyEmail);
  
  useEffect(() => {
    if (!selectedRole) {
      console.log("No role selected, redirecting...");
      navigate("/auth/register", { replace: true });
    }
  }, [selectedRole, navigate]);

  const handlesubmit = async (data: { email: string }) => {
    setIsLoading(true);
    
    try {
      // Llamar a la API para solicitar código OTP
      // Si el email ya existe, el backend devolverá un error
      const response = await authService.solicitarCodigoRegistro({
        email: data.email,
      });

      if (response.success) {
        // Guardar email y estado de verificación
        setVerifyEmail({ email: data.email, verified: false });

        // Guardar email según el rol seleccionado
        if (selectedRole === "Doctor" && setEmailDoctor && doctorBasicInfo) {
          setEmailDoctor({
            ...doctorBasicInfo,
            email: data.email ?? "",
          });
        }

        if (selectedRole === "Patient" && setPatientEmail && patientBasicInfo) {
          setPatientEmail({
            ...patientBasicInfo,
            email: data.email ?? "",
          });
        }

        if (selectedRole === "Center" && setEmailCenter && centerBasicInfo) {
          setEmailCenter({
            ...centerBasicInfo,
            email: data.email ?? "",
          });
        }

        // Mostrar mensaje de éxito
        toast.success(t("registerEmailVerifyPage.successTitleEmailSent") || response.message || "Código enviado correctamente");
        
        // Navegar a la página de verificación OTP
        navigate("/auth/otp-verification", { replace: true });
      }
    } catch (error: any) {
      console.error("Error al solicitar código OTP:", error);
      
      // Mostrar mensaje de error (incluye si el email ya está registrado)
      const errorMessage = 
        error?.response?.data?.message || 
        error?.message || 
        "Error al enviar el código. Por favor, intenta de nuevo.";

      if (error?.response?.status === 400) {
        toast.error(t("registerEmailVerifyPage.errors.emailInUse") || "El correo electrónico ya está en uso. Por favor, utiliza otro correo.");
        return;
      }
      
      console.log("Error message to display:", errorMessage);
      toast.error(t("registerEmailVerifyPage.errors.sendingEmail") || errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  if (!selectedRole) {
    return null;
  }

  return (
    <AuthContentContainer
      title={t("registerEmailVerifyPage.title")}
      subtitle={t("registerEmailVerifyPage.subtitle")}
    >
      <MCFormWrapper
        schema={ForgotPasswordSchema((key) => t(key))}
        onSubmit={(data) => {
          handlesubmit(data);
        }}
        defaultValues={{
          email:
            selectedRole === "Patient"
              ? patientBasicInfo?.email || ""
              : selectedRole === "Doctor"
              ? doctorBasicInfo?.email || ""
              : centerBasicInfo?.email || "",
        }}
        className="flex flex-col items-center w-full"
      >
        <div className="flex flex-col items-center w-full max-w-md mx-auto">
          <MCInput
            name="email"
            type="email"
            label={t("forgotPassword.emailLabel")}
            placeholder={t("forgotPassword.emailPlaceholder")}
            disabled={isLoading}
          />
        </div>
        <AuthFooterContainer
          backButtonProps={{
            onClick: () => {
              navigate("/auth/register");
            },
            disabled: isLoading,
          }}
          continueButtonProps={{
            disabled: isLoading,
            icon: isLoading ? <Loader2 className="animate-spin" /> : undefined,
          }}
        />
      </MCFormWrapper>
    </AuthContentContainer>
  );
}

export default RegEmailVerificationPage;
