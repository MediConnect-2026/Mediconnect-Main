import { useRef } from "react";
import { useGSAP } from "@gsap/react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useTranslation } from "react-i18next";
import { useIsMobile } from "@/lib/hooks/useIsMobile";
import FuncionalityCards from "./sectionsComponents/FuncionalityCards";

gsap.registerPlugin(ScrollTrigger);

function FuncionalitySection() {
  const { t } = useTranslation("landing");
  const isMobile = useIsMobile();

  // Refs para animaciones
  const containerRef = useRef(null);
  const titleRef = useRef(null);
  const subtitleRef = useRef(null);
  const textRef = useRef(null);
  const cardsContainerRef = useRef(null);

  useGSAP(
    () => {
      // Título
      gsap.fromTo(
        titleRef.current,
        {
          opacity: 0,
          y: 30,
        },
        {
          opacity: 1,
          y: 0,
          duration: 0.8,
          ease: "power3.out",
          scrollTrigger: {
            trigger: titleRef.current,
            start: "top 85%",
            toggleActions: "play none none none",
          },
        },
      );

      // Subtítulo
      gsap.fromTo(
        subtitleRef.current,
        {
          opacity: 0,
          y: 50,
        },
        {
          opacity: 1,
          y: 0,
          duration: 1,
          ease: "power3.out",
          scrollTrigger: {
            trigger: subtitleRef.current,
            start: "top 85%",
            toggleActions: "play none none none",
          },
        },
      );

      // Texto
      gsap.fromTo(
        textRef.current,
        {
          opacity: 0,
          y: 30,
        },
        {
          opacity: 1,
          y: 0,
          duration: 0.8,
          delay: 0.2,
          ease: "power3.out",
          scrollTrigger: {
            trigger: textRef.current,
            start: "top 85%",
            toggleActions: "play none none none",
          },
        },
      );

      // Animación para el contenedor de las cards
      gsap.fromTo(
        cardsContainerRef.current,
        {
          opacity: 0,
          scale: 0.95,
          y: 40,
        },
        {
          opacity: 1,
          scale: 1,
          y: 0,
          duration: 1,
          ease: "power3.out",
          scrollTrigger: {
            trigger: cardsContainerRef.current,
            start: "top 90%",
            toggleActions: "play none none none",
          },
        },
      );
    },
    { scope: containerRef },
  );

  return (
    <main className="p-[15px] flex w-full justify-center">
      <section
        ref={containerRef}
        className="bg-white py-12 px-6 gap-2 items-center w-full"
      >
        <div className="flex flex-col gap-6 w-full h-full">
          {/* TÍTULOS - CENTRADOS */}
          <div className="flex flex-col items-center text-center gap-4">
            <h4
              ref={titleRef}
              className="tracking-wide text-lg font-regular text-primary"
            >
              {t("functionality.title")}
            </h4>

            <h1
              ref={subtitleRef}
              className={`${
                isMobile ? "text-3xl" : "text-6xl"
              } font-medium text-primary mb-4`}
            >
              {t("functionality.subtitle")}
            </h1>

            <p
              ref={textRef}
              className="font-normal text-lg text-primary mb-4 w-full max-w-2xl"
            >
              {t("functionality.description")}
            </p>
          </div>

          {/* FUNCTIONALITY CARDS */}
          <div
            ref={cardsContainerRef}
            className="flex w-full justify-center items-center"
          >
            <FuncionalityCards />
          </div>
        </div>
      </section>
    </main>
  );
}

export default FuncionalitySection;
