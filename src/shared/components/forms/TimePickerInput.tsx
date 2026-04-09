import { useEffect, useRef, useCallback } from "react";
import { ChevronUp, ChevronDown } from "lucide-react";
import { cn } from "@/lib/utils";

// ─────────────────────────────────────────────
// Helpers
// ─────────────────────────────────────────────

/** Parse a 24h "HH:mm" or "HH:mm:ss" string into { h12, minute, isPM } */
function parse24h(time: string): { h12: number; minute: number; isPM: boolean } {
  if (!time) return { h12: 12, minute: 0, isPM: false };
  const [hStr, mStr] = time.split(":");
  const h24 = parseInt(hStr, 10) || 0;
  const minute = parseInt(mStr, 10) || 0;
  const isPM = h24 >= 12;
  let h12 = h24 % 12;
  if (h12 === 0) h12 = 12;
  return { h12, minute, isPM };
}

/** Convert 12h parts to a 24h "HH:mm:ss" string for the backend */
function to24h(h12: number, minute: number, isPM: boolean): string {
  let h24 = h12 % 12;
  if (isPM) h24 += 12;
  return `${String(h24).padStart(2, "0")}:${String(minute).padStart(2, "0")}:00`;
}

// ─────────────────────────────────────────────
// Sub-component: a single spinner segment
// ─────────────────────────────────────────────

interface SpinnerProps {
  value: string;
  onUp: () => void;
  onDown: () => void;
  onKeyDown?: (e: React.KeyboardEvent) => void;
  disabled?: boolean;
  "aria-label"?: string;
}

function Spinner({ value, onUp, onDown, onKeyDown, disabled, "aria-label": ariaLabel }: SpinnerProps) {
  return (
    <div
      className="flex flex-col items-center select-none"
      onKeyDown={onKeyDown}
      tabIndex={disabled ? -1 : 0}
      role="spinbutton"
      aria-label={ariaLabel}
      aria-valuenow={Number(value) || undefined}
    >
      <button
        type="button"
        disabled={disabled}
        onClick={onUp}
        className={cn(
          "p-1 rounded-lg text-primary/60 transition-all duration-150",
          "hover:text-primary hover:bg-primary/10 active:scale-90 active:bg-primary/20",
          "disabled:opacity-30 disabled:cursor-not-allowed",
        )}
        tabIndex={-1}
        aria-label="Aumentar"
      >
        <ChevronUp size={18} strokeWidth={2.5} />
      </button>

      <div
        className={cn(
          "w-12 h-10 flex items-center justify-center",
          "text-xl font-semibold text-primary tabular-nums tracking-tight",
          "rounded-lg transition-colors",
          disabled && "opacity-40",
        )}
      >
        {value}
      </div>

      <button
        type="button"
        disabled={disabled}
        onClick={onDown}
        className={cn(
          "p-1 rounded-lg text-primary/60 transition-all duration-150",
          "hover:text-primary hover:bg-primary/10 active:scale-90 active:bg-primary/20",
          "disabled:opacity-30 disabled:cursor-not-allowed",
        )}
        tabIndex={-1}
        aria-label="Disminuir"
      >
        <ChevronDown size={18} strokeWidth={2.5} />
      </button>
    </div>
  );
}

// ─────────────────────────────────────────────
// Separator
// ─────────────────────────────────────────────

function Colon() {
  return (
    <span className="text-xl font-bold text-primary/40 pb-0.5 select-none self-center">:</span>
  );
}

// ─────────────────────────────────────────────
// Main component
// ─────────────────────────────────────────────

export interface TimePickerInputProps {
  /** Receives and emits **24h** "HH:mm:ss" strings */
  value?: string;
  onChange?: (value: string) => void;
  label?: string;
  disabled?: boolean;
  /** How many minutes to step per click (default: 1) */
  minuteStep?: number;
  className?: string;
}

