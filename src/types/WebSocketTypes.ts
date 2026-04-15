import type {
  MessageWithSender,
  Conversation,
  ConversationWithDetails,
} from "./ChatTypes";

// ============================================
// CLIENT → SERVER EVENTS (Emit)
// ============================================

/**
 * Ping para verificar conexión
 */
export interface PingEvent {
  // no payload
}

/**
 * Unirse a una sala genérica
 */
export interface UnirseSalaEvent {
  sala: string;
}

/**
 * Salir de una sala genérica
 */
export interface SalirSalaEvent {
  sala: string;
}

/**
 * Unirse a sala de conversación
 */
export interface UnirseConversacionEvent {
  conversacionId: number;
}

/**
 * Salir de sala de conversación
 */
export interface SalirConversacionEvent {
  conversacionId: number;
}

/**
 * Usuario está escribiendo
 */
export interface UsuarioEscribiendoEvent {
  conversacionId: number;
  nombre: string;
}

/**
 * Usuario dejó de escribir
 */
export interface UsuarioDejoEscribirEvent {
  conversacionId: number;
}

/**
 * Marcar mensajes como leídos
 */
export interface MensajesLeidosEvent {
  conversacionId: number;
  usuarioId: number;
  ultimoMensajeLeidoId: number;
}

/**
 * Solicitar estado de conexión de usuarios
 */
export interface SolicitarEstadoConexionEvent {
  usuariosIds: number[];
}

// ============================================
// SERVER → CLIENT EVENTS (Listen)
// ============================================

/**
 * Confirmación de conexión
 */
export interface ConectadoEvent {
  mensaje: string;
  usuarioId: number;
  timestamp: string;
}

/**
 * Respuesta a ping
 */
export interface PongEvent {
  timestamp: string;
}

/**
 * Nuevo mensaje recibido en conversación
 * El backend envía el MessageWithSender directamente como raíz del evento
 */
export type NuevoMensajeEvent = MessageWithSender;

/**
 * Mensaje editado
 */
export type MensajeEditadoEvent = MessageWithSender;

/**
 * Mensaje eliminado
 */
export interface MensajeEliminadoEvent {
  conversacionId: number;
  mensajeId: number;
}

/**
 * Nueva conversación creada
 */
export interface NuevaConversacionEvent {
  conversacion: ConversationWithDetails;
  datosAdicionales?: {
    mensajeInicial?: MessageWithSender;
  };
}

/**
 * Conversación actualizada
 */
export interface ConversacionActualizadaEvent {
  conversacion: Conversation | ConversationWithDetails;
}

/**
 * Contador de mensajes no leídos de una conversación
 */
export interface ContadorNoLeidosConversacionEvent {
  conversacionId: number;
  contador: number;
}

/**
 * Usuario está escribiendo (recibido)
 */
export interface UsuarioEscribiendoRecibidoEvent {
  conversacionId: number;
  usuarioId: number;
  nombre: string;
}

/**
 * Usuario dejó de escribir (recibido)
 */
export interface UsuarioDejoEscribirRecibidoEvent {
  conversacionId: number;
  usuarioId: number;
}

/**
 * Usuario se conectó (recibido)
 */
export interface UsuarioConectadoEvent {
  usuarioId: number;
  timestamp: string;
}

/**
 * Usuario se desconectó (recibido)
 */
export interface UsuarioDesconectadoEvent {
  usuarioId: number;
  timestamp: string;
}

/**
 * Estado de conexión de múltiples usuarios
 */
export interface EstadoConexionUsuariosEvent {
  estados: Record<number, boolean>; // { usuarioId: conectado }
}

/**
 * Nueva notificación del sistema
 */
export interface NotificacionEvent {
  id: number;
  titulo: string;
  mensaje: string;
  tipoAlerta?: string;
  tipoEntidad?: string;
  entidadId?: number;
  creadoEn: string;
}

/**
 * Contador total de notificaciones no leídas
 */
export interface ContadorNotificacionesEvent {
  contador: number;
}

/**
 * Llamada entrante
 */
export interface LlamadaEntranteEvent {
  citaId: number;
  doctorNombre: string;
  urlAcceso: string;
}

