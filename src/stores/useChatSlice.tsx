import { type StateCreator } from "zustand";
import type {
  ConversationWithDetails,
  MessageWithSender,
  TypingUser,
} from "@/types/ChatTypes";
import type { SocketConnectionStatus } from "@/types/WebSocketTypes";

export interface ChatSlice {
  // Estado
  conversations: ConversationWithDetails[];
  activeConversationId: number | null;
  typingUsers: Map<number, TypingUser[]>; // conversacionId → usuarios escribiendo
  unreadCounts: Map<number, number>; // conversacionId → contador
  globalUnreadCount: number; // Contador total global
  onlineUsers: Set<number>; // Set de IDs de usuarios conectados
  isConnectedToWS: boolean;
  connectionStatus: SocketConnectionStatus;

  // Acciones - Conversaciones
  setConversations: (conversations: ConversationWithDetails[]) => void;
  setGlobalUnreadCount: (count: number) => void;
  addConversation: (conversation: ConversationWithDetails) => void;
  updateConversation: (
    id: number,
    updates: Partial<ConversationWithDetails>
  ) => void;
  setActiveConversation: (id: number | null) => void;
  removeConversation: (id: number) => void;

  // Acciones - Mensajes
  addMessage: (conversacionId: number, message: MessageWithSender) => void;
  updateMessage: (
    conversacionId: number,
    mensajeId: number,
    updates: Partial<MessageWithSender>
  ) => void;
  removeMessage: (conversacionId: number, mensajeId: number) => void;

  // Acciones - Typing Indicators
  setTypingUser: (conversacionId: number, user: TypingUser) => void;
  removeTypingUser: (conversacionId: number, usuarioId: number) => void;
  clearTypingUsers: (conversacionId: number) => void;

  // Acciones - Estado Online
  setUserOnline: (usuarioId: number) => void;
  setUserOffline: (usuarioId: number) => void;

  // Acciones - Contador de no leídos
  updateUnreadCount: (conversacionId: number, count: number) => void;
  incrementUnreadCount: (conversacionId: number) => void;
  resetUnreadCount: (conversacionId: number) => void;

  // Acciones - WebSocket Status
  setWSConnected: (connected: boolean) => void;
  setConnectionStatus: (status: SocketConnectionStatus) => void;

  // Reset
  reset: () => void;
}

const initialState = {
  conversations: [],
  activeConversationId: null,
  typingUsers: new Map(),
  unreadCounts: new Map(),
  globalUnreadCount: 0,
  onlineUsers: new Set<number>(),
  isConnectedToWS: false,
  connectionStatus: "disconnected" as SocketConnectionStatus,
};

