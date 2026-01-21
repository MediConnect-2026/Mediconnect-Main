import React from "react";
import { Popover, PopoverTrigger, PopoverContent } from "@/shared/ui/popover";
import { SlidersHorizontal, X } from "lucide-react";
import { Button } from "@/shared/ui/button";
import { useIsMobile } from "@/lib/hooks/useIsMobile";
import { cn } from "@/lib/utils";

type MCFilterPopoverProps = {
  children: React.ReactNode;
  activeFiltersCount: number;
  onClearFilters: () => void;
};

export function MCFilterPopover({
  children,
  activeFiltersCount,
  onClearFilters,
}: MCFilterPopoverProps) {
  const [open, setOpen] = React.useState(false);
  const isMobile = useIsMobile();

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          className={cn(
            "flex items-center justify-center gap-1.5 sm:gap-2 text-primary font-medium transition-all duration-200",
            "px-3 py-2 sm:px-4 sm:py-2.5 md:px-5 md:py-3 lg:px-5 lg:py-3",
            "text-sm sm:text-base",
            "rounded-full sm:rounded-4xl",
            "border-primary/20 bg-bg-btn-secondary hover:bg-bg-btn-secondary/80",
            "w-full sm:w-auto",
            open
              ? "ring-2 ring-accent/70 border-secondary"
              : "opacity-100 hover:border-primary/30",
          )}
          aria-label="Abrir filtros"
        >
          <SlidersHorizontal className="w-4 h-4 sm:w-4.5 sm:h-4.5 flex-shrink-0" />
          {!isMobile && <span>Filtros</span>}
          {activeFiltersCount > 0 && (
            <span className="ml-0.5 sm:ml-1 px-1.5 sm:px-2 py-0.5 rounded-full bg-primary text-primary-foreground text-xs font-medium min-w-[20px] text-center">
              {activeFiltersCount}
            </span>
          )}
        </Button>
      </PopoverTrigger>
      <PopoverContent
        className={cn(
          "p-4 sm:p-5 bg-bg-secondary shadow-lg z-50 border border-primary/20 rounded-xl sm:rounded-2xl",
          "w-[calc(100vw-2rem)] sm:w-auto",
          "min-w-0 sm:min-w-[400px] md:min-w-[500px] lg:min-w-[600px]",
          "max-w-[calc(100vw-2rem)] sm:max-w-none",
          "max-h-[calc(100vh-8rem)] overflow-y-auto",
        )}
        align={isMobile ? "center" : "end"}
        side="bottom"
        sideOffset={8}
        avoidCollisions={true}
      >
        <div className="space-y-3 sm:space-y-4">
          {/* Header */}
          <div className="flex items-center justify-between pb-2 sm:pb-0 border-b sm:border-b-0 border-border/50">
            <h4 className="font-semibold text-foreground text-base sm:text-lg">
              Filtros de Búsqueda
            </h4>
            {activeFiltersCount > 0 && (
              <Button
                variant="ghost"
                size="sm"
                aria-label="Limpiar filtros"
                onClick={onClearFilters}
                className={cn(
                  "transition-all duration-200 ease-in-out",
                  "hover:bg-primary/10 dark:hover:bg-primary/10",
                  "active:scale-95 active:bg-primary/20",
                  "focus:ring-2 focus:ring-primary/30",
                  "rounded-full",
                  "gap-1 sm:gap-1.5",
                  "text-xs sm:text-sm",
                  "px-2 sm:px-3 py-1.5 sm:py-2",
                )}
              >
                <X className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                <span className="hidden sm:inline">Limpiar</span>
              </Button>
            )}
          </div>

          {/* Filters Content */}
          <div className="w-full overflow-y-auto max-h-[60vh] sm:max-h-none">
            {children}
          </div>

          {/* Mobile Action Buttons (Optional) */}
          {isMobile && (
            <div className="flex gap-2 pt-3 border-t border-border/50">
              <Button
                variant="outline"
                className="flex-1 rounded-full text-sm"
                onClick={() => setOpen(false)}
              >
                Cancelar
              </Button>
              <Button
                className="flex-1 rounded-full text-sm"
                onClick={() => setOpen(false)}
              >
                Aplicar
              </Button>
            </div>
          )}
        </div>
      </PopoverContent>
    </Popover>
  );
}
