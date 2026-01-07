import React, { useRef } from "react";
import { useIsMobile } from "@/lib/hooks/useIsMobile";
import { useGSAP } from "@gsap/react";
import gsap from "gsap";

interface AuthContentContainerProps {
  title: string;
  subtitle?: React.ReactNode;
  children: React.ReactNode;
  containerClassName?: string;
}

const AuthContentContainer: React.FC<AuthContentContainerProps> = ({
  title,
  subtitle,
  children,
  containerClassName = "",
}) => {
  const isMobile = useIsMobile();
  const containerRef = useRef<HTMLDivElement>(null);
  const titleRef = useRef<HTMLHeadingElement>(null);
  const subtitleRef = useRef<HTMLParagraphElement>(null);
  const contentRef = useRef<HTMLDivElement>(null);

  useGSAP(
    () => {
      // Animación del título
      gsap.fromTo(
        titleRef.current,
        {
          y: 30,
          opacity: 0,
        },
        {
          y: 0,
          opacity: 1,
          duration: 0.5,
          ease: "power2.out",
        }
      );

      // Animación del subtítulo (si existe)
      if (subtitleRef.current) {
        gsap.fromTo(
          subtitleRef.current,
          {
            y: 30,
            opacity: 0,
          },
          {
            y: 0,
            opacity: 1,
            duration: 0.5,
            ease: "power2.out",
            delay: 0.1,
          }
        );
      }

      // Animación del contenido
      gsap.fromTo(
        contentRef.current,
        {
          y: 30,
          opacity: 0,
        },
        {
          y: 0,
          opacity: 1,
          duration: 0.5,
          ease: "power2.out",
          delay: 0.2,
        }
      );
    },
    { scope: containerRef }
  );

  return (
    <div
      ref={containerRef}
      className={`w-full flex flex-col justify-center items-center overflow-x-hidden overflow-y-hidden ${
        isMobile ? "p-4 max-w-full" : "max-w-3xl"
      } ${containerClassName}`}
    >
      <h2
        ref={titleRef}
        className={`text-3xl font-bold mb-2 text-center ${
          isMobile ? "text-2xl" : ""
        }`}
      >
        {title}
      </h2>
      {subtitle && (
        <p ref={subtitleRef} className="text-primary/80 mb-6 text-center">
          {subtitle}
        </p>
      )}
      <div
        ref={contentRef}
        className={
          isMobile
            ? "w-full px-4"
            : "w-full flex flex-col items-center justify-center"
        }
      >
        {children}
      </div>
    </div>
  );
};

export default AuthContentContainer;
