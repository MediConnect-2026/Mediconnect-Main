import type { Conversation } from "@/types/ChatTypes";
import { ChatAvatar } from "./ChatAvatar";
import { cn } from "@/lib/utils";

interface ChatListItemProps {
  conversation: Conversation;
  isActive: boolean;
  onClick: () => void;
}

export function ChatListItem({
  conversation,
  isActive,
  onClick,
}: ChatListItemProps) {
  return (
    <button
      onClick={onClick}
      className={cn(
        "w-full flex items-center gap-3 p-4 text-left transition-colors hover:bg-accent/45 rounded-3xl",
        isActive && "bg-accent/75",
      )}
    >
      <ChatAvatar name={conversation.name} avatar={conversation.avatar} />
      <div className="flex-1 min-w-0">
        <div className="flex items-center justify-between gap-2">
          <h3 className="font-semibold text-foreground truncate">
            {conversation.name}
          </h3>
          <span className="text-xs text-chat-timestamp flex-shrink-0">
            {conversation.time}
          </span>
        </div>
        <p className="text-sm text-muted-foreground truncate mt-0.5">
          {conversation.lastMessage}
        </p>
      </div>
    </button>
  );
}
