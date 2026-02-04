import { Badge } from "@/shared/ui/badge";
import { useTranslation } from "react-i18next";

interface MCServicesStatusProps {
  status: "active" | "inactive";
  variant?: "default" | "card";
  className?: string;
}

function MCServicesStatus({
  status,
  variant = "card",
  className = "",
}: MCServicesStatusProps) {
  const { t } = useTranslation("doctor");

  const statusMap: Record<
    MCServicesStatusProps["status"],
    { label: string; color: string }
  > = {
    active: {
      label: t("services.status.active", "Activo"),
      color:
        variant === "card"
          ? "bg-[#2E7D32]/40 text-white"
          : "bg-green-100/70 text-green-700",
    },
    inactive: {
      label: t("services.status.inactive", "Inactivo"),
      color:
        variant === "card"
          ? "bg-gray-500/80 text-white" // Fondo más oscuro, texto blanco
          : "bg-gray-200/90 text-gray-700", // Fondo más claro, texto más oscuro
    },
  };

  const { label, color } = statusMap[status] || {
    label: status,
    color: "bg-muted text-muted-foreground",
  };

  const sizeClass =
    variant === "card"
      ? "px-4 py-1 text-sm font-medium"
      : "px-3 py-1 text-xs font-medium";

  return (
    <Badge
      className={`rounded-xl shadow ${sizeClass} ${color} ${className} ${
        variant === "card"
          ? " backdrop-blur-xl shadow-2xl transition-all duration-700 ease-[cubic-bezier(0.175,0.885,0.32,2.2)]"
          : ""
      }`}
    >
      {label}
    </Badge>
  );
}

export default MCServicesStatus;
