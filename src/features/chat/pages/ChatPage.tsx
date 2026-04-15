import { useState, useEffect } from "react";
import { ChatSidebar } from "../components/ChatSidebar";
import { ChatPanel } from "../components/ChatPanel";
import { useIsMobile } from "@/lib/hooks/useIsMobile";
import { useConversations } from "@/lib/hooks/useConversations";
import { useWebSocket } from "@/lib/hooks/useWebSocket";
import { useAppStore } from "@/stores/useAppStore";
import { useParams, useNavigate } from "react-router-dom";
import { Loader2 } from "lucide-react";

const ChatPage = () => {
  const { conversationId } = useParams<{ conversationId: string }>();
  const navigate = useNavigate();
  const isMobile = useIsMobile();

  // Hooks de datos
  const { conversations, isLoading } = useConversations();
  const { isConnected } = useWebSocket();

  // Estado local de UI
  const [sidebarOpen, setSidebarOpen] = useState(true);

  // Estado global de conversación activa
  const activeConversationId = useAppStore(
    (state) => state.activeConversationId,
  );
  const setActiveConversation = useAppStore(
    (state) => state.setActiveConversation,
  );

  // Sincronizar conversationId de URL con store
  useEffect(() => {
    if (conversationId) {
      const convId = parseInt(conversationId, 10);
      if (!isNaN(convId) && convId !== activeConversationId) {
        setActiveConversation(convId);
      }
    }
  }, [conversationId, activeConversationId, setActiveConversation]);

  // Limpiar conversación activa al salir de la página (unmount)
  useEffect(() => {
    return () => {
      setActiveConversation(null);
    };
  }, [setActiveConversation]);

  // Buscar conversación activa
  const activeConversation =
    conversations.find((c) => c.id === activeConversationId) || null;

  const handleSelectConversation = (id: number) => {
    setActiveConversation(id);

    // Navegar a la URL de la conversación
    navigate(`/chat/${id}`);

    if (isMobile) {
      setSidebarOpen(false);
    }
  };

  const handleBackToList = () => {
    if (isMobile) {
      setSidebarOpen(true);
    }
    setActiveConversation(null);
    navigate("/chat");
  };

  // Mostrar loading state
  if (isLoading) {
    return (
      <div className="h-full w-full flex items-center justify-center bg-background rounded-2xl md:rounded-4xl">
        <div className="text-center">
          <Loader2 className="w-8 h-8 animate-spin text-primary mx-auto mb-4" />
          <p className="text-muted-foreground">Cargando conversaciones...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="h-full w-full flex bg-background rounded-2xl md:rounded-4xl overflow-hidden relative">
      {/* Estado de conexión WebSocket (opcional, para debugging) */}

      <ChatSidebar
        conversations={conversations}
        activeConversationId={activeConversationId}
        onSelectConversation={handleSelectConversation}
        isOpen={isMobile ? sidebarOpen : true}
        onClose={() => setSidebarOpen(false)}
      />

      {/* Panel de chat o empty state */}
      {!isMobile || (isMobile && activeConversationId && !sidebarOpen) ? (
        <ChatPanel
          conversation={activeConversation}
          onBack={isMobile ? handleBackToList : undefined}
        />
      ) : (
        <div className="flex-1 flex items-center justify-center bg-background"></div>
      )}
    </div>
  );
};

export default ChatPage;
