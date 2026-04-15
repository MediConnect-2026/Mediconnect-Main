import { useState, useRef } from "react";
import { useGSAP } from "@gsap/react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useTranslation } from "react-i18next";
import { useIsMobile } from "@/lib/hooks/useIsMobile";
import MediButton from "@/shared/components/landing/MediButton";
import InfoContainers from "./sectionsComponents/UsersComponents/InfoContainers";
import PhotoContainers from "./sectionsComponents/UsersComponents/PhotoContainers";
gsap.registerPlugin(ScrollTrigger);

function UsersSection() {
  const isMobile = useIsMobile();
  const { t } = useTranslation("landing");
  const [selected, setSelected] = useState<"patient" | "doctor" | "center">(
    "patient",
  );

  const containerRef = useRef<HTMLDivElement>(null);
  const titleRef = useRef<HTMLHeadingElement>(null);
  const subtitleRef = useRef<HTMLHeadingElement>(null);
  const textRef = useRef<HTMLParagraphElement>(null);

  // Agrega estos refs:
  const patientRef = useRef<HTMLDivElement>(null);
  const doctorRef = useRef<HTMLDivElement>(null);
  const centerRef = useRef<HTMLDivElement>(null);

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

      // Animación de la descripción
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

      // Animación del bloque de pacientes
      gsap.fromTo(
        patientRef.current,
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
            trigger: patientRef.current,
            start: "top 90%",
            toggleActions: "play none none none",
          },
        },
      );

      // Animación del bloque de doctores
      gsap.fromTo(
        doctorRef.current,
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
            trigger: doctorRef.current,
            start: "top 90%",
            toggleActions: "play none none none",
          },
        },
      );

      // Animación del bloque de centros
      gsap.fromTo(
        centerRef.current,
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
            trigger: centerRef.current,
            start: "top 90%",
            toggleActions: "play none none none",
          },
        },
      );
    },
    { scope: containerRef },
  );

  return (
    <main className="p-[15px] flex justify-center">
      <section
        ref={containerRef}
        className="bg-white py-12 px-6  items-center w-full "
      >
        <div className="flex flex-col gap-2 w-full  h-full">
          {/* TITULOS - CENTRADOS */}
          <div className="flex flex-col items-center text-center gap-4">
            <h4
              ref={titleRef}
              className="tracking-wide text-lg font-regular text-primary"
            >
              {t("users.title")}
            </h4>

            <h1
              ref={subtitleRef}
              className={`${
                isMobile ? "text-3xl" : "text-6xl"
              } font-medium text-primary mb-4`}
              dangerouslySetInnerHTML={{ __html: t("users.subtitle") }}
            ></h1>

            <p
              ref={textRef}
              className="font-normal text-lg text-primary mb-4 w-full"
            >
              {t("users.description")}
            </p>

            {/* BOTONES DE USUARIO SOLO EN MOBILE */}
            {isMobile && (
              <div className="flex justify-center gap-2 mt-2">
                <MediButton
                  className={`px-4 py-2 rounded-full text-sm font-medium border ${
                    selected === "patient"
                      ? "bg-primary text-white border-primary"
                      : "bg-white text-primary border-primary"
                  }`}
                  onClick={() => setSelected("patient")}
                >
                  {t("switch.patient")}
                </MediButton>
                <MediButton
                  className={`px-4 py-2 rounded-full text-sm font-medium border ${
                    selected === "doctor"
                      ? "bg-primary text-white border-primary"
                      : "bg-white text-primary border-primary"
                  }`}
                  onClick={() => setSelected("doctor")}
                >
                  {t("switch.doctor")}
                </MediButton>
                <MediButton
                  className={`px-4 py-2 rounded-full text-sm font-medium border ${
                    selected === "center"
                      ? "bg-primary text-white border-primary"
                      : "bg-white text-primary border-primary"
                  }`}
                  onClick={() => setSelected("center")}
                >
                  {t("switch.center")}
                </MediButton>
              </div>
            )}
          </div>

          {/* BLOQUES DE USUARIOS */}
          <div className="w-full mt-6">
            {/* MOBILE: solo uno visible */}
            {isMobile ? (
              <div className="flex flex-col gap-4">
                {selected === "patient" && (
                  <div className="flex flex-col gap-4">
                    <InfoContainers userType="patient" />
                    <PhotoContainers userType="patient" />
                  </div>
                )}
                {selected === "doctor" && (
                  <div className="flex flex-col gap-4">
                    <InfoContainers userType="doctor" />
                    <PhotoContainers userType="doctor" />
                  </div>
                )}
                {selected === "center" && (
                  <div className="flex flex-col gap-4">
                    <InfoContainers userType="center" />
                    <PhotoContainers userType="center" />
                  </div>
                )}
              </div>
            ) : (
              // DESKTOP: grid de 2 columnas para cada bloque
              <div className="flex flex-col gap-4 w-full">
                <div
                  ref={patientRef}
                  className="w-full min-h-[500px] md:h-[600px] lg:h-[750px] flex flex-col lg:grid lg:grid-cols-2 gap-4 "
                >
                  <InfoContainers userType="patient" />
                  <PhotoContainers userType="patient" />
                </div>
                <div
                  ref={doctorRef}
                  className="w-full min-h-[500px] md:h-[600px] lg:h-[750px] flex flex-col lg:grid lg:grid-cols-2 gap-4"
                >
                  <PhotoContainers userType="doctor" />
                  <InfoContainers userType="doctor" />
                </div>
                <div
                  ref={centerRef}
                  className="w-full min-h-[500px] md:h-[600px] lg:h-[750px] flex flex-col lg:grid lg:grid-cols-2 gap-4 "
                >
                  <InfoContainers userType="center" />
                  <PhotoContainers userType="center" />
                </div>
              </div>
            )}
          </div>
        </div>
      </section>
    </main>
  );
}

export default UsersSection;
