import React, { useState } from "react";
import { Popover, PopoverTrigger, PopoverContent } from "@/shared/ui/popover";
import { Ellipsis, Loader2 } from "lucide-react";
import { useIsMobile } from "@/lib/hooks/useIsMobile";
import { Button } from "@/shared/ui/button";
import { ROUTES } from "@/router/routes";
import { useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { toast } from "sonner";
import ChangeStatusServiceModal from "./ChangeStatusServiceModal";
import { doctorService } from "@/shared/navigation/userMenu/editProfile/doctor/services";

interface ServicesActionsProps {
  onView?: () => void;
  onEdit?: () => void;
  onDeactivate?: () => void;
  onActivate?: () => void;
  onDelete?: () => void;
  status?: "active" | "inactive";
  isCard?: boolean;
  serviceId?: string;
}

const ServicesActions: React.FC<ServicesActionsProps> = ({
  onView,
  onEdit,
  onDeactivate,
  onActivate,
  onDelete,
  status = "active",
  isCard = false,
  serviceId,
}) => {
  const isMobile = useIsMobile();
  const navigate = useNavigate();
  const { t } = useTranslation("doctor");

  // Estado para controlar el popover y loading
  const [isOpen, setIsOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [loadingAction, setLoadingAction] = useState<"activate" | "deactivate" | "delete" | null>(null);

  const handleView = () => {
    setIsOpen(false);
    if (onView) {
      onView();
    } else if (serviceId) {
      navigate(`${ROUTES.COMMON.SERVICE}/${serviceId}`);
    }
  };

  const handleEdit = () => {
    setIsOpen(false);
    if (onEdit) {
      onEdit();
    } else {
      console.warn("⚠️ onEdit callback not provided for service:", serviceId);
    }
  };

  // Handler para desactivar servicio
  const handleDeactivateConfirm = async () => {
    if (!serviceId) {
      toast.error(t("services.messages.missingServiceId", "ID de servicio no disponible"));
      return;
    }

    setLoadingAction("deactivate");
    setIsLoading(true);
    setIsOpen(false);

    try {
      // Llamar a la API para desactivar
      const response = await doctorService.updateStatusOfService(
        Number(serviceId),
        "Inactivo"
      );

      if (response?.success) {
        toast.success(
          t("services.messages.deactivateSuccess", "Servicio desactivado correctamente"),
          {
            description: t(
              "services.messages.deactivateDescription",
              "El servicio ya no está visible para los pacientes"
            ),
          }
        );

        // Ejecutar callback adicional si existe (para recargar datos)
        if (onDeactivate) {
          onDeactivate();
        }
      } else {
        throw new Error(response?.message || "Error desconocido");
      }
    } catch (error) {
      console.error("❌ Error deactivating service:", error);
      
      toast.error(
        t("services.messages.deactivateError", "Error al desactivar el servicio"),
        {
          description:
            error instanceof Error
              ? error.message
              : t("services.messages.tryAgain", "Por favor, intenta nuevamente"),
        }
      );
    } finally {
      setIsLoading(false);
      setLoadingAction(null);
    }
  };

  // Handler para activar servicio
  const handleActivateConfirm = async () => {
    if (!serviceId) {
      toast.error(t("services.messages.missingServiceId", "ID de servicio no disponible"));
      return;
    }

    setLoadingAction("activate");
    setIsLoading(true);
    setIsOpen(false);

    try {
      // Llamar a la API para activar
      const response = await doctorService.updateStatusOfService(
        Number(serviceId),
        "Activo"
      );

      if (response?.success) {
        toast.success(
          t("services.messages.activateSuccess", "Servicio activado correctamente"),
          {
            description: t(
              "services.messages.activateDescription",
              "El servicio ya está visible para los pacientes"
            ),
          }
        );

        // Ejecutar callback adicional si existe (para recargar datos)
        if (onActivate) {
          onActivate();
        }
      } else {
        throw new Error(response?.message || "Error desconocido");
      }
    } catch (error) {
      console.error("❌ Error activating service:", error);
      
      toast.error(
        t("services.messages.activateError", "Error al activar el servicio"),
        {
          description:
            error instanceof Error
              ? error.message
              : t("services.messages.tryAgain", "Por favor, intenta nuevamente"),
        }
      );
    } finally {
      setIsLoading(false);
      setLoadingAction(null);
    }
  };

  // Handler para eliminar servicio
  const handleDeleteConfirm = async () => {
    if (!serviceId) {
      toast.error(t("services.messages.missingServiceId", "ID de servicio no disponible"));
      return;
    }

    setLoadingAction("delete");
    setIsLoading(true);
    setIsOpen(false);

    try {
      // Llamar a la API para eliminar
      const response = await doctorService.deleteService(Number(serviceId));

      if (response?.success) {        
        // Ejecutar callback adicional si existe (para recargar datos)
        if (onDelete) {
          onDelete();
        }

        toast.success(
          t("services.messages.deleteSuccess", "Servicio eliminado correctamente"),
          {
            description: t(
              "services.messages.deleteDescription",
              "El servicio ha sido eliminado permanentemente"
            ),
          }
        );
      } else {
        throw new Error(response?.message || "Error desconocido");
      }
    } catch (error) {
      console.error("❌ Error deleting service:", error);
      
      toast.error(
        t("services.messages.deleteError", "Error al eliminar el servicio"),
        {
          description:
            error instanceof Error
              ? error.message
              : t("services.messages.tryAgain", "Por favor, intenta nuevamente"),
        }
      );
    } finally {
      setIsLoading(false);
      setLoadingAction(null);
    }
  };

  return (
    <>
      <Popover open={isOpen} onOpenChange={setIsOpen}>
        <PopoverTrigger asChild>
          {isCard ? (
            <button
              className={`
                z-30 rounded-full border-none border-white/60
                bg-black/20 backdrop-blur-xl shadow-2xl
                transition-all duration-700 ease-[cubic-bezier(0.175,0.885,0.32,2.2)]
                pointer-events-auto
                ${isMobile ? "p-1" : "p-1.5"}
                ${isLoading ? "opacity-50 cursor-not-allowed" : ""}
              `}
              type="button"
              disabled={isLoading}
            >
              {isLoading ? (
                <Loader2 className="text-white animate-spin" size={isMobile ? 18 : 20} />
              ) : (
                <Ellipsis className="text-white" size={isMobile ? 18 : 20} />
              )}
            </button>
          ) : (
            <Button
              variant="ghost"
              size="icon"
              className={`
                bg-bg-btn-secondary rounded-full transition-colors 
                hover:bg-primary/10 active:bg-primary/20 group
                ${isLoading ? "opacity-50 cursor-not-allowed" : ""}
              `}
              disabled={isLoading}
            >
              {isLoading ? (
                <Loader2 className="h-4 w-4 text-primary animate-spin" />
              ) : (
                <Ellipsis className="h-4 w-4 text-primary group-hover:text-primary/80 group-active:text-primary/60" />
              )}
            </Button>
          )}
        </PopoverTrigger>
        <PopoverContent
          isTablet
          className={`
            p-1 flex flex-col gap-0.5 z-40 rounded-xl 
            border border-primary/10 shadow-lg
            ${isMobile ? "min-w-[140px] text-xs" : "min-w-[150px] text-sm"}
          `}
          align="end"
          sideOffset={5}
        >
          <div className="flex flex-col items-center w-full">
            {/* Ver */}
            <button
              className={`
                w-full text-center rounded-lg hover:bg-accent transition
                dark:hover:text-background
                ${isMobile ? "px-2 py-1" : "px-2.5 py-1.5"}
              `}
              type="button"
              onClick={handleView}
              disabled={isLoading}
            >
              {t("services.actions.view", "Ver")}
            </button>
            
            {/* Editar */}
            <button
              className={`
                w-full text-center rounded-lg hover:bg-accent transition
                dark:hover:text-background
                ${isMobile ? "px-2 py-1" : "px-2.5 py-1.5"}
                ${isLoading ? "opacity-50 cursor-not-allowed" : ""}
              `}
              type="button"
              onClick={handleEdit}
              disabled={isLoading}
            >
              {t("services.actions.edit", "Editar")}
            </button>

            {/* Activar/Desactivar */}
            {status === "active" ? (
              <ChangeStatusServiceModal
                serviceId={serviceId || ""}
                action="deactivate"
                onConfirm={handleDeactivateConfirm}
                onSecondary={() => setIsOpen(true)}
              >
                <button
                  className={`
                    w-full text-center rounded-lg hover:bg-accent transition
                    dark:hover:text-background flex items-center justify-center gap-2
                    ${isMobile ? "px-2 py-1" : "px-2.5 py-1.5"}
                    ${isLoading && loadingAction === "deactivate" ? "opacity-50" : ""}
                  `}
                  type="button"
                  disabled={isLoading}
                >
                  {isLoading && loadingAction === "deactivate" && (
                    <Loader2 className="w-3 h-3 animate-spin" />
                  )}
                  {t("services.actions.deactivate", "Desactivar")}
                </button>
              </ChangeStatusServiceModal>
            ) : (
              <ChangeStatusServiceModal
                serviceId={serviceId || ""}
                action="activate"
                onConfirm={handleActivateConfirm}
                onSecondary={() => setIsOpen(true)}
              >
                <button
                  className={`
                    w-full text-center rounded-lg hover:bg-accent transition
                    dark:hover:text-background flex items-center justify-center gap-2
                    ${isMobile ? "px-2 py-1" : "px-2.5 py-1.5"}
                    ${isLoading && loadingAction === "activate" ? "opacity-50" : ""}
                  `}
                  type="button"
                  disabled={isLoading}
                >
                  {isLoading && loadingAction === "activate" && (
                    <Loader2 className="w-3 h-3 animate-spin" />
                  )}
                  {t("services.actions.activate", "Activar")}
                </button>
              </ChangeStatusServiceModal>
            )}

            {/* Eliminar */}
            <ChangeStatusServiceModal
              serviceId={serviceId || ""}
              action="delete"
              onConfirm={handleDeleteConfirm}
              onSecondary={() => setIsOpen(true)}
            >
              <button
                className={`
                  w-full text-center rounded-lg hover:bg-destructive/10 
                  text-destructive transition flex items-center justify-center gap-2
                  ${isMobile ? "px-2 py-1" : "px-2.5 py-1.5"}
                  ${isLoading && loadingAction === "delete" ? "opacity-50" : ""}
                `}
                type="button"
                disabled={isLoading}
              >
                {isLoading && loadingAction === "delete" && (
                  <Loader2 className="w-3 h-3 animate-spin" />
                )}
                {t("services.actions.delete", "Eliminar")}
              </button>
            </ChangeStatusServiceModal>
          </div>
        </PopoverContent>
      </Popover>
    </>
  );
};

export default ServicesActions;