import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import {
  createVerifyInfoSlice,
  type VerifyInfoSlice,
} from "./useVerifyInfoSlice";

export const useVerifyInfoStore = create<VerifyInfoSlice>()(
  persist(
    (...a) => ({
      ...createVerifyInfoSlice(...a),
    }),
    {
      name: "verify-info-storage",
      storage: createJSONStorage(() => sessionStorage),
      partialize: (state) => ({
        doctorInfo: state.doctorInfo,
      }),
    },
  ),
);
