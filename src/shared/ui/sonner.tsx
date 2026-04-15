import {
  CircleCheckIcon,
  InfoIcon,
  OctagonXIcon,
  TriangleAlertIcon,
} from "lucide-react";
import { useTheme } from "next-themes";
import { Toaster as Sonner, type ToasterProps } from "sonner";

const Toaster = ({ ...props }: ToasterProps) => {
  const { theme = "system" } = useTheme();

  return (
    <Sonner
      theme={theme as ToasterProps["theme"]}
      className="toaster group"
      icons={{
        success: (
          <CircleCheckIcon
            className="size-4"
            style={{ color: "var(--primary)" }}
          />
        ),
        info: (
          <InfoIcon className="size-4" style={{ color: "var(--secondary)" }} />
        ),
        warning: (
          <TriangleAlertIcon className="size-4" style={{ color: "#E9B306" }} />
        ),
        error: (
          <OctagonXIcon
            className="size-4"
            style={{ color: "var(--destructive)" }}
          />
        ),
      }}
      style={
        {
          "--normal-bg": "var(--background)",
          "--normal-text": "var(--popover-foreground)",
          "--normal-border":
            "color-mix(in srgb, var(--primary), transparent 85%)", // 50% opacidad
          "--border-radius": "var(--radius)",
        } as React.CSSProperties
      }
      {...props}
    />
  );
};

export { Toaster };
