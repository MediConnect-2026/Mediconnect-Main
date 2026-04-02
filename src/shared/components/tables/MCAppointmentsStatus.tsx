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
  className,
}: MCAppointmentsStatusProps) {
  const { t } = useTranslation(["doctor", "patient"]);

  const getStatusLabel = (doctorKey: string, patientKey: string) =>
    t(doctorKey, {
      ns: "doctor",
      defaultValue: t(patientKey, { ns: "patient" }),
    });

  // Crear el mapa de estados traducido usando las traducciones
  const statusMap: Record<
    MCAppointmentsStatusProps["status"],
    { label: string; color: string }
  > = {
    scheduled: {
      label: getStatusLabel(
        "appointments.status.scheduled",
        "appointment.status.scheduled",
      ),
      color: "bg-[#6A1B9A]/15 text-[#6A1B9A]",
    }, // Morado
    pending: {
      label: getStatusLabel(
        "appointments.status.pending",
        "appointment.status.pending",
      ),
      color: "bg-[#C77A1F]/15 text-[#C77A1F]",
    }, // Amarillo
    in_progress: {
      label: getStatusLabel(
        "appointments.status.inProgress",
        "appointment.status.in_progress",
      ),
      color: "bg-[#1565C0]/15 text-[#1565C0]",
    }, // Azul
    completed: {
      label: getStatusLabel(
        "appointments.status.completed",
        "appointment.status.completed",
      ),
      color: "bg-[#2E7D32]/15 text-[#2E7D32]",
    }, // Verde
    cancelled: {
      label: getStatusLabel(
        "appointments.status.cancelled",
        "appointment.status.cancelled",
      ),
      color: "bg-[#C62828]/15 text-[#C62828]",
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
    <Badge className={cn("rounded-full", sizeClass, color, className)}>
      {label}
    </Badge>
  );
}

export default MCAppointmentsStatus;
