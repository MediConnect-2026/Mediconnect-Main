import { useRef } from "react";
import { useGSAP } from "@gsap/react";
import gsap from "gsap";
// import LoginAsideImg from "@/assets/LoginAside.png";
import Logo from "@/assets//MediConnectLanding-green.png";
import MCFormWrapper from "@/shared/components/forms/MCFormWrapper";
import MCInput from "@/shared/components/forms/MCInput";
import MCButton from "@/shared/components/forms/MCButton";
import { LoginSchema } from "@/schema/AuthSchema";
import { useAppStore } from "@/stores/useAppStore";
import { type LoginSchemaType } from "@/schema/AuthSchema";
import { useIsMobile } from "@/lib/hooks/useIsMobile";
import { useTranslation } from "react-i18next";
import LanguageDropDown from "../components/LanguageDropDown";
import { useNavigate } from "react-router-dom";

function Login() {
  const { t } = useTranslation("auth");
  const isMobile = useIsMobile();
  const loginCredentials = useAppStore((state) => state.loginCredentials);
  const setLoginCredentials = useAppStore((state) => state.setLoginCredentials);
  const navigate = useNavigate();

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
        { y: 0, opacity: 1, duration: 0.5, ease: "power2.out" }
      )
        .fromTo(
          headingRef.current,
          { y: 30, opacity: 0 },
          { y: 0, opacity: 1, duration: 0.5, ease: "power2.out" },
          "-=0.3"
        )
        .fromTo(
          formRef.current,
          { y: 30, opacity: 0 },
          { y: 0, opacity: 1, duration: 0.5, ease: "power2.out" },
          "-=0.3"
        );
    },
    { scope: containerRef }
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
          isMobile ? "" : "grid grid-cols-[33%_67%]"
        }`}
      >
        <main
          ref={containerRef}
          className={`flex flex-col justify-center items-center px-8 ${
            isMobile ? "min-h-screen justify-center items-center" : ""
          }`}
        >
          <div className="flex flex-col justify-center items-center gap-1 mb-2">
            <img ref={logoRef} src={Logo} alt="Logo" className="w-32 mb-6" />
            <div ref={headingRef}>
              <h1 className="text-4xl font-bold text-center">
                {t("login.welcome")}
              </h1>
              <p className="text-xl text-center text-muted-foreground">
                {t("login.subtitle")}
              </p>
            </div>
          </div>
          <div ref={formRef} className="w-full max-w-sm">
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
                label={t("login.email")}
                placeholder={t("login.emailPlaceholder")}
              />
              <MCInput
                type="password"
                label={t("login.password")}
                name="password"
                placeholder={t("login.passwordPlaceholder")}
              />
              <div className="flex justify-end w-full mb-4">
                <a
                  className="text-base text-primary font-semibold hover:underline"
                  onClick={() => navigate("/auth/forgot-password")}
                >
                  {t("login.forgot")}
                </a>
              </div>
              <MCButton type="submit" className="w-full" variant="primary">
                {t("login.submit")}
              </MCButton>
              <LanguageDropDown />
            </MCFormWrapper>
          </div>
        </main>
        {!isMobile && (
          <aside className="h-full w-full">
            <img alt="Login Aside" className="h-full w-full object-cover" />
          </aside>
        )}
      </div>
    </section>
  );
}

export default Login;
