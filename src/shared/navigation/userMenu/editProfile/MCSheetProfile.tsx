import { Sheet, SheetContent } from "@/shared/ui/sheet";
import MCSheetPatient from "./patient/MCSheetPatient";
import MCSheetDoctor from "./doctor/MCSheetDoctor";
import MCSheetHealthCenter from "./center/MCSheetHealthCenter";
import { useAppStore } from "@/stores/useAppStore";
import { useIsMobile } from "@/lib/hooks/useIsMobile";
import { getUserAppRole } from "@/services/auth/auth.types";
interface MCSheetProfileProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  whatTab?: "general" | "history" | "insurance" | "education" | "experience" | "language" | string;
  onClinicalHistoryChanged?: () => void;
  onInsurancesChanged?: () => void;
}

function MCSheetProfile({ open, onOpenChange, whatTab, onClinicalHistoryChanged, onInsurancesChanged }: MCSheetProfileProps) {
  const user = useAppStore((state) => state.user);
  const isMobile = useIsMobile();
  
  const renderProfileContent = () => {
    
    switch (getUserAppRole(user)) {
      case "PATIENT":
        return <MCSheetPatient onOpenChange={onOpenChange} whatTab={whatTab} onClinicalHistoryChanged={onClinicalHistoryChanged} onInsurancesChanged={onInsurancesChanged} />;
      case "DOCTOR":
        return <MCSheetDoctor 
          onOpenChange={onOpenChange} 
          whatTab={whatTab}
        />;
      case "CENTER":
        return <MCSheetHealthCenter onOpenChange={onOpenChange} />;
      default:
        return <MCSheetPatient onOpenChange={onOpenChange} whatTab={whatTab} onClinicalHistoryChanged={onClinicalHistoryChanged} />;
    }
  };

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent
        role="dialog"
        aria-modal="true"
        aria-labelledby="mc-sheet-title"
        aria-describedby="mc-sheet-desc"
        className={
          isMobile
            ? "inset-y-0 my-2.5 flex items-center justify-center h-[calc(100%-20px)] w-[calc(100vw-20px)] ml-[10px] rounded-l-4xl border-accent overflow-hidden"
            : "w-[1000px] border-accent inset-y-0 my-2.5 flex items-center justify-center h-[calc(100%-20px)] rounded-l-4xl"
        }
      >
        {renderProfileContent()}
      </SheetContent>
    </Sheet>
  );
}

export default MCSheetProfile;
