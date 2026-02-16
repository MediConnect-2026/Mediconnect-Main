import MCDashboardContent from "@/shared/layout/MCDashboardContent";
import MCStepper from "@/shared/components/MCStepper";
import { useTranslation } from "react-i18next";
import {
  MapPin,
  Image,
  Stethoscope,
  Calendar,
  CircleCheck,
} from "lucide-react";
import type { StepStatus } from "@/shared/components/MCStepper";
import { useCreateServicesStore } from "@/stores/useCreateServicesStore";
import ServiceTittleStep from "../components/healthService/createService/ServiceTittleStep";
import ServiceBasicInfoStep from "../components/healthService/createService/ServiceBasicInfoStep";
import ServiceLocationStep from "../components/healthService/createService/ServiceLocationStep";
import ServiceScheduleStep from "../components/healthService/createService/ServiceScheduleStep";
import ServiceImagesStep from "../components/healthService/createService/ServiceImagesStep";
import ServiceReviewStep from "../components/healthService/createService/ServiceReviewStep";

function CreateServicesPage() {
  const { t } = useTranslation("doctor");

  const stepsStatus = useCreateServicesStore(
    (state) => state.createServiceStep,
  );
  const currentFirst = useCreateServicesStore((state) => state.isTitleSeted);
  const currentStep = useCreateServicesStore((state) => state.currentStep);
  const createServiceData = useCreateServicesStore((s) => s.createServiceData);

  const isTeleconsulta = createServiceData.selectedModality === "teleconsulta";

  const titleByStep = [
    t("createService.steps.serviceDetails"),
    t("createService.steps.location"),
    t("createService.steps.comercialSchedule"),
    t("createService.steps.images"),
    t("createService.steps.summary"),
  ];

  const stepIcons = [
    <Stethoscope key="stethoscope" />,
    <MapPin key="mappin" />,
    <Calendar key="calendar" />,
    <Image key="image" />,
    <CircleCheck key="check" />,
  ];

  // Filtrar steps y títulos si es teleconsulta
  const filteredStepIcons = isTeleconsulta
    ? [stepIcons[0], stepIcons[2], stepIcons[3], stepIcons[4]]
    : stepIcons;

  const filteredTitleByStep = isTeleconsulta
    ? [titleByStep[0], titleByStep[2], titleByStep[3], titleByStep[4]]
    : titleByStep;

  const filteredStepsStatus = isTeleconsulta
    ? stepsStatus.filter((_, idx) => idx !== 1)
    : stepsStatus;

  const steps = filteredStepsStatus.map((step, idx) => {
    const key = Object.keys(step)[0];
    const stepObj = step[key as keyof typeof step] as { status: StepStatus };

    return {
      icon: filteredStepIcons[idx],
      status: stepObj.status,
    };
  });

  // Renderizar el componente correcto según el paso actual
  const renderStepComponent = () => {
    if (!currentFirst) {
      return <ServiceTittleStep />;
    }

    if (isTeleconsulta) {
      switch (currentStep) {
        case 0:
          return <ServiceBasicInfoStep />;
        case 2:
          return <ServiceScheduleStep />;
        case 3:
          return <ServiceImagesStep />;
        case 4:
          return <ServiceReviewStep />;
        default:
          return <ServiceBasicInfoStep />;
      }
    } else {
      switch (currentStep) {
        case 0:
          return <ServiceBasicInfoStep />;
        case 1:
          return <ServiceLocationStep />;
        case 2:
          return <ServiceScheduleStep />;
        case 3:
          return <ServiceImagesStep />;
        case 4:
          return <ServiceReviewStep />;
        default:
          return <ServiceBasicInfoStep />;
      }
    }
  };

  // Calcular el paso visible (considerando que location puede estar oculto)
  const getVisibleStepNumber = () => {
    if (!currentFirst) return 1;
    if (isTeleconsulta && currentStep >= 2) {
      return currentStep - 1;
    }
    return currentStep + 1;
  };

  const getTotalSteps = () => {
    return isTeleconsulta ? 4 : 5; // 4 pasos si es teleconsulta, 5 si no
  };

  return (
    <MCDashboardContent create={true}>
      <div className="w-full flex flex-col items-center justify-center">
        <div className="flex flex-col justify-center items-center">
          <h1 className="text-lg text-center text-primary mt-1">
            {filteredTitleByStep[getVisibleStepNumber() - 1]}
          </h1>
          <span className="opacity-40">
            Paso {getVisibleStepNumber()} de {getTotalSteps()}
          </span>
        </div>
        <div className="w-full mt-4">
          <MCStepper items={steps} />
        </div>
      </div>
      <div>{renderStepComponent()}</div>
      <div className="w-full py-4">
        <div className="w-full px-4 sm:px-6"></div>
      </div>
    </MCDashboardContent>
  );
}

export default CreateServicesPage;
