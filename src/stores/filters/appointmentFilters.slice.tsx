import type { StateCreator } from "zustand";

export type AppointmentFilters = {
  serviceTypes: string[]; // Tipos de servicio (multi-select)
  specialties: string[]; // Especialidades (multi-select)
  modalities: string[]; // Modalidades (multi-select)
  priceRange: [number, number]; // Rango de precios [min, max]
  durations: number[]; // Duraciones en minutos (multi-select)
};

export type AppointmentFiltersSlice = {
  filters: AppointmentFilters;
  setFilters: (filters: Partial<AppointmentFilters>) => void;
  resetFilters: () => void;
};

const initialFilters: AppointmentFilters = {
  serviceTypes: [],
  specialties: [],
  modalities: [],
  priceRange: [0, 10000], // Ajusta el rango según tus necesidades
  durations: [],
};

export const createAppointmentFiltersSlice: StateCreator<
  AppointmentFiltersSlice,
  [],
  [],
  AppointmentFiltersSlice
> = (set) => ({
  filters: initialFilters,
  setFilters: (filters) =>
    set((state) => ({
      filters: { ...state.filters, ...filters },
    })),
  resetFilters: () =>
    set(() => ({
      filters: initialFilters,
    })),
});
