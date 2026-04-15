import { useEffect } from "react";
import { useIsMobile } from "@/lib/hooks/useIsMobile";
import { useLandingStore } from "@/stores/useLandingPage";
import ContactSection from "./ContactSection";
import MobileContactSection from "./MobileContactSection";

export default function ContactSectionWrapper() {
  const isMobile = useIsMobile();
  const resetLandingForms = useLandingStore((s) => s.resetLandingForms);

  useEffect(() => {
    resetLandingForms();
    return () => resetLandingForms();
  }, [resetLandingForms]);

  return isMobile ? <MobileContactSection /> : <ContactSection />;
}
