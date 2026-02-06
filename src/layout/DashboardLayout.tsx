import { Outlet, useLocation } from "react-router-dom";
import MCNavbar from "@/shared/navigation/MCNavbar";
import MCNavbarMobile from "@/shared/navigation/MCMobileNavbar";
import { useAppointmentStore } from "@/stores/useAppointmentStore";
import { useEffect, useState } from "react";
import { useGlobalUIStore } from "@/stores/useGlobalUIStore";

function DashboardLayout() {
  const location = useLocation();
  const [showNavbar, setShowNavbar] = useState(true);
  const [lastScrollY, setLastScrollY] = useState(0);

  const setIsAppointmentInProgress = useAppointmentStore(
    (state) => state.setIsAppointmentInProgress,
  );
  const resetAppointment = useAppointmentStore(
    (state) => state.clearAppointments,
  );

  const resetVerificationContext = useGlobalUIStore(
    (state) => state.resetVerificationContext,
  );

  // Manejo del scroll
  useEffect(() => {
    const handleScroll = () => {
      const currentScrollY = window.scrollY;

      if (currentScrollY < lastScrollY) {
        // Scroll hacia arriba - mostrar navbar
        setShowNavbar(true);
      } else if (currentScrollY > lastScrollY && currentScrollY > 50) {
        // Scroll hacia abajo - ocultar navbar (después de 50px)
        setShowNavbar(false);
      }

      setLastScrollY(currentScrollY);
    };

    window.addEventListener("scroll", handleScroll, { passive: true });

    return () => {
      window.removeEventListener("scroll", handleScroll);
    };
  }, [lastScrollY]);

  useEffect(() => {
    const currentPath = window.location.pathname;
    if (
      !currentPath.startsWith("/patient/schedule-appointment") &&
      !currentPath.startsWith("/search")
    ) {
      resetAppointment();
    }

    if (!currentPath.startsWith("/settings")) {
      resetVerificationContext?.();
    }
  }, [
    location.pathname,
    resetAppointment,
    setIsAppointmentInProgress,
    resetVerificationContext,
  ]);

  const isChatPage = location.pathname.includes("/chat");

  return (
    <div
      className={
        isChatPage
          ? "h-screen px-4 py-6 bg-bg-btn-secondary flex flex-col gap-6"
          : "min-h-screen px-4 py-6 bg-bg-btn-secondary flex flex-col gap-6"
      }
    >
      {/* Navbar - Fixed con transición suave */}
      <div
        className={`fixed top-0 left-0 right-0 z-50 px-4 pt-4 bg-transparent transition-transform duration-300 ${
          showNavbar ? "translate-y-0" : "-translate-y-full"
        }`}
      >
        <div className="block md:hidden animate-fade-in">
          <MCNavbarMobile />
        </div>

        <div className="hidden md:block animate-fade-in">
          <MCNavbar />
        </div>
      </div>

      {/* Spacer para compensar el navbar fixed */}
      <div className="h-[60px] md:h-[80px] flex-shrink-0" />

      {/* Content */}
      <div className={isChatPage ? "flex-1 overflow-hidden" : "w-full h-full"}>
        <Outlet />
      </div>
    </div>
  );
}

export default DashboardLayout;
