import { type StateCreator } from "zustand";
import type { Prescription } from "@/types/PrescriptionTypes";

export interface PrescriptionSlice {
  prescription: Prescription;
  addPrescription: (data: Prescription) => void;
  clearPrescription: () => void;
}

export const createPrescriptionSlice: StateCreator<PrescriptionSlice> = (
  set,
) => ({
  prescription: {
    patientId: "",
    doctorId: "",
    diagnosisTittle: "",
    diagnosisDescription: "",
    documents: [],
  },
  addPrescription: (data) => set({ prescription: data }),
  clearPrescription: () =>
    set({
      prescription: {
        patientId: "",
        doctorId: "",
        diagnosisTittle: "",
        diagnosisDescription: "",
        documents: [],
      },
    }),
});
