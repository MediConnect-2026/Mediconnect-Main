import React from "react";
import { Popover, PopoverTrigger, PopoverContent } from "@/shared/ui/popover";
import { SlidersHorizontal, X } from "lucide-react";
import { Button } from "@/shared/ui/button";

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
  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button variant="outline" className="gap-2 relative">
          <SlidersHorizontal className="w-4 h-4" />
          Filtros
          {activeFiltersCount > 0 && (
            <span className="ml-1 h-5 w-5 flex items-center justify-center text-xs bg-primary text-primary-foreground rounded-full">
              {activeFiltersCount}
            </span>
          )}
        </Button>
      </PopoverTrigger>
      <PopoverContent
        className="max-w-[600px] w-fit p-5 bg-background shadow-lg z-50 border border-primary/10 rounded-2xl"
        align="end"
        side="bottom"
        sideOffset={8}
      >
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h4 className="font-semibold text-foreground">
              Filtros de Búsqueda
            </h4>
            {activeFiltersCount > 0 && (
              <Button
                variant="ghost"
                size="sm"
                onClick={onClearFilters}
                className="text-xs text-muted-foreground hover:text-foreground"
              >
                <X className="w-3 h-3 mr-1" />
                Limpiar todos
              </Button>
            )}
          </div>
          <div>{children}</div>
        </div>
      </PopoverContent>
    </Popover>
  );
}
