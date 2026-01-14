import React, { useState } from "react";
import LogoImg from "@/assets/MediConnectLanding-green.png";
import LogoImgdDark from "@/assets/MediConnectLanding.png";
import MCUserMenu from "./userMenu/MCUserMenu";
import { Button } from "@/shared/ui/button";
import { useLocation, Link, useNavigate } from "react-router-dom";
import AdminNavbarBell from "../components/AdminNavbarBell";
import { useTranslation } from "react-i18next";
import { useAppStore } from "@/stores/useAppStore";
import { useGlobalUIStore } from "@/stores/useGlobalUIStore";
import { NAVBAR_CONFIG } from "@/config/navbar.config";
import { Sheet, SheetContent, SheetTrigger } from "@/shared/ui/sheet";
import { Menu, X, LogOut } from "lucide-react";

function MCMobileNavbar() {
  const [open, setOpen] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();
  const theme = useGlobalUIStore((state) => state.theme);
  const role = useAppStore((state) => state.user?.role);
  const logout = useAppStore((state) => state.logout);

  const effectiveRole = role || "PATIENT";
  const menuConfig = NAVBAR_CONFIG[effectiveRole as keyof typeof NAVBAR_CONFIG];

  // Definir namespace según rol
  const nsMap: Record<string, string> = {
    PATIENT: "patient",
    DOCTOR: "doctor",
    CENTER: "center",
  };
  const ns = nsMap[effectiveRole] || "patient";
  const { t } = useTranslation(ns);

  const handleNavigation = (href: string) => {
    navigate(href);
    setOpen(false);
  };

  const handleLogout = () => {
    logout();
    navigate("/auth/login");
    setOpen(false);
  };

  return (
    <div className="flex items-center justify-between w-full px-6 py-4 md:hidden bg-background rounded-full shadow-md border border-border">
      {/* Logo/Brand */}
      <div className="flex items-center gap-3">
        <img
          src={theme === "dark" ? LogoImgdDark : LogoImg}
          alt="MediConnect"
          className="h-16 w-auto"
        />
      </div>

      {/* Right side - Notifications + Menu */}
      <div className="flex items-center gap-4">
        {/* Notifications Bell */}
        <AdminNavbarBell />

        {/* Mobile Menu */}
        <Sheet open={open} onOpenChange={setOpen}>
          <SheetTrigger asChild>
            <Button
              variant="outline"
              size="icon"
              className="rounded-full bg-bg-btn-secondary border-none shadow-none h-14 w-14 hover:bg-bg-btn-secondary/80 active:scale-95 transition-all duration-200"
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
                <div className="flex items-center gap-3">
                  <img
                    src={theme === "dark" ? LogoImgdDark : LogoImg}
                    alt="MediConnect"
                    className="h-12 w-auto"
                  />
                </div>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => setOpen(false)}
                  className="rounded-full h-8 w-8 hover:bg-accent/70 focus:bg-accent active:scale-95 transition-all duration-200"
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>

              {/* User Profile Section */}
              <div className="p-6 border-b border-border">
                <MCUserMenu />
              </div>

              {/* Navigation Menu */}
              <div className="flex-1 p-6 overflow-y-auto">
                <nav className="space-y-3">
                  {menuConfig ? (
                    menuConfig.menu?.map((item) => (
                      <Button
                        key={item.href}
                        variant="ghost"
                        className={`w-full justify-start text-left h-12 px-4 rounded-xl transition-all duration-200 active:scale-95 ${
                          location.pathname === item.href
                            ? "bg-primary text-primary-foreground hover:bg-primary focus:bg-primary"
                            : "text-primary hover:bg-accent/70 hover:text-primary focus:bg-accent"
                        }`}
                        onClick={() => handleNavigation(item.href)}
                      >
                        {t(`navbar.${item.label.toLowerCase()}`)}
                      </Button>
                    ))
                  ) : (
                    <div className="bg-yellow-100 px-4 py-2 rounded-full text-sm">
                      No hay menú para el rol: {role || "sin rol"}
                    </div>
                  )}
                </nav>
              </div>

              {/* Footer - Logout Button */}
              <div className="p-6 border-t border-border">
                <Button
                  variant="ghost"
                  onClick={handleLogout}
                  className="w-full justify-start text-left h-12 px-4 rounded-xl transition-all duration-200 active:scale-95 text-red-600 hover:bg-red-600/10 hover:text-red-600 focus:bg-red-600/15 focus:text-red-600 [&_svg]:!text-red-600 dark:hover:bg-red-600/20 dark:hover:text-red-500 dark:focus:bg-red-600/30 dark:focus:text-red-500"
                >
                  <LogOut className="w-4 h-4 mr-2" />
                  {t("userMenu.logout", { ns: "dashboard" })}
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
