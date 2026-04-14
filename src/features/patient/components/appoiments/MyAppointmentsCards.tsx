import { Clock, MapPin, Video } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/shared/ui/avatar";
import { MCUserAvatar } from "@/shared/navigation/userMenu/MCUserAvatar";
import { useTranslation } from "react-i18next";

import MCAppointmentsStatus from "@/shared/components/tables/MCAppointmentsStatus";
import {
  Card,
  CardHeader,
  CardFooter,
  CardTitle,
  CardContent,
  CardDescription,
} from "@/shared/ui/card";
import MCButton from "@/shared/components/forms/MCButton";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/shared/ui/tooltip";
import ScheduleAppointmentDialog from "@/features/patient/components/appoiments/ScheduleAppointmentDialog";
import CancelAppointmentDialog from "@/features/patient/components/appoiments/CancelAppointmentDialog";
import ViewDetailsAppointmentDialog from "./ViewDetailsAppointmentDialog";

export interface Appointment {
  id: string;
  doctorId: string;
  doctorName: string;
  doctorAvatar: string;
  doctorSpecialty: string;
  evaluationType: string;
  date: string;
  time: string;
  description?: string;
  appointmentType: "virtual" | "in_person";
  location?: string;
  status: "scheduled" | "pending" | "in_progress" | "completed" | "cancelled";
}

import { useNavigate } from "react-router-dom";
import { ROUTES } from "@/router/routes";
interface MyAppointmentsCardsProps {
  appointment: Appointment;
  onViewDetails?: (id: string) => void;
  onReschedule?: (id: string) => void;
  onCancel?: (id: string) => void;
  onJoin?: (id: string) => void;
}

const truncate = (text: string, maxLength: number = 25): string => {
  return text.length > maxLength ? `${text.substring(0, maxLength)}...` : text;
};

