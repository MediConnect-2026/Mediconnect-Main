import { type StateCreator } from "zustand";
import type {
  PatientOnboardingSchemaType,
  DoctorOnboardingSchemaType,
  CenterOnboardingSchemaType,
} from "@/types/OnbordingTypes";

export interface OnboardingSlice {
  selectedRole: "Patient" | "Doctor" | "Center" | null;
  patientOnboardingData?: PatientOnboardingSchemaType;
  doctorOnboardingData?: DoctorOnboardingSchemaType;
  centerOnboardingData?: CenterOnboardingSchemaType;

  setPatientOnboardingData?: (data: PatientOnboardingSchemaType) => void;
  setDoctorOnboardingData?: (data: DoctorOnboardingSchemaType) => void;
  setCenterOnboardingData?: (data: CenterOnboardingSchemaType) => void;

  setDoctorField?: <K extends keyof DoctorOnboardingSchemaType>(
    field: K,
    value: DoctorOnboardingSchemaType[K]
  ) => void;
  setCenterField?: <K extends keyof CenterOnboardingSchemaType>(
    field: K,
    value: CenterOnboardingSchemaType[K]
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
    gender: "",
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
    secondarySpecialties: [],
    phone: "",
    email: "",
    identityDocumentFile: [],
    password: "",
    confirmPassword: "",
  },
  centerOnboardingData: {
    name: "",
    Description: "",
    address: "",
    role: "Center",
    rnc: "",
    password: "",
    confirmPassword: "",
    coordinates: {
      latitude: 0,
      longitude: 0,
    },
    centerType: "",
    phone: "",
    email: "",
    province: "",
    municipality: "",
  },

  setPatientOnboardingData: (data) => set({ patientOnboardingData: data }),
  setDoctorOnboardingData: (data) => set({ doctorOnboardingData: data }),
  setCenterOnboardingData: (data) => set({ centerOnboardingData: data }),

  setDoctorField: (field, value) =>
    set((state) => ({
      doctorOnboardingData: {
        ...state.doctorOnboardingData!,
        [field]: value,
      },
    })),

  setCenterField: (field, value) =>
    set((state) => ({
      centerOnboardingData: {
        ...state.centerOnboardingData!,
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
        gender: "",
        password: "",
        confirmPassword: "",
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
        secondarySpecialties: [],
        phone: "",
        email: "",
        identityDocumentFile: [],
        password: "",
        confirmPassword: "",
      },
      centerOnboardingData: {
        name: "",
        Description: "",
        address: "",
        role: "Center",
        rnc: "",

        coordinates: {
          latitude: 0,
          longitude: 0,
        },
        centerType: "",
        phone: "",
        email: "",
        province: "",
        municipality: "",
        password: "",
        confirmPassword: "",
      },
    }),
});
