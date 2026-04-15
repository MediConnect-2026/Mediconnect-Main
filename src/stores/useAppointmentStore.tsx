import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import {
  type AppointmentSlice,
  createAppointmentSlice,
} from "@/stores/useAppointmentSlice";

type AppointmentStore = AppointmentSlice;

export const useAppointmentStore = create<AppointmentStore>()(
  persist(
    (...a) => ({
      ...createAppointmentSlice(...a),
    }),
    {
      name: "appointment-storage",
      storage: createJSONStorage(() => sessionStorage),
      partialize: (state) => ({
        appointment: state.appointment,
        isRescheduling: state.isRescheduling,
      }),
    },
  ),
);
