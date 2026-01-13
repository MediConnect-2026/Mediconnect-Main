import React, { useState } from "react";
import { MCModalBase } from "@/shared/components/MCModalBase";
import PersonalIdentificationStep1 from "./PersonalIdentificationStep1";
import PersonalIdentificationStep2 from "./PersonalIdentificationStep2";
import MCStepper from "@/shared/components/MCStepper";
import AuthFooterContainer from "@/features/auth/components/AuthFooterContainer";
import { useGlobalUIStore } from "@/stores/useGlobalUIStore";
import { MorphingDialogClose } from "@/shared/ui/morphing-dialog";
import { useAppStore } from "@/stores/useAppStore";
import { useTranslation } from "react-i18next";
type PersonalIdentificationDialogProps = {
  children?: React.ReactNode;
};

function PersonalIdentificationDialog({
  children,
}: PersonalIdentificationDialogProps) {
  const { t } = useTranslation("auth");

  const steps = [
    { title: t("personalIdentificationDialog.steps.personal") },
    { title: t("personalIdentificationDialog.steps.professional") },
  ];

  const current = useGlobalUIStore((s) => s.onboardingStep);
  const setCurrent = useGlobalUIStore((s) => s.setOnboardingStep);
  const [step1Valid, setStep1Valid] = useState(false);
  const doctorsteps = useAppStore((state) => state.doctorOnboardingData);

  const doctorStep1 =
    doctorsteps?.name &&
    doctorsteps?.lastName &&
    doctorsteps?.gender &&
    doctorsteps?.birthDate &&
    doctorsteps?.nationality &&
    doctorsteps?.identityDocument &&
    doctorsteps?.phone;

  const doctorStep2 =
    doctorsteps?.exequatur &&
    doctorsteps?.mainSpecialty &&
    doctorsteps?.secondarySpecialties;

  const handleValidationChange = (isValid: boolean) => setStep1Valid(isValid);
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
        <h1 className="text-3xl font-semibold text-center">
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
                      disabled: !step1Valid || !doctorStep1,
                    }}
                  />
                </PersonalIdentificationStep1>
              )}
              {current === 1 && (
                <PersonalIdentificationStep2>
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
                      disabled: !doctorStep2,
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
