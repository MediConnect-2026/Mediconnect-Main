import { type StateCreator } from "zustand";
import type { scheduleAppointment } from "@/types/AppointmentTypes";

export interface AppointmentSlice {
  isAppointmentInProgress?: boolean;
  appointment: scheduleAppointment & { selectedServiceId?: string }; // Agrega selectedServiceId opcional
  addAppointment: (
    appointment: scheduleAppointment & { selectedServiceId?: string },
  ) => void;
  setAppointmentField?: <
    K extends keyof (scheduleAppointment & { selectedServiceId?: string }),
  >(
    field: K,
    value: (scheduleAppointment & { selectedServiceId?: string })[K],
  ) => void;
  setIsAppointmentInProgress?: (inProgress: boolean) => void;
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
    serviceId: "", // <-- Agrega aquí
    doctorId: "",
  },
  isAppointmentInProgress: false,

  setIsAppointmentInProgress: (inProgress) =>
    set({ isAppointmentInProgress: inProgress }),

  setAppointmentField: (field, value) =>
    set((state) => ({
      appointment: {
        ...state.appointment,
        [field]: value,
      },
    })),
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
        serviceId: "", // <-- También aquí
        doctorId: "",
      },
    }),
});
