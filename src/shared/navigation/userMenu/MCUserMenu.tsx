import { useState, useCallback, useRef, useEffect } from "react";
import { useTranslation } from "react-i18next";
import { useGlobalUIStore } from "@/stores/useGlobalUIStore";
import { useAppStore } from "@/stores/useAppStore";
import { useIsMobile } from "@/lib/hooks/useIsMobile";
import type { Theme } from "@/stores/useGlobalUISlice";
import MCSheetProfile from "@/shared/navigation/userMenu/editProfile/MCSheetProfile";
import MCUserMenuTrigger from "./MCUserMenuTrigger";
import MCUserMenuContent from "./MCUserMenuContent";
import { DropdownMenu } from "@/shared/animate-ui/components/radix/dropdown-menu";
import { getUserFullName, getUserInitials, getUserAvatar } from "@/services/auth/auth.types";
import { emitInsuranceChanged } from "@/lib/events/insuranceEvents";

export function MCUserMenu() {
  // Estados locales
  const [open, setOpen] = useState(false);
  const [subMenuOpen, setSubMenuOpen] = useState<string | null>(null);
  const [isEditProfileOpen, setIsEditProfileOpen] = useState(false);

  // Hooks globales
  const { t } = useTranslation("common");
  const language = useGlobalUIStore((state) => state.language);
  const setLanguage = useGlobalUIStore((state) => state.setLanguage);
  const theme = useGlobalUIStore((state) => state.theme);
  const setTheme = useGlobalUIStore((state) => state.setTheme);
  const user = useAppStore((state) => state.user);
  const isMobile = useIsMobile();

  // Referencias
  const themeButtonRef = useRef<HTMLDivElement>(null);

  const getUserData = () => {
    const avatar = getUserAvatar(user) || "";
    
    switch (user?.rol) {
      case "PATIENT":
        return {
          userId: user.id,
          name: getUserFullName(user),
          email: user.email,
          initials: getUserInitials(user),
          roleLabel: t("userMenu.patient"),
          avatar,
        };
      case "DOCTOR":
        return {
          userId: user.id,
          name: getUserFullName(user),
          email: user.email,
          avatar,
          initials: getUserInitials(user),
          roleLabel: t("userMenu.doctor"),
        };
      case "CENTER":
        return {
          userId: user.id,
          name: getUserFullName(user),
          email: user.email,
          avatar,
          initials: getUserInitials(user),
          roleLabel: t("userMenu.center"),
        };
      default:
        return {
          userId: user?.id || 0,
          name: getUserFullName(user),
          email: user?.email || "admin@example.com",
          avatar,
          initials: getUserInitials(user),
          roleLabel: t("userMenu.admin"),
        };
    }
  };

  const userData = getUserData();
  
  // Función para manejar cambio de tema
  const handleThemeChange = useCallback(
    async (newTheme: Theme, event: React.MouseEvent) => {
      const target = event.currentTarget as HTMLElement;

      if (!document.startViewTransition) {
        setTheme(newTheme);
        return;
      }

      await document.startViewTransition(() => {
        setTheme(newTheme);
      }).ready;

      const { top, left, width, height } = target.getBoundingClientRect();
      const x = left + width / 2;
      const y = top + height / 2;
      const maxRadius = Math.hypot(
        Math.max(left, window.innerWidth - left),
        Math.max(top, window.innerHeight - top),
      );

      document.documentElement.animate(
        {
          clipPath: [
            `circle(0px at ${x}px ${y}px)`,
            `circle(${maxRadius}px at ${x}px ${y}px)`,
          ],
        },
        {
          duration: 500,
          easing: "ease-in-out",
          pseudoElement: "::view-transition-new(root)",
        },
      );
    },
    [setTheme],
  );

  // Atajo de teclado para editar perfil
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === "e") {
        setIsEditProfileOpen(true);
      }
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, []);
  
  // Callback para cuando se modifiquen los seguros en el Sheet
  // Emite un evento global para notificar a otros componentes (como PatientProfilePage)
  const handleInsurancesChanged = useCallback(() => {
    emitInsuranceChanged();
  }, []);

  return (
    <>
      <DropdownMenu open={open} onOpenChange={setOpen}>
        <MCUserMenuTrigger userData={userData} open={open} />

        <MCUserMenuContent
          userData={userData}
          open={open}
          setOpen={setOpen}
          subMenuOpen={subMenuOpen}
          setSubMenuOpen={setSubMenuOpen}
          isEditProfileOpen={isEditProfileOpen}
          setIsEditProfileOpen={setIsEditProfileOpen}
          language={language}
          setLanguage={setLanguage}
          theme={theme}
          handleThemeChange={handleThemeChange}
          themeButtonRef={themeButtonRef}
          isMobile={isMobile}
          userRole={user?.rol || "ADMIN"}
        />
      </DropdownMenu>

      <MCSheetProfile
        open={isEditProfileOpen}
        onOpenChange={setIsEditProfileOpen}
        onInsurancesChanged={handleInsurancesChanged}
      />
    </>
  );
}

export default MCUserMenu;
