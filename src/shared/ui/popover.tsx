import * as React from "react";
import * as PopoverPrimitive from "@radix-ui/react-popover";
import { cn } from "@/lib/utils";

export type PopoverContentProps = React.ComponentProps<
  typeof PopoverPrimitive.Content
> & {
  isTablet?: boolean;
  placement?: "left" | "right" | "top" | "bottom" | "center";
};

function Popover({
  ...props
}: React.ComponentProps<typeof PopoverPrimitive.Root>) {
  return <PopoverPrimitive.Root data-slot="popover" {...props} />;
}

function PopoverTrigger({
  ...props
}: React.ComponentProps<typeof PopoverPrimitive.Trigger>) {
  return <PopoverPrimitive.Trigger data-slot="popover-trigger" {...props} />;
}

function PopoverContent({
  className,
  align = "center",
  sideOffset = 4,
  isTablet = false,
  placement,
  ...props
}: PopoverContentProps) {
  // Solo aplica placement si esTablet
  const tabletPlacement = isTablet
    ? placement === "left"
      ? "left-full top-1/2 -translate-y-1/2 mr-4 origin-right"
      : placement === "right"
        ? "right-full top-1/2 -translate-y-1/2 ml-4 origin-left"
        : placement === "top"
          ? "top-full left-1/2 -translate-x-1/2 mt-4 origin-bottom"
          : placement === "bottom"
            ? "bottom-full left-1/2 -translate-x-1/2 mb-4 origin-top"
            : placement === "center"
              ? "left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 origin-center"
              : ""
    : "";

  return (
    <PopoverPrimitive.Portal container={document.body}>
      <PopoverPrimitive.Content
        data-slot="popover-content"
        align={align}
        sideOffset={sideOffset}
        className={cn(
          isTablet
            ? `bg-background text-popover-foreground w-32 p-1 rounded-2xl border border-primary/10 shadow-sm z-30 ${tabletPlacement}`
            : "bg-background text-popover-foreground data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95 data-[side=bottom]:slide-in-from-top-2 data-[side=left]:slide-in-from-right-2 data-[side=right]:slide-in-from-left-2 data-[side=top]:slide-in-from-bottom-2 z-[9999] w-40 origin-(--radix-popover-content-transform-origin) rounded-md border p-2 shadow-md outline-hidden",
          className,
        )}
        style={{
          zIndex: isTablet ? 30 : 9999, // Menor z-index si es tablet
          ...(props.style || {}),
        }}
        {...props}
      />
    </PopoverPrimitive.Portal>
  );
}

function PopoverAnchor({
  ...props
}: React.ComponentProps<typeof PopoverPrimitive.Anchor>) {
  return <PopoverPrimitive.Anchor data-slot="popover-anchor" {...props} />;
}

export { Popover, PopoverTrigger, PopoverContent, PopoverAnchor };
