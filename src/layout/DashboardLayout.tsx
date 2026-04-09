import { Outlet, useLocation } from "react-router-dom";
import MCNavbar from "@/shared/navigation/MCNavbar";
import MCNavbarMobile from "@/shared/navigation/MCMobileNavbar";
import { useAppointmentStore } from "@/stores/useAppointmentStore";
import { useEffect } from "react";
import { useGlobalUIStore } from "@/stores/useGlobalUIStore";
import { useCreateServicesStore } from "@/stores/useCreateServicesStore";
import { useWebSocket } from "@/lib/hooks/useWebSocket";
import { useAppStore } from "@/stores/useAppStore";
import { chatService } from "@/services/chat";

function DashboardLayout() {
  const location = useLocation();
  const setIsAppointmentInProgress = useAppointmentStore(
    (state) => state.setIsAppointmentInProgress,
  );
  const resetAppointment = useAppointmentStore(
    (state) => state.clearAppointments,
  );
  const resetVerificationContext = useGlobalUIStore(
    (state) => state.resetVerificationContext,
  );
  const resetCreateService = useCreateServicesStore((state) => state.resetAll);
  const user = useAppStore((state) => state.user);
  const setConversations = useAppStore((state) => state.setConversations);

  // Inicializar WebSocket de forma global para todo el dashboard (Chat, Notificaciones en vivo)
  useWebSocket();

  // Precargar las conversaciones para que el badge de mensajes no leídos se muestre en toda la App usando reduce
  useEffect(() => {
    if (user) {
      chatService
        .getConversations()
        .then((data) => setConversations(data))
        .catch((err) => console.error("Error pre-loading conversations:", err));
    }
  }, [user, setConversations]);

  useEffect(() => {
    const currentPath = window.location.pathname;

    // Reset de appointments si sale de schedule-appointment o search
    if (
      !currentPath.startsWith("/patient/schedule-appointment") &&
      !currentPath.startsWith("/search")
    ) {
      resetAppointment();
    }

    // Reset de verificación si sale de settings
    if (!currentPath.startsWith("/settings")) {
      resetVerificationContext?.();
    }

    // Reset de creación de servicios si sale de /doctor/services/create
    if (!currentPath.startsWith("/doctor/services/create")) {
      resetCreateService();
    }
     
  }, [
    location.pathname,
    resetAppointment,
    setIsAppointmentInProgress,
    resetVerificationContext,
    resetCreateService,
  ]);

  // Detectar si estamos en la ruta del chat
  const isChatPage = location.pathname.includes("/chat");

  return (
    <div
      className={
        isChatPage
          ? "h-screen px-4 py-6 bg-bg-btn-secondary flex flex-col gap-6 "
          : "min-h-screen px-4 py-6 bg-bg-btn-secondary flex flex-col gap-6 "
      }
    >
      {/* Navbar */}
      <div className="block md:hidden sticky top-0 z-30 animate-fade-in">
        <MCNavbarMobile />
      </div>

      <div className="hidden md:block  top-5 z-30 animate-fade-in">
        <MCNavbar />
      </div>

      {/* Content - Ocupa el espacio restante */}
      <div className={isChatPage ? "flex-1 overflow-hidden" : "w-full h-full "}>
        <Outlet />
      </div>
    </div>
  );
}

export default DashboardLayout;
