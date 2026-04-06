import { useGSAP } from "@gsap/react";
import gsap from "gsap";
import MediButton from "@/shared/components/landing/MediButton";
import Navbar from "./Navbar";
import MobileNavbar from "./MobileNavbar";

import { useIsMobile } from "@/lib/hooks/useIsMobile";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useEffect, useRef, useState } from "react";
import { useTranslation } from "react-i18next";
import { clHero } from "@/utils/cloudinary";
import { useNavigate } from "react-router-dom";
import { ROUTES } from "@/router/routes";

gsap.registerPlugin(ScrollTrigger);

interface HeroImageSectionProps {
  isCarouselActive?: boolean;
}

function HeroImageSection({ isCarouselActive = false }: HeroImageSectionProps) {
  const isMobile = useIsMobile();
  const { t } = useTranslation("landing");
  const [showFixedNavbar, setShowFixedNavbar] = useState(false);
  const lastScrollYRef = useRef(0); // ✅ Usar ref en vez de state

  // Control del fixed navbar con scroll direction
  useEffect(() => {
    const handleScroll = () => {
      if (isCarouselActive) {
        setShowFixedNavbar(false);
        lastScrollYRef.current = window.scrollY;
        return;
      }

      const currentScrollY = window.scrollY;
      const hero = document.getElementById("hero-container");
      if (!hero) return;

      const heroBottom = hero.getBoundingClientRect().bottom;
      const scrollingUp = currentScrollY < lastScrollYRef.current;

      // Mostrar fixed navbar si:
      // 1. Estás haciendo scroll hacia arriba Y
      // 2. Has pasado el hero (heroBottom <= 0)
      if (scrollingUp && heroBottom <= 0) {
        setShowFixedNavbar(true);
      }
      // Ocultar si estás en el Hero section (heroBottom > 0)
      else if (heroBottom > 0) {
        setShowFixedNavbar(false);
      }
      // Ocultar si haces scroll hacia abajo
      else if (!scrollingUp && currentScrollY > lastScrollYRef.current) {
        setShowFixedNavbar(false);
      }

      lastScrollYRef.current = currentScrollY;
    };

    window.addEventListener("scroll", handleScroll, { passive: true });
    handleScroll();

    return () => window.removeEventListener("scroll", handleScroll);
  }, [lastScrollYRef.current, isMobile, isCarouselActive]);

  const heroImageUrl = clHero(
    "https://res.cloudinary.com/dy2wtanhl/image/upload/v1771637857/HeroImage_vyiijs.jpg",
  );
  const navigate = useNavigate();

  useGSAP(() => {
    gsap.fromTo(
      "#hero-image",
      { scale: 1.3, opacity: 1 },
      { duration: 1.2, scale: 1, opacity: 1, ease: "power3.out" },
    );

    // Solo animación para desktop
    if (!isMobile) {
      gsap.fromTo(
        "#navbar",
        { y: -100, opacity: 0 },
        { duration: 1, y: 0, opacity: 1, ease: "power3.out", delay: 0.2 },
      );
    }

    gsap.fromTo(
      "#info-content > *",
      { y: 60, opacity: 0 },
      {
        y: 0,
        opacity: 1,
        duration: 1,
        ease: "power3.out",
        stagger: { each: 0.15 },
        delay: 0.2,
      },
    );

    // Animación de scroll - SOLO EN DESKTOP
    if (!isMobile) {
      gsap.to("#hero-container", {
        padding: "0px",
        ease: "power2.inOut",
        scrollTrigger: {
          trigger: "#hero-container",
          start: "top top",
          end: "bottom 80%",
          scrub: 1,
        },
      });

      gsap.to("#hero-image", {
        borderRadius: "0px",
        ease: "power2.inOut",
        scrollTrigger: {
          trigger: "#hero-container",
          start: "top top",
          end: "bottom 80%",
          scrub: 1,
        },
      });

      gsap.set("#fixed-navbar", { y: -100, opacity: 0 });
    }
  }, [isMobile]);

  return (
    <>
      {/* Fixed navbar que aparece con scroll hacia arriba */}
      {showFixedNavbar &&
        (isMobile ? (
          <MobileNavbar id="fixed-navbar" isFixed={true} />
        ) : (
          <Navbar id="fixed-navbar" isFixed={true} />
        ))}

      <div
        id="hero-container"
        className={`h-dvh w-full box-border flex items-center justify-center bg-white ${
          isMobile ? "" : "p-[15px]"
        }`}
      >
        <div className="relative w-full h-full flex items-center justify-center ">
          <img
            src={heroImageUrl}
            id="hero-image"
            alt="Hero"
            loading="eager"
            fetchPriority="high"
            className={`object-cover pointer-events-none z-0 ${
              isMobile
                ? "absolute top-0 left-0 w-full h-full object-right"
                : "rounded-[35px] w-full h-full"
            }`}
          />
          <div className="absolute top-0 left-0 w-full h-full flex flex-col justify-between p-6 z-10">
            {isMobile ? (
              <MobileNavbar id="navbarmobile" isFixed={false} />
            ) : (
              <Navbar id="navbar" isFixed={false} />
            )}

            <div
              className={`flex flex-col items-start justify-end h-full px-6 gap-4 ${
                isMobile ? "max-w-md" : ""
              }`}
              id="info-content"
            >
              <h4
                className={`tracking-wide ${
                  isMobile ? "text-base" : "text-xl"
                } font-regular text-background`}
              >
                {t("hero.welcome")}
              </h4>
              <h1
                className={`${
                  isMobile ? "text-3xl" : "text-6xl"
                } font-medium text-background`}
                dangerouslySetInnerHTML={{ __html: t("hero.title") }}
              />
              <p
                className={`font-medium text-background ${
                  isMobile ? "text-base max-w-xs" : "text-xl max-w-xl"
                }`}
              >
                {t("hero.description")}
              </p>
              <div className="flex gap-4">
                <MediButton
                  variant="primary"
                  className={`bg-white text-primary ${
                    isMobile
                      ? "active:scale-95 active:opacity-90 transition-all duration-150"
                      : ""
                  }`}
                  onClick={() => navigate(ROUTES.LOGIN)}
                >
                  {t("hero.connect")}
                </MediButton>
                <MediButton
                  variant="secondary"
                  className={`text-white bg-transparent border-white ${
                    isMobile
                      ? "active:scale-95 active:bg-white/10 transition-all duration-150"
                      : ""
                  }`}
                  onClick={() => navigate(ROUTES.REGISTER)}
                >
                  {t("hero.startNow")}
                </MediButton>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}

export default HeroImageSection;
