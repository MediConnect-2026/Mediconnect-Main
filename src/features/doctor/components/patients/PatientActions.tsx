import { useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { useStartConversation } from "@/lib/hooks/useStartConversation";
import { Loader2 } from "lucide-react";

const ROUTES = {
  PATIENT_PROFILE_PUBLIC: "/patient/profile/:patientId",
  PATIENT_DETAILS: "/patient/:patientId/details",
  CHAT_WITH: "/chat/:conversationId",
};

interface PatientActionsProps {
  patient: {
    id: string;
    pacienteId?: string | number;
    conversationId?: string;
  };
}

export default function PatientActions({ patient }: PatientActionsProps) {
  const { t } = useTranslation("doctor");
  const navigate = useNavigate();

  const { startConversation, isLoading: isStartingConversation } = useStartConversation();


  const handleViewDetails = () => {
    navigate(ROUTES.PATIENT_DETAILS.replace(":patientId", patient.id));
  };

  const handleMessage = () => {
    // Si la tabla pasa pacienteId, lo priorizamos (refiere a usuarioId para chat)
    const chatUserId = patient.pacienteId || patient.id;
    if (chatUserId) {
      startConversation(Number(chatUserId));
    }
  };

  return (
    <div className="flex flex-col gap-1 p-2">
      <div
        className="p-2 cursor-pointer rounded-lg hover:bg-accent/70 dark:hover:text-background transition text-sm text-center"
        onClick={handleViewDetails}
      >
        {t("patients.actions.viewDetails")}
      </div>
      <div
        className={`p-2 rounded-lg transition text-sm text-center flex items-center justify-center gap-2 ${isStartingConversation
          ? "bg-blue-500/10 text-blue-600 cursor-not-allowed opacity-75"
          : "cursor-pointer hover:bg-blue-500/10 text-blue-600"
          }`}
        onClick={handleMessage}
      >
        {isStartingConversation && <Loader2 className="w-4 h-4 animate-spin" />}
        {isStartingConversation ? t("common.loading") : t("patients.actions.message")}
      </div>
    </div>
  );
}
