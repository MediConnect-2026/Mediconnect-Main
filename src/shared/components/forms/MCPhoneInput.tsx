import { Input } from "@/shared/ui/input";
import { useFormContext } from "react-hook-form";
import { cn } from "@/lib/utils";
import { useState } from "react";
import { formatPhone } from "@/utils/phoneFormat";

interface MCPhoneInputProps {
  name: string;
  label?: string;
  placeholder?: string;
  value?: string;
  onChange?: (e: React.ChangeEvent<HTMLInputElement>) => void;
  className?: string;
  required?: boolean;
  disabled?: boolean;
  size?: "small" | "medium" | "large";
  status?: "default" | "error" | "success" | "warning" | "loading";
  statusMessage?: string;
  variant?: "edit" | "default";
  standalone?: boolean;
  icon?: React.ReactNode;
  // Formato específico del teléfono
  format?: "us" | "do" | "international"; // US: (XXX) XXX-XXXX, DO: XXX-XXX-XXXX
  countryCode?: string; // Ej: "+1", "+1-809"
}

function MCPhoneInput({
  name,
  label,
  placeholder = "000-000-0000",
  value,
  onChange,
  className,
  required = false,
  disabled = false,
  size = "medium",
  status = "default",
  statusMessage,
  variant = "default",
  standalone = false,
  icon,
  format = "do",
  countryCode,
}: MCPhoneInputProps) {
  const formContext = standalone ? null : useFormContext();
  const [displayValue, setDisplayValue] = useState("");

  const getUnformattedValue = (formatted: string): string => {
    return formatted.replace(/\D/g, "");
  };

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
        return "border-primary/50 focus:border-primary";
    }
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

  const getIconPaddingClasses = () => {
    if (!icon) return "";

    switch (size) {
      case "small":
        return "pl-10";
      case "large":
        return "pl-14";
      default:
        return "pl-10 sm:pl-12";
    }
  };

  const getIconSizeClasses = () => {
    switch (size) {
      case "small":
        return "w-10 h-10";
      case "large":
        return "w-16 h-16";
      default:
        return "w-12 sm:w-[60px] h-12 sm:h-[60px]";
    }
  };

  const getVariantClasses = () => {
    if (variant === "edit") {
      return "border-none bg-accent text-primary/80 placeholder:text-primary/60";
    }
    return "";
  };

  const handlePhoneChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const inputValue = e.target.value;
    const formatted = formatPhone(inputValue, {
      style: format,
      partial: true,
      preserveOriginalOnInvalid: false,
    });
    const unformatted = getUnformattedValue(formatted);

    setDisplayValue(formatted);

    // Crear un evento sintético con el valor sin formato para el form
    const syntheticEvent = {
      ...e,
      target: {
        ...e.target,
        value: unformatted,
        name: name,
      },
    } as React.ChangeEvent<HTMLInputElement>;

    if (standalone) {
      onChange?.(syntheticEvent);
    } else if (formContext) {
      const field = formContext.register(name);
      field.onChange(syntheticEvent);
      onChange?.(syntheticEvent);
    }
  };

  // Props del input
  const inputProps = standalone
    ? {
        value:
          displayValue ||
          formatPhone(value || "", {
            style: format,
            partial: true,
            preserveOriginalOnInvalid: false,
          }),
        onChange: handlePhoneChange,
      }
    : (() => {
        if (!formContext) return {};

        const field = formContext.register(name);
        return {
          ...field,
          value:
            displayValue ||
            formatPhone(formContext.watch(name) || "", {
              style: format,
              partial: true,
              preserveOriginalOnInvalid: false,
            }),
          onChange: handlePhoneChange,
        };
      })();

  const error = !standalone && formContext?.formState?.errors?.[name];

  return (
    <div className="w-full flex flex-col mb-4 px-0">
      {/* Label */}
      {label && (
        <div className="flex flex-row justify-between items-center mb-2 gap-2">
          <label
            htmlFor={name}
            className="text-left text-base sm:text-lg text-primary"
          >
            {label}
            {required && <span className="text-red-500 ml-1">*</span>}
          </label>
          {countryCode && (
            <span className="text-sm text-primary/60">{countryCode}</span>
          )}
        </div>
      )}

      {/* Input Container */}
      <div className="relative">
        {/* Icon */}
        {icon && (
          <div
            className={cn(
              "absolute left-0 top-0 flex items-center justify-center pointer-events-none text-primary/60",
              getIconSizeClasses(),
            )}
          >
            {icon}
          </div>
        )}

        <Input
          id={name}
          placeholder={placeholder}
          type="tel"
          required={required}
          disabled={disabled}
          inputMode="numeric"
          {...inputProps}
          className={cn(
            "w-full rounded-4xl focus:ring-0 focus:outline-none disabled:cursor-not-allowed disabled:opacity-50 text-primary placeholder:text-md",
            getSizeClasses(),
            handleStatusColor(),
            getVariantClasses(),
            getIconPaddingClasses(),
            className,
          )}
        />
      </div>

      {/* Status Message */}
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

      {/* Form Errors */}
      {error && (
        <span className="text-red-500 text-sm mt-1">
          {String(error?.message)}
        </span>
      )}
    </div>
  );
}

export default MCPhoneInput;
