import { useRef } from "react";
import { useGSAP } from "@gsap/react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useIsMobile } from "@/lib/hooks/useIsMobile";

gsap.registerPlugin(ScrollTrigger);

const testimonialsData = [
  {
    name: "Dr. Alejandro Gómez",
    service: "Consulta Médica Integral",
    testimonial:
      "Scheduling telehealth appointments was incredibly convenient and fit perfectly into my busy lifestyle. The care team was attentive and made the whole experience smooth and stress-free.",
    avatar: "https://randomuser.me/api/portraits/men/32.jpg",
  },
  {
    name: "Laura Fernández",
    service: "Telemedicina",
    testimonial:
      "Pude consultar con un especialista de forma rápida y segura. La experiencia fue clara, humana y muy profesional.",
    avatar: "https://randomuser.me/api/portraits/women/44.jpg",
  },
  {
    name: "Miguel Hernández",
    service: "Gestión de Citas",
    testimonial:
      "La organización de citas es sencilla y eficiente. Ahora tengo control total de mis consultas médicas.",
    avatar: "https://randomuser.me/api/portraits/men/65.jpg",
  },
  {
    name: "Dra. Patricia Ruiz",
    service: "Diagnósticos Clínicos",
    testimonial:
      "Los reportes médicos y diagnósticos son claros, precisos y fáciles de compartir con los pacientes.",
    avatar: "https://randomuser.me/api/portraits/women/68.jpg",
  },
  {
    name: "José Martínez",
    service: "Seguimiento Médico",
    testimonial:
      "El seguimiento continuo me dio confianza y tranquilidad durante todo mi tratamiento.",
    avatar: "https://randomuser.me/api/portraits/men/41.jpg",
  },
  {
    name: "Andrea López",
    service: "Consulta Especializada",
    testimonial:
      "La atención fue personalizada y el equipo médico mostró un alto nivel de profesionalismo.",
    avatar: "https://randomuser.me/api/portraits/women/29.jpg",
  },
];

function TestimonialsCards() {
  const isMobile = useIsMobile();
  const containerRef = useRef<HTMLDivElement | null>(null);
  const sliderRef = useRef<HTMLDivElement | null>(null);
  const infiniteTimeline = useRef<gsap.core.Timeline | null>(null);

  // Triple testimonials for seamless infinite loop
  const tripleTestimonials = [
    ...testimonialsData,
    ...testimonialsData,
    ...testimonialsData,
  ];

  useGSAP(() => {
    if (!sliderRef.current) return;

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
          // When we reach the end of the second set, jump back to the beginning of the second set
          if (currentX <= -originalSetWidth * 2) {
            gsap.set(sliderRef.current, { x: -originalSetWidth });
            return (-originalSetWidth).toString() + "px";
          }
          return x;
        },
      },
    });

    // Initial entrance animation
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
  }, [isMobile]);

  return (
    <div ref={containerRef} className="w-full relative py-4 overflow-hidden">
      {/* Infinite Slider */}
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
