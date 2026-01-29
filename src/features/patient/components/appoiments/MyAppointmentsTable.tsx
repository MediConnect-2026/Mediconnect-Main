import { MoreHorizontal } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/shared/ui/avatar";
import { Button } from "@/shared/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/shared/ui/dropdown-menu";
import MCAppointmentsStatus from "@/shared/components/tables/MCAppointmentsStatus";
import type { Appointment } from "./MyAppointmentsCards"; // <--- Importa el tipado aquí

interface AppointmentRowProps {
  appointment: Appointment;
  onViewDetails?: (id: string) => void;
  onReschedule?: (id: string) => void;
  onCancel?: (id: string) => void;
  onJoin?: (id: string) => void;
}

export function AppointmentRow({
  appointment,
  onViewDetails,
  onReschedule,
  onCancel,
  onJoin,
}: AppointmentRowProps) {
  const isUpcoming = ["scheduled", "pending", "in_progress"].includes(
    appointment.status,
  );
  const isVirtual = appointment.appointmentType === "virtual";
  const isInProgress = appointment.status === "in_progress";

  return (
    <div className="appointment-row flex items-center gap-4 py-2 border-b">
      {/* Doctor Avatar */}
      <Avatar className="h-12 w-12 shrink-0 border-2 border-border">
        <AvatarImage
          src={appointment.doctorAvatar}
          alt={appointment.doctorName}
        />
        <AvatarFallback className="bg-muted text-muted-foreground text-sm">
          {appointment.doctorName
            .split(" ")
            .map((n) => n[0])
            .join("")}
        </AvatarFallback>
      </Avatar>

      {/* Doctor Info */}
      <div className="min-w-[160px]">
        <p className="font-medium text-foreground">{appointment.doctorName}</p>
        <p className="text-sm text-muted-foreground">
          {appointment.doctorSpecialty}
        </p>
      </div>

      {/* Evaluation */}
      <div className="flex-1 min-w-[200px]">
        <p className="font-medium text-foreground">
          {appointment.evaluationType}
        </p>
        {appointment.description && (
          <p className="text-sm text-muted-foreground line-clamp-2">
            {appointment.description}
          </p>
        )}
      </div>

      {/* Date & Time */}
      <div className="min-w-[100px] text-sm">
        <p className="font-medium text-foreground">{appointment.date}</p>
        <p className="text-muted-foreground">{appointment.time}</p>
      </div>

      {/* Location/Type */}
      <div className="min-w-[160px] text-sm">
        <p className="font-medium text-foreground">
          {isVirtual ? "Virtual" : "In person"}
        </p>
        {!isVirtual && appointment.location && (
          <p className="text-muted-foreground line-clamp-2">
            {appointment.location}
          </p>
        )}
      </div>

      {/* Status */}
      <div className="min-w-[120px]">
        <MCAppointmentsStatus status={appointment.status} />
      </div>

      {/* Actions */}
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="ghost" size="icon" className="h-8 w-8 shrink-0">
            <MoreHorizontal className="h-4 w-4" />
            <span className="sr-only">Open menu</span>
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end">
          <DropdownMenuItem onClick={() => onViewDetails?.(appointment.id)}>
            View Details
          </DropdownMenuItem>
          {isUpcoming && (
            <>
              {isInProgress && isVirtual && (
                <DropdownMenuItem onClick={() => onJoin?.(appointment.id)}>
                  Join
                </DropdownMenuItem>
              )}
              <DropdownMenuItem onClick={() => onReschedule?.(appointment.id)}>
                Reschedule
              </DropdownMenuItem>
              <DropdownMenuItem
                onClick={() => onCancel?.(appointment.id)}
                className="text-destructive focus:text-destructive"
              >
                Cancel
              </DropdownMenuItem>
            </>
          )}
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  );
}
