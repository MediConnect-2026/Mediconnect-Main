import { useRef, useState } from "react";
import { useTranslation } from "react-i18next";
import MediButton from "@/shared/components/landing/MediButton";
import MCInput from "@/shared/components/forms/MCInput";
import MCFormWrapper from "@/shared/components/forms/MCFormWrapper";
import { newsletterSchema } from "@/schema/landingSchema";

import { useLandingStore } from "@/stores/useLandingPage";
import { cl } from "@/utils/cloudinary";
import { useLanding } from "@/features/landing/hooks/UseLanding";

import { useGSAP } from "@gsap/react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { Loader2 } from "lucide-react";
gsap.registerPlugin(ScrollTrigger);

const Footer = () => {
  const { t } = useTranslation("landing");

  const newsletterForm = useLandingStore((state) => state.newsletterForm);
  const setNewsletterForm = useLandingStore((state) => state.setNewsletterForm);

  const { sendNewsletter, isSendingNewsletter } = useLanding();
  const [formKey, setFormKey] = useState(0);

  const containerRef = useRef(null);
  const brandRef = useRef(null);
  const quickLinksRef = useRef(null);
  const newsletterRef = useRef(null);
  const bottomBarRef = useRef(null);

  useGSAP(
    () => {
      gsap.fromTo(
        brandRef.current,
        {
          opacity: 0,
          y: 40,
        },
        {
          opacity: 1,
          y: 0,
          duration: 0.8,
          ease: "power3.out",
          scrollTrigger: {
            trigger: brandRef.current,
            start: "top 85%",
            toggleActions: "play none none none",
          },
        },
      );

      // Quick links animation
      gsap.fromTo(
        quickLinksRef.current,
        {
          opacity: 0,
          y: 40,
        },
        {
          opacity: 1,
          y: 0,
          duration: 0.8,
          delay: 0.2,
          ease: "power3.out",
          scrollTrigger: {
            trigger: quickLinksRef.current,
            start: "top 85%",
            toggleActions: "play none none none",
          },
        },
      );

      // Newsletter section animation
      gsap.fromTo(
        newsletterRef.current,
        {
          opacity: 0,
          y: 40,
        },
        {
          opacity: 1,
          y: 0,
          duration: 0.8,
          delay: 0.4,
          ease: "power3.out",
          scrollTrigger: {
            trigger: newsletterRef.current,
            start: "top 85%",
            toggleActions: "play none none none",
          },
        },
      );

      // Bottom bar animation
      gsap.fromTo(
        bottomBarRef.current,
        {
          opacity: 0,
          y: 30,
        },
        {
          opacity: 1,
          y: 0,
          duration: 0.8,
          delay: 0.6,
          ease: "power3.out",
          scrollTrigger: {
            trigger: bottomBarRef.current,
            start: "top 90%",
            toggleActions: "play none none none",
          },
        },
      );
    },
    { scope: containerRef },
  );

  const handleSubmit = async () => {
    try {
      await sendNewsletter({ email: newsletterForm.email });

      // Limpia store
      setNewsletterForm({ email: "" });

      // Fuerza remount del form (limpia RHF interno)
      setFormKey((prev) => prev + 1);
    } catch {
      // toast error se maneja en useLanding
    }
  };

  const footerLogo = cl(
    "https://res.cloudinary.com/dy2wtanhl/image/upload/v1771637881/MediConnectLanding_ryopcw.png",
    { width: 160, quality: "auto:best" },
  );

  return (
    <footer className="py-4 sm:py-6 lg:py-8 px-4 sm:px-6 lg:px-8">
      {/* Main Footer Content */}
      <div
        ref={containerRef}
        className="bg-primary rounded-[20px] sm:rounded-[25px] lg:rounded-[35px]"
      >
        <div className="rounded-[20px] sm:rounded-[25px] lg:rounded-[35px] border border-primary/20 bg-primary py-8 sm:py-10 lg:py-14 px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col lg:flex-row justify-between gap-8 sm:gap-10 lg:gap-8 mx-auto items-center lg:items-start">
            {/* Brand Column */}
            <div
              ref={brandRef}
              className="flex flex-col gap-y-4 sm:gap-y-4 text-center lg:text-left w-full lg:w-auto"
            >
              <h3 className="text-2xl sm:text-3xl font-extrabold text-white flex items-center justify-center lg:justify-start gap-3 mb-1">
                <img
                  src={footerLogo}
                  alt="MediConnect Logo"
                  loading="lazy"
                  decoding="async"
                  className="h-14 w-14 sm:h-16 sm:w-16 lg:h-20 lg:w-20 drop-shadow-lg"
                />
                <span className="tracking-wide drop-shadow-md">
                  MediConnect
                </span>
              </h3>
              <p className="text-sm sm:text-base leading-relaxed text-white max-w-md mx-auto lg:mx-0">
                {t("footer.brandDesc")}
              </p>
            </div>

            {/* Newsletter Column */}
            <div
              ref={newsletterRef}
              className="flex flex-col gap-y-4 sm:gap-y-4 text-center lg:text-left w-full lg:w-auto"
            >
              <h3 className="text-lg sm:text-xl font-semibold text-white">
                {t("footer.newsletterTitle")}
              </h3>
              <p className="text-sm sm:text-base text-white max-w-md mx-auto lg:mx-0 mb-2">
                {t("footer.newsletterDesc")}
              </p>

              {/* Newsletter Form */}
              <div className="w-full">
                <MCFormWrapper
                  key={formKey}
                  onSubmit={handleSubmit}
                  schema={newsletterSchema}
                  defaultValues={{ email: newsletterForm.email }}
                  className="w-full"
                >
                  <div className="flex flex-col gap-3 w-full max-w-md mx-auto lg:mx-0 sm:flex-row sm:gap-2">
                    <div className="flex-1">
                      <MCInput
                        name="email"
                        type="email"
                        placeholder={t("footer.InputPlaceholder")}
                        value={newsletterForm.email}
                        onChange={(e) =>
                          setNewsletterForm({ email: e.target.value })
                        }
                        required
                        className="bg-white text-primary h-12 sm:h-[52px] w-full text-sm sm:text-base transition-all duration-300 hover:shadow-lg focus:shadow-lg focus:scale-[1.02] rounded-full rounded-full px-4 sm:px-6"
                      />
                    </div>
                    <div className="w-full sm:w-auto">
                      <MediButton
                        type="submit"
                        className="bg-accent text-primary h-12 sm:h-[52px] text-sm sm:text-base flex items-center justify-center shadow transition-all duration-300 w-full sm:w-auto sm:min-w-[140px] hover:scale-105 hover:shadow-lg hover:bg-accent/90 rounded-full"
                        aria-label="Enviar"
                        disabled={!newsletterForm.email || isSendingNewsletter}
                      >
                        {isSendingNewsletter ? (
                          <span className="inline-flex items-center gap-2">
                            <Loader2 className="h-4 w-4 animate-spin" />
                            {t("footer.sending", "Cargando...")}
                          </span>
                        ) : (
                          t("footer.newsletterBtn")
                        )}
                      </MediButton>
                    </div>
                  </div>
                </MCFormWrapper>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom Bar */}
        <div
          ref={bottomBarRef}
          className="border-t border-white/20 py-3 sm:py-4"
        >
          <div className="mx-auto flex flex-col items-center justify-between gap-4 sm:gap-4 px-4 sm:px-6 lg:px-8 py-4 sm:py-4 lg:py-6 md:flex-row">
            <p className="text-xs sm:text-sm text-white text-center md:text-left hover:text-accent transition-colors duration-300">
              {t("footer.copyright")}
            </p>
            <div className="flex flex-wrap items-center justify-center gap-4 sm:gap-6">
              <a
                href="#"
                className="text-xs sm:text-sm text-white transition-all duration-300 hover:text-accent whitespace-nowrap hover:scale-105 hover:translate-y-[-2px]"
              >
                {t("footer.terms")}
              </a>
              <a
                href="#"
                className="text-xs sm:text-sm text-white transition-all duration-300 hover:text-accent whitespace-nowrap hover:scale-105 hover:translate-y-[-2px]"
              >
                {t("footer.privacy")}
              </a>
              <a
                href="#"
                className="text-xs sm:text-sm text-white transition-all duration-300 hover:text-accent whitespace-nowrap hover:scale-105 hover:translate-y-[-2px]"
              >
                {t("footer.contact")}
              </a>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
