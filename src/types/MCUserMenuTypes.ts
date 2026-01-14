import type { Theme } from "@/stores/useGlobalUISlice";

export interface MCLanguage {
  code: string;
  label: string;
  flag: string;
}

export interface MCThemeOption {
  value: Theme;
  label: string;
  icon: React.ReactNode;
}

export interface MCMobileSubMenuProps {
  title: string;
  children: React.ReactNode;
  isOpen: boolean;
  onClose: () => void;
}

export interface MCUser {
  id?: string;
  name?: string;
  email?: string;
  avatar?: string;
  role?: "PATIENT" | "DOCTOR" | "CENTER";
  createdAt?: Date;
  updatedAt?: Date;
}

export interface MCUserMenuTriggerProps {
  user: MCUser | null;
  userInitials: string;
  open: boolean;
}

export interface MCUserMenuHeaderProps {
  user: MCUser | null;
  userInitials: string;
  isMobile: boolean;
  onClose: () => void;
}

export interface MCLanguageMenuProps {
  language: string;
  setLanguage: (lang: string) => void;
  setSubMenuOpen: (menu: string | null) => void;
  isMobile: boolean;
  t: (key: string) => string;
}

export interface MCThemeMenuProps {
  theme: Theme;
  handleThemeChange: (theme: Theme, event: React.MouseEvent) => void;
  setSubMenuOpen: (menu: string | null) => void;
  isMobile: boolean;
  t: (key: string) => string;
  themeButtonRef: React.RefObject<HTMLDivElement>;
}

export interface MCUserMenuHook {
  open: boolean;
  setOpen: (open: boolean) => void;
  subMenuOpen: string | null;
  setSubMenuOpen: (menu: string | null) => void;
  isEditProfileOpen: boolean;
  setIsEditProfileOpen: (open: boolean) => void;
  themeButtonRef: React.RefObject<HTMLDivElement>;
  t: (key: string) => string;
  isMobile: boolean;
  language: string;
  setLanguage: (lang: string) => void;
  theme: Theme;
  setTheme: (theme: Theme) => void;
  user: MCUser | null;
  userInitials: string;
  handleThemeChange: (theme: Theme, event: React.MouseEvent) => Promise<void>;
  handleLanguageChange: (langCode: string) => void;
  handleThemeChangeAndClose: (
    themeValue: Theme,
    event: React.MouseEvent
  ) => void;
  handleLogout: () => void;
}

export type MCSubMenuType = "language" | "theme" | null;

export type MCUserRole = "PATIENT" | "DOCTOR" | "CENTER";

export type MCThemeValue = "light" | "dark" | "system";

export type MCLanguageCode = "es" | "en";
