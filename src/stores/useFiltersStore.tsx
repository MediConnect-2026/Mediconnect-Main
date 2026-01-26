import { create } from "zustand";
import {
  type DoctorFiltersSlice,
  createDoctorFiltersSlice,
} from "./filters/doctorFilters.slice";
import {
  type AppointmentFiltersSlice,
  createAppointmentFiltersSlice,
} from "./filters/appointmentFilters.slice";

export type FiltersStore = DoctorFiltersSlice & AppointmentFiltersSlice;

export const useFiltersStore = create<FiltersStore>()((...a) => ({
  ...createDoctorFiltersSlice(...a),
  ...createAppointmentFiltersSlice(...a),
}));
