import React, { useState } from "react";
import { MCModalBase } from "@/shared/components/MCModalBase";
import PersonalIdentificationStep1 from "./PersonalIdentificationStep1";
import PersonalIdentificationStep2 from "./PersonalIdentificationStep2";
import MCStepper from "@/shared/components/MCStepper";
import AuthFooterContainer from "@/features/auth/components/AuthFooterContainer";
const steps = [
  { title: "Datos personales" },
  { title: "Información profesional" },
];

type PersonalIdentificationDialogProps = {
  children?: React.ReactNode;
};

export function PersonalIdentificationDialogTrigger({
  children,
}: PersonalIdentificationDialogProps) {
  return <>{children}</>;
}

function PersonalIdentificationDialog({
  children,
}: PersonalIdentificationDialogProps) {
  const [current, setCurrent] = useState(0);

  return (
    <MCModalBase
      id="personal-identification-dialog"
      size="xl"
      trigger={children}
      typeclose="Arrow"
    >
      <div className="w-full flex flex-col items-center justify-center min-h-[70vh] py-10">
        <h1 className="text-3xl font-semibold text-center">
          Identificación profesional
        </h1>
        <div className="w-full flex flex-col items-center gap-8 flex-1">
          <div className="max-w-md w-full mx-auto h-fit">
            <MCStepper
              items={steps}
              current={current}
              onChange={setCurrent}
              showLabels={true}
              size="default"
              className="mt-8 mb-4"
            />
          </div>

          <div className="w-full mt-8 flex-1 bg-red-500">
            <div className="w-full">
              {current === 0 && <PersonalIdentificationStep1 />}
              {current === 1 && <PersonalIdentificationStep2 />}
            </div>
          </div>
        </div>
      </div>
      <div className="w-full flex-shrink-0 mt-8">
        <AuthFooterContainer
          backButtonProps={{
            onClick: () => {
              if (current > 0) {
                setCurrent(current - 1);
              }
            },
            disabled: current === 0,
          }}
          continueButtonProps={{
            onClick: () => {
              if (current < steps.length - 1) {
                setCurrent(current + 1);
              }
            },
            disabled: current === steps.length - 1,
          }}
        />
      </div>
    </MCModalBase>
  );
}

export default PersonalIdentificationDialog;
