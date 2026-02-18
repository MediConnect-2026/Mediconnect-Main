import React from "react";
import { MCModalBase } from "@/shared/components/MCModalBase";
import { useTranslation } from "react-i18next";
import { useGlobalUIStore } from "@/stores/useGlobalUIStore";

interface MarkAsCompletedProps {
  children?: React.ReactNode;
  appointmentId: string;
}

function MarkAsCompleted({ children, appointmentId }: MarkAsCompletedProps) {
  const { t } = useTranslation("patient");
  const setToast = useGlobalUIStore((state) => state.setToast);

  const handleConfirm = () => {
    setToast({
      message: t(
        "appointment.completedSuccess",
        "Cita marcada como completada",
      ),
      type: "success",
      open: true,
    });
    console.log("Cita marcada como completada:", appointmentId);
  };

  const handleSecondary = () => {
    setToast({
      message: t(
        "appointment.completedAborted",
        "Marcado como completada cancelado",
      ),
      type: "info",
      open: true,
    });
    console.log("Acción de marcar como completada cancelada:", appointmentId);
  };

  return (
    <MCModalBase
      id={appointmentId}
      title={t("appointment.completeTitle", "Marcar como completada")}
      trigger={children}
      description={t(
        "appointment.completeDescription",
        "¿Estás seguro de que deseas marcar esta cita como completada? El paciente será notificado automáticamente.",
      )}
      triggerClassName="w-full flex-1"
      variant="decide"
      size="sm"
      onConfirm={handleConfirm}
      onSecondary={handleSecondary}
      confirmText={t("appointment.confirmComplete", "Confirmar")}
      secondaryText={t("appointment.cancelAction")}
    >
      <></>
    </MCModalBase>
  );
}

export default MarkAsCompleted;
