import { create } from "zustand";

type ContactForm = {
  name: string;
  email: string;
  subject: string;
  message: string;
};

type NewsletterForm = {
  email: string;
};

type LandingState = {
  contactForm: ContactForm;
  setContactForm: (form: ContactForm) => void;

  newsletterForm: NewsletterForm;
  setNewsletterForm: (form: NewsletterForm) => void;

  isCarouselActive: boolean;
  setIsCarouselActive: (active: boolean) => void;

  resetLandingForms: () => void;
};

const initialContactForm: ContactForm = {
  name: "",
  email: "",
  subject: "",
  message: "",
};

const initialNewsletterForm: NewsletterForm = {
  email: "",
};

export const useLandingStore = create<LandingState>((set) => ({
  contactForm: initialContactForm,
  setContactForm: (form) => set({ contactForm: form }),

  newsletterForm: initialNewsletterForm,
  setNewsletterForm: (form) => set({ newsletterForm: form }),

  isCarouselActive: false,
  setIsCarouselActive: (active) => set({ isCarouselActive: active }),

  resetLandingForms: () =>
    set({
      contactForm: initialContactForm,
      newsletterForm: initialNewsletterForm,
    }),
}));
