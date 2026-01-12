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
  triggerClassName?: string;
  title?: string;
  size?: "sm" | "md" | "lg" | "xl" | "2xl";
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
}

export function MCModalBase({
  trigger,
  isOpen,
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

  // Sistema de tamaños con jerarquía clara y precisa
  const sizeClasses = {
    sm: isMobile
      ? "w-full max-w-[95vw] mx-2 max-h-[70vh]"
      : "max-w-md max-h-[60vh] w-full",
    md: isMobile ? "w-[95vw] h-[70vh]" : "w-[512px] h-[600px]",
    lg: isMobile ? "w-[95vw] h-[80vh]" : "w-[672px] h-[700px]",
    xl: isMobile ? "w-[98vw] h-[85vh]" : "w-[896px] h-[800px]",
    "2xl": isMobile ? "w-[100vw] h-[90vh]" : "w-[1152px] h-[900px]",
  };

  // Espaciado adaptativo para móvil
  const paddingClasses = isMobile ? "p-3" : "p-4";
  const headerPadding = isMobile ? "px-4 pt-4 pb-3" : "px-6 pt-4 pb-3";
  const contentPadding = isMobile ? "px-4 py-2" : "px-6 py-2";
  const footerPadding = isMobile ? "px-4 pb-4 pt-3" : "px-6 pb-4 pt-3";

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
      {trigger && (
        <MorphingDialogTrigger className={triggerClassName}>
          {trigger}
        </MorphingDialogTrigger>
      )}
      <MorphingDialogContainer className={paddingClasses}>
        <MorphingDialogContent
          className={`bg-white rounded-3xl shadow-lg ${sizeClasses[size]} ${className} flex flex-col overflow-hidden`}
        >
          {/* Header */}
          {(title || typeclose) && (
            <div
              className={`flex justify-between items-center ${headerPadding} flex-shrink-0
      ${typeclose === "Arrow" ? "bg-accent text-primary rounded-t-3xl" : ""}
      ${borderHeader ? "border-b border-gray-100" : ""}
    `}
            >
              {title && (
                <MorphingDialogTitle>
                  <h2
                    className={`font-semibold text-primary ${
                      isMobile ? "text-lg" : "text-xl"
                    }`}
                  >
                    {title}
                  </h2>
                </MorphingDialogTitle>
              )}
              {typeclose === "Arrow" ? (
                <MorphingDialogClose
                  typeclose="Arrow"
                  className="text-primary flex-shrink-0"
                />
              ) : (
                <MorphingDialogClose
                  typeclose={typeclose}
                  className="text-primary flex-shrink-0"
                />
              )}
            </div>
          )}

          {/* Content */}
          <MorphingDialogDescription
            className={`${contentPadding} flex-1 overflow-y-auto min-h-0 scrollbar-hide`}
          >
            {children}
          </MorphingDialogDescription>

          {/* Footer */}
          {variant === "warning" && (
            <div
              className={`flex gap-2 justify-end ${footerPadding} flex-shrink-0 ${
                borderFooter ? "border-t border-gray-100" : ""
              } ${isMobile ? "flex-col-reverse" : ""}`}
            >
              <MorphingDialogClose>
                <MCButton
                  variant="secondary"
                  size={isMobile ? "l" : "m"}
                  onClick={onSecondary}
                  className={isMobile ? "w-full" : ""}
                >
                  {secondaryText}
                </MCButton>
              </MorphingDialogClose>
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
            <div
              className={`flex justify-end ${footerPadding} flex-shrink-0 ${
                borderFooter ? "border-t border-gray-100" : ""
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

          {variant === "decide" && (
            <div
              className={`flex gap-2 justify-end ${footerPadding} flex-shrink-0 ${
                borderFooter ? "border-t border-gray-100" : ""
              } ${isMobile ? "flex-col-reverse" : ""}`}
            >
              <MorphingDialogClose>
                <MCButton
                  variant="secondary"
                  size={isMobile ? "l" : "m"}
                  onClick={onSecondary}
                  className={isMobile ? "w-full" : ""}
                >
                  {secondaryText}
                </MCButton>
              </MorphingDialogClose>
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
