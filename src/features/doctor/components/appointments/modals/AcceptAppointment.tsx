import React from "react";
import { MCModalBase } from "@/shared/components/MCModalBase";
import { useTranslation } from "react-i18next";
import { useGlobalUIStore } from "@/stores/useGlobalUIStore";
import { useIsMobile } from "@/lib/hooks/useIsMobile";

interface AcceptAppointmentProps {
  children?: React.ReactNode;
  appointmentId: string;
}

function AcceptAppointment({
  children,
  appointmentId,
}: AcceptAppointmentProps) {
  const { t } = useTranslation("doctor");
  const isMobile = useIsMobile();
  const setToast = useGlobalUIStore((state) => state.setToast);

  const handleConfirm = () => {
    setToast({
      message: t("appointment.acceptedSuccess"),
      type: "success",
      open: true,
    });
    console.log("Cita aceptada:", appointmentId);
  };

  const handleSecondary = () => {
    setToast({
      message: t("appointment.acceptAborted"),
      type: "info",
      open: true,
    });
    console.log("Acción de aceptación cancelada:", appointmentId);
  };

  return (
    <MCModalBase
      id={appointmentId}
      title={t("appointment.acceptTitle")}
      trigger={children}
      description={t("appointment.acceptDescription")}
      triggerClassName="w-full flex-1"
      variant="decide"
      size={isMobile ? "sm" : "sm"}
      onConfirm={handleConfirm}
      onSecondary={handleSecondary}
      confirmText={t("appointment.confirmAccept")}
      secondaryText={t("appointment.cancelAction")}
    >
      <></>
    </MCModalBase>
  );
}

export default AcceptAppointment;
