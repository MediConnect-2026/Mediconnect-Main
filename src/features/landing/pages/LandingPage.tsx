import HeroSection from "@/features/landing/components/HeroSection";
import AboutSection from "@/features/landing/components/AboutSection";
import UsersSection from "@/features/landing/components/UsersSection";
import HowItWorksSection from "@/features/landing/components/HowItWorksSection";
import FuncionalitySection from "@/features/landing/components/FuncionalitySection";
import BeneficitsSection from "@/features/landing/components/BenefictsSection";
import TestimonialsSection from "@/features/landing/components/TestimonialsSection";
import FAQSection from "@/features/landing/components/FAQSection";
import ServicesCarouselSection from "@/features/landing/components/ServicesCarouselSection";
import Footer from "@/features/landing/components/Footer";
import ContactSectionWrapper from "@/features/landing/components/ContactSectionWrapper";
import { useLandingStore } from "@/stores/useLandingPage";

function LandingPage() {
  const setIsCarouselActive = useLandingStore(
    (state) => state.setIsCarouselActive,
  );
  const isCarouselActive = useLandingStore((state) => state.isCarouselActive);

  return (
    <div className="bg-white w-full overflow-hidden flex flex-col gap-10">
      <HeroSection isCarouselActive={isCarouselActive} />
      <AboutSection />
      <UsersSection />
      <HowItWorksSection onCarouselActiveChange={setIsCarouselActive} />
      <FuncionalitySection />
      <BeneficitsSection onCarouselActiveChange={setIsCarouselActive} />
      <TestimonialsSection />
      <FAQSection />
      <ContactSectionWrapper />
      <ServicesCarouselSection />
      <Footer />
    </div>
  );
}

export default LandingPage;
