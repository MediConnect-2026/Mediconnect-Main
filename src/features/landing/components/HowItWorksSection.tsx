import { useRef, useCallback } from "react";
import { useGSAP } from "@gsap/react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useTranslation } from "react-i18next";

import HowItWorksPanels, {
  STEP_COUNT,
} from "./sectionsComponents/HowItWorksPanels";
import { useIsMobile } from "@/lib/hooks/useIsMobile";

gsap.registerPlugin(ScrollTrigger);

interface HowItWorksSectionProps {
  onCarouselActiveChange?: (isActive: boolean) => void;
}

function HowItWorksSection({ onCarouselActiveChange }: HowItWorksSectionProps) {
  const { t } = useTranslation("landing");
  const isMobile = useIsMobile();

  const containerRef = useRef<HTMLDivElement>(null);
  const titleRef = useRef<HTMLHeadingElement>(null);
  const subtitleRef = useRef<HTMLHeadingElement>(null);
  const textRef = useRef<HTMLParagraphElement>(null);
  const panelsContainerRef = useRef<HTMLDivElement>(null);
  const panelsWrapperRef = useRef<HTMLDivElement>(null);
  const titlesContainerRef = useRef<HTMLDivElement>(null);
  const carouselContainerRef = useRef<HTMLDivElement>(null);

  // Callback estable — no provoca re-renders innecesarios
  const handleActive = useCallback(
    (v: boolean) => onCarouselActiveChange?.(v),
    [onCarouselActiveChange],
  );

  useGSAP(
    () => {
      // ── Entradas de texto ──────────────────────────────────────────
      const fadeUps = [
        { el: titlesContainerRef.current, delay: 0 },
        { el: carouselContainerRef.current, delay: 0.2 },
        { el: titleRef.current, delay: 0 },
        { el: subtitleRef.current, delay: 0 },
        { el: textRef.current, delay: 0.2 },
      ];

      fadeUps.forEach(({ el, delay }) => {
        if (!el) return;
        gsap.fromTo(
          el,
          { opacity: 0, y: 40 },
          {
            opacity: 1,
            y: 0,
            duration: 0.9,
            delay,
            ease: "power3.out",
            scrollTrigger: {
              trigger: el,
              start: "top 85%",
              toggleActions: "play none none none",
            },
          },
        );
      });

      // ── Carrusel horizontal ────────────────────────────────────────
      const container = panelsContainerRef.current;
      const wrapper = panelsWrapperRef.current;
      if (!container || !wrapper) return;

      const getTotal = () => wrapper.offsetWidth - container.offsetWidth;

      const tween = gsap.to(wrapper, {
        x: () => -getTotal(),
        ease: "none",
        scrollTrigger: {
          trigger: container,
          pin: true,
          scrub: 1,
          snap: {
            snapTo: 1 / (STEP_COUNT - 1),
            duration: 0.3,
            ease: "power1.inOut",
          },
          end: () => `+=${getTotal()}`,
          anticipatePin: 1,
          invalidateOnRefresh: true,
          onEnter: () => handleActive(true),
          onLeave: () => handleActive(false),
          onEnterBack: () => handleActive(true),
          onLeaveBack: () => handleActive(false),
        },
      });

      // ── Zoom + entrada de paneles ──────────────────────────────────
      const panels = gsap.utils.toArray<HTMLElement>(".hiw-panel");

      panels.forEach((panel, i) => {
        const img = panel.querySelector("img");

        if (img) {
          gsap.fromTo(
            img,
            { scale: 1.08 },
            {
              scale: 1,
              scrollTrigger: {
                trigger: panel,
                containerAnimation: tween,
                start: "left center",
                end: "center center",
                scrub: 1,
              },
            },
          );
        }

        gsap.fromTo(
          panel,
          { opacity: 0, scale: 0.95, y: 30 },
          {
            opacity: 1,
            scale: 1,
            y: 0,
            duration: 0.9,
            delay: i * 0.08,
            ease: "power3.out",
            scrollTrigger: {
              trigger: panel,
              containerAnimation: tween,
              start: "left center",
              end: "center center",
              toggleActions: "play none none none",
              scrub: 1,
            },
          },
        );
      });

      // ── Resize debounced ──────────────────────────────────────────
      let resizeTimer: ReturnType<typeof setTimeout>;
      const onResize = () => {
        clearTimeout(resizeTimer);
        resizeTimer = setTimeout(() => ScrollTrigger.refresh(), 150);
      };
      window.addEventListener("resize", onResize, { passive: true });

      // useGSAP limpia el contexto automáticamente (ctx.revert)
      // Solo necesitamos limpiar el listener manual
      return () => {
        clearTimeout(resizeTimer);
        window.removeEventListener("resize", onResize);
      };
    },
    { scope: containerRef, dependencies: [isMobile, handleActive] },
  );

  return (
    <main className="p-[15px] flex justify-center w-full">
      <div ref={containerRef} className="w-full">
        <section className="bg-white py-12 px-6 items-center w-full">
          <div
            ref={titlesContainerRef}
            className="flex flex-col items-center text-center gap-4"
          >
            <h4
              ref={titleRef}
              className="tracking-wide text-lg font-regular text-primary"
            >
              {t("how.title")}
            </h4>

            <h1
              ref={subtitleRef}
              className={`${
                isMobile ? "text-3xl" : "text-6xl"
              } font-medium text-primary mb-4`}
            >
              {t("how.subtitle")}
            </h1>

            <p
              ref={textRef}
              className="font-normal text-lg text-primary mb-4 w-full max-w-2xl"
            >
              {t("how.description")}
            </p>
          </div>
        </section>

        {/* Carrusel horizontal */}
        <div
          ref={panelsContainerRef}
          className="relative overflow-hidden bg-white"
        >
          <div
            ref={panelsWrapperRef}
            className="flex gap-4 pl-4 pr-4"
            style={{ width: `${STEP_COUNT * 95}vw` }}
          >
            {Array.from({ length: STEP_COUNT }, (_, i) => (
              <div
                key={i}
                // Clase renombrada para que no colisione con otros componentes
                className="hiw-panel w-[100vw] h-[100vh] bg-white flex items-center justify-center py-4"
              >
                <HowItWorksPanels stepIndex={i} />
              </div>
            ))}
          </div>
        </div>
      </div>
    </main>
  );
}

export default HowItWorksSection;
