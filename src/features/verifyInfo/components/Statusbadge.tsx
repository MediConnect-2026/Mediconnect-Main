import { Badge } from "@/shared/ui/badge";

interface StatusBadgeProps {
  label: string;
  color: string;
  variant?: "card" | "default";
}

function StatusBadge({ label, color, variant = "card" }: StatusBadgeProps) {
  const sizeClass =
    variant === "card"
      ? "px-4 py-1 text-sm font-medium"
      : "px-3 py-1 text-xs font-medium";
  return (
    <Badge className={`rounded-full ${sizeClass} ${color}`}>{label}</Badge>
  );
}

export default StatusBadge;
