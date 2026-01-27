import { type StateCreator } from "zustand";
import type { scheduleAppointment } from "@/types/AppointmentTypes";

export interface AppointmentSlice {
  appointment: scheduleAppointment;
  addAppointment: (appointment: scheduleAppointment) => void;
  clearAppointments: () => void;
}

export const createAppointmentSlice: StateCreator<AppointmentSlice> = (
  set,
) => ({
  appointment: {
    date: "",
    time: "",
    reason: "",
    insuranceProvider: "",
    selectedModality: "presencial",
    numberOfSessions: 1,
  },

  addAppointment: (data) => set({ appointment: data }),

  clearAppointments: () =>
    set({
      appointment: {
        date: "",
        time: "",
        reason: "",
        insuranceProvider: "",
        selectedModality: "presencial",
        numberOfSessions: 1,
      },
    }),
});
