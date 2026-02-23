import { useNavigate } from "react-router-dom";
import { useSequentialShortcuts } from "@/lib/hooks/useSequentialShortcuts";
import {
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuShortcut,
  DropdownMenuSub,
  DropdownMenuSubContent,
  DropdownMenuSubTrigger,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
} from "@/shared/ui/dropdown-menu";
import { Button } from "@/shared/ui/button";

import { MCUserAvatar } from "./MCUserAvatar";
import {
  User,
  Pencil,
  Languages,
  Moon,
  Settings,
  Shield,
  LogOut,
  ChevronDown,
  Sun,
  X,
  FileCheck,
  Inbox,
} from "lucide-react";
import { useTranslation } from "react-i18next";
import type { Theme } from "@/stores/useGlobalUISlice";
import { cn } from "@/lib/utils";
import { ROUTES } from "@/router/routes";

const isMac =
  typeof window !== "undefined" &&
  /Mac|iPod|iPhone|iPad/.test(navigator.platform);
const cmdOrCtrl = isMac ? "⌘" : "Ctrl";

interface UserData {
  name: string;
  email: string;
  avatar: string;
  initials: string;
  roleLabel: string;
}

interface MCUserMenuContentProps {
  userData: UserData;
  open: boolean;
  setOpen: (open: boolean) => void;
  subMenuOpen: string | null;
  setSubMenuOpen: (menu: string | null) => void;
  isEditProfileOpen: boolean;
  setIsEditProfileOpen: (open: boolean) => void;
  language: string;
  setLanguage: (lang: string) => void;
  theme: Theme;
  handleThemeChange: (theme: Theme, event: React.MouseEvent) => void;
  themeButtonRef: React.RefObject<HTMLDivElement | null>;
  isMobile: boolean;
  userRole: string;
}

