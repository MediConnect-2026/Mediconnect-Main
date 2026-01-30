import React from "react";
import { ToggleGroup, ToggleGroupItem } from "@/shared/ui/toggle-group";
import { List, LayoutGrid } from "lucide-react";

interface MCToogleProps {
  value: "list" | "card";
  onChange: (value: "list" | "card") => void;
}

function MCToogle({ value, onChange }: MCToogleProps) {
  return (
    <ToggleGroup
      type="single"
      value={value}
      onValueChange={(val) => onChange(val as "list" | "card")}
      className="bg-bg-btn-secondary rounded-full border border-primary/20 py-0.5 px-2 flex gap-1"
    >
      <ToggleGroupItem
        value="list"
        aria-label="Vista de tabla"
        className={`flex items-center gap-2 text-primary rounded-full px-3 
          bg-bg-btn-secondary  text-primary/35
          data-[state=on]:bg-transparent data-[state=on]:text-primary data-[state=on]:rounded-full data-[state=on]:border-secondary
          hover:bg-bg-btn-secondary/20 hover:text-primary
          active:bg-bg-btn-secondary/30 active:text-primary active:scale-90
          transition-colors duration-150`}
      >
        <List className="h-4 w-4" />
        <span className="hidden sm:inline">Tabla</span>
      </ToggleGroupItem>
      <ToggleGroupItem
        value="card"
        aria-label="Vista de tarjetas"
        className={`flex items-center gap-2 text-primary rounded-full px-3
          bg-bg-btn-secondary text-primary/35
          data-[state=on]:bg-transparent    data-[state=on]:text-primary  data-[state=on]:rounded-full   data-[state=on]:border-secondary
          hover:bg-bg-btn-secondary/20 hover:text-primary
          active:bg-bg-btn-secondary/30 active:text-primary active:scale-90
          transition-colors duration-150`}
      >
        <LayoutGrid className="h-4 w-4" />
        <span className="hidden sm:inline">Tarjetas</span>
      </ToggleGroupItem>
    </ToggleGroup>
  );
}

export default MCToogle;
