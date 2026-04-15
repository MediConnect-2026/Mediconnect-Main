import HeroImageSection from "./sectionsComponents/HeroImage";

interface HeroSectionProps {
  isCarouselActive: boolean;
}

function HeroSection({ isCarouselActive }: HeroSectionProps) {
  return <HeroImageSection isCarouselActive={isCarouselActive} />;
}

export default HeroSection;
