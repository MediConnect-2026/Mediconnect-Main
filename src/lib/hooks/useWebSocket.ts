import { useEffect, useCallback, useRef } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { socketService } from "@/services/websocket";
import { chatService } from "@/services/chat";
import { useAppStore } from "@/stores/useAppStore";
import { QUERY_KEYS } from "@/lib/react-query/config";
import type {
  NuevoMensajeEvent,
  MensajeEditadoEvent,
  MensajeEliminadoEvent,
  NuevaConversacionEvent,
  ConversacionActualizadaEvent,
  ContadorNoLeidosConversacionEvent,
  UsuarioEscribiendoRecibidoEvent,
  UsuarioDejoEscribirRecibidoEvent,
  UsuarioConectadoEvent,
  UsuarioDesconectadoEvent,
  EstadoConexionUsuariosEvent,
  LlamadaEntranteEvent,
  NotificacionEvent,
} from "@/types/WebSocketTypes";
import { getUserFullName, getUserName, getUserLastName, getUserAvatar } from "@/services/auth/auth.types";

// ============================================
// MODULE-LEVEL SINGLETON STATE
// Ensures only one WebSocket connection + listener set exists regardless of
// how many components call useWebSocket().
// ============================================
let instanceCount = 0;
let listenerCleanup: (() => void) | null = null;
let statusCleanup: (() => void) | null = null;
const typingTimeouts = new Map<string, ReturnType<typeof setTimeout>>();

/**
 * Hook personalizado para manejo de WebSocket en el chat
 * Conecta, registra listeners y sincroniza con React Query y Zustand
 *
 * Uses module-level ref counting so that the socket lifecycle is shared
 * across all component instances that call this hook. Only the first
 * mount creates the connection & listeners; only the last unmount tears
 * them down.
 *
 * IMPORTANT: All event handlers use useAppStore.getState() instead of
 * reactive selectors to avoid stale closures that would cause the singleton
 * to rebuild unnecessarily.
 *
 * @returns Métodos para interactuar con WebSocket
 */
