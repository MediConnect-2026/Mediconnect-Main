import { useTranslation } from "react-i18next";
import { useNavigate } from "react-router-dom";
import { ROUTES } from "@/router/routes";
import ScheduleAppointmentDialog from "@/features/patient/components/appoiments/ScheduleAppointmentDialog";
import CancelAppointmentDialog from "@/features/patient/components/appoiments/CancelAppointmentDialog";
import ViewDetailsAppointmentDialog from "./ViewDetailsAppointmentDialog";
import { useAppStore } from "@/stores/useAppStore";
import AcceptAppointment from "@/features/doctor/components/appointments/modals/AcceptAppointment";
import RejectAppointment from "@/features/doctor/components/appointments/modals/RejectAppointment";
import RescheduleAppointment from "@/features/doctor/components/appointments/modals/RescheduleAppointment";
interface AppointmentActionsProps {
  appointment: {
    id: string;
    doctorId: string;
    appointmentType: "virtual" | "in_person";
    status: string;
  };
}

export default function AppointmentActions({
  appointment,
}: AppointmentActionsProps) {
  const { t } = useTranslation("patient");
  const navigate = useNavigate();
  const userRole = useAppStore((state) => state.user?.rol);

  const isUpcoming = ["scheduled", "pending", "in_progress"].includes(
    appointment.status,
  );
  const isVirtual = appointment.appointmentType === "virtual";
  const isInProgress = appointment.status === "in_progress";
  const isPending = appointment.status === "pending";
  const isScheduled = appointment.status === "scheduled";
  const isCompleted = appointment.status === "completed";
  const isCancelled = appointment.status === "cancelled";

  const handleJoin = (appointmentId: string) => {
    navigate(
      ROUTES.TELECONSULT.CONFIRM.replace(":appointmentId", appointmentId),
    );
  };

  const handleContinueConsultation = (appointmentId: string) => {
    navigate(ROUTES.DOCTOR.CONSULTATION.replace(":id", appointmentId));
  };

  // Acciones para DOCTOR
  if (userRole === "DOCTOR") {
    if (isPending) {
      // PENDING: Ver Detalles, Aceptar Cita (con modal), Rechazar Cita
      return (
        <div className="flex flex-col gap-1 p-2">
          <ViewDetailsAppointmentDialog appointmentId={appointment.id}>
            <div className="p-2 cursor-pointer rounded-lg hover:bg-accent/70 dark:hover:text-background transition text-sm text-center">
              {t("appointments.viewDetails")}
            </div>
          </ViewDetailsAppointmentDialog>
          <AcceptAppointment appointmentId={appointment.id}>
            <div className="p-2 cursor-pointer rounded-lg hover:bg-green-500/10 text-green-600 transition text-sm text-center">
              {t("appointments.accept")}
            </div>
          </AcceptAppointment>
          <RejectAppointment appointmentId={appointment.id}>
            <div className="p-2 cursor-pointer rounded-lg hover:bg-destructive/10 text-destructive transition text-sm text-center">
              {t("appointments.reject")}
            </div>
          </RejectAppointment>
        </div>
      );
    }

    if (isScheduled) {
      // SCHEDULED: Ver Cita, Reprogramar, Cancelar, Unirse (si es virtual)
      return (
        <div className="flex flex-col gap-1 p-2">
          {isVirtual && (
            <div
              className="p-2 cursor-pointer rounded-lg bg-primary text-primary-foreground hover:bg-primary/90 shadow-sm transition text-sm flex items-center justify-center font-medium"
              onClick={() => handleJoin(appointment.id)}
            >
              {t("appointments.joinTeleconsult")}
            </div>
          )}
          <ViewDetailsAppointmentDialog appointmentId={appointment.id}>
            <div className="p-2 cursor-pointer rounded-lg hover:bg-accent/70 dark:hover:text-background transition text-sm text-center">
              {t("appointments.viewAppointment")}
            </div>
          </ViewDetailsAppointmentDialog>
          <RescheduleAppointment appointmentId={appointment.id}>
            <div className="p-2 cursor-pointer rounded-lg hover:bg-accent/70 dark:hover:text-background transition text-sm text-center">
              {t("appointments.reschedule")}
            </div>
          </RescheduleAppointment>
          <CancelAppointmentDialog appointmentId={appointment.id}>
            <div className="p-2 cursor-pointer rounded-lg hover:bg-destructive/10 text-destructive transition text-sm text-center">
              {t("appointments.cancel")}
            </div>
          </CancelAppointmentDialog>
        </div>
      );
    }

    if (isCompleted || isCancelled) {
      // COMPLETED/CANCELLED: Solo Ver Detalles
      return (
        <ViewDetailsAppointmentDialog appointmentId={appointment.id}>
          <div className="p-2 cursor-pointer rounded-lg hover:bg-accent/70 dark:hover:text-background transition text-sm">
            {t("appointments.viewDetails")}
          </div>
        </ViewDetailsAppointmentDialog>
      );
    }

    if (isInProgress) {
      if (isVirtual) {
        // IN_PROGRESS + VIRTUAL: Ver Cita, Unirse a Teleconsulta, Marcar Completada
        return (
          <div className="flex flex-col gap-1 p-2">
            <ViewDetailsAppointmentDialog appointmentId={appointment.id}>
              <div className="p-2 cursor-pointer rounded-lg hover:bg-accent/70 dark:hover:text-background transition text-sm">
                {t("appointments.viewAppointment")}
              </div>
            </ViewDetailsAppointmentDialog>
            <div
              className="p-2 cursor-pointer rounded-lg bg-primary text-primary-foreground hover:bg-primary/90 shadow-sm transition text-sm flex items-center justify-center font-medium"
              onClick={() => handleJoin(appointment.id)}
            >
              {t("appointments.joinTeleconsult")}
            </div>
          </div>
        );
      } else {
        // IN_PROGRESS + PRESENCIAL: Ver Cita, Continuar Consulta, Marcar Completada
        return (
          <div className="flex flex-col gap-1 p-2">
            <ViewDetailsAppointmentDialog appointmentId={appointment.id}>
              <div className="p-2 cursor-pointer rounded-lg hover:bg-accent/70 dark:hover:text-background transition text-sm">
                {t("appointments.viewAppointment")}
              </div>
            </ViewDetailsAppointmentDialog>
            <div
              className="p-2 cursor-pointer rounded-lg hover:bg-blue-500/10 text-blue-600 transition text-sm"
              onClick={() => handleContinueConsultation(appointment.id)}
            >
              {t("appointments.continueConsultation")}
            </div>
          </div>
        );
      }
    }
  }

  // Acciones para PACIENTE (lógica original)
  if (isUpcoming) {
    if (isInProgress) {
      if (isVirtual) {
        // Virtual + en progreso: Unirse y Ver detalles
        return (
          <div className="flex flex-col gap-1 p-2">
            <div
              className="p-2 cursor-pointer rounded-lg bg-primary text-primary-foreground hover:bg-primary/90 shadow-sm transition text-sm flex items-center justify-center font-medium"
              onClick={() => handleJoin(appointment.id)}
            >
              {t("appointments.join")}
            </div>
            <ViewDetailsAppointmentDialog appointmentId={appointment.id}>
              <div className="p-2 cursor-pointer rounded-lg hover:bg-accent/70 dark:hover:text-background transition text-sm">
                {t("appointments.viewDetails")}
              </div>
            </ViewDetailsAppointmentDialog>
          </div>
        );
      } else {
        // Presencial + en progreso: solo Ver detalles
        return (
          <ViewDetailsAppointmentDialog appointmentId={appointment.id}>
            <div className="p-2 cursor-pointer rounded-lg hover:bg-accent/70 dark:hover:text-background transition text-sm">
              {t("appointments.viewDetails")}
            </div>
          </ViewDetailsAppointmentDialog>
        );
      }
    }
    // Otros estados: todos los botones
    return (
      <div className="flex flex-col gap-1 p-2">
        {isScheduled && isVirtual && (
          <div
            className="p-2 cursor-pointer rounded-lg bg-primary text-primary-foreground hover:bg-primary/90 shadow-sm transition text-sm flex items-center justify-center font-medium"
            onClick={() => handleJoin(appointment.id)}
          >
            {t("appointments.join")}
          </div>
        )}
        <ViewDetailsAppointmentDialog appointmentId={appointment.id}>
          <div className="p-2 cursor-pointer rounded-lg hover:bg-accent/70 dark:hover:text-background transition text-sm">
            {t("appointments.viewDetails")}
          </div>
        </ViewDetailsAppointmentDialog>
        <ScheduleAppointmentDialog
          idProvider={appointment.doctorId}
          idAppointment={appointment.id}
        >
          <div className="p-2 cursor-pointer rounded-lg hover:bg-accent/70 dark:hover:text-background transition text-sm">
            {t("appointments.reschedule")}
          </div>
        </ScheduleAppointmentDialog>
        <CancelAppointmentDialog appointmentId={appointment.id}>
          <div className="p-2 cursor-pointer rounded-lg hover:bg-destructive/10 text-destructive transition text-sm">
            {t("appointments.cancel")}
          </div>
        </CancelAppointmentDialog>
      </div>
    );
  }
  // Si no es upcoming, solo Ver detalles
  return (
    <ViewDetailsAppointmentDialog appointmentId={appointment.id}>
      <div className="p-2 cursor-pointer rounded-lg hover:bg-accent/70 dark:hover:text-background transition text-sm">
        {t("appointments.viewDetails")}
      </div>
    </ViewDetailsAppointmentDialog>
  );
}
