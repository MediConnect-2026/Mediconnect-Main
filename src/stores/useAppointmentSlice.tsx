import { type StateCreator } from "zustand";
import type {
  scheduleAppointment,
  CancelAppointment,
} from "@/types/AppointmentTypes";
import type { RescheduleAppointmentByDoctorFormData } from "@/schema/appointment.schema";

export interface AppointmentSlice {
  isAppointmentInProgress?: boolean;
  isRescheduling: boolean;
  setIsRescheduling: (value: boolean) => void;
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
    useInsurance: false,
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

  isRescheduling: false,

  setIsRescheduling: (value) => set({ isRescheduling: value }),

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
      isRescheduling: false,
      appointment: {
        date: "",
        time: "",
        reason: "",
        useInsurance: false,
        insuranceProvider: "",
        selectedModality: "presencial", // ✅ Valor por defecto válido
        numberOfSessions: 1,
        serviceId: "",
        doctorId: "",
        appointmentId: undefined,
      },
    }),
});
