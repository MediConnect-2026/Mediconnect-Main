import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import { type AuthSlice, createAuthSlice } from "./useAuthSlice";
import { type GlobalUISlice, createGlobalUISlice } from "./useGlobalUISlice";

type AppStore = GlobalUISlice & AuthSlice;

export const useAppStore = create<AppStore>()(
  persist(
    (...a) => ({
      ...createGlobalUISlice(...a),
      ...createAuthSlice(...a),
    }),
    {
      name: "app-storage",
      storage: createJSONStorage(() => sessionStorage),

      partialize: (state) => ({
        // De AuthSlice
        forgotPassword: state.forgotPassword,
        otp: state.otp,
        isAuthenticated: state.isAuthenticated,
        token: state.token,
        selectedRole: state.selectedRole,
        // De GlobalUISlice
        theme: state.theme,
        language: state.language,
      }),
    }
  )
);
