import apiClient from "../api/client";
import API_ENDPOINTS from "../api/endpoints";
import type {
  ConversationWithDetails,
  CreateConversationRequest,
  CreateConversationResponse,
  SendTextMessageRequest,
  SendMediaMessageRequest,
  MessageWithSender,
  UnreadCountResponse,
  GetMessagesParams,
  GetMessagesResponse,
} from "@/types/ChatTypes";

/**
 * Servicio de Chat - Operaciones REST para conversaciones y mensajes
 * Maneja comunicación con el backend para operaciones CRUD de chat
 */
export const chatService = {
  // ============================================
  // CONVERSACIONES
  // ============================================

  /**
   * Obtener lista de conversaciones del usuario autenticado
   * GET /conversaciones
   * @returns Lista de conversaciones con último mensaje y contador de no leídos
   */
  getConversations: async (): Promise<ConversationWithDetails[]> => {
    try {
      const { data } = await apiClient.get<{ success: boolean; mensaje: string; data: { conversaciones: ConversationWithDetails[]; total: number; totalNoLeidos: number } }>(
        API_ENDPOINTS.CONVERSATIONS.BASE
      );
      return data.data.conversaciones ?? [];
    } catch (error) {
      console.error("[chatService.getConversations] Error:", error);
      throw error;
    }
  },

  /**
   * Obtener o crear conversación con otro usuario
   * POST /conversaciones/obtener-o-crear
   * @param receptorId - ID del usuario con quien conversar
   * @returns Conversación existente o nueva
   */
  getOrCreateConversation: async (
    receptorId: number
  ): Promise<CreateConversationResponse> => {
    try {
      const payload: CreateConversationRequest = { receptorId };
      const { data } = await apiClient.post<CreateConversationResponse>(
        API_ENDPOINTS.CONVERSATIONS.GET_OR_CREATE,
        payload
      );
      return data;
    } catch (error) {
      console.error("[chatService.getOrCreateConversation] Error:", error);
      throw error;
    }
  },

  /**
   * Obtener detalles de una conversación por ID
   * GET /conversaciones/:id
   * @param conversacionId - ID de la conversación
   * @returns Detalles completos de la conversación
   */
  getConversationById: async (
    conversacionId: number
  ): Promise<ConversationWithDetails> => {
    try {
      const { data } = await apiClient.get<
        ConversationWithDetails | { data: ConversationWithDetails }
      >(API_ENDPOINTS.CONVERSATIONS.BY_ID(conversacionId));
      const raw = data && typeof data === "object" && "data" in data
        ? (data as { data: ConversationWithDetails }).data
        : (data as ConversationWithDetails);
      if (!raw || typeof raw !== "object") throw new Error("Conversation response invalid");
      const conv = raw as ConversationWithDetails & { conversacionId?: number };
      const id = conv.id ?? conv.conversacionId ?? conversacionId;
      return { ...conv, id } as ConversationWithDetails;
    } catch (error) {
      console.error("[chatService.getConversationById] Error:", error);
      throw error;
    }
  },

  // ============================================
  // MENSAJES
  // ============================================

  /**
   * Obtener mensajes de una conversación (con paginación)
   * GET /conversaciones/:id/mensajes
   * @param conversacionId - ID de la conversación
   * @param params - Parámetros de paginación y búsqueda
   * @returns Lista de mensajes con información del remitente
   */
  getMessages: async (
    conversacionId: number,
    params?: GetMessagesParams
  ): Promise<GetMessagesResponse> => {
    try {
      const { data } = await apiClient.get<{
        success: boolean;
        mensaje: string;
        paginacion: {
          pagina: number;
          limite: number;
          total: number;
          hayMas: boolean;
        };
        data: MessageWithSender[];
      }>(
        API_ENDPOINTS.CONVERSATIONS.MESSAGES(conversacionId),
        { params }
      );
      
      console.log("[chatService.getMessages] Raw response:", {
        messagesCount: data.data?.length,
        paginacion: data.paginacion,
        firstMessageId: data.data?.[0]?.id,
        lastMessageId: data.data?.[data.data.length - 1]?.id,
      });
      
      return {
        mensajes: data.data ?? [],
        tieneMas: data.paginacion?.hayMas ?? false,
        siguienteCursor: data.data && data.data.length > 0 
          ? data.data[data.data.length - 1].id // El último mensaje (más antiguo) es el cursor
          : undefined,
      };
    } catch (error) {
      console.error("[chatService.getMessages] Error:", error);
      throw error;
    }
  },

  /**
   * Enviar mensaje de texto
   * POST /conversaciones/:id/mensajes
   * @param request - Datos del mensaje de texto
   * @returns Mensaje creado con información completa
   */
  sendTextMessage: async (
    request: SendTextMessageRequest
  ): Promise<MessageWithSender> => {
    try {
      const { conversacionId, contenido } = request;
      const payload = {
        contenido,
        tipo: "texto",
      };
      const { data } = await apiClient.post<MessageWithSender>(
        API_ENDPOINTS.CONVERSATIONS.SEND_MESSAGE(conversacionId),
        payload
      );
      return data;
    } catch (error) {
      console.error("[chatService.sendTextMessage] Error:", error);
      throw error;
    }
  },

  /**
   * Enviar mensaje con archivo multimedia
   * POST /conversaciones/:id/mensajes
   * @param request - Datos del mensaje con media
   * @returns Mensaje creado con información completa
   */
  sendMediaMessage: async (
    request: SendMediaMessageRequest
  ): Promise<MessageWithSender> => {
    try {
      const { conversacionId, mediaId, tipo, contenido  } = request;
      const payload = {
        mediaId,
        tipo,
        ...(contenido && { contenido }), // contenido como contenido
      };
      const { data } = await apiClient.post<MessageWithSender>(
        API_ENDPOINTS.CONVERSATIONS.SEND_MESSAGE(conversacionId),
        payload
      );
      return data;
    } catch (error) {
      console.error("[chatService.sendMediaMessage] Error:", error);
      throw error;
    }
  },

  /**
   * Editar un mensaje existente
   * PATCH /mensajes/:id
   * @param mensajeId - ID del mensaje a editar
   * @param nuevoContenido - Nuevo contenido del mensaje
   * @returns Mensaje actualizado
   */
  editMessage: async (
    mensajeId: number,
    nuevoContenido: string
  ): Promise<MessageWithSender> => {
    try {
      const { data } = await apiClient.patch<MessageWithSender>(
        API_ENDPOINTS.MESSAGES.EDIT(mensajeId),
        { contenido: nuevoContenido }
      );
      return data;
    } catch (error) {
      console.error("[chatService.editMessage] Error:", error);
      throw error;
    }
  },

  /**
   * Eliminar un mensaje (soft delete)
   * DELETE /mensajes/:id
   * @param mensajeId - ID del mensaje a eliminar
   */
  deleteMessage: async (mensajeId: number): Promise<void> => {
    try {
      await apiClient.delete(API_ENDPOINTS.MESSAGES.DELETE(mensajeId));
    } catch (error) {
      console.error("[chatService.deleteMessage] Error:", error);
      throw error;
    }
  },

  /**
   * Marcar mensajes de una conversación como leídos
   * POST /conversaciones/:id/marcar-leidos
   * @param conversacionId - ID de la conversación
   * @param ultimoMensajeLeidoId - ID del último mensaje leído
   */
  markMessagesAsRead: async (conversacionId: number, ultimoMensajeLeidoId: number): Promise<void> => {
    try {
      await apiClient.post(
        API_ENDPOINTS.CONVERSATIONS.MARK_READ(conversacionId),
        { ultimoMensajeLeidoId }
      );
    } catch (error) {
      console.error("[chatService.markMessagesAsRead] Error:", error);
      throw error;
    }
  },

  /**
   * Obtener contador de mensajes no leídos de una conversación
   * GET /conversaciones/:id/no-leidos
   * @param conversacionId - ID de la conversación
   * @returns Contador de mensajes no leídos
   */
  getUnreadCount: async (
    conversacionId: number
  ): Promise<UnreadCountResponse> => {
    try {
      const { data } = await apiClient.get<UnreadCountResponse>(
        API_ENDPOINTS.CONVERSATIONS.UNREAD_COUNT(conversacionId)
      );
      return data;
    } catch (error) {
      console.error("[chatService.getUnreadCount] Error:", error);
      throw error;
    }
  },

  /**
   * Buscar mensajes en una conversación
   * GET /conversaciones/:id/buscar
   * @param conversacionId - ID de la conversación
   * @param query - Término de búsqueda
   * @returns Lista de mensajes que coinciden con la búsqueda
   */
  searchMessages: async (
    conversacionId: number,
    query: string
  ): Promise<MessageWithSender[]> => {
    try {
      const { data } = await apiClient.get<MessageWithSender[]>(
        API_ENDPOINTS.CONVERSATIONS.SEARCH_MESSAGES(conversacionId),
        { params: { buscar: query } }
      );
      return data;
    } catch (error) {
      console.error("[chatService.searchMessages] Error:", error);
      throw error;
    }
  },
};

export default chatService;
