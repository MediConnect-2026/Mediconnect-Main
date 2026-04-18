import { Input } from "@/shared/ui/input";
import { useFormContext } from "react-hook-form";
import { EyeIcon } from "@/shared/ui/eye";
import { EyeOffIcon } from "@/shared/ui/eye-off";
import { Button } from "@/shared/ui/button";
import { cn } from "@/lib/utils";
import { useState, useRef, useEffect } from "react";
import { useTranslation } from "react-i18next";
import { formatDominicanCedula } from "@/utils/identityDocument";

interface MCInputProps {
  name: string;
  label?: string;
  type?: string;
  placeholder?: string;
  value?: string;
  onChange?: (e: React.ChangeEvent<HTMLInputElement>) => void;
  className?: string;
  required?: boolean;
  disabled?: boolean;
  showPasswordToggle?: boolean;
  size?: "small" | "medium" | "large";
  status?: "default" | "error" | "success" | "warning" | "loading";
  statusMessage?: string;
  variant?:
    | "edit"
    | "default"
    | "exequatur"
    | "cedula"
    | "time"
    | "decideHour"
    | "internal-vertical"
    | "internal-horizontal";
  standalone?: boolean;
  icon?: React.ReactNode;
  // Nueva prop para establecer fecha máxima (útil para fechas de nacimiento)
  maxDate?: string;
  internalTitle?: string;
  internalPlaceholder?: string;
  displayMode?: "placeholder" | "value";
  isPrice?: boolean;
  customDisplayValue?: string;
  maxLength?: number;
}

function formatExequatur(value: string) {
  // Solo números, máximo 5 dígitos
  const digits = value.replace(/\D/g, "").slice(0, 5);
  // Formato visual: xxx-xx
  if (digits.length <= 3) return digits;
  return `${digits.slice(0, 3)}-${digits.slice(3)}`;

}

function formatTime(value: string): string {
  const digits = value.replace(/\D/g, "");
  const limitedDigits = digits.slice(0, 6);

  if (limitedDigits.length <= 2) {
    return limitedDigits;
  } else if (limitedDigits.length <= 4) {
    return `${limitedDigits.slice(0, 2)}:${limitedDigits.slice(2)}`;
  } else {
    return `${limitedDigits.slice(0, 2)}:${limitedDigits.slice(2, 4)}:${limitedDigits.slice(4)}`;
  }
}

