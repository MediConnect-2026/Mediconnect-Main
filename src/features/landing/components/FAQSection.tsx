import { motion, type Variants } from "framer-motion";
import { useTranslation } from "react-i18next";
import { useIsMobile } from "@/lib/hooks/useIsMobile";

import { clBg } from "@/utils/cloudinary";
import {
  Accordion,
  AccordionItem,
  AccordionTrigger,
  AccordionContent,
} from "@/shared/ui/accordion";

const EASE_OUT: [number, number, number, number] = [0.22, 1, 0.36, 1];

const fadeUp = (delay = 0): Variants => ({
  hidden: { opacity: 0, y: 30 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.8, ease: EASE_OUT, delay },
  },
});

const imageVariant: Variants = {
  hidden: { opacity: 0, scale: 0.95, y: 40 },
  visible: {
    opacity: 1,
    scale: 1,
    y: 0,
    transition: { duration: 1, ease: EASE_OUT },
  },
};

const accordionVariant: Variants = {
  hidden: { opacity: 0, y: 60 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 1, ease: EASE_OUT, delay: 0.2 },
  },
};

function FAQSection() {
  const { t } = useTranslation("landing");
  const isMobile = useIsMobile();

  const faqItems = t("faq.items", { returnObjects: true }) as Array<{
    question: string;
    answer: string;
  }>;

  const faqImage = clBg(
    "https://res.cloudinary.com/dy2wtanhl/image/upload/v1771637853/faq_qvotdi.png",
    isMobile,
  );

  return (
    <main className="p-[15px] flex justify-center w-full" id="faq">
      <section className="bg-white py-12 px-6 items-center w-full">
        <div
          className={`flex ${
            isMobile ? "flex-col gap-6" : "grid grid-cols-2 gap-4"
          } w-full h-full`}
        >
          {/* CONTENIDO IZQUIERDO */}
          <div className="flex flex-col gap-2 w-full h-full justify-between">
            <div
              className={`flex flex-col ${
                isMobile ? "items-center text-center" : "items-start text-start"
              } gap-2`}
            >
              {/* fadeUp(0) → reemplaza gsap.fromTo titleRef + ScrollTrigger */}
              <motion.h4
                className="tracking-wide text-lg font-regular text-primary"
                variants={fadeUp(0)}
                initial="hidden"
                whileInView="visible"
                viewport={{ once: true, amount: 0.3 }}
              >
                {t("faq.title")}
              </motion.h4>

              {/* fadeUp(0.1) → reemplaza gsap.fromTo subtitleRef + ScrollTrigger */}
              <motion.h1
                className={`${
                  isMobile ? "text-3xl" : "text-6xl"
                } font-medium text-primary mb-4`}
                variants={fadeUp(0.1)}
                initial="hidden"
                whileInView="visible"
                viewport={{ once: true, amount: 0.3 }}
              >
                {t("faq.heading")}
              </motion.h1>

              {/* fadeUp(0.2) → reemplaza gsap.fromTo textRef + delay:0.2 */}
              <motion.p
                className="font-normal text-lg text-primary mb-4"
                variants={fadeUp(0.2)}
                initial="hidden"
                whileInView="visible"
                viewport={{ once: true, amount: 0.3 }}
              >
                {t("faq.description")}
              </motion.p>
            </div>

            {/* imageVariant → reemplaza gsap.fromTo imageRef + ScrollTrigger */}
            <motion.div
              className="overflow-hidden inline-block rounded-4xl w-full"
              variants={imageVariant}
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true, amount: 0.2 }}
            >
              <img
                src={faqImage}
                alt="FAQ"
                loading="lazy"
                decoding="async"
                className="rounded-4xl w-full h-[300px] object-cover shadow-lg hover:scale-115 transition-transform duration-500"
              />
            </motion.div>
          </div>

          {/* CONTENIDO DERECHO - ACCORDION */}
          {/* accordionVariant → reemplaza gsap.fromTo accordionRef + delay:0.2 */}
          <motion.div
            className="flex items-start justify-center w-full h-full"
            variants={accordionVariant}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, amount: 0.1 }}
          >
            <Accordion
              type="single"
              collapsible
              className="w-full rounded-2xl flex flex-col gap-2 h-full justify-between"
            >
              {faqItems.map((item, idx) => (
                <AccordionItem
                  value={`item-${idx}`}
                  key={idx}
                  className="bg-[#ecf6e8dc]/80 p-4 rounded-lg shadow-none border-0"
                >
                  <AccordionTrigger className="text-primary text-md font-medium w-fit">
                    {item.question}
                  </AccordionTrigger>
                  <AccordionContent className="text-primary text-md">
                    {item.answer}
                  </AccordionContent>
                </AccordionItem>
              ))}
            </Accordion>
          </motion.div>
        </div>
      </section>
    </main>
  );
}

export default FAQSection;
