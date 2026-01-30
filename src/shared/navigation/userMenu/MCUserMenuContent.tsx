import { useCallback } from "react";
import { useNavigate } from "react-router-dom";
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
import {
  Avatar as UiAvatar,
  AvatarFallback,
  AvatarImage,
} from "@/shared/ui/avatar";
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
  Monitor,
  X,
  FileCheck,
  Inbox,
} from "lucide-react";
import { useTranslation } from "react-i18next";
import flagSpain from "@/assets/flag-spain.png";
import flagUSA from "@/assets/flag-usa.png";
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

  const languages = [
    {
      code: "es",
      label: t("userMenu.spanish", { defaultValue: "Español" }),
      flag: flagSpain,
    },
    {
      code: "en",
      label: t("userMenu.english", { defaultValue: "English" }),
      flag: flagUSA,
    },
  ];

  const themeOptions: { value: Theme; label: string; icon: React.ReactNode }[] =
    [
      {
        value: "light",
        label: t("userMenu.themeLight", { defaultValue: "Light" }),
        icon: <Sun className="w-4 h-4 text-primary" />,
      },
      {
        value: "dark",
        label: t("userMenu.themeDark", { defaultValue: "Dark" }),
        icon: <Moon className="w-4 h-4 text-primary" />,
      },
      {
        value: "system",
        label: t("userMenu.themeSystem", { defaultValue: "System" }),
        icon: <Monitor className="w-4 h-4 text-primary" />,
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

  // Función para obtener ítems específicos por rol
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
        shortcut: !isMobile ? `⇧${cmdOrCtrl}+P` : undefined,
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

    // Agregar ítems específicos por rol
    if (userRole === "DOCTOR" || userRole === "CENTER") {
      baseItems.push({
        icon: <FileCheck className="w-4 h-4 mr-2" />,
        label: t("userMenu.verificationDocs"),
        badge: "1",
        action: () => {},
      });
    }

    if (userRole === "DOCTOR") {
      baseItems.push({
        icon: <Inbox className="w-4 h-4 mr-2" />,
        label: t("userMenu.requests"),
        action: () => {},
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
        align={isMobile ? "end" : "end"}
        side="bottom"
        sideOffset={isMobile ? 12 : 8}
        avoidCollisions={true}
      >
        {/* Header con avatar y datos */}
        <DropdownMenuLabel
          className={cn(
            "flex items-center gap-3",
            isMobile ? "px-3 py-3" : "px-4 py-3",
          )}
        >
          <MCUserAvatar
            name={userData.name}
            size={isMobile ? 40 : 52}
            square={false}
          />
          <div className="flex flex-col items-start leading-tight text-left min-w-0 flex-1">
            <span
              className={cn(
                "font-semibold",
                isMobile ? "text-sm" : "text-base",
              )}
            >
              {userData.name}
            </span>
            <span
              className={cn(
                "font-normal overflow-hidden truncate",
                isMobile ? "text-xs max-w-40" : "text-sm max-w-55",
              )}
              title={userData.email}
            >
              {userData.email}
            </span>
          </div>
          {isMobile && (
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setOpen(false)}
              className="p-1 h-6 w-6 flex-shrink-0"
            >
              <X className="w-3 h-3" />
            </Button>
          )}
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
            {!isMobile && (
              <DropdownMenuShortcut>{cmdOrCtrl}+S</DropdownMenuShortcut>
            )}
          </DropdownMenuItem>
          <DropdownMenuItem
            onSelect={() => {
              navigate(ROUTES.PRIVACY.ROOT);
              setOpen(false);
            }}
          >
            <Shield className="w-4 h-4 mr-2" />
            {t("userMenu.privacy")}
            {!isMobile && (
              <DropdownMenuShortcut>{cmdOrCtrl}+P</DropdownMenuShortcut>
            )}
          </DropdownMenuItem>
        </DropdownMenuGroup>

        <DropdownMenuSeparator className="bg-primary/15" />

        {/* Cerrar sesión */}
        <DropdownMenuItem variant="destructive">
          <LogOut className="w-4 h-4 mr-2" />
          {t("userMenu.logout")}
          {!isMobile && (
            <DropdownMenuShortcut>⇧{cmdOrCtrl}+Q</DropdownMenuShortcut>
          )}
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
                    "w-full flex items-center gap-3 p-3 rounded-lg transition-colors text-left hover:bg-accent",
                    language === lang.code
                      ? "bg-primary/10 text-primary border border-primary/20"
                      : "border border-transparent",
                  )}
                >
                  <img
                    src={lang.flag}
                    alt={lang.label}
                    className="w-6 h-6 rounded-full"
                  />
                  <span className="font-medium">{lang.label}</span>
                  {language === lang.code && (
                    <div className="ml-auto w-2 h-2 rounded-full bg-primary" />
                  )}
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
                    "w-full flex items-center gap-3 p-3 rounded-lg transition-colors text-left hover:bg-accent",
                    theme === option.value
                      ? "bg-primary/10 text-primary border border-primary/20"
                      : "border border-transparent",
                  )}
                >
                  {option.icon}
                  <span className="font-medium">{option.label}</span>
                  {theme === option.value && (
                    <div className="ml-auto w-2 h-2 rounded-full bg-primary" />
                  )}
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
