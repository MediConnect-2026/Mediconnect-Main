import { type StateCreator } from "zustand";
import type { Prescription } from "@/types/PrescriptionTypes";

export interface PrescriptionSlice {
  prescription: Prescription;
  addPrescription: (data: Prescription) => void;
  clearPrescription: () => void;
}

const defaultPrescription: Prescription = {
  diagnosisTitle: "",
  diagnosisDescription: "",
  documents: [],
};

export const createPrescriptionSlice: StateCreator<PrescriptionSlice> = (
  set,
) => ({
  prescription: defaultPrescription,
  addPrescription: (data) => set({ prescription: data }),
  clearPrescription: () => set({ prescription: defaultPrescription }),
});
