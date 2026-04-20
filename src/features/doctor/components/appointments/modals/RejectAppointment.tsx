import React from "react";
import { MCModalBase } from "@/shared/components/MCModalBase";
import { useTranslation } from "react-i18next";
import { useGlobalUIStore } from "@/stores/useGlobalUIStore";
import { useIsMobile } from "@/lib/hooks/useIsMobile";

interface RejectAppointmentProps {
  children?: React.ReactNode;
  appointmentId: string;
}

function RejectAppointment({
  children,
  appointmentId,
}: RejectAppointmentProps) {
  const { t } = useTranslation("doctor");
  const isMobile = useIsMobile();
  const setToast = useGlobalUIStore((state) => state.setToast);

  const handleConfirm = () => {
    setToast({
      message: t("appointment.rejectedSuccess"),
      type: "success",
      open: true,
    });
  };

  const handleSecondary = () => {
    setToast({
      message: t("appointment.rejectAborted"),
      type: "info",
      open: true,
    });
  };

  return (
    <MCModalBase
      id={appointmentId}
      title={t("appointment.rejectTitle")}
      trigger={children}
      description={t("appointment.rejectDescription")}
      triggerClassName="w-full flex-1"
      variant="warning"
      size={isMobile ? "sm" : "sm"}
      onConfirm={handleConfirm}
      onSecondary={handleSecondary}
      confirmText={t("appointment.confirmReject")}
      secondaryText={t("appointment.cancelAction")}
    >
      <></>
    </MCModalBase>
  );
}

export default RejectAppointment;
