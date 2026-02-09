import { type StateCreator } from "zustand";
import {
  type DoctorPersonalInfo,
  type CenterPersonalInfo,
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
});
