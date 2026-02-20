import { useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";

const ROUTES = {
  PATIENT_PROFILE_PUBLIC: "/patient/profile/:patientId",
  PATIENT_DETAILS: "/patient/:patientId/details",
  CHAT_WITH: "/chat/:conversationId",
};

interface PatientActionsProps {
  patient: {
    id: string;
    conversationId?: string;
  };
}

export default function PatientActions({ patient }: PatientActionsProps) {
  const { t } = useTranslation("doctor");
  const navigate = useNavigate();

  const handleViewProfile = () => {
    navigate(ROUTES.PATIENT_PROFILE_PUBLIC.replace(":patientId", patient.id));
  };

  const handleViewDetails = () => {
    navigate(ROUTES.PATIENT_DETAILS.replace(":patientId", patient.id));
  };

  const handleMessage = () => {
    const conversationId = patient.conversationId ?? patient.id;
    navigate(ROUTES.CHAT_WITH.replace(":conversationId", conversationId));
  };

  return (
    <div className="flex flex-col gap-1 p-2">
      <div
        className="p-2 cursor-pointer rounded-lg hover:bg-accent/70 dark:hover:text-background transition text-sm text-center"
        onClick={handleViewProfile}
      >
        {t("patients.actions.viewProfile")}
      </div>
      <div
        className="p-2 cursor-pointer rounded-lg hover:bg-accent/70 dark:hover:text-background transition text-sm text-center"
        onClick={handleViewDetails}
      >
        {t("patients.actions.viewDetails")}
      </div>
      <div
        className="p-2 cursor-pointer rounded-lg hover:bg-blue-500/10 text-blue-600 transition text-sm text-center"
        onClick={handleMessage}
      >
        {t("patients.actions.message")}
      </div>
    </div>
  );
}
