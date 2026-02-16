import { useEffect, useState } from "react";
import AuthContentContainer from "@/features/auth/components/AuthContentContainer";
import MCFormWrapper from "@/shared/components/forms/MCFormWrapper";
import MCInput from "@/shared/components/forms/MCInput";
import { CreatePasswordSchema } from "@/schema/OnbordingSchema";
import { Spinner } from "@/shared/ui/spinner";
import { useTranslation } from "react-i18next";
import { useAppStore } from "@/stores/useAppStore";
import { useNavigate } from "react-router-dom";
import AuthFooterContainer from "@/features/auth/components/AuthFooterContainer";
import type { PatientCreatePasswordSchemaType } from "@/types/OnbordingTypes";
import { useGlobalUIStore } from "@/stores/useGlobalUIStore";
import { doctorRegistrationService } from "@/features/onboarding/services/doctor-registration.service";
import { mapDoctorOnboardingToRequest } from "@/features/onboarding/services/doctor-registration.mapper";
import { authService } from "@/services/auth/auth.service";
import { normalizeLoginResponse } from "@/services/auth/auth.types";
import { ROUTES } from "@/router/routes";

function SetCredentialsPage() {
  const { t } = useTranslation("auth");
  const navigate = useNavigate();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const selectedRole = useAppStore((state) => state.selectedRole);
  const basicInfo = useAppStore((state) => state.patientOnboardingData);
  const setPatientOnboardingData = useAppStore(
    (state) => state.setPatientOnboardingData
  );
  const doctorBasicInfo = useAppStore((state) => state.doctorOnboardingData);
  const setDoctorOnboardingData = useAppStore(
    (state) => state.setDoctorOnboardingData
  );
  const centerBasicInfo = useAppStore((state) => state.centerOnboardingData);
  const setCenterOnboardingData = useAppStore(
    (state) => state.setCenterOnboardingData
  );
  const verifyEmail = useAppStore((state) => state.verifyEmail);
  const registrationToken = useAppStore((state) => state.registrationToken);
  const login = useAppStore((state) => state.login);
  const clearOnboarding = useAppStore((state) => state.clearOnboarding);
  const clearAuthFlow = useAppStore((state) => state.clearAuthFlow);
  const setAccessPage = useGlobalUIStore((state) => state.setAccessPage);
  const setToast = useGlobalUIStore((state) => state.setToast);
  const isAuthenticated = useAppStore((state) => state.isAuthenticated);

  useEffect(() => {
    // Si el usuario ya está autenticado, no hacer validaciones de onboarding
    if (isAuthenticated) {
      return;
    }

    // Validar verificación de email
    if (!verifyEmail?.verified) {
      navigate("/auth/email-verification", { replace: true });
      return;
    }

    if (selectedRole === "Patient") {
      if (
        !basicInfo?.name ||
        !basicInfo?.lastName ||
        !basicInfo?.identityDocument ||
        !basicInfo?.email
      ) {
        navigate("/auth/patient-onboarding/basic-info", { replace: true });
        return;
      }
    }

    if (selectedRole === "Doctor") {
      if (
        !doctorBasicInfo?.name ||
        !doctorBasicInfo?.lastName ||
        !doctorBasicInfo?.identityDocument ||
        !doctorBasicInfo?.email
      ) {
        navigate("/auth/doctor-onboarding/basic-info", { replace: true });
        return;
      }
    }

    if (selectedRole === "Center") {
      if (
        !centerBasicInfo?.name ||
        !centerBasicInfo?.address ||
        !centerBasicInfo?.rnc ||
        !centerBasicInfo?.email
      ) {
        navigate("/auth/center-onboarding/basic-info", { replace: true });
        return;
      }
    }

    if (!selectedRole) {
      navigate("/auth/register", { replace: true });
    }
  }, [
    verifyEmail,
    basicInfo,
    doctorBasicInfo,
    centerBasicInfo,
    selectedRole,
    navigate,
    isAuthenticated,
  ]);

  const handleSubmit = async (data: PatientCreatePasswordSchemaType) => {
    setErrorMessage(null);
    setIsSubmitting(true);

    try {
      if (selectedRole === "Patient" && setPatientOnboardingData && basicInfo) {
        setPatientOnboardingData({
          ...basicInfo,
          password: data.password,
          confirmPassword: data.confirmPassword,
          role: "Patient",
          name: basicInfo.name,
          lastName: basicInfo.lastName,
          identityDocument: basicInfo.identityDocument,
          email: basicInfo.email,
          urlImg: basicInfo.urlImg ?? undefined,
        });
        navigate("/auth/patient-onboarding/profile-photo", { replace: true });
      }

      if (
        selectedRole === "Doctor" &&
        setDoctorOnboardingData &&
        doctorBasicInfo
      ) {
        const updatedDoctorData = {
          ...doctorBasicInfo,
          password: data.password,
          confirmPassword: data.confirmPassword,
          role: "Doctor" as const,
          name: doctorBasicInfo.name,
          lastName: doctorBasicInfo.lastName,
          identityDocument: doctorBasicInfo.identityDocument,
          email: doctorBasicInfo.email,
          urlImg: doctorBasicInfo.urlImg ?? undefined,
        };

        // Actualizar el store con las credenciales
        setDoctorOnboardingData(updatedDoctorData);

        if (!registrationToken) {
          throw new Error(t('setCredentialsPage.errors.noRegistrationToken'));
        }

        // Mapear y enviar los datos al backend
        const request = await mapDoctorOnboardingToRequest(
          updatedDoctorData,
          registrationToken
        );

        await doctorRegistrationService.registerDoctor(request);

        // Login automático después del registro exitoso
        const loginResponse = await authService.login({
          email: updatedDoctorData.email,
          password: updatedDoctorData.password,
        });

        // Normalizar la respuesta para convertir el rol al formato correcto
        const { accessToken, refreshToken, user } = normalizeLoginResponse(loginResponse);

        // Guardar los tokens y datos del usuario en el store
        login(accessToken, refreshToken, user);

        // Mostrar mensaje de éxito
        setToast({
          message: t('setCredentialsPage.messages.registrationAndLoginSuccess') || '¡Registro exitoso! Bienvenido a Mediconnect',
          type: 'success',
          open: true,
        });

        // Redirigir al dashboard
        navigate(ROUTES.COMMON.DASHBOARD, { replace: true });

        // Limpiar los stores después de navegar exitosamente
        setTimeout(() => {
          clearOnboarding();
          clearAuthFlow();
        }, 0);
      }

      if (
        selectedRole === "Center" &&
        setCenterOnboardingData &&
        centerBasicInfo
      ) {
        setCenterOnboardingData({
          ...centerBasicInfo,
          password: data.password,
          confirmPassword: data.confirmPassword,
          role: "Center",
          name: centerBasicInfo.name,
          address: centerBasicInfo.address,
          rnc: centerBasicInfo.rnc,
          email: centerBasicInfo.email,
          urlImg: centerBasicInfo.urlImg ?? undefined,
        });
        setAccessPage(
          true,
          [{ page: "/auth/register-success", reason: "register" }],
          "register"
        );
        navigate("/auth/register-success", { replace: true });
      }
    } catch (error: any) {
      console.error('Error al procesar el registro:', error);
      
      // Determinar el mensaje de error apropiado
      let errorMsg = t('setCredentialsPage.errors.registrationFailed');
      
      if (error.response?.data?.message) {
        // Error del servidor
        errorMsg = error.response.data.message;
      } else if (error.message) {
        // Error local (validación, conversión, etc.)
        if (error.message.includes('documento')) {
          errorMsg = t('setCredentialsPage.errors.documentRequired');
        } else if (error.message.includes('Título académico')) {
          errorMsg = t('setCredentialsPage.errors.academicTitleRequired');
        } else if (error.message.includes('token')) {
          errorMsg = error.message; // Ya está traducido
        } else {
          errorMsg = error.message;
        }
      }
      
      setErrorMessage(errorMsg);
    } finally {
      setIsSubmitting(false);
    }
  };

  // Obtener los datos y default values según el rol
  let defaultValues = { password: "", confirmPassword: "" };
  let backPath = "/auth/patient-onboarding/basic-info";

  if (selectedRole === "Doctor" && doctorBasicInfo) {
    defaultValues = {
      password: doctorBasicInfo.password || "",
      confirmPassword: doctorBasicInfo.confirmPassword || "",
    };
    backPath = "/auth/doctor-onboarding";
  } else if (selectedRole === "Center" && centerBasicInfo) {
    defaultValues = {
      password: centerBasicInfo.password || "",
      confirmPassword: centerBasicInfo.confirmPassword || "",
    };
    backPath = "/auth/center-onboarding";
  } else if (selectedRole === "Patient" && basicInfo) {
    defaultValues = {
      password: basicInfo.password || "",
      confirmPassword: basicInfo.confirmPassword || "",
    };
    backPath = "/auth/patient-onboarding/basic-info";
  }

  return (
    <AuthContentContainer
      title={t("setCredentialsPage.title")}
      subtitle={t("setCredentialsPage.subtitle")}
    >
      <MCFormWrapper
        onSubmit={handleSubmit}
        schema={CreatePasswordSchema((key) => t(key))}
        defaultValues={defaultValues}
        className="flex flex-col items-center w-full"
      >
        <div className="flex flex-col items-center w-full max-w-md mx-auto">
          {errorMessage && (
            <div className="w-full mb-4 p-4 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">
              {errorMessage}
            </div>
          )}
          <MCInput
            label={t("setCredentialsPage.passwordLabel")}
            name="password"
            type="password"
            placeholder={t("setCredentialsPage.passwordPlaceholder")}
            disabled={isSubmitting}
          />
          <MCInput
            label={t("setCredentialsPage.confirmPasswordLabel")}
            name="confirmPassword"
            type="password"
            placeholder={t("setCredentialsPage.confirmPasswordPlaceholder")}
            disabled={isSubmitting}
          />
        </div>
        <AuthFooterContainer
          backButtonProps={{
            onClick() {
              navigate(backPath, { replace: true });
            },
            disabled: isSubmitting,
          }}
          continueButtonProps={{
            disabled: isSubmitting,
            children: isSubmitting ? (
              <span className="flex items-center gap-2">
                <Spinner className="size-4" />
                {t('setCredentialsPage.processing')}
              </span>
            ) : undefined,
          }}
        />
      </MCFormWrapper>
    </AuthContentContainer>
  );
}

export default SetCredentialsPage;
