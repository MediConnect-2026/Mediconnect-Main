import React from "react";
import { motion } from "framer-motion";
import { fadeInUp } from "@/lib/animations/commonAnimations";
import MCBackButton from "@/shared/components/forms/MCBackButton";
import { useIsMobile } from "@/lib/hooks/useIsMobile";
import { useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { ArrowLeft } from "lucide-react";

interface Props {
  children: React.ReactNode;
  showBackButton?: boolean;
  onBack?: () => void;
  disabledBackButton?: boolean;
  mainWidth?: string;
  mainClassName?: string;
  noBg?: boolean;
  isTele?: boolean;
  create?: boolean; // <-- nueva prop
}

const MCDashboardContent: React.FC<Props> = ({
  children,
  showBackButton = true,
  onBack,
  disabledBackButton,
  mainWidth = "max-w-2xl",
  mainClassName = "",
  noBg = false,
  isTele = false,
  create = false, // <-- default
}) => {
  const isMobile = useIsMobile();
  const navigate = useNavigate();
  const { t } = useTranslation();

  return (
    <div
      className={`${noBg ? "bg-transparent" : "bg-background"} min-h-screen flex gap-4 rounded-4xl ${isMobile ? "py-4 px-4" : "py-10 px-4"}`}
    >
      <div
        className={`w-full ${
          isMobile
            ? "flex flex-col"
            : isTele
              ? "grid grid-cols-[0.5fr_9fr_0.5fr]"
              : "grid grid-cols-[1fr_8fr_1fr]"
        } justify-items-center `}
      >
        <aside className={isMobile ? "w-full mb-4" : ""}>
          {create ? (
            <div
              onClick={onBack || (() => navigate(-1))}
              role="button"
              tabIndex={0}
              className="group flex items-center gap-2 text-primary transition-all duration-150 hover:opacity-80 active:scale-95 cursor-pointer"
              style={{ background: "none", border: "none" }}
            >
              <ArrowLeft
                className="transition-transform duration-200 group-hover:-translate-x-1 group-hover:scale-110"
                size={20}
              />
              <span className="font-medium text-lg">{t("Abandonar")}</span>
            </div>
          ) : (
            showBackButton && (
              <MCBackButton
                onClick={onBack || (() => navigate(-1))}
                disabled={disabledBackButton}
                variant={noBg ? "background" : "default"}
              />
            )
          )}
        </aside>
        <motion.main
          {...fadeInUp}
          className={`${isMobile ? "w-full" : mainWidth} flex flex-col gap-4 ${mainClassName}`}
        >
          {children}
        </motion.main>
        {!isMobile && <div />}
      </div>
    </div>
  );
};

export default MCDashboardContent;
