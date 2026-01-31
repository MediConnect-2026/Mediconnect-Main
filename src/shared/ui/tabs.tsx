import * as React from "react";
import * as TabsPrimitive from "@radix-ui/react-tabs";

import { cn } from "@/lib/utils";

type TabsListVariant = "default" | "line";

const TabsVariantContext = React.createContext<TabsListVariant>("default");

function Tabs({
  className,
  ...props
}: React.ComponentProps<typeof TabsPrimitive.Root>) {
  return (
    <TabsPrimitive.Root
      data-slot="tabs"
      className={cn("flex flex-col gap-2", className)}
      {...props}
    />
  );
}

interface TabsListProps extends React.ComponentProps<
  typeof TabsPrimitive.List
> {
  variant?: TabsListVariant;
}

function TabsList({ className, variant = "default", ...props }: TabsListProps) {
  return (
    <TabsVariantContext.Provider value={variant}>
      <TabsPrimitive.List
        data-slot="tabs-list"
        className={cn(
          "inline-flex w-fit items-center justify-center",
          variant === "default" &&
            "bg-muted text-muted-foreground h-9 rounded-lg p-[3px]",
          variant === "line" && "gap-2",
          className,
        )}
        {...props}
      />
    </TabsVariantContext.Provider>
  );
}

function TabsTrigger({
  className,
  ...props
}: React.ComponentProps<typeof TabsPrimitive.Trigger>) {
  const variant = React.useContext(TabsVariantContext);

  return (
    <TabsPrimitive.Trigger
      data-slot="tabs-trigger"
      className={cn(
        "inline-flex items-center justify-center gap-1.5 px-2 py-1 text-sm font-medium whitespace-nowrap transition-all disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:shrink-0 [&_svg:not([class*='size-'])]:size-4 focus:outline-none focus:ring-0 focus:border-0",

        // Variante default
        variant === "default" &&
          cn(
            "data-[state=active]:bg-neutral-foreground data-[state=active]:text-background data-[state=active]:shadow",
            "bg-accent/80 text-foreground/100",
            "w-full h-[calc(100%-1px)] flex-1 rounded-md",
          ),

        // Variante line
        variant === "line" &&
          cn(
            "relative pb-1 bg-transparent",
            // Estilos activos - línea más cerca
            "data-[state=active]:text-primary",
            "data-[state=active]:after:absolute data-[state=active]:after:bottom-0 data-[state=active]:after:left-0 data-[state=active]:after:right-0 data-[state=active]:after:h-[2px] data-[state=active]:after:bg-primary",
            // Estilos inactivos
            "data-[state=inactive]:text-primary/60",
          ),

        className,
      )}
      {...props}
    />
  );
}

function TabsContent({
  className,
  ...props
}: React.ComponentProps<typeof TabsPrimitive.Content>) {
  return (
    <TabsPrimitive.Content
      data-slot="tabs-content"
      className={cn("flex-1 outline-none p-0", className)}
      {...props}
    />
  );
}

export { Tabs, TabsList, TabsTrigger, TabsContent };
