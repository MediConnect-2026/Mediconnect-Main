import React from "react";
import { Card } from "@/shared/ui/card";
import { Progress } from "@/shared/ui/progress";
import { CircleSlash, CircleCheck, Loader } from "lucide-react";
import { useTranslation } from "react-i18next";

type VerificationStatus = "PENDING" | "APPROVED" | "REJECTED";

const STATUS = {
  REJECTED: {
    icon: <CircleSlash className="text-[#C62828]" />,
    labelKey: "verification.status.rejected",
    color: "bg-[#C62828]/15 text-[#C62828]",
    textColor: "text-[#C62828]",
  },
  PENDING: {
    icon: <Loader className="text-[#C77A1F] animate-spin" />,
    labelKey: "verification.status.pending",
    color: "bg-[#C77A1F]/15 text-[#C77A1F]",
    textColor: "text-[#C77A1F]",
  },
  APPROVED: {
    icon: <CircleCheck className="text-[#2E7D32]" />,
    labelKey: "verification.status.approved",
    color: "bg-[#2E7D32]/15 text-[#2E7D32]",
    textColor: "text-[#2E7D32]",
  },
} as const;

interface VerificationProgressSidebarProps {
  activeTab: string;
  currentStatus: VerificationStatus;
  isDoctor: boolean;
  onTabChange: (tab: string) => void;
}

function VerificationProgressSidebar({
  activeTab,
  currentStatus,
  isDoctor,
  onTabChange,
}: VerificationProgressSidebarProps) {
  const { t } = useTranslation("common");

  return (
    <aside className="h-fit">
      <Card className="rounded-4xl  h-fit">
        <div className="p-4">
          <div className="flex justify-between items-center">
            <h1 className="text-lg font-semibold">
              {t("verification.progress")}
            </h1>
            <p className="text-sm font-extralight">
              {t("verification.progressPercentage", { percentage: 30 })}
            </p>
          </div>
          <div className="flex flex-col items-start gap-2 mt-2">
            <Progress value={30} className="w-full" />
            <p className="text-sm font-extralight">
              {t("verification.stepsCompleted", { current: 1, total: 4 })}
            </p>
          </div>
        </div>
        <div className="flex flex-col w-full gap-2">
          <button
            type="button"
            onClick={() => onTabChange("identificacion")}
            className={`p-3 text-lg rounded-2xl flex items-center gap-4 justify-start w-full ${
              activeTab === "identificacion"
                ? "bg-bg-btn-secondary"
                : "bg-transparent"
            }`}
          >
            <div className="flex items-center gap-4">
              <div>{STATUS[currentStatus].icon}</div>
              <div className="text-left">
                <p className="font-medium">
                  {isDoctor
                    ? t("verification.identification.title")
                    : t("verification.identification.centerTitle")}
                </p>
                <p className={`text-base ${STATUS[currentStatus].textColor}`}>
                  {t(STATUS[currentStatus].labelKey)}
                </p>
              </div>
            </div>
          </button>
          <button
            type="button"
            onClick={() => onTabChange("documentos")}
            className={`p-3 text-lg rounded-2xl flex items-center gap-4 justify-start w-full ${
              activeTab === "documentos"
                ? "bg-bg-btn-secondary"
                : "bg-transparent"
            }`}
          >
            <div className="flex items-center gap-4">
              <div>{STATUS.PENDING.icon}</div>
              <div className="text-left">
                <p className="font-medium">
                  {t("verification.documents.title")}
                </p>
                <p className={`text-base ${STATUS.PENDING.textColor}`}>
                  {t(STATUS.PENDING.labelKey)}
                </p>
              </div>
            </div>
          </button>
        </div>
      </Card>
    </aside>
  );
}

export default VerificationProgressSidebar;
