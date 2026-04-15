import { useState, useEffect } from "react";
import { motion, type Variants } from "framer-motion";
import { useTranslation } from "react-i18next";
import MediButton from "@/shared/components/landing/MediButton";
import { useNavigate } from "react-router-dom";
import { ROUTES } from "@/router/routes";

const EASE: [number, number, number, number] = [0.22, 1, 0.36, 1];

// Contenedor: blur + y reducidos, duración cortada de 1.5 → 0.5
const containerVariants: Variants = {
  hidden: { opacity: 0, y: 30, scale: 0.98, filter: "blur(4px)" },
  visible: {
    opacity: 1,
    y: 0,
    scale: 1,
    filter: "blur(0px)",
    transition: {
      duration: 0.5,
      ease: EASE,
      staggerChildren: 0.07, // antes 0.15
      delayChildren: 0.1, // antes 0.3
    },
  },
};

// Textos: y y x menores, duración 1.2 → 0.4
const textItemVariants: Variants = {
  hidden: { opacity: 0, y: 20, x: -15 },
  visible: {
    opacity: 1,
    y: 0,
    x: 0,
    transition: { duration: 0.4, ease: EASE },
  },
};

// Lista: x reducido, sin rotateY (costoso y lento visualmente)
const listContainerVariants: Variants = {
  hidden: {},
  visible: {
    transition: { staggerChildren: 0.05, delayChildren: 0.15 }, // antes 0.12 / 0.6
  },
};

const listItemVariants: Variants = {
  hidden: { opacity: 0, x: -20 },
  visible: {
    opacity: 1,
    x: 0,
    transition: { duration: 0.35, ease: EASE },
  },
};

// Botones: spring más tenso = rebote rápido
const buttonsVariants: Variants = {
  hidden: { opacity: 0, scale: 0.9, y: 16 },
  visible: {
    opacity: 1,
    scale: 1,
    y: 0,
    transition: { type: "spring", stiffness: 320, damping: 22 },
  },
};

interface InfoContainersProps {
  userType?: "patient" | "doctor" | "center";
}

function InfoContainers({ userType = "patient" }: InfoContainersProps) {
  const { t } = useTranslation("landing");
  const [currentType, setCurrentType] = useState(userType);
  const navigate = useNavigate();

  useEffect(() => {
    setCurrentType(userType);
  }, [userType]);

  const content = {
    subtitle: t("users.title"),
    title: t(`users.${currentType}.title`),
    description: t(`users.${currentType}.description`),
    benefits: t(`users.${currentType}.benefits`, {
      returnObjects: true,
    }) as string[],
    buttons: {
      primary: t(`users.${currentType}.buttons.primary`),
      secondary: t(`users.${currentType}.buttons.secondary`),
    },
  };

  return (
    <motion.div
      className="flex flex-col justify-center items-center gap-4 w-full h-full p-8 bg-accent rounded-4xl"
      variants={containerVariants}
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true, amount: 0.05 }} // antes 0.2 — dispara casi de inmediato
    >
      <div className="flex flex-col w-full gap-2 max-w-full sm:max-w-md">
        <motion.h4
          className="tracking-wide font-regular text-primary text-base sm:text-lg md:text-xl"
          variants={textItemVariants}
        >
          {content.subtitle}
        </motion.h4>

        <motion.h2
          className="text-2xl sm:text-3xl md:text-4xl font-medium text-primary"
          variants={textItemVariants}
        >
          {content.title}
        </motion.h2>

        <motion.p
          className="text-base sm:text-lg md:text-xl text-primary font-regular"
          variants={textItemVariants}
        >
          {content.description}
        </motion.p>
      </div>

      <div className="w-full max-w-full sm:max-w-md">
        <h4 className="text-base sm:text-lg font-medium text-primary mb-2 sm:mb-4">
          Incluye:
        </h4>
        <motion.ul
          className="list-disc list-inside text-primary space-y-2 text-sm sm:text-base"
          variants={listContainerVariants}
        >
          {content.benefits.map((benefit, index) => (
            <motion.li key={index} variants={listItemVariants}>
              {benefit}
            </motion.li>
          ))}
        </motion.ul>
      </div>

      <motion.div
        className="flex flex-col sm:flex-row gap-3 sm:gap-4 w-full max-w-full sm:max-w-md"
        variants={buttonsVariants}
      >
        <MediButton
          variant="primary"
          className="w-full sm:w-auto"
          onClick={() => navigate(ROUTES.LOGIN)}
        >
          {content.buttons.primary}
        </MediButton>
        <MediButton
          variant="secondary"
          className="w-full sm:w-auto"
          onClick={() => navigate(ROUTES.REGISTER)}
        >
          {content.buttons.secondary}
        </MediButton>
      </motion.div>
    </motion.div>
  );
}

export default InfoContainers;
