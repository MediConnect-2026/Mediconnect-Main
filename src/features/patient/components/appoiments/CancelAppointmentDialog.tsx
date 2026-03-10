import React, { useState } from "react";
import MCTextArea from "@/shared/components/forms/MCTextArea";
import { useAppointmentStore } from "@/stores/useAppointmentStore";
import { MCModalBase } from "@/shared/components/MCModalBase";
import { useTranslation } from "react-i18next";
import { cancelAppointmentSchema } from "@/schema/appointment.schema";
import MCFormWrapper from "@/shared/components/forms/MCFormWrapper";
import { TriangleAlert } from "lucide-react";
import { useGlobalUIStore } from "@/stores/useGlobalUIStore";
import { useAppStore } from "@/stores/useAppStore";
import { useCancelAppointment } from "@/lib/hooks/useAppointmentMutations";

interface CancelAppointmentDialogProps {
  children?: React.ReactNode;
  appointmentId: string;
}

function CancelAppointmentDialog({
  children,
  appointmentId,
}: CancelAppointmentDialogProps) {
  const { t } = useTranslation("patient");
  const [isOpen, setIsOpen] = useState(false);
  const [cancellationReason, setCancellationReason] = useState("");
  
  const setCancelAppointment = useAppointmentStore(
    (state) => state.setCancelAppointment,
  );

  const userRole = useAppStore((state) => state.user?.role);
  const { mutate: cancelAppointment, isPending } = useCancelAppointment();

  const onSubmit = (data: { cancellationReason: string }) => {
    setCancellationReason(data.cancellationReason);
    
    if (setCancelAppointment) {
      setCancelAppointment({
        cancellationReason: data.cancellationReason,
      });
    }
  };

  // Funciones para los botones del modal
  const handleConfirm = () => {
    if (!cancellationReason || cancellationReason.length < 10) {
      return;
    }

    cancelAppointment(
      {
        appointmentId,
        reason: cancellationReason,
      },
      {
        onSuccess: () => {
          setIsOpen(false);
          setCancellationReason("");
        },
      }
    );
  };

  const handleSecondary = () => {
    setIsOpen(false);
    setCancellationReason("");
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
      open={isOpen}
      onOpenChange={setIsOpen}
      onConfirm={handleConfirm}
      onSecondary={handleSecondary}
      confirmText={t("appointment.confirmCancellation")}
      secondaryText={t("appointment.cancelAction")}
      confirmDisabled={isPending || !cancellationReason || cancellationReason.length < 10}
      confirmLoading={isPending}
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
            {userRole === "DOCTOR"
              ? t("appointment.patientNotification")
              : t("appointment.doctorNotification")}
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
          disabled={isPending}
        />
      </MCFormWrapper>
    </MCModalBase>
  );
}

export default CancelAppointmentDialog;
