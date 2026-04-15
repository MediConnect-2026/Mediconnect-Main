import { useRef } from "react";
import { useGSAP } from "@gsap/react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useIsMobile } from "@/lib/hooks/useIsMobile";
import { useTranslation } from "react-i18next";

gsap.registerPlugin(ScrollTrigger);

type TestimonialItem = {
  name: string;
  service: string;
  testimonial: string;
  avatar: string;
};

function TestimonialsCards() {
  const isMobile = useIsMobile();
  const { t } = useTranslation("landing");
  const containerRef = useRef<HTMLDivElement | null>(null);
  const sliderRef = useRef<HTMLDivElement | null>(null);
  const infiniteTimeline = useRef<gsap.core.Timeline | null>(null);

  const testimonialsData = t("testimonials.cards", {
    returnObjects: true,
  }) as TestimonialItem[];

  // Triple testimonials for seamless infinite loop
  const tripleTestimonials = [
    ...testimonialsData,
    ...testimonialsData,
    ...testimonialsData,
  ];

  useGSAP(() => {
    if (!sliderRef.current || !testimonialsData.length) return;

    const cardWidth = isMobile ? 320 : 520;
    const originalSetWidth = cardWidth * testimonialsData.length;

    // Set initial position to show the middle set
    gsap.set(sliderRef.current, { x: -originalSetWidth });

    // Create seamless infinite loop
    infiniteTimeline.current = gsap.timeline({ repeat: -1 });
    infiniteTimeline.current.to(sliderRef.current, {
      x: -originalSetWidth * 2,
      duration: 60,
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

    gsap.fromTo(
      containerRef.current,
      { opacity: 0, y: 50 },
      {
        opacity: 1,
        y: 0,
        duration: 0.8,
        scrollTrigger: {
          trigger: containerRef.current,
          start: "top 85%",
          toggleActions: "play none none none",
        },
      },
    );
  }, [isMobile, testimonialsData]);

  return (
    <div ref={containerRef} className="w-full relative py-4 overflow-hidden">
      <div className="relative">
        <div
          ref={sliderRef}
          className="flex gap-4"
          style={{
            width: `${tripleTestimonials.length * (isMobile ? 320 : 520)}px`,
          }}
        >
          {tripleTestimonials.map((testimonial, index) => (
            <div
              key={`${testimonial.name}-${index}`}
              className={`bg-[#F5FAF3] p-6 rounded-3xl transition-all duration-500 ease-out cursor-pointer hover:bg-[#ecf6e8] ${
                isMobile ? " w-[70vw] h-[260px] mx-auto" : "w-[500px] h-[225px]"
              }`}
              style={isMobile ? { minWidth: "70vw" } : {}}
              onMouseEnter={() => infiniteTimeline.current?.timeScale(0.2)}
              onMouseLeave={() => infiniteTimeline.current?.timeScale(1)}
            >
              <div className="flex items-start gap-4 mb-6">
                <img
                  src={testimonial.avatar}
                  alt={testimonial.name}
                  loading="lazy"
                  decoding="async"
                  className="w-16 h-16 rounded-2xl object-cover flex-shrink-0 transition-transform duration-300"
                />
                <div className="flex-1">
                  <h4 className="font-medium text-primary text-lg transition-colors duration-300 hover:text-primary">
                    {testimonial.name}
                  </h4>
                  <p className="text-primary/75 text-md font-normal">
                    {testimonial.service}
                  </p>
                </div>
              </div>
              <blockquote
                className="text-primary font-medium text-md text-justify"
                style={{
                  display: "-webkit-box",
                  WebkitLineClamp: 4,
                  WebkitBoxOrient: "vertical",
                  overflow: "hidden",
                  textOverflow: "ellipsis",
                }}
              >
                "{testimonial.testimonial}"
              </blockquote>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

export default TestimonialsCards;
