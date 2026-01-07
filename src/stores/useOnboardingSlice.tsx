import { type StateCreator } from "zustand";
import type { PatientOnboardingSchemaType } from "@/types/OnbordingTypes";

export interface OnboardingSlice {
  selectedRole: string | null;
  patientOnboardingData?: PatientOnboardingSchemaType;
  setpatientOnboardingData?: (data: PatientOnboardingSchemaType) => void;

  setSelectedRole: (role: string | null) => void;
  clearOnboarding: () => void;
}

export const createOnboardingSlice: StateCreator<OnboardingSlice> = (set) => ({
  selectedRole: null,
  patientOnboardingData: {
    name: "",
    lastName: "",
    identityDocument: "",
    email: "",
    password: "",
    confirmPassword: "",
    urlImg: undefined,
  },

  setpatientOnboardingData: (data) => set({ patientOnboardingData: data }),

  setSelectedRole: (role) => set({ selectedRole: role }),

  clearOnboarding: () =>
    set({
      selectedRole: null,
    }),
});
