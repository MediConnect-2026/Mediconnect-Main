import { useRef, useState } from "react";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useGSAP } from "@gsap/react";
import { useIsMobile } from "@/lib/hooks/useIsMobile";
import MCInput from "@/shared/components/forms/MCInput";
import MediButton from "@/shared/components/landing/MediButton";
import MCTextArea from "@/shared/components/forms/MCTextArea";
import MCFormWrapper from "@/shared/components/forms/MCFormWrapper";
import { contactSchema } from "@/schema/landingSchema";

import { useTranslation } from "react-i18next";
import { useLandingStore } from "@/stores/useLandingPage";
import { useLanding } from "@/features/landing/hooks/UseLanding";

import { clSrcSet, clCard } from "@/utils/cloudinary";
import { Loader2 } from "lucide-react";

gsap.registerPlugin(ScrollTrigger);

function ContactSection() {
  const containerRef = useRef<HTMLDivElement>(null);
  const sectionRef = useRef<HTMLDivElement>(null);
  const imageRef = useRef<HTMLImageElement>(null);
  const overlayRef = useRef<HTMLDivElement>(null);
  const contactRef = useRef<HTMLDivElement>(null);

  const isMobile = useIsMobile();
  const [hasAnimated, setHasAnimated] = useState(false);
  const [formKey, setFormKey] = useState(0);
  const { t } = useTranslation("landing");

  // Definimos la URL base de la imagen
  const contactImageUrl =
    "https://res.cloudinary.com/dy2wtanhl/image/upload/v1774849256/InfoContainer_wggqmi.png";

  const { sendContact, isSendingContact } = useLanding();

  useGSAP(
    () => {
      const container = containerRef.current;
      const section = sectionRef.current;
      const image = imageRef.current;
      const overlay = overlayRef.current;
      const contact = contactRef.current;

      if (!container || !section || !image || !overlay || !contact) return;

      if (isMobile) {
        gsap.set(image, { scale: 1, borderRadius: "1rem", opacity: 1 });
        gsap.set(overlay, { scale: 1, borderRadius: "1rem", opacity: 1 });
        gsap.set(contact, { x: 0, opacity: 1, scale: 1 });
        const formElements = contact.querySelectorAll(".animate-item");
        gsap.set(formElements, { y: 0, opacity: 1 });
        return;
      }

      if (hasAnimated) {
        gsap.set(image, { scale: 1, borderRadius: "35px", opacity: 1 });
        gsap.set(overlay, { scale: 1, borderRadius: "35px", opacity: 1 });
        gsap.set(contact, { x: 0, opacity: 1, scale: 1 });
        const formElements = contact.querySelectorAll(".animate-item");
        gsap.set(formElements, { y: 0, opacity: 1 });
        return;
      }

      const sectionHeight = window.innerHeight;
      container.style.height = `${sectionHeight * 2}px`;

      // Menos redondeado al inicio (40px en lugar de 200px)
      // y scale un poco más grande para que no se vea tan pequeño
      gsap.set(image, { scale: 0.65, borderRadius: "40px", opacity: 1 });
      gsap.set(overlay, { scale: 0.65, borderRadius: "40px", opacity: 1 });

      gsap.set(contact, { x: -60, opacity: 0, scale: 0.98 });

      const formElements =
        contact.querySelectorAll<HTMLElement>(".animate-item");
      gsap.set(formElements, { y: 15, opacity: 0 });

      const setFinalState = () => {
        gsap.set(image, { scale: 1, borderRadius: "35px", opacity: 1 });
        gsap.set(overlay, { scale: 1, borderRadius: "35px", opacity: 1 });
        gsap.set(contact, { x: 0, opacity: 1, scale: 1 });
        gsap.set(formElements, { y: 0, opacity: 1 });
        setHasAnimated(true);
      };

      const tl = gsap.timeline({
        scrollTrigger: {
          trigger: container,
          start: "top top",
          end: `+=${sectionHeight}`,
          pin: section,
          scrub: 0.6, // más rápido (antes 1.2)
          fastScrollEnd: true, // ← add this
          pinSpacing: true,
          anticipatePin: 1,
          invalidateOnRefresh: true,
          onLeave: () => {
            setFinalState(); // sets final GSAP state
            setHasAnimated(true); // triggers React re-render once
          },
        },
      });

      // Imagen crece rápido
      tl.to(
        [image, overlay],
        {
          scale: 1,
          borderRadius: "35px",
          duration: 1.5,
          ease: "sine.inOut",
        },
        0,
      );

      // Formulario entra antes también
      tl.to(
        contact,
        {
          x: 0,
          opacity: 1,
          scale: 1,
          duration: 1,
          ease: "sine.inOut",
        },
        0.5,
      );

      tl.to(
        formElements,
        {
          y: 0,
          opacity: 1,
          stagger: 0.1,
          duration: 0.8,
          ease: "sine.out",
        },
        1.0,
      );

      // ⚡ REFACTORIZADO: Ya no necesitamos guardar postPinTrigger en una variable
      // ni hacer un return () => postPinTrigger.kill() al final.
      // `useGSAP` se encargará de matarlo automáticamente.
      ScrollTrigger.create({
        trigger: container,
        start: () => `top+=${sectionHeight} top`,
        end: () => `bottom-=${sectionHeight * 0.2} top`,
        onEnter: setFinalState,
      });
    },
    { scope: containerRef, dependencies: [isMobile, hasAnimated] },
  );

  const setContactForm = useLandingStore((state) => state.setContactForm);
  const resetLandingForms = useLandingStore((state) => state.resetLandingForms);

  const handleSubmit = async () => {
    try {
      await sendContact({
        name: contactForm.name,
        email: contactForm.email,
        subject: contactForm.subject,
        message: contactForm.message,
      });

      // Reset explícito del formulario de contacto
      setContactForm({
        name: "",
        email: "",
        subject: "",
        message: "",
      });

      // Reset global (contact + newsletter)
      resetLandingForms();

      // Fuerza remonte del RHF wrapper para limpiar valores internos
      setFormKey((prev) => prev + 1);
    } catch {
      // toast error lo maneja useLanding
    }
  };

  const contactForm = useLandingStore((state) => state.contactForm);

  return (
    <section id="contact" className="w-full">
      <div ref={containerRef} className="w-full">
        <div
          ref={sectionRef}
          className={`w-full flex items-center justify-center bg-rd px-4 sm:px-6 lg:px-8 ${
            isMobile ? "min-h-screen py-8" : "h-screen py-8"
          }`}
        >
          <div className="relative w-full mx-auto h-full flex items-center">
            <div
              className={`relative w-full h-full overflow-hidden min-h-[600px] ${
                isMobile ? "flex items-center" : ""
              }`}
            >
              <img
                ref={imageRef}
                // ⚡ REFACTORIZADO: Usamos clSrcSet para entregar la imagen del tamaño correcto
                src={clCard(contactImageUrl)}
                srcSet={clSrcSet(contactImageUrl, [600, 1024, 1440, 1920], {
                  quality: "auto:good",
                  sharpen: 30,
                })}
                sizes="(max-width: 768px) 100vw, 95vw"
                alt="Imagen de contacto"
                loading="lazy"
                decoding="async"
                className={`absolute inset-0 w-full h-full object-cover will-change-transform z-0 ${
                  isMobile ? "rounded-2xl" : "rounded-[35px]"
                }`}
                style={{
                  transformOrigin: "center center",
                }}
              />

              <div
                ref={overlayRef}
                className={`absolute inset-0 bg-primary/15 z-10 will-change-transform ${
                  isMobile ? "rounded-2xl" : "rounded-[35px]"
                }`}
                style={{
                  transformOrigin: "center center",
                  opacity: 1,
                }}
              />

              <div
                ref={contactRef}
                className={`absolute z-20 ${
                  isMobile
                    ? "left-1/2 -translate-x-1/2 top-1/2 -translate-y-1/2 w-[90%] max-w-md"
                    : "left-16 top-1/2 -translate-y-1/2 w-[650px] max-w-full"
                }`}
                style={{
                  opacity: 0,
                }}
              >
                <div
                  className={`bg-white shadow-2xl border border-gray-100 flex flex-col ${
                    isMobile ? "rounded-xl p-6 gap-3" : "rounded-3xl p-12 gap-4"
                  }`}
                >
                  <h2
                    className={`animate-item font-medium text-gray-800 ${
                      isMobile ? "text-2xl mb-0" : "text-3xl lg:text-4xl mb-1"
                    }`}
                  >
                    {t("contacts.title")}
                  </h2>
                  <MCFormWrapper
                    key={formKey}
                    schema={contactSchema}
                    defaultValues={{
                      name: contactForm.name,
                      email: contactForm.email,
                      subject: contactForm.subject,
                      message: contactForm.message,
                    }}
                    onSubmit={handleSubmit}
                  >
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="animate-item [&_input]:h-11 [&_input]:text-[15px]">
                        <MCInput
                          name="name"
                          label={t("contacts.nameLabel")}
                          placeholder={t("contacts.namePlaceholder")}
                          value={contactForm.name}
                          onChange={(e) =>
                            setContactForm({
                              ...contactForm,
                              name: e.target.value,
                            })
                          }
                          required
                        />
                      </div>
                      <div className="animate-item [&_input]:h-11 [&_input]:text-[15px]">
                        <MCInput
                          name="email"
                          label={t("contacts.emailLabel")}
                          placeholder={t("contacts.emailPlaceholder")}
                          type="email"
                          value={contactForm.email}
                          onChange={(e) =>
                            setContactForm({
                              ...contactForm,
                              email: e.target.value,
                            })
                          }
                          required
                        />
                      </div>
                      <div className="animate-item md:col-span-2 [&_input]:h-11 [&_input]:text-[15px]">
                        <MCInput
                          name="subject"
                          label={t("contacts.subjectLabel")}
                          placeholder={t("contacts.subjectPlaceholder")}
                          value={contactForm.subject}
                          onChange={(e) =>
                            setContactForm({
                              ...contactForm,
                              subject: e.target.value,
                            })
                          }
                          required
                        />
                      </div>
                    </div>

                    <div className="animate-item">
                      <MCTextArea
                        name="message"
                        label={t("contacts.messageLabel")}
                        placeholder={t("contacts.messagePlaceholder")}
                        className={
                          isMobile
                            ? "h-[110px] text-[15px]"
                            : "h-[130px] text-[15px]"
                        }
                        value={contactForm.message}
                        onChange={(e) =>
                          setContactForm({
                            ...contactForm,
                            message: e.target.value,
                          })
                        }
                        required
                      />
                    </div>

                    <div className="animate-item pt-2">
                      <MediButton
                        type="submit"
                        className="w-full"
                        disabled={
                          !contactForm.name ||
                          !contactForm.email ||
                          !contactForm.subject ||
                          !contactForm.message ||
                          isSendingContact
                        }
                      >
                        {isSendingContact ? (
                          <span className="inline-flex items-center gap-2">
                            <Loader2 className="h-4 w-4 animate-spin" />
                            {t("contacts.sending", "Cargando...")}
                          </span>
                        ) : (
                          t("contacts.submit")
                        )}
                      </MediButton>
                    </div>
                  </MCFormWrapper>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

export default ContactSection;
