import React from "react";
import { motion } from "framer-motion";
import { Check } from "lucide-react";
import { cn } from "@/lib/utils";

export type StepStatus = "wait" | "process" | "finish" | "error";

export interface StepItem {
  title?: string;
  subTitle?: string;
  icon?: React.ReactNode;
  status?: StepStatus;
  disabled?: boolean;
}

export interface MCStepperProps {
  items: StepItem[];
  current?: number;
  onChange?: (current: number) => void;
  size?: "default" | "large";
  showLabels?: boolean;
  className?: string;
}

const getStepStatus = (
  index: number,
  current: number,
  itemStatus?: StepStatus
): StepStatus => {
  if (itemStatus) return itemStatus;
  if (index < current) return "finish";
  if (index === current) return "process";
  return "wait";
};

function MCStepper({
  items,
  current = 0,
  onChange,
  size = "large",
  showLabels = false,
  className,
}: MCStepperProps) {
  const isLarge = size === "large";

  return (
    <div className={cn("flex items-start w-full", className)}>
      {items.map((item, index) => {
        const status = getStepStatus(index, current, item.status);
        const isLast = index === items.length - 1;
        const isClickable = onChange && !item.disabled;

        // Colores personalizados
        const bubbleBg =
          status === "finish" || status === "process"
            ? "bg-[#D7E3C9]"
            : "bg-[#D7E3C9] opacity-60";
        const bubbleText = "text-[#0B2C12]";
        const ringAccent =
          status === "process" ? "ring-4 ring-[#D7E3C9]/50" : "";

        return (
          <React.Fragment key={index}>
            <div className="flex flex-col items-center flex-shrink-0">
              {/* Step Circle */}
              <motion.button
                type="button"
                onClick={() => isClickable && onChange(index)}
                disabled={!isClickable}
                className={cn(
                  "relative flex items-center justify-center rounded-full transition-all",
                  "h-14 w-14 text-2xl font-semibold",
                  isClickable && "cursor-pointer",
                  !isClickable && "cursor-default",
                  bubbleBg,
                  bubbleText,
                  ringAccent
                )}
                style={{
                  boxShadow: undefined,
                }}
                whileHover={isClickable ? { scale: 1.08 } : undefined}
                whileTap={isClickable ? { scale: 0.95 } : undefined}
                layout
              >
                {item.icon ? (
                  item.icon
                ) : status === "finish" ? (
                  <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ type: "spring", stiffness: 300, damping: 20 }}
                  >
                    <Check
                      className={cn(
                        "h-8 w-8",
                        // Si el paso está terminado pero no es el actual, baja opacidad
                        current !== index && "opacity-60"
                      )}
                      strokeWidth={3}
                    />
                  </motion.div>
                ) : (
                  <span>{index + 1}</span>
                )}
              </motion.button>

              {/* Labels below circle */}
              {showLabels && (item.title || item.subTitle) && (
                <div className="mt-3 text-center">
                  {item.title && (
                    <div
                      className={cn(
                        "font-medium transition-colors",
                        isLarge ? "text-base" : "text-sm",
                        "text-[#0B2C12]",
                        status === "wait" && "opacity-50"
                      )}
                    >
                      {item.title}
                    </div>
                  )}
                  {item.subTitle && (
                    <div
                      className={cn(
                        "mt-1",
                        isLarge ? "text-sm" : "text-xs",
                        "text-[#0B2C12] opacity-40"
                      )}
                    >
                      {item.subTitle}
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Connector Line */}
            {!isLast && (
              <div
                className={cn(
                  "flex-1 h-0.5 mx-1 relative overflow-hidden",
                  "mt-10"
                )}
              >
                <div className="absolute inset-0 bg-[#D7E3C9]/30" />
                <motion.div
                  className="absolute inset-0 origin-left bg-[#D7E3C9]"
                  initial={{ scaleX: 0 }}
                  animate={{ scaleX: index < current ? 1 : 0 }}
                  transition={{ duration: 0.4, ease: "easeInOut" }}
                />
              </div>
            )}
          </React.Fragment>
        );
      })}
    </div>
  );
}

export default MCStepper;
