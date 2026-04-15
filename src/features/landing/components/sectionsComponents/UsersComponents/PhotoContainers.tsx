import { motion, type Variants } from "framer-motion";
import { clPortrait } from "@/utils/cloudinary";
import { useIsMobile } from "@/lib/hooks/useIsMobile";

// ─── Variants ────────────────────────────────────────────────────────────────

const photoVariants: Variants = {
  hidden: { opacity: 0, scale: 0.95, y: 40 },
  visible: {
    opacity: 1,
    scale: 1,
    y: 0,
    transition: { duration: 0.45, ease: "easeOut" as const },
  },
};

// ─── Types ────────────────────────────────────────────────────────────────────

interface PhotoContainersProps {
  userType: "patient" | "doctor" | "center";
}

// ─── Component ────────────────────────────────────────────────────────────────

function PhotoContainers({ userType }: PhotoContainersProps) {
  const isMobile = useIsMobile();

  const getImageData = () => {
    switch (userType) {
      case "patient":
        return {
          src: clPortrait(
            "https://res.cloudinary.com/dy2wtanhl/image/upload/v1774847436/ChatGPT_Image_30_mar_2026_01_10_20_a.m._j79zxr.png",
            isMobile,
          ),
          alt: "Paciente usando la aplicación MediConnect en su dispositivo móvil",
        };
      case "doctor":
        return {
          src: clPortrait(
            "https://res.cloudinary.com/dy2wtanhl/image/upload/v1774847013/ChatGPT_Image_30_mar_2026_01_03_12_a.m._up1vx9.png",
            isMobile,
          ),
          alt: "Médico profesional utilizando MediConnect para gestionar citas",
        };
      case "center":
        return {
          src: clPortrait(
            "https://res.cloudinary.com/dy2wtanhl/image/upload/v1774846285/ChatGPT_Image_30_mar_2026_12_44_44_a.m._nikj7b.png",
            isMobile,
          ),
          alt: "Centro médico moderno equipado con tecnología MediConnect",
        };
      default:
        return {
          src: clPortrait(
            "https://res.cloudinary.com/dy2wtanhl/image/upload/v1774845192/ChatGPT_Image_30_mar_2026_12_32_18_a.m._shutnj.png",
            isMobile,
          ),
          alt: "Usuario de MediConnect",
        };
    }
  };

  const imageData = getImageData();

  return (
    <motion.div
      className="bg-accent rounded-4xl overflow-hidden flex items-center justify-center"
      variants={photoVariants}
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true, amount: 0.15 }}
    >
      <div className="w-full overflow-hidden inline-block aspect-[4/5]">
        <img
          src={imageData.src}
          alt={imageData.alt}
          className="w-full h-full object-cover object-top rounded-4xl hover:scale-115 transition-transform duration-500"
          loading="lazy"
        />
      </div>
    </motion.div>
  );
}

export default PhotoContainers;
