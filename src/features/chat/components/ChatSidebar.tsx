import { Search, ArrowLeft } from "lucide-react";
import { Input } from "@/shared/ui/input";
import type { Conversation } from "@/types/ChatTypes";
import { ChatListItem } from "./ChatListItem";
import { useState } from "react";
import { ScrollArea } from "@/shared/ui/scroll-area";
import { useIsMobile } from "@/lib/hooks/useIsMobile";
import { useTranslation } from "react-i18next";
import { cn } from "@/lib/utils";
import { useNavigate } from "react-router-dom";

interface ChatSidebarProps {
  conversations: Conversation[];
  activeConversationId: string | null;
  onSelectConversation: (id: string) => void;
  isOpen?: boolean;
  onClose?: () => void;
}

export function ChatSidebar({
  conversations,
  activeConversationId,
  onSelectConversation,
  isOpen = true,
  onClose,
}: ChatSidebarProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const isMobile = useIsMobile();
  const { t } = useTranslation("common");
  const navigate = useNavigate();

  const filteredConversations = conversations.filter((conv) =>
    conv.name.toLowerCase().includes(searchQuery.toLowerCase()),
  );

  const handleSelectConversation = (id: string) => {
    onSelectConversation(id);
    navigate(`/chat/${id}`); // <-- Navega a la ruta del chat
    if (isMobile && onClose) {
      onClose();
    }
  };

  return (
    <div
      className={cn(
        "w-full md:w-96 bg-chat-sidebar border-r border-primary/15 flex flex-col h-full",
        // En mobile, usar posicionamiento absoluto cuando hay una conversación activa
        isMobile && activeConversationId && !isOpen && "hidden",
        isMobile && isOpen && "absolute inset-0 z-50",
      )}
    >
      {/* Header del sidebar - solo visible en mobile cuando hay conversación activa */}
      {isMobile && activeConversationId && (
        <div className="flex items-center gap-3 p-4 border-b border-primary/15">
          <button
            onClick={onClose}
            className="p-2 hover:bg-accent/50 rounded-full transition-colors"
            aria-label={t("chatPanel.back") || "Volver"}
          >
            <ArrowLeft size={20} />
          </button>
          <h2 className="text-lg font-semibold">
            {t("chatPanel.conversations") || "Conversaciones"}
          </h2>
        </div>
      )}

      {/* Search bar */}
      <div className="p-3 md:p-4">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder={t("chatPanel.searchChats") || "Buscar Chats"}
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10 bg-background border border-primary/15 rounded-full text-sm"
          />
        </div>
      </div>

      {/* Lista de conversaciones */}
      <ScrollArea className="flex-1">
        <div className="px-2 pb-4 flex flex-col gap-1 md:gap-2">
          {filteredConversations.map((conversation) => (
            <ChatListItem
              key={conversation.id}
              conversation={conversation}
              isActive={activeConversationId === conversation.id}
              onClick={() => handleSelectConversation(conversation.id)}
            />
          ))}

          {filteredConversations.length === 0 && (
            <div className="text-center py-8 px-4">
              <p className="text-sm text-muted-foreground">
                {t("chatPanel.noConversationsFound") ||
                  "No se encontraron conversaciones"}
              </p>
            </div>
          )}
        </div>
      </ScrollArea>
    </div>
  );
}
