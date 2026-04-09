import { motion } from "framer-motion";
import { Avatar, AvatarFallback, AvatarImage } from "@/shared/ui/avatar";
import { MCUserAvatar } from "@/shared/navigation/userMenu/MCUserAvatar";
import { Video, MapPin } from "lucide-react";
import MCButton from "../forms/MCButton";
import { useIsMobile } from "@/lib/hooks/useIsMobile";
import { useTranslation } from "react-i18next";
import ScheduleAppointmentDialog from "@/features/patient/components/appoiments/ScheduleAppointmentDialog";
import CancelAppointmentDialog from "@/features/patient/components/appoiments/CancelAppointmentDialog";
import type { ServiceDetail } from "@/shared/navigation/userMenu/editProfile/doctor/services/doctor.types";
import { format } from "date-fns";
import ViewDetailsAppointmentDialog from "@/features/patient/components/appoiments/ViewDetailsAppointmentDialog";
import MCAppointmentsStatus from "@/shared/components/tables/MCAppointmentsStatus";
import { useNavigate } from "react-router-dom";
import { ROUTES } from "@/router/routes";

export type AppointmentStatus =
  | "scheduled"
  | "pending"
  | "in_progress"
  | "completed"
  | "cancelled";

export interface Appointment {
  id: string;
  doctorId?: string;
  serviceData?: Partial<ServiceDetail>;
  clientName: string;
  date: Date;
  clientImage?: string;
  service: string;
  startTime: string;
  endTime?: string;
  isVirtual: boolean;
  status: AppointmentStatus;
  // Fields used to pre-fill the reschedule form
  serviceId?: string;
  time24h?: string;
  reason?: string;
  numberOfSessions?: number;
  insuranceProviderId?: string;
  useInsurance?: boolean;
}

interface AppointmentCardProps {
  appointment: Appointment;
  isVertical?: boolean; // Para forzar diseño vertical en móviles
  index: number;
}

