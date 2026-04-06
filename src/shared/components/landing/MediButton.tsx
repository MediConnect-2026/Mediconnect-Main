import { Button } from "../../ui/button";

type MediButtonProps = {
  children?: React.ReactNode;
  variant?: "primary" | "secondary" | "delete" | "success" | "warning";
  onClick?: () => void;
  className?: string;
  disabled?: boolean;
  type?: "button" | "submit" | "reset";
};

function MediButton({
  variant = "primary",
  onClick,
  disabled,
  children,
  className,
  type = "button",
}: MediButtonProps) {
  const baseStyles =
    "px-6 py-3 text-base md:px-8 md:py-6 md:text-lg font-medium rounded-full transition-all duration-300 ease-in-out transform";

  const variants: Record<string, string> = {
    primary: `
      bg-primary text-background border border-transparent
      hover:-translate-y-0.5 hover:scale-105 hover:opacity-95
      active:scale-97 active:translate-y-0 active:opacity-90
      focus:outline-none
     
      motion-safe:transition-transform
    `,
    secondary: `
      bg-transparent border border-primary text-primary
      hover:-translate-y-0.5 hover:scale-105 hover:opacity-95
      active:scale-97 active:translate-y-0 active:opacity-90
      focus:outline-none
      
      motion-safe:transition-transform
    `,
    delete: `
      bg-red-600 text-white border border-red-600
      hover:bg-red-700 hover:border-red-700
      hover:-translate-y-0.5 hover:scale-105 hover:opacity-95
      active:scale-97 active:translate-y-0 active:opacity-90
      focus:outline-none
     
      motion-safe:transition-transform
    `,
    success: `
      bg-green-600 text-white border border-green-600
      hover:bg-green-700 hover:border-green-700
      hover:-translate-y-0.5 hover:scale-105 hover:opacity-95
      active:scale-97 active:translate-y-0 active:opacity-90
      focus:outline-none
    
      motion-safe:transition-transform
    `,
    warning: `
      bg-yellow-400 text-black border border-yellow-400
      hover:bg-yellow-500 hover:border-yellow-500
      hover:-translate-y-0.5 hover:scale-105 hover:opacity-95
      active:scale-97 active:translate-y-0 active:opacity-90
      focus:outline-none
      
      motion-safe:transition-transform
    `,
  };

  return (
    <Button
      type={type}
      onClick={onClick}
      disabled={disabled}
      className={`${baseStyles} ${variants[variant] || variants.primary} ${
        className || ""
      }`}
    >
      {children}
    </Button>
  );
}

export default MediButton;
