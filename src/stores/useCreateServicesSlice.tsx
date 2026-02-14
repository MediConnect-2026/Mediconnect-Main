import type { StateCreator } from "zustand";
import type {
  CreateServiceType,
  LocationType,
  ComercialScheduleType,
} from "@/types/CreateServiceType";
import type { StepStatus } from "@/shared/components/MCStepper";

// Define el tipo para cada paso
type ServiceStep =
  | { servicesDetails: { status: StepStatus } }
  | { location: { status: StepStatus } }
  | { comercialSchedule: { status: StepStatus } }
  | { images: { status: StepStatus } }
  | { summary: { status: StepStatus } };

export interface CreateServicesSlice {
  createServiceData: CreateServiceType;
  setCreateServiceData: (data: Partial<CreateServiceType>) => void;
  setCreateServiceField: (field: keyof CreateServiceType, value: any) => void;

  locationData: LocationType;
  setLocationData: (data: Partial<LocationType>) => void;

  comercialScheduleData: ComercialScheduleType;
  setComercialScheduleData: (data: Partial<ComercialScheduleType>) => void;

  currentStep: number;
  createServiceStep: ServiceStep[];
  setCreateServiceStep: (step: number, status: StepStatus) => void;

  isTitleSeted: boolean;
  setIsTitleSeted: (value: boolean) => void;

  resetAll: () => void;
}

const createServicesSlice: StateCreator<CreateServicesSlice> = (set) => ({
  createServiceData: {
    name: "",
    specialty: "",
    selectedModality: "presencial",
    numberOfSessions: 1,
    duration: {
      hours: 0,
      minutes: 30,
    },
    pricePerSession: 1,
    images: [],
    comercial_schedule: [],
    description: "",
    location: undefined,
  },
  setCreateServiceData: (data) =>
    set((state) => ({
      createServiceData: { ...state.createServiceData, ...data },
    })),
  setCreateServiceField: (field, value) =>
    set((state) => ({
      createServiceData: { ...state.createServiceData, [field]: value },
    })),

  locationData: {
    name: "",
    address: "",
    province: "",
    municipality: "",
    coordinates: {
      latitude: 0,
      longitude: 0,
    },
  },
  setLocationData: (data) =>
    set((state) => ({
      locationData: { ...state.locationData, ...data },
    })),

  comercialScheduleData: {
    name: "",
    day: [],
    startTime: "00:00:00",
    endTime: "00:00:00",
    locationId: "",
  },
  setComercialScheduleData: (data) =>
    set((state) => ({
      comercialScheduleData: {
        ...state.comercialScheduleData,
        ...data,
      },
    })),
  createServiceStep: [
    { servicesDetails: { status: "process" } },
    { location: { status: "wait" } },
    { comercialSchedule: { status: "wait" } },
    { images: { status: "wait" } },
    { summary: { status: "wait" } },
  ] as ServiceStep[],

  isTitleSeted: false,
  setIsTitleSeted: (value) => set({ isTitleSeted: value }),
  currentStep: 0,

  setCreateServiceStep: (step, status) =>
    set((state) => {
      const stepKeys = [
        "servicesDetails",
        "location",
        "comercialSchedule",
        "images",
        "summary",
      ] as const;
      const updatedSteps = stepKeys.map((key, index) => {
        const stepStatus =
          index === step ? status : index < step ? "finish" : "wait";
        return { [key]: { status: stepStatus } };
      }) as ServiceStep[];

      return { createServiceStep: updatedSteps, currentStep: step };
    }),

  resetAll: () =>
    set({
      createServiceData: {
        name: "",
        specialty: "",
        selectedModality: "presencial",
        numberOfSessions: 1,
        duration: {
          hours: 0,
          minutes: 30,
        },
        pricePerSession: 1,
        images: [],
        comercial_schedule: [],
        description: "",
        location: undefined,
      },
      locationData: {
        name: "",
        address: "",
        province: "",
        municipality: "",
        coordinates: {
          latitude: 0,
          longitude: 0,
        },
      },
      comercialScheduleData: {
        name: "",
        day: [],
        startTime: "00:00:00",
        endTime: "00:00:00",
        locationId: "",
      },
      isTitleSeted: false,
      createServiceStep: [
        { servicesDetails: { status: "process" } },
        { location: { status: "wait" } },
        { comercialSchedule: { status: "wait" } },
        { images: { status: "wait" } },
        { summary: { status: "wait" } },
      ] as ServiceStep[],
      currentStep: 0,
    }),
});

export default createServicesSlice;
