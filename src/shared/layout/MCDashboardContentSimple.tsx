import React from "react";
import { motion } from "framer-motion";
import { fadeInUp } from "@/lib/animations/commonAnimations";
import { useIsMobile } from "@/lib/hooks/useIsMobile";

interface Props {
  children: React.ReactNode;
  mainWidth?: string;
}

const MCDashboardContentSimple: React.FC<Props> = ({
  children,
  mainWidth = "max-w-2xl",
}) => {
  const isMobile = useIsMobile();

  return (
    <div
      className={`bg-background min-h-screen  w-full flex gap-4 rounded-4xl ${isMobile ? "py-4 px-4" : "py-10 "}`}
    >
      <motion.main {...fadeInUp}>{children}</motion.main>
    </div>
  );
};

export default MCDashboardContentSimple;
