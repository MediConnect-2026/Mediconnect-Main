import { type StateCreator } from "zustand";

export interface DoctorFiltersSlice {
  doctorFilters: {
    name: string;
    specialty: string;
    yearsOfExperience: number | null;
    languages: string[];
    acceptingInsurance: string[];
    isFavorite: boolean | null;
    rating: number | null;
  };

  setDoctorFilters: (filters: DoctorFiltersSlice["doctorFilters"]) => void;
}

export const createDoctorFiltersSlice: StateCreator<DoctorFiltersSlice> = (
  set,
) => ({
  doctorFilters: {
    name: "",
    specialty: "",
    yearsOfExperience: null,
    languages: [],
    acceptingInsurance: [],
    isFavorite: null,
    rating: null,
  },

  setDoctorFilters: (filters) =>
    set(() => ({
      doctorFilters: filters,
    })),
});
