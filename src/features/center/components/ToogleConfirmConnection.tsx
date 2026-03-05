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

  // Si está pendiente, no mostrar modal
  if (isPending) {
    return <>{children}</>;
  }

  // Mensajes según el rol
  let title = "";
  let description = "";
  let confirmText = "";
  if (userRole === "DOCTOR") {
    title = isConnected
      ? "Desconectar Centro Médico"
      : "Conectar Centro Médico";
    description = isConnected
      ? "¿Estás seguro de que deseas desconectar este centro médico? Esta acción no se puede deshacer."
      : "¿Deseas conectar este centro médico?";
    confirmText = isConnected ? "Desconectar" : "Conectar";
  } else {
    // CENTER
    title = isConnected ? "Desconectar Doctor" : "Conectar Doctor";
    description = isConnected
      ? "¿Estás seguro de que deseas desconectar a este doctor? Esta acción no se puede deshacer."
      : "¿Deseas conectar a este doctor a tu centro médico?";
    confirmText = isConnected ? "Desconectar" : "Conectar";
  }

  return (
    <MCModalBase
      id={`toggle-connection-${id}`}
      trigger={children}
      variant={isConnected ? "warning" : "decide"}
      title={title}
      triggerClassName="flex-1 bg-red-500   w-full"
      description={description}
      confirmText={confirmText}
      secondaryText="Cancelar"
      onConfirm={onConfirm}
      onSecondary={onCancel}
      size="sm"
    >
      <></>
    </MCModalBase>
  );
}

export default ToogleConfirmConnection;
