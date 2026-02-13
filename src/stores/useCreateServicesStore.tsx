import { create } from "zustand";
import { persist } from "zustand/middleware";
import type { CreateServicesSlice } from "./useCreateServicesSlice";
import createServicesSlice from "./useCreateServicesSlice";

export const useCreateServicesStore = create<CreateServicesSlice>()(
  persist(createServicesSlice, {
    name: "create-services-store",
    storage: {
      getItem: (name) => {
        const item = sessionStorage.getItem(name);
        return item ? JSON.parse(item) : null;
      },
      setItem: (name, value) => {
        sessionStorage.setItem(name, JSON.stringify(value));
      },
      removeItem: (name) => {
        sessionStorage.removeItem(name);
      },
    },
  }),
);
