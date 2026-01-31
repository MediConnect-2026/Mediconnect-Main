import React from "react";
import { Badge } from "@/shared/ui/badge";
import { useTranslation } from "react-i18next";
import { cn } from "@/lib/utils";

interface MCAppointmentsStatusProps {
  status: "scheduled" | "pending" | "in_progress" | "completed" | "cancelled";
  variant?: "default" | "card";
  className?: string;
}

function MCAppointmentsStatus({
  status,
  variant = "default",
}: MCAppointmentsStatusProps) {
  const { t } = useTranslation("patient");

  // Crear el mapa de estados traducido usando las traducciones
  const statusMap: Record<
    MCAppointmentsStatusProps["status"],
    { label: string; color: string }
  > = {
    scheduled: {
      label: t("appointment.status.scheduled"),
      color: "bg-[#6A1B9A]/12 text-[#6A1B9A]",
    }, // Morado
    pending: {
      label: t("appointment.status.pending"),
      color: "bg-[#C77A1F]/12 text-[#C77A1F]",
    }, // Amarillo
    in_progress: {
      label: t("appointment.status.in_progress"),
      color: "bg-[#1565C0]/12 text-[#1565C0]",
    }, // Azul
    completed: {
      label: t("appointment.status.completed"),
      color: "bg-[#2E7D32]/12 text-[#2E7D32]",
    }, // Verde
    cancelled: {
      label: t("appointment.status.cancelled"),
      color: "bg-[#C62828]/12 text-[#C62828]",
    }, // Rojo
  };

  const { label, color } = statusMap[status] || {
    label: status,
    color: "bg-muted text-muted-foreground",
  };

  const sizeClass =
    variant === "card"
      ? "px-4 py-1 text-sm font-medium"
      : "px-3 py-1 text-xs font-medium";

  return (
    <Badge className={`rounded-full ${sizeClass} ${color}`}>{label}</Badge>
  );
}

export default MCAppointmentsStatus;
