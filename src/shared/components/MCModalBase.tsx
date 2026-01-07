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

  const sizeClasses = {
    small: "max-w-md",
    medium: "max-w-lg",
    large: "max-w-2xl",
    full: "max-w-full mx-4",
  };

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
      <MorphingDialogContainer className="p-6">
        <MorphingDialogContent
          className={`bg-white rounded-lg shadow-lg ${sizeClasses[size]} ${className}`}
        >
          {/* Header - Título y botón de cerrar */}
          <div className="flex justify-between items-center px-6 pt-6 pb-4">
            {title && (
              <MorphingDialogTitle>
                <h2 className="text-xl font-semibold text-primary">{title}</h2>
              </MorphingDialogTitle>
            )}
            <MorphingDialogClose className="text-primary " />
          </div>

          {/* Content */}
          <MorphingDialogDescription className="px-6 py-4">
            {children}
          </MorphingDialogDescription>

          {/* Footer por variante */}
          {variant === "warning" && (
            <div className="flex gap-2 justify-end px-6 pb-6 pt-4">
              <MCButton
                variant="secondary"
                size="m"
                onClick={onSecondary || onClose}
              >
                {secondaryText}
              </MCButton>
              <MCButton variant="delete" size="m" onClick={handleConfirm}>
                {confirmText}
              </MCButton>
            </div>
          )}

          {variant === "confirm" && (
            <div className="flex justify-end px-6 pb-6 pt-4">
              <MCButton variant="primary" size="m" onClick={handleConfirm}>
                {confirmText}
              </MCButton>
            </div>
          )}

          {variant === "decide" && (
            <div className="flex gap-2 justify-end px-6 pb-6 pt-4">
              <MCButton
                variant="secondary"
                size="m"
                onClick={onSecondary || onClose}
              >
                {secondaryText}
              </MCButton>
              <MCButton variant="primary" size="m" onClick={handleConfirm}>
                {confirmText}
              </MCButton>
            </div>
          )}
        </MorphingDialogContent>
      </MorphingDialogContainer>
    </MorphingDialog>
  );
}
