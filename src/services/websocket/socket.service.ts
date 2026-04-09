import { io, Socket } from "socket.io-client";
import type {
  SocketEventCallback,
  SocketConnectionCallback,
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
  ConectadoEvent,
  PongEvent,
  UsuarioEscribiendoEvent,
  UsuarioDejoEscribirEvent,
  MensajesLeidosEvent,
  SolicitarEstadoConexionEvent,
  NotificacionEvent,
  ContadorNotificacionesEvent,
  LlamadaEntranteEvent,
  LlamadaFinalizadaEvent,
} from "@/types/WebSocketTypes";
import {
  SocketConnectionStatus,
  CLIENT_EVENTS,
  SERVER_EVENTS,
  CONNECTION_EVENTS,
} from "@/types/WebSocketTypes";

/**
 * Servicio Singleton de WebSocket
 * Maneja la conexión Socket.IO y todos los eventos de chat en tiempo real
 */
class SocketService {
  private socket: Socket | null = null;
  private connectionStatus: SocketConnectionStatus =
    SocketConnectionStatus.DISCONNECTED;
  private maxReconnectAttempts = 5;
  private statusCallbacks: Set<SocketConnectionCallback> = new Set();

  /**
   * Conectar al servidor WebSocket
   * @param token - JWT token para autenticación
   */
  connect(token: string): void {
    // Guard against both an active connection AND a pending one (socket exists
    // but hasn't finished the handshake yet). io() creates the socket object
    // synchronously, so checking only `.connected` would allow a second call
    // to overwrite the first socket before it connects.
    if (this.socket) {
      console.warn("[SocketService] Ya existe una conexión activa o pendiente");
      return;
    }

    const wsUrl = import.meta.env.VITE_WEBSOCKET_URL || "ws://localhost:3000";

    console.log(`[SocketService] Conectando a ${wsUrl}...`);
    this.setConnectionStatus(SocketConnectionStatus.CONNECTING);

    // Configuración de Socket.IO
    this.socket = io(wsUrl, {
      auth: {
        token: token, // Token en handshake.auth
      },
      transports: ["websocket", "polling"], // Preferir WebSocket
      reconnection: true,
      reconnectionDelay: 1000,
      reconnectionDelayMax: 5000,
      reconnectionAttempts: this.maxReconnectAttempts,
      timeout: 20000,
    });

    this.setupConnectionListeners();
    this.setupChatListeners();
  }

  /**
   * Configurar listeners de eventos de conexión
   */
  private setupConnectionListeners(): void {
    if (!this.socket) return;

    // Conexión exitosa
    this.socket.on(CONNECTION_EVENTS.CONNECT, () => {
      console.log("[SocketService] Conectado exitosamente");
      this.setConnectionStatus(SocketConnectionStatus.CONNECTED);
    });

    // Desconexión
    this.socket.on(CONNECTION_EVENTS.DISCONNECT, (reason: string) => {
      console.warn(`[SocketService] Desconectado: ${reason}`);
      this.setConnectionStatus(SocketConnectionStatus.DISCONNECTED);
    });

    // Error de conexión
    this.socket.on(CONNECTION_EVENTS.CONNECT_ERROR, (error: Error) => {
      console.error("[SocketService] Error de conexión:", error);
      this.setConnectionStatus(SocketConnectionStatus.ERROR);
    });

    // Reintento de reconexión
    this.socket.on(
      CONNECTION_EVENTS.RECONNECT_ATTEMPT,
      (attemptNumber: number) => {
        console.log(
          `[SocketService] Intento de reconexión ${attemptNumber}/${this.maxReconnectAttempts}`
        );
        this.setConnectionStatus(SocketConnectionStatus.RECONNECTING);
      }
    );

    // Reconexión exitosa
    this.socket.on(CONNECTION_EVENTS.RECONNECT, (attemptNumber: number) => {
      console.log(
        `[SocketService] Reconectado después de ${attemptNumber} intentos`
      );
      this.setConnectionStatus(SocketConnectionStatus.CONNECTED);
    });

    // Reconexión fallida
    this.socket.on(CONNECTION_EVENTS.RECONNECT_FAILED, () => {
      console.error(
        "[SocketService] Reconexión fallida después de múltiples intentos"
      );
      this.setConnectionStatus(SocketConnectionStatus.ERROR);
    });

    // Evento conectado del servidor
    this.socket.on(SERVER_EVENTS.CONECTADO, (data: ConectadoEvent) => {
      console.log(`[SocketService] Bienvenida del servidor:`, data);
    });

    // Respuesta a ping
    this.socket.on(SERVER_EVENTS.PONG, (data: PongEvent) => {
      console.log(`[SocketService] Pong recibido:`, data.timestamp);
    });
  }

