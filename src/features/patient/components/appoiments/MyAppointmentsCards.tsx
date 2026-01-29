import { Clock, MapPin, Video } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/shared/ui/avatar";
import { Button } from "@/shared/ui/button";
import MCAppointmentsStatus from "@/shared/components/tables/MCAppointmentsStatus";

export interface Appointment {
  description: any;
  id: string;
  doctorName: string;
  doctorAvatar: string;
  doctorSpecialty: string;
  evaluationType: string;
  date: string;
  time: string;
  appointmentType: "virtual" | "in_person";
  location?: string;
  status: "scheduled" | "pending" | "in_progress" | "completed" | "cancelled";
}

interface MyAppointmentsCardsProps {
  appointment: Appointment;
  onViewDetails?: (id: string) => void;
  onReschedule?: (id: string) => void;
  onCancel?: (id: string) => void;
  onJoin?: (id: string) => void;
}

export function MyAppointmentsCards({
  appointment,
  onViewDetails,
  onReschedule,
  onCancel,
  onJoin,
}: MyAppointmentsCardsProps) {
  const isUpcoming = ["scheduled", "pending", "in_progress"].includes(
    appointment.status,
  );
  const isVirtual = appointment.appointmentType === "virtual";
  const isInProgress = appointment.status === "in_progress";

  return (
    <div className="appointment-card flex flex-col gap-4">
      {/* Header */}
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-center gap-3">
          <Avatar className="h-14 w-14 border-2 border-border">
            <AvatarImage
              src={appointment.doctorAvatar}
              alt={appointment.doctorName}
            />
            <AvatarFallback className="bg-muted text-muted-foreground">
              {appointment.doctorName
                .split(" ")
                .map((n) => n[0])
                .join("")}
            </AvatarFallback>
          </Avatar>
          <div>
            <h3 className="font-semibold text-foreground">
              {appointment.doctorName}
            </h3>
            <p className="text-sm text-muted-foreground">
              {appointment.doctorSpecialty}
            </p>
          </div>
        </div>
        <MCAppointmentsStatus status={appointment.status} />
      </div>

      {/* Evaluation Type */}
      <h4 className="font-medium text-foreground">
        {appointment.evaluationType}
      </h4>

      {/* Details */}
      <div className="flex flex-wrap gap-4 text-sm text-muted-foreground">
        <div className="flex items-center gap-1.5">
          <Clock className="h-4 w-4" />
          <span>{appointment.date}</span>
          <span className="ml-1">{appointment.time}</span>
        </div>
        <div className="flex items-center gap-1.5">
          {isVirtual ? (
            <>
              <Video className="h-4 w-4" />
              <span>Virtual</span>
            </>
          ) : (
            <>
              <MapPin className="h-4 w-4" />
              <span>In person</span>
            </>
          )}
        </div>
      </div>

      {!isVirtual && appointment.location && (
        <p className="text-sm text-muted-foreground pl-5">
          {appointment.location}
        </p>
      )}

      {/* Actions */}
      <div className="flex flex-wrap gap-2 mt-auto pt-2">
        {isUpcoming ? (
          <>
            {isInProgress && isVirtual ? (
              <>
                <Button
                  onClick={() => onJoin?.(appointment.id)}
                  className="flex-1"
                >
                  Join
                </Button>
                <Button
                  variant="outline"
                  onClick={() => onViewDetails?.(appointment.id)}
                  className="flex-1"
                >
                  View Details
                </Button>
              </>
            ) : (
              <>
                <Button
                  onClick={() => onViewDetails?.(appointment.id)}
                  className="flex-1"
                >
                  View Details
                </Button>
                <Button
                  variant="outline"
                  onClick={() => onReschedule?.(appointment.id)}
                  className="flex-1"
                >
                  Reschedule
                </Button>
                <Button
                  variant="outline"
                  onClick={() => onCancel?.(appointment.id)}
                  className="flex-1 text-destructive border-destructive hover:bg-destructive/10"
                >
                  Cancel
                </Button>
              </>
            )}
          </>
        ) : (
          <Button
            onClick={() => onViewDetails?.(appointment.id)}
            className="w-full"
          >
            View Details
          </Button>
        )}
      </div>
    </div>
  );
}