export function MyAppointmentsCards({
  appointment,
  onViewDetails,

  onCancel,
}: MyAppointmentsCardsProps) {
  const { t } = useTranslation("patient");
  const navigate = useNavigate();

  const isUpcoming = ["scheduled", "pending", "in_progress"].includes(
    appointment.status,
  );
  const isVirtual = appointment.appointmentType === "virtual";
  const isInProgress = appointment.status === "in_progress";

  const handleJoin = (appointmentId: string) => {
    navigate(
      ROUTES.TELECONSULT.CONFIRM.replace(":appointmentId", appointmentId),
    );
  };

  return (
    <Card className="p-4 flex flex-col gap-3 min-h-[260px] border rounded-3xl bg-bg-secondary border-primary/15">
      <CardHeader className="flex flex-row items-center justify-between gap-2 p-0">
        <div className="flex items-center gap-2">
          <div className="h-20 w-20 relative overflow-hidden rounded-full border border-primary/10 bg-muted flex items-center justify-center">
            {appointment.doctorAvatar ? (
              <Avatar className="h-20 w-20 rounded-full overflow-hidden">
                <AvatarImage
                  src={appointment.doctorAvatar}
                  alt={appointment.doctorName}
                  className="w-full h-full object-cover transition-transform duration-500 hover:scale-110"
                />
                <AvatarFallback className="bg-muted text-muted-foreground">
                  {appointment.doctorName
                    .split(" ")
                    .map((n) => n[0])
                    .join("")}
                </AvatarFallback>
              </Avatar>
            ) : (
              <MCUserAvatar
                name={appointment.doctorName}
                square
                size={96}
                className="w-full h-full object-cover transition-transform duration-500 hover:scale-110"
              />
            )}
          </div>
          <div>
            {appointment.doctorName.length > 20 ? (
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <CardTitle className="text-base font-semibold cursor-help">
                      {truncate(appointment.doctorName, 20)}
                    </CardTitle>
                  </TooltipTrigger>
                  <TooltipContent>{appointment.doctorName}</TooltipContent>
                </Tooltip>
              </TooltipProvider>
            ) : (
              <CardTitle className="text-base font-semibold">
                {appointment.doctorName}
              </CardTitle>
            )}
            <CardDescription className="text-xs">
              {appointment.doctorSpecialty}
            </CardDescription>
          </div>
        </div>
        <MCAppointmentsStatus variant="card" status={appointment.status} />
      </CardHeader>

      <CardContent className="p-0">
        {appointment.evaluationType.length > 30 ? (
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <div className="font-medium text-base mb-1 cursor-help">
                  {truncate(appointment.evaluationType, 30)}
                </div>
              </TooltipTrigger>
              <TooltipContent>{appointment.evaluationType}</TooltipContent>
            </Tooltip>
          </TooltipProvider>
        ) : (
          <div className="font-medium text-base mb-1">
            {appointment.evaluationType}
          </div>
        )}

        <div className="grid grid-cols-2 justify-between text-xs text-muted-foreground my-2 w-full">
          <div className="flex flex-col gap-1.5">
            <div className="flex items-center gap-1.5">
              <Clock className="h-4 w-4" />
              <p className="font-semibold text-sm">{appointment.date}</p>
            </div>
            <p className="font-medium text-sm">{appointment.time}</p>
          </div>
          <div className="flex items-center gap-1.5">
            <div>
              {isVirtual ? (
                <div className="flex items-center gap-1.5">
                  <Video className="h-4 w-4" />
                  <span className="font-semibold text-sm">
                    {t("appointments.virtual")}
                  </span>
                </div>
              ) : (
                <div className="flex items-center gap-1.5">
                  <MapPin className="h-4 w-4" />
                  <span className="font-semibold text-sm">
                    {t("appointments.inPerson")}
                  </span>
                </div>
              )}
              {!isVirtual && appointment.location && (
                <>
                  {appointment.location.length > 25 ? (
                    <TooltipProvider>
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <div className="text-sm text-muted-foreground mt-1 cursor-help">
                            {truncate(appointment.location, 25)}
                          </div>
                        </TooltipTrigger>
                        <TooltipContent>{appointment.location}</TooltipContent>
                      </Tooltip>
                    </TooltipProvider>
                  ) : (
                    <div className="text-sm text-muted-foreground mt-1">
                      {appointment.location}
                    </div>
                  )}
                </>
              )}
              {isVirtual && (
                <div className="text-sm text-muted-foreground mt-1">
                  {t("appointments.virtualPlatform")}
                </div>
              )}
            </div>
          </div>
        </div>
      </CardContent>

      <CardFooter className="flex flex-wrap gap-2 pt-2 p-0 mt-auto">
        {isUpcoming ? (
          <>
            {isInProgress ? (
              isVirtual ? (
                // Virtual + en progreso: Unirse y Ver detalles
                <>
                  <MCButton
                    onClick={() => handleJoin(appointment.id)}
                    className="flex-1 w-full"
                    size="sm"
                  >
                    {t("appointments.join")}
                  </MCButton>
                  <ViewDetailsAppointmentDialog appointmentId={appointment.id}>
                    <MCButton
                      variant="outline"
                      onClick={() => onViewDetails?.(appointment.id)}
                      className="flex-1 w-full"
                      size="sm"
                    >
                      {t("appointments.viewDetails")}
                    </MCButton>{" "}
                  </ViewDetailsAppointmentDialog>
                </>
              ) : (
                // Presencial + en progreso: solo Ver detalles
                <MCButton
                  variant="primary"
                  onClick={() => onViewDetails?.(appointment.id)}
                  className="flex-1 w-full"
                  size="sm"
                >
                  {t("appointments.viewDetails")}
                </MCButton>
              )
            ) : (
              // Otros estados: todos los botones
              <div className="grid grid-cols-3 w-full gap-2">
                <ViewDetailsAppointmentDialog appointmentId={appointment.id}>
                  <MCButton
                    onClick={() => onViewDetails?.(appointment.id)}
                    size="sm"
                    className="w-full "
                  >
                    {t("appointments.viewDetails")}
                  </MCButton>
                </ViewDetailsAppointmentDialog>
                <ScheduleAppointmentDialog
                  idProvider={appointment.doctorId}
                  idAppointment={appointment.id}
                >
                  <MCButton variant="outline" size="sm" className="w-full ">
                    {t("appointments.reschedule")}
                  </MCButton>
                </ScheduleAppointmentDialog>
                <CancelAppointmentDialog appointmentId={appointment.id}>
                  <MCButton
                    variant="outlineDelete"
                    onClick={() => onCancel?.(appointment.id)}
                    size="sm"
                    className="w-full "
                  >
                    {t("appointments.cancel")}
                  </MCButton>
                </CancelAppointmentDialog>
              </div>
            )}
          </>
        ) : (
          <ViewDetailsAppointmentDialog appointmentId={appointment.id}>
            <MCButton
              onClick={() => onViewDetails?.(appointment.id)}
              className="w-full flex-1"
              size="sm"
            >
              {t("appointments.viewDetails")}
            </MCButton>
          </ViewDetailsAppointmentDialog>
        )}
      </CardFooter>
    </Card>
  );
}
