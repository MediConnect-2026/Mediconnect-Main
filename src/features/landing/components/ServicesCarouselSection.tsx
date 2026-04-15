import { useRef } from "react";
import { useGSAP } from "@gsap/react";
import gsap, { ScrollTrigger } from "gsap/all";
import { useTranslation } from "react-i18next";
import { cl } from "@/utils/cloudinary";

gsap.registerPlugin(ScrollTrigger);

function ServicesCarouselSection() {
  const { t } = useTranslation("landing");

  const servicesData = [
    {
      image: cl(
        "https://res.cloudinary.com/dy2wtanhl/image/upload/v1771637868/service-1_vaolop.png",
        {
          width: 700,
          height: 200,
          fit: "fill",
          quality: "auto:best",
          sharpen: 60,
        },
      ),
      title: t("services.telehealth"),
    },
    {
      image: cl(
        "https://res.cloudinary.com/dy2wtanhl/image/upload/v1771637869/service-2_zysrgs.png",
        {
          width: 700,
          height: 200,
          fit: "fill",
          quality: "auto:best",
          sharpen: 60,
        },
      ),
      title: t("services.rehabilitation"),
    },
    {
      image: cl(
        "https://res.cloudinary.com/dy2wtanhl/image/upload/v1771637870/service-3_wzsobz.png",
        {
          width: 700,
          height: 200,
          fit: "fill",
          quality: "auto:best",
          sharpen: 60,
        },
      ),
      title: t("services.solutions"),
    },
    {
      image: cl(
        "https://res.cloudinary.com/dy2wtanhl/image/upload/v1771637873/service-4_icyboc.png",
        {
          width: 700,
          height: 200,
          fit: "fill",
          quality: "auto:best",
          sharpen: 60,
        },
      ),
      title: t("services.device"),
    },
    {
      image: cl(
        "https://res.cloudinary.com/dy2wtanhl/image/upload/v1771637874/service-5_zmqlxn.png",
        {
          width: 700,
          height: 200,
          fit: "fill",
          quality: "auto:best",
          sharpen: 60,
        },
      ),
      title: t("services.diagnostics"),
    },
    {
      image: cl(
        "https://res.cloudinary.com/dy2wtanhl/image/upload/v1771637877/service-6_l9cvi6.png",
        {
          width: 700,
          height: 200,
          fit: "fill",
          quality: "auto:best",
          sharpen: 60,
        },
      ),
      title: t("services.care"),
    },
  ];

  const containerRef = useRef<HTMLDivElement | null>(null);
  const sliderRef = useRef<HTMLDivElement | null>(null);
  const infiniteTimeline = useRef<gsap.core.Timeline | null>(null);
  const serviceRefs = useRef<(HTMLDivElement | null)[]>([]);

  const itemWidth = 700;
  const originalSetWidth = itemWidth * servicesData.length;

  const tripleServices = [...servicesData, ...servicesData, ...servicesData];

  useGSAP(
    () => {
      if (!sliderRef.current || !containerRef.current) return;

      gsap.set(sliderRef.current, { x: -originalSetWidth });

      // 1. Iniciamos el timeline pausado
      infiniteTimeline.current = gsap.timeline({
        repeat: -1,
        paused: true, // ⚡ ¡CLAVE! No inicia hasta que lo digamos
      });

      infiniteTimeline.current.to(sliderRef.current, {
        x: -originalSetWidth * 2,
        duration: 40, // <-- antes era 60
        ease: "none",
        modifiers: {
          x: (x) => {
            const currentX = parseFloat(x);
            if (currentX <= -originalSetWidth * 2) {
              gsap.set(sliderRef.current, { x: -originalSetWidth });
              return (-originalSetWidth).toString() + "px";
            }
            return x;
          },
        },
      });

      // 2. Controlamos la reproducción solo cuando es visible
      ScrollTrigger.create({
        trigger: containerRef.current,
        start: "top bottom", // Inicia cuando el componente entra por debajo de la pantalla
        end: "bottom top", // Termina cuando el componente sale por arriba
        onEnter: () => infiniteTimeline.current?.play(),
        onLeave: () => infiniteTimeline.current?.pause(),
        onEnterBack: () => infiniteTimeline.current?.play(),
        onLeaveBack: () => infiniteTimeline.current?.pause(),
      });

      gsap.fromTo(
        containerRef.current,
        { opacity: 0, y: 50 },
        { opacity: 1, y: 0, duration: 0.8 },
      );

      gsap.fromTo(
        serviceRefs.current.slice(servicesData.length, servicesData.length * 2),
        { opacity: 0, y: 40, scale: 0.95 },
        {
          opacity: 1,
          y: 0,
          scale: 1,
          duration: 0.8,
          stagger: 0.15,
          ease: "power3.out",
          scrollTrigger: {
            trigger: containerRef.current,
            start: "top 85%",
            toggleActions: "play none none none",
          },
        },
      );

      // 3. Limpieza segura
      return () => {
        infiniteTimeline.current?.kill();
        // useGSAP se encarga de limpiar los ScrollTriggers creados aquí
      };
    },
    { scope: containerRef },
  );

  return (
    <main className="flex w-full justify-center">
      <section
        ref={containerRef}
        className="bg-white py-12 px-8 items-center w-full"
      >
        <div className="relative overflow-hidden">
          <div
            ref={sliderRef}
            className="flex gap-4"
            style={{ width: `${tripleServices.length * itemWidth}px` }}
          >
            {tripleServices.map((service, index) => (
              <div
                key={`${service.title}-${index}`}
                ref={(el) => {
                  if (el) serviceRefs.current[index] = el;
                }}
                className="flex items-center gap-4 py-6"
                onMouseEnter={() => {
                  if (infiniteTimeline.current) {
                    infiniteTimeline.current.timeScale(0.2);
                  }
                }}
                onMouseLeave={() => {
                  if (infiniteTimeline.current) {
                    infiniteTimeline.current.timeScale(1);
                  }
                }}
              >
                <div className="overflow-hidden inline-block rounded-full w-[350px] h-[100px]">
                  <img
                    src={service.image}
                    alt={service.title}
                    loading="lazy"
                    decoding="async"
                    className="rounded-4xl w-full h-full object-cover shadow-lg hover:scale-110 transition-transform duration-500"
                  />
                </div>
                <div className="bg-[#F5FAF3] w-[350px] h-[100px] rounded-full flex items-center justify-center flex-shrink-0 transition-all duration-300 hover:bg-[#ecf6e8]">
                  <span className="text-primary font-semibold text-3xl px-4 text-center">
                    {service.title}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>
    </main>
  );
}

export default ServicesCarouselSection;
