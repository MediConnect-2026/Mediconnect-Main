import React from "react";
import LogoImg from "@/assets/MediConnectLanding-green.png";
import LogoImgDark from "@/assets/MediConnectLanding.png";
import { MCUserMenuWrapper } from "./userMenu";
import {
  NavigationMenu,
  NavigationMenuItem,
  NavigationMenuList,
  NavigationMenuLink,
  navigationMenuTriggerStyle,
} from "@/shared/ui/navigation-menu";
import { useLocation } from "react-router-dom";
import { useAppStore } from "@/stores/useAppStore";
import { NAVBAR_CONFIG } from "@/config/navbar.config";
import type { UserRole } from "@/stores/useAuthSlice";
import { useGlobalUIStore } from "@/stores/useGlobalUIStore";
function MCNavbar() {
  const location = useLocation();
  const theme = useGlobalUIStore((state) => state.theme);
  const user = useAppStore((state) => state.user);

  // Default to PATIENT if no user role is set
  const userRole: UserRole = user?.role || "PATIENT";
  const config = NAVBAR_CONFIG[userRole];

  return (
    <nav className="w-full flex items-center justify-between px-4 sm:px-6 lg:px-10 py-3 bg-background rounded-full shadow-md border border-border">
      {/* Logo */}
      <div className="flex items-center gap-2 sm:gap-3">
        <img
          src={theme === "dark" ? LogoImgDark : LogoImg}
          alt="MediConnect"
          className="h-12 sm:h-16 lg:h-18 w-auto"
        />
      </div>

      {/* Main Navigation */}
      <main className="bg-bg-btn-secondary px-3 sm:px-4 lg:px-6 py-2 rounded-full hidden md:block">
        <NavigationMenu viewport={false}>
          <NavigationMenuList className="gap-2 lg:gap-6">
            {config.menu.map((item, index) => {
              const isActive = location.pathname === item.href;

              return (
                <NavigationMenuItem key={index}>
                  <NavigationMenuLink
                    href={item.href}
                    active={isActive}
                    className={`text-sm lg:text-base px-2 lg:px-4 py-4 lg:py-6 rounded-full hover:rounded-full ${
                      isActive
                        ? "font-medium"
                        : "font-normal opacity-50 hover:opacity-100"
                    }`}
                  >
                    {item.label}
                  </NavigationMenuLink>
                </NavigationMenuItem>
              );
            })}
          </NavigationMenuList>
        </NavigationMenu>
      </main>

      {/* User Menu */}
      <div className="flex items-center gap-2 sm:gap-3">
        <div className="hidden md:block">
          <MCUserMenuWrapper />
        </div>
      </div>
    </nav>
  );
}

export default MCNavbar;
