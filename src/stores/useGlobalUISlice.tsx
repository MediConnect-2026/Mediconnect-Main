import { type StateCreator } from "zustand";
import i18n, { normalizeLanguageCode } from "../i18n/config";

export type Theme = "light" | "dark" | "system";
export type ResolvedTheme = "light" | "dark";

const getSystemTheme = (): ResolvedTheme => {
  if (typeof window === "undefined") return "light";
  return window.matchMedia("(prefers-color-scheme: dark)").matches
    ? "dark"
    : "light";
};

export type VerificationContext =
  | "CHANGE_EMAIL"
  | "CHANGE_PASSWORD"
  | "DELETE_ACCOUNT"
  | null;

export type verficationContextStatus = "PENDING" | "VERIFIED" | "FAILED" | null;

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
    type: "success" | "error" | "info" | "warning";
    open: boolean;
  };
  setToast: (toast: {
    message: string;
    type: "success" | "error" | "info" | "warning";
    open: boolean;
  }) => void;
  clearToast: () => void;
  canAccessPage: boolean;
  allowedPages: { page: string; reason: string }[];
  setAccessPage: (
    canAccess: boolean,
    pages: { page: string; reason: string }[],
    reason: string,
  ) => void;
  modalOpen: boolean;
  setModalOpen: (isOpen: boolean) => void;
  doctorOnboardingStep: number;
  setDoctorOnboardingStep: (step: number) => void;
  onboardingStep: number;
  setOnboardingStep: (step: number) => void;
  verificationContext: VerificationContext;
  setVerificationContext: (context: VerificationContext) => void;
  resetVerificationContext: () => void;
  verificationContextStatus: verficationContextStatus; // <-- NUEVO
  setVerificationContextStatus: (status: verficationContextStatus) => void; // <-- NUEVO
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
  language: normalizeLanguageCode(i18n.language),
  setLanguage: (lang: string) => {
    const normalizedLang = normalizeLanguageCode(lang);
    i18n.changeLanguage(normalizedLang);
    set({ language: normalizedLang });
  },
  toast: {
    message: "",
    type: "info",
    open: false,
  },
  setToast: (toast) => set({ toast }),
  clearToast: () => set({ toast: { message: "", type: "info", open: false } }),
  canAccessPage: false,
  allowedPages: [],
  setAccessPage: (canAccess, pages) =>
    set({ canAccessPage: canAccess, allowedPages: pages }),
  modalOpen: false,
  setModalOpen: (isOpen: boolean) => set({ modalOpen: isOpen }),
  doctorOnboardingStep: 0,
  setDoctorOnboardingStep: (step: number) =>
    set({ doctorOnboardingStep: step }),
  onboardingStep: 0,
  setOnboardingStep: (step: number) => set({ onboardingStep: step }),
  verificationContext: null,
  setVerificationContext: (context) => set({ verificationContext: context }),
  resetVerificationContext: () => set({ verificationContext: null }),
  verificationContextStatus: null, // <-- NUEVO
  setVerificationContextStatus: (status) =>
    set({ verificationContextStatus: status }), // <-- NUEVO
});
