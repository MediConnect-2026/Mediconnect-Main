import { useTranslation } from "react-i18next";
import { useNavigate } from "react-router-dom";
import { useEffect, useMemo, useState } from "react";

import MCButton from "@/shared/components/forms/MCButton";
import { useGlobalUIStore } from "@/stores/useGlobalUIStore";
import { useAppStore } from "@/stores/useAppStore";
import { authService } from "@/services/auth/auth.service";
import { normalizeLoginResponse } from "@/services/auth/auth.types";
import { ROUTES } from "@/router/routes";
import { Spinner } from "@/shared/ui/spinner";

function RegisterSuccessPage() {
  const { t } = useTranslation("auth");
  const navigate = useNavigate();
  const [isAutoLoggingIn, setIsAutoLoggingIn] = useState(false);
  const [autoLoginError, setAutoLoginError] = useState<string | null>(null);

  const canAccessPage = useGlobalUIStore((state) => state.canAccessPage);
  const allowedPages = useGlobalUIStore((state) => state.allowedPages);

  const isAuthenticated = useAppStore((state) => state.isAuthenticated);
  const selectedRole = useAppStore((state) => state.selectedRole);
  const patientOnboardingData = useAppStore((state) => state.patientOnboardingData);
  const doctorOnboardingData = useAppStore((state) => state.doctorOnboardingData);
  const centerOnboardingData = useAppStore((state) => state.centerOnboardingData);
  const login = useAppStore((state) => state.login);
  const clearOnboarding = useAppStore((state) => state.clearOnboarding);
  const clearAuthFlow = useAppStore((state) => state.clearAuthFlow);

  // Buscar el objeto de la página actual para obtener el reason
  const currentPage = allowedPages.find(
    (p) => p.page === "/auth/register-success",
  );
  const reason = currentPage?.reason;

  const credentials = useMemo(() => {
    if (selectedRole === "Patient") {
      return {
        email: patientOnboardingData?.email,
        password: patientOnboardingData?.password,
      };
    }

    if (selectedRole === "Doctor") {
      return {
        email: doctorOnboardingData?.email,
        password: doctorOnboardingData?.password,
      };
    }

    if (selectedRole === "Center") {
      return {
        email: centerOnboardingData?.email,
        password: centerOnboardingData?.password,
      };
    }

    return { email: undefined, password: undefined };
  }, [
    selectedRole,
    patientOnboardingData?.email,
    patientOnboardingData?.password,
    doctorOnboardingData?.email,
    doctorOnboardingData?.password,
    centerOnboardingData?.email,
    centerOnboardingData?.password,
  ]);

  useEffect(() => {
    const hasValidAccess =
      canAccessPage &&
      allowedPages.some((p) => p.page === "/auth/register-success");

    if (!hasValidAccess) {
      navigate("/auth/register", { replace: true });
    }
  }, [canAccessPage, allowedPages, navigate]);

  useEffect(() => {
    if (reason !== "register") return;

    if (isAuthenticated) {
      navigate(ROUTES.COMMON.DASHBOARD, { replace: true });
      return;
    }

    if (!credentials.email || !credentials.password || isAutoLoggingIn) {
      return;
    }

    let cancelled = false;

    const autoLogin = async () => {
      setAutoLoginError(null);
      setIsAutoLoggingIn(true);

      try {
        const loginResponse = await authService.login({
          email: credentials.email!,
          password: credentials.password!,
        });

        const { accessToken, refreshToken, user } =
          normalizeLoginResponse(loginResponse);

        if (cancelled) return;

        login(accessToken, refreshToken, user);
        navigate(ROUTES.COMMON.DASHBOARD, { replace: true });

        setTimeout(() => {
          clearOnboarding();
          clearAuthFlow();
        }, 0);
      } catch (error: any) {
        if (cancelled) return;
        setAutoLoginError(
          error?.response?.data?.message ||
            error?.message ||
            t(
              "setCredentialsPage.errors.registrationFailed",
              "No se pudo iniciar sesión automáticamente."
            ),
        );
      } finally {
        if (!cancelled) {
          setIsAutoLoggingIn(false);
        }
      }
    };

    void autoLogin();

    return () => {
      cancelled = true;
    };
  }, [
    reason,
    isAuthenticated,
    credentials.email,
    credentials.password,
    login,
    clearOnboarding,
    clearAuthFlow,
    navigate,
    t,
  ]);

  const handleclick = () => {
    navigate("/login", { replace: true });
  };

  // Mensaje y título según el reason
  const title =
    reason === "password"
      ? t("RegisterSuccessPage.passwordTitle")
      : t("RegisterSuccessPage.title");
  const message =
    reason === "password"
      ? t("RegisterSuccessPage.passwordMessage")
      : t("RegisterSuccessPage.message");

  const successImgUrl =
    "https://res.cloudinary.com/dy2wtanhl/image/upload/v1771694169/successPassword_gcxlbt.png";

  return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] px-4">
      <img
        src={successImgUrl}
        alt={t("passwordSuccess.imgAlt")}
        className="w-90 h-90 mb-8 pointer-events-none"
      />
      <h2 className="text-3xl font-semibold mb-4">{title}</h2>
      <p className="mb-4 text-center">{message}</p>
      {autoLoginError && (
        <p className="mb-2 text-center text-sm text-destructive">{autoLoginError}</p>
      )}
      <MCButton className="mt-6" onClick={handleclick}>
        {isAutoLoggingIn ? (
          <span className="flex items-center gap-2">
            <Spinner className="size-4" />
            {t("setCredentialsPage.processing", "Procesando...")}
          </span>
        ) : (
          t("RegisterSuccessPage.continue")
        )}
      </MCButton>
    </div>
  );
}

export default RegisterSuccessPage;
