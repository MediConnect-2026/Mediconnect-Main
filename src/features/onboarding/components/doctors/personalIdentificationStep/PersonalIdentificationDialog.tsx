import React, { useState } from "react";
import { MCModalBase } from "@/shared/components/MCModalBase";
import PersonalIdentificationStep1 from "./PersonalIdentificationStep1";
import PersonalIdentificationStep2 from "./PersonalIdentificationStep2";
import MCStepper from "@/shared/components/MCStepper";
import AuthFooterContainer from "@/features/auth/components/AuthFooterContainer";
import { useGlobalUIStore } from "@/stores/useGlobalUIStore";
import { MorphingDialogClose } from "@/shared/ui/morphing-dialog";
import { useTranslation } from "react-i18next";
type PersonalIdentificationDialogProps = {
  children?: React.ReactNode;
};

function PersonalIdentificationDialog({
  children,
}: PersonalIdentificationDialogProps) {
  const { t } = useTranslation("auth");
  const [isStep1Valid, setIsStep1Valid] = useState(false);
  const [isStep2Valid, setIsStep2Valid] = useState(false);

  const steps = [
    { title: t("personalIdentificationDialog.steps.personal") },
    { title: t("personalIdentificationDialog.steps.professional") },
  ];

  const current = useGlobalUIStore((s) => s.doctorOnboardingStep);
  const setCurrent = useGlobalUIStore((s) => s.setDoctorOnboardingStep);

  const handleNextStep = () => setCurrent(current + 1);

  return (
    <MCModalBase
      id="personal-identification-dialog"
      size="xl"
      trigger={children}
      typeclose="Arrow"
      triggerClassName="w-full"
    >
      <div className="w-full flex flex-col items-center justify-center  mt-10 ">
        <h1 className="text-3xl font-semibold text-center text-primary">
          {t("personalIdentificationDialog.title")}
        </h1>
        <div className="w-full flex flex-col items-center gap- flex-1">
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

          <div className="w-full flex-1 py-4">
            <div className="w-full max-w-4xl mx-auto px-4 sm:px-6 ">
              {current === 0 && (
                <PersonalIdentificationStep1
                  onNext={handleNextStep}
                  onValidationChange={setIsStep1Valid}
                >
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
                      disabled: !isStep1Valid,
                    }}
                  />
                </PersonalIdentificationStep1>
              )}
              {current === 1 && (
                <PersonalIdentificationStep2
                  onValidationChange={setIsStep2Valid}
                >
                  <AuthFooterContainer
                    type="Save"
                    backButtonProps={{
                      onClick: () => {
                        setCurrent(current - 1);
                      },
                      disabled: false,
                    }}
                    continueButtonProps={{
                      type: "submit",
                      disabled: !isStep2Valid,
                    }}
                    canClose={true}
                    continueButtonWrapper={MorphingDialogClose}
                  />
                </PersonalIdentificationStep2>
              )}
            </div>
          </div>
        </div>
      </div>
      <div className="w-full flex-shrink-0 "></div>
    </MCModalBase>
  );
}

export default PersonalIdentificationDialog;
