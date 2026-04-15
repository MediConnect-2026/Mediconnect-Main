import { useState, useCallback, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { useAppStore } from "@/stores/useAppStore";
import { useGlobalUIStore } from "@/stores/useGlobalUIStore";
import { useLogout } from "@/lib/hooks/useLogout";
import { Sheet, SheetContent } from "@/shared/ui/sheet";
import { Avatar, AvatarFallback, AvatarImage } from "@/shared/ui/avatar";
import { MCUserAvatar } from "../userMenu/MCUserAvatar";
import {
  User,
  Pencil,
  Languages,
  Sun,
  Moon,
  Settings,
  Shield,
  LogOut,
  ChevronRight,
  ChevronLeft,
  FileCheck,
  Inbox,
  Check,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { ROUTES } from "@/router/routes";
import type { Theme } from "@/stores/useGlobalUISlice";
import {
  getUserFullName,
  getUserInitials,
  getUserAvatar,
} from "@/services/auth/auth.types";
import MCSheetProfile from "@/shared/navigation/userMenu/editProfile/MCSheetProfile";
import { emitInsuranceChanged } from "@/lib/events/insuranceEvents";

interface MCMobileUserMenuSheetProps {
  /** Cierra el Sheet padre (el menú de navegación) */
  onCloseParent: () => void;
}

export function MCSheetMobile({ onCloseParent }: MCMobileUserMenuSheetProps) {
  const { t } = useTranslation("common");
  const navigate = useNavigate();
  const logoutUser = useLogout();

  // ── Stores ──────────────────────────────────────────────────────────────────
  const user = useAppStore((state) => state.user);
  const language = useGlobalUIStore((state) => state.language);
  const setLanguage = useGlobalUIStore((state) => state.setLanguage);
  const theme = useGlobalUIStore((state) => state.theme);
  const setTheme = useGlobalUIStore((state) => state.setTheme);

  // ── Estado local ─────────────────────────────────────────────────────────────
  const [menuOpen, setMenuOpen] = useState(false);
  const [langSheetOpen, setLangSheetOpen] = useState(false);
  const [themeSheetOpen, setThemeSheetOpen] = useState(false);
  const [editProfileOpen, setEditProfileOpen] = useState(false);
  const themeButtonRef = useRef<HTMLButtonElement>(null);

  // ── User data ────────────────────────────────────────────────────────────────
  const avatar = getUserAvatar(user) || "";
  const name = getUserFullName(user);
  const email = user?.email || "";
  const initials = getUserInitials(user);
  const userRole = user?.rol || "PATIENT";
  const userId = user?.id || 0;

  const getProfileRoute = () => {
    switch (userRole) {
      case "DOCTOR":
        return `/doctor/profile/${userId}`;
      case "CENTER":
        return "/center/profile";
      default:
        return "/patient/profile";
    }
  };

  // ── Helpers ──────────────────────────────────────────────────────────────────
  const closeAll = useCallback(() => {
    setMenuOpen(false);
    onCloseParent();
  }, [onCloseParent]);

  const goTo = useCallback(
    (path: string) => {
      navigate(path);
      closeAll();
    },
    [navigate, closeAll],
  );

  const handleLogout = useCallback(() => {
    closeAll();
    logoutUser();
  }, [closeAll, logoutUser]);

  const handleThemeChange = useCallback(
    async (newTheme: Theme) => {
      if (!document.startViewTransition) {
        setTheme(newTheme);
        return;
      }
      const btn = themeButtonRef.current;
      await document.startViewTransition(() => setTheme(newTheme)).ready;
      if (btn) {
        const { top, left, width, height } = btn.getBoundingClientRect();
        const x = left + width / 2;
        const y = top + height / 2;
        const maxR = Math.hypot(
          Math.max(left, innerWidth - left),
          Math.max(top, innerHeight - top),
        );
        document.documentElement.animate(
          {
            clipPath: [
              `circle(0px at ${x}px ${y}px)`,
              `circle(${maxR}px at ${x}px ${y}px)`,
            ],
          },
          {
            duration: 500,
            easing: "ease-in-out",
            pseudoElement: "::view-transition-new(root)",
          },
        );
      }
    },
    [setTheme],
  );

  // ── Datos de opciones ────────────────────────────────────────────────────────
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
        icon: <Sun className="w-5 h-5" />,
      },
      {
        value: "dark",
        label: t("userMenu.themeDark", { defaultValue: "Dark" }),
        icon: <Moon className="w-5 h-5" />,
      },
    ];

  const currentLang = languages.find((l) => l.code === language);
  const currentTheme = themeOptions.find((o) => o.value === theme);

  // ── Sección de items reutilizable ─────────────────────────────────────────────
  const MenuItem = ({
    icon,
    label,
    onClick,
    right,
    destructive = false,
  }: {
    icon: React.ReactNode;
    label: string;
    onClick: () => void;
    right?: React.ReactNode;
    destructive?: boolean;
  }) => (
    <button
      onClick={onClick}
      className={cn(
        "w-full flex items-center gap-4 px-4 py-3.5 rounded-xl transition-all duration-150 active:scale-[0.98] text-left",
        destructive
          ? "text-red-600 hover:bg-red-500/10 dark:hover:bg-red-500/20"
          : "text-foreground hover:bg-accent/70",
      )}
    >
      <span
        className={cn(
          "flex-shrink-0",
          destructive ? "text-red-600" : "text-primary/70",
        )}
      >
        {icon}
      </span>
      <span className="flex-1 text-sm font-medium">{label}</span>
      {right && (
        <span className="flex-shrink-0 text-muted-foreground">{right}</span>
      )}
    </button>
  );

  return (
    <>
      {/* ── Trigger: avatar + nombre ─────────────────────────────────────────── */}
      <button
        onClick={() => setMenuOpen(true)}
        className="w-full flex items-center gap-3 p-2 rounded-xl hover:bg-accent/60 active:scale-[0.98] transition-all duration-150 text-left"
      >
        <div className="flex-shrink-0">
          {avatar ? (
            <Avatar className="h-12 w-12 rounded-full shadow-md">
              <AvatarImage src={avatar} alt={name} className="object-cover" />
              <AvatarFallback>{initials}</AvatarFallback>
            </Avatar>
          ) : (
            <MCUserAvatar name={name} size={48} square={false} />
          )}
        </div>
        <div className="flex flex-col min-w-0 flex-1 overflow-hidden">
          <span className="text-sm font-semibold text-primary truncate">
            {name}
          </span>
          <span className="text-xs text-muted-foreground truncate">
            {email}
          </span>
        </div>
        <ChevronRight className="w-4 h-4 text-muted-foreground flex-shrink-0" />
      </button>

      {/* ══════════════════════════════════════════════════════════════════════
          Sheet principal del menú de usuario
      ══════════════════════════════════════════════════════════════════════ */}
      <Sheet open={menuOpen} onOpenChange={setMenuOpen}>
        <SheetContent
          side="right"
          className="w-80 p-0 bg-background border-l border-primary/15 flex flex-col"
        >
          {/* Header */}
          <div className="flex items-center gap-3 p-5 border-b border-primary/15">
            <div className="flex-shrink-0">
              {avatar ? (
                <Avatar className="h-12 w-12 rounded-full shadow-md">
                  <AvatarImage
                    src={avatar}
                    alt={name}
                    className="object-cover"
                  />
                  <AvatarFallback>{initials}</AvatarFallback>
                </Avatar>
              ) : (
                <MCUserAvatar name={name} size={48} square={false} />
              )}
            </div>
            <div className="flex flex-col min-w-0 flex-1 overflow-hidden">
              <span className="text-sm font-semibold truncate">{name}</span>
              <span className="text-xs text-muted-foreground truncate">
                {email}
              </span>
            </div>
          </div>

          {/* Items */}
          <div className="flex-1 overflow-y-auto p-3 space-y-1">
            <MenuItem
              icon={<User className="w-5 h-5" />}
              label={t("userMenu.viewProfile")}
              onClick={() => goTo(getProfileRoute())}
            />
            <MenuItem
              icon={<Pencil className="w-5 h-5" />}
              label={t("userMenu.editProfile")}
              onClick={() => {
                setMenuOpen(false);
                setEditProfileOpen(true);
              }}
            />

            {(userRole === "DOCTOR" || userRole === "CENTER") && (
              <>
                <MenuItem
                  icon={<FileCheck className="w-5 h-5" />}
                  label={t("userMenu.verificationDocs")}
                  onClick={() => goTo("/verify-info")}
                />
                <MenuItem
                  icon={<Inbox className="w-5 h-5" />}
                  label={t("userMenu.requests")}
                  onClick={() => goTo("/requests")}
                />
              </>
            )}

            {/* Separador visual */}
            <div className="h-px bg-primary/15 mx-1 my-2" />

            {/* Idioma */}
            <MenuItem
              icon={<Languages className="w-5 h-5" />}
              label={t("userMenu.changeLanguage")}
              onClick={() => setLangSheetOpen(true)}
              right={
                <div className="flex items-center gap-2">
                  {currentLang && (
                    <img
                      src={currentLang.flag}
                      alt={currentLang.label}
                      className="w-5 h-5 rounded-full"
                    />
                  )}
                  <ChevronRight className="w-4 h-4" />
                </div>
              }
            />

            {/* Tema */}
            <MenuItem
              icon={<Sun className="w-5 h-5" />}
              label={t("userMenu.changeTheme")}
              onClick={() => setThemeSheetOpen(true)}
              right={
                <div className="flex items-center gap-2">
                  <span className="text-muted-foreground">
                    {currentTheme?.icon}
                  </span>
                  <ChevronRight className="w-4 h-4" />
                </div>
              }
            />

            <div className="h-px bg-primary/15 mx-1 my-2" />

            <MenuItem
              icon={<Settings className="w-5 h-5" />}
              label={t("userMenu.settings")}
              onClick={() => goTo(ROUTES.SETTINGS.ROOT)}
            />
            <MenuItem
              icon={<Shield className="w-5 h-5" />}
              label={t("userMenu.privacy")}
              onClick={() => goTo(ROUTES.PRIVACY.ROOT)}
            />

            <div className="h-px bg-primary/15 mx-1 my-2" />

            <MenuItem
              icon={<LogOut className="w-5 h-5" />}
              label={t("userMenu.logout")}
              onClick={handleLogout}
              destructive
            />
          </div>
        </SheetContent>
      </Sheet>

      {/* ══════════════════════════════════════════════════════════════════════
          Sub-Sheet: Idioma
      ══════════════════════════════════════════════════════════════════════ */}
      <Sheet open={langSheetOpen} onOpenChange={setLangSheetOpen}>
        <SheetContent
          side="right"
          className="w-72 p-0 bg-background border-l border-primary/15 flex flex-col"
        >
          <div className="flex items-center gap-3 p-5 border-b border-primary/15">
            <button
              onClick={() => setLangSheetOpen(false)}
              className="p-1.5 rounded-lg hover:bg-accent/70 transition-colors"
            >
              <ChevronLeft className="w-5 h-5 text-primary" />
            </button>
            <h2 className="text-base font-semibold">
              {t("userMenu.changeLanguage")}
            </h2>
          </div>
          <div className="p-4 space-y-2">
            {languages.map((lang) => (
              <button
                key={lang.code}
                onClick={() => {
                  setLanguage(lang.code);
                  setLangSheetOpen(false);
                }}
                className={cn(
                  "w-full flex items-center gap-3 p-3.5 rounded-xl border transition-all duration-150 active:scale-[0.98]",
                  language === lang.code
                    ? "border-primary/30 bg-primary/10 text-primary"
                    : "border-transparent hover:bg-accent",
                )}
              >
                <div
                  className={cn(
                    "w-7 h-7 rounded-full overflow-hidden flex-shrink-0",
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
                <span className="flex-1 text-sm font-medium">{lang.label}</span>
                {language === lang.code && (
                  <Check className="w-4 h-4 text-primary flex-shrink-0" />
                )}
              </button>
            ))}
          </div>
        </SheetContent>
      </Sheet>

      {/* ══════════════════════════════════════════════════════════════════════
          Sub-Sheet: Tema
      ══════════════════════════════════════════════════════════════════════ */}
      <Sheet open={themeSheetOpen} onOpenChange={setThemeSheetOpen}>
        <SheetContent
          side="right"
          className="w-72 p-0 bg-background border-l border-primary/15 flex flex-col"
        >
          <div className="flex items-center gap-3 p-5 border-b border-primary/15">
            <button
              onClick={() => setThemeSheetOpen(false)}
              className="p-1.5 rounded-lg hover:bg-accent/70 transition-colors"
            >
              <ChevronLeft className="w-5 h-5 text-primary" />
            </button>
            <h2 className="text-base font-semibold">
              {t("userMenu.changeTheme")}
            </h2>
          </div>
          <div className="p-4 space-y-2">
            {themeOptions.map((opt) => (
              <button
                key={opt.value}
                ref={opt.value === theme ? themeButtonRef : undefined}
                onClick={() => {
                  handleThemeChange(opt.value);
                  setThemeSheetOpen(false);
                }}
                className={cn(
                  "w-full flex items-center gap-3 p-3.5 rounded-xl border transition-all duration-150 active:scale-[0.98]",
                  theme === opt.value
                    ? "border-primary/30 bg-primary/10 text-primary"
                    : "border-transparent hover:bg-accent",
                )}
              >
                <div
                  className={cn(
                    "w-7 h-7 rounded-full flex items-center justify-center flex-shrink-0",
                    theme === opt.value
                      ? "bg-primary/20 text-primary ring-2 ring-primary ring-offset-2 ring-offset-background"
                      : "bg-muted text-muted-foreground",
                  )}
                >
                  {opt.icon}
                </div>
                <span className="flex-1 text-sm font-medium">{opt.label}</span>
                {theme === opt.value && (
                  <Check className="w-4 h-4 text-primary flex-shrink-0" />
                )}
              </button>
            ))}
          </div>
        </SheetContent>
      </Sheet>

      {/* Edit Profile Sheet */}
      <MCSheetProfile
        open={editProfileOpen}
        onOpenChange={setEditProfileOpen}
        onInsurancesChanged={() => emitInsuranceChanged()}
      />
    </>
  );
}

export default MCSheetMobile;
