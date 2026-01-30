import React from "react";
import { Badge } from "@/shared/ui/badge";
import { cn } from "@/lib/utils";
interface MCAppointmentsStatusProps {
  status: "scheduled" | "pending" | "in_progress" | "completed" | "cancelled";
  variant?: "default" | "card";
  className?: string;
}

const statusMap: Record<
  MCAppointmentsStatusProps["status"],
  { label: string; color: string }
> = {
  scheduled: { label: "Scheduled", color: "bg-[#6A1B9A]/12 text-[#6A1B9A]" }, // Morado
  pending: { label: "Pending", color: "bg-[#C77A1F]/12 text-[#C77A1F]" }, // Amarillo
  in_progress: {
    label: "In Progress",
    color: "bg-[#1565C0]/12 text-[#1565C0]",
  }, // Azul
  completed: { label: "Completed", color: "bg-[#2E7D32]/12 text-[#2E7D32]" }, // Verde
  cancelled: { label: "Cancelled", color: "bg-[#C62828]/12 text-[#C62828]" }, // Rojo
};

function MCAppointmentsStatus({
  status,
  variant = "default",
}: MCAppointmentsStatusProps) {
  const { label, color } = statusMap[status] || {
    label: status,
    color: "bg-muted text-muted-foreground",
  };

  const sizeClass =
    variant === "card"
      ? "px-4 py-1 text-sm font-medium"
      : "px-3 py-1 text-xs font-medium";

  return (
    <Badge className={`rounded-full ${sizeClass} ${color}  `} style={{}}>
      {label}
    </Badge>
  );
}

export default MCAppointmentsStatus;
