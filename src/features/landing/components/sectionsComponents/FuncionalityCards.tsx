import { useRef } from "react";
import { useGSAP } from "@gsap/react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useTranslation } from "react-i18next";

import { clCard } from "@/utils/cloudinary";

gsap.registerPlugin(ScrollTrigger);

interface FuncionalityCardsProps {
  cardClassName?: string;
}

function FuncionalityCards({ cardClassName }: FuncionalityCardsProps) {
  const { t } = useTranslation("landing");

  // Refs para las animaciones
  const containerRef = useRef<HTMLDivElement>(null);
  const mobileGridRef = useRef<HTMLDivElement>(null);
  const tabletGridRef = useRef<HTMLDivElement>(null);
  const desktopSmallGridRef = useRef<HTMLDivElement>(null);
  const desktopLargeGridRef = useRef<HTMLDivElement>(null);

  const cardImages = [
    "https://res.cloudinary.com/dy2wtanhl/image/upload/v1774848782/Real-Time_Teleconsultations_tlvk8x.png",
    "https://res.cloudinary.com/dy2wtanhl/image/upload/v1774848838/Digital_Medical_History_fl73wo.png",
    "https://res.cloudinary.com/dy2wtanhl/image/upload/v1774848803/ChatGPT_Image_30_mar_2026_01_32_36_a.m._ln1u9w.png",
    "https://res.cloudinary.com/dy2wtanhl/image/upload/v1774848803/ChatGPT_Image_30_mar_2026_01_32_32_a.m._rawg8r.png",
  ];

  const cards = cardImages.map((img, index) => ({
    img,
    title: t(`functionality.cards.${index}.title`),
    desc: t(`functionality.cards.${index}.description`),
  }));

  const Card = ({
    card,
    className = "",
    cardRef,
  }: {
    card: (typeof cards)[0];
    className?: string;
    cardRef?: React.RefObject<HTMLDivElement>;
  }) => (
    <div
      ref={cardRef}
      className={`bg-white rounded-3xl bg-gradient-to-b 
        from-white from-[0%]
        via-[#F5FAF3] via-[71%]
        to-[#D7E3C9]/25 to-[100%] overflow-hidden 
        flex flex-col gap-2 sm:gap-3 md:gap-4 items-center justify-center 
        p-3 sm:p-4 md:p-6 lg:p-8 ${className} border border-accent/40 functionality-card`}
    >
      <div className="overflow-hidden inline-block rounded-2xl sm:rounded-3xl w-full flex-1">
        <img
          src={clCard(card.img)}
          alt={card.title}
          loading="lazy"
          decoding="async"
          className="w-full h-full object-cover hover:scale-110 transition-transform duration-500"
        />
      </div>
      <div className="flex flex-col justify-start w-full">
        <h3 className="font-semibold text-primary mb-1 sm:mb-2 md:mb-3 text-start text-lg sm:text-xl md:text-2xl lg:text-3xl">
          {card.title}
        </h3>
        <p className="text-primary text-start text-xs sm:text-sm md:text-base lg:text-lg">
          {card.desc}
        </p>
      </div>
    </div>
  );

  useGSAP(
    () => {
      if (!containerRef.current) return;

      // Animación para las tarjetas con escalonamiento
      const cards = gsap.utils.toArray<HTMLElement>(".functionality-card");

      cards.forEach((card, index) => {
        gsap.fromTo(
          card,
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
            delay: index * 0.15, // Escalonar las animaciones
            ease: "power3.out",
            scrollTrigger: {
              trigger: card,
              start: "top 90%",
              toggleActions: "play none none none",
            },
          },
        );
      });

      // Animación adicional para el hover effect
      cards.forEach((card) => {
        const img = card.querySelector("img");
        if (img) {
          card.addEventListener("mouseenter", () => {
            gsap.to(card, {
              y: -8,
              scale: 1.02,
              duration: 0.3,
              ease: "power2.out",
            });
          });

          card.addEventListener("mouseleave", () => {
            gsap.to(card, {
              y: 0,
              scale: 1,
              duration: 0.3,
              ease: "power2.out",
            });
          });
        }
      });
    },
    { scope: containerRef },
  );

  return (
    <div ref={containerRef} className="w-full flex justify-center px-2 sm:px-4">
      {/* Móvil: grid 2 columnas */}
      <div ref={mobileGridRef} className="block sm:hidden w-full">
        <div className="flex flex-col gap-4">
          {cards.map((card, index) => (
            <Card
              key={index}
              card={card}
              className={`h-[350px] ${cardClassName ?? ""}`}
            />
          ))}
        </div>
      </div>

      {/* Tablet: grid 2x2 */}
      <div
        ref={tabletGridRef}
        className="hidden sm:block md:hidden w-full max-w-2xl"
      >
        <div className="grid grid-cols-2 grid-rows-2 gap-4 h-[700px]">
          <Card card={cards[0]} className={cardClassName} />
          <Card card={cards[1]} className={cardClassName} />
          <Card card={cards[2]} className={cardClassName} />
          <Card
            card={cards[3]}
            className={`bg-gradient-to-b from-white from-[0%] via-[#F5FAF3] via-[90%] to-[#D7E3C9]/60 to-[100%] ${
              cardClassName ?? ""
            }`}
          />
        </div>
      </div>

      {/* Desktop pequeño: grid 2x2 más grande */}
      <div
        ref={desktopSmallGridRef}
        className="hidden md:block lg:hidden w-full max-w-4xl"
      >
        <div className="grid grid-cols-2 grid-rows-2 gap-6 h-[800px]">
          <Card card={cards[0]} className={cardClassName} />
          <Card card={cards[1]} className={cardClassName} />
          <Card card={cards[2]} className={cardClassName} />
          <Card
            card={cards[3]}
            className={`bg-gradient-to-b from-white from-[0%] via-[#F5FAF3] via-[90%] to-[#D7E3C9]/60 to-[100%] ${
              cardClassName ?? ""
            }`}
          />
        </div>
      </div>

      {/* Desktop grande: grid asimétrico original */}
      <div
        ref={desktopLargeGridRef}
        className="hidden lg:block w-full max-w-7xl"
      >
        <div className="grid grid-rows-2 gap-4">
          {/* Primera fila: 55% - 45% */}
          <div className="grid grid-cols-[55%_45%] gap-4">
            <Card
              card={cards[0]}
              className={`h-[500px] ${cardClassName ?? ""}`}
            />
            <Card
              card={cards[1]}
              className={`h-[500px] ${cardClassName ?? ""}`}
            />
          </div>

          {/* Segunda fila: 45% - 55% */}
          <div className="grid grid-cols-[45%_55%] gap-4">
            <Card
              card={cards[2]}
              className={`h-[500px] ${cardClassName ?? ""}`}
            />
            <Card
              card={cards[3]}
              className={`h-[500px] bg-gradient-to-b from-white from-[0%] via-[#F5FAF3] via-[90%] to-[#D7E3C9]/60 to-[100%] ${
                cardClassName ?? ""
              }`}
            />
          </div>
        </div>
      </div>
    </div>
  );
}

export default FuncionalityCards;
