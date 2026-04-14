import { type StateCreator } from "zustand";
import type {
  PatientOnboardingSchemaType,
  DoctorOnboardingSchemaType,
  CenterOnboardingSchemaType,
} from "@/types/OnbordingTypes";

const initialPatientOnboardingData: PatientOnboardingSchemaType = {
  name: "",
  lastName: "",
  role: "Patient",
  identityDocument: "",
  email: "",
  password: "",
  confirmPassword: "",
  gender: "",
};

const initialDoctorOnboardingData: DoctorOnboardingSchemaType = {
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
  language: "",
  proficiencyLevel: "",
  // si en tu tipo existe y es opcional, puedes dejarlo así:
  // academicTitle: undefined,
};

const initialCenterOnboardingData: CenterOnboardingSchemaType = {
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
  district: "",
  section: "",
  neighborhood: "",
  subNeighborhood: "",
};

export interface OnboardingSlice {
  selectedRole: "Patient" | "Doctor" | "Center" | null;
  patientOnboardingData: PatientOnboardingSchemaType;
  doctorOnboardingData: DoctorOnboardingSchemaType;
  centerOnboardingData: CenterOnboardingSchemaType;

  setPatientOnboardingData: (data: PatientOnboardingSchemaType) => void;
  setDoctorOnboardingData: (data: DoctorOnboardingSchemaType) => void;
  setCenterOnboardingData: (data: CenterOnboardingSchemaType) => void;

  setDoctorField: <K extends keyof DoctorOnboardingSchemaType>(
    field: K,
    value: DoctorOnboardingSchemaType[K],
  ) => void;
  setCenterField: <K extends keyof CenterOnboardingSchemaType>(
    field: K,
    value: CenterOnboardingSchemaType[K],
  ) => void;
  setSelectedRole: (role: "Patient" | "Doctor" | "Center" | null) => void;
  clearOnboarding: () => void;
}

export const createOnboardingSlice: StateCreator<OnboardingSlice> = (set) => ({
  selectedRole: null,
  patientOnboardingData: { ...initialPatientOnboardingData },
  doctorOnboardingData: { ...initialDoctorOnboardingData },
  centerOnboardingData: { ...initialCenterOnboardingData },

  setPatientOnboardingData: (data) => set({ patientOnboardingData: data }),
  setDoctorOnboardingData: (data) => set({ doctorOnboardingData: data }),
  setCenterOnboardingData: (data) => set({ centerOnboardingData: data }),

  setDoctorField: (field, value) =>
    set((state) => ({
      doctorOnboardingData: {
        ...state.doctorOnboardingData,
        [field]: value,
      },
    })),

  setCenterField: (field, value) =>
    set((state) => ({
      centerOnboardingData: {
        ...state.centerOnboardingData,
        [field]: value,
      },
    })),

  setSelectedRole: (role) => set({ selectedRole: role }),

  clearOnboarding: () =>
    set({
      selectedRole: null,
      patientOnboardingData: { ...initialPatientOnboardingData },
      doctorOnboardingData: { ...initialDoctorOnboardingData },
      centerOnboardingData: { ...initialCenterOnboardingData },
    }),
});
