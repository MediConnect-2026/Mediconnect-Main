import React from "react";
import { MCModalBase } from "@/shared/components/MCModalBase";
import { useTranslation } from "react-i18next";
import { useGlobalUIStore } from "@/stores/useGlobalUIStore";
import { useIsMobile } from "@/lib/hooks/useIsMobile";

interface MarkAsCompletedProps {
  children?: React.ReactNode;
  appointmentId: string;
}

function MarkAsCompleted({ children, appointmentId }: MarkAsCompletedProps) {
  const { t } = useTranslation("doctor");
  const isMobile = useIsMobile();
  const setToast = useGlobalUIStore((state) => state.setToast);

  const handleConfirm = () => {
    setToast({
      message: t("appointment.completedSuccess"),
      type: "success",
      open: true,
    });
  };

  const handleSecondary = () => {
    setToast({
      message: t("appointment.completedAborted"),
      type: "info",
      open: true,
    });
  };

  return (
    <MCModalBase
      id={appointmentId}
      title={t("appointment.completeTitle")}
      trigger={children}
      description={t("appointment.completeDescription")}
      triggerClassName="w-full flex-1"
      variant="decide"
      size={isMobile ? "sm" : "sm"}
      onConfirm={handleConfirm}
      onSecondary={handleSecondary}
      confirmText={t("appointment.confirmComplete")}
      secondaryText={t("appointment.cancelAction")}
    >
      <></>
    </MCModalBase>
  );
}

export default MarkAsCompleted;
