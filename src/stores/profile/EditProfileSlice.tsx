import { type StateCreator } from "zustand";
import {
  type ProfileType,
  type DoctorProfileType,
  type PatientProfileType,
  type CenterProfileType,
  type CenterLocationType,
  type PatientClinicalHistoryType,
  type PatientInsuranceType,
  type DoctorEducationType,
  type DoctorExperienceType,
  type DoctorLanguageType,
  type DoctorInsuranceType,
} from "@/types/ProfileTypes";

export interface EditProfileSlice {
  profile: ProfileType | null;
  doctorProfile: DoctorProfileType | null;
  patientProfile: PatientProfileType | null;
  centerProfile: CenterProfileType | null;
  centerLocation: CenterLocationType | null;
  patientClinicalHistory: PatientClinicalHistoryType | null;
  patientInsurance: PatientInsuranceType | [null] | null;
  doctorEducation: DoctorEducationType | null;
  doctorExperience: DoctorExperienceType | null;
  doctorLanguage: DoctorLanguageType | null;
  doctorInsurance: DoctorInsuranceType | null;
  setProfile: (profile: ProfileType) => void;
  setDoctorProfile: (profile: DoctorProfileType) => void;
  setPatientProfile: (profile: PatientProfileType) => void;
  setCenterProfile: (profile: CenterProfileType) => void;
  setCenterLocation: (location: CenterLocationType) => void;
  setPatientClinicalHistory: (history: PatientClinicalHistoryType) => void;
  setPatientInsurance: (insurance: PatientInsuranceType) => void;
  setDoctorEducation: (education: DoctorEducationType) => void;
  setDoctorExperience: (experience: DoctorExperienceType) => void;
  setDoctorLanguage: (language: DoctorLanguageType) => void;
  setDoctorInsurance: (insurance: DoctorInsuranceType) => void;
  reset: () => void;
}

export const createEditProfileSlice: StateCreator<EditProfileSlice> = (
  set,
) => ({
  profile: null,
  doctorProfile: null,
  patientProfile: null,
  centerProfile: null,
  centerLocation: null,
  patientClinicalHistory: null,
  patientInsurance: null,
  doctorEducation: null,
  doctorExperience: null,
  doctorLanguage: null,
  doctorInsurance: null,
  setProfile: (profile) => set({ profile }),
  setDoctorProfile: (doctorProfile) => set({ doctorProfile }),
  setPatientProfile: (patientProfile) => set({ patientProfile }),
  setCenterProfile: (centerProfile) => set({ centerProfile }),
  setCenterLocation: (centerLocation) => set({ centerLocation }),
  setPatientClinicalHistory: (patientClinicalHistory) =>
    set({ patientClinicalHistory }),
  setPatientInsurance: (patientInsurance) => set({ patientInsurance }),
  setDoctorEducation: (doctorEducation) => set({ doctorEducation }),
  setDoctorExperience: (doctorExperience) => set({ doctorExperience }),
  setDoctorLanguage: (doctorLanguage) => set({ doctorLanguage }),
  setDoctorInsurance: (doctorInsurance) => set({ doctorInsurance }),
  reset: () =>
    set({
      profile: null,
      doctorProfile: null,
      patientProfile: null,
      centerProfile: null,
      centerLocation: null,
      patientClinicalHistory: null,
      patientInsurance: null,
      doctorEducation: null,
      doctorExperience: null,
      doctorLanguage: null,
      doctorInsurance: null,
    }),
});
