import { Input } from "@/shared/ui/input";
import { useFormContext } from "react-hook-form";
import { EyeIcon } from "@/shared/ui/eye";
import { EyeOffIcon } from "@/shared/ui/eye-off";
import { Button } from "@/shared/ui/button";
import { cn } from "@/lib/utils";
import { useState, useEffect } from "react";
import { useTranslation } from "react-i18next";
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
  variant?: "edit" | "default" | "cedula" | "exequatur";
  standalone?: boolean;
  // Nueva prop para icono
  icon?: React.ReactNode;
  // Nueva prop para establecer fecha máxima (útil para fechas de nacimiento)
  maxDate?: string;
}

function formatCedula(value: string) {
  // Solo números, máximo 11 dígitos
  const digits = value.replace(/\D/g, "").slice(0, 11);
  // Formato visual: 000-0000000-0
  if (digits.length <= 3) return digits;
  if (digits.length <= 10) return `${digits.slice(0, 3)}-${digits.slice(3)}`;
  return `${digits.slice(0, 3)}-${digits.slice(3, 10)}-${digits.slice(10)}`;
}

function formatExequatur(value: string) {
  // Solo números, máximo 5 dígitos
  const digits = value.replace(/\D/g, "").slice(0, 5);
  // Formato visual: xxx-xx
  if (digits.length <= 3) return digits;
  return `${digits.slice(0, 3)}-${digits.slice(3)}`;
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
}: MCInputProps) {
  const formContext = standalone ? null : useFormContext();

  const { t } = useTranslation("common");
  const [passwordVisibility, setPasswordVisibility] = useState(false);

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
    return "";
  };

  // Detectar si es campo de cédula o exequatur
  const isCedulaVariant = variant === "cedula";
  const isExequaturVariant = variant === "exequatur";

  // Estado local solo para mostrar la cédula formateada
  const [cedulaValue, setCedulaValue] = useState(value || "");
  // Estado local para mostrar el exequatur formateado
  const [exequaturValue, setExequaturValue] = useState(value || "");

  // Sincronizar el estado local con el valor del formulario
  useEffect(() => {
    if (isCedulaVariant && !standalone && formContext) {
      const currentValue = formContext.watch(name);
      if (currentValue && currentValue !== cedulaValue.replace(/\D/g, "")) {
        setCedulaValue(formatCedula(currentValue));
      }
    }
  }, [formContext?.watch(name), isCedulaVariant, standalone]);

  useEffect(() => {
    if (isExequaturVariant && !standalone && formContext) {
      const currentValue = formContext.watch(name);
      if (currentValue && currentValue !== exequaturValue.replace(/\D/g, "")) {
        setExequaturValue(formatExequatur(currentValue));
      }
    }
  }, [formContext?.watch(name), isExequaturVariant, standalone]);

  const handleCedulaChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const formatted = formatCedula(e.target.value);
    setCedulaValue(formatted);
    // Enviar solo los números al formulario
    const onlyDigits = formatted.replace(/\D/g, "");
    
    if (standalone) {
      onChange?.({ ...e, target: { ...e.target, value: onlyDigits } });
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

  // Props del input dependiendo del modo y variante
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
      : standalone
        ? {
            value: value || "",
            onChange: onChange,
          }
        : (() => {
            if (!formContext) return {};
            const field = formContext.register(name);
            return {
              ...field,
              onChange: (e: React.ChangeEvent<HTMLInputElement>) => {
                field.onChange(e);
                onChange?.(e);
              },
            };
          })();

  // Obtener errores solo si está en un form
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

  return (
    <div className="w-full flex flex-col mb-4 px-0">
      {/* Label and Password Toggle */}
      {label && (
        <div className="flex flex-row justify-between items-center mb-2 gap-2">
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
              className="rounded-2xl text-secondary/75 dark:text-accent/75 hover:bg-secondary/10 dark:accent-accent/10 dark:hover:text-accent hover:text-secondary px-2 py-1 active:bg-secondary/20 active:text-secondary dark:active:text-accent"
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
          type={type === "password" && passwordVisibility ? "text" : type}
          required={required}
          disabled={disabled}
          {...inputProps}
          {...getDateAttributes()}
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

      {/* Form Errors (solo si NO es standalone) */}
      {error && (
        <span className="text-red-500 text-sm mt-1">
          {String(error?.message)}
        </span>
      )}
    </div>
  );
}

export default MCInput;
