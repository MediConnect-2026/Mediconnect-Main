import * as React from "react";
import { useEffect, useRef } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogClose,
  DialogDescription,
} from "@/shared/ui/dialog";
import MCButton from "@/shared/components/forms/MCButton";
import { useIsMobile } from "@/lib/hooks/useIsMobile";

interface MCDialogBaseProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  title?: string;
  description?: string;
  children: React.ReactNode;
  confirmText?: string;
  secondaryText?: string;
  onConfirm?: () => void;
  onSecondary?: () => void;
  variant?: "warning" | "confirm" | "decide" | "info";
  size?: "sm" | "md" | "mdAuto" | "lg" | "xl" | "2xl" | "image-preview";
  className?: string;
  zIndex?: number;
  borderHeader?: boolean;
  borderFooter?: boolean;
}

export function MCDialogBase({
  open,
  onOpenChange,
  title,
  description,
  children,
  confirmText = "Confirmar",
  secondaryText = "Cancelar",
  onConfirm,
  onSecondary,
  variant = "info",
  size = "mdAuto",
  className = "",
  zIndex = 50,
  borderHeader = false,
  borderFooter = false,
}: MCDialogBaseProps) {
  const isMobile = useIsMobile();
  const contentRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (open && contentRef.current) {
      contentRef.current.scrollTop = 0;
    }
  }, [open]);

  useEffect(() => {
    if (!open) return;

    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        onOpenChange(false);
      }
    };

    document.addEventListener("keydown", handleEscape);
    return () => document.removeEventListener("keydown", handleEscape);
  }, [open, onOpenChange]);

  // Sistema de tamaños con jerarquía clara y precisa
  const sizeClasses = {
    sm: isMobile
      ? "w-full max-w-[95vw] mx-2 max-h-[70vh]"
      : "max-w-md max-h-[60vh] w-full",
    md: isMobile ? "w-[95vw] h-[70vh]" : "w-[512px] h-[600px]",
    mdAuto: isMobile ? "w-[95vw] max-h-[80vh]" : "w-[512px] max-h-[90vh]", // <-- Nuevo tamaño
    lg: isMobile ? "w-[95vw] h-[80vh]" : "w-[672px] h-[700px]",
    xl: isMobile ? "w-[98vw] h-[85vh]" : "w-[896px] h-[800px]",
    "2xl": isMobile ? "w-[100vw] h-[90vh]" : "w-[1152px] h-[900px]",
    "image-preview": isMobile
      ? "w-[95vw] h-[70vh] max-w-[95vw] max-h-[70vh]"
      : "w-auto max-w-[520px] h-auto max-h-[80vh]",
  };

  // Espaciado adaptativo para móvil
  const paddingClasses = isMobile ? "p-3" : "p-4";
  const headerPadding = isMobile ? "px-4 pt-4 pb-3" : "px-6 pt-4 pb-3";
  const contentPadding = isMobile ? "px-4 py-2" : "px-6 py-2";
  const footerPadding = isMobile ? "px-4 pb-4 pt-3" : "px-6 pb-4 pt-3";

  const handleConfirm = () => {
    onConfirm?.();
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        className={`bg-bg-secondary rounded-3xl border-2 border-transparent dark:border-white/15 shadow-lg
          ${sizeClasses[size]} ${className}
          flex flex-col overflow-hidden p-0
          fixed left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2
          max-w-full max-h-full
        `}
        style={{ zIndex }}
      >
        {/* Header */}
        {(title || description) && (
          <DialogHeader
            className={`flex justify-between items-start ${headerPadding} flex-shrink-0`}
          >
            <div className="flex-1">
              {title && (
                <DialogTitle>
                  <h2
                    className={`font-semibold text-primary dark:text-primary-dark ${
                      isMobile ? "text-lg" : "text-xl"
                    }`}
                  >
                    {title}
                  </h2>
                </DialogTitle>
              )}
              {description && (
                <DialogDescription className="mt-1 text-gray-600 dark:text-gray-300">
                  {description}
                </DialogDescription>
              )}
            </div>
          </DialogHeader>
        )}

        {/* Content */}
        <div
          ref={contentRef}
          className={`${contentPadding} flex-1 overflow-y-auto min-h-0 scrollbar-hide`}
        >
          {children}
        </div>

        {/* Footer */}
        {variant === "warning" && (
          <DialogFooter
            className={`flex gap-2 justify-end ${footerPadding} flex-shrink-0 ${
              borderFooter
                ? "border-t border-gray-100 dark:border-neutral-800"
                : ""
            } ${isMobile ? "flex-col-reverse" : ""}`}
          >
            <DialogClose asChild>
              <MCButton
                variant="secondary"
                size={isMobile ? "l" : "m"}
                onClick={onSecondary}
                className={isMobile ? "w-full" : ""}
              >
                {secondaryText}
              </MCButton>
            </DialogClose>
            <MCButton
              variant="delete"
              size={isMobile ? "l" : "m"}
              onClick={handleConfirm}
              className={isMobile ? "w-full" : ""}
            >
              {confirmText}
            </MCButton>
          </DialogFooter>
        )}

        {variant === "confirm" && (
          <DialogFooter
            className={`flex justify-end ${footerPadding} flex-shrink-0 ${
              borderFooter
                ? "border-t border-gray-100 dark:border-neutral-800"
                : ""
            }`}
          >
            <MCButton
              variant="primary"
              size={isMobile ? "l" : "m"}
              onClick={handleConfirm}
              className={isMobile ? "w-full" : ""}
            >
              {confirmText}
            </MCButton>
          </DialogFooter>
        )}

        {variant === "decide" && (
          <DialogFooter
            className={`flex gap-2 justify-end ${footerPadding} flex-shrink-0 ${
              borderFooter
                ? "border-t border-gray-100 dark:border-neutral-800"
                : ""
            } ${isMobile ? "flex-col-reverse" : ""}`}
          >
            <DialogClose asChild>
              <MCButton
                variant="secondary"
                size={isMobile ? "l" : "m"}
                onClick={onSecondary}
                className={isMobile ? "w-full" : ""}
              >
                {secondaryText}
              </MCButton>
            </DialogClose>
            <MCButton
              variant="primary"
              size={isMobile ? "l" : "m"}
              onClick={handleConfirm}
              className={isMobile ? "w-full" : ""}
            >
              {confirmText}
            </MCButton>
          </DialogFooter>
        )}
      </DialogContent>
    </Dialog>
  );
}
