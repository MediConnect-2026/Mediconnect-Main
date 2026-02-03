import { Avatar, AvatarFallback, AvatarImage } from "@/shared/ui/avatar";
import { ToggleGroup, ToggleGroupItem } from "@/shared/ui/toggle-group";
import { useAppStore } from "@/stores/useAppStore";
import { MessageCircle, FileText } from "lucide-react";
import { useTranslation } from "react-i18next";

interface ChatHeaderProps {
  isTyping: boolean;
  isOnline: boolean;
  currentView: "chat" | "prescription";
  onViewChange: (view: "chat" | "prescription") => void;
}

export const ChatHeader = ({
  isTyping,
  isOnline,
  currentView,
  onViewChange,
}: ChatHeaderProps) => {
  const isDoctor = useAppStore((state) => state.user?.role === "DOCTOR");
  const { t } = useTranslation("common");

  return (
    <div className="p-4 border-b border-primary/10 flex items-center justify-between">
      <div className="flex items-center gap-3">
        <Avatar className="w-10 h-10">
          <AvatarImage src="https://i.pinimg.com/736x/6b/8b/0a/6b8b0aa412e8b2f5b7587c0e87a2f46e.jpg" />
          <AvatarFallback>CR</AvatarFallback>
        </Avatar>
        <div>
          <h3 className="font-semibold">Dr. Cristiano Ronaldo</h3>
          <p className="text-xs text-muted-foreground">
            {isTyping
              ? "escribiendo..."
              : isOnline
                ? "en línea"
                : "desconectado"}
          </p>
        </div>
      </div>
      {isDoctor && (
        <ToggleGroup
          type="single"
          value={currentView}
          onValueChange={(val) =>
            val && onViewChange(val as "chat" | "prescription")
          }
          className="bg-bg-btn-secondary rounded-full border border-primary/20 py-0.5 px-2 flex gap-1 w-full max-w-[100px] justify-center"
        >
          <ToggleGroupItem
            value="chat"
            aria-label={t("ui.toggle.chat")}
            className={`flex items-center justify-center text-primary rounded-full px-3
              bg-bg-btn-secondary text-primary/35
              data-[state=on]:bg-transparent data-[state=on]:text-primary data-[state=on]:rounded-full data-[state=on]:border-secondary
              hover:bg-bg-btn-secondary/20 hover:text-primary
              active:bg-bg-btn-secondary/30 active:text-primary active:scale-90
              transition-colors duration-150`}
          >
            <MessageCircle className="h-5 w-5" />
          </ToggleGroupItem>
          <ToggleGroupItem
            value="prescription"
            aria-label={t("ui.toggle.note")}
            className={`flex items-center justify-center text-primary rounded-full px-3
              bg-bg-btn-secondary text-primary/35
              data-[state=on]:bg-transparent data-[state=on]:text-primary data-[state=on]:rounded-full data-[state=on]:border-secondary
              hover:bg-bg-btn-secondary/20 hover:text-primary
              active:bg-bg-btn-secondary/30 active:text-primary active:scale-90
              transition-colors duration-150`}
          >
            <FileText className="h-5 w-5" />
          </ToggleGroupItem>
        </ToggleGroup>
      )}
    </div>
  );
};
