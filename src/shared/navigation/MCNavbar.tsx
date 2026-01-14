import LogoImg from "@/assets/MediConnectLanding-green.png";
import LogoImgdDark from "@/assets/MediConnectLanding.png";
import MCUserMenu from "./userMenu/MCUserMenu"; // Cambiar import
import {
  NavigationMenu,
  NavigationMenuItem,
  NavigationMenuList,
  NavigationMenuLink,
  navigationMenuTriggerStyle,
} from "@/shared/ui/navigation-menu";
import { useLocation, Link } from "react-router-dom";
import AdminNavbarBell from "../components/AdminNavbarBell";
import { useTranslation } from "react-i18next";
import { useAppStore } from "@/stores/useAppStore";
import { useGlobalUIStore } from "@/stores/useGlobalUIStore";
import { NAVBAR_CONFIG } from "@/config/navbar.config";

function MCNavbar() {
  const location = useLocation();
  const { t } = useTranslation(); // Usar namespace automático
  const theme = useGlobalUIStore((state) => state.theme);
  const role = useAppStore((state) => state.user?.role);

  const effectiveRole = role || "PATIENT";
  const menuConfig = NAVBAR_CONFIG[effectiveRole as keyof typeof NAVBAR_CONFIG];

  // Definir namespace según rol
  const nsMap: Record<string, string> = {
    PATIENT: "patient",
    DOCTOR: "doctor",
    CENTER: "center",
  };
  const ns = nsMap[effectiveRole] || "patient";

  return (
    <nav className="w-full flex items-center justify-between px-4 sm:px-6 lg:px-10 py-3 bg-background rounded-full shadow-md border border-border">
      {/* Logo */}
      <div className="flex items-center gap-2 sm:gap-3">
        <img
          src={theme === "dark" ? LogoImgdDark : LogoImg}
          alt="MediConnect"
          className="h-12 sm:h-16 lg:h-18 w-auto"
        />
      </div>

      {/* Menú dinámico por rol */}
      {menuConfig ? (
        <main className="bg-bg-btn-secondary px-3 sm:px-4 lg:px-6 py-2 rounded-full hidden md:block">
          <NavigationMenu>
            <NavigationMenuList className="gap-2 lg:gap-6">
              {menuConfig.menu?.map((item) => (
                <NavigationMenuItem key={item.href}>
                  <NavigationMenuLink asChild>
                    <Link
                      to={item.href}
                      className={`${navigationMenuTriggerStyle()} text-sm lg:text-base px-2 lg:px-4 py-2 rounded-full hover:rounded-full transition-all ${
                        location.pathname === item.href
                          ? "font-medium bg-primary text-primary-foreground shadow-md"
                          : "font-normal opacity-70 hover:opacity-100"
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
        <AdminNavbarBell />
        <div className="hidden md:block">
          <MCUserMenu />
        </div>
      </div>
    </nav>
  );
}

export default MCNavbar;
