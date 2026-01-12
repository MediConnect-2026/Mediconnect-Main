import { type StateCreator } from "zustand";
import i18n from "../i18n/config";

export type Theme = "light" | "dark" | "system";
export type ResolvedTheme = "light" | "dark";

const getSystemTheme = (): ResolvedTheme => {
  if (typeof window === "undefined") return "light";
  return window.matchMedia("(prefers-color-scheme: dark)").matches
    ? "dark"
    : "light";
};

export type GlobalUISlice = {
  isloading: boolean;
  setIsLoading: (loading: boolean) => void;
  error: string;
  setError: (error: string) => void;
  theme: Theme;
  resolvedTheme: ResolvedTheme;
  setTheme: (theme: Theme) => void;
  toggleTheme: () => void;
  language: string;
  setLanguage: (lang: string) => void;
  toast: {
    message: string;
    type: "success" | "error" | "info";
    open: boolean;
  };
  setToast: (toast: {
    message: string;
    type: "success" | "error" | "info";
    open: boolean;
  }) => void;
  canAccessPage: boolean;
  allowedPages: string[];
  setAccessPage: (canAccess: boolean, pages: string[]) => void;
  modalOpen: boolean;
  setModalOpen: (isOpen: boolean) => void;
  onboardingStep: number;
  setOnboardingStep: (step: number) => void;
};

export const createGlobalUISlice: StateCreator<GlobalUISlice> = (set, get) => ({
  isloading: false,
  setIsLoading: (loading: boolean) => set({ isloading: loading }),
  error: "",
  setError: (error: string) => set({ error }),
  theme: "light",
  resolvedTheme: getSystemTheme(),
  setTheme: (theme) => {
    set({ theme });
    if (theme === "system") {
      set({ resolvedTheme: getSystemTheme() });
    } else {
      set({ resolvedTheme: theme as ResolvedTheme });
    }
  },
  toggleTheme: () => {
    const current = get().theme;
    let nextTheme: Theme;
    if (current === "light") nextTheme = "dark";
    else if (current === "dark") nextTheme = "system";
    else nextTheme = "light";
    get().setTheme(nextTheme);
  },
  language: "es",
  setLanguage: (lang: string) => {
    i18n.changeLanguage(lang);
    set({ language: lang });
  },
  toast: {
    message: "",
    type: "info",
    open: false,
  },
  setToast: (toast) => set({ toast }),
  canAccessPage: false,
  allowedPages: [],
  setAccessPage: (canAccess, pages) =>
    set({ canAccessPage: canAccess, allowedPages: pages }),
  modalOpen: false,
  setModalOpen: (isOpen: boolean) => set({ modalOpen: isOpen }),
  onboardingStep: 0,
  setOnboardingStep: (step: number) => set({ onboardingStep: step }),
});
