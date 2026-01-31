import React from "react";
import { Calendar } from "@/shared/ui/calendar";
import { Button } from "@/shared/ui/button";
import { Popover, PopoverContent, PopoverTrigger } from "@/shared/ui/popover";
import { CalendarIcon } from "lucide-react";
import { format } from "date-fns";
import { es, enUS } from "date-fns/locale";
import { cn } from "@/lib/utils";
import { useTranslation } from "react-i18next";

interface MCFilterDatesProps {
  label?: string;
  value?: [Date, Date];
  onChange: (dateRange?: [Date, Date]) => void;
  placeholder?: {
    start?: string;
    end?: string;
  };
  className?: string;
  size?: "small" | "medium" | "large";
  variant?: "edit";
}

function MCFilterDates({
  label,
  value,
  onChange,
  placeholder,
  className = "",
  size = "small",
  variant,
}: MCFilterDatesProps) {
  const { t, i18n } = useTranslation("common");

  // Get the appropriate locale for date formatting
  const dateLocale = i18n.language === "es" ? es : enUS;

  // Always use translation placeholders, ignore the prop placeholders
  const fixedPlaceholders = {
    start: t("ui.dates.startDate"),
    end: t("ui.dates.endDate"),
  };

  const getSizeClasses = () => {
    switch (size) {
      case "small":
        return "h-10 px-3 text-sm";
      case "large":
        return "h-16 px-6 text-lg";
      default:
        return "h-12 sm:h-[60px] px-3 sm:px-5";
    }
  };

  const getVariantClasses = () => {
    if (variant === "edit") {
      return "border-none bg-accent text-primary/80 placeholder:text-primary/60";
    }
    return "";
  };

  const buttonClasses = cn(
    "w-full justify-start text-left font-normal rounded-4xl border-primary/50 focus:border-primary text-primary",
    "focus-visible:border-ring focus-visible:ring-accent/70 focus-visible:ring-[3px]",
    " dark:bg-input/30 bg-bg-secondary",
    getSizeClasses(),
    getVariantClasses(),
    className,
  );

  return (
    <div className="w-full flex flex-col mb-4 px-0">
      {label && (
        <div className="flex flex-row justify-between items-center mb-2 gap-2">
          <span
            className={cn(
              "text-left text-base sm:text-lg text-primary",
              size === "small"
                ? "text-sm"
                : size === "large"
                  ? "text-lg"
                  : "text-base",
            )}
          >
            {label}
          </span>
        </div>
      )}

      <div className="flex gap-2">
        {/* Fecha de inicio */}
        <Popover>
          <PopoverTrigger asChild>
            <Button variant="outline" className={buttonClasses}>
              <CalendarIcon className="mr-2 h-4 w-4" />
              {value?.[0] ? (
                format(value[0], "PPP", { locale: dateLocale })
              ) : (
                <span className="text-primary/50">
                  {fixedPlaceholders.start}
                </span>
              )}
            </Button>
          </PopoverTrigger>
          <PopoverContent
            className="w-auto p-0 bg-background border border-primary/15 rounded-3xl"
            align="start"
          >
            <Calendar
              mode="single"
              selected={value?.[0]}
              compact
              onSelect={(date) => {
                if (date) {
                  const newRange: [Date, Date] = [date, value?.[1] || date];
                  onChange(newRange);
                }
              }}
              initialFocus
            />
          </PopoverContent>
        </Popover>

        {/* Fecha de fin */}
        <Popover>
          <PopoverTrigger asChild>
            <Button variant="outline" className={buttonClasses}>
              <CalendarIcon className="mr-2 h-4 w-4" />
              {value?.[1] ? (
                format(value[1], "PPP", { locale: dateLocale })
              ) : (
                <span className="text-primary/50">{fixedPlaceholders.end}</span>
              )}
            </Button>
          </PopoverTrigger>
          <PopoverContent
            className="w-auto p-0 bg-background border border-primary/15 rounded-3xl"
            align="start"
          >
            <Calendar
              mode="single"
              compact
              selected={value?.[1]}
              onSelect={(date) => {
                if (date) {
                  const newRange: [Date, Date] = [value?.[0] || date, date];
                  onChange(newRange);
                }
              }}
              disabled={(date) => (value?.[0] ? date < value[0] : false)}
              initialFocus
            />
          </PopoverContent>
        </Popover>
      </div>
    </div>
  );
}

export default MCFilterDates;
