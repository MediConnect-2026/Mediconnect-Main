import React, { useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Sun, Moon, Monitor } from "lucide-react";
import { useGlobalUIStore } from "@/stores/useGlobalUIStore";
import type { Theme } from "@/stores/useGlobalUISlice";
export type Direction = "ltr" | "rtl" | "ttb" | "btt";

interface ThemeTogglerProps {
  direction?: Direction;
  className?: string;
  size?: "sm" | "md" | "lg";
}

const sizeMap = {
  sm: "w-8 h-8",
  md: "w-10 h-10",
  lg: "w-12 h-12",
};

const iconSizeMap = {
  sm: 16,
  md: 20,
  lg: 24,
};

const getAnimationDirection = (direction: Direction) => {
  switch (direction) {
    case "ltr":
      return { x: -20, y: 0 };
    case "rtl":
      return { x: 20, y: 0 };
    case "ttb":
      return { x: 0, y: -20 };
    case "btt":
      return { x: 0, y: 20 };
  }
};

export const ThemeToggler: React.FC<ThemeTogglerProps> = ({
  direction = "btt",
  className = "",
  size = "md",
}) => {
  const { theme, resolvedTheme, setTheme } = useGlobalUIStore();
  const buttonRef = useRef<HTMLButtonElement>(null);

  const getNextTheme = (): Theme => {
    if (theme === "light") return "dark";
    if (theme === "dark") return "system";
    return "light";
  };

  const handleToggle = () => {
    const nextTheme = getNextTheme();
    setTheme(nextTheme);
  };

  const effective = theme === "system" ? "system" : resolvedTheme;
  const animationDir = getAnimationDirection(direction);
  const iconSize = iconSizeMap[size];

  const IconComponent =
    effective === "system" ? Monitor : effective === "dark" ? Moon : Sun;

  return (
    <motion.button
      ref={buttonRef}
      onClick={handleToggle}
      className={`
        relative flex items-center justify-center rounded-xl
        bg-neutral text-foreground
        border border-border
        transition-theme
        hover:bg-accent hover:border-ring
        focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 focus:ring-offset-background
        ${sizeMap[size]}
        ${className}
      `}
      whileHover={{ scale: 1.05 }}
      whileTap={{ scale: 0.95 }}
      aria-label={`Current theme: ${theme}. Click to switch to ${getNextTheme()}`}
    >
      <AnimatePresence mode="wait" initial={false}>
        <motion.div
          key={effective}
          initial={{
            opacity: 0,
            x: animationDir.x,
            y: animationDir.y,
            rotate: direction === "ltr" || direction === "rtl" ? -90 : 0,
            scale: 0.5,
          }}
          animate={{
            opacity: 1,
            x: 0,
            y: 0,
            rotate: 0,
            scale: 1,
          }}
          exit={{
            opacity: 0,
            x: -animationDir.x,
            y: -animationDir.y,
            rotate: direction === "ltr" || direction === "rtl" ? 90 : 0,
            scale: 0.5,
          }}
          transition={{
            duration: 0.3,
            ease: [0.4, 0, 0.2, 1],
          }}
          className="absolute inset-0 flex items-center justify-center"
        >
          <IconComponent size={iconSize} strokeWidth={2} />
        </motion.div>
      </AnimatePresence>
    </motion.button>
  );
};

export default ThemeToggler;
