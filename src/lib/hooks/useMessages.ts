import { useInfiniteQuery } from "@tanstack/react-query";
import { QUERY_KEYS } from "@/lib/react-query/config";
import { chatService } from "@/services/chat";
import type {
  GetMessagesResponse,
  GetMessagesParams,
  MessageWithSender,
} from "@/types/ChatTypes";
import { useMemo } from "react";
import { useAppStore } from "@/stores/useAppStore";

/**
 * Hook para obtener mensajes de una conversación con paginación infinita
 * Utiliza useInfiniteQuery para cargar mensajes progresivamente
 * 
 * @param conversacionId - ID de la conversación
 * @param enabled - Si la query debe ejecutarse (default: true)
 * 
 * @returns Infinite query result con mensajes paginados
 * 
 * @example
 * const { messages, fetchNextPage, hasNextPage, isLoading } = useMessages(123);
 */
export const useMessages = (
  conversacionId: number | null,
  enabled: boolean = true
) => {
  const currentUserId = useAppStore((state) => state.user?.id);

  const query = useInfiniteQuery<GetMessagesResponse, Error>({
    queryKey: QUERY_KEYS.MESSAGES(conversacionId!),
    
    queryFn: async ({ pageParam }) => {
      if (!conversacionId) {
        throw new Error("conversacionId es requerido");
      }

      const params: GetMessagesParams = {
        limite: 50,
        ...(pageParam ? { antesDeId: pageParam as number } : {}),
      };

      const response = await chatService.getMessages(conversacionId, params);

      // Ensure all messages have esPropio field correctly set
      // If backend doesn't provide it, calculate it based on current user
      const mensajesWithEsPropio = response.mensajes.map((mensaje: MessageWithSender) => ({
        ...mensaje,
        esPropio: mensaje.esPropio !== undefined
          ? mensaje.esPropio
          : mensaje.remitenteId === currentUserId,
      }));

      return {
        ...response,
        mensajes: mensajesWithEsPropio,
      };
    },

    initialPageParam: undefined,

    enabled: enabled && conversacionId !== null,
    
    getNextPageParam: (lastPage) => {
      // Si no hay más mensajes, no hay siguiente página
      if (!lastPage.tieneMas) {
        return undefined;
      }

      // Si el backend proporciona el cursor, usarlo
      if (lastPage.siguienteCursor) {
        return lastPage.siguienteCursor;
      }

      // Fallback: Si el backend no proporciona el cursor, calcularlo
      // El cursor debe ser el ID del mensaje más antiguo de esta página
      if (lastPage.mensajes.length > 0) {
        // Los mensajes vienen del más reciente al más antiguo, así que el último es el más antiguo
        const oldestMessage = lastPage.mensajes[lastPage.mensajes.length - 1];
        return oldestMessage.id;
      }


      return undefined;
    },

    staleTime: 1000 * 60 * 2, // 2 minutos
    refetchOnMount: false, // No refetch si los datos son frescos
    refetchOnWindowFocus: false, // No refetch al volver a la ventana (WebSocket maneja updates)
  });

  // Flatten pages into chronological order (oldest first → newest last/bottom)
  const messages = useMemo(() => {
    if (!query.data) return [];

    // Problema: El backend retorna mensajes en orden descendente (más reciente primero)
    // La primera página fetcheada son los mensajes más recientes
    // Las páginas subsecuentes (fetcheadas con scroll up) son mensajes más antiguos
    // 
    // Solución:
    // 1. Reverse el array de páginas para que las páginas más antiguas estén primero
    // 2. Reverse cada página para que los mensajes estén en orden ascendente
    // 3. Flatten todo para obtener un array ordenado de antiguo → reciente
    
    const flatMessages = query.data.pages
      .slice() // Crear copia para no mutar el original
      .reverse() // Páginas más antiguas primero (última fetcheada = más antigua)
      .flatMap((page) => [...page.mensajes].reverse()); // Cada página en orden ascendente
    
    
    return flatMessages;
  }, [query.data]);


  return {
    messages,
    isLoading: query.isLoading,
    isError: query.isError,
    error: query.error,
    fetchNextPage: query.fetchNextPage,
    hasNextPage: query.hasNextPage,
    isFetchingNextPage: query.isFetchingNextPage,
    refetch: query.refetch,
  };
};

export default useMessages;
