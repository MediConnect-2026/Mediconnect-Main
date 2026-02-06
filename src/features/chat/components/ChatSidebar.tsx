import { Search } from "lucide-react";
import { Input } from "@/shared/ui/input";
import type { Conversation } from "@/types/ChatTypes";
import { ChatListItem } from "./ChatListItem";
import { useState } from "react";
import { ScrollArea } from "@/shared/ui/scroll-area";

interface ChatSidebarProps {
  conversations: Conversation[];
  activeConversationId: string | null;
  onSelectConversation: (id: string) => void;
}

export function ChatSidebar({
  conversations,
  activeConversationId,
  onSelectConversation,
}: ChatSidebarProps) {
  const [searchQuery, setSearchQuery] = useState("");

  const filteredConversations = conversations.filter((conv) =>
    conv.name.toLowerCase().includes(searchQuery.toLowerCase()),
  );

  return (
    <div className="w-full md:w-96 bg-chat-sidebar border-r border-primary/15 flex flex-col h-full">
      <div className="p-4">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Buscar Chats"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10 bg-background border border-primary/15 rounded-full"
          />
        </div>
      </div>
      <ScrollArea className="flex-1">
        <div className="px-2 pb-4 flex flex-col gap-2">
          {filteredConversations.map((conversation) => (
            <ChatListItem
              key={conversation.id}
              conversation={conversation}
              isActive={activeConversationId === conversation.id}
              onClick={() => onSelectConversation(conversation.id)}
            />
          ))}
        </div>
      </ScrollArea>
    </div>
  );
}
