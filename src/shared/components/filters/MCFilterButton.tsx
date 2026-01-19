import React from "react";
import { Button } from "@/shared/ui/button";
import { X, Filter } from "lucide-react";

type MCFilterButtonProps = {
  variant?: "trigger" | "clean";
  filterActive?: boolean;
  badgeCount?: number;
  filterCleared?: boolean;
  iconPosition?: "left" | "right";
  children?: React.ReactNode;
  onClick?: () => void;
};

export function MCFilterButton({
  variant = "trigger",
  filterActive = false,
  badgeCount = 0,
  filterCleared = false,
  iconPosition = "left",
  children,
  onClick,
}: MCFilterButtonProps) {
  if (variant === "clean") {
    return (
      <Button
        variant="outline"
        className="flex items-center gap-2 border-primary text-primary"
        onClick={onClick}
        aria-label="Limpiar filtros"
      >
        <X className="w-4 h-4" />
        {children ?? "Limpiar"}
      </Button>
    );
  }

  // Trigger variant
  return (
    <Button
      variant={filterActive ? "secondary" : "ghost"}
      className={`flex items-center gap-2 text-primary ${filterActive ? "bg-primary/10" : ""}`}
      onClick={onClick}
      aria-label="Abrir filtros"
    >
      {iconPosition === "left" && <Filter className="w-4 h-4" />}
      {children ?? "Filtros"}
      {iconPosition === "right" && <Filter className="w-4 h-4" />}
      {badgeCount > 0 && !filterCleared && (
        <span className="ml-1 px-2 py-0.5 rounded-full bg-primary text-primary-foreground text-xs font-medium">
          {badgeCount}
        </span>
      )}
    </Button>
  );
}
