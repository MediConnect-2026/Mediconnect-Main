import { useRef, useState, useCallback } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useGSAP } from "@gsap/react";
import {
  Zap,
  PiggyBank,
  ClipboardList,
  RefreshCw,
  Lock,
  Target,
  BarChart3,
  Sparkles,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useIsMobile } from "@/lib/hooks/useIsMobile";
import { useTranslation } from "react-i18next";

import { clBg } from "@/utils/cloudinary";

gsap.registerPlugin(ScrollTrigger);

interface Benefit {
  id: string;
  name: string;
  description: string;
  image: string;
  icon: React.ComponentType<{ className?: string }>;
}

const benefitIcons: Record<
  string,
  React.ComponentType<{ className?: string }>
> = {
  acceso: Zap,
  ahorro: PiggyBank,
  historial: ClipboardList,
  atencion: RefreshCw,
  comunicacion: Lock,
  decisiones: Target,
  gestion: BarChart3,
  experiencia: Sparkles,
};

const benefitImages: Record<string, string> = {
  acceso:
    "https://res.cloudinary.com/dy2wtanhl/image/upload/v1774851843/Immediate_Access_jbxpqn.png",
  ahorro:
    "https://res.cloudinary.com/dy2wtanhl/image/upload/v1774851407/Smart_Savings_mswnq2.png",
  historial:
    "https://res.cloudinary.com/dy2wtanhl/image/upload/v1774851513/Centralized_History_xxljly.png",
  atencion:
    "https://res.cloudinary.com/dy2wtanhl/image/upload/v1774851546/Continuous_Care_sktdum.png",
  comunicacion:
    "https://res.cloudinary.com/dy2wtanhl/image/upload/v1774851590/Secure_Communication_a1b4hf.png",
  decisiones:
    "https://res.cloudinary.com/dy2wtanhl/image/upload/v1771637852/about-image-main_jdoo35.png",
  gestion:
    "https://res.cloudinary.com/dy2wtanhl/image/upload/v1774851618/Accurate_Decisions_iawgkz.png",
  experiencia:
    "https://res.cloudinary.com/dy2wtanhl/image/upload/v1771637852/Funcionality-02_csn3rr.png",
};

interface BenefitsSectionProps {
  onCarouselActiveChange?: (isActive: boolean) => void;
}

