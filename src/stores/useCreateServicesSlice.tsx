import type { StateCreator } from "zustand";
import type {
  CreateServiceType,
  LocationType,
  ComercialScheduleType,
} from "@/types/CreateServiceType";
import type { StepStatus } from "@/shared/components/MCStepper";

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
  setlocationField: (field: keyof LocationType, value: any) => void;
  clearLocationData: () => void;
  comercialScheduleData: ComercialScheduleType;
  setComercialScheduleData: (data: Partial<ComercialScheduleType>) => void;

  currentStep: number;
  createServiceStep: ServiceStep[];
  setCreateServiceStep: (step: number, status: StepStatus) => void;

  isTitleSeted: boolean;
  setIsTitleSeted: (value: boolean) => void;

  goToNextStep: () => void;
  goToPreviousStep: () => void;

  resetAll: () => void;
}

const createServicesSlice: StateCreator<CreateServicesSlice> = (set, get) => ({
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
  setlocationField: (field, value) =>
    set((state) => ({
      locationData: { ...state.locationData, [field]: value },
    })),

  clearLocationData: () =>
    set({
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
    }),
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

  goToNextStep: () =>
    set((state) => {
      const { currentStep, createServiceData, isTitleSeted } = state;
      const isTeleconsulta =
        createServiceData.selectedModality === "teleconsulta";

      // Si estamos en el paso 0 (servicesDetails) después de setear el título
      if (currentStep === 0 && isTitleSeted) {
        // Determinar el siguiente paso
        let nextStep = isTeleconsulta ? 2 : 1; // Saltar location si es teleconsulta

        const stepKeys = [
          "servicesDetails",
          "location",
          "comercialSchedule",
          "images",
          "summary",
        ] as const;

        const updatedSteps = stepKeys.map((key, index) => {
          let stepStatus: StepStatus;

          // Si es location y es teleconsulta, marcarlo como finish
          if (index === 1 && isTeleconsulta) {
            stepStatus = "finish";
          } else if (index === nextStep) {
            stepStatus = "process";
          } else if (index < nextStep) {
            stepStatus = "finish";
          } else {
            stepStatus = "wait";
          }

          return { [key]: { status: stepStatus } };
        }) as ServiceStep[];

        return {
          createServiceStep: updatedSteps,
          currentStep: nextStep,
        };
      }

      // Para otros pasos
      let nextStep = currentStep + 1;

      // Si el siguiente paso es location (índice 1) y es teleconsulta, saltarlo
      if (nextStep === 1 && isTeleconsulta) {
        nextStep = 2;
      }

      const stepKeys = [
        "servicesDetails",
        "location",
        "comercialSchedule",
        "images",
        "summary",
      ] as const;

      const updatedSteps = stepKeys.map((key, index) => {
        let stepStatus: StepStatus;

        if (index === 1 && isTeleconsulta) {
          stepStatus = "finish";
        } else if (index === nextStep) {
          stepStatus = "process";
        } else if (index < nextStep) {
          stepStatus = "finish";
        } else {
          stepStatus = "wait";
        }

        return { [key]: { status: stepStatus } };
      }) as ServiceStep[];

      return {
        createServiceStep: updatedSteps,
        currentStep: nextStep,
      };
    }),

  goToPreviousStep: () =>
    set((state) => {
      const { currentStep, createServiceData, isTitleSeted } = state;
      const isTeleconsulta =
        createServiceData.selectedModality === "teleconsulta";

      // Si estamos en el paso 0 (servicesDetails básico) y el título ya está seteado
      // debemos volver al ServiceTittleStep
      if (currentStep === 0 && isTitleSeted) {
        return {
          isTitleSeted: false,
          // Mantener currentStep en 0 y el primer paso en "process"
        };
      }

      // Para otros pasos
      let previousStep = currentStep - 1;

      // Si el paso anterior es location (índice 1) y es teleconsulta, saltarlo
      if (previousStep === 1 && isTeleconsulta) {
        previousStep = 0;
      }

      const stepKeys = [
        "servicesDetails",
        "location",
        "comercialSchedule",
        "images",
        "summary",
      ] as const;

      const updatedSteps = stepKeys.map((key, index) => {
        let stepStatus: StepStatus;

        if (index === 1 && isTeleconsulta) {
          stepStatus = "finish";
        } else if (index === previousStep) {
          stepStatus = "process";
        } else if (index < previousStep) {
          stepStatus = "finish";
        } else {
          stepStatus = "wait";
        }

        return { [key]: { status: stepStatus } };
      }) as ServiceStep[];

      return {
        createServiceStep: updatedSteps,
        currentStep: previousStep,
      };
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
