import { MCModalBase } from "@/shared/components/MCModalBase";
import { useTranslation } from "react-i18next";
import { useAppStore } from "@/stores/useAppStore";

interface ToogleConfirmConnectionProps {
  children: React.ReactNode;
  status: "connected" | "not_connected" | "pending";
  id: number;
  onConfirm?: () => void;
  onCancel?: () => void;
}

function ToogleConfirmConnection({
  children,
  status,
  id,
  onConfirm,
  onCancel,
}: ToogleConfirmConnectionProps) {
  const isConnected = status === "connected";
  const isPending = status === "pending";
  const { t } = useTranslation("center");
  const userRole = useAppStore((state) => state.user?.role);

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

  return (
    <MCModalBase
      id={`toggle-connection-${id}`}
      trigger={children}
      variant={isConnected ? "warning" : "decide"}
      title={title}
      triggerClassName="flex-1 w-full"
      description={description}
      confirmText={confirmText}
      secondaryText={t("connection.cancel")}
      onConfirm={onConfirm}
      onSecondary={onCancel}
      size="sm"
    >
      <></>
    </MCModalBase>
  );
}

export default ToogleConfirmConnection;