export const IndustryCarousel = ({
  onCarouselActiveChange,
}: BenefitsSectionProps) => {
  const { t } = useTranslation("landing");
  const isMobile = useIsMobile();

  const benefits: Benefit[] = (
    t("benefitsSection.items", { returnObjects: true }) as any[]
  ).map((item: any) => ({
    ...item,
    icon: benefitIcons[item.id],
    image: clBg(benefitImages[item.id], isMobile),
  }));

  const [activeIndex, setActiveIndex] = useState(0);
  const [hasAnimated, setHasAnimated] = useState(false);

  const containerRef = useRef<HTMLDivElement>(null);
  const sectionRef = useRef<HTMLDivElement>(null);
  const photosContainerRef = useRef<HTMLDivElement>(null);
  const infoCardRef = useRef<HTMLDivElement>(null);
  const leftPanelRef = useRef<HTMLDivElement>(null);
  const rightPanelRef = useRef<HTMLDivElement>(null);
  const titleRef = useRef<HTMLDivElement>(null);

  const handleActive = useCallback(
    (v: boolean) => onCarouselActiveChange?.(v),
    [onCarouselActiveChange],
  );

  const getVisibleItems = () => {
    const items: { index: number; position: number }[] = [];
    if (isMobile) {
      items.push({ index: activeIndex, position: 0 });
      return items;
    }
    if (activeIndex === 0) {
      items.push({ index: 0, position: 0 });
      if (benefits.length > 1) items.push({ index: 1, position: 1 });
    } else if (activeIndex === benefits.length - 1) {
      if (benefits.length > 1)
        items.push({ index: activeIndex - 1, position: 0 });
      items.push({ index: activeIndex, position: 1 });
    } else {
      items.push({ index: activeIndex - 1, position: 0 });
      items.push({ index: activeIndex, position: 1 });
      items.push({ index: activeIndex + 1, position: 2 });
    }
    return items;
  };

  const visibleItems = getVisibleItems();
  const current = benefits[activeIndex];

  const getDotsRange = () => {
    const total = benefits.length;
    const max = 5;
    if (total <= max) return [0, total - 1];
    const half = Math.floor(max / 2);
    if (activeIndex < half) return [0, max - 1];
    if (activeIndex >= total - half) return [total - max, total - 1];
    return [activeIndex - half, activeIndex + half];
  };

  const getNavRange = () => {
    const total = benefits.length;
    const max = Math.min(5, total);
    if (total <= max) return [0, total - 1];
    const half = Math.floor(max / 2);
    if (activeIndex < half) return [0, max - 1];
    if (activeIndex >= total - half) return [total - max, total - 1];
    return [activeIndex - half, activeIndex + half];
  };

  const [dotsStart, dotsEnd] = getDotsRange();
  const [navStart, navEnd] = getNavRange();

  const updateActiveIndex = useCallback(
    (newIndex: number) => {
      if (newIndex < 0 || newIndex >= benefits.length) return;
      if (infoCardRef.current && !isMobile) {
        gsap.to(infoCardRef.current, {
          y: 15,
          autoAlpha: 0,
          duration: 0.2,
          ease: "power2.in",
          onComplete: () => {
            setActiveIndex(newIndex);
            gsap.to(infoCardRef.current, {
              y: 0,
              autoAlpha: 1,
              duration: 0.4,
              ease: "power2.out",
            });
          },
        });
      } else {
        setActiveIndex(newIndex);
      }
    },
    [benefits.length, isMobile],
  );

  const handleNavClick = useCallback(
    (index: number) => {
      if (index === activeIndex || !containerRef.current) return;
      const top =
        containerRef.current.getBoundingClientRect().top +
        window.scrollY +
        index * window.innerHeight;
      window.scrollTo({ top, behavior: "smooth" });
    },
    [activeIndex],
  );

  // 1. Scroll pinning y animaciones principales
  useGSAP(
    () => {
      if (
        !sectionRef.current ||
        !containerRef.current ||
        !photosContainerRef.current
      )
        return;

      const totalSections = benefits.length;
      const sectionHeight = window.innerHeight;
      containerRef.current.style.height = `${sectionHeight * totalSections}px`;

      const photos = gsap.utils.toArray<HTMLElement>(
        ".ic-photo:not(:first-child)",
      );
      const allPhotos = gsap.utils.toArray<HTMLElement>(".ic-photo");

      gsap.set(photos, { clipPath: "inset(100% 0% 0% 0%)", autoAlpha: 1 });

      ScrollTrigger.create({
        trigger: containerRef.current,
        start: "top top",
        end: `+=${sectionHeight * (totalSections - 1)}`,
        pin: sectionRef.current,
        pinSpacing: true,
        anticipatePin: 1,
        fastScrollEnd: true, // ← add this line
        invalidateOnRefresh: true,
        onEnter: () => handleActive(true),
        onLeave: () => handleActive(false),
        onEnterBack: () => handleActive(true),
        onLeaveBack: () => handleActive(false),
      });

      benefits.forEach((_, index) => {
        if (index === 0) return;

        const animation = gsap.timeline().to(allPhotos[index], {
          clipPath: "inset(0% 0% 0% 0%)",
          autoAlpha: 1,
          duration: 1.5,
          ease: "power2.inOut",
        });

        ScrollTrigger.create({
          trigger: containerRef.current,
          start: () => `top+=${(index - 0.5) * sectionHeight} top`,
          end: () => `top+=${(index + 0.5) * sectionHeight} top`,
          animation,
          scrub: 1,
          onEnter: () => updateActiveIndex(index),
          onEnterBack: () => updateActiveIndex(index - 1),
        });
      });

      ScrollTrigger.create({
        trigger: containerRef.current,
        start: "top top",
        end: `bottom+=${sectionHeight * 0.2} top`,
        onLeave: () => handleActive(false),
        onLeaveBack: () => handleActive(false),
      });

      let resizeTimer: ReturnType<typeof setTimeout>;
      const onResize = () => {
        clearTimeout(resizeTimer);
        resizeTimer = setTimeout(() => ScrollTrigger.refresh(), 150);
      };
      window.addEventListener("resize", onResize, { passive: true });

      return () => {
        clearTimeout(resizeTimer);
        window.removeEventListener("resize", onResize);
        handleActive(false);
      };
    },
    {
      scope: containerRef,
      dependencies: [isMobile, handleActive, benefits.length],
    },
  );

  // 2. Info card y foto activa animación
  useGSAP(
    () => {
      if (infoCardRef.current) {
        gsap.fromTo(
          infoCardRef.current,
          { opacity: 0, y: 30, scale: 0.97 },
          { opacity: 1, y: 0, scale: 1, duration: 0.7, ease: "power3.out" },
        );
      }

      const activePhoto = document.querySelectorAll(".ic-photo")[activeIndex];
      if (activePhoto) {
        gsap.fromTo(
          activePhoto,
          { opacity: 0, scale: 0.97 },
          { opacity: 1, scale: 1, duration: 0.7, ease: "power3.out" },
        );
      }
    },
    { scope: containerRef, dependencies: [activeIndex] },
  );

  // 3. Paneles desktop animación de entrada
  useGSAP(
    () => {
      if (hasAnimated || isMobile) return;
      if (!leftPanelRef.current || !rightPanelRef.current || !titleRef.current)
        return;

      gsap.set([leftPanelRef.current, rightPanelRef.current], {
        opacity: 0,
        y: 60,
      });
      gsap.set(titleRef.current, { opacity: 0, y: 30 });

      const tl = gsap.timeline({
        scrollTrigger: {
          trigger: containerRef.current,
          start: "top 85%",
          toggleActions: "play none none none",
          onEnter: () => setHasAnimated(true),
        },
      });

      tl.to(leftPanelRef.current, {
        opacity: 1,
        y: 0,
        duration: 0.8,
        ease: "power3.out",
      })
        .to(
          rightPanelRef.current,
          { opacity: 1, y: 0, duration: 0.8, ease: "power3.out" },
          "-=0.4",
        )
        .to(
          titleRef.current,
          { opacity: 1, y: 0, duration: 0.6, ease: "power3.out" },
          "-=0.6",
        );
    },
    { scope: containerRef, dependencies: [hasAnimated, isMobile] },
  );

  // ...JSX igual que antes...
  if (isMobile) {
    return (
      <div ref={containerRef} className="relative bg-primary">
        <div
          ref={sectionRef}
          className="h-screen flex items-center justify-center bg-primary"
        >
          <div className="relative w-full h-full max-w-lg">
            <div
              ref={titleRef}
              className="absolute top-8 left-0 right-0 z-50 flex flex-col items-center text-3xl font-semibold text-white gap-2"
            >
              {t("benefitsSection.title")}
              <h2 className="text-white text-xl font-medium text-center">
                {current.name}
              </h2>
            </div>

            {/* Dots */}
            <div className="absolute left-10 top-1/2 -translate-y-1/2 z-50">
              <div className="flex flex-col gap-2 px-2 py-3 rounded-full border border-white/20 bg-black/10 backdrop-blur-md">
                {benefits.slice(dotsStart, dotsEnd + 1).map((_, idx) => {
                  const index = dotsStart + idx;
                  return (
                    <button
                      key={index}
                      onClick={() => handleNavClick(index)}
                      className={cn(
                        "w-2 h-2 rounded-full transition-all duration-300",
                        index === activeIndex
                          ? "bg-white scale-125 shadow-lg"
                          : "bg-white/40 hover:bg-white/70",
                      )}
                    />
                  );
                })}
              </div>
            </div>

            <div ref={photosContainerRef} className="absolute inset-4">
              <div className="absolute inset-0 bg-black/10 rounded-2xl pointer-events-none md:hidden z-20" />
              {benefits.map((benefit, index) => (
                <img
                  key={benefit.id}
                  src={benefit.image}
                  alt={benefit.name}
                  loading={index === 0 ? "eager" : "lazy"}
                  decoding="async"
                  className={cn(
                    // Clase renombrada para no colisionar con HowItWorksSection
                    "ic-photo absolute inset-0 w-full h-full object-cover transition-opacity duration-500 rounded-2xl",
                    index === activeIndex ? "opacity-100" : "opacity-0",
                  )}
                  style={{ zIndex: index === activeIndex ? 10 : 1 }}
                />
              ))}
            </div>

            <div
              ref={infoCardRef}
              className="absolute bottom-8 left-10 right-10 px-4 py-3 rounded-2xl border border-white/30 bg-black/20 backdrop-blur-xl shadow-2xl z-50"
            >
              <p className="text-white text-sm font-normal tracking-wide text-center leading-relaxed">
                {current.description}
              </p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // ── Desktop ───────────────────────────────────────────────────────────
  return (
    <div
      ref={containerRef}
      className="relative bg-primary"
      style={{ height: `${benefits.length * 100}vh` }}
    >
      <div
        ref={sectionRef}
        className="h-screen md:p-8 flex items-center justify-center bg-primary"
      >
        <div className="w-full h-full gap-4 p-4 grid grid-cols-1 lg:grid-cols-12 md:p-10">
          {/* Left Panel */}
          <div
            ref={leftPanelRef}
            className="bg-[#F5FAF3] rounded-2xl flex flex-col justify-between relative overflow-hidden p-6 md:p-10 lg:col-span-5"
            style={{ opacity: 0 }}
          >
            <div className="text-center">
              <p ref={titleRef} className="text-primary font-medium text-xl">
                {t("benefitsSection.title")}
              </p>
            </div>

            <div className="flex-1 flex flex-col items-center justify-center py-6">
              <div className="space-y-3 text-center">
                {visibleItems.map((item) => {
                  const isActive =
                    visibleItems.length === 2 && activeIndex === 0
                      ? item.position === 0
                      : visibleItems.length === 2 &&
                          activeIndex === benefits.length - 1
                        ? item.position === 1
                        : item.position === 1;
                  return (
                    <div
                      key={item.index}
                      onClick={() => handleNavClick(item.index)}
                      className={cn(
                        "cursor-pointer transition-all duration-500 text-primary",
                        isActive
                          ? "text-2xl md:text-3xl font-semibold scale-105"
                          : "text-lg md:text-xl opacity-30",
                      )}
                    >
                      {benefits[item.index].name}
                    </div>
                  );
                })}
              </div>
            </div>

            <div className="flex justify-center gap-2 overflow-hidden">
              <div className="flex gap-2 transition-all duration-500 ease-out">
                {benefits.slice(navStart, navEnd + 1).map((benefit, idx) => {
                  const index = navStart + idx;
                  const isActive = activeIndex === index;
                  return (
                    <button
                      key={benefit.id}
                      onClick={() => handleNavClick(index)}
                      className={cn(
                        "transition-all duration-500 cursor-pointer relative text-xs",
                        isActive
                          ? "text-card-foreground font-medium opacity-100"
                          : "text-card-foreground/40 hover:text-card-foreground/60 opacity-60",
                      )}
                    >
                      {benefit.name}
                      {isActive && (
                        <div className="absolute left-1/2 -translate-x-1/2 w-1 h-1 bg-card-foreground rounded-full opacity-80 -bottom-2" />
                      )}
                    </button>
                  );
                })}
              </div>
            </div>
          </div>

          {/* Right Panel */}
          <div
            ref={rightPanelRef}
            className="relative rounded-2xl overflow-hidden lg:col-span-7 min-h-[400px]"
            style={{ opacity: 0 }}
          >
            <div ref={photosContainerRef} className="absolute inset-0">
              {benefits.map((benefit, index) => (
                <img
                  key={benefit.id}
                  src={benefit.image}
                  alt={benefit.name}
                  loading={index === 0 ? "eager" : "lazy"}
                  decoding="async"
                  // Clase renombrada: ic-photo (IndustryCarousel photo)
                  className="ic-photo absolute inset-0 w-full h-full object-cover"
                  style={{ zIndex: index }}
                />
              ))}
            </div>

            <div
              ref={infoCardRef}
              className="absolute bottom-6 right-6 md:bottom-10 md:right-8 max-w-lg px-5 py-4 md:px-7 md:py-5 rounded-2xl border border-white/30 bg-black/20 backdrop-blur-xl shadow-2xl z-50"
            >
              <p className="text-white font-normal tracking-wide text-left drop-shadow-lg leading-relaxed text-sm md:text-base">
                {current.description}
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default IndustryCarousel;
