import { useState } from "react";
import { ChatSidebar } from "../components/ChatSidebar";
import { ChatPanel } from "../components/ChatPanel";
import { mockConversations } from "@/data/mockConversations";
import type { Conversation, Message } from "@/types/ChatTypes";

const ChatPage = () => {
  const [conversations, setConversations] =
    useState<Conversation[]>(mockConversations);
  const [activeConversationId, setActiveConversationId] = useState<
    string | null
  >(mockConversations[0]?.id || null);

  const activeConversation =
    conversations.find((c) => c.id === activeConversationId) || null;

  const handleSendMessage = (
    text: string,
    image?: string | null,
    file?: { file: File; url: string; type: string } | null,
    voice?: { duration: number; url: string } | null,
  ) => {
    if (!activeConversationId) return;

    const currentTime = new Date().toLocaleTimeString("es-ES", {
      hour: "numeric",
      minute: "2-digit",
      hour12: true,
    });

    const newMessages: Message[] = [];

    // Si hay una grabación de voz
    if (voice) {
      newMessages.push({
        id: Date.now().toString(),
        type: "voice",
        content: voice.url,
        sender: "user",
        time: currentTime,
        status: "sent",
        duration: voice.duration,
      });
    }
    // Si hay una imagen
    else if (image) {
      newMessages.push({
        id: Date.now().toString(),
        type: "image",
        content: image,
        sender: "user",
        time: currentTime,
        status: "sent",
        caption: text.trim() || undefined,
      });
    }
    // Si hay un archivo
    else if (file) {
      newMessages.push({
        id: Date.now().toString(),
        type: "file",
        content: file.url,
        sender: "user",
        time: currentTime,
        status: "sent",
        fileName: file.file.name,
        fileSize: file.file.size,
        fileType: file.type,
        caption: text.trim() || undefined,
      });
    }
    // Si solo hay texto
    else if (text.trim()) {
      newMessages.push({
        id: Date.now().toString(),
        type: "text",
        content: text,
        sender: "user",
        time: currentTime,
        status: "sent",
      });
    }

    // Actualizar las conversaciones con los nuevos mensajes
    if (newMessages.length > 0) {
      setConversations((prev) =>
        prev.map((conv) =>
          conv.id === activeConversationId
            ? {
                ...conv,
                messages: [...conv.messages, ...newMessages],
                lastMessage: voice
                  ? "🎤 Mensaje de voz"
                  : text.trim() || (image ? "📷 Imagen" : "📎 Archivo"),
                time: "Ahora",
              }
            : conv,
        ),
      );
    }
  };

  return (
    <div className="h-full w-full flex bg-background rounded-4xl overflow-hidden">
      <ChatSidebar
        conversations={conversations}
        activeConversationId={activeConversationId}
        onSelectConversation={setActiveConversationId}
      />
      <ChatPanel
        conversation={activeConversation}
        onSendMessage={handleSendMessage}
      />
    </div>
  );
};

export default ChatPage;
