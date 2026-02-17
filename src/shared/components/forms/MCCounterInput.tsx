import { useFormContext, Controller } from "react-hook-form";
import { useRef, useEffect } from "react";
import { Minus, Plus } from "lucide-react";
import { useTranslation } from "react-i18next";
import { useIsMobile } from "@/lib/hooks/useIsMobile";

interface MCCounterInputProps {
  name: string;
  variant: "price" | "hours" | "participants";
  label?: string;
  min?: number;
  max?: number;
  step?: number;
  defaultValue?: number | string | { hours: number; minutes: number };
  onChange?: (value: any) => void;
}

const MCCounterInput = ({
  name,
  variant,
  label,
  min = 0,
  max,
  step = 1,
  defaultValue = 0,
  onChange,
}: MCCounterInputProps) => {
  const { control } = useFormContext();
  const { t } = useTranslation("doctor");
  const isMobile = useIsMobile();

  const intervalRef = useRef<number | null>(null);
  const timeoutRef = useRef<number | null>(null);

  const startHolding = (
    increment: boolean,
    currentValue: number,
    onChange: (value: number) => void,
  ) => {
    const direction = increment ? step : -step;

    timeoutRef.current = setTimeout(() => {
      intervalRef.current = setInterval(() => {
        currentValue += direction;
        if (
          currentValue >= min &&
          (typeof max === "number" ? currentValue <= max : true)
        ) {
          onChange(currentValue);
        }
      }, 100);
    }, 500);
  };

  const stopHolding = () => {
    if (intervalRef.current) clearInterval(intervalRef.current);
    if (timeoutRef.current) clearTimeout(timeoutRef.current);
  };

  useEffect(() => {
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
    };
  }, []);

  const getDefaultValue = () => {
    if (variant === "hours") {
      return { hours: 0, minutes: 1 };
    }
    return defaultValue;
  };

  const renderPriceVariant = (field: any) => (
    <div className="flex flex-col items-center gap-3">
      <div className={`flex items-center ${isMobile ? "gap-4" : "gap-8"}`}>
        <button
          type="button"
          onMouseDown={() => {
            const newValue = Math.max(min, field.value - step);
            field.onChange(newValue);
            startHolding(false, newValue, field.onChange);
          }}
          onMouseUp={stopHolding}
          onMouseLeave={stopHolding}
          onTouchStart={() => {
            const newValue = Math.max(min, field.value - step);
            field.onChange(newValue);
            startHolding(false, newValue, field.onChange);
          }}
          onTouchEnd={stopHolding}
          className={`${isMobile ? "p-1.5" : "p-2"} rounded-full border-2 border-primary/20 hover:border-primary/40 hover:bg-primary/5 active:scale-90 transition-all duration-200`}
        >
          <Minus
            className={`${isMobile ? "w-4 h-4" : "w-5 h-5"} text-primary`}
          />
        </button>
        <div
          className={`flex items-center gap-1 ${isMobile ? "min-w-[120px]" : "min-w-[150px]"} justify-center`}
        >
          <span
            className={`${isMobile ? "text-xl" : "text-2xl"} font-bold text-primary`}
          >
            RD$
          </span>
          <input
            type="number"
            min={min}
            {...(variant === "price" && max !== undefined ? { max } : {})}
            value={field.value}
            onChange={(e) => {
              let val = parseInt(e.target.value, 10);
              if (isNaN(val)) val = min;
              field.onChange(val);
            }}
            className={`${isMobile ? "text-3xl w-[120px]" : "text-4xl w-[150px]"} font-bold text-primary tabular-nums text-center bg-transparent outline-none`}
          />
        </div>
        <button
          type="button"
          onMouseDown={() => {
            let newValue = field.value + step;
            if (typeof max === "number") newValue = Math.min(max, newValue);
            field.onChange(newValue);
            startHolding(true, newValue, field.onChange);
          }}
          onMouseUp={stopHolding}
          onMouseLeave={stopHolding}
          onTouchStart={() => {
            let newValue = field.value + step;
            if (typeof max === "number") newValue = Math.min(max, newValue);
            field.onChange(newValue);
            startHolding(true, newValue, field.onChange);
          }}
          onTouchEnd={stopHolding}
          className={`${isMobile ? "p-1.5" : "p-2"} rounded-full border-2 border-primary/20 hover:border-primary/40 hover:bg-primary/5 active:scale-90 transition-all duration-200`}
        >
          <Plus
            className={`${isMobile ? "w-4 h-4" : "w-5 h-5"} text-primary`}
          />
        </button>
      </div>
    </div>
  );

  const renderHoursVariant = (field: any) => {
    const value = field.value || { hours: 0, minutes: 1 };
    const hours = value.hours ?? 0;
    const minutes = value.minutes ?? 1;

    const updateTime = (newHours: number, newMinutes: number) => {
      if (newHours < 0) newHours = 0;
      if (newHours > 23) newHours = 23;
      if (newMinutes < 1) newMinutes = 1;
      if (newMinutes > 59) newMinutes = 59;

      field.onChange({ hours: newHours, minutes: newMinutes });
    };

    return (
      <div
        className={`flex flex-col items-center ${isMobile ? "gap-4" : "gap-6"}`}
      >
        {label && (
          <p
            className={`${isMobile ? "text-sm" : "text-base"} text-muted-foreground font-medium`}
          >
            {label}
          </p>
        )}

        {/* Horas */}
        <div className="flex flex-col items-center gap-3">
          <p
            className={`${isMobile ? "text-xs" : "text-sm"} text-primary/80 uppercase tracking-wide`}
          >
            {t("form.hours")}
          </p>
          <div className={`flex items-center ${isMobile ? "gap-3" : "gap-4"}`}>
            <button
              type="button"
              onMouseDown={() => updateTime(hours - 1, minutes)}
              disabled={hours <= 0}
              className={`${isMobile ? "p-2" : "p-2.5"} rounded-full border-2 border-primary/20 hover:border-primary/40 hover:bg-primary/5 active:scale-90 transition-all duration-200 disabled:opacity-40`}
            >
              <Minus
                className={`${isMobile ? "w-3.5 h-3.5" : "w-4 h-4"} text-primary`}
              />
            </button>
            <input
              type="number"
              min={0}
              max={23}
              value={hours}
              onChange={(e) => {
                let val = parseInt(e.target.value, 10);
                if (isNaN(val)) val = 0;
                updateTime(val, minutes);
              }}
              className={`${isMobile ? "text-4xl min-w-[60px]" : "text-6xl min-w-[80px]"} font-bold text-primary tabular-nums text-center bg-transparent outline-none`}
              style={{ width: isMobile ? 70 : 100 }}
            />
            <button
              type="button"
              onMouseDown={() => updateTime(hours + 1, minutes)}
              disabled={hours >= 23}
              className={`${isMobile ? "p-2" : "p-2.5"} rounded-full border-2 border-primary/20 hover:border-primary/40 hover:bg-primary/5 active:scale-90 transition-all duration-200 disabled:opacity-40`}
            >
              <Plus
                className={`${isMobile ? "w-3.5 h-3.5" : "w-4 h-4"} text-primary`}
              />
            </button>
          </div>
        </div>

        {/* Minutos */}
        <div className="flex flex-col items-center gap-3">
          <p
            className={`${isMobile ? "text-xs" : "text-sm"} text-primary/80 uppercase tracking-wide`}
          >
            {t("form.minutes")}
          </p>
          <div className={`flex items-center ${isMobile ? "gap-3" : "gap-4"}`}>
            <button
              type="button"
              onMouseDown={() => updateTime(hours, minutes - 1)}
              disabled={minutes <= 0}
              className={`${isMobile ? "p-2" : "p-2.5"} rounded-full border-2 border-primary/20 hover:border-primary/40 hover:bg-primary/5 active:scale-90 transition-all duration-200 disabled:opacity-40`}
            >
              <Minus
                className={`${isMobile ? "w-3.5 h-3.5" : "w-4 h-4"} text-primary`}
              />
            </button>
            <input
              type="number"
              min={0}
              max={59}
              value={minutes}
              onChange={(e) => {
                let val = parseInt(e.target.value, 10);
                if (isNaN(val)) val = 0;
                updateTime(hours, val);
              }}
              className={`${isMobile ? "text-4xl min-w-[60px]" : "text-6xl min-w-[80px]"} font-bold text-primary tabular-nums text-center bg-transparent outline-none`}
              style={{ width: isMobile ? 70 : 100 }}
            />
            <button
              type="button"
              onMouseDown={() => updateTime(hours, minutes + 1)}
              disabled={minutes >= 59}
              className={`${isMobile ? "p-2" : "p-2.5"} rounded-full border-2 border-primary/20 hover:border-primary/40 hover:bg-primary/5 active:scale-90 transition-all duration-200 disabled:opacity-40`}
            >
              <Plus
                className={`${isMobile ? "w-3.5 h-3.5" : "w-4 h-4"} text-primary`}
              />
            </button>
          </div>
        </div>
      </div>
    );
  };

  const renderParticipantsVariant = (field: any) => (
    <div
      className={`flex flex-col items-center ${isMobile ? "gap-3" : "gap-4"}`}
    >
      {label && (
        <p
          className={`${isMobile ? "text-sm" : "text-base"} text-primary/80 font-medium`}
        >
          {label}
        </p>
      )}
      <div className={`flex items-center ${isMobile ? "gap-4" : "gap-6"}`}>
        <button
          type="button"
          onMouseDown={() => {
            const newValue = Math.max(min, field.value - step);
            field.onChange(newValue);
            startHolding(false, newValue, field.onChange);
          }}
          onMouseUp={stopHolding}
          onMouseLeave={stopHolding}
          className={`${isMobile ? "p-2" : "p-3"} rounded-full border-2 border-primary/20 hover:border-primary/40 hover:bg-primary/5 active:scale-90 transition-all duration-200`}
        >
          <Minus
            className={`${isMobile ? "w-4 h-4" : "w-5 h-5"} text-primary`}
          />
        </button>

        <input
          type="number"
          min={min}
          max={max}
          value={field.value}
          onChange={(e) => {
            let val = parseInt(e.target.value, 10);
            if (isNaN(val)) val = min;
            field.onChange(val);
          }}
          className={`${isMobile ? "text-5xl min-w-[60px]" : "text-7xl min-w-[80px]"} font-bold text-primary tabular-nums text-center bg-transparent outline-none`}
          style={{ width: isMobile ? 90 : 120 }}
        />

        <button
          type="button"
          onMouseDown={() => {
            const newValue =
              typeof max === "number"
                ? Math.min(max, field.value + step)
                : field.value + step;
            field.onChange(newValue);
            startHolding(true, newValue, field.onChange);
          }}
          onMouseUp={stopHolding}
          onMouseLeave={stopHolding}
          className={`${isMobile ? "p-2" : "p-3"} rounded-full border-2 border-primary/20 hover:border-primary/40 hover:bg-primary/5 active:scale-90 transition-all duration-200`}
        >
          <Plus
            className={`${isMobile ? "w-4 h-4" : "w-5 h-5"} text-primary`}
          />
        </button>
      </div>
    </div>
  );

  return (
    <Controller
      name={name}
      control={control}
      defaultValue={getDefaultValue()}
      render={({ field }) => {
        const handleChange = (value: any) => {
          field.onChange(value);
          if (onChange) {
            onChange(value);
          }
        };

        const fieldWithCustomOnChange = {
          ...field,
          onChange: handleChange,
        };

        return (
          <div
            className={`w-full max-w-md mx-auto ${isMobile ? "py-4" : "py-6"}`}
          >
            {variant === "price" && renderPriceVariant(fieldWithCustomOnChange)}
            {variant === "hours" && renderHoursVariant(fieldWithCustomOnChange)}
            {variant === "participants" &&
              renderParticipantsVariant(fieldWithCustomOnChange)}
          </div>
        );
      }}
    />
  );
};

export default MCCounterInput;
