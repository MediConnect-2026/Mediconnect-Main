import { useState, useEffect } from "react";
import { ChatSidebar } from "../components/ChatSidebar";
import { ChatPanel } from "../components/ChatPanel";
import { mockConversations } from "@/data/mockConversations";
import type { Conversation, Message } from "@/types/ChatTypes";
import { useIsMobile } from "@/lib/hooks/useIsMobile";
import {
  Empty,
  EmptyHeader,
  EmptyTitle,
  EmptyDescription,
  EmptyContent,
  EmptyMedia,
} from "@/shared/ui/empty";
import { useParams, useNavigate } from "react-router-dom";
const ChatPage = () => {
  const [conversations, setConversations] =
    useState<Conversation[]>(mockConversations);
  const { conversationId } = useParams<{ conversationId: string }>();
  const navigate = useNavigate();

  const [activeConversationId, setActiveConversationId] = useState<
    string | null
  >(
    conversationId || null, // <-- solo null si no hay conversationId
  );

  useEffect(() => {
    if (conversationId) {
      setActiveConversationId(conversationId);
    }
  }, [conversationId]);

  const [sidebarOpen, setSidebarOpen] = useState(true);
  const isMobile = useIsMobile();

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

  const handleSelectConversation = (id: string) => {
    setActiveConversationId(id);
    if (isMobile) {
      setSidebarOpen(false);
    }
  };

  const handleBackToList = () => {
    if (isMobile) {
      setSidebarOpen(true);
    }
    navigate("/");
  };

  return (
    <div className="h-full w-full flex bg-background rounded-2xl md:rounded-4xl overflow-hidden relative">
      <ChatSidebar
        conversations={conversations}
        activeConversationId={activeConversationId}
        onSelectConversation={handleSelectConversation}
        isOpen={isMobile ? sidebarOpen : true}
        onClose={() => setSidebarOpen(false)}
      />

      {/* Si no hay conversación seleccionada, muestra Empty */}
      {!isMobile || (isMobile && activeConversationId && !sidebarOpen) ? (
        <ChatPanel
          conversation={activeConversation}
          onSendMessage={handleSendMessage}
          onBack={isMobile ? handleBackToList : undefined}
        />
      ) : (
        <div className="flex-1 flex items-center justify-center bg-background">
          <Empty>
            <EmptyHeader>
              <EmptyMedia />
              <EmptyTitle>Selecciona un chat</EmptyTitle>
              <EmptyDescription>
                Elige una conversación en la barra lateral para comenzar a
                chatear.
              </EmptyDescription>
            </EmptyHeader>
            <EmptyContent />
          </Empty>
        </div>
      )}
    </div>
  );
};

export default ChatPage;
