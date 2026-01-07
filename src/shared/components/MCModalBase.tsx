import type React from "react";
import { useEffect } from "react";
import MCButton from "@/shared/components/forms/MCButton";
import { useIsMobile } from "@/lib/hooks/useIsMobile";
import {
  MorphingDialog,
  MorphingDialogTrigger,
  MorphingDialogContent,
  MorphingDialogTitle,
  MorphingDialogClose,
  MorphingDialogDescription,
  MorphingDialogContainer,
} from "@/shared/ui/morphing-dialog";

interface MCModalBaseProps {
  id: string;
  trigger?: React.ReactNode;
  isOpen?: boolean;
  onClose?: () => void;
  children: React.ReactNode;

  title?: string;
  size?: "small" | "medium" | "large" | "full";
  className?: string;
  variant?: "warning" | "confirm" | "decide" | "info";
  onConfirm?: () => void;
  onSecondary?: () => void;
  confirmText?: string;
  secondaryText?: string;
}

export function MCModalBase({
  trigger,
  isOpen,
  onClose,
  children,
  title,
  size = "medium",
  className = "",
  variant = "info",
  onConfirm,
  onSecondary,
  confirmText = "Confirmar",
  secondaryText = "Cancelar",
}: MCModalBaseProps) {
  const isControlled = isOpen !== undefined;
  const isMobile = useIsMobile();

  useEffect(() => {
    if (!isControlled || !isOpen) return;

    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        onClose?.();
      }
    };

    document.addEventListener("keydown", handleEscape);
    return () => document.removeEventListener("keydown", handleEscape);
  }, [isControlled, isOpen, onClose]);

  // Clases de tamaño adaptativas para móvil
  const sizeClasses = {
    small: isMobile ? "w-full max-w-[95vw] mx-2" : "max-w-md",
    medium: isMobile ? "w-full max-w-[95vw] mx-2" : "max-w-lg",
    large: isMobile ? "w-full max-w-[95vw] mx-2" : "max-w-2xl",
    full: isMobile ? "w-full max-w-[100vw] mx-0" : "max-w-full mx-4",
  };

  // Espaciado adaptativo para móvil
  const paddingClasses = isMobile ? "p-4" : "p-6";
  const headerPadding = isMobile ? "px-4 pt-4 pb-3" : "px-6 pt-6 pb-4";
  const contentPadding = isMobile ? "px-4 py-3" : "px-6 py-4";
  const footerPadding = isMobile ? "px-4 pb-4 pt-3" : "px-6 pb-6 pt-4";

  const handleConfirm = () => {
    onConfirm?.();
    onClose?.();
  };

  if (isControlled && !isOpen) return null;

  return (
    <MorphingDialog
      transition={{
        type: "spring",
        stiffness: 200,
        damping: 24,
      }}
    >
      {trigger && <MorphingDialogTrigger>{trigger}</MorphingDialogTrigger>}
      <MorphingDialogContainer className={paddingClasses}>
        <MorphingDialogContent
          className={`bg-white rounded-3xl shadow-lg ${sizeClasses[size]} ${
            isMobile ? "max-h-[90vh] overflow-y-auto" : ""
          } ${className}`}
        >
          {/* Header - Título y botón de cerrar */}
          <div className={`flex justify-between items-center ${headerPadding}`}>
            {title && (
              <MorphingDialogTitle>
                <h2
                  className={`font-semibold text-primary ${
                    isMobile ? "text-xl" : "text-xl"
                  }`}
                >
                  {title}
                </h2>
              </MorphingDialogTitle>
            )}
            <MorphingDialogClose className="text-primary flex-shrink-0" />
          </div>

          {/* Content */}
          <MorphingDialogDescription className={contentPadding}>
            {children}
          </MorphingDialogDescription>

          {/* Footer por variante */}
          {variant === "warning" && (
            <div
              className={`flex gap-2 justify-end ${footerPadding} ${
                isMobile ? "flex-col-reverse" : ""
              }`}
            >
              <MCButton
                variant="secondary"
                size={isMobile ? "l" : "m"}
                onClick={onSecondary || onClose}
                className={isMobile ? "w-full" : ""}
              >
                {secondaryText}
              </MCButton>
              <MCButton
                variant="delete"
                size={isMobile ? "l" : "m"}
                onClick={handleConfirm}
                className={isMobile ? "w-full" : ""}
              >
                {confirmText}
              </MCButton>
            </div>
          )}

          {variant === "confirm" && (
            <div className={`flex justify-end ${footerPadding}`}>
              <MCButton
                variant="primary"
                size={isMobile ? "l" : "m"}
                onClick={handleConfirm}
                className={isMobile ? "w-full" : ""}
              >
                {confirmText}
              </MCButton>
            </div>
          )}

          {variant === "decide" && (
            <div
              className={`flex gap-2 justify-end ${footerPadding} ${
                isMobile ? "flex-col-reverse" : ""
              }`}
            >
              <MCButton
                variant="secondary"
                size={isMobile ? "l" : "m"}
                onClick={onSecondary || onClose}
                className={isMobile ? "w-full" : ""}
              >
                {secondaryText}
              </MCButton>
              <MCButton
                variant="primary"
                size={isMobile ? "l" : "m"}
                onClick={handleConfirm}
                className={isMobile ? "w-full" : ""}
              >
                {confirmText}
              </MCButton>
            </div>
          )}
        </MorphingDialogContent>
      </MorphingDialogContainer>
    </MorphingDialog>
  );
}
