import React from "react";
import { MCModalBase } from "@/shared/components/MCModalBase";
import CenterInfoStep1 from "@/features/onboarding/components/center/centerInfoStep/CenterInfoStep1";
import CenterInfoStep2 from "@/features/onboarding/components/center/centerInfoStep/CenterInfoStep2";
import MCStepper from "@/shared/components/MCStepper";
import AuthFooterContainer from "@/features/auth/components/AuthFooterContainer";
import { useAppStore } from "@/stores/useAppStore";
import { MorphingDialogClose } from "@/shared/ui/morphing-dialog";
import { useGlobalUIStore } from "@/stores/useGlobalUIStore";
import { useTranslation } from "react-i18next";

type CenterInfoDialogProps = {
  children?: React.ReactNode;
};

export function CenterInfoDialogTrigger({ children }: CenterInfoDialogProps) {
  return <>{children}</>;
}

function CenterInfoStep({ children }: CenterInfoDialogProps) {
  const { t } = useTranslation("auth");
  const steps = [
    { title: t("centerInfoStep.steps.basic") },
    { title: t("centerInfoStep.steps.location") },
  ];

  const current = useGlobalUIStore((s) => s.onboardingStep);
  const setCurrent = useGlobalUIStore((s) => s.setOnboardingStep);

  const centerSteps = useAppStore((state) => state.centerOnboardingData);
  const [, setStep1Valid] = React.useState(false);

  const centerStep1 =
    centerSteps?.name &&
    centerSteps?.Description &&
    centerSteps?.phone &&
    centerSteps?.website &&
    centerSteps?.centerType &&
    centerSteps?.rnc;

  const centerStep2 =
    centerSteps?.address &&
    centerSteps?.province &&
    centerSteps?.municipality &&
    centerSteps?.coordinates;

  const handleValidationChange = (isValid: boolean) => setStep1Valid(isValid);
  const handleNextStep = () => setCurrent(current + 1);

  return (
    <MCModalBase
      id="center-info-dialog"
      size="xl"
      trigger={children}
      typeclose="Arrow"
      triggerClassName="w-full"
    >
      <div className="w-full flex flex-col items-center justify-center mt-10">
        <h1 className="text-3xl font-semibold text-center text-primary">
          {t("centerInfoStep.title")}
        </h1>
        <div className="w-full flex flex-col items-center flex-1">
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
            <div className="w-full max-w-4xl mx-auto px-4 sm:px-6">
              {current === 0 && (
                <CenterInfoStep1
                  onValidationChange={handleValidationChange}
                  onNext={handleNextStep}
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
                      disabled: !centerStep1,
                    }}
                  />
                </CenterInfoStep1>
              )}
              {current === 1 && (
                <CenterInfoStep2>
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
                      disabled: !centerStep2,
                    }}
                    canClose={true}
                    continueButtonWrapper={MorphingDialogClose}
                  />
                </CenterInfoStep2>
              )}
            </div>
          </div>
        </div>
      </div>
      <div className="w-full flex-shrink-0"></div>
    </MCModalBase>
  );
}

export default CenterInfoStep;
