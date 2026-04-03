// @/shared/ui/spinner.tsx
import { cn } from "@/lib/utils";

function Spinner({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      role="status"
      aria-label="Cargando..."
      className={cn("medical-loader", className)}
      {...props}
    />
  );
}

export { Spinner };
