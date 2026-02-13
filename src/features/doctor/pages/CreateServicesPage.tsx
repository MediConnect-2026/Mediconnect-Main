import MCDashboardContent from "@/shared/layout/MCDashboardContent";
import MCStepper from "@/shared/components/MCStepper";
import { useTranslation } from "react-i18next";
import ServiceTittleStep from "../components/healthService/createService/ServiceTittleStep";
import {
  MapPin,
  Image,
  Stethoscope,
  Calendar,
  CircleCheck,
} from "lucide-react";
import type { StepStatus } from "@/shared/components/MCStepper";
import { useCreateServicesStore } from "@/stores/useCreateServicesStore";
import ServiceBasicInfoStep from "../components/healthService/createService/ServiceBasicInfoStep";
function CreateServicesPage() {
  const { t } = useTranslation("doctor");

  const stepsStatus = useCreateServicesStore(
    (state) => state.createServiceStep,
  );

  const currentFirst = useCreateServicesStore((state) => state.isTitleSeted);
  const titleByStep = [
    t("createService.steps.serviceDetails"),
    t("createService.steps.location"),
    t("createService.steps.comercialSchedule"),
    t("createService.steps.images"),
    t("createService.steps.summary"),
  ];

  const currentStep = useCreateServicesStore((state) => state.currentStep);
  const stepIcons = [
    <Stethoscope />,
    <Image />,
    <Calendar />,
    <MapPin />,
    <CircleCheck />,
  ];

  const steps = stepsStatus.map((step, idx) => {
    const key = Object.keys(step)[0];

    const stepObj = step[key as keyof typeof step] as { status: StepStatus };
    return {
      icon: stepIcons[idx],
      status: stepObj.status,
    };
  });

  return (
    <MCDashboardContent create={true}>
      <div className="w-full flex flex-col items-center justify-center ">
        <div className="flex flex-col justify-center items-center">
          <h1 className="text-lg  text-center text-primary mt-1">
            {titleByStep[currentStep]}
          </h1>
          <span className="opacity-40">Paso {currentStep + 1} de 5</span>
        </div>
        <div className="w-full mt-4">
          <MCStepper items={steps}></MCStepper>
        </div>
      </div>
      <div>
        {currentFirst ? (
          <ServiceBasicInfoStep />
        ) : (
          <ServiceTittleStep></ServiceTittleStep>
        )}
      </div>
      <div className="w-full py-4">
        <div className="w-full  px-4 sm:px-6"></div>
      </div>
    </MCDashboardContent>
  );
}

export default CreateServicesPage;
