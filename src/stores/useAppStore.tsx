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

type AppStore = AuthSlice & OnboardingSlice & AuthFlowSlice;

export const useAppStore = create<AppStore>()(
  persist(
    (...a) => ({
      ...createAuthSlice(...a),
      ...createOnboardingSlice(...a),
      ...createAuthFlowSlice(...a),
    }),
    {
      name: "app-storage",
      storage: createJSONStorage(() => sessionStorage),
      partialize: (state) => ({
        // AuthSlice
        isAuthenticated: state.isAuthenticated,
        token: state.token,
        user: state.user,

        // AuthFlowSlice
        verifyEmail: state.verifyEmail,
        forgotPassword: state.forgotPassword,
        otp: state.otp,

        // OnboardingSlice
        selectedRole: state.selectedRole,
        patientOnboardingData: state.patientOnboardingData,
        doctorOnboardingData: state.doctorOnboardingData,
        centerOnboardingData: state.centerOnboardingData,
      }),
    },
  ),
);
