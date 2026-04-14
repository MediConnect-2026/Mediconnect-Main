import { ToggleGroup, ToggleGroupItem } from "@/shared/ui/toggle-group";
import { List, LayoutGrid } from "lucide-react";
import { useTranslation } from "react-i18next";

interface MCToogleProps {
  value: "list" | "card";
  onChange: (value: "list" | "card") => void;
}

function MCToogle({ value, onChange }: MCToogleProps) {
  const { t } = useTranslation("common");

  return (
    <ToggleGroup
      type="single"
      value={value}
      onValueChange={(val) => {
        if (val === "list" || val === "card") onChange(val);
      }}
      className="h-full bg-bg-btn-secondary border border-primary/20 p-0.5 sm:p-1 flex flex-wrap sm:flex-nowrap gap-0.5 sm:gap-1 w-full max-w-full justify-center items-stretch"
    >
      <ToggleGroupItem
        value="list"
        aria-label={t("ui.toggle.tableView")}
        className="flex-1 sm:flex-none min-w-0 h-full flex items-center justify-center gap-1 sm:gap-2 px-1.5 sm:px-3 py-1 sm:py-1.5
          bg-bg-btn-secondary text-primary/35 whitespace-nowrap
          data-[state=on]:bg-transparent data-[state=on]:text-primary
          hover:bg-bg-btn-secondary/20 hover:text-primary
          active:bg-bg-btn-secondary/30 active:text-primary active:scale-95
          transition-colors duration-150"
      >
        <List className="h-3.5 w-3.5 sm:h-4 sm:w-4 shrink-0" />
        <span className="hidden sm:inline truncate text-sm">
          {t("ui.toggle.table")}
        </span>
      </ToggleGroupItem>

      <ToggleGroupItem
        value="card"
        aria-label={t("ui.toggle.cardView")}
        className="flex-1 sm:flex-none min-w-0 h-full flex items-center justify-center gap-1 sm:gap-2 px-1.5 sm:px-3 py-1 sm:py-1.5
          bg-bg-btn-secondary text-primary/35 whitespace-nowrap
          data-[state=on]:bg-transparent data-[state=on]:text-primary
          hover:bg-bg-btn-secondary/20 hover:text-primary
          active:bg-bg-btn-secondary/30 active:text-primary active:scale-95
          transition-colors duration-150"
      >
        <LayoutGrid className="h-3.5 w-3.5 sm:h-4 sm:w-4 shrink-0" />
        <span className="hidden sm:inline truncate text-sm">
          {t("ui.toggle.cards")}
        </span>
      </ToggleGroupItem>
    </ToggleGroup>
  );
}

export default MCToogle;
