import { Button } from "@/shared/ui/button";
import { useIsMobile } from "@/lib/hooks/useIsMobile";

type MediButtonProps = {
  children?: React.ReactNode;
  variant?:
    | "primary"
    | "secondary"
    | "delete"
    | "success"
    | "warning"
    | "link"
    | "tercero"
    | "outline"
    | "outlineDelete";
  onClick?: () => void;
  className?: string;
  disabled?: boolean;
  type?: "button" | "submit" | "reset";
  icon?: React.ReactNode;
  iconPosition?: "left" | "right";
  size?: "xs" | "s" | "sm" | "m" | "ml" | "l" | "xl";
};

function MCButton({
  variant = "primary",
  onClick,
  disabled,
  children,
  className,
  type = "button",
  icon,
  iconPosition = "left",
  size = "l",
}: MediButtonProps) {
  const isMobile = useIsMobile();

  const baseStyles =
    "font-medium rounded-full transition-all duration-200 focus:outline-none active:scale-[0.98] flex items-center justify-center gap-2";

  // Tamaños responsive que se ajustan automáticamente
  const sizeStyles: Record<string, string> = {
    xs: "px-2 py-1 text-[10px] sm:px-2.5 sm:py-1.5 sm:text-xs",
    s: "px-3 py-2 text-xs sm:px-3.5 sm:py-2.5 sm:text-sm",
    sm: "px-4 py-2.5 text-sm sm:px-5 sm:py-3 sm:text-base",
    m: "px-5 py-3 text-sm sm:px-6 sm:py-3.5 md:px-8 md:py-4 md:text-base lg:text-lg",
    ml: "px-6 py-3.5 text-sm sm:px-7 sm:py-4 md:px-9 md:py-4.5 md:text-base lg:text-base",
    l: "px-6 py-3.5 text-base sm:px-8 sm:py-4 md:px-10 md:py-5 lg:px-12 lg:py-6 lg:text-lg",
    xl: "px-8 py-4 text-base sm:px-10 sm:py-5 md:px-12 md:py-6 lg:px-16 lg:py-8 lg:text-xl xl:text-2xl",
  };

  // Ajuste dinámico según si es mobile
  const responsiveSize =
    isMobile && (size === "l" || size === "xl") ? "m" : size;

  const variants: Record<string, string> = {
    primary: `
      bg-primary text-background border border-transparent
      hover:bg-primary/90 hover:shadow-md
      active:bg-primary/80
      disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:bg-primary
    `,
    secondary: `
      bg-transparent border border-primary text-primary
      hover:bg-primary/10 hover:border-primary/80
      active:bg-primary/20
      disabled:opacity-50 disabled:cursor-not-allowed
    `,
    delete: `
      bg-red-600 text-white border border-red-600
      hover:bg-red-700 hover:shadow-md
      active:bg-red-800
      disabled:opacity-50 disabled:cursor-not-allowed
    `,
    success: `
      bg-green-600 text-white border border-green-600
      hover:bg-green-700 hover:shadow-md
      active:bg-green-800
      disabled:opacity-50 disabled:cursor-not-allowed
    `,
    warning: `
      bg-yellow-400 text-black border border-yellow-400
      hover:bg-yellow-500 hover:shadow-md
      active:bg-yellow-600
      disabled:opacity-50 disabled:cursor-not-allowed
    `,
    link: `
      bg-transparent border-none text-primary underline underline-offset-2 px-0 py-0
      hover:text-primary/80 hover:no-underline
      active:text-primary/60
      disabled:opacity-50 disabled:cursor-not-allowed
      shadow-none
    `,
    tercero: `
      bg-[var(--color-bg-btn-secondary)] text-primary border border-[var(--color-bg-btn-secondary)]
      hover:bg-[var(--color-bg-btn-secondary)]/90 hover:shadow-md
      active:bg-[var(--color-bg-btn-secondary)]/80
      disabled:opacity-50 disabled:cursor-not-allowed
    `,
    outline: `
      bg-transparent border border-primary/30 text-primary
      hover:border-primary hover:bg-primary/5
      active:bg-primary/10
      disabled:opacity-50 disabled:cursor-not-allowed
    `,
    outlineDelete: `
      bg-transparent border border-red-600 text-red-600
      hover:bg-red-600 hover:text-white hover:shadow-md
      active:bg-red-700
      disabled:opacity-50 disabled:cursor-not-allowed
    `,
  };

  return (
    <Button
      type={type}
      onClick={onClick}
      disabled={disabled}
      className={`${baseStyles} ${sizeStyles[responsiveSize]} ${
        variants[variant] || variants.primary
      } ${className || ""}`}
      icon={icon}
      iconPosition={iconPosition}
    >
      {children}
    </Button>
  );
}

export default MCButton;
