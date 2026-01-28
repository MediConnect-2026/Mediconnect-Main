import React from "react";
import { motion } from "framer-motion";
import { fadeInUp } from "@/lib/animations/commonAnimations";
import MCBackButton from "@/shared/components/forms/MCBackButton";
import { useIsMobile } from "@/lib/hooks/useIsMobile";
import { useNavigate } from "react-router-dom";

interface Props {
  children: React.ReactNode;
  showBackButton?: boolean;
  onBack?: () => void;
  mainWidth?: string;
}

const MCDashboardContent: React.FC<Props> = ({
  children,
  showBackButton = true,
  onBack,
  mainWidth = "max-w-2xl",
}) => {
  const isMobile = useIsMobile();
  const navigate = useNavigate();

  return (
    <div
      className={`bg-background min-h-screen flex gap-4 rounded-4xl ${isMobile ? "py-4 px-4" : "py-10"}`}
    >
      <div
        className={`w-full ${isMobile ? "flex flex-col" : "grid grid-cols-[1fr_7fr_1fr]"} justify-items-center`}
      >
        <aside className={isMobile ? "w-full mb-4" : ""}>
          {showBackButton && (
            <MCBackButton onClick={onBack || (() => navigate(-1))} />
          )}
        </aside>
        <motion.main
          {...fadeInUp}
          className={`${isMobile ? "w-full" : mainWidth} flex flex-col gap-4`}
        >
          {children}
        </motion.main>
        {!isMobile && <div />}
      </div>
    </div>
  );
};

export default MCDashboardContent;