  /**
   * Configurar listeners de eventos de chat (sin callbacks, solo logs)
   * Los callbacks se registran dinámicamente con on*() methods
   */
  private setupChatListeners(): void {
    if (!this.socket) return;

    // Los listeners reales se agregan dinámicamente con los métodos on*()
    // Aquí solo registramos logs generales para debugging
    console.log("[SocketService] Listeners de chat configurados");
  }

  /**
   * Desconectar del servidor
   */
  disconnect(): void {
    if (this.socket) {
      console.log("[SocketService] Desconectando...");
      this.socket.removeAllListeners();
      this.socket.disconnect();
      this.socket = null;
      this.setConnectionStatus(SocketConnectionStatus.DISCONNECTED);
    }
  }

  /**
   * Verificar si está conectado
   */
  isConnected(): boolean {
    return !!(
      this.socket?.connected &&
      this.connectionStatus === SocketConnectionStatus.CONNECTED
    );
  }

  /**
   * Obtener estado de conexión actual
   */
  getConnectionStatus(): SocketConnectionStatus {
    return this.connectionStatus;
  }

  /**
   * Actualizar estado de conexión y notificar callbacks
   */
  private setConnectionStatus(status: SocketConnectionStatus): void {
    this.connectionStatus = status;
    this.statusCallbacks.forEach((callback) => callback(status));
  }

  /**
   * Registrar callback para cambios de estado de conexión
   */
  onConnectionStatusChange(callback: SocketConnectionCallback): () => void {
    this.statusCallbacks.add(callback);
    // Retornar función para desregistrar
    return () => {
      this.statusCallbacks.delete(callback);
    };
  }

  // ============================================
  // EMIT EVENTS (Client → Server)
  // ============================================

  /**
   * Enviar ping al servidor
   */
  ping(): void {
    if (!this.socket) return;
    this.socket.emit(CLIENT_EVENTS.PING);
  }

  /**
   * Unirse a sala de conversación
   */
  joinConversation(conversacionId: number): void {
    if (!this.socket) {
      console.warn("[SocketService.joinConversation] Socket not initialized");
      return;
    }
    console.log(`[SocketService] Emitting unirse-conversacion for ${conversacionId}`);
    this.socket.emit(CLIENT_EVENTS.UNIRSE_CONVERSACION, conversacionId);
  }

  /**
   * Salir de sala de conversación
   */
  leaveConversation(conversacionId: number): void {
    if (!this.socket) return;
    console.log(`[SocketService] Saliendo de conversación ${conversacionId}`);
    this.socket.emit(CLIENT_EVENTS.SALIR_CONVERSACION, conversacionId);
  }

  /**
   * Emitir que el usuario está escribiendo
   */
  emitTyping(conversacionId: number, nombre: string): void {
    if (!this.socket) {
      console.warn("[SocketService.emitTyping] Socket not initialized");
      return;
    }
    const payload: UsuarioEscribiendoEvent = { conversacionId, nombre };
    console.log(`[SocketService] Emitting usuario-escribiendo:`, payload);
    this.socket.emit(CLIENT_EVENTS.USUARIO_ESCRIBIENDO, payload);
  }

  /**
   * Emitir que el usuario dejó de escribir
   */
  emitStopTyping(conversacionId: number): void {
    if (!this.socket) return;
    const payload: UsuarioDejoEscribirEvent = { conversacionId };
    this.socket.emit(CLIENT_EVENTS.USUARIO_DEJO_ESCRIBIR, payload);
  }

