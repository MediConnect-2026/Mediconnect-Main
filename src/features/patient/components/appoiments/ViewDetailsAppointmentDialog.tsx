import React from "react";
import { MCModalBase } from "@/shared/components/MCModalBase";
import { useTranslation } from "react-i18next";
import MapScheduleLocation from "@/shared/components/maps/MapScheduleLocation";
interface ViewDetailsAppointmentDialogProps {
  children?: React.ReactNode;
  appointmentId: string;
  appointmentDetails?: React.ReactNode; // Puedes pasar los detalles como prop
}

function ViewDetailsAppointmentDialog({
  children,
  appointmentId,
  appointmentDetails,
}: ViewDetailsAppointmentDialogProps) {
  const { t } = useTranslation();

  return (
    <MCModalBase
      id={appointmentId}
      title={t("appointment.detailsTitle") || "Detalles de la cita"}
      trigger={children}
      triggerClassName="w-full flex-1"
      size="smWide"
      variant="info"
    >
      {appointmentDetails ? (
        appointmentDetails
      ) : (
        <div className="p-4 text-center text-muted-foreground">
          {t("appointment.noDetails") ||
            "No hay detalles disponibles para esta cita."}
        </div>
      )}
    </MCModalBase>
  );
}

export default ViewDetailsAppointmentDialog;
