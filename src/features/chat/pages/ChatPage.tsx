import { useState, useEffect, useMemo } from "react";
import { ChatSidebar } from "../components/ChatSidebar";
import { ChatPanel } from "../components/ChatPanel";
import { useIsMobile } from "@/lib/hooks/useIsMobile";
import { useConversations } from "@/lib/hooks/useConversations";
import { useWebSocket } from "@/lib/hooks/useWebSocket";
import { useAppStore } from "@/stores/useAppStore";
import { useParams, useNavigate, useLocation } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { useQuery } from "@tanstack/react-query";
import { QUERY_KEYS } from "@/lib/react-query/config";
import { chatService } from "@/services/chat";

const ChatPage = () => {
  const { conversationId } = useParams<{ conversationId: string }>();
  const navigate = useNavigate();
  const location = useLocation();
  const isMobile = useIsMobile();
  const { t } = useTranslation("common");

  // Hooks de datos
  const { conversations, isLoading, isFetching } = useConversations();
  const { isConnected } = useWebSocket();

  // Estado local de UI
  const [sidebarOpen, setSidebarOpen] = useState(true);

  // Estado global de conversación activa
  const activeConversationId = useAppStore((state) => state.activeConversationId);
  const setActiveConversation = useAppStore((state) => state.setActiveConversation);

  const parsedConversationId = useMemo(() => {
    if (!conversationId) return null;
    const convId = parseInt(conversationId, 10);
    return Number.isNaN(convId) ? null : convId;
  }, [conversationId]);

  const openingFromContact = Boolean(
    (location.state as { openingConversation?: boolean } | null)
      ?.openingConversation,
  );

  // Sincronizar conversationId de URL con store
  useEffect(() => {
    if (parsedConversationId !== null && parsedConversationId !== activeConversationId) {
      setActiveConversation(parsedConversationId);
    }
  }, [parsedConversationId, activeConversationId, setActiveConversation]);

  // En mobile, si hay conversación en URL, abrir directamente el panel de chat
  useEffect(() => {
    if (!isMobile) return;
    if (parsedConversationId !== null) {
      setSidebarOpen(false);
    }
  }, [isMobile, parsedConversationId]);

  // Limpiar conversación activa al salir de la página (unmount)
  useEffect(() => {
    return () => {
      setActiveConversation(null);
    };
  }, [setActiveConversation]);

  // Buscar conversación activa
  const activeConversation = conversations.find(
    (c) => c.id === activeConversationId
  ) || null;

  const { data: conversationById, isLoading: isLoadingConversationById } = useQuery({
    queryKey:
      parsedConversationId !== null
        ? QUERY_KEYS.CONVERSATION_BY_ID(parsedConversationId)
        : QUERY_KEYS.CONVERSATION_BY_ID("pending"),
    queryFn: () => chatService.getConversationById(parsedConversationId as number),
    enabled: parsedConversationId !== null && !activeConversation,
    staleTime: 0,
    retry: 1,
  });

  const effectiveConversation = activeConversation || conversationById || null;

  const shouldShowConversationOverlay =
    parsedConversationId !== null &&
    (isLoadingConversationById ||
      ((openingFromContact || isLoading || isFetching) && !effectiveConversation));

  // Limpiar flag de navegación cuando la conversación ya está lista
  useEffect(() => {
    if (!openingFromContact) return;
    if (!effectiveConversation) return;

    navigate(location.pathname, {
      replace: true,
      state: {},
    });
  }, [openingFromContact, effectiveConversation, navigate, location.pathname]);

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
  if (isLoading && parsedConversationId === null) {
    return (
      <div className="h-full w-full flex items-center justify-center bg-background rounded-2xl md:rounded-4xl">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">{t("chatPanel.loading")}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="h-full w-full flex bg-background rounded-2xl md:rounded-4xl overflow-hidden relative">
      {shouldShowConversationOverlay && (
        <div className="absolute inset-0 z-40 bg-background/85 backdrop-blur-[1px] flex items-center justify-center">
          <div className="text-center">
            <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-primary mx-auto mb-3"></div>
            <p className="text-sm text-muted-foreground">
              {t("chatPanel.loadingConversation", "Cargando conversación...")}
            </p>
          </div>
        </div>
      )}

      {/* Estado de conexión WebSocket (opcional, para debugging) */}
      {!isConnected && (
        <div className="absolute top-2 left-1/2 transform -translate-x-1/2 z-50">
          <div className="bg-yellow-100 text-yellow-800 text-xs px-3 py-1 rounded-full">
            Reconectando...
          </div>
        </div>
      )}

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
          conversation={effectiveConversation}
          onBack={isMobile ? handleBackToList : undefined}
        />
      ) : (
        <div className="flex-1 flex items-center justify-center bg-background"></div>
      )}
    </div>
  );
};

export default ChatPage;
