import React from "react";
import { Card } from "@/shared/ui/card";
import { Progress } from "@/shared/ui/progress";
import { CircleSlash, CircleCheck, Loader } from "lucide-react";

type VerificationStatus = "PENDING" | "APPROVED" | "REJECTED";

const STATUS = {
  REJECTED: {
    icon: <CircleSlash className="text-[#C62828]" />,
    label: "Cancelado",
    color: "bg-[#C62828]/15 text-[#C62828]",
    textColor: "text-[#C62828]",
  },
  PENDING: {
    icon: <Loader className="text-[#C77A1F] animate-spin" />,
    label: "En revisión",
    color: "bg-[#C77A1F]/15 text-[#C77A1F]",
    textColor: "text-[#C77A1F]",
  },
  APPROVED: {
    icon: <CircleCheck className="text-[#2E7D32]" />,
    label: "Aceptado",
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
  return (
    <aside className="h-fit">
      <Card className="rounded-2xl md:rounded-4xl h-fit">
        <div className="p-4">
          <div className="flex justify-between items-center">
            <h1 className="text-lg font-semibold">Progreso</h1>
            <p className="text-sm font-extralight">30%</p>
          </div>
          <div className="flex flex-col items-start gap-2 mt-2">
            <Progress value={30} className="w-full" />
            <p className="text-sm font-extralight">1 de 4 pasos completados</p>
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
                    ? "Identificación Personal"
                    : "Información del Centro"}
                </p>
                <p className={`text-base ${STATUS[currentStatus].textColor}`}>
                  {STATUS[currentStatus].label}
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
                <p className="font-medium">Documentos</p>
                <p className={`text-base ${STATUS.PENDING.textColor}`}>
                  {STATUS.PENDING.label}
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
