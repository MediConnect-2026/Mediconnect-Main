import React from "react";
import { useIsMobile } from "@/lib/hooks/useIsMobile";
import MCBackButton from "@/shared/components/forms/MCBackButton";
import MCButton from "@/shared/components/forms/MCButton";
import { useTranslation } from "react-i18next";
import { ArrowRightIcon } from "@/shared/ui/arrow-right";

interface AuthFooterContainerProps {
  backButtonProps?: React.ComponentProps<typeof MCBackButton>;
  continueButtonProps?: React.ComponentProps<typeof MCButton>;
  children?: React.ReactNode;
  classname?: string;
  type?: "Continue" | "Save";
  continueButtonWrapper?: React.ComponentType<{ children: React.ReactNode }>;
  canClose?: boolean;
}

const AuthFooterContainer: React.FC<AuthFooterContainerProps> = ({
  backButtonProps,
  continueButtonProps,
  classname,
  type = "Continue",
  continueButtonWrapper: ContinueButtonWrapper,
  canClose = false,
}) => {
  const isMobile = useIsMobile();
  const { t } = useTranslation("auth");
  return (
    <div
      className={`w-full py-6 ${
        isMobile
          ? "flex flex-col-2  justify-between items-center"
          : "grid grid-cols-2  sm:flex sm:justify-between items-center"
      } ${classname}`}
    >
      <div>
        <MCBackButton {...backButtonProps} />
      </div>
      {ContinueButtonWrapper && canClose ? (
        <ContinueButtonWrapper>
          <MCButton
            type="submit"
            icon={<ArrowRightIcon />}
            iconPosition="right"
            {...continueButtonProps}
          >
            {type === "Continue" ? t("footer.continue") : t("footer.save")}
          </MCButton>
        </ContinueButtonWrapper>
      ) : (
        <MCButton
          type="submit"
          icon={<ArrowRightIcon />}
          iconPosition="right"
          {...continueButtonProps}
        >
          {type === "Continue" ? t("footer.continue") : t("footer.save")}
        </MCButton>
      )}
    </div>
  );
};

export default AuthFooterContainer;
