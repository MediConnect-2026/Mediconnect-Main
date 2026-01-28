import { ArrowRight } from "lucide-react";
import { cn } from "@/lib/utils";
import React from "react";

export type AccountAction = {
  id: string;
  title: string;
  onClick: () => void;
  icon?: React.ReactNode;
  isDestructive?: boolean;
};

type AccountActionsProps = {
  items: AccountAction[];
};

function AccountActions({ items }: AccountActionsProps) {
  return (
    <div className="space-y-5 w-full mb-4">
      {items.map((item) => (
        <button
          key={item.id}
          className={cn(
            "group flex h-auto w-full items-center justify-between rounded-t-2xl px-4 py-4 border-b border-primary/10 transition-colors",
            item.isDestructive
              ? "hover:bg-[rgba(220,38,38,0.1)] active:bg-[rgba(220,38,38,0.15)]"
              : "hover:bg-primary/5",
          )}
          onClick={item.onClick}
        >
          <div className="flex items-center gap-4">
            {item.icon && (
              <div
                className={cn(
                  "items-center justify-center rounded-full",
                  item.isDestructive
                    ? "bg-[rgba(220,38,38,0.1)] text-[#dc2626]"
                    : "bg-accent text-primary",
                )}
              >
                <div className="p-3">{item.icon}</div>
              </div>
            )}
            <div
              className={cn(
                "text-base font-medium flex flex-col items-start gap-1 text-foreground",
                item.isDestructive && "text-[#dc2626]",
              )}
            >
              {item.title}
            </div>
          </div>
          {/* Left */}

          {/* Right */}
          <div className="flex items-center gap-2">
            <ArrowRight
              className={cn(
                "h-5 w-5 transition-transform duration-200 group-hover:translate-x-2",
                item.isDestructive ? "text-[#dc2626]" : "text-primary/50",
              )}
            />
          </div>
        </button>
      ))}
    </div>
  );
}

export default AccountActions;