function MCInput({
  name,
  label,
  type = "text",
  placeholder,
  value,
  onChange,
  className,
  required = false,
  disabled = false,
  showPasswordToggle = false,
  size = "medium",
  status = "default",
  statusMessage,
  variant = "default",
  standalone = false,
  icon,
  maxDate,
  internalTitle,
  internalPlaceholder,
  displayMode = "placeholder",
  isPrice = false,
  customDisplayValue,
  maxLength,
}: MCInputProps) {
  const formContext = useFormContext();
  const { t } = useTranslation("common");
  const [passwordVisibility, setPasswordVisibility] = useState(false);
  const [cedulaValue, setCedulaValue] = useState(value || "");
  const [timeValue, setTimeValue] = useState(value || "");
  const inputRef = useRef<HTMLInputElement>(null);

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

  const handlePasswordToggle = () => {
    setPasswordVisibility(!passwordVisibility);
  };

  const getVariantClasses = () => {
    if (variant === "edit") {
      return "border-none bg-accent text-primary/80 placeholder:text-primary/60";
    }
    if (variant === "internal-vertical" || variant === "internal-horizontal") {
      return "border-none bg-transparent text-primary/80 placeholder:text-primary/60";
    }
    return "";
  };

  // Detectar si es campo de cédula o exequatur
  const isCedulaVariant = variant === "cedula";
  const isExequaturVariant = variant === "exequatur";

  // Estado local para mostrar el exequatur formateado
  const [exequaturValue, setExequaturValue] = useState(value || "");

  const handleNumberKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (["e", "E", "+", "-", "."].includes(e.key)) {
      e.preventDefault();
    }
  };

  const handleNumberInput = (e: React.FormEvent<HTMLInputElement>) => {
    const input = e.currentTarget;
    const cleanValue = input.value.replace(/[^0-9]/g, "");
    if (input.value !== cleanValue) {
      input.value = cleanValue;
      const event = new Event("input", { bubbles: true });
      input.dispatchEvent(event);
    }
  };

  const handleTimeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const formatted = formatTime(e.target.value);
    setTimeValue(formatted);

    if (standalone) {
      const syntheticEvent = {
        ...e,
        target: { ...e.target, value: formatted },
        currentTarget: { ...e.currentTarget, value: formatted },
      } as React.ChangeEvent<HTMLInputElement>;
      onChange?.(syntheticEvent);
    } else {
      formContext?.setValue(name, formatted, { shouldValidate: true });
    }
  };

  const handleDecideHourChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const rawValue = e.target.value;

    // Si el campo está vacío, enviar string vacío
    if (!rawValue || rawValue.trim() === "") {
      setTimeValue("");

      // Fix específico para Safari: forzar el reset del input
      if (inputRef.current) {
        inputRef.current.value = "";
      }

      if (!standalone && formContext) {
        formContext.setValue(name, "", { shouldValidate: true });
      }

      if (onChange) {
        const syntheticEvent = {
          ...e,
          target: { ...e.target, value: "" },
          currentTarget: { ...e.currentTarget, value: "" },
        } as React.ChangeEvent<HTMLInputElement>;
        onChange(syntheticEvent);
      }
      return;
    }

    // Normalizar al formato HH:mm:ss si solo tiene HH:mm
    const normalizedValue =
      rawValue.length === 5 && rawValue.includes(":")
        ? `${rawValue}:00`
        : rawValue;

    setTimeValue(rawValue);

    if (!standalone && formContext) {
      formContext.setValue(name, normalizedValue, { shouldValidate: true });
    }

    if (onChange) {
      const syntheticEvent = {
        ...e,
        target: { ...e.target, value: normalizedValue },
        currentTarget: { ...e.currentTarget, value: normalizedValue },
      } as React.ChangeEvent<HTMLInputElement>;
      onChange(syntheticEvent);
    }
  };

  // Effect para sincronizar el valor del input en Safari cuando timeValue cambia a vacío
  useEffect(() => {
    if (variant === "decideHour" && timeValue === "" && inputRef.current) {
      inputRef.current.value = "";
    }
  }, [timeValue, variant]);

  const isTimeVariant = variant === "time";
  const isDecideHourVariant = variant === "decideHour";
  const isInternalVariant =
    variant === "internal-vertical" || variant === "internal-horizontal";
  const isVerticalLayout = variant === "internal-vertical";
  const isHorizontalLayout = variant === "internal-horizontal";

  const watchedFieldValue = standalone ? value : formContext?.watch(name);

  useEffect(() => {
    if (!isCedulaVariant) return;

    setCedulaValue(formatDominicanCedula(String(watchedFieldValue ?? "")));
  }, [isCedulaVariant, watchedFieldValue]);

  useEffect(() => {
    if (!isExequaturVariant) return;

    setExequaturValue(formatExequatur(String(watchedFieldValue ?? "")));
  }, [isExequaturVariant, watchedFieldValue]);

  useEffect(() => {
    if (!isTimeVariant && !isDecideHourVariant) return;

    setTimeValue(String(watchedFieldValue ?? ""));
  }, [isTimeVariant, isDecideHourVariant, watchedFieldValue]);

  const handleCedulaChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const formatted = formatDominicanCedula(e.target.value);
    setCedulaValue(formatted);
    const onlyDigits = formatted.replace(/\D/g, "");
    if (standalone) {
      const syntheticEvent = {
        ...e,
        target: { ...e.target, value: onlyDigits },
        currentTarget: { ...e.currentTarget, value: onlyDigits },
      } as React.ChangeEvent<HTMLInputElement>;
      onChange?.(syntheticEvent);
    } else {
      formContext?.setValue(name, onlyDigits, { shouldValidate: true });
      // IMPORTANTE: También llamar al onChange prop si existe
      // para que el componente padre pueda actualizar su estado
      if (onChange) {
        onChange({ ...e, target: { ...e.target, value: onlyDigits } });
      }
    }
  };

  const handleExequaturChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const formatted = formatExequatur(e.target.value);
    setExequaturValue(formatted);
    // Enviar solo los números al formulario
    const onlyDigits = formatted.replace(/\D/g, "");
    
    if (standalone) {
      onChange?.({ ...e, target: { ...e.target, value: onlyDigits } });
    } else {
      formContext?.setValue(name, onlyDigits, { shouldValidate: true });
      if (onChange) {
        onChange({ ...e, target: { ...e.target, value: onlyDigits } });
      }
    }
  };

  // Props del input según el modo
  const inputProps = isCedulaVariant
    ? {
        value: cedulaValue,
        onChange: handleCedulaChange,
      }
    : isExequaturVariant
      ? {
          value: exequaturValue,
          onChange: handleExequaturChange,
        }
      : isTimeVariant
        ? {
            value: timeValue,
            onChange: handleTimeChange,
          }
        : isDecideHourVariant
        ? {
            value: timeValue,
            onChange: handleDecideHourChange,
            placeholder: "hh:mm o hh:mm am/pm",
          }
        : standalone
          ? {
              value: value || "",
              onChange: onChange,
            }
          : (() => {
              if (!formContext) return {};

              const field = formContext.register(
                name,
                type === "number" ? { valueAsNumber: true } : {},
              );
              return {
                ...field,
                onChange: (e: React.ChangeEvent<HTMLInputElement>) => {
                  field.onChange(e);
                  onChange?.(e);
                },
              };
            })();

  const error = !standalone && formContext?.formState?.errors?.[name];

  // Calcular atributos adicionales para inputs de fecha
  const getDateAttributes = () => {
    if (type !== "date") return {};
    
    const attributes: { max?: string } = {};
    
    // Si se proporciona maxDate explícitamente, usarlo
    if (maxDate) {
      attributes.max = maxDate;
    } 
    // Si es un campo de fecha de nacimiento, establecer máximo a hoy
    else if (name === "birthDate" || name === "fechaNacimiento") {
      const today = new Date().toISOString().split('T')[0];
      attributes.max = today;
    }
    
    return attributes;
  };

  const getCurrentValue = () => {
    if (isCedulaVariant) return cedulaValue;
    if (isTimeVariant) return timeValue;
    if (isDecideHourVariant && !standalone)
      return formContext?.watch(name) || "";
    if (standalone) return value || "";
    return formContext?.watch(name) || "";
  };

  const currentValue = getCurrentValue();

  const getDisplayPlaceholder = () => {
    if (displayMode === "value" && currentValue) {
      return "";
    }
    return internalPlaceholder || placeholder;
  };

  const getDisplayValue = () => {
    if (customDisplayValue !== undefined) {
      return customDisplayValue;
    }
    return currentValue;
  };

  const isInternalDisabled = isInternalVariant;

  return (
    <div className="w-full flex flex-col mb-4 px-0">
      {/* Label externo */}
      {label && !isInternalVariant && (
        <div className="flex flex-row justify-between items-center mb-1 gap-2">
          <label
            htmlFor={name}
            className="text-left text-base sm:text-lg text-primary"
          >
            {label}
            {required && <span className="text-red-500 ml-1">*</span>}
          </label>
          {(type === "password" || showPasswordToggle) && (
            <Button
              type="button"
              variant="ghost"
              className="rounded-2xl text-gray-500 px-2 py-1"
              onClick={handlePasswordToggle}
              disabled={disabled}
            >
              {passwordVisibility ? (
                <span className="flex items-center gap-1">
                  <EyeOffIcon size={18} />
                  <p className="hidden sm:inline">{t("validation.hide")}</p>
                </span>
              ) : (
                <span className="flex items-center gap-1">
                  <EyeIcon size={18} />
                  <p className="hidden sm:inline">{t("validation.show")}</p>
                </span>
              )}
            </Button>
          )}
        </div>
      )}

      {/* Input Container */}
      {isVerticalLayout ? (
        <div className="border border-primary/50 rounded-full px-4 sm:px-5 py-3 cursor-pointer">
          {internalTitle && (
            <label
              htmlFor={name}
              className="text-left text-sm sm:text-base text-primary font-medium block mb-1"
            >
              {internalTitle}
              {required && <span className="text-red-500 ml-1">*</span>}
            </label>
          )}
          <div className="relative">
            {displayMode === "value" && getDisplayValue() ? (
              <div className="w-full text-primary/60 text-right text-sm sm:text-base">
                {getDisplayValue()}
              </div>
            ) : (
              <input
                id={name}
                ref={isDecideHourVariant ? inputRef : undefined}
                placeholder={getDisplayPlaceholder()}
                type={type === "password" && passwordVisibility ? "text" : type}
                required={required}
                disabled={isInternalDisabled}
                onKeyDown={type === "number" ? handleNumberKeyDown : undefined}
                onInput={type === "number" ? handleNumberInput : undefined}
                {...inputProps}
                {...getDateAttributes()}
                className={cn(
                  "h-fit px-0 border-none w-full text-left placeholder:text-left focus:ring-0 focus:outline-none",
                  "text-primary/60 placeholder:text-primary/60 text-sm sm:text-base cursor-pointer",
                  getIconPaddingClasses(),
                  className,
                )}
                style={isPrice ? { paddingLeft: "3.5rem" } : undefined}
              />
            )}
          </div>
        </div>
      ) : isHorizontalLayout ? (
        /* LAYOUT HORIZONTAL */
        <div className="border border-primary/60 rounded-full px-4 sm:px-5 py-3 sm:py-4 cursor-pointer">
          <div className="flex flex-row items-center justify-between gap-4">
            {internalTitle && (
              <label
                htmlFor={name}
                className="text-left text-base sm:text-lg text-primary font-medium whitespace-nowrap"
              >
                {internalTitle}
                {required && <span className="text-red-500 ml-1">*</span>}
              </label>
            )}
            <div className="relative flex-1 min-w-0">
              {displayMode === "value" && getDisplayValue() ? (
                <div className="w-full text-primary/60 text-right text-sm sm:text-base">
                  {isPrice && <span className="font-semibold mr-1">RD$</span>}
                  {getDisplayValue()}
                </div>
              ) : (
                <input
                  id={name}
                  ref={isDecideHourVariant ? inputRef : undefined}
                  placeholder={getDisplayPlaceholder()}
                  type={
                    type === "password" && passwordVisibility ? "text" : type
                  }
                  required={required}
                  disabled={isInternalDisabled}
                  {...inputProps}
                  {...getDateAttributes()}
                  className={cn(
                    "h-fit w-full px-0 border-none text-right placeholder:text-right focus:ring-0 focus:outline-none cursor-pointer",
                    "text-primary/60 placeholder:text-primary/60 text-sm sm:text-base",
                    isInternalDisabled && "cursor-pointer bg-transparent",
                    getIconPaddingClasses(),
                    className,
                  )}
                  style={isPrice ? { paddingLeft: "3.5rem" } : undefined}
                />
              )}
            </div>
          </div>
        </div>
      ) : (
        /* LAYOUT NORMAL */
        <div className="relative">
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
          {isPrice && (
            <span className="absolute left-0 top-1/2 -translate-y-1/2 text-primary/60 font-semibold pl-4 select-none">
              RD$
            </span>
          )}
          <Input
            id={name}
            ref={isDecideHourVariant ? inputRef : undefined}
            placeholder={
              isDecideHourVariant ? "Ej: 17:00 o 05:00 pm" : placeholder
            }
            type={
              isDecideHourVariant
                ? "time"
                : type === "password" && passwordVisibility
                  ? "text"
                  : type
            }
            required={required}
            disabled={disabled}
            onKeyDown={type === "number" ? handleNumberKeyDown : undefined}
            onInput={type === "number" ? handleNumberInput : undefined}
            {...inputProps}
            {...getDateAttributes()}
            maxLength={maxLength}
            className={cn(
              "w-full rounded-4xl focus:ring-0 focus:outline-none disabled:cursor-not-allowed disabled:opacity-50 text-primary placeholder:text-md",
              getSizeClasses(),
              handleStatusColor(),
              getVariantClasses(),
              getIconPaddingClasses(),
              className,
            )}
            style={isPrice ? { paddingLeft: "4rem" } : undefined}
          />
        </div>
      )}

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

export default MCInput;
