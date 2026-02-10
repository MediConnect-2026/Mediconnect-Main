import React, {
  useCallback,
  useContext,
  useEffect,
  useId,
  useMemo,
  useRef,
  useState,
} from "react";
import {
  motion,
  AnimatePresence,
  MotionConfig,
  type Transition,
  type Variant,
} from "motion/react";
import { createPortal } from "react-dom";
import { cn } from "@/lib/utils";
import { XIcon, ArrowLeft } from "lucide-react";
import { useTranslation } from "react-i18next";
import { Slot } from "@radix-ui/react-slot"; // <-- Agrega esta línea

const dialogStack: string[] = [];

function addToStack(id: string) {
  if (!dialogStack.includes(id)) {
    dialogStack.push(id);
  }
}

function removeFromStack(id: string) {
  const index = dialogStack.indexOf(id);
  if (index > -1) {
    dialogStack.splice(index, 1);
  }
}

function isTopDialog(id: string) {
  return dialogStack[dialogStack.length - 1] === id;
}

function getStackIndex(id: string) {
  return dialogStack.indexOf(id);
}

export type MorphingDialogContextType = {
  isOpen: boolean;
  setIsOpen: React.Dispatch<React.SetStateAction<boolean>>;
  uniqueId: string;
  triggerRef: React.RefObject<HTMLButtonElement | null>;
};

const MorphingDialogContext =
  React.createContext<MorphingDialogContextType | null>(null);

function useMorphingDialog() {
  const context = useContext(MorphingDialogContext);
  if (!context) {
    throw new Error(
      "useMorphingDialog must be used within a MorphingDialogProvider",
    );
  }
  return context;
}

export type MorphingDialogProviderProps = {
  children: React.ReactNode;
  transition?: Transition;
  onOpenChange?: (isOpen: boolean) => void;
  open?: boolean; // <-- NUEVO
};

function MorphingDialogProvider({
  children,
  transition,
  onOpenChange,
  open: controlledOpen, // <-- NUEVO
}: MorphingDialogProviderProps) {
  const [internalIsOpen, setInternalIsOpen] = useState(false);
  const uniqueId = useId();
  const triggerRef = useRef<HTMLButtonElement>(null!);

  // Determinar si es controlado o no
  const isControlled = controlledOpen !== undefined;
  const isOpen = isControlled ? controlledOpen : internalIsOpen;

  // Wrapper que notifica cambios
  const handleSetIsOpen = useCallback(
    (value: boolean | ((prev: boolean) => boolean)) => {
      const newValue = typeof value === "function" ? value(isOpen) : value;

      if (!isControlled) {
        setInternalIsOpen(newValue);
      }

      onOpenChange?.(newValue);
    },
    [onOpenChange, isControlled, isOpen],
  );

  const contextValue = useMemo(
    () => ({
      isOpen,
      setIsOpen: handleSetIsOpen,
      uniqueId,
      triggerRef,
    }),
    [isOpen, handleSetIsOpen, uniqueId],
  );

  return (
    <MorphingDialogContext.Provider value={contextValue}>
      <MotionConfig transition={transition}>{children}</MotionConfig>
    </MorphingDialogContext.Provider>
  );
}

export type MorphingDialogProps = {
  children: React.ReactNode;
  transition?: Transition;
  onOpenChange?: (isOpen: boolean) => void;
  open?: boolean; // <-- NUEVO
};

function MorphingDialog({
  children,
  transition,
  onOpenChange,
  open, // <-- NUEVO
}: MorphingDialogProps) {
  return (
    <MorphingDialogProvider
      transition={transition}
      onOpenChange={onOpenChange}
      open={open} // <-- PASAR A PROVIDER
    >
      <MotionConfig transition={transition}>{children}</MotionConfig>
    </MorphingDialogProvider>
  );
}

export type MorphingDialogTriggerProps = {
  children: React.ReactNode;
  className?: string;
  style?: React.CSSProperties;
  triggerRef?: React.RefObject<HTMLButtonElement>;
  asChild?: boolean; // <-- NUEVO
};

function MorphingDialogTrigger({
  children,
  className,
  style,
  triggerRef,
  asChild = false, // <-- NUEVO
}: MorphingDialogTriggerProps) {
  const { setIsOpen, isOpen, uniqueId } = useMorphingDialog();
  const internalRef = useRef<HTMLButtonElement>(null);
  const mergedRef = triggerRef || internalRef;

  const handleClick = useCallback(
    (e: React.MouseEvent) => {
      e.stopPropagation();
      setIsOpen(!isOpen);
    },
    [isOpen, setIsOpen],
  );

  const handleKeyDown = useCallback(
    (event: React.KeyboardEvent) => {
      if (event.key === "Enter" || event.key === " ") {
        event.preventDefault();
        event.stopPropagation();
        setIsOpen(!isOpen);
      }
    },
    [isOpen, setIsOpen],
  );

  const Component = asChild ? Slot : motion.button;

  const commonProps = {
    ref: mergedRef,
    onClick: handleClick,
    onKeyDown: handleKeyDown,
    className: cn("relative cursor-pointer", className),
    style,
    "aria-haspopup": "dialog" as const,
    "aria-expanded": isOpen,
    "aria-controls": `motion-ui-morphing-dialog-content-${uniqueId}`,
    "aria-label": `Open dialog ${uniqueId}`,
  };

  if (asChild) {
    return <Component {...commonProps}>{children}</Component>;
  }

  return (
    <motion.button {...commonProps} layoutId={`dialog-${uniqueId}`}>
      <motion.div
        initial={{ opacity: 1 }}
        animate={{ opacity: isOpen ? 0 : 1 }}
        transition={{ duration: 0.1 }}
      >
        {children}
      </motion.div>
    </motion.button>
  );
}