export function MCUserMenuContent({
  userData,
  open,
  setOpen,
  subMenuOpen,
  setSubMenuOpen,
  setIsEditProfileOpen,
  language,
  setLanguage,
  theme,
  handleThemeChange,
  themeButtonRef,
  isMobile,
  userRole,
}: MCUserMenuContentProps) {
  const { t } = useTranslation("common");
  const navigate = useNavigate();

  const handleLanguageChange = (langCode: string) => {
    setLanguage(langCode);
    if (isMobile) {
      setSubMenuOpen(null);
    }
  };

  const handleThemeChangeAndClose = (
    themeValue: Theme,
    event: React.MouseEvent,
  ) => {
    handleThemeChange(themeValue, event);
    if (isMobile) {
      setSubMenuOpen(null);
    }
  };

  // Función para obtener la ruta de perfil según el rol
  const getProfileRoute = (): string => {
    switch (userRole) {
      case "DOCTOR":
        return "/doctor/profile";
      case "CENTER":
        return "/center/profile";
      case "PATIENT":
        return "/patient/profile";
      default:
        return "/patient/profile";
    }
  };

  // Setup sequential shortcuts
  const shortcuts = [
    {
      sequence: ["ctrl+e"],
      action: () => setIsEditProfileOpen(true),
    },
    {
      sequence: ["g", "p"],
      action: () => navigate(getProfileRoute()),
    },
    {
      sequence: ["o", "s"],
      action: () => {
        navigate(ROUTES.SETTINGS.ROOT);
        setOpen(false);
      },
    },
    {
      sequence: ["o", "p"],
      action: () => {
        navigate(ROUTES.PRIVACY.ROOT);
        setOpen(false);
      },
    },
    {
      sequence: ["g", "a"],
      action: () => {
        console.log("Logout triggered");
      },
    },
    ...(userRole === "DOCTOR" || userRole === "CENTER"
      ? [
          {
            sequence: ["g", "d"],
            action: () => {
              console.log("Navigate to verification docs");
            },
          },
        ]
      : []),
    ...(userRole === "DOCTOR"
      ? [
          {
            sequence: ["g", "r"],
            action: () => {
              console.log("Navigate to requests");
            },
          },
        ]
      : []),
  ];

  useSequentialShortcuts({
    shortcuts,
    enabled: true,
    timeout: 2000,
  });

  const languages = [
    {
      code: "es",
      label: t("userMenu.spanish", { defaultValue: "Español" }),
      flag: "https://res.cloudinary.com/dy2wtanhl/image/upload/v1771637850/flag-spain_u9cses.png",
    },
    {
      code: "en",
      label: t("userMenu.english", { defaultValue: "English" }),
      flag: "https://res.cloudinary.com/dy2wtanhl/image/upload/v1771637851/flag-usa_ubewc7.png",
    },
  ];

  const themeOptions: { value: Theme; label: string; icon: React.ReactNode }[] =
    [
      {
        value: "light",
        label: t("userMenu.themeLight", { defaultValue: "Light" }),
        icon: <Sun className="w-4 h-4" />,
      },
      {
        value: "dark",
        label: t("userMenu.themeDark", { defaultValue: "Dark" }),
        icon: <Moon className="w-4 h-4" />,
      },
    ];

  // Componente para submenú móvil
  const MobileSubMenu = ({
    title,
    children,
    isOpen,
    onClose,
  }: {
    title: string;
    children: React.ReactNode;
    isOpen: boolean;
    onClose: () => void;
  }) => {
    if (!isOpen) return null;

    return (
      <div className="fixed inset-0 z-50 bg-background">
        <div className="flex items-center justify-between p-4 border-b">
          <h2 className="text-lg font-semibold">{title}</h2>
          <Button
            variant="ghost"
            size="sm"
            onClick={onClose}
            className="p-1 h-8 w-8"
          >
            <X className="w-4 h-4" />
          </Button>
        </div>
        <div className="p-4">{children}</div>
      </div>
    );
  };

  type RoleSpecificItem = {
    icon: React.ReactNode;
    label: string;
    shortcut?: string;
    action: (e: Event) => void;
    badge?: string;
  };

  const getRoleSpecificItems = (): RoleSpecificItem[] => {
    const baseItems: RoleSpecificItem[] = [
      {
        icon: <User className="w-4 h-4 mr-2" />,
        label: t("userMenu.viewProfile"),
        shortcut: !isMobile ? "G → P" : undefined,
        action: (e: Event) => {
          e.preventDefault();
          navigate(getProfileRoute());
        },
      },
      {
        icon: <Pencil className="w-4 h-4 mr-2" />,
        label: t("userMenu.editProfile"),
        shortcut: !isMobile ? `${cmdOrCtrl}+E` : undefined,
        action: (e: Event) => {
          e.preventDefault();
          setIsEditProfileOpen(true);
        },
      },
    ];

    if (userRole === "DOCTOR" || userRole === "CENTER") {
      baseItems.push({
        icon: <FileCheck className="w-4 h-4 mr-2" />,
        label: t("userMenu.verificationDocs"),
        shortcut: !isMobile ? "G → D" : undefined,
        action: () => navigate("/verify-info"),
      });
      baseItems.push({
        icon: <Inbox className="w-4 h-4 mr-2" />,
        label: t("userMenu.requests"),
        shortcut: !isMobile ? "G → R" : undefined,
        action: () => navigate("/requests"),
      });
    }

    return baseItems;
  };

  const roleSpecificItems = getRoleSpecificItems();
  const currentLang = languages.find((lang) => lang.code === language);
  const currentThemeOption = themeOptions.find(
    (option) => option.value === theme,
  );

  return (
    <>
      <DropdownMenuContent
        className={cn(
          "rounded-2xl bg-background border border-primary/20",
          isMobile ? "w-[calc(100vw-2rem)] max-w-sm" : "w-80",
        )}
        align="end"
        side="bottom"
        sideOffset={isMobile ? 12 : 8}
        avoidCollisions={true}
      >
        {/* ── Header: avatar fijo + texto truncado ── */}
        <DropdownMenuLabel className="px-4 py-3">
          <div className="flex items-center gap-3 min-w-0">
            {/* Avatar: tamaño fijo igual en mobile y desktop */}
            <div className="flex-shrink-0">
              <MCUserAvatar name={userData.name} size={44} square={false} />
            </div>

            {/* Texto: ocupa el espacio restante con truncado */}
            <div className="flex flex-col items-start leading-tight text-left min-w-0 flex-1 overflow-hidden">
              <span className="font-semibold text-sm w-full truncate">
                {userData.name}
              </span>
              <span
                className="font-normal text-xs w-full truncate text-muted-foreground"
                title={userData.email}
              >
                {userData.email}
              </span>
            </div>
          </div>
        </DropdownMenuLabel>

        <DropdownMenuSeparator className="bg-primary/15" />

        {/* Ítems específicos por rol */}
        <DropdownMenuGroup>
          {roleSpecificItems.map((item, index) => (
            <DropdownMenuItem key={index} onSelect={(e) => item.action(e)}>
              {item.icon}
              <span className="flex-1">{item.label}</span>
              {item.badge && (
                <span className="ml-2 px-1.5 py-0.5 text-xs bg-primary text-primary-foreground rounded-full">
                  {item.badge}
                </span>
              )}
              {item.shortcut && (
                <DropdownMenuShortcut>{item.shortcut}</DropdownMenuShortcut>
              )}
            </DropdownMenuItem>
          ))}
        </DropdownMenuGroup>

        {/* Menú de idioma y tema */}
        <DropdownMenuGroup>
          {/* Idioma */}
          {isMobile ? (
            <DropdownMenuItem
              onClick={() => setSubMenuOpen("language")}
              className="flex items-center justify-between"
            >
              <div className="flex items-center">
                <Languages className="w-4 h-4 mr-2" />
                {t("userMenu.changeLanguage")}
              </div>
              <div className="flex items-center gap-2">
                {currentLang && (
                  <img
                    src={currentLang.flag}
                    alt={currentLang.label}
                    className="w-4 h-4 rounded-full"
                  />
                )}
                <ChevronDown className="w-3 h-3" />
              </div>
            </DropdownMenuItem>
          ) : (
            <DropdownMenuSub>
              <DropdownMenuSubTrigger>
                <Languages className="w-4 h-4 mr-2" />
                {t("userMenu.changeLanguage")}
              </DropdownMenuSubTrigger>
              <DropdownMenuSubContent className="w-56 p-1 bg-background border border-primary/20 rounded-xl shadow-lg">
                <DropdownMenuRadioGroup
                  value={language}
                  onValueChange={setLanguage}
                >
                  {languages.map((lang) => (
                    <DropdownMenuRadioItem key={lang.code} value={lang.code}>
                      <img
                        src={lang.flag}
                        alt={lang.label}
                        className="w-5 h-5 rounded-full"
                      />
                      {lang.label}
                    </DropdownMenuRadioItem>
                  ))}
                </DropdownMenuRadioGroup>
              </DropdownMenuSubContent>
            </DropdownMenuSub>
          )}

          {/* Tema */}
          {isMobile ? (
            <DropdownMenuItem
              onClick={() => setSubMenuOpen("theme")}
              className="flex items-center justify-between"
              ref={themeButtonRef}
            >
              <div className="flex items-center">
                <Sun className="w-4 h-4 mr-2" />
                {t("userMenu.changeTheme")}
              </div>
              <div className="flex items-center gap-2">
                {currentThemeOption?.icon}
                <ChevronDown className="w-3 h-3" />
              </div>
            </DropdownMenuItem>
          ) : (
            <DropdownMenuSub>
              <DropdownMenuSubTrigger
                className="cursor-pointer"
                ref={themeButtonRef}
              >
                <Sun className="w-4 h-4 mr-2" />
                {t("userMenu.changeTheme")}
              </DropdownMenuSubTrigger>
              <DropdownMenuSubContent className="w-56 p-1 bg-background border border-primary/20 rounded-xl shadow-lg">
                {themeOptions.map((option) => (
                  <DropdownMenuItem
                    key={option.value}
                    onClick={(e) => handleThemeChange(option.value, e)}
                    className={cn(
                      "cursor-pointer flex items-center gap-2",
                      theme === option.value && "text-primary",
                    )}
                  >
                    {theme === option.value && (
                      <span className="absolute left-2 h-1.5 w-1.5 rounded-full bg-primary" />
                    )}
                    <span className="ml-4">{option.icon}</span>
                    {option.label}
                  </DropdownMenuItem>
                ))}
              </DropdownMenuSubContent>
            </DropdownMenuSub>
          )}
        </DropdownMenuGroup>

        {/* Configuración y privacidad */}
        <DropdownMenuGroup>
          <DropdownMenuItem
            onSelect={() => {
              navigate(ROUTES.SETTINGS.ROOT);
              setOpen(false);
            }}
          >
            <Settings className="w-4 h-4 mr-2" />
            {t("userMenu.settings")}
            {!isMobile && <DropdownMenuShortcut>O → S</DropdownMenuShortcut>}
          </DropdownMenuItem>
          <DropdownMenuItem
            onSelect={() => {
              navigate(ROUTES.PRIVACY.ROOT);
              setOpen(false);
            }}
          >
            <Shield className="w-4 h-4 mr-2" />
            {t("userMenu.privacy")}
            {!isMobile && <DropdownMenuShortcut>O → P</DropdownMenuShortcut>}
          </DropdownMenuItem>
        </DropdownMenuGroup>

        <DropdownMenuSeparator className="bg-primary/15" />

        {/* Cerrar sesión */}
        <DropdownMenuItem variant="destructive">
          <LogOut className="w-4 h-4 mr-2" />
          {t("userMenu.logout")}
          {!isMobile && <DropdownMenuShortcut>G → A</DropdownMenuShortcut>}
        </DropdownMenuItem>
      </DropdownMenuContent>

      {/* Submenús móviles */}
      {isMobile && (
        <>
          <MobileSubMenu
            title={t("userMenu.changeLanguage")}
            isOpen={subMenuOpen === "language"}
            onClose={() => setSubMenuOpen(null)}
          >
            <div className="space-y-2">
              {languages.map((lang) => (
                <button
                  key={lang.code}
                  onClick={() => handleLanguageChange(lang.code)}
                  className={cn(
                    "w-full flex items-center gap-3 p-3 rounded-lg transition-colors text-left group",
                    language === lang.code
                      ? "bg-primary/10 text-primary border border-primary/20"
                      : "border border-transparent hover:bg-accent",
                  )}
                >
                  <div
                    className={cn(
                      "relative w-6 h-6 rounded-full overflow-hidden transition-all flex-shrink-0",
                      language === lang.code &&
                        "ring-2 ring-primary ring-offset-2 ring-offset-background",
                    )}
                  >
                    <img
                      src={lang.flag}
                      alt={lang.label}
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <span className="font-medium flex-1">{lang.label}</span>
                  <div
                    className={cn(
                      "w-2 h-2 rounded-full transition-all flex-shrink-0",
                      language === lang.code
                        ? "bg-primary opacity-100"
                        : "bg-transparent opacity-0",
                    )}
                  />
                </button>
              ))}
            </div>
          </MobileSubMenu>

          <MobileSubMenu
            title={t("userMenu.changeTheme")}
            isOpen={subMenuOpen === "theme"}
            onClose={() => setSubMenuOpen(null)}
          >
            <div className="space-y-2">
              {themeOptions.map((option) => (
                <button
                  key={option.value}
                  onClick={(e) => handleThemeChangeAndClose(option.value, e)}
                  className={cn(
                    "w-full flex items-center gap-3 p-3 rounded-lg transition-colors text-left group",
                    theme === option.value
                      ? "bg-primary/10 text-primary border border-primary/20"
                      : "border border-transparent hover:bg-accent",
                  )}
                >
                  <div
                    className={cn(
                      "relative flex items-center justify-center w-6 h-6 rounded-full transition-all flex-shrink-0",
                      theme === option.value
                        ? "bg-primary/20 text-primary ring-2 ring-primary ring-offset-2 ring-offset-background"
                        : "bg-muted text-muted-foreground",
                    )}
                  >
                    {option.icon}
                  </div>
                  <span className="font-medium flex-1">{option.label}</span>
                  <div
                    className={cn(
                      "w-2 h-2 rounded-full transition-all flex-shrink-0",
                      theme === option.value
                        ? "bg-primary opacity-100"
                        : "bg-transparent opacity-0",
                    )}
                  />
                </button>
              ))}
            </div>
          </MobileSubMenu>
        </>
      )}
    </>
  );
}

export default MCUserMenuContent;
