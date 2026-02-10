import { type StateCreator } from "zustand";
import {
  type DoctorPersonalInfo,
  type CenterPersonalInfo,
  type CenterDocuments,
  type DoctorDocuments,
} from "@/schema/verifyInfo.schema";

export interface VerifyInfoSlice {
  // Doctor info
  doctorInfo: DoctorPersonalInfo | null;
  setDoctorInfo: (info: DoctorPersonalInfo) => void;
  clearDoctorInfo: () => void;
  updateDoctorVerificationStatus: (
    status: DoctorPersonalInfo["verificationStatus"],
  ) => void;

  // Center info
  centerInfo: CenterPersonalInfo | null;
  setCenterInfo: (info: CenterPersonalInfo) => void;
  clearCenterInfo: () => void;
  updateCenterVerificationStatus: (
    status: CenterPersonalInfo["verificationStatus"],
  ) => void;

  // Doctor documents
  doctorDocuments: DoctorDocuments | null;
  setDoctorDocuments: (docs: DoctorDocuments) => void;
  clearDoctorDocuments: () => void;

  // Center documents
  centerDocuments: CenterDocuments | null;
  setCenterDocuments: (docs: CenterDocuments) => void;
  clearCenterDocuments: () => void;
}

export const createVerifyInfoSlice: StateCreator<VerifyInfoSlice> = (set) => ({
  // Doctor
  doctorInfo: null,
  setDoctorInfo: (info) => set({ doctorInfo: info }),
  clearDoctorInfo: () => set({ doctorInfo: null }),
  updateDoctorVerificationStatus: (status) =>
    set((state) =>
      state.doctorInfo
        ? { doctorInfo: { ...state.doctorInfo, verificationStatus: status } }
        : {},
    ),

  // Center
  centerInfo: null,
  setCenterInfo: (info) => set({ centerInfo: info }),
  clearCenterInfo: () => set({ centerInfo: null }),
  updateCenterVerificationStatus: (status) =>
    set((state) =>
      state.centerInfo
        ? { centerInfo: { ...state.centerInfo, verificationStatus: status } }
        : {},
    ),

  // Doctor documents
  doctorDocuments: null,
  setDoctorDocuments: (docs) => set({ doctorDocuments: docs }),
  clearDoctorDocuments: () => set({ doctorDocuments: null }),

  // Center documents
  centerDocuments: null,
  setCenterDocuments: (docs) => set({ centerDocuments: docs }),
  clearCenterDocuments: () => set({ centerDocuments: null }),
});