export type MorphingDialogContentProps = {
  children: React.ReactNode;
  className?: string;
  style?: React.CSSProperties;
};

function MorphingDialogContent({
  children,
  className,
  style,
}: MorphingDialogContentProps) {
  const { setIsOpen, isOpen, uniqueId, triggerRef } = useMorphingDialog();
  const containerRef = useRef<HTMLDivElement>(null!);
  const [firstFocusableElement, setFirstFocusableElement] =
    useState<HTMLElement | null>(null);
  const [lastFocusableElement, setLastFocusableElement] =
    useState<HTMLElement | null>(null);

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape" && isTopDialog(uniqueId)) {
        setIsOpen(false);
      }
      if (event.key === "Tab") {
        if (!firstFocusableElement || !lastFocusableElement) return;

        if (event.shiftKey) {
          if (document.activeElement === firstFocusableElement) {
            event.preventDefault();
            lastFocusableElement.focus();
          }
        } else {
          if (document.activeElement === lastFocusableElement) {
            event.preventDefault();
            firstFocusableElement.focus();
          }
        }
      }
    };

    document.addEventListener("keydown", handleKeyDown);

    return () => {
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [setIsOpen, firstFocusableElement, lastFocusableElement, uniqueId]);

  useEffect(() => {
    if (isOpen) {
      document.body.classList.add("overflow-hidden");
      const focusableElements = containerRef.current?.querySelectorAll(
        'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])',
      );
      if (focusableElements && focusableElements.length > 0) {
        setFirstFocusableElement(focusableElements[0] as HTMLElement);
        setLastFocusableElement(
          focusableElements[focusableElements.length - 1] as HTMLElement,
        );
        (focusableElements[0] as HTMLElement).focus();
      }
    } else {
      if (dialogStack.length === 0) {
        document.body.classList.remove("overflow-hidden");
      }
      triggerRef.current?.focus();
    }
  }, [isOpen, triggerRef]);

  const handleContentClick = useCallback((e: React.MouseEvent) => {
    e.stopPropagation();
  }, []);

  return (
    <motion.div
      ref={containerRef}
      layoutId={`dialog-${uniqueId}`}
      className={cn("overflow-hidden", className)}
      style={style}
      role="dialog"
      aria-modal="true"
      aria-labelledby={`motion-ui-morphing-dialog-title-${uniqueId}`}
      aria-describedby={`motion-ui-morphing-dialog-description-${uniqueId}`}
      onClick={handleContentClick}
      // Fade in suave del contenido del modal
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.3, delay: 0.15, ease: "easeOut" }}
    >
      {children}
    </motion.div>
  );
}

export type MorphingDialogContainerProps = {
  children: React.ReactNode;
  className?: string;
  style?: React.CSSProperties;
};

function MorphingDialogContainer({ children }: MorphingDialogContainerProps) {
  const { isOpen, uniqueId, setIsOpen } = useMorphingDialog();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    return () => setMounted(false);
  }, []);

  useEffect(() => {
    if (isOpen) {
      addToStack(uniqueId);
    } else {
      removeFromStack(uniqueId);
    }
    return () => {
      removeFromStack(uniqueId);
    };
  }, [isOpen, uniqueId]);

  const handleBackdropClick = useCallback(
    (e: React.MouseEvent) => {
      if (e.target === e.currentTarget && isTopDialog(uniqueId)) {
        setIsOpen(false);
      }
    },
    [setIsOpen, uniqueId],
  );

  if (!mounted) return null;

  const zIndex = 50 + getStackIndex(uniqueId) * 10;

  return createPortal(
    <AnimatePresence initial={false} mode="sync">
      {isOpen && (
        <>
          <motion.div
            key={`backdrop-${uniqueId}`}
            className="fixed inset-0 h-full w-full bg-black/10 backdrop-blur-sm dark:bg-black/40"
            style={{ zIndex: zIndex - 1 }}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={handleBackdropClick}
          />
          <div
            className="fixed inset-0 flex items-center justify-center pointer-events-none"
            style={{ zIndex }}
          >
            <div className="pointer-events-auto">{children}</div>
          </div>
        </>
      )}
    </AnimatePresence>,
    document.body,
  );
}

export type MorphingDialogTitleProps = {
  children: React.ReactNode;
  className?: string;
  style?: React.CSSProperties;
};

