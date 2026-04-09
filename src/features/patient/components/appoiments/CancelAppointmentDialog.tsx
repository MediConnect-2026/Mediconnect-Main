import React, { useRef, useState } from "react";
import MCTextArea from "@/shared/components/forms/MCTextArea";
import { MCModalBase } from "@/shared/components/MCModalBase";
import { useTranslation } from "react-i18next";
import { cancelAppointmentSchema } from "@/schema/appointment.schema";
import MCFormWrapper from "@/shared/components/forms/MCFormWrapper";
import { TriangleAlert } from "lucide-react";
import { Spinner } from '@/shared/ui/spinner';
import { useAppStore } from "@/stores/useAppStore";
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { cancelCita } from '@/services/api/appointments.service';
import { QUERY_KEYS } from '@/lib/react-query/config';

interface CancelAppointmentDialogProps {
  children?: React.ReactNode;
  appointmentId: string;
  onCancelSuccess?: () => void;
}

function CancelAppointmentDialog({
  children,
  appointmentId,
  onCancelSuccess,
}: CancelAppointmentDialogProps) {
  const { t } = useTranslation("patient");
  const [isOpen, setIsOpen] = useState(false);
  
  const submitRef = useRef<(() => void) | null>(null);
  const [isFormValid, setIsFormValid] = useState(false);
  const queryClient = useQueryClient();

  const userRole = useAppStore((state) => state.user?.rol);
  
  const cancelMutation = useMutation({
    mutationFn: async ({ id, reason }: { id: string; reason: string }) => {
      return await cancelCita(id, reason);
    },
    onSuccess: async () => {
      // Invalidar el cache de citas para refrescar la lista
      await queryClient.invalidateQueries({ queryKey: QUERY_KEYS.CITAS() });
      setIsOpen(false);
      // Llamar al callback de éxito si existe
      onCancelSuccess?.();
    },
    onError: (err) => {
      console.error('Error al cancelar la cita', err);
    }
  });

  const onSubmit = (data: { cancellationReason: string }) => {
    cancelMutation.mutate({ id: appointmentId, reason: data.cancellationReason });
  };

  // Funciones para los botones del modal
  const handleConfirm = () => {
    // Trigger form submit which will call onSubmit
    submitRef.current?.();
  };

  const handleSecondary = () => {
    setIsOpen(false);
    console.log("Cancelar acción de cancelación de cita:", appointmentId);
  };

  const handleClose = () => {
    setIsOpen(false);
  };

  return (
    <MCModalBase
      id={appointmentId}
      title={t("appointment.cancelTitle")}
      trigger={<div onClick={() => setIsOpen(true)}>{children}</div>}
      triggerClassName="w-full flex-1"
      variant="warning"
      size="smWide"
      isOpen={isOpen}
      onClose={handleClose}
      onConfirm={handleConfirm}
      onSecondary={handleSecondary}
      confirmText={
        cancelMutation.isPending ? (
          <div className="flex items-center gap-2">
            <Spinner className="size-4 animate-spin" />
            <span>{t("appointment.confirmCancellation")}</span>
          </div>
        ) : (
          t("appointment.confirmCancellation")
        )
      }
      secondaryText={t("appointment.cancelAction")}
      disabledConfirm={cancelMutation.isPending || !isFormValid}
      autoCloseOnConfirm={false}
    >
      <MCFormWrapper
        defaultValues={{
          cancellationReason: "",
        }}
        schema={cancelAppointmentSchema(t)}
        onSubmit={onSubmit}
        submitRef={submitRef}
        onValidationChange={setIsFormValid}
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
          disabled={cancelMutation.isPending}
        />
        {cancelMutation.isError && (
          <p className="text-sm text-destructive">{t("appointment.cancelError")}</p>
        )}
      </MCFormWrapper>
    </MCModalBase>
  );
}

export default CancelAppointmentDialog;