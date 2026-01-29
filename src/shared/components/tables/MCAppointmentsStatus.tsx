import React from "react";
import { Badge } from "@/shared/ui/badge";

interface MCAppointmentsStatusProps {
  status: "scheduled" | "pending" | "in_progress" | "completed" | "cancelled";
}

const statusMap: Record<
  MCAppointmentsStatusProps["status"],
  { label: string; color: string }
> = {
  scheduled: { label: "Scheduled", color: "bg-blue-100 text-blue-800" },
  pending: { label: "Pending", color: "bg-yellow-100 text-yellow-800" },
  in_progress: { label: "In Progress", color: "bg-green-100 text-green-800" },
  completed: { label: "Completed", color: "bg-gray-100 text-gray-800" },
  cancelled: { label: "Cancelled", color: "bg-red-100 text-red-800" },
};

function MCAppointmentsStatus({ status }: MCAppointmentsStatusProps) {
  const { label, color } = statusMap[status] || {
    label: status,
    color: "bg-muted text-muted-foreground",
  };

  return (
    <Badge className={`rounded-full px-3 py-1 text-xs font-medium ${color}`}>
      {label}
    </Badge>
  );
}

export default MCAppointmentsStatus;
