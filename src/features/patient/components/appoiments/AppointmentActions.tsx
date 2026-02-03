import React from "react";
import { useTranslation } from "react-i18next";
import ScheduleAppointmentDialog from "@/features/patient/components/appoiments/ScheduleAppointmentDialog";
import CancelAppointmentDialog from "@/features/patient/components/appoiments/CancelAppointmentDialog";
import ViewDetailsAppointmentDialog from "./ViewDetailsAppointmentDialog";

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
  const isUpcoming = ["scheduled", "pending", "in_progress"].includes(
    appointment.status,
  );
  const isVirtual = appointment.appointmentType === "virtual";
  const isInProgress = appointment.status === "in_progress";

  if (isUpcoming) {
    if (isInProgress) {
      if (isVirtual) {
        // Virtual + en progreso: Unirse y Ver detalles
        return (
          <div className="flex flex-col gap-1 py-1">
            <div
              className="p-1 cursor-pointer rounded-lg hover:bg-accent/70 transition dark:hover:text-background text-sm flex items-center justify-center"
              onClick={() => alert("Joining appointment...")}
            >
              {t("appointments.join")}
            </div>
            <ViewDetailsAppointmentDialog appointmentId={appointment.id}>
              <div className="p-1 cursor-pointer rounded-lg hover:bg-accent/70 dark:hover:text-background transition text-sm">
                {t("appointments.viewDetails")}
              </div>
            </ViewDetailsAppointmentDialog>
          </div>
        );
      } else {
        // Presencial + en progreso: solo Ver detalles
        return (
          <ViewDetailsAppointmentDialog appointmentId={appointment.id}>
            <div className="p-1 cursor-pointer rounded-lg hover:bg-accent/70 dark:hover:text-background transition text-sm">
              {t("appointments.viewDetails")}
            </div>
          </ViewDetailsAppointmentDialog>
        );
      }
    }
    // Otros estados: todos los botones
    return (
      <div className="flex flex-col gap-1 py-1">
        <ViewDetailsAppointmentDialog appointmentId={appointment.id}>
          <div className="p-1 cursor-pointer rounded-lg hover:bg-accent/70 dark:hover:text-background transition text-sm">
            {t("appointments.viewDetails")}
          </div>
        </ViewDetailsAppointmentDialog>
        <ScheduleAppointmentDialog
          idProvider={appointment.doctorId}
          idAppointment={appointment.id}
        >
          <div className="p-1 cursor-pointer rounded-lg hover:bg-accent/70 dark:hover:text-background transition text-sm">
            {t("appointments.reschedule")}
          </div>
        </ScheduleAppointmentDialog>
        <CancelAppointmentDialog appointmentId={appointment.id}>
          <div className="p-1 cursor-pointer rounded-lg hover:bg-destructive/10 text-destructive transition text-sm">
            {t("appointments.cancel")}
          </div>
        </CancelAppointmentDialog>
      </div>
    );
  }
  // Si no es upcoming, solo Ver detalles
  return (
    <ViewDetailsAppointmentDialog appointmentId={appointment.id}>
      <div className="px-4 py-2 cursor-pointer rounded-lg hover:bg-primary/10 transition text-sm">
        {t("appointments.viewDetails")}
      </div>
    </ViewDetailsAppointmentDialog>
  );
}