  /**
   * Emitir que se leyeron mensajes
   */
  emitMessagesRead(data: MensajesLeidosEvent): void {
    if (!this.socket) return;
    this.socket.emit(CLIENT_EVENTS.MENSAJES_LEIDOS, data);
  }

  /**
   * Solicitar estado de conexión de usuarios
   */
  requestConnectionStatus(usuariosIds: number[]): void {
    if (!this.socket) return;
    const payload: SolicitarEstadoConexionEvent = { usuariosIds };
    console.log(`[SocketService] Solicitando estado de conexión de ${usuariosIds.length} usuarios`);
    this.socket.emit(CLIENT_EVENTS.SOLICITAR_ESTADO_CONEXION, payload);
  }

  /**
   * Unirse a sala genérica
   */
  joinRoom(sala: string): void {
    if (!this.socket) return;
    this.socket.emit(CLIENT_EVENTS.UNIRSE_SALA, { sala });
  }

  /**
   * Salir de sala genérica
   */
  leaveRoom(sala: string): void {
    if (!this.socket) return;
    this.socket.emit(CLIENT_EVENTS.SALIR_SALA, { sala });
  }

  // ============================================
  // LISTEN EVENTS (Server → Client)
  // ============================================

  /**
   * Escuchar nuevos mensajes
   */
  onNewMessage(callback: SocketEventCallback<NuevoMensajeEvent>): () => void {
    if (!this.socket) return () => {};
    this.socket.on(SERVER_EVENTS.NUEVO_MENSAJE, callback);
    return () => {
      this.socket?.off(SERVER_EVENTS.NUEVO_MENSAJE, callback);
    };
  }

  /**
   * Escuchar mensajes editados
   */
  onMessageEdited(
    callback: SocketEventCallback<MensajeEditadoEvent>
  ): () => void {
    if (!this.socket) return () => {};
    this.socket.on(SERVER_EVENTS.MENSAJE_EDITADO, callback);
    return () => {
      this.socket?.off(SERVER_EVENTS.MENSAJE_EDITADO, callback);
    };
  }

  /**
   * Escuchar mensajes eliminados
   */
  onMessageDeleted(
    callback: SocketEventCallback<MensajeEliminadoEvent>
  ): () => void {
    if (!this.socket) return () => {};
    this.socket.on(SERVER_EVENTS.MENSAJE_ELIMINADO, callback);
    return () => {
      this.socket?.off(SERVER_EVENTS.MENSAJE_ELIMINADO, callback);
    };
  }

  /**
   * Escuchar nuevas conversaciones
   */
  onNewConversation(
    callback: SocketEventCallback<NuevaConversacionEvent>
  ): () => void {
    if (!this.socket) return () => {};
    this.socket.on(SERVER_EVENTS.NUEVA_CONVERSACION, callback);
    return () => {
      this.socket?.off(SERVER_EVENTS.NUEVA_CONVERSACION, callback);
    };
  }

  /**
   * Escuchar conversaciones actualizadas
   */
  onConversationUpdated(
    callback: SocketEventCallback<ConversacionActualizadaEvent>
  ): () => void {
    if (!this.socket) return () => {};
    this.socket.on(SERVER_EVENTS.CONVERSACION_ACTUALIZADA, callback);
    return () => {
      this.socket?.off(SERVER_EVENTS.CONVERSACION_ACTUALIZADA, callback);
    };
  }

  /**
   * Escuchar actualizaciones de contador de no leídos
   */
  onUnreadCountUpdate(
    callback: SocketEventCallback<ContadorNoLeidosConversacionEvent>
  ): () => void {
    if (!this.socket) return () => {};
    this.socket.on(SERVER_EVENTS.CONTADOR_NO_LEIDOS_CONVERSACION, callback);
    return () => {
      this.socket?.off(SERVER_EVENTS.CONTADOR_NO_LEIDOS_CONVERSACION, callback);
    };
  }

  /**
   * Escuchar cuando un usuario está escribiendo
   */
  onUserTyping(
    callback: SocketEventCallback<UsuarioEscribiendoRecibidoEvent>
  ): () => void {
    if (!this.socket) return () => {};
    this.socket.on(SERVER_EVENTS.USUARIO_ESCRIBIENDO, callback);
    return () => {
      this.socket?.off(SERVER_EVENTS.USUARIO_ESCRIBIENDO, callback);
    };
  }

