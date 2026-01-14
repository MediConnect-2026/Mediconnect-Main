import { Outlet } from "react-router-dom";
import MCNavbar from "@/shared/navigation/MCNavbar";
function DashboardLayout() {
  return (
    <div className="p-8 bg-bg-btn-secondary  min-h-screen  flex flex-col gap-6">
      {/* Navbar móvil solo visible en pantallas pequeñas */}
      <div className="block md:hidden sticky top-0 z-30 animate-fade-in">
        movil
      </div>
      {/* Navbar escritorio solo visible en pantallas medianas o mayores */}
      <div className="hidden md:block sticky top-5 z-30 animate-fade-in">
        <MCNavbar />
      </div>
      <div className="w-fill h-full">
        <Outlet />
      </div>
    </div>
  );
}

export default DashboardLayout;
