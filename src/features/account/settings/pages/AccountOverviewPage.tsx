import MCDashboardContent from "@/shared/layout/MCDashboardContent";
import AccountActions, {
  type AccountAction,
} from "@/features/account/components/AccountActions";
import { Mail, RotateCcwKey, UserRoundX } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useGlobalUIStore } from "@/stores/useGlobalUIStore";
import { useIsMobile } from "@/lib/hooks/useIsMobile";
import { useTranslation } from "react-i18next"; // <-- Importa useTranslation

function AccountOverviewPage() {
  const { t } = useTranslation("common"); // <-- Usa useTranslation
  const isMobile = useIsMobile();
  const navigate = useNavigate();
  const setProcessState = useGlobalUIStore(
    (state) => state.setVerificationContext,
  );
  const setVerificationContextStatus = useGlobalUIStore(
    (state) => state.setVerificationContextStatus,
  );
  const actions: AccountAction[] = [
    {
      id: "change-email",
      title: t("account.changeEmail", "Change Email"),
      onClick: () => {
        setProcessState("CHANGE_EMAIL");
        setVerificationContextStatus("PENDING");
        navigate("/settings/verify-identity");
      },
      icon: <Mail strokeWidth={1.5} />,
    },
    {
      id: "change-password",
      title: t("account.changePassword", "Change Password"),
      onClick: () => {
        setProcessState("CHANGE_PASSWORD");
        setVerificationContextStatus("PENDING");
        navigate("/settings/verify-identity");
      },
      icon: <RotateCcwKey strokeWidth={1.5} />,
    },
    {
      id: "delete-account",
      title: t("account.deleteAccount", "Delete Account"),
      onClick: () => {
        setProcessState("DELETE_ACCOUNT");
        setVerificationContextStatus("PENDING");
        navigate("/settings/verify-identity");
      },
      icon: <UserRoundX strokeWidth={1.5} />,
      isDestructive: true,
    },
  ];

  return (
    <MCDashboardContent
      mainWidth={isMobile ? "w-full" : "max-w-2xl"}
      showBackButton={false}
    >
      <div
        className={`flex flex-col gap-6 items-center justify-center w-full mb-8 ${isMobile ? "px-4" : "px-0"}`}
      >
        <div
          className={`w-full flex flex-col gap-2 justify-center items-center ${isMobile ? "min-w-0" : "min-w-xl"}`}
        >
          <h1
            className={`font-medium mb-2 text-center ${isMobile ? "text-3xl" : "text-5xl"}`}
          >
            {t("account.title", "Settings")}
          </h1>
          <p className="text-muted-foreground text-base max-w-md text-center">
            {t(
              "account.description",
              "Manage your account information, update your personal data, or configure deactivation options.",
            )}
          </p>
        </div>
        <AccountActions items={actions} />
      </div>
    </MCDashboardContent>
  );
}

export default AccountOverviewPage;
