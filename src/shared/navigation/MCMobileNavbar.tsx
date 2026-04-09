import { useState } from "react";
import MCUserMenu from "./userMenu/MCUserMenu";
import { Button } from "@/shared/ui/button";
import { useLocation, Link, useNavigate } from "react-router-dom";
import NavbarBell from "../components/NavbarBell";
import { useTranslation } from "react-i18next";
import { useAppStore } from "@/stores/useAppStore";
import { useGlobalUIStore } from "@/stores/useGlobalUIStore";
import { useLogout } from "@/lib/hooks/useLogout";
import { NAVBAR_CONFIG } from "@/config/navbar.config";
import { Sheet, SheetContent, SheetTrigger } from "@/shared/ui/sheet";
import { Menu, X, LogOut, Search, MessageCircle } from "lucide-react";

function MCMobileNavbar() {
  const [open, setOpen] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();
  const theme = useGlobalUIStore((state) => state.theme);
  const role = useAppStore((state) => state.user?.rol);
  const logoutUser = useLogout();

  // Obtener el total de mensajes no leídos desde el estado global directamente
  const unreadMessagesCount = useAppStore((state) => state.globalUnreadCount);

  const effectiveRole = role || "PATIENT";
  const menuConfig = NAVBAR_CONFIG[effectiveRole as keyof typeof NAVBAR_CONFIG];

  // ✅ usar namespace "common" (no "patient") para que funcione en todos los roles
  const { t } = useTranslation("common");

  const handleNavigation = (href: string) => {
    navigate(href);
    setOpen(false);
  };

  const handleLogout = () => {
    setOpen(false);
    logoutUser();
  };

  return (
    <div className="flex items-center justify-between w-full px-6 py-4 md:hidden bg-background rounded-full shadow-md border border-border">
      {/* Logo */}
      <div className="flex items-center gap-3">
        <img
          src={
            theme === "dark"
              ? "https://res.cloudinary.com/dy2wtanhl/image/upload/v1771637881/MediConnectLanding_ryopcw.png"
              : "https://res.cloudinary.com/dy2wtanhl/image/upload/v1771637879/MediConnectLanding-green_trpgvu.png"
          }
          alt="MediConnect"
          className="h-16 w-auto"
        />
      </div>

      {/* Right side - icons + menu */}
      <div className="flex items-center gap-2">
        {/* Search */}
        <Link
          to="/search"
          className={`relative rounded-full p-2.5 transition-transform duration-300 h-11 w-11 flex items-center justify-center group
            hover:bg-accent/70 text-primary
            ${location.pathname === "/search" ? "bg-primary text-primary-foreground" : "bg-bg-btn-secondary"}
          `}
        >
          <Search
            className={`h-6 w-6 transition-colors duration-300 stroke-[1.5px] group-hover:text-primary ${location.pathname === "/search"
              ? "text-background"
              : "text-primary/70"
              }`}
          />
        </Link>

        {/* Messages */}
        <Link
          to="/chat"
          className={`relative rounded-full p-2.5 transition-transform duration-300 h-11 w-11 flex items-center justify-center group
            hover:bg-accent/70 text-primary
            ${location.pathname.startsWith("/chat") ? "bg-primary text-primary-foreground" : "bg-bg-btn-secondary"}
          `}
        >
          <MessageCircle
            className={`h-6 w-6 transition-colors duration-300 stroke-[1.5px] group-hover:text-primary ${location.pathname.startsWith("/chat")
              ? "text-background"
              : "text-primary/70"
              }`}
          />
          {unreadMessagesCount > 0 && (
            <span className="absolute top-0 right-0 flex h-4 w-4 items-center justify-center rounded-full bg-red-500 text-[10px] font-bold text-white shadow-sm ring-2 ring-background">
              {unreadMessagesCount > 99 ? "99+" : unreadMessagesCount}
            </span>
          )}
        </Link>

        {/* Notifications Bell */}
        <NavbarBell />

        {/* Mobile Menu Sheet */}
        <Sheet open={open} onOpenChange={setOpen}>
          <SheetTrigger asChild>
            <Button
              variant="outline"
              size="icon"
              className="rounded-full bg-bg-btn-secondary border-none shadow-none h-11 w-11 p-2.5 hover:bg-bg-btn-secondary/80 active:scale-95 transition-all duration-200"
            >
              <Menu className="h-6 w-6 text-primary" />
            </Button>
          </SheetTrigger>

          <SheetContent
            side="right"
            className="w-80 p-0 bg-background border-l border-border"
          >
            <div className="flex flex-col h-full">
              {/* Header */}
              <div className="flex items-center justify-between p-6 border-b border-border">
                <img
                  src={
                    theme === "dark"
                      ? "https://res.cloudinary.com/dy2wtanhl/image/upload/v1771637881/MediConnectLanding_ryopcw.png"
                      : "https://res.cloudinary.com/dy2wtanhl/image/upload/v1771637879/MediConnectLanding-green_trpgvu.png"
                  }
                  alt="MediConnect"
                  className="h-12 w-auto"
                />
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => setOpen(false)}
                  className="rounded-full h-8 w-8 hover:bg-accent/70 focus:bg-accent active:scale-95 transition-all duration-200"
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>

              {/* User Profile */}
              <div className="p-6 border-b border-border">
                <div className="mt-3 min-w-0 overflow-hidden">
                  <MCUserMenu />
                </div>
              </div>

              {/* Navigation */}
              <div className="flex-1 p-6 overflow-y-auto">
                <nav className="space-y-3">
                  {menuConfig ? (
                    menuConfig.menu?.map((item) => (
                      <Button
                        key={item.href}
                        variant="ghost"
                        className={`w-full justify-start text-left h-12 px-4 rounded-xl transition-all duration-200 active:scale-95 ${location.pathname === item.href
                          ? "bg-primary text-primary-foreground hover:bg-primary focus:bg-primary"
                          : "text-primary hover:bg-accent/70 hover:text-primary focus:bg-accent"
                          }`}
                        onClick={() => handleNavigation(item.href)}
                      >
                        {/* ✅ común para todos los roles, con fallback al label */}
                        {t(`navbar.${item.label}`, {
                          defaultValue: item.label,
                        })}
                      </Button>
                    ))
                  ) : (
                    <div className="bg-yellow-100 px-4 py-2 rounded-full text-sm">
                      {t("navbar.noMenuRole")}: {role ?? t("navbar.noRole")}
                    </div>
                  )}
                </nav>
              </div>

              {/* Footer — Logout */}
              <div className="p-6 border-t border-border">
                <Button
                  variant="ghost"
                  onClick={handleLogout}
                  className="w-full justify-start text-left h-12 px-4 rounded-xl transition-all duration-200 active:scale-95 text-red-600 hover:bg-red-600/10 hover:text-red-600 focus:bg-red-600/15 focus:text-red-600 [&_svg]:!text-red-600 dark:hover:bg-red-600/20 dark:hover:text-red-500 dark:focus:bg-red-600/30 dark:focus:text-red-500"
                >
                  <LogOut className="w-4 h-4 mr-2 shrink-0" />
                  <span className="truncate">{t("userMenu.logout")}</span>
                </Button>
              </div>
            </div>
          </SheetContent>
        </Sheet>
      </div>
    </div>
  );
}

export default MCMobileNavbar;
