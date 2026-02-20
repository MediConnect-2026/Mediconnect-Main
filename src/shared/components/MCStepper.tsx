import React from "react";
import { Check } from "lucide-react";
import { cn } from "@/lib/utils";
import { Separator } from "../ui/separator";
import { useIsMobile } from "@/lib/hooks/useIsMobile";

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
  itemStatus?: StepStatus,
): StepStatus => {
  if (itemStatus) return itemStatus;
  if (index < current) return "finish";
  if (index === current) return "process";
  return "wait";
};

function MCStepper({
  items,
  current = 0,
  size = "large",
  showLabels = true,
  className,
}: MCStepperProps) {
  const isMobile = useIsMobile();
  const isLarge = size === "large";

  return (
    <div
      className={cn(
        "flex items-center w-full",
        isMobile ? "justify-center gap-4" : "gap-1",
        className,
      )}
    >
      {items.map((item, index) => {
        const status = getStepStatus(index, current, item.status);
        const isLast = index === items.length - 1;

        // Updated styling based on status
        const getBubbleStyles = () => {
          switch (status) {
            case "process":
              return {
                background: "bg-transparent",
                border: "border-2 border-primary",
                text: "text-primary",
                ring: "ring-3 ring-primary/20",
              };
            case "wait":
              return {
                background: "bg-transparent",
                border: "border-2 border-primary/20",
                text: "text-primary/45",
                ring: "",
              };
            case "finish":
            default:
              return {
                background: "bg-[#D7E3C9]",
                border: "",
                text: "text-[#0B2C12]",
                ring: "",
              };
          }
        };

        const bubbleStyles = getBubbleStyles();

        return (
          <React.Fragment key={index}>
            <div className="flex flex-col items-center flex-shrink-0">
              {/* Step Circle */}
              <button
                type="button"
                disabled
                className={cn(
                  "relative flex items-center justify-center rounded-full transition-all font-semibold",
                  isMobile ? "h-10 w-10 text-base" : "h-12 w-12 text-lg",
                  bubbleStyles.background,
                  bubbleStyles.border,
                  bubbleStyles.text,
                  bubbleStyles.ring,
                  "cursor-default",
                )}
                style={{
                  boxShadow: undefined,
                }}
              >
                {item.icon ? (
                  <div
                    className={cn(
                      "flex items-center justify-center",
                      isMobile ? "h-4 w-4" : "h-5 w-5",
                    )}
                  >
                    {item.icon}
                  </div>
                ) : status === "finish" ? (
                  <div>
                    <Check
                      className={cn(
                        "stroke-2",
                        isMobile ? "h-5 w-5" : "h-6 w-6",
                      )}
                      strokeWidth={3}
                    />
                  </div>
                ) : (
                  <span>{index + 1}</span>
                )}
              </button>

              {/* Labels below circle */}
              {showLabels && (item.title || item.subTitle) && (
                <div
                  className={cn(
                    "mt-3 text-center",
                    isMobile && "hidden md:block",
                  )}
                >
                  {item.title && (
                    <div
                      className={cn(
                        "font-medium transition-colors",
                        isLarge ? "text-base" : "text-sm",
                        "text-[#0B2C12]",
                        status === "wait" && "opacity-50",
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
                        "text-[#0B2C12] opacity-40",
                      )}
                    >
                      {item.subTitle}
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Divider Line - hidden on mobile */}
            {!isLast && !isMobile && (
              <div className="flex-1 flex items-center justify-center">
                <Separator
                  orientation="horizontal"
                  className="h-[3px] w-full mx-8 bg-primary/20"
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