export function AppointmentCard({ appointment, index, isVertical }: AppointmentCardProps) {
  const isMobile = useIsMobile();
  const { t } = useTranslation("patient");
  const navigate = useNavigate();

  const initials = appointment.clientName
    .split(" ")
    .map((n) => n[0])
    .join("");

  // Botones según estado y tipo
  const renderButtons = () => {
    const { status, isVirtual } = appointment;

    if (status === "scheduled" || status === "pending") {
      return (
        <div className="flex flex-col sm:flex-row w-full sm:w-fit gap-2">
          {status === "scheduled" && isVirtual && (
            <MCButton
              size="s"
              className="rounded-full w-full sm:w-auto"
              onClick={() =>
                navigate(
                  ROUTES.TELECONSULT.CONFIRM.replace(
                    ":appointmentId",
                    appointment.id
                  )
                )
              }
            >
              {t("appointments.join")}
            </MCButton>
          )}
          <ScheduleAppointmentDialog
            idProvider={appointment.doctorId || ""}
            idAppointment={appointment.id}
            serviceData={appointment.serviceData as ServiceDetail | undefined}
            initialRescheduleData={{
              date: format(appointment.date, "yyyy-MM-dd"),
              time: appointment.time24h || "",
              selectedModality: appointment.isVirtual ? "teleconsulta" : "presencial",
              serviceId: appointment.serviceId || "",
              reason: appointment.reason || "",
              numberOfSessions: appointment.numberOfSessions || 1,
              useInsurance: appointment.useInsurance ?? false,
              insuranceProvider: appointment.insuranceProviderId || "",
              doctorId: appointment.doctorId || "",
              appointmentId: appointment.id,
            }}
          >
            <MCButton
              variant="outline"
              size="s"
              className="rounded-full w-full sm:w-auto"
            >
              {t("appointments.reschedule")}
            </MCButton>
          </ScheduleAppointmentDialog>
          <CancelAppointmentDialog appointmentId={appointment.id}>
            <MCButton
              variant="outlineDelete"
              size="s"
              className="rounded-full w-full sm:w-auto"
            >
              {t("appointments.cancel")}
            </MCButton>
          </CancelAppointmentDialog>
        </div>
      );
    }

    if (status === "in_progress") {
      if (isVirtual) {
        return (
          <div className="flex flex-col gap-2 w-full">
            <MCButton
              size="s"
              className="rounded-full w-full"
              onClick={() => navigate(ROUTES.TELECONSULT.CONFIRM.replace(":appointmentId", appointment.id))}
            >
              {t("appointments.join")}
            </MCButton>
            <ViewDetailsAppointmentDialog appointmentId={appointment.id}>
              <MCButton
                variant="outline"
                size="s"
                className="rounded-full w-full"
              >
                {t("appointments.details")}
              </MCButton>
            </ViewDetailsAppointmentDialog>
          </div>
        );
      }
      // presencial
      return (
        <div className="w-full">
          <ViewDetailsAppointmentDialog appointmentId={appointment.id}>
            <MCButton variant="outline" size="s" className="rounded-full w-full">
              {t("appointments.viewDetails")}
            </MCButton>
          </ViewDetailsAppointmentDialog>
        </div>
      );
    }

    // completed o cancelled
    return (
      <div className="w-full">
        <ViewDetailsAppointmentDialog
          appointmentId={appointment.id}
        >
          <MCButton variant="outline" size="s" className="rounded-full w-full">
            {t("appointments.viewDetails")}
          </MCButton>
        </ViewDetailsAppointmentDialog>

      </div>
    );
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.1, duration: 0.3 }}
      className={`w-full flex gap-3 p-3 bg-none border-b border-primary/15 last:border-b-0 hide-scrollbar ${isVertical ? "flex-col" : "flex-row justify-between items-center"}`}
    // Elimina sm:flex-row y sm:items-center para forzar vertical
    >
      {/* Contenido principal */}
      <div className="flex items-start sm:items-center gap-3 sm:gap-4">
        {/* Avatar */}
        {appointment.clientImage ? (
          <Avatar className="h-12 w-12 sm:h-14 sm:w-14 flex-shrink-0">
            <AvatarImage
              src={appointment.clientImage}
              alt={appointment.clientName}
            />
            <AvatarFallback>{initials}</AvatarFallback>
          </Avatar>
        ) : (
          <div className="flex-shrink-0">
            <MCUserAvatar
              size={isMobile ? 48 : 56}
              name={appointment.clientName}
            />
          </div>
        )}

        {/* Información */}
        <div className="flex flex-col min-w-0 flex-1">
          <div className="flex items-center gap-2 flex-wrap">
            <h4 className="font-display text-base sm:text-lg font-semibold text-foreground truncate">
              {appointment.clientName}
            </h4>
            <MCAppointmentsStatus status={appointment.status} variant="default" />
          </div>
          <p className="text-xs sm:text-sm text-muted-foreground truncate">
            {appointment.service}
          </p>
          <div className="flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-2 mt-1 text-xs sm:text-sm text-muted-foreground">
            <span className="whitespace-nowrap">
              {appointment.startTime} - {appointment.endTime ? appointment.endTime : t("appointments.ongoing")}
            </span>
            <span className="hidden sm:inline text-muted-foreground/50">•</span>
            <span className="flex items-center gap-1 whitespace-nowrap">
              {appointment.isVirtual ? (
                <>
                  <Video className="h-3 w-3 sm:h-3.5 sm:w-3.5" />
                  {t("appointments.virtual")}
                </>
              ) : (
                <>
                  <MapPin className="h-3 w-3 sm:h-3.5 sm:w-3.5" />
                  {t("appointments.inPerson")}
                </>
              )}
            </span>
          </div>
        </div>
      </div>

      {/* Botones de acción */}
      <div className="flex flex-col gap-2 w-full mt-2">{renderButtons()}</div>
    </motion.div>
  );
}
