import React from "react";
import MCTextArea from "@/shared/components/forms/MCTextArea";
import { useAppointmentStore } from "@/stores/useAppointmentStore";
import { MCModalBase } from "@/shared/components/MCModalBase";
import { useTranslation } from "react-i18next";
import { cancelAppointmentSchema } from "@/schema/appointment.schema";
import MCFormWrapper from "@/shared/components/forms/MCFormWrapper";
import { TriangleAlert } from "lucide-react";
import { useGlobalUIStore } from "@/stores/useGlobalUIStore";

interface CancelAppointmentDialogProps {
  children?: React.ReactNode;
  appointmentId: string;
}

function CancelAppointmentDialog({
  children,
  appointmentId,
}: CancelAppointmentDialogProps) {
  const { t } = useTranslation("patient");
  const setCancelAppointment = useAppointmentStore(
    (state) => state.setCancelAppointment,
  );

  const setToast = useGlobalUIStore((state) => state.setToast);

  const onSubmit = (data: { cancellationReason: string }) => {
    if (setCancelAppointment) {
      setCancelAppointment({
        cancellationReason: data.cancellationReason,
      });
    }
  };

  // Funciones para los botones del modal
  const handleConfirm = () => {
    setToast({
      message: t("appointment.cancellationSuccess"),
      type: "success",
      open: true,
    });
    console.log("Confirmar cancelación de cita:", appointmentId);
  };

  const handleSecondary = () => {
    setToast({
      message: t("appointment.cancellationAborted"),
      type: "info",
      open: true,
    });
    console.log("Cancelar acción de cancelación de cita:", appointmentId);
  };

  return (
    <MCModalBase
      id={appointmentId}
      title={t("appointment.cancelTitle")}
      trigger={children}
      triggerClassName="w-full flex-1"
      variant="warning"
      size="smWide"
      onConfirm={handleConfirm}
      onSecondary={handleSecondary}
      confirmText={t("appointment.confirmCancellation")}
      secondaryText={t("appointment.cancelAction")}
    >
      <MCFormWrapper
        defaultValues={{
          cancellationReason: "",
        }}
        schema={cancelAppointmentSchema(t)}
        onSubmit={onSubmit}
        className="flex flex-col gap-4 justify-center items-center"
      >
        <div className="flex items-center space-x-2 w-[98%] bg-[#E1791D]/10 py-3 px-3 rounded-2xl">
          <div className="flex items-center justify-center size-8 rounded-full bg-[#E1791D]/15 text-[#E1791D]">
            <TriangleAlert size={20} />
          </div>
          <div className="text-[#E1791D]">
            {t("appointment.doctorNotification")}
          </div>
        </div>
        <MCTextArea
          name="cancellationReason"
          label={t("appointment.cancellationReason")}
          placeholder={t("appointment.cancellationReasonPlaceholder")}
          required
          charLimit={200}
          showCharCount
          rows={4}
          maxRows={12}
        />
      </MCFormWrapper>
    </MCModalBase>
  );
}

export default CancelAppointmentDialog;
