import { X, User, MapPin } from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/shared/ui/tabs";
import { useTranslation } from "react-i18next";
import { useState } from "react";
import { useIsMobile } from "@/lib/hooks/useIsMobile";
import GeneralInformation from "./GeneralInfortmation";
import Location from "./Location";
import { useAppStore } from "@/stores/useAppStore";

interface MCSheetHealthCenterProps {
  onOpenChange: (open: boolean) => void;
}

function MCSheetHealthCenter({ onOpenChange }: MCSheetHealthCenterProps) {
  const { t } = useTranslation("center");
  const [activeTab, setActiveTab] = useState("general");
  const isMobile = useIsMobile();

  const user = useAppStore((state) => state.user);

  return (
    <Tabs
      defaultValue="general"
      value={activeTab}
      onValueChange={setActiveTab}
      className={`w-full h-full min-h-full min-w-full ${isMobile ? "flex flex-col" : "grid grid-cols-[35%_65%]"
        }`}
    >
      {/* MOBILE CLOSE BUTTON */}
      {isMobile && (
        <button
          onClick={() => onOpenChange(false)}
          className="fixed right-4 pt-2 z-50 h-12 w-12 rounded-full flex items-center justify-center transition"
          aria-label={t("common.close")}
        >
          <X className="h-6 w-6" />
        </button>
      )}

      {/* MOBILE TABS */}
      {isMobile && (
        <div className="px-4 pt-12 pb-4">
          <h1 className="text-xl font-medium mb-2">{t("editProfile.title")}</h1>
          <div>
            <TabsList className="w-full flex justify-between rounded-2xl">
              <TabsTrigger value="general" className="flex-1 text-xs">
                <User className="h-5 w-5" />
              </TabsTrigger>
              <TabsTrigger value="location" className="flex-1 text-xs">
                <MapPin className="h-5 w-5" />
              </TabsTrigger>
            </TabsList>
          </div>
        </div>
      )}

      {/* DESKTOP SIDEBAR */}
      {!isMobile && (
        <aside className="w-full h-full rounded-l-4xl bg-accent/30 border-r-3 border-accent py-6 m-0 flex flex-col gap-4">
          <div className="w-full px-10 mt-6 flex flex-col gap-2">
            <h1 className="text-xl font-medium">{t("editProfile.title")}</h1>
            <p className="text-base max-w-50 text-left">
              {t("editProfile.subtitle")}
            </p>
          </div>
          <TabsList className="flex flex-col gap-2 w-full justify-center items-center px-6 h-fit">
            <TabsTrigger
              value="general"
              className="text-md rounded-full w-full"
            >
              <div className="flex items-center gap-2 p-2 rounded-full">
                <User className="h-6 w-6 stroke-2" />
                <span className="text-sm font-medium">{t("tabs.general")}</span>
              </div>
            </TabsTrigger>
            <TabsTrigger
              value="location"
              className="text-md rounded-full w-full"
            >
              <div className="flex items-center gap-2 p-2 rounded-full">
                <MapPin className="h-6 w-6 stroke-2" />
                <span className="text-sm font-medium">
                  {t("tabs.location")}
                </span>
              </div>
            </TabsTrigger>
          </TabsList>
        </aside>
      )}

      {/* MAIN CONTENT */}
      <main className="w-full h-full overflow-y-auto">
        {!isMobile && (
          <div className="flex items-center justify-end p-2">
            <button
              className="rounded-full h-8 w-8 flex items-center border-none outline-none ring-none justify-center hover:bg-accent/70 focus:bg-accent active:scale-95 transition-all duration-200"
              aria-label={t("common.close")}
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
                  ? t("tabs.general")
                  : t("tabs.location")}
              </h2>
            </div>
          )}

          {isMobile && (
            <h2 className="text-xl font-medium mb-4">
              {activeTab === "general" ? t("tabs.general") : t("tabs.location")}
            </h2>
          )}

          <TabsContent value="general" className="m-0 p-0">
            <GeneralInformation onOpenChange={onOpenChange} />
          </TabsContent>
          <TabsContent value="location" className="m-0 p-0">
            <Location locationId={user?.centroSalud?.ubicacionId} />
          </TabsContent>
        </div>
      </main>
    </Tabs>
  );
}

export default MCSheetHealthCenter;
