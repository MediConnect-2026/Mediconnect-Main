import { useRef } from "react";
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
function LoginPage() {
  const { t } = useTranslation("auth");
  const isMobile = useIsMobile();
  const loginCredentials = useAppStore((state) => state.loginCredentials);
  const setLoginCredentials = useAppStore((state) => state.setLoginCredentials);
  const navigate = useNavigate();
  const setLanguage = useGlobalUIStore((state) => state.setLanguage);
  const currentLanguage = useGlobalUIStore((state) => state.language);

  const containerRef = useRef<HTMLElement>(null);
  const logoRef = useRef<HTMLImageElement>(null);
  const headingRef = useRef<HTMLDivElement>(null);
  const formRef = useRef<HTMLDivElement>(null);

  useGSAP(
    () => {
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
    },
    { scope: containerRef },
  );

  const handleSubmit = (data: LoginSchemaType) => {
    if (data.email && data.password) {
      setLoginCredentials({ email: data.email, password: data.password });
      navigate("/admin/dashboard");
    } else {
      alert(t("login.errorFields"));
    }
  };

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
            {/* Toggle de idiomas en la esquina superior izquierda */}
            <div className="absolute top-6 left-6 z-20">
              <ToggleGroup
                type="single"
                value={currentLanguage}
                onValueChange={setLanguage}
                aria-label="Language selector"
              >
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
              </ToggleGroup>
            </div>
          </main>
        )}

        {/* MAIN PRINCIPAL: cambia clases según mobile/desktop */}
        <main
          ref={containerRef}
          className={`flex flex-col justify-center items-center px-4 sm:px-8 z-10 bg-white
          ${
            isMobile
              ? "min-h-screen w-full"
              : "absolute top-0 bottom-0 w-[50%] rounded-r-4xl"
          }`}
        >
          <div className="flex flex-col justify-center items-center gap-1 mb-2 w-full">
            <img
              ref={logoRef}
              src="https://res.cloudinary.com/dy2wtanhl/image/upload/v1771637879/MediConnectLanding-green_trpgvu.png"
              alt="Logo"
              className="w-24 sm:w-32 mb-6"
            />
            <div ref={headingRef} className="w-full">
              <h1 className="text-3xl sm:text-4xl font-bold text-center">
                {t("login.welcome", "Welcome")}
              </h1>
              <p className="text-lg sm:text-xl text-center text-muted-foreground">
                {t("login.subtitle", "Sign in to MediConnect")}
              </p>
            </div>
          </div>
          <div ref={formRef} className="w-full max-w-xs sm:max-w-md mx-auto">
            <MCFormWrapper
              schema={LoginSchema(t)}
              onSubmit={handleSubmit}
              defaultValues={{
                email: loginCredentials.email,
                password: loginCredentials.password,
              }}
              className="w-full rounded-lg p-4 flex flex-col"
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
              <div className="flex justify-end w-full mb-4">
                <a
                  className="text-base text-primary font-semibold hover:underline"
                  onClick={() => navigate("/auth/forgot-password")}
                >
                  {t("login.forgot", "Forgot your password?")}
                </a>
              </div>
              <MCButton type="submit" className="w-full" variant="primary">
                {t("login.submit", "Sign In")}
              </MCButton>

              <div className="flex items-center my-4">
                <hr className="flex-grow border-t border-gray-300" />
                <span className="mx-2 text-gray-400">o</span>
                <hr className="flex-grow border-t border-gray-300" />
              </div>

              <OAuthProvider />
            </MCFormWrapper>
            <div className="mt-4 text-center text-sm sm:text-base">
              <span>{t("login.noAccount", "¿No tienes cuenta?")}</span>
              <button
                className="ml-2 text-primary font-semibold hover:underline"
                onClick={() => navigate("/auth/register")}
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
