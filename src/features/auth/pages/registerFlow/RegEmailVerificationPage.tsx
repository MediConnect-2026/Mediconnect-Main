import MCFormWrapper from "@/shared/components/forms/MCFormWrapper";
import AuthContentContainer from "../../components/AuthContentContainer";
import MCInput from "@/shared/components/forms/MCInput";
import { ForgotPasswordSchema } from "@/schema/AuthSchema";
import { useAppStore } from "@/stores/useAppStore";
import { useTranslation } from "react-i18next";
import AuthFooterContainer from "../../components/AuthFooterContainer";
import { useNavigate } from "react-router-dom";

function RegEmailVerificationPage() {
  const { t } = useTranslation("auth");
  const navigate = useNavigate();

  const registerEmailData = useAppStore((state) => state.registerEmail);
  const setRegisterEmail = useAppStore((state) => state.setRegisterEmail);
  const selectedRole = useAppStore((state) => state.selectedRole);

  const handlesubmit = (data: { email: string }) => {
    setRegisterEmail({ email: data.email });
    navigate("/auth/otp-verification", { replace: true });
  };

  if (!selectedRole) {
    console.log(selectedRole);

    navigate("/auth/register", { replace: true });
  }

  return (
    <AuthContentContainer
      title={t("registerEmailVerifyPage.title")}
      subtitle={t("registerEmailVerifyPage.subtitle")}
    >
      <MCFormWrapper
        schema={ForgotPasswordSchema((key) => t(key))}
        onSubmit={(data) => {
          handlesubmit(data);
        }}
        defaultValues={{
          email: registerEmailData?.email || "",
        }}
        className="flex flex-col items-center w-full"
      >
        <div className="flex flex-col items-center w-full max-w-md mx-auto">
          <MCInput
            name="email"
            type="email"
            label={t("forgotPassword.emailLabel")}
            placeholder={t("forgotPassword.emailPlaceholder")}
          />
          <p className="text-center mt-2 w-full">{registerEmailData?.email}</p>
        </div>
        <AuthFooterContainer
          backButtonProps={{
            onClick: () => {
              navigate("/auth/register");
            },
          }}
        />
      </MCFormWrapper>
      <p>{selectedRole}</p>
    </AuthContentContainer>
  );
}

export default RegEmailVerificationPage;
