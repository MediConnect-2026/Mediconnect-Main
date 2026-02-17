import { useFormContext, Controller } from "react-hook-form";
import { useState, useRef } from "react";
import { X } from "lucide-react";
import { useTranslation } from "react-i18next";
import { useIsMobile } from "@/lib/hooks/useIsMobile";

interface AnimatedInputProps {
  name: string;
  label?: string;
  placeholder?: string;
  maxLength?: number;
  onChange?: (value: string) => void;
  variant?: "Default" | "Description";
}

const MCAnimatedInput = ({
  name,
  placeholder,
  maxLength = 50,
  onChange,
  variant = "Default",
}: AnimatedInputProps) => {
  const { control } = useFormContext();
  const { t } = useTranslation("doctor");
  const isMobile = useIsMobile();
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const [isFocused, setIsFocused] = useState(false);

  const autoResize = (el: HTMLTextAreaElement | null) => {
    if (!el) return;
    el.style.height = "auto";
    el.style.height = el.scrollHeight + "px";
  };

  return (
    <Controller
      name={name}
      control={control}
      defaultValue=""
      render={({ field, fieldState }) => {
        const hasValue = field.value && field.value.length > 0;
        const charCount = field.value?.length || 0;

        const isDescription = variant === "Description";

        // Clases responsive
        const containerClass = isDescription
          ? `w-full ${isMobile ? "max-w-[300px] px-2" : "max-w-[400px] px-2"} mx-auto`
          : `w-full ${isMobile ? "max-w-full px-4" : "max-w-2xl px-6"} mx-auto`;

        const placeholderClass = isDescription
          ? `${isMobile ? "text-sm" : "text-base md:text-lg"} leading-tight font-medium text-muted-foreground/30 select-none text-center`
          : `${isMobile ? "text-xl" : "text-3xl md:text-[2.8rem]"} leading-tight font-medium text-muted-foreground/30 select-none text-center`;

        const textareaClass = isDescription
          ? `w-full bg-transparent text-center ${isMobile ? "text-sm" : "text-base md:text-lg"} leading-tight font-normal text-primary/90 outline-none pt-2 pb-2 resize-none overflow-hidden transition-colors duration-300`
          : `w-full bg-transparent text-center ${isMobile ? "text-xl" : "text-3xl md:text-[2.8rem]"} leading-tight font-normal text-primary/90 outline-none pt-2 ${isMobile ? "pb-2" : "pb-4"} resize-none overflow-hidden transition-colors duration-300`;

        return (
          <div className={containerClass}>
            {/* Input container */}
            <div
              className="relative"
              onClick={() => textareaRef.current?.focus()}
            >
              {/* Placeholder animation */}
              <div
                className={`absolute inset-0 flex items-start justify-center pt-2 pointer-events-none transition-all duration-500 ease-[cubic-bezier(0.23,1,0.32,1)] ${
                  hasValue || isFocused
                    ? "opacity-0 translate-y-3 scale-[0.97] blur-[2px]"
                    : "opacity-100 translate-y-0 scale-100 blur-0"
                }`}
              >
                <span className={placeholderClass}>{placeholder}</span>
              </div>

              {/* Textarea */}
              <textarea
                {...field}
                ref={(el) => {
                  field.ref(el);
                  (
                    textareaRef as React.MutableRefObject<HTMLTextAreaElement | null>
                  ).current = el;
                  autoResize(el);
                }}
                rows={1}
                maxLength={maxLength}
                onFocus={() => setIsFocused(true)}
                onBlur={() => {
                  setIsFocused(false);
                  field.onBlur();
                }}
                onChange={(e) => {
                  field.onChange(e);
                  autoResize(e.target);
                  if (onChange) onChange(e.target.value);
                }}
                className={textareaClass}
                autoComplete="off"
                style={{ caretColor: "hsl(var(--primary))" }}
              />

              {/* Dashed line - hidden when has text */}
              <div
                className={`w-full border-b-2 border-dashed transition-all duration-500 ease-[cubic-bezier(0.23,1,0.32,1)] ${
                  hasValue
                    ? "opacity-0 scale-x-0"
                    : isFocused
                      ? "border-primary/60 scale-x-100 opacity-100"
                      : "border-primary/15 scale-x-75 opacity-100"
                }`}
                style={{ transformOrigin: "center" }}
              />

              {/* Clear button - SOLO si NO es Description y NO es mobile */}
              {!isDescription && !isMobile && (
                <div
                  className={`absolute -right-14 top-9 -translate-y-1/2 transition-all duration-400 ease-[cubic-bezier(0.23,1,0.32,1)] ${
                    hasValue
                      ? "opacity-100 scale-100 rotate-0"
                      : "opacity-0 scale-0 rotate-90 pointer-events-none"
                  }`}
                >
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      field.onChange("");
                      if (onChange) onChange("");
                      if (textareaRef.current) {
                        textareaRef.current.style.height = "auto";
                      }
                      textareaRef.current?.focus();
                    }}
                    className="group p-2.5 rounded-full border border-primary/15 bg-bg-secondary text-muted-foreground shadow-sm hover:shadow-md hover:border-destructive/30 hover:text-destructive transition-all duration-300 active:scale-75"
                  >
                    <X className="w-4 h-4 transition-transform duration-300 group-hover:rotate-90" />
                  </button>
                </div>
              )}
            </div>

            {/* Error */}
            <div
              className={`text-center ${isMobile ? "mt-4" : "mt-8"} ${isMobile ? "text-xs" : "text-sm"} text-destructive transition-all duration-300 ease-out ${
                fieldState.error
                  ? "opacity-100 translate-y-0 max-h-8"
                  : "opacity-0 -translate-y-1 max-h-0 overflow-hidden"
              }`}
            >
              {fieldState.error?.message}
            </div>

            {/* Character counter */}
            <div
              className={
                isDescription
                  ? `flex justify-center ${isMobile ? "mb-4 mt-1" : "mb-6 mt-2"}`
                  : `flex justify-center ${isMobile ? "my-4" : "my-8"}`
              }
            >
              <p
                className={`${isMobile ? "text-xs" : "text-sm"} tracking-wide text-muted-foreground`}
              >
                <span
                  className={`font-semibold ${isMobile ? "text-sm" : "text-base"} tabular-nums transition-all duration-300 ${
                    charCount >= maxLength
                      ? "text-destructive"
                      : charCount > 0
                        ? "text-foreground"
                        : "text-muted-foreground"
                  }`}
                >
                  {charCount}
                </span>
                <span className="mx-1 text-muted-foreground/40">/</span>
                <span
                  className={`font-semibold ${isMobile ? "text-sm" : "text-base"}`}
                >
                  {maxLength}
                </span>{" "}
                <span className="text-muted-foreground/70">
                  {t("form.available")}
                </span>
              </p>
            </div>
          </div>
        );
      }}
    />
  );
};

export default MCAnimatedInput;
