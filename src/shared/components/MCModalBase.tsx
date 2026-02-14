import type React from "react";
import { useEffect, useState } from "react";
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
  triggerClassName?: string;
  title?: string;
  size?:
    | "sm"
    | "smWide"
    | "md"
    | "mdAuto" // <-- Agrega esta línea
    | "lg"
    | "xl"
    | "2xl"
    | "wider"
    | "image-preview";
  className?: string;
  variant?: "warning" | "confirm" | "decide" | "info";
  onConfirm?: () => void;
  onSecondary?: () => void;
  confirmText?: string;
  secondaryText?: string;
  typeclose?: "Arrow" | "X";
  zIndex?: number;
  borderHeader?: boolean;
  borderFooter?: boolean;
  actionOne?: boolean;
  defaultOpen?: boolean;
}

export function MCModalBase({
  trigger,
  isOpen: externalIsOpen,
  onClose,
  children,
  title,
  typeclose = "X",
  triggerClassName,
  size = "md",
  className = "",
  variant = "info",
  onConfirm,
  onSecondary,
  confirmText = "Confirmar",
  secondaryText = "Cancelar",
  zIndex = 50,
  borderHeader = false,
  borderFooter = false,
  actionOne = false,
  defaultOpen = false,
}: MCModalBaseProps) {
  const isControlled = externalIsOpen !== undefined;
  const isMobile = useIsMobile();

  const [internalIsOpen, setInternalIsOpen] = useState(defaultOpen);

  const isOpen = isControlled ? externalIsOpen : internalIsOpen;

  const handleOpenChange = (open: boolean) => {
    if (!open) {
      if (isControlled) {
        onClose?.();
      } else {
        setInternalIsOpen(false);
      }
    } else {
      if (!isControlled) {
        setInternalIsOpen(true);
      }
    }
  };

  useEffect(() => {
    if (!isOpen) return;

    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        handleOpenChange(false);
      }
    };

    document.addEventListener("keydown", handleEscape);
    return () => document.removeEventListener("keydown", handleEscape);
  }, [isOpen, isControlled, onClose]);

  const sizeClasses = {
    sm: isMobile
      ? "w-full max-w-[95vw] mx-2 max-h-[70vh]"
      : "max-w-md max-h-[60vh] w-full",
    smWide: isMobile
      ? "w-full max-w-[95vw] mx-2 max-h-[70vh]"
      : "max-w-xl w-[1600px]  h-full max-h-[500px]",
    md: isMobile ? "w-[95vw] h-[70vh]" : "w-[512px] h-[600px]",
    mdAuto: isMobile ? "w-[95vw] max-h-[80vh]" : "w-[512px] max-h-[90vh]", // <-- Nuevo tamaño
    lg: isMobile ? "w-[95vw] h-[80vh]" : "w-[672px] h-[700px]",
    xl: isMobile ? "w-[98vw] h-[85vh]" : "w-[896px] h-[800px]",
    "2xl": isMobile ? "w-[100vw] h-[90vh]" : "w-[1152px] h-[900px]",
    wider: isMobile
      ? "min-w-[220px] max-w-[98vw] h-[80vh]"
      : "min-w-[320px] max-w-[1200px] h-[95vh]",
    "image-preview": isMobile
      ? "w-auto max-w-[98vw] h-auto max-h-[90vh] p-0"
      : "w-auto max-w-[800px] h-auto max-h-[90vh] p-0",
  };

  const paddingClasses = isMobile ? "p-3" : "p-4";
  const headerPadding = isMobile ? "px-4 pt-4 pb-3" : "px-6 pt-4 pb-3";
  const contentPadding = isMobile ? "px-4 py-2" : "px-6 py-2";
  const footerPadding = isMobile ? "px-4 pb-4 pt-3" : "px-6 pb-4 pt-3";

  const handleConfirm = () => {
    onConfirm?.();
    handleOpenChange(false);
  };

  const handleSecondary = () => {
    onSecondary?.();
    handleOpenChange(false);
  };

  return (
    <MorphingDialog
      open={isOpen}
      onOpenChange={handleOpenChange}
      transition={{
        type: "spring",
        stiffness: 200,
        damping: 24,
      }}
    >
      {trigger && (
        <MorphingDialogTrigger className={triggerClassName}>
          {trigger}
        </MorphingDialogTrigger>
      )}
      <MorphingDialogContainer className={paddingClasses}>
        <MorphingDialogContent
          className={`bg-bg-secondary rounded-3xl shadow-lg ${sizeClasses[size]} ${className} flex flex-col dark:border dark:border-primary/15`}
        >
          {/* Header */}
          {(title || typeclose) && (
            <div
              className={`flex justify-between items-center ${headerPadding} flex-shrink-0
      ${typeclose === "Arrow" ? "bg-accent text-primary rounded-t-3xl" : ""}
      ${borderHeader ? "border-b border-gray-100 dark:border-neutral-800" : ""}
    `}
            >
              {title && (
                <MorphingDialogTitle>
                  <h2
                    className={`font-semibold text-primary dark:text-primary-dark ${
                      isMobile ? "text-lg" : "text-xl"
                    }`}
                  >
                    {title}
                  </h2>
                </MorphingDialogTitle>
              )}
              <MorphingDialogClose
                typeclose={typeclose}
                className="text-primary dark:text-primary-dark flex-shrink-0"
              />
            </div>
          )}

          {/* Content con scroll vertical oculto */}
          <MorphingDialogDescription
            className={`${contentPadding} flex-1 min-h-0 text-gray-600 dark:text-gray-300 ${
              size === "wider"
                ? "overflow-x-auto overflow-y-auto scrollbar-hide"
                : "overflow-y-auto scrollbar-hide"
            }`}
          >
            {children}
          </MorphingDialogDescription>

          {/* Footer */}
          {!actionOne && variant === "warning" && (
            <div
              className={`flex gap-2 justify-end ${footerPadding} flex-shrink-0 ${
                borderFooter
                  ? "border-t border-gray-100 dark:border-neutral-800"
                  : ""
              } ${isMobile ? "flex-col-reverse" : ""}`}
            >
              <MCButton
                variant="secondary"
                size={isMobile ? "l" : "m"}
                onClick={handleSecondary}
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

          {!actionOne && variant === "confirm" && (
            <div
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
            </div>
          )}

          {!actionOne && variant === "decide" && (
            <div
              className={`flex gap-2 justify-end ${footerPadding} flex-shrink-0 ${
                borderFooter
                  ? "border-t border-gray-100 dark:border-neutral-800"
                  : ""
              } ${isMobile ? "flex-col-reverse" : ""}`}
            >
              <MCButton
                variant="secondary"
                size={isMobile ? "l" : "m"}
                onClick={handleSecondary}
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
