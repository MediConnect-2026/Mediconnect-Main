import { type StateCreator } from "zustand";
import type {
  scheduleAppointment,
  CancelAppointment,
} from "@/types/AppointmentTypes";
import type { RescheduleAppointmentByDoctorFormData } from "@/schema/appointment.schema";
export interface AppointmentSlice {
  isAppointmentInProgress?: boolean;
  appointment: scheduleAppointment & { selectedServiceId?: string };

  cancelAppointment?: CancelAppointment;

  rescheduleAppointmentByDoctor?: RescheduleAppointmentByDoctorFormData;
  setRescheduleAppointmentByDoctor?: (
    data: RescheduleAppointmentByDoctorFormData,
  ) => void;

  setCancelAppointment?: (data: CancelAppointment) => void;

  addAppointment: (
    appointment: scheduleAppointment & { selectedServiceId?: string },
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
    selectedModality: "presencial", // ✅ Valor por defecto válido
    numberOfSessions: 1,
    serviceId: "",
    doctorId: "",
    appointmentId: undefined,
  },

  rescheduleAppointmentByDoctor: {
    appointmentId: "",
    newDate: "",
    newTime: "",
  },

  setRescheduleAppointmentByDoctor: (data) =>
    set({ rescheduleAppointmentByDoctor: data }),

  addAppointment: (data) => set({ appointment: data }),

  cancelAppointment: {
    cancellationReason: "",
  },

  setCancelAppointment: (data) => set({ cancelAppointment: data }),

  isAppointmentInProgress: false,

  setIsAppointmentInProgress: (inProgress) =>
    set({ isAppointmentInProgress: inProgress }),

  clearAppointments: () =>
    set({
      appointment: {
        date: "",
        time: "",
        reason: "",
        insuranceProvider: "",
        selectedModality: "presencial", // ✅ Valor por defecto válido
        numberOfSessions: 1,
        serviceId: "",
        doctorId: "",
        appointmentId: undefined,
      },
    }),
});
