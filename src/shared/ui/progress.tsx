import * as React from "react";
import * as ProgressPrimitive from "@radix-ui/react-progress";
import { cn } from "@/lib/utils";

interface ProgressProps
  extends React.ComponentProps<typeof ProgressPrimitive.Root> {
  value?: number;
}

function Progress({ className, value = 0, ...props }: ProgressProps) {
  // Determinar el color según el progreso
  const getProgressColor = (percentage: number) => {
    if (percentage === 0) {
      return "bg-gray-400";
    } else if (percentage < 33) {
      return "bg-red-500";
    } else if (percentage < 66) {
      return "bg-yellow-500";
    } else if (percentage < 100) {
      return "bg-blue-500";
    } else {
      return "bg-green-500";
    }
  };

  return (
    <ProgressPrimitive.Root
      data-slot="progress"
      className={cn(
        "bg-primary/20 relative h-2.5 w-full overflow-hidden rounded-full",
        className
      )}
      {...props}
    >
      <ProgressPrimitive.Indicator
        data-slot="progress-indicator"
        className={cn(
          "h-full w-full flex-1 transition-all duration-500 ease-out",
          getProgressColor(value)
        )}
        style={{ transform: `translateX(-${100 - (value || 0)}%)` }}
      />
    </ProgressPrimitive.Root>
  );
}

export { Progress };
