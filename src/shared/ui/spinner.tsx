// @/shared/ui/spinner.tsx
import { Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";

interface SpinnerProps extends React.ComponentProps<"div"> {
  fullScreen?: boolean;
  iconClassName?: string;
}

function Spinner({
  className,
  fullScreen = false,
  iconClassName,
  ...props
}: SpinnerProps) {
  return (
    <div
      role="status"
      aria-label="Cargando..."
      className={cn(
        fullScreen
          ? "fixed inset-0 z-[9999] flex items-center justify-center bg-white/60"
          : "flex items-center justify-center",
        className,
      )}
      {...props}
    >
      <Loader2
        className={cn("h-8 w-8 animate-spin text-primary", iconClassName)}
      />
    </div>
  );
}

export { Spinner };
