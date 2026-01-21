import React from "react";
import { Input } from "@/shared/ui/input";
import { Search } from "lucide-react";

interface MCFilterInputProps {
  placeholder?: string;
  value?: string;
  onChange?: (value: string) => void;
  mainInput?: boolean;
}

function MCFilterInput({
  placeholder = "Buscar Médico",
  value,
  onChange,
  mainInput = false,
}: MCFilterInputProps) {
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    onChange?.(e.target.value);
  };

  return (
    <div className="relative w-full h-full">
      <Search className="absolute left-2.5 sm:left-3 top-1/2 h-3.5 w-3.5 sm:h-4 sm:w-4 -translate-y-1/2 text-muted-foreground/80 pointer-events-none z-10" />
      <Input
        value={value}
        onChange={handleChange}
        placeholder={placeholder}
        className="w-full rounded-full h-full placeholder:text-muted-foreground/70 sm:placeholder:text-primary/80 pl-8 sm:pl-9 pr-3 sm:pr-4 py-2 sm:py-2.5 md:py-3 lg:py-3 text-sm sm:text-base border-primary/20 bg-bg-btn-secondary dark:bg-bg-btn-secondary focus:border-primary/40 transition-colors"
      />
    </div>
  );
}

export default MCFilterInput;
