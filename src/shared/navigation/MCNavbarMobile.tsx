import React, { useState } from "react";
import { Menu, X } from "lucide-react";
import { Button } from "@/shared/ui/button";
import { Sheet, SheetContent, SheetTrigger } from "@/shared/ui/sheet";
import { MCUserMenuWrapper } from "./userMenu";
import LogoImg from "@/assets/MediConnectLanding-green.png";
import LogoImgDark from "@/assets/MediConnectLanding.png";
import { useAppStore } from "@/stores/useAppStore";
import { useLocation, useNavigate } from "react-router-dom";
import { NAVBAR_CONFIG } from "@/config/navbar.config";
import type { UserRole } from "@/stores/useAuthSlice";
import { useGlobalUIStore } from "@/stores/useGlobalUIStore";
function MCNavbarMobile() {
  const [open, setOpen] = useState(false);
  const theme = useGlobalUIStore((state) => state.theme);
  const user = useAppStore((state) => state.user);
  const location = useLocation();
  const navigate = useNavigate();

  // Default to PATIENT if no user role is set
  const userRole: UserRole = user?.role || "PATIENT";
  const config = NAVBAR_CONFIG[userRole];

  const handleNavigation = (route: string) => {
    navigate(route);
    setOpen(false);
  };

  return (
    <div className="flex items-center justify-between w-full px-6 py-4 md:hidden bg-background rounded-full shadow-md border border-border">
      {/* Logo */}
      <div className="flex items-center gap-3">
        <img
          src={theme === "dark" ? LogoImgDark : LogoImg}
          alt="MediConnect"
          className="h-16 w-auto"
        />
      </div>

      {/* Mobile Menu */}
      <div className="flex items-center gap-4">
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
                    src={theme === "dark" ? LogoImgDark : LogoImg}
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
                <MCUserMenuWrapper />
              </div>

              {/* Navigation Menu */}
              <div className="flex-1 p-6 overflow-y-auto">
                <nav className="space-y-3">
                  {config.menu.map((item, index) => {
                    const isActive = location.pathname === item.href;

                    return (
                      <Button
                        key={index}
                        variant="ghost"
                        className={`w-full justify-start text-left h-12 px-4 rounded-xl transition-all duration-200 active:scale-95 ${
                          isActive
                            ? "bg-primary text-primary-foreground hover:bg-primary focus:bg-primary"
                            : "text-primary hover:bg-accent/70 hover:text-primary focus:bg-accent"
                        }`}
                        onClick={() => handleNavigation(item.href)}
                      >
                        {item.label}
                      </Button>
                    );
                  })}
                </nav>
              </div>
            </div>
          </SheetContent>
        </Sheet>
      </div>
    </div>
  );
}

export default MCNavbarMobile;
