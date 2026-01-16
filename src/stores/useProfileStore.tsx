import { create } from "zustand";
import {
  type ProfileType,
  type DoctorProfileType,
  type PatientProfileType,
  type CenterProfileType,
  type CenterLocationType,
  type PatientClinicalHistoryType,
  type PatientInsuranceType,
} from "@/types/ProfileTypes";

type ProfileState = {
  profile: ProfileType | null;
  doctorProfile: DoctorProfileType | null;
  patientProfile: PatientProfileType | null;
  centerProfile: CenterProfileType | null;
  centerLocation: CenterLocationType | null;
  patientClinicalHistory: PatientClinicalHistoryType | null;
  patientInsurance: PatientInsuranceType | [null] | null;
  setProfile: (profile: ProfileType) => void;
  setDoctorProfile: (profile: DoctorProfileType) => void;
  setPatientProfile: (profile: PatientProfileType) => void;
  setCenterProfile: (profile: CenterProfileType) => void;
  setCenterLocation: (location: CenterLocationType) => void;
  setPatientClinicalHistory: (history: PatientClinicalHistoryType) => void;
  setPatientInsurance: (insurance: PatientInsuranceType) => void;
  reset: () => void;
};

export const useProfileStore = create<ProfileState>((set) => ({
  profile: null,
  doctorProfile: null,
  patientProfile: null,
  centerProfile: null,
  centerLocation: null,
  patientClinicalHistory: null,
  patientInsurance: null,
  setProfile: (profile) => set({ profile }),
  setDoctorProfile: (doctorProfile) => set({ doctorProfile }),
  setPatientProfile: (patientProfile) => set({ patientProfile }),
  setCenterProfile: (centerProfile) => set({ centerProfile }),
  setCenterLocation: (centerLocation) => set({ centerLocation }),
  setPatientClinicalHistory: (patientClinicalHistory) =>
    set({ patientClinicalHistory }),
  setPatientInsurance: (patientInsurance) => set({ patientInsurance }),
  reset: () =>
    set({
      profile: null,
      doctorProfile: null,
      patientProfile: null,
      centerProfile: null,
      centerLocation: null,
      patientClinicalHistory: null,
      patientInsurance: null,
    }),
}));
