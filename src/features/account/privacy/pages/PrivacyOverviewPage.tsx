import MCDashboardContent from "@/shared/layout/MCDashboardContent";
import AccountActions, {
  type AccountAction,
} from "@/features/account/components/AccountActions";
import { ShieldCheck, MessageCircle, UserX } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useIsMobile } from "@/lib/hooks/useIsMobile";
import { useTranslation } from "react-i18next";
import { useAppStore } from "@/stores/useAppStore";
import { roleMapping, type AppUserRole } from "@/services/auth/auth.types";

function PrivacyOverviewPage() {
  const { t } = useTranslation("common");
  const navigate = useNavigate();
  const isMobile = useIsMobile();
  const userRole = useAppStore((state) => state.user?.rol);

  // Determinar el rol de aplicación (puede venir en español o inglés)
  const appRole: AppUserRole | undefined = userRole 
    ? (roleMapping[userRole as keyof typeof roleMapping] || userRole as AppUserRole)
    : undefined;

  const allActions: AccountAction[] = [
    {
      id: "profile-privacy",
      title: t("privacy.profilePrivacy"),
      onClick: () => navigate("/privacy/profile"),
      icon: <ShieldCheck strokeWidth={1.5} />,
    },
    {
      id: "messages-privacy",
      title: t("privacy.messagesPrivacy"),
      onClick: () => navigate("/privacy/messages"),
      icon: <MessageCircle strokeWidth={1.5} />,
    },
    {
      id: "blocked-users",
      title: t("privacy.blockedUsers"),
      onClick: () => navigate("/privacy/blocked-users"),
      icon: <UserX strokeWidth={1.5} />,
    },
  ];

  // Filtrar acciones según el rol del usuario
  const actions = allActions.filter((action) => {
    switch (appRole) {
      case 'PATIENT':
        return action.id === 'blocked-users';
      case 'DOCTOR':
      case 'CENTER':
        return action.id === 'messages-privacy' || action.id === 'blocked-users';
      case 'ADMINISTRATOR':
        return true; // Mostrar todas las opciones
      default:
        return true; // Por defecto mostrar todo si no hay rol definido
    }
  });
  return (
    <MCDashboardContent
      mainWidth={isMobile ? "w-full" : "max-w-2xl"}
      disabledBackButton={false}
    >
      <div className="flex flex-col gap-6 items-center justify-center w-full mb-8">
        <div
          className={`w-full flex flex-col gap-2 justify-center items-center ${isMobile ? "min-w-0" : "min-w-xl"}`}
        >
          <h1
            className={`${isMobile ? "text-3xl" : "text-5xl"} font-medium mb-2`}
          >
            {t("privacy.title")}
          </h1>
          <p className="text-muted-foreground text-base max-w-md text-center">
            {t("privacy.description")}
          </p>
        </div>
        <AccountActions items={actions} />
      </div>
    </MCDashboardContent>
  );
}

export default PrivacyOverviewPage;
