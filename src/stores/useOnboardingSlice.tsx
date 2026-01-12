import { type StateCreator } from "zustand";
import type {
  PatientOnboardingSchemaType,
  DoctorOnboardingSchemaType,
} from "@/types/OnbordingTypes";

export interface OnboardingSlice {
  selectedRole: "Patient" | "Doctor" | "Center" | null;
  patientOnboardingData?: PatientOnboardingSchemaType;
  doctorOnboardingData?: DoctorOnboardingSchemaType;

  setPatientOnboardingData?: (data: PatientOnboardingSchemaType) => void;
  setDoctorOnboardingData?: (data: DoctorOnboardingSchemaType) => void;

  setDoctorField?: <K extends keyof DoctorOnboardingSchemaType>(
    field: K,
    value: DoctorOnboardingSchemaType[K]
  ) => void;

  setSelectedRole: (role: "Patient" | "Doctor" | "Center" | null) => void;
  clearOnboarding: () => void;
}

export const createOnboardingSlice: StateCreator<OnboardingSlice> = (set) => ({
  selectedRole: null,
  patientOnboardingData: {
    name: "",
    lastName: "",
    role: "Patient",
    identityDocument: "",
    email: "",
    password: "",
    confirmPassword: "",
    urlImg: "",
  },
  doctorOnboardingData: {
    name: "",
    lastName: "",
    gender: "",
    role: "Doctor",
    birthDate: "",
    nationality: "",
    identityDocument: "",
    exequatur: "",
    mainSpecialty: "",
    phone: "",
    email: "",
    secondarySpecialties: [],
    urlImg: "",

    password: "",
    confirmPassword: "",
  },

  setPatientOnboardingData: (data) => set({ patientOnboardingData: data }),
  setDoctorOnboardingData: (data) => set({ doctorOnboardingData: data }),

  setDoctorField: (field, value) =>
    set((state) => ({
      doctorOnboardingData: {
        ...state.doctorOnboardingData!,
        [field]: value,
      },
    })),

  setSelectedRole: (role) => set({ selectedRole: role }),

  clearOnboarding: () =>
    set({
      selectedRole: null,
      patientOnboardingData: {
        name: "",
        lastName: "",
        role: "Patient",
        identityDocument: "",
        email: "",
        password: "",
        confirmPassword: "",
        urlImg: "",
      },

      doctorOnboardingData: {
        name: "",
        lastName: "",
        role: "Doctor",
        gender: "",
        birthDate: "",
        nationality: "",
        identityDocument: "",
        exequatur: "",
        mainSpecialty: "",
        phone: "",
        email: "",
        secondarySpecialties: [],
        urlImg: "",
        password: "",
        confirmPassword: "",
      },
    }),
});
