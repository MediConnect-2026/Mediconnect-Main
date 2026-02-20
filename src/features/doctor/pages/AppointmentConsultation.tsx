import { useState } from "react";
import { useParams } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { ConsultationInfoVertical } from "@/features/teleconsultation/components/ConsultationInfoVertical";
import MCDashboardContent from "@/shared/layout/MCDashboardContent";
import Prescription from "@/features/teleconsultation/components/chatPanel/Prescription";
import { useIsMobile } from "@/lib/hooks/useIsMobile";
import { MessageSquare, Info } from "lucide-react";
import { cn } from "@/lib/utils";

type MobileTab = "notes" | "info";

function AppointmentConsultation() {
  const { appointmentId } = useParams();
  const { t } = useTranslation("doctor");
  const isMobile = useIsMobile();
  const [activeTab, setActiveTab] = useState<MobileTab>("notes");

  // ── Desktop ──────────────────────────────────────────────────────────────────
  if (!isMobile) {
    return (
      <MCDashboardContent mainWidth="w-[100%]" noBg>
        <div className="grid grid-cols-[7fr_3fr] gap-4 w-full items-start">
          <div className="flex flex-col gap-3">
            <div className="bg-background p-6 rounded-3xl border border-primary/15 shadow-sm flex flex-col">
              <h2 className="text-2xl font-semibold text-primary mb-4">
                {t("appointment.consultation.medicalNotes")}
              </h2>
              <Prescription minHeight="500px" maxHeight="900px" />
            </div>
          </div>
          <div className="flex flex-col gap-4">
            <ConsultationInfoVertical appointmentId={appointmentId ?? "1"} />
          </div>
        </div>
      </MCDashboardContent>
    );
  }

  // ── Mobile ───────────────────────────────────────────────────────────────────
  return (
    <MCDashboardContent mainWidth="w-[100%]" noBg>
      {/* Tab switcher */}
      <div className="flex rounded-xl overflow-hidden border border-primary/15 mb-4 bg-background shadow-sm">
        <button
          onClick={() => setActiveTab("notes")}
          className={cn(
            "flex-1 flex items-center justify-center gap-2 py-3 text-sm font-medium transition-colors",
            activeTab === "notes"
              ? "bg-primary text-primary-foreground"
              : "text-muted-foreground hover:text-primary hover:bg-primary/5",
          )}
        >
          <MessageSquare className="w-4 h-4" />
          {t("appointment.consultation.medicalNotes")}
        </button>
        <button
          onClick={() => setActiveTab("info")}
          className={cn(
            "flex-1 flex items-center justify-center gap-2 py-3 text-sm font-medium transition-colors",
            activeTab === "info"
              ? "bg-primary text-primary-foreground"
              : "text-muted-foreground hover:text-primary hover:bg-primary/5",
          )}
        >
          <Info className="w-4 h-4" />
          {t("appointments.table.patient")}
        </button>
      </div>

      {/* Tab content */}
      <div className="w-full">
        {activeTab === "notes" ? (
          <div className="bg-background p-4 rounded-2xl border border-primary/15 shadow-sm flex flex-col">
            <h2 className="text-lg font-semibold text-primary mb-3">
              {t("appointment.consultation.medicalNotes")}
            </h2>
            <Prescription minHeight="400px" maxHeight="70vh" />
          </div>
        ) : (
          <ConsultationInfoVertical appointmentId={appointmentId ?? "1"} />
        )}
      </div>
    </MCDashboardContent>
  );
}

export default AppointmentConsultation;
