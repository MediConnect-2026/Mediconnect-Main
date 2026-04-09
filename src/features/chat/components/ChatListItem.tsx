import type { ConversationWithDetails } from "@/types/ChatTypes";
import { ChatAvatar } from "./ChatAvatar";
import { cn } from "@/lib/utils";
import { formatDistanceToNow } from "date-fns";
import { es } from "date-fns/locale";
import { t } from "i18next";
import { useTranslation } from "react-i18next";

interface ChatListItemProps {
  conversation: ConversationWithDetails;
  isActive: boolean;
  onClick: () => void;
}

/**
 * Formatear timestamp relativo (ej: "hace 5 min")
 */
const formatRelativeTime = (timestamp: string): string => {
  try {
    return formatDistanceToNow(new Date(timestamp), {
      addSuffix: true,
      locale: es,
    });
  } catch {
    return "";
  }
};

/**
 * Obtener preview del último mensaje
 */
const getMessagePreview = (conversation: ConversationWithDetails): string => {
  const { ultimoMensaje } = conversation;
  const { t, i18n } = useTranslation("common");
  
  if (!ultimoMensaje) {
    return t("chat.chatListItem.noMessages") || "Sin mensajes aún";
  }

  // Mapear tipo de mensaje a emoji/texto
  switch (ultimoMensaje.tipo) {
    case "imagen":
      return "📷 Imagen";
    case "audio":
      return "🎤 Audio";
    case "video":
      return "🎥 Video";
    case "archivo":
      return "📎 Archivo";
    case "texto":
    default: {
      const content = ultimoMensaje.contenido || "Mensaje";
      return content.length > 25 ? `${content.slice(0, 25)}…` : content;
    }
  }
};

export function ChatListItem({
  conversation,
  isActive,
  onClick,
}: ChatListItemProps) {
  const { otroUsuario, ultimoMensaje, mensajesNoLeidos } = conversation;
  const userName = `${otroUsuario.nombre} ${otroUsuario.apellido}`;
  const lastMessageTime = ultimoMensaje?.enviadoEn || conversation.creadoEn;
  const hasUnread = mensajesNoLeidos > 0;

  return (
    <button
      onClick={onClick}
      className={cn(
        "w-full flex items-center gap-2 md:gap-3 p-3 md:p-4 text-left transition-colors hover:bg-accent/45 rounded-2xl md:rounded-3xl relative",
        isActive && "bg-accent/75",
      )}
    >
      <ChatAvatar
        name={userName}
        avatar={otroUsuario.fotoPerfil}
        size="md"
        isOnline={otroUsuario.conectado}
      />
      
      <div className="flex-1 min-w-0">
        <div className="flex items-center justify-between gap-2">
          <h3
            className={cn(
              "text-sm md:text-base truncate",
              hasUnread ? "font-bold text-foreground" : "font-semibold text-foreground"
            )}
          >
            {userName}
          </h3>
          <span className="text-xs text-chat-timestamp flex-shrink-0">
            {formatRelativeTime(lastMessageTime)}
          </span>
        </div>
        
        <div className="flex items-center justify-between gap-2 mt-0.5">
          <p
            className={cn(
              "text-xs md:text-sm truncate",
              hasUnread ? "font-medium text-foreground" : "text-muted-foreground"
            )}
          >
            {getMessagePreview(conversation)}
          </p>
          
          {hasUnread && (
            <span className="flex-shrink-0 bg-primary text-primary-foreground text-xs font-bold rounded-full min-w-[20px] h-5 px-1.5 flex items-center justify-center">
              {mensajesNoLeidos > 99 ? "99+" : mensajesNoLeidos}
            </span>
          )}
        </div>
      </div>
    </button>
  );
}
