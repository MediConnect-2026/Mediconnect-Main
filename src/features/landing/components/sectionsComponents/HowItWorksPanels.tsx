import { useTranslation } from "react-i18next";
import { forwardRef, useMemo } from "react";
import { useIsMobile } from "@/lib/hooks/useIsMobile";
// Importamos clSrcSet y clStep
import { clStep, clSrcSet } from "@/utils/cloudinary";

interface HowItWorksPanelsProps {
  stepIndex: number;
  imgRef?: React.Ref<HTMLImageElement>;
}

export const STEP_IMAGES = [
  "https://res.cloudinary.com/dy2wtanhl/image/upload/v1771637861/step-01_maewcp.png",
  "https://res.cloudinary.com/dy2wtanhl/image/upload/v1771637863/step-02_ewatui.png",
  "https://res.cloudinary.com/dy2wtanhl/image/upload/v1771637864/step-03_kl3rfa.png",
  "https://res.cloudinary.com/dy2wtanhl/image/upload/v1771652215/step-04_m2sxyx.png",
];
export const STEP_COUNT = STEP_IMAGES.length;

const HowItWorksPanels = forwardRef<HTMLImageElement, HowItWorksPanelsProps>(
  ({ stepIndex, imgRef }) => {
    const { t } = useTranslation("landing");
    const isMobile = useIsMobile();
    const imageUrl = STEP_IMAGES[stepIndex];

    const step = useMemo(
      () => ({
        image: clStep(imageUrl, isMobile),
        number: String(stepIndex + 1).padStart(2, "0"),
        step: t(`how.steps.${stepIndex}.step`),
        title: t(`how.steps.${stepIndex}.title`),
        description: t(`how.steps.${stepIndex}.description`),
      }),
      [stepIndex, isMobile, imageUrl, t],
    );

    return (
      <div className="w-full h-full rounded-4xl overflow-hidden bg-white relative">
        <img
          ref={imgRef}
          src={step.image}
          srcSet={clSrcSet(imageUrl, [600, 1024, 1440, 1920], {
            quality: "auto:good",
            sharpen: 30,
          })}
          sizes="(max-width: 768px) 100vw, 95vw"
          alt={t(`howItWorks.${step.number}_alt`)}
          loading="lazy"
          decoding="async"
          className="w-full h-full object-cover object-center"
        />

        {/* Badge superior */}
        <div
          className={`absolute top-0 left-0 right-0 flex justify-start items-start ${isMobile ? "p-4" : "p-6"}`}
        >
          <div
            className={`flex flex-col justify-center items-center relative rounded-full border border-white/60 bg-black/20 backdrop-blur-xl shadow-2xl z-20 ${isMobile ? "px-4 py-2" : "px-5 py-2"}`}
            style={{
              backdropFilter: "blur(16px) saturate(180%) contrast(120%)",
              WebkitBackdropFilter: "blur(16px) saturate(180%) contrast(120%)",
            }}
          >
            <h3
              className={`text-white ${isMobile ? "text-base" : "text-lg"} font-normal tracking-wider text-center drop-shadow-lg`}
            >
              {step.step}
            </h3>
          </div>
        </div>

        {/* Info inferior */}
        <div
          className={`absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/70 via-black/40 to-transparent ${isMobile ? "p-4" : "p-6 md:p-8"} flex ${isMobile ? "flex-col gap-4 items-start" : "flex-row"} justify-between items-end`}
        >
          <h2
            className={`text-white ${isMobile ? "text-xl" : "text-2xl md:text-5xl"} font-medium mb-2 max-w-lg drop-shadow-lg`}
          >
            {step.title}
          </h2>
          <div
            className={`${isMobile ? "max-w-full" : "max-w-sm"} flex flex-col justify-center items-start relative rounded-3xl border border-white/60 bg-black/20 backdrop-blur-xl shadow-2xl z-20 ${isMobile ? "px-4 py-3" : "px-7 py-4"}`}
            style={{
              backdropFilter: "blur(16px) saturate(180%) contrast(120%)",
              WebkitBackdropFilter: "blur(16px) saturate(180%) contrast(120%)",
            }}
          >
            <h3
              className={`text-white ${isMobile ? "text-sm" : "text-base md:text-lg"} font-normal tracking-wide text-left drop-shadow-lg`}
            >
              {step.description}
            </h3>
          </div>
        </div>
      </div>
    );
  },
);

HowItWorksPanels.displayName = "HowItWorksPanels";
export default HowItWorksPanels;
