import { X, User, FileText, Shield } from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/shared/ui/tabs";
import { useEffect, useMemo, useState } from "react";
import { patientProfileSchema } from "@/schema/profile.schema";
import { useTranslation } from "react-i18next";
import PersonalInformation from "./PersonalInformation";
import ClinicalHistory from "./ClinicalHistory";
import Insurance from "./Insurance";
import { useIsMobile } from "@/lib/hooks/useIsMobile";

interface MCSheetPatientProps {
  onOpenChange: (open: boolean) => void;
  whatTab?:
    | "general"
    | "history"
    | "insurance"
    | "education"
    | "experience"
    | "language"
    | string;
  onInsurancesChanged?: () => void;
  onClinicalHistoryChanged?: () => void;
}

function MCSheetPatient({
  onOpenChange,
  whatTab,
  onInsurancesChanged,
  onClinicalHistoryChanged,
}: MCSheetPatientProps) {
  const { t } = useTranslation("patient");
  const getTabFromWhatTab = (tab?: string) =>
    tab === "history"
      ? "historial"
      : tab === "insurance"
        ? "seguros"
        : "general";

  const [activeTab, setActiveTab] = useState(getTabFromWhatTab(whatTab));
  const isMobile = useIsMobile();

  useEffect(() => {
    if (whatTab) {
      setActiveTab(getTabFromWhatTab(whatTab));
    }
  }, [whatTab]);

  const schema = useMemo(() => patientProfileSchema(t), [t]);

  return (
    <Tabs
      value={activeTab}
      onValueChange={setActiveTab}
      className={`w-full h-full min-h-full min-w-full ${
        isMobile ? "flex flex-col" : "grid grid-cols-[35%_65%]"
      }`}
    >
      {/* ================= MOBILE CLOSE BUTTON ================= */}
      {isMobile && (
        <button
          onClick={() => onOpenChange(false)}
          className="
            fixed right-4 pt-2 z-50
            h-12 w-12 rounded-full
          
            flex items-center justify-center
            transition
          "
          aria-label={t("profileForm.cancel")}
        >
          <X className="h-6 w-6" />
        </button>
      )}

      {/* ================= MOBILE TABS ================= */}
      {isMobile && (
        <div className="px-4 pt-12 pb-4">
          <h1 className="text-xl font-medium mb-2">
            {t("profileForm.editProfile")}
          </h1>
          <div>
            <TabsList className="w-full flex justify-between ounded-2xl">
              <TabsTrigger value="general" className="flex-1 text-xs">
                <User className="h-5 w-5" />
              </TabsTrigger>

              <TabsTrigger value="historial" className="flex-1 text-xs">
                <FileText className="h-5 w-5" />
              </TabsTrigger>

              <TabsTrigger value="seguros" className="flex-1 text-xs">
                <Shield className="h-5 w-5" />
              </TabsTrigger>
            </TabsList>{" "}
          </div>
        </div>
      )}

      {/* ================= DESKTOP SIDEBAR (ORIGINAL DESIGN) ================= */}
      {!isMobile && (
        <aside className="w-full h-full rounded-l-4xl bg-accent/30 border-r-3 border-accent py-6 m-0 flex flex-col gap-4">
          <div className="w-full px-10 mt-6 flex flex-col gap-2">
            <h1 className="text-xl font-medium">
              {t("profileForm.editProfile")}
            </h1>
            <p className="text-base max-w-50 text-left">
              {t("profileForm.editProfileDescription")}
            </p>
          </div>

          <TabsList className="flex flex-col gap-2 w-full justify-center items-center px-6 h-fit">
            <TabsTrigger
              value="general"
              className="text-md rounded-full w-full"
            >
              <div className="flex items-center gap-2 p-2 rounded-full">
                <User className="h-6 w-6 stroke-2" />
                <span className="text-sm font-medium">
                  {t("profileForm.generalInfo")}
                </span>
              </div>
            </TabsTrigger>

            <TabsTrigger
              value="historial"
              className="text-md rounded-full w-full"
            >
              <div className="flex items-center gap-2 p-2 rounded-full">
                <FileText className="h-6 w-6 stroke-2" />
                <span className="text-sm font-medium">
                  {t("profileForm.clinicalHistory")}
                </span>
              </div>
            </TabsTrigger>

            <TabsTrigger
              value="seguros"
              className="text-md rounded-full w-full"
            >
              <div className="flex items-center gap-2 p-2 rounded-full">
                <Shield className="h-6 w-6 stroke-2" />
                <span className="text-sm font-medium">
                  {t("profileForm.insurance")}
                </span>
              </div>
            </TabsTrigger>
          </TabsList>
        </aside>
      )}

      {/* ================= MAIN CONTENT ================= */}
      <main className="w-full h-full overflow-y-auto">
        {/* Desktop close button (original design) */}
        {!isMobile && (
          <div className="flex items-center justify-end p-2">
            <button
              className="rounded-full h-8 w-8 flex items-center border-none outline-none ring-none justify-center hover:bg-accent/70 focus:bg-accent active:scale-95 transition-all duration-200"
              aria-label={t("profileForm.cancel")}
              onClick={() => onOpenChange(false)}
            >
              <X className="h-4 w-4" />
            </button>
          </div>
        )}

        <div className={`${isMobile ? "px-4" : "px-10"} py-6`}>
          {!isMobile && (
            <div className="flex items-center border-b-2 border-border mb-6">
              <h2 className="text-2xl font-medium pb-2">
                {activeTab === "general"
                  ? t("profileForm.generalInfo")
                  : activeTab === "historial"
                    ? t("profileForm.clinicalHistory")
                    : t("profileForm.insurance")}
              </h2>
            </div>
          )}

          {isMobile && (
            <h2 className="text-xl font-medium mb-4">
              {activeTab === "general"
                ? t("profileForm.generalInfo")
                : activeTab === "historial"
                  ? t("profileForm.clinicalHistory")
                  : t("profileForm.insurance")}
            </h2>
          )}

          <TabsContent value="general" className="m-0 p-0">
            <PersonalInformation schema={schema} onOpenChange={onOpenChange} />
          </TabsContent>

          <TabsContent value="historial" className="m-0 p-0">
            <ClinicalHistory
              onClinicalHistoryChanged={onClinicalHistoryChanged}
            />
          </TabsContent>

          <TabsContent value="seguros" className="m-0 p-0">
            <Insurance onInsurancesChanged={onInsurancesChanged} />
          </TabsContent>
        </div>
      </main>
    </Tabs>
  );
}

export default MCSheetPatient;