export function TimePickerInput({
  value = "",
  onChange,
  label,
  disabled = false,
  minuteStep = 5,
  className,
}: TimePickerInputProps) {
  const emittedDefaultRef = useRef(false);
  const parsed = value ? parse24h(value) : { h12: 8, minute: 0, isPM: false };
  const { h12, minute, isPM } = parsed;

  // Populate initial value once when parent does not provide one.
  useEffect(() => {
    if (value) {
      emittedDefaultRef.current = true;
      return;
    }
    if (!emittedDefaultRef.current) {
      emittedDefaultRef.current = true;
      onChange?.(to24h(8, 0, false));
    }
  }, [value, onChange]);

  const emit = useCallback(
    (newH12: number, newMinute: number, newIsPM: boolean) => {
      onChange?.(to24h(newH12, newMinute, newIsPM));
    },
    [onChange],
  );

  // ── Hour handlers ──
  const hourUp = () => {
    let next = h12 + 1;
    let nextPM = isPM;
    if (next > 12) next = 1;
    // Crossing noon / midnight: flip AM/PM when going 11→12
    if (h12 === 11 && next === 12) nextPM = !isPM;
    emit(next, minute, nextPM);
  };

  const hourDown = () => {
    let next = h12 - 1;
    let nextPM = isPM;
    if (next < 1) next = 12;
    // Crossing noon / midnight: flip AM/PM when going 12→11
    if (h12 === 12 && next === 11) nextPM = !isPM;
    emit(next, minute, nextPM);
  };

  // ── Minute handlers ──
  const minuteUp = () => {
    const next = (minute + minuteStep) % 60;
    emit(h12, next, isPM);
  };

  const minuteDown = () => {
    const next = (minute - minuteStep + 60) % 60;
    emit(h12, next, isPM);
  };

  // ── AM/PM toggle ──
  const togglePeriod = () => {
    const next = !isPM;
    emit(h12, minute, next);
  };

  // ── Keyboard navigation ──
  const hourKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "ArrowUp") { e.preventDefault(); hourUp(); }
    if (e.key === "ArrowDown") { e.preventDefault(); hourDown(); }
  };
  const minuteKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "ArrowUp") { e.preventDefault(); minuteUp(); }
    if (e.key === "ArrowDown") { e.preventDefault(); minuteDown(); }
  };
  const periodKeyDown = (e: React.KeyboardEvent) => {
    if (["ArrowUp", "ArrowDown", " ", "Enter"].includes(e.key)) {
      e.preventDefault();
      togglePeriod();
    }
  };

  return (
    <div className={cn("flex flex-col gap-1", className)}>
      {label && (
        <label className="text-base sm:text-lg text-primary font-normal">
          {label}
        </label>
      )}

      <div
        className={cn(
          "inline-flex items-center gap-1 w-full justify-center",
          "rounded-2xl border border-primary/50 bg-transparent px-4 py-2",
          "transition-colors",
          disabled && "opacity-50 pointer-events-none",
        )}
      >
        {/* Hours */}
        <Spinner
          value={String(h12).padStart(2, "0")}
          onUp={hourUp}
          onDown={hourDown}
          onKeyDown={hourKeyDown}
          disabled={disabled}
          aria-label="Horas"
        />

        <Colon />

        {/* Minutes */}
        <Spinner
          value={String(minute).padStart(2, "0")}
          onUp={minuteUp}
          onDown={minuteDown}
          onKeyDown={minuteKeyDown}
          disabled={disabled}
          aria-label="Minutos"
        />

        {/* AM/PM toggle */}
        <div className="flex flex-col items-center ml-2 gap-1">
          <button
            type="button"
            disabled={disabled}
            onClick={togglePeriod}
            onKeyDown={periodKeyDown}
            tabIndex={disabled ? -1 : 0}
            aria-label="Cambiar AM/PM"
            className={cn(
              "p-1 rounded-lg text-primary/60 transition-all duration-150",
              "hover:text-primary hover:bg-primary/10 active:scale-90",
              "disabled:opacity-30 disabled:cursor-not-allowed",
            )}
          >
            <ChevronUp size={18} strokeWidth={2.5} />
          </button>

          <div
            className={cn(
              "w-12 h-10 flex items-center justify-center rounded-lg cursor-pointer",
              "text-sm font-bold tracking-widest transition-all duration-200 select-none",
              isPM
                ? "bg-primary text-primary-foreground shadow-sm"
                : "bg-primary/10 text-primary",
              disabled && "pointer-events-none",
            )}
            onClick={!disabled ? togglePeriod : undefined}
          >
            {isPM ? "PM" : "AM"}
          </div>

          <button
            type="button"
            disabled={disabled}
            onClick={togglePeriod}
            tabIndex={-1}
            aria-label="Cambiar AM/PM"
            className={cn(
              "p-1 rounded-lg text-primary/60 transition-all duration-150",
              "hover:text-primary hover:bg-primary/10 active:scale-90",
              "disabled:opacity-30 disabled:cursor-not-allowed",
            )}
          >
            <ChevronDown size={18} strokeWidth={2.5} />
          </button>
        </div>
      </div>
    </div>
  );
}

export default TimePickerInput;
