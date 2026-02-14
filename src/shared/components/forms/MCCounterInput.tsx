import { useFormContext, Controller } from "react-hook-form";
import { useState, useRef, useEffect } from "react";
import { DollarSign, Minus, Plus } from "lucide-react";

interface MCCounterInputProps {
  name: string;
  variant: "price" | "hours" | "participants";
  label?: string;
  min?: number;
  max?: number;
  step?: number;
  defaultValue?: number | string;
  onChange?: (value: any) => void; // Add optional onChange prop
}

const MCCounterInput = ({
  name,
  variant,
  label,
  min = 0,
  max,
  step = 1,
  defaultValue = 0,
  onChange, // Accept onChange prop
}: MCCounterInputProps) => {
  const { control, setValue } = useFormContext();
  const [isHolding, setIsHolding] = useState(false);
  const intervalRef = useRef<number | null>(null);
  const timeoutRef = useRef<number | null>(null);

  // Función para convertir HH:mm:ss a minutos totales
  const timeStringToMinutes = (timeString: string): number => {
    const [hours, minutes] = timeString.split(":").map(Number);
    return (hours || 0) * 60 + (minutes || 0);
  };

  // Función para convertir minutos totales a HH:mm:ss
  const minutesToTimeString = (totalMinutes: number): string => {
    const hours = Math.floor(totalMinutes / 60);
    const minutes = totalMinutes % 60;
    return `${String(hours).padStart(2, "0")}:${String(minutes).padStart(2, "0")}:00`;
  };

  const startHolding = (
    increment: boolean,
    currentValue: number,
    onChange: (value: number) => void,
  ) => {
    setIsHolding(true);
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
    setIsHolding(false);
    if (intervalRef.current) clearInterval(intervalRef.current);
    if (timeoutRef.current) clearTimeout(timeoutRef.current);
  };

  useEffect(() => {
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
    };
  }, []);

  const renderPriceVariant = (field: any) => (
    <div className="flex flex-col items-center gap-4">
      <div className="flex items-center gap-12">
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
          className="p-3 rounded-full border-2 border-primary/20 hover:border-primary/40 hover:bg-primary/5 active:scale-90 transition-all duration-200"
        >
          <Minus className="w-5 h-5 text-primary" />
        </button>
        <div className="flex items-center gap-4 min-w-[220px] justify-center">
          <span className="text-4xl font-bold text-primary">RD$</span>
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
            className="text-6xl font-bold text-primary tabular-nums min-w-[180px] text-center bg-transparent outline-none"
            style={{ width: 220 }}
          />
        </div>
        <button
          type="button"
          onMouseDown={() => {
            let newValue = field.value + step;
            // Solo limitar si max está definido
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
          className="p-3 rounded-full border-2 border-primary/20 hover:border-primary/40 hover:bg-primary/5 active:scale-90 transition-all duration-200"
        >
          <Plus className="w-5 h-5 text-primary" />
        </button>
      </div>
    </div>
  );

  const renderHoursVariant = (field: any) => {
    // Convertir el valor del campo (HH:mm:ss) a minutos totales
    const totalMinutes =
      typeof field.value === "string"
        ? timeStringToMinutes(field.value)
        : field.value;

    const hours = Math.floor(totalMinutes / 60);
    const minutes = totalMinutes % 60;

    const updateTime = (newHours: number, newMinutes: number) => {
      if (newHours < 0) newHours = 0;
      if (newHours > 23) newHours = 23;
      if (newMinutes < 0) newMinutes = 0;
      if (newMinutes > 59) newMinutes = 59;

      const totalMinutes = newHours * 60 + newMinutes;
      // Convertir a formato HH:mm:ss antes de guardar
      const timeString = minutesToTimeString(totalMinutes);
      field.onChange(timeString);
    };

    return (
      <div className="flex flex-col items-center gap-6">
        {label && (
          <p className="text-base text-muted-foreground font-medium">{label}</p>
        )}

        {/* Horas */}
        <div className="flex flex-col items-center gap-3">
          <p className="text-sm text-primary/80 uppercase tracking-wide">
            Horas
          </p>
          <div className="flex items-center gap-4">
            <button
              type="button"
              onMouseDown={() => updateTime(hours - 1, minutes)}
              disabled={hours <= 0}
              className="p-2.5 rounded-full border-2 border-primary/20 hover:border-primary/40 hover:bg-primary/5 active:scale-90 transition-all duration-200 disabled:opacity-40"
            >
              <Minus className="w-4 h-4 text-primary" />
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
              className="text-6xl font-bold text-primary tabular-nums min-w-[80px] text-center bg-transparent outline-none"
              style={{ width: 100 }}
            />
            <button
              type="button"
              onMouseDown={() => updateTime(hours + 1, minutes)}
              disabled={hours >= 23}
              className="p-2.5 rounded-full border-2 border-primary/20 hover:border-primary/40 hover:bg-primary/5 active:scale-90 transition-all duration-200 disabled:opacity-40"
            >
              <Plus className="w-4 h-4 text-primary" />
            </button>
          </div>
        </div>

        {/* Minutos */}
        <div className="flex flex-col items-center gap-3">
          <p className="text-sm text-primary/80 uppercase tracking-wide">
            Minutos
          </p>
          <div className="flex items-center gap-4">
            <button
              type="button"
              onMouseDown={() => updateTime(hours, minutes - 1)}
              disabled={minutes <= 0}
              className="p-2.5 rounded-full border-2 border-primary/20 hover:border-primary/40 hover:bg-primary/5 active:scale-90 transition-all duration-200 disabled:opacity-40"
            >
              <Minus className="w-4 h-4 text-primary" />
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
              className="text-6xl font-bold text-primary tabular-nums min-w-[80px] text-center bg-transparent outline-none"
              style={{ width: 100 }}
            />
            <button
              type="button"
              onMouseDown={() => updateTime(hours, minutes + 1)}
              disabled={minutes >= 59}
              className="p-2.5 rounded-full border-2 border-primary/20 hover:border-primary/40 hover:bg-primary/5 active:scale-90 transition-all duration-200 disabled:opacity-40"
            >
              <Plus className="w-4 h-4 text-primary" />
            </button>
          </div>
        </div>
      </div>
    );
  };

  const renderParticipantsVariant = (field: any) => (
    <div className="flex flex-col items-center gap-4">
      {label && (
        <p className="text-base text-primary/80  font-medium">{label}</p>
      )}
      <div className="flex items-center gap-6">
        <button
          type="button"
          onMouseDown={() => {
            const newValue = Math.max(min, field.value - step);
            field.onChange(newValue);
            startHolding(false, newValue, field.onChange);
          }}
          onMouseUp={stopHolding}
          onMouseLeave={stopHolding}
          className="p-3 rounded-full border-2 border-primary/20 hover:border-primary/40 hover:bg-primary/5 active:scale-90 transition-all duration-200"
        >
          <Minus className="w-5 h-5 text-primary" />
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
          className="text-7xl font-bold text-primary tabular-nums min-w-[80px] text-center bg-transparent outline-none"
          style={{ width: 120 }}
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
          className="p-3 rounded-full border-2 border-primary/20 hover:border-primary/40 hover:bg-primary/5 active:scale-90 transition-all duration-200"
        >
          <Plus className="w-5 h-5 text-primary" />
        </button>
      </div>
    </div>
  );

  return (
    <Controller
      name={name}
      control={control}
      defaultValue={defaultValue}
      render={({ field }) => {
        // Wrap field.onChange to call both the form onChange and the prop onChange
        const handleChange = (value: any) => {
          field.onChange(value);
          if (onChange) {
            onChange(value);
          }
        };

        // Update all the variant renders to use handleChange instead of field.onChange
        const fieldWithCustomOnChange = {
          ...field,
          onChange: handleChange,
        };

        return (
          <div className="w-full max-w-md mx-auto py-6">
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
