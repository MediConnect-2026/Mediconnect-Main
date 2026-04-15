import { Clock } from "lucide-react";
import type { Appointment } from "@/types/CalendarTypes";
import { useAppStore } from "@/stores/useAppStore";

interface AppointmentBadgeProps {
  appointment: Appointment;
  onClick: () => void;
  compact?: boolean;
}

const statusColors: Record<
  "scheduled" | "pending" | "in_progress" | "completed" | "cancelled",
  string
> = {
  scheduled: "bg-[#6A1B9A]/15 border-transparent text-[#6A1B9A]",
  pending: "bg-[#C77A1F]/15 border-transparent text-[#C77A1F]",
  in_progress: "bg-[#1565C0]/15 border-transparent text-[#1565C0]",
  completed: "bg-[#2E7D32]/15 border-transparent text-[#2E7D32]",
  cancelled: "bg-[#C62828]/15 border-transparent text-[#C62828]",
};

export const AppointmentBadge = ({
  appointment,
  onClick,
  compact = false,
}: AppointmentBadgeProps) => {
  const userRole = useAppStore((state) => state.user?.rol);

  const displayName =
    userRole === "DOCTOR" ? appointment.patientName : appointment.doctorName;

  return (
    <button
      onClick={(e) => {
        e.stopPropagation();
        onClick();
      }}
      className={`w-full text-left px-2 py-1.5 rounded-full text-xs font-medium flex items-center gap-1.5 border transition-all duration-200 hover:scale-[1.02] hover:shadow-sm ${
        statusColors[appointment.status]
      } ${compact ? "py-1" : ""}`}
    >
      <Clock className="w-3 h-3 flex-shrink-0" />
      <span className="truncate">
        {compact ? appointment.time : `${displayName} ${appointment.time}`}
      </span>
    </button>
  );
};
