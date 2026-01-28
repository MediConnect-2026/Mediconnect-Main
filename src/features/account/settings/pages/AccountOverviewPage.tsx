import React from "react";
import MCDashboardContent from "@/shared/layout/MCDashboardContent";
import AccountActions, {
  type AccountAction,
} from "@/features/account/components/AccountActions";
import { Mail, RotateCcwKey, UserRoundX } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useGlobalUIStore } from "@/stores/useGlobalUIStore";
function AccountOverviewPage() {
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
      title: "Cambiar Correo electrónico",
      onClick: () => {
        setProcessState("CHANGE_EMAIL");
        setVerificationContextStatus("PENDING");
        navigate("/settings/verify-identity");
      },
      icon: <Mail strokeWidth={1.5} />,
    },
    {
      id: "change-password",
      title: "Cambiar Contraseña",
      onClick: () => {
        setProcessState("CHANGE_PASSWORD");
        setVerificationContextStatus("PENDING");
        navigate("/settings/verify-identity");
      },
      icon: <RotateCcwKey strokeWidth={1.5} />,
    },
    {
      id: "delete-account",
      title: "Eliminar Cuenta",
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
    <MCDashboardContent mainWidth="max-w-2xl">
      <div className="flex flex-col gap-6 items-center  justify-center w-full mb-8">
        <div className="w-full min-w-xl flex flex-col gap-2  justify-center items-center">
          <h1 className="text-5xl font-medium mb-2">Configuración</h1>
          <p className="text-muted-foreground text-base max-w-md text-center">
            Administra la información de tu cuenta, actualiza tus datos
            personales o configura opciones de desactivación.
          </p>
        </div>
        <AccountActions items={actions} />
      </div>
    </MCDashboardContent>
  );
}

export default AccountOverviewPage;
