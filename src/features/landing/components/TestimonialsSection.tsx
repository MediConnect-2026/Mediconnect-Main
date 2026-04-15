import { useRef } from "react";
import { useIsMobile } from "@/lib/hooks/useIsMobile";

import { useGSAP } from "@gsap/react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useTranslation } from "react-i18next";

import TestimonialsCards from "./sectionsComponents/TestimonialsCards";
gsap.registerPlugin(ScrollTrigger);

function TestimonialsSection() {
  const isMobile = useIsMobile();
  const { t } = useTranslation("landing");
  const containerRef = useRef<HTMLDivElement>(null);
  const titleRef = useRef<HTMLHeadingElement>(null);
  const subtitleRef = useRef<HTMLHeadingElement>(null);
  const cardsRef = useRef<HTMLDivElement>(null);

  useGSAP(
    () => {
      // Animación del título
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

      // Animación del subtítulo
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

      // Animación escalonada para cada tarjeta
      const cards = gsap.utils.toArray<HTMLElement>(".testimonial-card");
      gsap.fromTo(
        cards,
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
          stagger: 0.15,
          ease: "power3.out",
          scrollTrigger: {
            trigger: cardsRef.current,
            start: "top 90%",
            toggleActions: "play none none none",
          },
        },
      );
    },
    { scope: containerRef },
  );

  return (
    <main className="p-[15px] flex w-full justify-center ">
      <section
        ref={containerRef}
        className="bg-white py-12 px-6 gap-2 items-center w-full"
      >
        <div className="flex flex-col gap-6 w-full h-full">
          {/* TÍTULOS - CENTRADOS */}
          <div
            className={`${
              isMobile ? "text-center" : "text-start"
            } flex flex-col  gap-4 w-full`}
          >
            <h4
              ref={titleRef}
              className="tracking-wide text-lg font-regular text-primary"
            >
              {t("testimonials.title", "Testimonials")}
            </h4>

            <h1
              ref={subtitleRef}
              className={`${
                isMobile ? "text-3xl " : "text-6xl"
              } font-medium text-primary mb-4 `}
            >
              {t(
                "testimonials.subtitle",
                "Join those who care for their health",
              )}
            </h1>
          </div>

          {/* TESTIMONIALS CARDS */}
          <div
            ref={cardsRef}
            className="flex w-full justify-center items-center"
          >
            <TestimonialsCards />
          </div>
        </div>
      </section>
    </main>
  );
}

export default TestimonialsSection;
