import { type ReactNode, useMemo, useRef, useState } from "react";
import { MCModalBase } from "@/shared/components/MCModalBase";
import { useTranslation } from "react-i18next";
import { useAppStore } from "@/stores/useAppStore";
import z from "zod";
import MCFormWrapper from "@/shared/components/forms/MCFormWrapper";
import MCTextArea from "@/shared/components/forms/MCTextArea";
import { Loader2 } from "lucide-react";

interface ToogleConfirmConnectionProps {
  children: ReactNode;
  status: "connected" | "not_connected" | "pending";
  id: number;
  onConfirm?: (message?: string) => void | Promise<void>;
  onCancel?: () => void;
  isOpen?: boolean; // Control externo del estado del diálogo
  onClose?: () => void; // Callback cuando se cierra el diálogo
  isSubmitting?: boolean;
  enableMessageInput?: boolean;
}

function ToogleConfirmConnection({
  children,
  status,
  id,
  onConfirm,
  onCancel,
  isOpen,
  onClose,
  isSubmitting = false,
  enableMessageInput = false,
}: ToogleConfirmConnectionProps) {
  const isConnected = status === "connected";
  const isPending = status === "pending";
  const { t } = useTranslation("center");
  const userRole = useAppStore((state) => state.user?.rol);
  const [isFormValid, setIsFormValid] = useState(false);
  const submitRef = useRef<(() => void) | null>(null);

  const requiresMessage = enableMessageInput && !isConnected && !isPending;

  const messageSchema = useMemo(
    () =>
      z.object({
        message: z
          .string()
          .trim()
          .min(10, { message: t("connection.allianceMessageMin") })
          .max(255, { message: t("connection.allianceMessageMax") }),
      }),
    [t],
  );

  if (isPending) {
    return <>{children}</>;
  }

  let title = "";
  let description = "";
  let confirmText = "";

  if (userRole === "DOCTOR") {
    title = isConnected
      ? t("connection.disconnectMedicalCenter")
      : t("connection.connectMedicalCenter");
    description = isConnected
      ? t("connection.disconnectMedicalCenterDesc")
      : t("connection.connectMedicalCenterDesc");
    confirmText = isConnected
      ? t("connection.disconnect")
      : t("connection.connect");
  } else {
    title = isConnected
      ? t("connection.disconnectDoctor")
      : t("connection.connectDoctor");
    description = isConnected
      ? t("connection.disconnectDoctorDesc")
      : t("connection.connectDoctorDesc");
    confirmText = isConnected
      ? t("connection.disconnect")
      : t("connection.connect");
  }

  const handleFormConfirm = (data: { message: string }) => {
    onConfirm?.(data.message.trim());
  };

  const handleConfirm = () => {
    if (requiresMessage) {
      submitRef.current?.();
      return;
    }

    onConfirm?.();
  };

  return (
    <MCModalBase
      id={`toggle-connection-${id}`}
      trigger={children}
      variant={isConnected ? "warning" : "decide"}
      title={title}
      triggerClassName="flex-1 w-full bg-red"
      description={description}
      confirmText={
        isSubmitting ? (
          <span className="inline-flex items-center gap-2">
            <Loader2 className="h-4 w-4 animate-spin" />
            {isConnected
              ? t("connection.allianceDisconnecting")
              : t("connection.allianceRequestSending")}
          </span>
        ) : (
          confirmText
        )
      }
      secondaryText={t("connection.cancel")}
      onConfirm={handleConfirm}
      onSecondary={onCancel}
      size="smWide"
      isOpen={isOpen}
      onClose={onClose}
      disabledConfirm={isSubmitting || (requiresMessage && !isFormValid)}
    >
      {requiresMessage ? (
        <MCFormWrapper
          schema={messageSchema}
          defaultValues={{ message: "" }}
          onSubmit={handleFormConfirm}
          submitRef={submitRef}
          onValidationChange={setIsFormValid}
        >
          <MCTextArea
            name="message"
            label={t("connection.allianceMessageLabel")}
            placeholder={t("connection.allianceMessagePlaceholder")}
            rows={4}
            maxRows={8}
            required
            charLimit={255}
            showCharCount
            disabled={isSubmitting}
          />
        </MCFormWrapper>
      ) : (
        <></>
      )}
    </MCModalBase>
  );
}

export default ToogleConfirmConnection;
