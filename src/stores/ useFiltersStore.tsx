import { create } from "zustand";
import {
  type DoctorFiltersSlice,
  createDoctorFiltersSlice,
} from "./filters/doctorFilters.slice";

export type FiltersStore = DoctorFiltersSlice;

export const useFiltersStore = create<FiltersStore>()(createDoctorFiltersSlice);
