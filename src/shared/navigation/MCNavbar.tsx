import MCUserMenu from "./userMenu/MCUserMenu"; // Cambiar import
import { Search, MessageCircle } from "lucide-react";
import {
  NavigationMenu,
  NavigationMenuItem,
  NavigationMenuList,
  NavigationMenuLink,
  navigationMenuTriggerStyle,
} from "@/shared/ui/navigation-menu";
import { Link, useLocation } from "react-router-dom";
import NavbarBell from "../components/NavbarBell";
import { useTranslation } from "react-i18next";
import { useAppStore } from "@/stores/useAppStore";
import { useGlobalUIStore } from "@/stores/useGlobalUIStore";
import { NAVBAR_CONFIG } from "@/config/navbar.config";

function MCNavbar() {
  const location = useLocation();
  const { t } = useTranslation(); // Usar namespace automático
  const theme = useGlobalUIStore((state) => state.theme);
  const role = useAppStore((state) => state.user?.rol);
  // Obtener el total de mensajes no leídos desde el estado global directamente
  const unreadMessagesCount = useAppStore((state) => state.globalUnreadCount);

  const effectiveRole = role || "PATIENT";
  const menuConfig = NAVBAR_CONFIG[effectiveRole as keyof typeof NAVBAR_CONFIG];

  const nsMap: Record<string, string> = {
    PATIENT: "patient",
    DOCTOR: "doctor",
    CENTER: "center",
  };
  const ns = nsMap[effectiveRole] || "patient";
  return (
    <nav className="w-full flex items-center justify-between px-4 sm:px-6 lg:px-10 py-3 bg-background rounded-full shadow-sm border-none border-background ">
      {/* Logo */}
      <div className="flex items-center gap-2 sm:gap-3">
        <img
          src={
            theme === "dark"
              ? "https://res.cloudinary.com/dy2wtanhl/image/upload/v1771637881/MediConnectLanding_ryopcw.png"
              : "https://res.cloudinary.com/dy2wtanhl/image/upload/v1771637879/MediConnectLanding-green_trpgvu.png"
          }
          alt="MediConnect"
          className="h-12 sm:h-16 lg:h-18 w-auto"
        />
      </div>

      {menuConfig ? (
        <main className="bg-bg-btn-secondary px-3 sm:px-4 lg:px-6 py-2 rounded-full hidden md:block">
          <NavigationMenu>
            <NavigationMenuList className="gap-2 lg:gap-6">
              {menuConfig.menu?.map((item) => (
                <NavigationMenuItem key={item.href}>
                  <NavigationMenuLink asChild>
                    <Link
                      to={item.href}
                      className={`${navigationMenuTriggerStyle()} text-sm lg:text-base px-2 lg:px-4 py-2 rounded-full hover:rounded-full transition-all ${location.pathname === item.href
                        ? "font-medium bg-primary text-primary-foreground shadow-md"
                        : "font-normal  opacity-70 hover:opacity-100"
                        }`}
                    >
                      {t(`navbar.${item.label.toLowerCase()}`, { ns })}
                    </Link>
                  </NavigationMenuLink>
                </NavigationMenuItem>
              ))}
            </NavigationMenuList>
          </NavigationMenu>
        </main>
      ) : (
        <div className="bg-yellow-100 px-4 py-2 rounded-full text-sm">
          No hay menú para el rol: {role || "sin rol"}
        </div>
      )}

      {/* User Menu */}
      <div className="flex items-center gap-2 sm:gap-3">
        <Link
          to="/search"
          className={`relative rounded-full p-3 transition-transform duration-300 h-14 w-14 flex items-center justify-center group
            hover:bg-accent/70 text-primary
            ${location.pathname === "/search" ? "bg-primary text-primary-foreground" : "bg-bg-btn-secondary"}
          `}
        >
          <Search
            className={`h-7 w-7 transition-colors duration-300 stroke-[1.5px] group-hover:text-primary ${location.pathname === "/search"
              ? "text-background"
              : "text-primary/70"
              }`}
          />
        </Link>
        {/* Mensajes */}
        <Link
          to="/chat"
          className={`relative rounded-full p-3 transition-transform duration-300 h-14 w-14 flex items-center justify-center group
            hover:bg-accent/70 text-primary
            ${location.pathname.startsWith("/chat") ? "bg-primary text-primary-foreground" : "bg-bg-btn-secondary"}
          `}
        >
          <MessageCircle
            className={`h-7 w-7 transition-colors duration-300 stroke-[1.5px] group-hover:text-primary ${location.pathname.startsWith("/chat")
              ? "text-background"
              : "text-primary/70"
              }`}
          />
          {unreadMessagesCount > 0 && (
            <span className="absolute top-1.5 right-1.5 flex h-4 w-4 items-center justify-center rounded-full bg-red-500 text-[10px] font-bold text-white shadow-sm ring-2 ring-background">
              {unreadMessagesCount > 99 ? "99+" : unreadMessagesCount}
            </span>
          )}
        </Link>
        <NavbarBell />
        <div className="hidden md:block">
          <MCUserMenu />
        </div>
      </div>
    </nav>
  );
}

export default MCNavbar;
