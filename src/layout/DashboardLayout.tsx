import { Outlet, useLocation } from "react-router-dom";
import MCNavbar from "@/shared/navigation/MCNavbar";
import MCNavbarMobile from "@/shared/navigation/MCMobileNavbar";
import { useAppointmentStore } from "@/stores/useAppointmentStore";
import { useEffect } from "react";
import { useGlobalUIStore } from "@/stores/useGlobalUIStore";

function DashboardLayout() {
  const location = useLocation();
  const setIsAppointmentInProgress = useAppointmentStore(
    (state) => state.setIsAppointmentInProgress,
  );
  const resetAppointment = useAppointmentStore(
    (state) => state.clearAppointments,
  );

  // Reset de verificación si sale de /settings
  const resetVerificationContext = useGlobalUIStore(
    (state) => state.resetVerificationContext,
  );

  useEffect(() => {
    // Reset de appointments si sale de schedule-appointment o search
    const currentPath = window.location.pathname;
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
    // eslint-disable-next-line
  }, [
    location.pathname,
    resetAppointment,
    setIsAppointmentInProgress,
    resetVerificationContext,
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
      <div className="block md:hidden flex-shrink-0 animate-fade-in">
        <MCNavbarMobile />
      </div>

      <div className="hidden md:block flex-shrink-0 animate-fade-in">
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
