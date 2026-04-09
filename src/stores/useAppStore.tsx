import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import { type AuthSlice, createAuthSlice } from "@/stores/useAuthSlice";
import {
  type OnboardingSlice,
  createOnboardingSlice,
} from "@/stores/useOnboardingSlice";
import {
  type AuthFlowSlice,
  createAuthFlowSlice,
} from "@/stores/useAuthFlowSlice";
import { type ChatSlice, createChatSlice } from "@/stores/useChatSlice";
import {
  type NotificationsSlice,
  createNotificationsSlice,
} from "./useNotificationsSlice";

type AppStore = AuthSlice & OnboardingSlice & AuthFlowSlice & ChatSlice & NotificationsSlice;

export const useAppStore = create<AppStore>()(
  persist(
    (...a) => ({
      ...createAuthSlice(...a),
      ...createOnboardingSlice(...a),
      ...createAuthFlowSlice(...a),
      ...createChatSlice(...a),
      ...createNotificationsSlice(...a),
    }),
    {
      name: "app-storage",
      storage: createJSONStorage(() => sessionStorage),
      partialize: (state) => ({
        // AuthSlice
        isAuthenticated: state.isAuthenticated,
        accessToken: state.accessToken,
        refreshToken: state.refreshToken,
        user: state.user,

        // AuthFlowSlice
        verifyEmail: state.verifyEmail,
        forgotPassword: state.forgotPassword,
        otp: state.otp,
        registrationToken: state.registrationToken,
        googleUserData: state.googleUserData,

        // OnboardingSlice
        selectedRole: state.selectedRole,
        patientOnboardingData: state.patientOnboardingData,
        doctorOnboardingData: state.doctorOnboardingData,
        centerOnboardingData: state.centerOnboardingData,

        // NotificationsSlice - Opcional: descomenta si quieres persistir el contador
        // unreadNotificationsCount: state.unreadNotificationsCount,

        // ChatSlice y incomingCall NO se persistem - se cargan desde API/WebSocket
      }),
    },
  ),
);
