import { useFormContext } from "react-hook-form";
import { cn } from "@/lib/utils";
import { Textarea } from "@/shared/ui/textarea";
import React from "react"; // Ensure React is imported for types

interface MCTextAreaProps {
  name: string;
  label?: string;
  placeholder?: string;
  value?: string;
  onChange?: (e: React.ChangeEvent<HTMLTextAreaElement>) => void;
  onBlur?: (e: React.FocusEvent<HTMLTextAreaElement>) => void;
  onKeyDown?: (e: React.KeyboardEvent<HTMLTextAreaElement>) => void;
  className?: string;
  required?: boolean;
  disabled?: boolean;
  rows?: number;
  status?: "default" | "error" | "success" | "warning" | "loading";
  statusMessage?: string;
  autoFocus?: boolean;
  charLimit?: number;
  showCharCount?: boolean;
  maxRows?: number;
  style?: React.CSSProperties;
}

function MCTextArea({
  name,
  label,
  placeholder,
  value,
  onChange,
  onBlur,
  onKeyDown,
  className,
  required = false,
  disabled = false,
  rows = 4,
  status = "default",
  statusMessage,
  autoFocus = false,
  charLimit,
  showCharCount = false,
  maxRows,
  style,
}: MCTextAreaProps) {
  const {
    register,
    formState: { errors },
  } = useFormContext();

  const handleStatusColor = () => {
    switch (status) {
      case "error":
        return "border-red-500 focus:border-red-500";
      case "success":
        return "border-green-500 focus:border-green-500";
      case "warning":
        return "border-yellow-500 focus:border-yellow-500";
      case "loading":
        return "border-blue-500 focus:border-blue-500";
      default:
        return "border-primary/50 focus:border-primary/50";
    }
  };

  const [charCount, setCharCount] = React.useState(value?.length ?? 0);

  // ✅ FIX: Llamar register() directamente, no dentro de un IIFE.
  // El IIFE crea un nuevo objeto en cada render, rompiendo el tracking de RHF.
  const registerProps = register(name);

  const handleChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    if (charLimit && e.target.value.length > charLimit) return;
    setCharCount(e.target.value.length);
    // ✅ FIX: Notificar a RHF primero, luego al handler externo
    registerProps.onChange(e);
    if (onChange) onChange(e);
  };

  const handleBlur = (e: React.FocusEvent<HTMLTextAreaElement>) => {
    // ✅ FIX: Mergear onBlur de RHF con el onBlur externo — antes se perdía uno u otro
    registerProps.onBlur(e);
    if (onBlur) onBlur(e);
  };

  return (
    <div className="w-full flex flex-col mb-4 px-0 sm:px-2">
      {label && (
        <label
          htmlFor={name}
          className="text-left text-base sm:text-lg text-primary mb-1"
        >
          {label}
          {required && <span className="text-red-500 ml-1">*</span>}
        </label>
      )}
      <div className="relative w-full">
        <Textarea
          {...registerProps}
          id={name}
          placeholder={placeholder}
          required={required}
          disabled={disabled}
          rows={rows}
          autoFocus={autoFocus}
          onKeyDown={onKeyDown}
          maxLength={charLimit}
          style={{
            minHeight: `${rows * 2.5}em`,
            height: `${rows * 2.5}em`,
            ...(maxRows
              ? { maxHeight: `${maxRows * 2.5}em`, overflowY: "auto" }
              : {}),
            ...style,
          }}
          onChange={handleChange}
          onBlur={handleBlur}
          // ✅ FIX: Solo pasar value si viene como prop externo — si no, RHF controla
          // el campo como uncontrolled vía ref (que es como register() funciona internamente)
          {...(value !== undefined ? { value } : {})}
          className={cn(
            "w-full rounded-3xl border focus:ring-0 focus:outline-none disabled:cursor-not-allowed disabled:opacity-50 p-3 resize-none text-primary",
            handleStatusColor(),
            className,
          )}
        />
        {showCharCount && charLimit && (
          <div
            className="absolute bottom-2 right-4 text-xs text-muted-foreground opacity-60 pointer-events-none"
            style={{ zIndex: 2 }}
          >
            {charCount} / {charLimit}
          </div>
        )}
      </div>
      {statusMessage && (
        <span
          className={cn(
            "text-sm mt-1 block",
            status === "success"
              ? "text-green-500"
              : status === "error"
                ? "text-red-500"
                : status === "warning"
                  ? "text-yellow-500"
                  : status === "loading"
                    ? "text-blue-500"
                    : "text-gray-500",
          )}
        >
          {statusMessage}
        </span>
      )}
      {errors[name] && (
        <span className="text-red-500 text-sm mt-1">
          {String(errors[name]?.message)}
        </span>
      )}
    </div>
  );
}
export default MCTextArea;