export const createChatSlice: StateCreator<ChatSlice> = (set) => ({
  ...initialState,

  // ============================================
  // CONVERSACIONES
  // ============================================

  setConversations: (conversations) =>
    set({ conversations }),

  setGlobalUnreadCount: (count) =>
    set({ globalUnreadCount: count }),

  addConversation: (conversation) =>
    set((state) => {
      // Verificar si ya existe
      const exists = state.conversations.some((c) => c.id === conversation.id);
      if (exists) return state;

      return {
        conversations: [conversation, ...state.conversations],
      };
    }),

  updateConversation: (id, updates) =>
    set((state) => ({
      conversations: state.conversations.map((conv) =>
        conv.id === id ? { ...conv, ...updates } : conv
      ),
    })),

  setActiveConversation: (id) =>
    set({ activeConversationId: id }),

  removeConversation: (id) =>
    set((state) => ({
      conversations: state.conversations.filter((c) => c.id !== id),
      activeConversationId:
        state.activeConversationId === id ? null : state.activeConversationId,
    })),

  // ============================================
  // MENSAJES
  // ============================================

  addMessage: (conversacionId, message) =>
    set((state) => ({
      conversations: state.conversations.map((conv) => {
        if (conv.id === conversacionId) {
          // Verificar si el mensaje ya existe (evitar duplicados)
          const messageExists = conv.ultimoMensaje?.id === message.id;
          if (messageExists) return conv;

          return {
            ...conv,
            ultimoMensaje: {
              id: message.id,
              contenido: message.contenido,
              tipo: message.tipo,
              enviadoEn: message.enviadoEn,
              remitenteId: message.remitenteId,
            },
          };
        }
        return conv;
      }),
    })),

  updateMessage: (conversacionId, mensajeId, updates) =>
    set((state) => ({
      conversations: state.conversations.map((conv) => {
        if (
          conv.id === conversacionId &&
          conv.ultimoMensaje?.id === mensajeId
        ) {
          return {
            ...conv,
            ultimoMensaje: {
              ...conv.ultimoMensaje,
              ...updates,
            },
          };
        }
        return conv;
      }),
    })),

  removeMessage: (conversacionId, mensajeId) =>
    set((state) => ({
      conversations: state.conversations.map((conv) => {
        if (
          conv.id === conversacionId &&
          conv.ultimoMensaje?.id === mensajeId
        ) {
          return {
            ...conv,
            ultimoMensaje: undefined,
          };
        }
        return conv;
      }),
    })),

  // ============================================
  // TYPING INDICATORS
  // ============================================

  setTypingUser: (conversacionId, user) =>
    set((state) => {
      console.log(`[useChatSlice] setTypingUser called:`, { conversacionId, user });
      const newTypingUsers = new Map(state.typingUsers);
      const currentUsers = newTypingUsers.get(conversacionId) || [];

      // Always upsert: remove old entry and add fresh one with updated timestamp.
      // Use nombre as fallback key because the server may not send usuarioId.
      const key = (u: TypingUser) => u.usuarioId ?? u.nombre;
      const filtered = currentUsers.filter((u) => key(u) !== key(user));
      const updatedUsers = [
        ...filtered,
        { ...user, timestamp: Date.now() },
      ];
      newTypingUsers.set(conversacionId, updatedUsers);
      console.log(`[useChatSlice] Updated typing users for ${conversacionId}:`, updatedUsers);

      return { typingUsers: newTypingUsers };
    }),

  removeTypingUser: (conversacionId, usuarioId) =>
    set((state) => {
      console.log(`[useChatSlice] removeTypingUser called:`, { conversacionId, usuarioId });
      const newTypingUsers = new Map(state.typingUsers);
      const currentUsers = newTypingUsers.get(conversacionId) || [];

      const filteredUsers = currentUsers.filter(
        (u) => u.usuarioId !== usuarioId
      );

      if (filteredUsers.length === 0) {
        newTypingUsers.delete(conversacionId);
        console.log(`[useChatSlice] Removed all typing users for ${conversacionId}`);
      } else {
        newTypingUsers.set(conversacionId, filteredUsers);
        console.log(`[useChatSlice] Updated typing users for ${conversacionId}:`, filteredUsers);
      }

      return { typingUsers: newTypingUsers };
    }),

  clearTypingUsers: (conversacionId) =>
    set((state) => {
      const newTypingUsers = new Map(state.typingUsers);
      newTypingUsers.delete(conversacionId);
      return { typingUsers: newTypingUsers };
    }),

  // ============================================
  // ESTADO ONLINE
  // ============================================

  setUserOnline: (usuarioId) =>
    set((state) => {
      const newOnlineUsers = new Set(state.onlineUsers);
      newOnlineUsers.add(usuarioId);

      // Actualizar el estado conectado en las conversaciones
      const conversations = state.conversations.map((conv) => {
        if (conv.otroUsuario.id === usuarioId) {
          return {
            ...conv,
            otroUsuario: {
              ...conv.otroUsuario,
              conectado: true,
            },
          };
        }
        return conv;
      });

      console.log(`[useChatSlice] Usuario ${usuarioId} ahora está online`);
      return { onlineUsers: newOnlineUsers, conversations };
    }),

  setUserOffline: (usuarioId) =>
    set((state) => {
      const newOnlineUsers = new Set(state.onlineUsers);
      newOnlineUsers.delete(usuarioId);

      // Actualizar el estado conectado en las conversaciones
      const conversations = state.conversations.map((conv) => {
        if (conv.otroUsuario.id === usuarioId) {
          return {
            ...conv,
            otroUsuario: {
              ...conv.otroUsuario,
              conectado: false,
            },
          };
        }
        return conv;
      });

      console.log(`[useChatSlice] Usuario ${usuarioId} ahora está offline`);
      return { onlineUsers: newOnlineUsers, conversations };
    }),

  // ============================================
  // CONTADOR DE NO LEÍDOS
  // ============================================

  updateUnreadCount: (conversacionId, count) =>
    set((state) => {
      const currentCount = state.unreadCounts.get(conversacionId) || 0;
      const newUnreadCounts = new Map(state.unreadCounts);
      newUnreadCounts.set(conversacionId, count);

      // Actualizar también en la conversación
      const conversations = state.conversations.map((conv) =>
        conv.id === conversacionId
          ? { ...conv, mensajesNoLeidos: count }
          : conv
      );

      return {
        unreadCounts: newUnreadCounts,
        conversations,
        globalUnreadCount: Math.max(0, state.globalUnreadCount - currentCount + count)
      };
    }),

  incrementUnreadCount: (conversacionId) =>
    set((state) => {
      const currentCount = state.unreadCounts.get(conversacionId) || 0;
      const newCount = currentCount + 1;

      const newUnreadCounts = new Map(state.unreadCounts);
      newUnreadCounts.set(conversacionId, newCount);

      // Actualizar también en la conversación
      const conversations = state.conversations.map((conv) =>
        conv.id === conversacionId
          ? { ...conv, mensajesNoLeidos: newCount }
          : conv
      );

      return { unreadCounts: newUnreadCounts, conversations, globalUnreadCount: state.globalUnreadCount + 1 };
    }),

  resetUnreadCount: (conversacionId) =>
    set((state) => {
      const currentConvCount = state.unreadCounts.get(conversacionId) || 0;
      const newUnreadCounts = new Map(state.unreadCounts);
      newUnreadCounts.set(conversacionId, 0);

      // Actualizar también en la conversación
      const conversations = state.conversations.map((conv) =>
        conv.id === conversacionId ? { ...conv, mensajesNoLeidos: 0 } : conv
      );

      return {
        unreadCounts: newUnreadCounts,
        conversations,
        globalUnreadCount: Math.max(0, state.globalUnreadCount - currentConvCount)
      };
    }),

  // ============================================
  // WEBSOCKET STATUS
  // ============================================

  setWSConnected: (connected) =>
    set({ isConnectedToWS: connected }),

  setConnectionStatus: (status) =>
    set({
      connectionStatus: status,
      isConnectedToWS: status === "connected",
    }),

  // ============================================
  // RESET
  // ============================================

  reset: () =>
    set(initialState),
});
