import { motion } from "framer-motion";
import { type Variants } from "framer-motion";
import { useIsMobile } from "@/lib/hooks/useIsMobile";
import { useTranslation } from "react-i18next";
import { clBg } from "@/utils/cloudinary";

// ─── Variants ────────────────────────────────────────────────────────────────

const fadeUpVariants: Variants = {
  hidden: { opacity: 0, y: 30 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.8, ease: "easeOut" as const },
  },
};

const fadeUpLargeVariants: Variants = {
  hidden: { opacity: 0, y: 50 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 1, ease: "easeOut" as const },
  },
};

const fadeUpDelayedVariants: Variants = {
  hidden: { opacity: 0, y: 30 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.8, delay: 0.2, ease: "easeOut" as const },
  },
};

const imageVariants: Variants = {
  hidden: { opacity: 0, scale: 0.95, y: 40 },
  visible: {
    opacity: 1,
    scale: 1,
    y: 0,
    transition: { duration: 1, ease: "easeOut" as const },
  },
};

const imageDelayedVariants: Variants = {
  hidden: { opacity: 0, scale: 0.95, y: 60 },
  visible: {
    opacity: 1,
    scale: 1,
    y: 0,
    transition: { duration: 1, delay: 0.2, ease: "easeOut" as const },
  },
};

// Equivalente a start: "top 85%" → el elemento es visible cuando el 15% superior entra en viewport
const VIEWPORT_85: { once: boolean; amount: number } = {
  once: true,
  amount: 0.15,
};
const VIEWPORT_90: { once: boolean; amount: number } = {
  once: true,
  amount: 0.1,
};

// ─── Component ────────────────────────────────────────────────────────────────

function AboutSection() {
  const isMobile = useIsMobile();
  const { t } = useTranslation("landing");

  const aboutMainImage = clBg(
    "https://res.cloudinary.com/dy2wtanhl/image/upload/v1774834814/ChatGPT_Image_29_mar_2026_21_31_56_yzjgqw.png",
    isMobile,
  );

  const aboutAsideImage = clBg(
    "https://res.cloudinary.com/dy2wtanhl/image/upload/v1774834814/ChatGPT_Image_29_mar_2026_21_39_56_ytkj6r.png",
  );

  return (
    <main className="p-[15px] flex justify-center" id="about">
      <main className="bg-white py-12 px-6 gap-2 items-center w-full">
        <div className="flex flex-col gap-4 w-full h-full">
          {/* Title */}
          <motion.h4
            className="tracking-wide text-lg font-regular text-primary"
            variants={fadeUpVariants}
            initial="hidden"
            whileInView="visible"
            viewport={VIEWPORT_85}
          >
            {t("about.title")}
          </motion.h4>

          <div
            className={`w-full ${
              isMobile ? "flex flex-col" : "grid grid-cols-[65%_35%]"
            } items-start gap-4`}
          >
            {/* Subtitle */}
            <motion.h1
              className={`${
                isMobile ? "text-3xl" : "text-7xl"
              } font-medium text-primary mb-4 w-full`}
              variants={fadeUpLargeVariants}
              initial="hidden"
              whileInView="visible"
              viewport={VIEWPORT_85}
            >
              {t("about.subtitle")}
            </motion.h1>

            {/* Description */}
            <motion.p
              className="font-normal text-lg text-primary mb-4 w-full"
              variants={fadeUpDelayedVariants}
              initial="hidden"
              whileInView="visible"
              viewport={VIEWPORT_85}
            >
              {t("about.description")}
            </motion.p>
          </div>

          {/* Images */}
          <div
            className={`w-full ${
              isMobile ? "flex flex-col" : "grid grid-cols-[65%_35%]"
            } items-start gap-4`}
          >
            {isMobile ? (
              <motion.img
                src={aboutMainImage}
                alt="About Main"
                className="rounded-4xl w-full h-[350px] object-cover shadow-lg pointer-events-none"
                variants={imageVariants}
                initial="hidden"
                whileInView="visible"
                viewport={VIEWPORT_90}
              />
            ) : (
              <>
                {/* Main image */}
                <motion.div
                  className="overflow-hidden inline-block rounded-4xl w-full h-full"
                  variants={imageVariants}
                  initial="hidden"
                  whileInView="visible"
                  viewport={VIEWPORT_90}
                >
                  <img
                    src={aboutMainImage}
                    alt="About Main"
                    className="rounded-4xl w-full h-full object-cover shadow-lg hover:scale-115 transition-transform duration-500"
                  />
                </motion.div>

                {/* Aside image */}
                <motion.div
                  className="overflow-hidden inline-block rounded-4xl w-full h-full"
                  variants={imageDelayedVariants}
                  initial="hidden"
                  whileInView="visible"
                  viewport={VIEWPORT_90}
                >
                  <img
                    src={aboutAsideImage}
                    alt="About Aside"
                    className="rounded-4xl w-full h-full object-cover shadow-lg hover:scale-115 transition-transform duration-500"
                  />
                </motion.div>
              </>
            )}
          </div>
        </div>
      </main>
    </main>
  );
}

export default AboutSection;