export const useWebSocket = () => {
  const queryClient = useQueryClient();

  // Only select what is needed for lifecycle (accessToken triggers connect/disconnect)
  const accessToken = useAppStore((state) => state.accessToken);
  // user is needed for methods returned to the consumer (markAsRead, sendTypingIndicator)
  const user = useAppStore((state) => state.user);

  // ============================================
  // SETUP LISTENERS
  // Registered once. All dynamic state is read via useAppStore.getState()
  // inside event handlers to avoid stale closure issues.
  // ============================================

  // Use a stable ref to hold the queryClient so it doesn't appear in deps
  const queryClientRef = useRef(queryClient);
  queryClientRef.current = queryClient;

  const setupListeners = useCallback(() => {
    const qc = queryClientRef.current;

    // Nuevo mensaje recibido
    const unsubNewMessage = socketService.onNewMessage(
      (event: NuevoMensajeEvent) => {
        console.log("[useWebSocket] Nuevo mensaje recibido:", event);

        // Read current user from store (avoids stale closure)
        const currentUser = useAppStore.getState().user;

        // IMPORTANTE: Siempre recalcular esPropio desde remitenteId para evitar
        // el bug del backend que envía esPropio:true al receptor también.
        // El único campo confiable es remitenteId.
        const isOwnMessage = Number(event.remitenteId) === Number(currentUser?.id);

        const messageWithEsPropio = {
          ...event,
          esPropio: isOwnMessage,
        };

        // Enriquecer mensaje con datos del usuario actual si es mensaje propio y faltan datos
        if (
          isOwnMessage &&
          (!messageWithEsPropio.remitente || !messageWithEsPropio.remitente.nombre)
        ) {
          console.warn(
            "[useWebSocket] Mensaje propio sin datos del remitente, enriqueciendo con datos del usuario actual"
          );
          messageWithEsPropio.remitente = {
            id: currentUser?.id || 0,
            nombre: getUserName(currentUser) || "Usuario",
            apellido: getUserLastName(currentUser) || "",
            fotoPerfil: getUserAvatar(currentUser) || "",
          };
        }

        // Actualizar query de mensajes
        qc.setQueryData(
          QUERY_KEYS.MESSAGES(event.conversacionId),
          (old: any) => {
            if (!old?.pages) return old;

            // Verificar si el mensaje ya existe (evitar duplicados)
            const exists = old.pages[0]?.mensajes.some(
              (m: any) => m.id === event.id
            );
            if (exists) {
              console.log(
                `[useWebSocket] Mensaje ${event.id} ya existe, ignorando duplicado`
              );
              return old;
            }

            // Si el mensaje es propio, buscar y reemplazar mensaje optimista
            if (messageWithEsPropio.esPropio) {
              const firstPage = old.pages[0];
              const optimisticIndex = firstPage.mensajes.findIndex(
                (m: any) =>
                  m.id < 0 &&
                  m.remitenteId === event.remitenteId &&
                  m.tipo === event.tipo &&
                  Date.now() - new Date(m.enviadoEn).getTime() < 10000
              );

              if (optimisticIndex !== -1) {
                const optimisticMessage = firstPage.mensajes[optimisticIndex];
                const updatedMessages = [...firstPage.mensajes];

                updatedMessages[optimisticIndex] = {
                  ...messageWithEsPropio,
                  remitente: messageWithEsPropio.remitente?.nombre
                    ? messageWithEsPropio.remitente
                    : optimisticMessage.remitente,
                  enviadoEn:
                    messageWithEsPropio.enviadoEn || optimisticMessage.enviadoEn,
                };

                return {
                  ...old,
                  pages: [
                    { ...firstPage, mensajes: updatedMessages },
                    ...old.pages.slice(1),
                  ],
                };
              }
            }

            // Si no hay mensaje optimista, agregar normalmente
            return {
              ...old,
              pages: [
                {
                  mensajes: [messageWithEsPropio, ...old.pages[0].mensajes],
                  tieneMas: old.pages[0].tieneMas,
                  siguienteCursor: old.pages[0].siguienteCursor,
                },
                ...old.pages.slice(1),
              ],
            };
          }
        );

        // Actualizar store
        useAppStore.getState().addMessage(event.conversacionId, messageWithEsPropio);

        // Si el mensaje no es propio y no estamos viendo esa conversación activa, incrementamos contador
        const activeConvId = useAppStore.getState().activeConversationId;
        if (!messageWithEsPropio.esPropio && activeConvId !== event.conversacionId) {
          useAppStore.getState().incrementUnreadCount(event.conversacionId);
        }

        // Invalidar conversaciones para actualizar último mensaje
        qc.invalidateQueries({ queryKey: QUERY_KEYS.CONVERSATIONS });
      }
    );

    // Mensaje editado
    const unsubMessageEdited = socketService.onMessageEdited(
      (event: MensajeEditadoEvent) => {
        console.log("[useWebSocket] Mensaje editado:", event);

        qc.setQueryData(
          QUERY_KEYS.MESSAGES(event.conversacionId),
          (old: any) => {
            if (!old?.pages) return old;
            return {
              ...old,
              pages: old.pages.map((page: any) => ({
                ...page,
                mensajes: page.mensajes.map((m: any) =>
                  m.id === event.id ? event : m
                ),
              })),
            };
          }
        );

        useAppStore.getState().updateMessage(event.conversacionId, event.id, event);
      }
    );

    // Mensaje eliminado
    const unsubMessageDeleted = socketService.onMessageDeleted(
      (event: MensajeEliminadoEvent) => {
        console.log("[useWebSocket] Mensaje eliminado:", event);
        const { conversacionId, mensajeId } = event;

        qc.setQueryData(
          QUERY_KEYS.MESSAGES(conversacionId),
          (old: any) => {
            if (!old?.pages) return old;
            return {
              ...old,
              pages: old.pages.map((page: any) => ({
                ...page,
                mensajes: page.mensajes.filter((m: any) => m.id !== mensajeId),
              })),
            };
          }
        );

        useAppStore.getState().removeMessage(conversacionId, mensajeId);
      }
    );

    // Nueva conversación
    const unsubNewConversation = socketService.onNewConversation(
      (event: NuevaConversacionEvent) => {
        console.log("[useWebSocket] Nueva conversación:", event);
        useAppStore.getState().addConversation(event.conversacion);
        qc.invalidateQueries({ queryKey: QUERY_KEYS.CONVERSATIONS });
      }
    );

    // Conversación actualizada
    const unsubConversationUpdated = socketService.onConversationUpdated(
      (event: ConversacionActualizadaEvent) => {
        console.log("[useWebSocket] Conversación actualizada:", event);
        useAppStore.getState().updateConversation(event.conversacion.id, event.conversacion);
        qc.invalidateQueries({ queryKey: QUERY_KEYS.CONVERSATIONS });
      }
    );

    // Contador de no leídos actualizado
    const unsubUnreadCount = socketService.onUnreadCountUpdate(
      (event: ContadorNoLeidosConversacionEvent) => {
        console.log("[useWebSocket] Contador no leídos:", event);
        const { conversacionId, contador } = event;

        useAppStore.getState().updateUnreadCount(conversacionId, contador);

        try {
          qc.setQueryData(QUERY_KEYS.CONVERSATIONS, (old: any) => {
            if (!old) return old;
            if (Array.isArray(old)) {
              return old.map((conv: any) =>
                conv.id === conversacionId
                  ? { ...conv, mensajesNoLeidos: contador }
                  : conv
              );
            }
            return old;
          });
        } catch (err) {
          console.error("[useWebSocket] Error updating conversations cache:", err);
        }
      }
    );

    // Usuario escribiendo
    const unsubUserTyping = socketService.onUserTyping(
      (event: UsuarioEscribiendoRecibidoEvent) => {
        console.log("[useWebSocket] Usuario escribiendo:", event);
        const { conversacionId, usuarioId, nombre } = event;

        useAppStore.getState().setTypingUser(conversacionId, {
          usuarioId,
          nombre,
          conversacionId,
          timestamp: Date.now(),
        });

        const key = `${conversacionId}-${usuarioId}`;
        const existing = typingTimeouts.get(key);
        if (existing) clearTimeout(existing);

        const timeout = setTimeout(() => {
          useAppStore.getState().removeTypingUser(conversacionId, usuarioId);
          typingTimeouts.delete(key);
        }, 5000);
        typingTimeouts.set(key, timeout);
      }
    );

    // Usuario dejó de escribir
    const unsubUserStopTyping = socketService.onUserStopTyping(
      (event: UsuarioDejoEscribirRecibidoEvent) => {
        console.log("[useWebSocket] Usuario dejó de escribir:", event);
        useAppStore.getState().removeTypingUser(event.conversacionId, event.usuarioId);
      }
    );

    // Usuario conectado
    const unsubUserConnected = socketService.onUserConnected(
      (event: UsuarioConectadoEvent) => {
        console.log("[useWebSocket] Usuario conectado:", event);
        const { usuarioId } = event;
        useAppStore.getState().setUserOnline(usuarioId);

        qc.setQueryData(QUERY_KEYS.CONVERSATIONS, (old: any) => {
          if (!old) return old;
          if (Array.isArray(old)) {
            return old.map((conv: any) =>
              conv.otroUsuario?.id === usuarioId
                ? { ...conv, otroUsuario: { ...conv.otroUsuario, conectado: true } }
                : conv
            );
          }
          return old;
        });
      }
    );

    // Usuario desconectado
    const unsubUserDisconnected = socketService.onUserDisconnected(
      (event: UsuarioDesconectadoEvent) => {
        console.log("[useWebSocket] Usuario desconectado:", event);
        const { usuarioId } = event;
        useAppStore.getState().setUserOffline(usuarioId);

        qc.setQueryData(QUERY_KEYS.CONVERSATIONS, (old: any) => {
          if (!old) return old;
          if (Array.isArray(old)) {
            return old.map((conv: any) =>
              conv.otroUsuario?.id === usuarioId
                ? { ...conv, otroUsuario: { ...conv.otroUsuario, conectado: false } }
                : conv
            );
          }
          return old;
        });
      }
    );

    // Estado de conexión de usuarios (respuesta a solicitud)
    const unsubConnectionStatus = socketService.onConnectionStatusResponse(
      (event: EstadoConexionUsuariosEvent) => {
        console.log("[useWebSocket] Estado de conexión recibido:", event);
        const { estados } = event;

        Object.entries(estados).forEach(([userIdStr, isOnline]) => {
          const userId = parseInt(userIdStr, 10);
          if (isOnline) {
            useAppStore.getState().setUserOnline(userId);
          } else {
            useAppStore.getState().setUserOffline(userId);
          }
        });

        qc.setQueryData(QUERY_KEYS.CONVERSATIONS, (old: any) => {
          if (!old) return old;
          if (Array.isArray(old)) {
            return old.map((conv: any) => {
              const otroUsuarioId = conv.otroUsuario?.id;
              if (otroUsuarioId && estados[otroUsuarioId] !== undefined) {
                return {
                  ...conv,
                  otroUsuario: {
                    ...conv.otroUsuario,
                    conectado: estados[otroUsuarioId],
                  },
                };
              }
              return conv;
            });
          }
          return old;
        });
      }
    );

    // ============================================
    // TELECONSULTATION LISTENERS
    // ============================================

    const unsubLlamadaEntrante = socketService.onIncomingCall(
      (event: LlamadaEntranteEvent) => {
        console.log("[useWebSocket] Llamada entrante recibida:", event);

        toast.info(`Videollamada entrante de Dr. ${event.doctorNombre}`, {
          description: `Cita #${event.citaId}`,
          duration: 30000,
          action: {
            label: "Contestar",
            onClick: () => {
              window.location.href = `/teleconsult/${event.citaId}`;
            },
          },
        });
      }
    );

    const unsubLlamadaFinalizada = socketService.onCallEnded(() => {
      console.log("[useWebSocket] Llamada finalizada");
      toast.dismiss();
    });

    // ============================================
    // APPOINTMENT NOTIFICATION LISTENER
    // Invalidates cita-related caches whenever the server pushes a
    // nueva-notificacion whose tipoEntidad is 'cita'.
    // This covers: nueva cita, cita cancelada, cita reprogramada.
    // ============================================
    const CITA_ENTITIES = new Set([
      "cita", 
      "Cita", 
      "appointment", 
      "historial_clinico", 
      "Historial_clinico", 
      "historial", 
      "medical_history", 
      "clinical_history"
    ]);

    const unsubNuevaNotificacion = socketService.onNewNotification(
      (event: NotificacionEvent) => {
        console.log("[useWebSocket] Nueva notificación:", event);

        if (event.tipoEntidad && CITA_ENTITIES.has(event.tipoEntidad)) {
          console.log(
            "[useWebSocket] Notificación de cita detectada — invalidando caché de citas"
          );

          const qc = queryClientRef.current;

          // Invalidate all cita queries (list + individual + calendar)
          qc.invalidateQueries({ queryKey: ["citas"] });

          // Also refresh doctor stats that aggregate appointments
          qc.invalidateQueries({ queryKey: QUERY_KEYS.DOCTOR_STATS_CITAS });
        }
      }
    );

    // Retornar función de cleanup
    return () => {
      unsubNewMessage();
      unsubMessageEdited();
      unsubMessageDeleted();
      unsubNewConversation();
      unsubConversationUpdated();
      unsubUnreadCount();
      unsubUserTyping();
      unsubUserStopTyping();
      unsubUserConnected();
      unsubUserDisconnected();
      unsubConnectionStatus();
      unsubLlamadaEntrante();
      unsubLlamadaFinalizada();
      unsubNuevaNotificacion();
    };
  }, []); // Empty deps — all dynamic state is accessed via useAppStore.getState()

  // ============================================
  // CONNECTION EFFECT — ref-counted singleton
  // ============================================

  useEffect(() => {
    if (!accessToken) return;

    instanceCount++;
    console.log(`[useWebSocket] Mount (instances: ${instanceCount})`);

    // Only the FIRST instance creates the connection & listeners.
    if (instanceCount === 1) {
      console.log("[useWebSocket] Iniciando conexión WebSocket...");
      socketService.connect(accessToken);

      statusCleanup = socketService.onConnectionStatusChange((status) => {
        console.log("[useWebSocket] Estado de conexión:", status);
        useAppStore.getState().setConnectionStatus(status);
      });

      listenerCleanup = setupListeners();
    }

    // Cleanup — only the LAST instance tears everything down.
    return () => {
      instanceCount--;
      console.log(`[useWebSocket] Unmount (instances: ${instanceCount})`);

      if (instanceCount === 0) {
        console.log("[useWebSocket] Última instancia — desconectando...");
        listenerCleanup?.();
        listenerCleanup = null;
        statusCleanup?.();
        statusCleanup = null;
        typingTimeouts.forEach((t) => clearTimeout(t));
        typingTimeouts.clear();
        socketService.disconnect();
      }
    };
  }, [accessToken, setupListeners]);

  // Asegurar que el usuario se una a su sala personal
  useEffect(() => {
    const isConn =
      socketService.isConnected() ||
      socketService.getConnectionStatus() === "connected";
    if (isConn && user?.id) {
      const personalRoom = `usuario:${user.id}`;
      socketService.joinRoom(personalRoom);
      console.log(
        `[useWebSocket] Usuario ${user.id} se aseguró en sala personal: ${personalRoom}`
      );
    }
  }, [socketService.getConnectionStatus(), user?.id]);

  // Unir a todas las salas de conversación activas (fallback para casos de ID incorrecto)
  useEffect(() => {
    const isConn =
      socketService.isConnected() ||
      socketService.getConnectionStatus() === "connected";
    const convs = useAppStore.getState().conversations;
    if (isConn && convs.length > 0) {
      convs.forEach((conv) => {
        socketService.joinConversation(conv.id);
      });
    }
  }, [socketService.getConnectionStatus()]);

  // ============================================
  // EXPORTED METHODS
  // ============================================

  const joinConversation = useCallback((conversacionId: number) => {
    socketService.joinConversation(conversacionId);
  }, []);

  const leaveConversation = useCallback((conversacionId: number) => {
    socketService.leaveConversation(conversacionId);
  }, []);

  const sendTypingIndicator = useCallback(
    (conversacionId: number) => {
      if (!user) {
        console.warn("[useWebSocket.sendTypingIndicator] No user found");
        return;
      }
      const nombre = getUserFullName(user);
      socketService.emitTyping(conversacionId, nombre);
    },
    [user]
  );

  const sendStopTypingIndicator = useCallback((conversacionId: number) => {
    socketService.emitStopTyping(conversacionId);
  }, []);

  const markAsRead = useCallback(
    async (conversacionId: number, ultimoMensajeLeidoId: number) => {
      if (!user) return;

      if (!Number.isInteger(conversacionId) || conversacionId <= 0) {
        console.error(
          "[useWebSocket.markAsRead] Invalid conversacionId:",
          conversacionId
        );
        return;
      }

      if (!Number.isInteger(ultimoMensajeLeidoId) || ultimoMensajeLeidoId <= 0) {
        console.error(
          "[useWebSocket.markAsRead] Invalid ultimoMensajeLeidoId:",
          ultimoMensajeLeidoId
        );
        return;
      }

      socketService.emitMessagesRead({
        conversacionId,
        usuarioId: user.id,
        ultimoMensajeLeidoId,
      });

      try {
        await chatService.markMessagesAsRead(conversacionId, ultimoMensajeLeidoId);
      } catch (error) {
        console.error("[useWebSocket.markAsRead] Error:", error);
      }
    },
    [user]
  );

  const requestConnectionStatus = useCallback((usuariosIds: number[]) => {
    if (usuariosIds.length === 0) return;
    socketService.requestConnectionStatus(usuariosIds);
  }, []);

  return {
    isConnected: socketService.isConnected(),
    connectionStatus: socketService.getConnectionStatus(),
    joinConversation,
    leaveConversation,
    sendTypingIndicator,
    sendStopTypingIndicator,
    markAsRead,
    requestConnectionStatus,
  };
};

export default useWebSocket;
