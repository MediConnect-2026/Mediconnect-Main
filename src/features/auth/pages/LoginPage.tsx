import { useRef, useState } from "react";
import { useGSAP } from "@gsap/react";
import gsap from "gsap";

import MCFormWrapper from "@/shared/components/forms/MCFormWrapper";
import MCInput from "@/shared/components/forms/MCInput";
import MCButton from "@/shared/components/forms/MCButton";
import { LoginSchema } from "@/schema/AuthSchema";
import { useAppStore } from "@/stores/useAppStore";
import { type LoginSchemaType } from "@/types/AuthTypes";
import { useIsMobile } from "@/lib/hooks/useIsMobile";
import { useTranslation } from "react-i18next";
import { useNavigate } from "react-router-dom";
import OAuthProvider from "../components/OAuthProvider";
import { useGlobalUIStore } from "@/stores/useGlobalUIStore";
import { ToggleGroup, ToggleGroupItem } from "@/shared/ui/toggle-group";

import { useLogin } from "@/lib/hooks/auth";
import { ROUTES } from "@/router/routes";
import { ArrowLeft } from "lucide-react";
function LoginPage() {
  const { t } = useTranslation("auth");
  const isMobile = useIsMobile();
  const loginCredentials = useAppStore((state) => state.loginCredentials);
  const setLoginCredentials = useAppStore((state) => state.setLoginCredentials);
  const navigate = useNavigate();
  const setLanguage = useGlobalUIStore((state) => state.setLanguage);
  const currentLanguage = useGlobalUIStore((state) => state.language);
  const [isGoogleAuthenticating, setIsGoogleAuthenticating] = useState(false);

  const { loginUser, isPending } = useLogin();

  const containerRef = useRef<HTMLElement>(null);
  const logoRef = useRef<HTMLImageElement>(null);
  const headingRef = useRef<HTMLDivElement>(null);
  const formRef = useRef<HTMLDivElement>(null);

  useGSAP(
    () => {
      // Asegurar que las refs están disponibles antes de animar
      if (!logoRef.current || !headingRef.current || !formRef.current) {
        return;
      }

      // Limpiar cualquier estilo inline previo antes de animar
      gsap.set([logoRef.current, headingRef.current, formRef.current], {
        clearProps: "all",
      });

      const tl = gsap.timeline();

      tl.fromTo(
        logoRef.current,
        { y: 30, opacity: 0 },
        { y: 0, opacity: 1, duration: 0.5, ease: "power2.out" },
      )
        .fromTo(
          headingRef.current,
          { y: 30, opacity: 0 },
          { y: 0, opacity: 1, duration: 0.5, ease: "power2.out" },
          "-=0.3",
        )
        .fromTo(
          formRef.current,
          { y: 30, opacity: 0 },
          { y: 0, opacity: 1, duration: 0.5, ease: "power2.out" },
          "-=0.3",
        );

      // Cleanup function para resetear cuando el componente se desmonte
      return () => {
        tl.kill();
        gsap.set([logoRef.current, headingRef.current, formRef.current], {
          clearProps: "all",
        });
      };
    },
    { scope: containerRef, dependencies: [] },
  );

  const handleSubmit = (data: LoginSchemaType) => {
    setLoginCredentials({ email: data.email, password: data.password });

    // Hacer login con la API
    loginUser({
      email: data.email,
      password: data.password,
    });
  };

  const backButtonContent = (
    <button
      onClick={() => navigate("/")}
      className="group flex items-center gap-2 text-primary transition-all duration-150 hover:opacity-80 active:scale-95"
      type="button"
    >
      <ArrowLeft className="text-primary transition-transform duration-200 group-hover:-translate-x-1 group-hover:scale-110" />
      <span className="font-medium text-lg">{t("header.back", "Back")}</span>
    </button>
  );

  const languageSelectorContent = (
    <ToggleGroup
      type="single"
      value={currentLanguage}
      onValueChange={setLanguage}
      aria-label="Language selector"
    >
      <ToggleGroupItem
        value="es"
        aria-label="Español"
        className={currentLanguage !== "es" ? "opacity-50" : ""}
      >
        <img
          src="https://res.cloudinary.com/dy2wtanhl/image/upload/v1771637850/flag-spain_u9cses.png"
          alt="Español"
          className="w-6 h-6"
        />
      </ToggleGroupItem>
      <ToggleGroupItem
        value="en"
        aria-label="English"
        className={currentLanguage !== "en" ? "opacity-50" : ""}
      >
        <img
          src="https://res.cloudinary.com/dy2wtanhl/image/upload/v1771637851/flag-usa_ubewc7.png"
          alt="English"
          className="w-6 h-6"
        />
      </ToggleGroupItem>
    </ToggleGroup>
  );

  return (
    <section className="max-h-screen h-screen overflow-hidden w-full bg-white">
      <div
        className={`h-full w-full ${
          isMobile ? "" : "grid grid-cols-[45%_55%]"
        }`}
      >
        {/* SOLO DESKTOP: main vacío para el grid */}
        {!isMobile && (
          <main className="relative flex flex-col justify-center items-center px-8">
            <div className="absolute top-6 left-6 z-20">
              {backButtonContent}
            </div>
            <div className="absolute top-6 right-6 z-20">
              {languageSelectorContent}
            </div>
          </main>
        )}

        {/* MAIN PRINCIPAL: cambia clases según mobile/desktop */}
        <main
          ref={containerRef}
          className={`relative flex flex-col justify-center items-center px-4 sm:px-8 z-10 bg-white
          ${
            isMobile
              ? "min-h-screen w-full pt-14 pb-4"
              : "absolute top-0 bottom-0 w-[50%] rounded-r-4xl"
          }`}
        >
          {isMobile && (
            <div className="absolute top-3 left-3 right-3 z-20 flex items-center justify-between">
              {backButtonContent}
              {languageSelectorContent}
            </div>
          )}

          <div className="flex flex-col justify-center items-center gap-0 mb-1 w-full">
            <img
              ref={logoRef}
              src="https://res.cloudinary.com/dy2wtanhl/image/upload/v1771637879/MediConnectLanding-green_trpgvu.png"
              alt="Logo"
              className="w-24 sm:w-36 mb-3"
            />
            <div ref={headingRef} className="w-full">
              <h1 className="text-2xl sm:text-4xl font-bold text-center">
                {t("login.welcome", "Welcome")}
              </h1>
              <p className="text-base sm:text-xl text-center text-muted-foreground">
                {t("login.subtitle", "Sign in to MediConnect")}
              </p>
            </div>
          </div>
          <div
            ref={formRef}
            className="w-full max-w-xs sm:max-w-md mx-auto mt-2"
          >
            <MCFormWrapper
              schema={LoginSchema(t)}
              onSubmit={handleSubmit}
              defaultValues={{
                email: loginCredentials.email,
                password: loginCredentials.password,
              }}
              className="w-full rounded-lg p-3 sm:p-4 flex flex-col"
            >
              <MCInput
                type="email"
                name="email"
                label={t("login.email", "Email")}
                placeholder={t("login.emailPlaceholder", "Email")}
              />
              <MCInput
                type="password"
                label={t("login.password", "Password")}
                name="password"
                placeholder={t("login.passwordPlaceholder", "Password")}
              />
              <div className="flex justify-end w-full mb-3">
                <button
                  type="button"
                  className="text-base text-primary font-semibold hover:underline cursor-pointer"
                  onClick={() => navigate(ROUTES.FORGOT_PASSWORD)}
                >
                  {t("login.forgot", "Forgot your password?")}
                </button>
              </div>
              <MCButton
                type="submit"
                className="w-full h-[50px] rounded-full text-lg font-medium"
                variant="primary"
                size="xl"
                disabled={isPending || isGoogleAuthenticating}
              >
                {isPending
                  ? t("errors.loading", "Loading...")
                  : t("login.submit", "Sign In")}
              </MCButton>

              <div className="flex items-center my-3">
                <hr className="flex-grow border-t border-gray-300" />
                <span className="mx-2 text-gray-400">o</span>
                <hr className="flex-grow border-t border-gray-300" />
              </div>

              <OAuthProvider onAuthStateChange={setIsGoogleAuthenticating} />
            </MCFormWrapper>
            <div className="mt-3 text-center text-sm sm:text-base">
              <span>{t("login.noAccount", "¿No tienes cuenta?")}</span>
              <button
                className="ml-2 text-primary font-semibold hover:underline"
                onClick={() => navigate(ROUTES.REGISTER)}
                type="button"
              >
                {t("login.register", "Regístrate")}
              </button>
            </div>
          </div>
        </main>

        {!isMobile && (
          <aside className="h-full w-full">
            <img
              src="https://res.cloudinary.com/dy2wtanhl/image/upload/v1771699006/ASIDE_IMAGE._esqkji.png"
              alt="Login Aside"
              className="h-full w-full object-cover"
            />
          </aside>
        )}
      </div>
    </section>
  );
}

export default LoginPage;
