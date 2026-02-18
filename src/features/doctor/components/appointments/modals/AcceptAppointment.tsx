import React from "react";
import { MCModalBase } from "@/shared/components/MCModalBase";
import { useTranslation } from "react-i18next";
import { useGlobalUIStore } from "@/stores/useGlobalUIStore";

interface AcceptAppointmentProps {
  children?: React.ReactNode;
  appointmentId: string;
}

function AcceptAppointment({
  children,
  appointmentId,
}: AcceptAppointmentProps) {
  const { t } = useTranslation("patient");
  const setToast = useGlobalUIStore((state) => state.setToast);

  const handleConfirm = () => {
    setToast({
      message: t("appointment.acceptedSuccess", "Cita aceptada correctamente"),
      type: "success",
      open: true,
    });
    console.log("Cita aceptada:", appointmentId);
  };

  const handleSecondary = () => {
    setToast({
      message: t(
        "appointment.acceptAborted",
        "Acción de aceptar cita cancelada",
      ),
      type: "info",
      open: true,
    });
    console.log("Acción de aceptación cancelada:", appointmentId);
  };

  return (
    <MCModalBase
      id={appointmentId}
      title={t("appointment.acceptTitle", "Aceptar cita")}
      trigger={children}
      description={t(
        "appointment.acceptDescription",
        "¿Estás seguro de que deseas aceptar esta cita? El paciente será notificado automáticamente.",
      )}
      triggerClassName="w-full flex-1"
      variant="decide"
      size="sm"
      onConfirm={handleConfirm}
      onSecondary={handleSecondary}
      confirmText={t("appointment.confirmAccept", "Confirmar")}
      secondaryText={t("appointment.cancelAction", "Cancelar")}
    >
      <></>
    </MCModalBase>
  );
}

export default AcceptAppointment;
