import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import {
  type EditProfileSlice,
  createEditProfileSlice,
} from "@/stores/profile/EditProfileSlice";
import {
  type AccountSlice,
  createAccountSlice,
} from "@/stores/profile/AccountSlice";

type ProfileStore = EditProfileSlice & AccountSlice;

export const useProfileStore = create<ProfileStore>()(
  persist(
    (...a) => ({
      ...createEditProfileSlice(...a),
      ...createAccountSlice(...a),
    }),
    {
      name: "profile-storage",
      storage: createJSONStorage(() => sessionStorage),
      partialize: (state) => ({
        profile: state.profile,
        doctorProfile: state.doctorProfile,
        patientProfile: state.patientProfile,
        centerProfile: state.centerProfile,
        centerLocation: state.centerLocation,
        patientClinicalHistory: state.patientClinicalHistory,
        patientInsurance: state.patientInsurance,
        doctorEducation: state.doctorEducation,
        doctorExperience: state.doctorExperience,
        doctorLanguage: state.doctorLanguage,
        doctorInsurance: state.doctorInsurance,
        verifyAccountPassword: state.verifyAccountPassword,
      }),
    },
  ),
);