function MorphingDialogTitle({
  children,
  className,
  style,
}: MorphingDialogTitleProps) {
  const { uniqueId } = useMorphingDialog();

  return (
    <motion.div
      layoutId={`dialog-title-container-${uniqueId}`}
      className={className}
      style={style}
      layout
      // Animación suave de entrada
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.95 }}
      transition={{ duration: 0.35, delay: 0.2, ease: "easeOut" }}
    >
      {children}
    </motion.div>
  );
}

export type MorphingDialogSubtitleProps = {
  children: React.ReactNode;
  className?: string;
  style?: React.CSSProperties;
};

function MorphingDialogSubtitle({
  children,
  className,
  style,
}: MorphingDialogSubtitleProps) {
  const { uniqueId } = useMorphingDialog();

  return (
    <motion.div
      layoutId={`dialog-subtitle-container-${uniqueId}`}
      className={className}
      style={style}
      // Fade in del subtitle
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.35, delay: 0.25, ease: "easeOut" }}
    >
      {children}
    </motion.div>
  );
}

export type MorphingDialogDescriptionProps = {
  children: React.ReactNode;
  className?: string;
  disableLayoutAnimation?: boolean;
  variants?: {
    initial: Variant;
    animate: Variant;
    exit: Variant;
  };
};

function MorphingDialogDescription({
  children,
  className,
  variants,
  disableLayoutAnimation,
}: MorphingDialogDescriptionProps) {
  const { uniqueId } = useMorphingDialog();

  // Variantes por defecto mejoradas
  const defaultVariants = {
    initial: { opacity: 0, y: 15 },
    animate: { opacity: 1, y: 0 },
    exit: { opacity: 0, y: 15 },
  };

  return (
    <motion.div
      key={`dialog-description-${uniqueId}`}
      layoutId={
        disableLayoutAnimation
          ? undefined
          : `dialog-description-content-${uniqueId}`
      }
      variants={variants || defaultVariants}
      className={className}
      initial="initial"
      animate="animate"
      exit="exit"
      transition={{ duration: 0.4, delay: 0.3, ease: "easeOut" }}
      id={`dialog-description-${uniqueId}`}
    >
      {children}
    </motion.div>
  );
}

export type MorphingDialogImageProps = {
  src: string;
  alt: string;
  className?: string;
  style?: React.CSSProperties;
};

function MorphingDialogImage({
  src,
  alt,
  className,
  style,
}: MorphingDialogImageProps) {
  const { uniqueId } = useMorphingDialog();

  return (
    <motion.img
      src={src}
      alt={alt}
      className={cn(className)}
      layoutId={`dialog-img-${uniqueId}`}
      style={style}
      // Animación suave de la imagen
      initial={{ opacity: 0, scale: 0.97 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.97 }}
      transition={{
        duration: 0.4,
        delay: 0.1,
        ease: [0.34, 1.56, 0.64, 1], // Curva de easing suave con bounce sutil
      }}
    />
  );
}

export type MorphingDialogCloseProps = {
  children?: React.ReactNode;
  className?: string;
  variants?: {
    initial: Variant;
    animate: Variant;
    exit: Variant;
  };
  typeclose?: "Arrow" | "X";
};

function MorphingDialogClose({
  children,
  className,
  variants,
  typeclose,
}: MorphingDialogCloseProps) {
  const { setIsOpen, uniqueId } = useMorphingDialog();
  const { t } = useTranslation("auth");

  const handleClose = useCallback(
    (e: React.MouseEvent) => {
      e.stopPropagation();
      setIsOpen(false);
    },
    [setIsOpen],
  );

  // Variantes por defecto mejoradas para el botón de cierre
  const defaultVariants = {
    initial: { opacity: 0, scale: 0.85 },
    animate: { opacity: 1, scale: 1 },
    exit: { opacity: 0, scale: 0.85 },
  };

  const backButtonContent = (
    <div className="group flex items-center gap-2 text-primary transition-all duration-150 hover:opacity-80 active:scale-95 cursor-pointer">
      <ArrowLeft className="text-primary transition-transform duration-200 group-hover:-translate-x-1 group-hover:scale-110" />
      <span className="font-medium text-lg">{t("header.back")}</span>
    </div>
  );

  return (
    <motion.button
      onClick={handleClose}
      type="button"
      aria-label="Close dialog"
      key={`dialog-close-${uniqueId}`}
      className={cn(className)}
      initial="initial"
      animate="animate"
      exit="exit"
      variants={variants || defaultVariants}
      transition={{ duration: 0.3, delay: 0.25, ease: "easeOut" }}
    >
      {children ||
        (typeclose === "Arrow" ? backButtonContent : <XIcon size={24} />)}
    </motion.button>
  );
}

export {
  MorphingDialog,
  MorphingDialogTrigger,
  MorphingDialogContainer,
  MorphingDialogContent,
  MorphingDialogClose,
  MorphingDialogTitle,
  MorphingDialogSubtitle,
  MorphingDialogDescription,
  MorphingDialogImage,
};
