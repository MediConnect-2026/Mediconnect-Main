import { Avatar, AvatarFallback, AvatarImage } from "@/shared/ui/avatar";
import { ToggleGroup, ToggleGroupItem } from "@/shared/ui/toggle-group";
import { useAppStore } from "@/stores/useAppStore";
import { MessageCircle, FileText } from "lucide-react";
import { useTranslation } from "react-i18next";

import { MCUserAvatar } from "@/shared/navigation/userMenu/MCUserAvatar";
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
  const user = useAppStore((state) => state.user);
  const isDoctor = user?.rol === "DOCTOR";
  const { t } = useTranslation("common");

  const userAvatar =
    (user as { fotoPerfil?: string; avatar?: string } | null)?.fotoPerfil ??
    (user as { fotoPerfil?: string; avatar?: string } | null)?.avatar ??
    "";

  return (
    <div className="p-3 md:p-4 border-b border-primary/10 flex items-center justify-between gap-2">
      <div className="flex items-center gap-2 md:gap-3 min-w-0 flex-1">
        <div className="w-10 h-10 md:w-12 md:h-12 relative overflow-hidden rounded-full border border-primary/10 bg-muted flex items-center justify-center">
          {userAvatar ? (
            <Avatar className="w-full h-full rounded-full overflow-hidden">
              <AvatarImage
                src={userAvatar}
                alt={t("chatHeader.doctorName")}
                className="w-full h-full object-cover transition-transform duration-500 hover:scale-110"
              />
              <AvatarFallback className="bg-muted text-muted-foreground">
                {(t("chatHeader.doctorName") ?? "")
                  .split(" ")
                  .map((n) => n[0])
                  .join("")}
              </AvatarFallback>
            </Avatar>
          ) : (
            <MCUserAvatar
              name={t("chatHeader.doctorName")}
              square={false}
              size={40}
              className="w-full h-full object-cover transition-transform duration-500 hover:scale-110"
            />
          )}
        </div>
        <div className="min-w-0 flex-1">
          <h3 className="font-semibold text-sm md:text-base truncate">
            {t("chatHeader.doctorName")}
          </h3>
          <p className="text-xs text-muted-foreground truncate">
            {isTyping
              ? t("chatHeader.typing")
              : isOnline
                ? t("chatHeader.online")
                : t("chatHeader.offline")}
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
          className="bg-bg-btn-secondary rounded-full border border-primary/20 py-0.5 px-1 md:px-2 flex gap-0.5 md:gap-1 w-fit flex-shrink-0"
        >
          <ToggleGroupItem
            value="chat"
            aria-label={t("ui.toggle.chat")}
            className={`flex items-center justify-center text-primary rounded-full px-2 md:px-3
              bg-bg-btn-secondary text-primary/35
              data-[state=on]:bg-transparent data-[state=on]:text-primary data-[state=on]:rounded-full data-[state=on]:border-secondary
              hover:bg-bg-btn-secondary/20 hover:text-primary
              active:bg-bg-btn-secondary/30 active:text-primary active:scale-90
              transition-colors duration-150`}
          >
            <MessageCircle className="h-4 w-4 md:h-5 md:w-5" />
          </ToggleGroupItem>
          <ToggleGroupItem
            value="prescription"
            aria-label={t("ui.toggle.note")}
            className={`flex items-center justify-center text-primary rounded-full px-2 md:px-3
              bg-bg-btn-secondary text-primary/35
              data-[state=on]:bg-transparent data-[state=on]:text-primary data-[state=on]:rounded-full data-[state=on]:border-secondary
              hover:bg-bg-btn-secondary/20 hover:text-primary
              active:bg-bg-btn-secondary/30 active:text-primary active:scale-90
              transition-colors duration-150`}
          >
            <FileText className="h-4 w-4 md:h-5 md:w-5" />
          </ToggleGroupItem>
        </ToggleGroup>
      )}
    </div>
  );
};
