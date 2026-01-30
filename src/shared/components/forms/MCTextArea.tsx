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

  // Estado local para el conteo de caracteres
  const [charCount, setCharCount] = React.useState(value?.length || 0);

  const handleChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    if (charLimit && e.target.value.length > charLimit) return;
    setCharCount(e.target.value.length);
    if (onChange) onChange(e);
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
          id={name}
          placeholder={placeholder}
          required={required}
          disabled={disabled}
          rows={rows}
          autoFocus={autoFocus}
          onKeyDown={onKeyDown}
          maxLength={charLimit}
          style={{
            minHeight: `${rows * 2.5}em`, // Garantiza altura mínima basada en rows
            height: `${rows * 2.5}em`, // Fuerza la altura inicial
            ...(maxRows
              ? { maxHeight: `${maxRows * 2.5}em`, overflowY: "auto" }
              : {}),
            ...style,
          }}
          {...(() => {
            const field = register(name);
            return {
              ...field,
              onChange: (e: React.ChangeEvent<HTMLTextAreaElement>) => {
                field.onChange(e);
                handleChange(e);
              },
            };
          })()}
          className={cn(
            "w-full rounded-3xl border focus:ring-0 focus:outline-none disabled:cursor-not-allowed disabled:opacity-50 p-3 resize-none text-primary",
            handleStatusColor(),
            className,
          )}
          value={value}
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
