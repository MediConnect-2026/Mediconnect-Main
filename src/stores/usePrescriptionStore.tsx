import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import {
  createPrescriptionSlice,
  type PrescriptionSlice,
} from "./usePrescriptionSlice";

export const usePrescriptionStore = create<PrescriptionSlice>()(
  persist(
    (...a) => ({
      ...createPrescriptionSlice(...a),
    }),
    {
      name: "prescription-storage",
      storage: createJSONStorage(() => sessionStorage),
      partialize: (state) => ({
        prescription: state.prescription,
      }),
    },
  ),
);
