import React, { useState, useEffect } from "react";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/shared/ui/select";
import { useFormContext } from "react-hook-form";
import { cn } from "@/lib/utils";
import { X, Search } from "lucide-react";
import { useTranslation } from "react-i18next";

type LabelPosition = "left" | "center" | "right";

interface MCSelectProps {
  name: string;
  label?: string;
  placeholder?: string;
  options: { value: string; label: string }[];
  className?: string;
  required?: boolean;
  disabled?: boolean;
  multiple?: boolean;
  size?: "small" | "medium" | "large";
  status?: "default" | "error" | "success" | "warning" | "loading";
  statusMessage?: string;
  variant?: "edit";
  searchable?: boolean;
  onChange?: (value: string | string[]) => void;
  labelPosition?: LabelPosition;
}

function MCSelect({
  name,
  label,
  placeholder,
  options,
  className,
  required = false,
  disabled = false,
  multiple = false,
  size = "medium",
  status = "default",
  statusMessage,
  variant,
  searchable = false,
  onChange,
  labelPosition = "left",
}: MCSelectProps) {
  const { t } = useTranslation("common");

  const {
    register,
    setValue,
    watch,
    formState: { errors },
  } = useFormContext();

  const [selectedValues, setSelectedValues] = useState<string[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const currentValue = watch(name);

  // Use translation for default placeholder
  const defaultPlaceholder = placeholder || t("ui.select.placeholder");

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

  const getVariantClasses = () => {
    if (variant === "edit") {
      return "border-none bg-accent text-primary/80 placeholder:text-primary/60";
    }
    return "";
  };

  const handleSelectChange = (value: string) => {
    if (multiple) {
      const newValues = selectedValues.includes(value)
        ? selectedValues.filter((v) => v !== value)
        : [...selectedValues, value];

      setSelectedValues(newValues);
      setValue(name, newValues);
      onChange?.(newValues);
    } else {
      setValue(name, value);
      onChange?.(value);
    }
    setSearchQuery(""); // Limpiar búsqueda después de seleccionar
  };

  const removeValue = (valueToRemove: string) => {
    const newValues = selectedValues.filter((v) => v !== valueToRemove);
    setSelectedValues(newValues);
    setValue(name, newValues);
    onChange?.(newValues);
  };

  const getDisplayValue = () => {
    if (multiple && selectedValues.length > 0) {
      return `${selectedValues.length} ${t("ui.select.selected")}`;
    }
    if (!multiple && currentValue) {
      const option = options.find((opt) => opt.value === currentValue);
      return option?.label || defaultPlaceholder;
    }
    return defaultPlaceholder;
  };

  // Filtrar opciones basado en la búsqueda
  const filteredOptions = searchable
    ? options.filter((option) =>
        option.label.toLowerCase().includes(searchQuery.toLowerCase()),
      )
    : options;

  return (
    <div className="w-full flex flex-col mb-4 px-0">
      {/* Label */}
      {label && (
        <div
          className={cn(
            "flex flex-row justify-between items-center mb-2 gap-2",
            labelPosition === "center"
              ? "justify-center text-center"
              : labelPosition === "right"
                ? "justify-end text-right"
                : "justify-start text-left",
          )}
        >
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
          {required && <span className="text-red-500">*</span>}
        </div>
      )}

      {/* Select Container */}
      <div className="relative">
        <input type="hidden" {...register(name)} />
        <Select
          onValueChange={handleSelectChange}
          disabled={disabled}
          value={!multiple ? currentValue : undefined}
        >
          <SelectTrigger
            className={cn(
              "w-full rounded-4xl focus:ring-0 focus:outline-none disabled:cursor-not-allowed disabled:opacity-50 text-primary",
              getSizeClasses(),
              handleStatusColor(),
              getVariantClasses(),
              "focus-visible:border-ring focus-visible:ring-accent/70 focus-visible:ring-[3px]",
              "aria-invalid:ring-destructive/20 dark:aria-invalid:ring-destructive/40 aria-invalid:border-destructive",
              className,
            )}
          >
            <SelectValue placeholder={defaultPlaceholder}>
              {getDisplayValue()}
            </SelectValue>
          </SelectTrigger>
          <SelectContent
            position="popper"
            align="end"
            className="bg-background"
          >
            {/* Search Input */}
            {searchable && (
              <div className="px-2 py-2 border-b">
                <div className="relative">
                  <Search
                    className="absolute left-3 top-1/2 transform -translate-y-1/2 text-primary/50"
                    size={16}
                  />
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder={t("ui.select.search")}
                    className="w-full pl-9 pr-3 py-2 text-sm border rounded-md focus:outline-none focus:ring-2 focus:ring-primary/20 bg-background text-primary"
                    onClick={(e) => e.stopPropagation()}
                  />
                </div>
              </div>
            )}

            <SelectGroup>
              {filteredOptions.length > 0 ? (
                filteredOptions.map((option) => (
                  <SelectItem
                    key={option.value}
                    value={option.value}
                    className={cn(
                      multiple && selectedValues.includes(option.value)
                        ? "bg-primary/10"
                        : "",
                    )}
                  >
                    <div className="flex items-center justify-between w-full">
                      <span>{option.label}</span>
                      {multiple && selectedValues.includes(option.value) && (
                        <span className="ml-2">✓</span>
                      )}
                    </div>
                  </SelectItem>
                ))
              ) : (
                <div className="px-2 py-6 text-center text-sm text-primary/50">
                  {t("ui.select.noResults")}
                </div>
              )}
            </SelectGroup>
          </SelectContent>
        </Select>
      </div>

      {/* Multiple Selection Tags */}
      {multiple && selectedValues.length > 0 && (
        <div className="flex flex-wrap gap-2 mt-2">
          {selectedValues.map((value) => {
            const option = options.find((opt) => opt.value === value);
            return (
              <span
                key={value}
                className="inline-flex items-center gap-1 px-3 py-1 bg-primary/10 text-primary rounded-full text-sm"
              >
                {option?.label}
                <button
                  type="button"
                  onClick={() => removeValue(value)}
                  className="hover:bg-primary/20 rounded-full p-0.5"
                >
                  <X size={14} />
                </button>
              </span>
            );
          })}
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

      {/* Error Message */}
      {errors[name] && (
        <span className="text-red-500 text-sm mt-1">
          {String(errors[name]?.message)}
        </span>
      )}
    </div>
  );
}

export default MCSelect;
