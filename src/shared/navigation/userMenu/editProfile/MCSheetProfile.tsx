import { Sheet, SheetContent } from "@/shared/ui/sheet";
import MCSheetPatient from "./patient/MCSheetPatient";
import MCSheetDoctor from "./MCSheetDoctor";
import MCSheetHealthCenter from "./MCSheetHealthCenter";
import { useAppStore } from "@/stores/useAppStore";
import { useIsMobile } from "@/lib/hooks/useIsMobile";
interface MCSheetProfileProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

function MCSheetProfile({ open, onOpenChange }: MCSheetProfileProps) {
  const user = useAppStore((state) => state.user);
  const isMobile = useIsMobile();
  const renderProfileContent = () => {
    switch (user?.role) {
      case "PATIENT":
        return <MCSheetPatient onOpenChange={onOpenChange} />;
      case "DOCTOR":
        return <MCSheetDoctor onOpenChange={onOpenChange} />;
      case "CENTER":
        return <MCSheetHealthCenter onOpenChange={onOpenChange} />;
      default:
        return <MCSheetPatient onOpenChange={onOpenChange} />;
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
            : "w-[900px] border-accent inset-y-0 my-2.5 flex items-center justify-center h-[calc(100%-20px)] rounded-l-4xl"
        }
      >
        {renderProfileContent()}
      </SheetContent>
    </Sheet>
  );
}

export default MCSheetProfile;
