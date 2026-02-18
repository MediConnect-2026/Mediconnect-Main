import {
  X,
  Clock,
  Phone,
  Mail,
  Calendar,
  Stethoscope,
  MessageCircle,
  MapPin,
  Video,
} from "lucide-react";
import type { Appointment } from "@/types/CalendarTypes";
import { format } from "date-fns";
import { es } from "date-fns/locale";
import { Badge } from "@/shared/ui/badge";
import { Button } from "@/shared/ui/button";
import type { AppointmentStatus } from "@/types/CalendarTypes";
import { useAppStore } from "@/stores/useAppStore";
import MCButton from "@/shared/components/forms/MCButton";
import { Avatar, AvatarFallback, AvatarImage } from "@/shared/ui/avatar";
import { MCUserAvatar } from "@/shared/navigation/userMenu/MCUserAvatar";
import {
  Empty,
  EmptyHeader,
  EmptyTitle,
  EmptyDescription,
  EmptyContent,
  EmptyMedia,
} from "@/shared/ui/empty";
import ScheduleAppointmentDialog from "@/features/patient/components/appoiments/ScheduleAppointmentDialog";
import CancelAppointmentDialog from "@/features/patient/components/appoiments/CancelAppointmentDialog";
import ViewDetailsAppointmentDialog from "@/features/patient/components/appoiments/ViewDetailsAppointmentDialog";
import { useNavigate } from "react-router-dom";
import { ROUTES } from "@/router/routes";
import { useTranslation } from "react-i18next";
import { useIsMobile } from "@/lib/hooks/useIsMobile";

interface AppointmentDetailsProps {
  appointment: Appointment | null;
  onClose: () => void;
}