/**
 * Llamada finalizada
 */
export interface LlamadaFinalizadaEvent {
  citaId: number;
  timestamp: string;
}

// ============================================
// SOCKET EVENT NAMES (Constants)
// ============================================

/**
 * Nombres de eventos client → server
 */
export const CLIENT_EVENTS = {
  PING: "ping",
  UNIRSE_SALA: "unirse-sala",
  SALIR_SALA: "salir-sala",
  UNIRSE_CONVERSACION: "unirse-conversacion",
  SALIR_CONVERSACION: "salir-conversacion",
  USUARIO_ESCRIBIENDO: "usuario-escribiendo",
  USUARIO_DEJO_ESCRIBIR: "usuario-dejo-escribir",
  MENSAJES_LEIDOS: "mensajes-leidos",
  SOLICITAR_ESTADO_CONEXION: "solicitar-estado-conexion",
  DISCONNECT: "disconnect",
} as const;

/**
 * Nombres de eventos server → client
 */
export const SERVER_EVENTS = {
  CONECTADO: "conectado",
  PONG: "pong",
  NUEVO_MENSAJE: "nuevo-mensaje",
  MENSAJE_EDITADO: "mensaje-editado",
  MENSAJE_ELIMINADO: "mensaje-eliminado",
  NUEVA_CONVERSACION: "nueva-conversacion",
  CONVERSACION_ACTUALIZADA: "conversacion-actualizada",
  CONTADOR_NO_LEIDOS_CONVERSACION: "contador-no-leidos-conversacion",
  USUARIO_ESCRIBIENDO: "usuario-escribiendo",
  USUARIO_DEJO_ESCRIBIR: "usuario-dejo-escribir",
  USUARIO_CONECTADO: "usuario-conectado",
  USUARIO_DESCONECTADO: "usuario-desconectado",
  ESTADO_CONEXION_USUARIOS: "estado-conexion-usuarios",
  NUEVA_NOTIFICACION: "nueva-notificacion",
  CONTADOR_NO_LEIDAS: "contador-no-leidas",
  LLAMADA_ENTRANTE: "llamada-entrante",
  LLAMADA_FINALIZADA: "llamada-finalizada",
} as const;

/**
 * Eventos de error/estado de conexión
 */
export const CONNECTION_EVENTS = {
  CONNECT: "connect",
  DISCONNECT: "disconnect",
  CONNECT_ERROR: "connect_error",
  RECONNECT: "reconnect",
  RECONNECT_ATTEMPT: "reconnect_attempt",
  RECONNECT_ERROR: "reconnect_error",
  RECONNECT_FAILED: "reconnect_failed",
} as const;

// ============================================
// SOCKET SERVICE TYPES
// ============================================

/**
 * Estado de conexión WebSocket
 */
export const SocketConnectionStatus = {
  DISCONNECTED: "disconnected",
  CONNECTING: "connecting",
  CONNECTED: "connected",
  RECONNECTING: "reconnecting",
  ERROR: "error",
} as const;

export type SocketConnectionStatus = typeof SocketConnectionStatus[keyof typeof SocketConnectionStatus];

/**
 * Configuración de Socket.IO
 */
export interface SocketConfig {
  url: string;
  token: string;
  reconnectionDelay?: number;
  reconnectionDelayMax?: number;
  reconnectionAttempts?: number;
  timeout?: number;
}

/**
 * Callback types para eventos
 */
export type SocketEventCallback<T = any> = (data: T) => void;
export type SocketErrorCallback = (error: Error) => void;
export type SocketConnectionCallback = (status: SocketConnectionStatus) => void;

/**
 * Map de listeners registrados
 */
export interface SocketListeners {
  [eventName: string]: SocketEventCallback[];
}

// ============================================
// UTILITY TYPES
// ============================================

/**
 * Nombres de salas
 */
export const createRoomName = {
  user: (usuarioId: number) => `usuario:${usuarioId}`,
  conversation: (conversacionId: number) => `conversacion:${conversacionId}`,
  custom: (name: string) => name,
} as const;

/**
 * Tipo helper para room names
 */
export type RoomName = string;
