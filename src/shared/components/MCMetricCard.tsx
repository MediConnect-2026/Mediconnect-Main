import React from "react";
import { ArrowUp } from "lucide-react";
import { useIsMobile } from "@/lib/hooks/useIsMobile";

type MCMetricCardProps = {
  title: string;
  icon: React.ReactNode;
  value: string | number;
  subtitle?: string;
  percentage?: string;
  bordered?: boolean;
};

const MCMetricCard: React.FC<MCMetricCardProps> = ({
  title,
  icon,
  value,
  subtitle,
  percentage,
  bordered = true,
}) => {
  const isMobile = useIsMobile();

  return (
    <div
      className={`relative flex flex-col justify-start w-full rounded-3xl bg-background shadow-sm p-4 transition-colors ${
        bordered ? "border border-primary/10" : ""
      }`}
    >
      <div className="flex items-start gap-4 mb-5">
        <div
          className="flex items-center justify-center rounded-full bg-accent flex-shrink-0"
          style={{ width: isMobile ? 48 : 60, height: isMobile ? 48 : 60 }}
        >
          <span
            className={`flex items-center justify-center ${
              isMobile ? "text-xl" : "text-2xl"
            } text-accent-accent-foreground`}
          >
            {icon}
          </span>
        </div>
        <div className="flex-1 overflow-hidden">
          <div className="text-base md:text-base font-semibold mb-1.5 leading-tight text-foreground">
            {title}
          </div>
          {subtitle && (
            <div className="text-xs md:text-sm text-muted-foreground font-normal leading-tight line-clamp-2 max-w-[90%]">
              {subtitle}
            </div>
          )}
        </div>
      </div>

      <div
        className={`font-bold leading-none text-primary ${
          isMobile ? "text-3xl mb-2" : "text-4xl mb-4"
        }`}
      >
        {value}
      </div>

      {percentage && (
        <div className="flex items-center gap-2 mt-auto">
          <div className="flex items-center justify-center rounded-full w-fit h-fit py-2 px-3 bg-accent">
            <span className="text-xs font-medium text-accent-accent-foreground flex items-center justify-center">
              <ArrowUp className="w-4 h-4 text-accent-foreground" />
              <p className="text-accent-foreground">{percentage}</p>
            </span>
          </div>
          <div className="flex items-center">
            <span className="text-sm text-muted-foreground">
              más que el mes pasado
            </span>
          </div>
        </div>
      )}
    </div>
  );
};

export default MCMetricCard;