export const AppointmentDetails = ({
  appointment,
  onClose,
}: AppointmentDetailsProps) => {
  const userRole = useAppStore((state) => state.user?.role);
  const { t } = useTranslation("common");
  const navigate = useNavigate();
  const isMobile = useIsMobile();

  const statusLabels: Record<AppointmentStatus, string> = {
    scheduled: t("calendar.status.scheduled"),
    pending: t("calendar.status.pending"),
    in_progress: t("calendar.status.in_progress"),
    completed: t("calendar.status.completed"),
    cancelled: t("calendar.status.cancelled"),
  };

  const statusVariants: Record<AppointmentStatus, string> = {
    scheduled: "bg-[#6A1B9A]/15 text-[#6A1B9A] border-[#6A1B9A]/20",
    pending: "bg-[#C77A1F]/15 text-[#C77A1F] border-[#C77A1F]/20",
    in_progress: "bg-[#1565C0]/15 text-[#1565C0] border-[#1565C0]/20",
    completed: "bg-[#2E7D32]/15 text-[#2E7D32] border-[#2E7D32]/20",
    cancelled: "bg-[#C62828]/15 text-[#C62828] border-[#C62828]/20",
  };

  const isUpcoming = ["scheduled", "pending", "in_progress"].includes(
    appointment?.status ?? "",
  );
  const isVirtual = appointment?.modality === "virtual";
  const isInProgress = appointment?.status === "in_progress";

  const handleJoin = (appointmentId: string) => {
    navigate(
      ROUTES.TELECONSULT.CONFIRM.replace(":appointmentId", appointmentId),
    );
  };

  function handleChatClick(event: React.MouseEvent<HTMLButtonElement>): void {
    // Implementation needed
  }

  if (!appointment) {
    return (
      <Empty className="dark:bg-bg-btn-secondary/40 bg-bg-btn-secondary/60 h-full rounded-3xl">
        <EmptyHeader>
          <EmptyMedia>
            <Calendar className="w-8 h-8 sm:w-12 sm:h-12 text-muted-foreground" />
          </EmptyMedia>
          <EmptyTitle className="text-base sm:text-lg">
            {t("calendar.noAppointmentSelected")}
          </EmptyTitle>
          <EmptyDescription className="text-sm">
            {t("calendar.selectAppointmentDescription")}
          </EmptyDescription>
        </EmptyHeader>
        <EmptyContent />
      </Empty>
    );
  }

  return (
    <div className="h-full flex flex-col gap-1 animate-fade-in border border-primary/15 bg-background rounded-3xl lg:rounded-4xl overflow-visible">
      {/* Header */}
      <div className="flex items-start justify-between p-3 sm:p-4 border-b border-primary/15">
        <div className="flex-1 min-w-0 flex items-center gap-2 sm:gap-3">
          <div className="h-8 w-8 sm:h-9 sm:w-9 relative overflow-hidden rounded-full border border-primary/10 bg-muted flex items-center justify-center flex-shrink-0">
            {userRole === "DOCTOR" ? (
              appointment.patientAvatarUrl ? (
                <Avatar className="h-8 w-8 sm:h-9 sm:w-9 rounded-full overflow-hidden">
                  <AvatarImage
                    src={appointment.patientAvatarUrl}
                    alt={appointment.patientName}
                    className="w-full h-full object-cover"
                  />
                  <AvatarFallback className="bg-muted text-muted-foreground text-xs">
                    {appointment.patientName
                      .split(" ")
                      .map((n) => n[0])
                      .join("")}
                  </AvatarFallback>
                </Avatar>
              ) : (
                <MCUserAvatar
                  name={appointment.patientName}
                  square
                  size={isMobile ? 32 : 36}
                  className="w-full h-full object-cover"
                />
              )
            ) : appointment.doctorAvatarUrl ? (
              <Avatar className="h-8 w-8 sm:h-9 sm:w-9 rounded-full overflow-hidden">
                <AvatarImage
                  src={appointment.doctorAvatarUrl}
                  alt={appointment.doctorName}
                  className="w-full h-full object-cover"
                />
                <AvatarFallback className="bg-muted text-muted-foreground text-xs">
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
                size={isMobile ? 32 : 36}
                className="w-full h-full object-cover"
              />
            )}
          </div>
          <div className="min-w-0 flex-1">
            <div className="flex items-center gap-2">
              <h2 className="text-base sm:text-lg font-semibold truncate">
                {userRole === "DOCTOR"
                  ? appointment.patientName
                  : appointment.doctorName}
              </h2>
              <Button
                variant="ghost"
                size="icon"
                onClick={handleChatClick}
                className="rounded-full h-6 w-6 sm:h-7 sm:w-7 flex-shrink-0 hover:bg-primary/10 hover:text-primary"
                title={t("appointments.openChat")}
              >
                <MessageCircle className="w-3 h-3 sm:w-4 sm:h-4" />
              </Button>
            </div>
            {userRole === "PATIENT" && appointment.doctorSpecialty && (
              <p className="text-muted-foreground text-xs mt-0.5 truncate">
                {appointment.doctorSpecialty}
              </p>
            )}
          </div>
        </div>
        <Button
          variant="ghost"
          size="icon"
          onClick={onClose}
          className="rounded-full h-7 w-7 sm:h-8 sm:w-8 flex-shrink-0"
        >
          <X className="w-4 h-4" />
        </Button>
      </div>

      {/* Content - Scrollable */}
      <div className="flex-1 min-h-0 overflow-auto p-3 sm:p-4 space-y-0.5 sm:space-y-1 scrollbar-hide">
        {/* Status Badge */}
        <div className="flex gap-2 flex-wrap p-2.5 sm:p-3 ">
          <Badge
            className={`${statusVariants[appointment.status]} border text-sm sm:text-base`}
          >
            {statusLabels[appointment.status]}
          </Badge>
        </div>

        {/* Info Blocks */}
        <div className="flex flex-col gap-1.5  sm:gap-2">
          {/* Date & Time */}
          <div className="flex items-center gap-2 sm:gap-3 p-2.5 sm:p-3  bg-muted rounded-lg">
            <div className="w-7 h-7 sm:w-8 sm:h-8 bg-primary/10 rounded-full flex items-center justify-center flex-shrink-0">
              <Clock className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-primary" />
            </div>
            <div className="min-w-0 flex-1">
              <p className="font-medium text-xs sm:text-sm">
                {format(appointment.date, "EEEE, d 'de' MMMM", { locale: es })}
              </p>
              <p className="text-xs text-muted-foreground">
                {appointment.time} • {appointment.duration} min
              </p>
            </div>
          </div>

          {/* Modality */}
          <div className="flex items-center gap-2 p-2.5 sm:p-3 sm:py-3 g-muted rounded-lg">
            <div className="w-7 h-7 sm:w-8 sm:h-8 bg-primary/10 rounded-full flex items-center justify-center flex-shrink-0">
              {appointment.modality === "virtual" ? (
                <Video className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-primary" />
              ) : (
                <MapPin className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-primary" />
              )}
            </div>
            <div className="min-w-0 flex-1">
              <p className="font-medium text-xs sm:text-sm capitalize">
                {t(`calendar.modality.${appointment.modality}`)}
              </p>
              {appointment.modality === "presencial" && appointment.address && (
                <p className="text-xs text-muted-foreground mt-0.5 line-clamp-2">
                  {appointment.address}
                </p>
              )}
            </div>
          </div>

          {/* Service & Price */}
          {appointment.service && (
            <div className="flex items-center gap-2 p-2.5 sm:p-3  sm:py-3 bg-muted rounded-lg">
              <div className="w-7 h-7 sm:w-8 sm:h-8 bg-primary/10 rounded-full flex items-center justify-center flex-shrink-0">
                <Stethoscope className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-primary" />
              </div>
              <div className="min-w-0 flex-1">
                <p className="font-medium text-sm  line-clamp-2">
                  {appointment.service}
                </p>
                {appointment.price && (
                  <p className="text-xs text-muted-foreground mt-0.5">
                    ${appointment.price.toLocaleString("es-MX")} MXN
                    {appointment.numberOfSessions &&
                      appointment.numberOfSessions > 1 &&
                      ` • ${appointment.numberOfSessions} sesiones`}
                  </p>
                )}
              </div>
            </div>
          )}

          {/* Contact */}
          <div className="p-2.5 sm:p-3 bg-muted rounded-lg flex flex-col gap-2">
            <h4 className="text-base font-semibold text-muted-foreground  ">
              {t("calendar.contact")}
            </h4>
            {userRole === "DOCTOR" ? (
              <>
                {appointment.patientPhone && (
                  <div className="flex items-center gap-2">
                    <Phone className="w-3 h-3 sm:w-3.5 sm:h-3.5 text-muted-foreground flex-shrink-0" />
                    <span className="text-xs truncate">
                      {appointment.patientPhone}
                    </span>
                  </div>
                )}
                {appointment.patientEmail && (
                  <div className="flex items-center gap-2">
                    <Mail className="w-3 h-3 sm:w-3.5 sm:h-3.5 text-muted-foreground flex-shrink-0" />
                    <span className="text-xs truncate">
                      {appointment.patientEmail}
                    </span>
                  </div>
                )}
              </>
            ) : (
              <>
                {appointment.doctorPhone && (
                  <div className="flex items-center gap-2">
                    <Phone className="w-3 h-3 sm:w-3.5 sm:h-3.5 text-muted-foreground flex-shrink-0" />
                    <span className="text-xs truncate">
                      {appointment.doctorPhone}
                    </span>
                  </div>
                )}
                {appointment.doctorEmail && (
                  <div className="flex items-center gap-2">
                    <Mail className="w-3 h-3 sm:w-3.5 sm:h-3.5 text-muted-foreground flex-shrink-0" />
                    <span className="text-xs truncate">
                      {appointment.doctorEmail}
                    </span>
                  </div>
                )}
              </>
            )}
          </div>
        </div>

        {/* Notes */}
        {appointment.notes && (
          <div className="p-2.5 sm:p-3 bg-muted rounded-lg flex flex-col gap-2">
            <h4 className="text-base font-semibold text-muted-foreground ">
              {t("calendar.reason")}
            </h4>
            <div className="bg-muted rounded-lg ">
              <p className="text-xs leading-relaxed">{appointment.notes}</p>
            </div>
          </div>
        )}
      </div>

      {/* Actions */}
      <div className="p-3 sm:p-4 border-t border-primary/15 space-y-2">
        {isUpcoming ? (
          isInProgress ? (
            isVirtual ? (
              <div className="flex flex-col gap-2">
                <MCButton
                  className="w-full"
                  size="sm"
                  onClick={() => handleJoin(appointment.id)}
                >
                  {t("appointments.join")}
                </MCButton>
                <ViewDetailsAppointmentDialog appointmentId={appointment.id}>
                  <MCButton className="w-full" size="sm" variant="outline">
                    {t("appointments.viewDetails")}
                  </MCButton>
                </ViewDetailsAppointmentDialog>
              </div>
            ) : (
              <ViewDetailsAppointmentDialog appointmentId={appointment.id}>
                <MCButton className="w-full" size="sm">
                  {t("appointments.viewDetails")}
                </MCButton>
              </ViewDetailsAppointmentDialog>
            )
          ) : (
            <div className="flex flex-col gap-2">
              <ViewDetailsAppointmentDialog appointmentId={appointment.id}>
                <MCButton className="w-full" size="sm">
                  {t("appointments.viewDetails")}
                </MCButton>
              </ViewDetailsAppointmentDialog>
              <ScheduleAppointmentDialog
                idProvider={appointment.doctorId}
                idAppointment={appointment.id}
              >
                <MCButton className="w-full" size="sm" variant="outline">
                  {t("appointments.reschedule")}
                </MCButton>
              </ScheduleAppointmentDialog>
              <CancelAppointmentDialog appointmentId={appointment.id}>
                <MCButton variant="outlineDelete" className="w-full" size="sm">
                  {t("appointments.cancel")}
                </MCButton>
              </CancelAppointmentDialog>
            </div>
          )
        ) : (
          <ViewDetailsAppointmentDialog appointmentId={appointment.id}>
            <MCButton className="w-full" size="sm">
              {t("appointments.viewDetails")}
            </MCButton>
          </ViewDetailsAppointmentDialog>
        )}
      </div>
    </div>
  );
};
