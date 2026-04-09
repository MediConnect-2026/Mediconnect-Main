import { useQuery } from "@tanstack/react-query";
import { useEffect } from "react";
import { QUERY_KEYS } from "@/lib/react-query/config";
import { chatService } from "@/services/chat";
import { useAppStore } from "@/stores/useAppStore";
import { useWebSocket } from "@/lib/hooks/useWebSocket";
import type { ConversationWithDetails } from "@/types/ChatTypes";

/**
 * Hook para obtener la lista de conversaciones del usuario autenticado
 * Utiliza React Query para caching y sincronización automática
 * 
 * @returns Query result con conversaciones, estado de carga y error
 * 
 * @example
 * const { conversations, isLoading, error, refetch } = useConversations();
 */
export const useConversations = () => {
  const setConversations = useAppStore((state) => state.setConversations);
  const onlineUsers = useAppStore((state) => state.onlineUsers);
  const { requestConnectionStatus, connectionStatus, joinConversation } = useWebSocket();

  const query = useQuery<ConversationWithDetails[], Error>({
    queryKey: QUERY_KEYS.CONVERSATIONS,
    queryFn: chatService.getConversations,
    staleTime: 1000 * 60 * 2, // 2 minutos (datos cambian frecuentemente)
    refetchOnMount: true, // Siempre refetch al montar
    refetchOnWindowFocus: true, // Refetch al volver a la ventana

    // onSuccess/onError handled with effects below to satisfy strict TS checks
  });

  // Sync data to Zustand store when query data changes
  // Also sync online status from the onlineUsers Set
  useEffect(() => {
    if (query.data) {
      // Enriquecer las conversaciones con el estado de conexión actual
      const conversationsWithOnlineStatus = query.data.map((conv) => ({
        ...conv,
        otroUsuario: {
          ...conv.otroUsuario,
          conectado: onlineUsers.has(conv.otroUsuario.id),
        },
      }));

      setConversations(conversationsWithOnlineStatus);

      // If WebSocket is connected, request connection status and join rooms
      if (connectionStatus === "connected" && query.data.length > 0) {
        const userIds = query.data
          .map((conv) => conv.otroUsuario.id)
          .filter((id): id is number => id !== undefined);
        if (userIds.length > 0) {
          requestConnectionStatus(userIds);
        }

        // Subscribirse explícitamente a las salas de cada conversación
        // Sirve como fallback frente al bug de receptorId del backend
        query.data.forEach((conv) => {
          setTimeout(() => {
            joinConversation(conv.id);
          }, Math.random() * 500); // Stagger joins slightly to prevent flood
        });
      }
    }
  }, [query.data, onlineUsers, connectionStatus, setConversations, requestConnectionStatus, joinConversation]);

  // Log errors
  useEffect(() => {
    if (query.isError) {
      console.error("[useConversations] Error:", query.error);
    }
  }, [query.isError, query.error]);

  return {
    conversations: query.data ?? [],
    isLoading: query.isLoading,
    isError: query.isError,
    error: query.error,
    refetch: query.refetch,
    isFetching: query.isFetching,
  };
};

export default useConversations;
