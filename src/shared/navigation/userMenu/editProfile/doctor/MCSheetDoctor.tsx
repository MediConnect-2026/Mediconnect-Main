import { useIsMobile } from "@/lib/hooks/useIsMobile";
import {
  X,
  User,
  GraduationCap,
  Languages,
  Shield,
  Briefcase,
} from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/shared/ui/tabs";
import { useState } from "react";
import GeneralInformation from "./GeneralInformation";
import Education from "./Education";
import LanguagesTab from "./Languages";
import Insurance from "./Insurance";
import Experience from "./Experience";

interface MCSheetDoctorProps {
  onOpenChange: (open: boolean) => void;
}

function MCSheetDoctor({ onOpenChange }: MCSheetDoctorProps) {
  const [activeTab, setActiveTab] = useState("general");
  const isMobile = useIsMobile();

  const tabs = [
    { value: "general", label: "Información General", icon: User },
    { value: "formacion", label: "Formación", icon: GraduationCap },
    { value: "idiomas", label: "Idiomas", icon: Languages },
    { value: "seguros", label: "Seguros", icon: Shield },
    { value: "experiencia", label: "Experiencia", icon: Briefcase },
  ];

  const getTabTitle = () => {
    const tab = tabs.find((t) => t.value === activeTab);
    return tab?.label || "";
  };

  return (
    <Tabs
      defaultValue="general"
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
            bg-background shadow-md
            flex items-center justify-center
            transition
          "
          aria-label="Cerrar"
        >
          <X className="h-6 w-6" />
        </button>
      )}

      {/* ================= MOBILE TABS ================= */}
      {isMobile && (
        <div className="px-4 pt-12 pb-4">
          <h1 className="text-xl font-medium mb-2">Editar Perfil</h1>
          <div>
            <TabsList className="w-full flex justify-between rounded-2xl overflow-x-auto">
              {tabs.map(({ value, icon: Icon }) => (
                <TabsTrigger
                  key={value}
                  value={value}
                  className="flex-1 text-xs min-w-fit"
                >
                  <Icon className="h-5 w-5" />
                </TabsTrigger>
              ))}
            </TabsList>
          </div>
        </div>
      )}

      {/* ================= DESKTOP SIDEBAR ================= */}
      {!isMobile && (
        <aside className="w-full h-full rounded-l-4xl bg-accent/30 border-r-3 border-accent py-6 m-0 flex flex-col gap-4">
          <div className="w-full px-10 mt-6 flex flex-col gap-2">
            <h1 className="text-xl font-medium">Editar Perfil</h1>
            <p className="text-base max-w-50 text-left">
              Modifica tu información profesional
            </p>
          </div>

          <TabsList className="flex flex-col gap-2 w-full justify-center items-center px-6 h-fit">
            {tabs.map(({ value, label, icon: Icon }) => (
              <TabsTrigger
                key={value}
                value={value}
                className="text-md rounded-full w-full"
              >
                <div className="flex items-center gap-2 p-2 rounded-full">
                  <Icon className="h-6 w-6 stroke-2" />
                  <span className="text-sm font-medium">{label}</span>
                </div>
              </TabsTrigger>
            ))}
          </TabsList>
        </aside>
      )}

      {/* ================= MAIN CONTENT ================= */}
      <main className="w-full h-full overflow-y-auto">
        {/* Desktop close button */}
        {!isMobile && (
          <div className="flex items-center justify-end p-2">
            <button
              className="rounded-full h-8 w-8 flex items-center border-none outline-none ring-none justify-center hover:bg-accent/70 focus:bg-accent active:scale-95 transition-all duration-200"
              aria-label="Cerrar"
              onClick={() => onOpenChange(false)}
            >
              <X className="h-4 w-4" />
            </button>
          </div>
        )}

        <div className={`${isMobile ? "px-4" : "px-10"} py-6`}>
          {!isMobile && (
            <div className="flex items-center border-b-2 border-border mb-6">
              <h2 className="text-2xl font-medium pb-2">{getTabTitle()}</h2>
            </div>
          )}

          {isMobile && (
            <h2 className="text-xl font-medium mb-4">{getTabTitle()}</h2>
          )}

          <TabsContent value="general" className="m-0 p-0">
            <GeneralInformation onOpenChange={onOpenChange} />
          </TabsContent>

          <TabsContent value="formacion" className="m-0 p-0">
            <Education onOpenChange={onOpenChange} />
          </TabsContent>

          <TabsContent value="idiomas" className="m-0 p-0">
            <LanguagesTab />
          </TabsContent>

          <TabsContent value="seguros" className="m-0 p-0">
            <Insurance />
          </TabsContent>

          <TabsContent value="experiencia" className="m-0 p-0">
            <Experience onOpenChange={onOpenChange} />
          </TabsContent>
        </div>
      </main>
    </Tabs>
  );
}

export default MCSheetDoctor;
