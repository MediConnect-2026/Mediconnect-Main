import React from "react";
import { Button } from "@/shared/ui/button";
import { Plus } from "lucide-react";
import { cn } from "@/lib/utils";

interface MCNewButtonProps {
  onClick?: () => void | Promise<void>;
  loading?: boolean;
  disabled?: boolean;
  className?: string;
  text?: string;
}

function MCNewButton({
  onClick,
  loading = false,
  disabled = false,
  className,
  text = "Nuevo",
}: MCNewButtonProps) {
  const [isProcessing, setIsProcessing] = React.useState(false);

  const handleClick = async () => {
    if (!onClick || isProcessing || loading || disabled) return;

    try {
      setIsProcessing(true);
      await onClick();
    } finally {
      setIsProcessing(false);
    }
  };

  const isLoading = loading || isProcessing;
  const isDisabled = isLoading || disabled;

  return (
    <Button
      type="button"
      onClick={handleClick}
      disabled={isDisabled}
      variant="outline"
      className={cn(
        "flex w-full items-center text-primary px-4 py-3.5 text-base sm:px-8 sm:py-4 md:px-10 md:py-5 lg:px-5 lg:py-5 lg:text-md rounded-4xl border-primary/20 bg-bg-btn-secondary",
        "gap-2",
        "hover:bg-bg-btn-secondary/20 hover:text-primary",
        "active:bg-bg-btn-secondary/30 active:text-primary",
        "active:scale-95",
        "transition-colors duration-150",
        isDisabled && "opacity-50 cursor-not-allowed",
        className,
      )}
    >
      <Plus className={cn("w-4 h-4", isLoading && "animate-pulse")} />
      <span>{isLoading ? "Procesando..." : text}</span>
    </Button>
  );
}

export default MCNewButton;
