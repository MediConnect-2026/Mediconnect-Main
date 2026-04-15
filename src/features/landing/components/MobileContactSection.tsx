import MCInput from "@/shared/components/forms/MCInput";
import MediButton from "@/shared/components/landing/MediButton";
import MCTextArea from "@/shared/components/forms/MCTextArea";
import MCFormWrapper from "@/shared/components/forms/MCFormWrapper";
import { contactSchema } from "@/schema/landingSchema";
import { useTranslation } from "react-i18next";
import { useLandingStore } from "@/stores/useLandingPage";
import { useLanding } from "@/features/landing/hooks/UseLanding";
import { useState } from "react";

import { clBg } from "@/utils/cloudinary";

function MobileContactSection() {
  const { t } = useTranslation("landing");
  const contactForm = useLandingStore((state) => state.contactForm);
  const setContactForm = useLandingStore((state) => state.setContactForm);
  const { sendContact, isSendingContact } = useLanding();
  const [formKey, setFormKey] = useState(0);
  const resetLandingForms = useLandingStore((state) => state.resetLandingForms);

  const contactMobileImage = clBg(
    "https://res.cloudinary.com/dy2wtanhl/image/upload/v1771637850/contact_yb9t5x.png",
    true,
  );

  const handleSubmit = async () => {
    try {
      await sendContact({
        name: contactForm.name,
        email: contactForm.email,
        subject: contactForm.subject,
        message: contactForm.message,
      });

      // Limpia store
      setContactForm({ name: "", email: "", subject: "", message: "" });
      resetLandingForms();

      // Limpia React Hook Form
      setFormKey((prev) => prev + 1);
    } catch {
      // Toast de error ya se maneja en useLanding
    }
  };

  return (
    <section id="contact" className="w-full min-h-screen py-12 px-4">
      <div className="w-full max-w-md mx-auto">
        {/* Imagen de fondo */}
        <div className="relative w-full h-[300px] rounded-2xl overflow-hidden mb-6">
          <img
            src={contactMobileImage}
            alt="Contacto"
            loading="lazy"
            decoding="async"
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-primary/30"></div>

          {/* Título sobre la imagen */}
          <div className="absolute inset-0 flex items-center justify-center">
            <h2 className="text-white text-4xl font-bold text-center px-4">
              {t("contacts.title")}
            </h2>
          </div>
        </div>

        {/* Formulario */}
        <div className="bg-white rounded-2xl shadow-xl border border-gray-100 p-6">
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
            <div className="space-y-4">
              <div>
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

              <div>
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

              <div>
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

              <div>
                <MCTextArea
                  name="message"
                  label={t("contacts.messageLabel")}
                  placeholder={t("contacts.messagePlaceholder")}
                  className="h-[120px]"
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

              <div className="pt-2">
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
                  {t("contacts.submit")}
                </MediButton>
              </div>
            </div>
          </MCFormWrapper>
        </div>
      </div>
    </section>
  );
}

export default MobileContactSection;