  /**
   * Escuchar cuando un usuario deja de escribir
   */
  onUserStopTyping(
    callback: SocketEventCallback<UsuarioDejoEscribirRecibidoEvent>
  ): () => void {
    if (!this.socket) return () => {};
    this.socket.on(SERVER_EVENTS.USUARIO_DEJO_ESCRIBIR, callback);
    return () => {
      this.socket?.off(SERVER_EVENTS.USUARIO_DEJO_ESCRIBIR, callback);
    };
  }

  /**
   * Escuchar cuando un usuario se conecta
   */
  onUserConnected(
    callback: SocketEventCallback<UsuarioConectadoEvent>
  ): () => void {
    if (!this.socket) return () => {};
    this.socket.on(SERVER_EVENTS.USUARIO_CONECTADO, callback);
    return () => {
      this.socket?.off(SERVER_EVENTS.USUARIO_CONECTADO, callback);
    };
  }

  /**
   * Escuchar cuando un usuario se desconecta
   */
  onUserDisconnected(
    callback: SocketEventCallback<UsuarioDesconectadoEvent>
  ): () => void {
    if (!this.socket) return () => {};
    this.socket.on(SERVER_EVENTS.USUARIO_DESCONECTADO, callback);
    return () => {
      this.socket?.off(SERVER_EVENTS.USUARIO_DESCONECTADO, callback);
    };
  }

  /**
   * Escuchar respuesta de estado de conexión de usuarios
   */
  onConnectionStatusResponse(
    callback: SocketEventCallback<EstadoConexionUsuariosEvent>
  ): () => void {
    if (!this.socket) return () => {};
    this.socket.on(SERVER_EVENTS.ESTADO_CONEXION_USUARIOS, callback);
    return () => {
      this.socket?.off(SERVER_EVENTS.ESTADO_CONEXION_USUARIOS, callback);
    };
  }

  /**
   * Escuchar nuevas notificaciones del sistema
   */
  onNewNotification(
    callback: SocketEventCallback<NotificacionEvent>
  ): () => void {
    if (!this.socket) return () => {};
    this.socket.on(SERVER_EVENTS.NUEVA_NOTIFICACION, callback);
    return () => {
      this.socket?.off(SERVER_EVENTS.NUEVA_NOTIFICACION, callback);
    };
  }

  /**
   * Escuchar actualizaciones del contador de notificaciones no leídas
   */
  onUnreadNotificationsCount(
    callback: SocketEventCallback<ContadorNotificacionesEvent>
  ): () => void {
    if (!this.socket) return () => {};
    this.socket.on(SERVER_EVENTS.CONTADOR_NO_LEIDAS, callback);
    return () => {
      this.socket?.off(SERVER_EVENTS.CONTADOR_NO_LEIDAS, callback);
    };
  }

  /**
   * Escuchar llamadas entrantes
   */
  onIncomingCall(
    callback: SocketEventCallback<LlamadaEntranteEvent>
  ): () => void {
    if (!this.socket) return () => {};
    this.socket.on(SERVER_EVENTS.LLAMADA_ENTRANTE, callback);
    return () => {
      this.socket?.off(SERVER_EVENTS.LLAMADA_ENTRANTE, callback);
    };
  }

  /**
   * Escuchar cuando una llamada ha finalizado
   */
  onCallEnded(
    callback: SocketEventCallback<LlamadaFinalizadaEvent>
  ): () => void {
    if (!this.socket) return () => {};
    this.socket.on(SERVER_EVENTS.LLAMADA_FINALIZADA, callback);
    return () => {
      this.socket?.off(SERVER_EVENTS.LLAMADA_FINALIZADA, callback);
    };
  }

  /**
   * Remover todos los listeners de eventos
   */
  removeAllListeners(): void {
    if (this.socket) {
      this.socket.removeAllListeners();
    }
  }

  /**
   * Remover listener específico
   */
  removeListener(eventName: string, callback: SocketEventCallback): void {
    if (this.socket) {
      this.socket.off(eventName, callback);
    }
  }
}

// Exportar instancia singleton
export const socketService = new SocketService();
export default socketService;
