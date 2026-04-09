// ============================================
// ENUMS
// ============================================

export const MessageType = {
  TEXTO: "texto",
  IMAGEN: "imagen",
  AUDIO: "audio",
  VIDEO: "video",
  ARCHIVO: "archivo",
  OTRO: "otro",
} as const;

export type MessageType = typeof MessageType[keyof typeof MessageType];

export const MessageStatus = {
  ENVIADO: "Enviado",
  ENTREGADO: "Entregado",
  LEIDO: "Leido",
  ELIMINADO: "Eliminado",
} as const;

export type MessageStatus = typeof MessageStatus[keyof typeof MessageStatus];

export const ConversationStatus = {
  ACTIVA: "Activa",
  ARCHIVADA: "Archivada",
  BLOQUEADA: "Bloqueada",
} as const;

export type ConversationStatus = typeof ConversationStatus[keyof typeof ConversationStatus];

// ============================================
// BASE ENTITIES (Backend aligned)
// ============================================

/**
 * Mensaje base - estructura exacta del backend
 */
export interface Message {
  id: number;
  conversacionId: number;
  remitenteId: number;
  contenido?: string; // undefined si fue eliminado
  tipo: MessageType;
  mediaId: number | null;
  estado: MessageStatus;
  enviadoEn: string; // ISO timestamp
  leido: boolean;
  eliminado: boolean;
}

/**
 * Conversación base - estructura del backend
 */
export interface Conversation {
  id: number;
  emisorId: number;
  receptorId: number;
  silenciado: boolean;
  estado: ConversationStatus;
  creadoEn: string;
  actualizadoEn?: string;
}

// ============================================
// EXTENDED TYPES WITH RELATIONS
// ============================================

/**
 * Usuario - datos básicos para chat
 */
export interface ChatUser {
  id: number;
  nombre: string;
  apellido: string;
  email?: string;
  fotoPerfil?: string;
  conectado?: boolean;
  rol?: string;
}

/**
 * Media - metadatos de archivos multimedia
 */
export interface MediaAttachment {
  id: number;
  archivo: string; // URL
  nombre: string;
  tipoMime: string;
  tamanioBytes: number;
}

/**
 * Mensaje con información del remitente
 */
export interface MessageWithSender extends Message {
  remitente?: ChatUser;
  media?: MediaAttachment;
  esPropio: boolean;
}

/**
 * Último mensaje de una conversación
 */
export interface LastMessage {
  id: number;
  contenido?: string;
  tipo: MessageType;
  enviadoEn: string;
  remitenteId: number;
}

/**
 * Conversación con detalles completos (para lista)
 */
export interface ConversationWithDetails extends Conversation {
  ultimoMensaje?: LastMessage;
  otroUsuario: ChatUser;
  mensajesNoLeidos: number;
}

// ============================================
// REQUEST/RESPONSE TYPES
// ============================================

/**
 * Payload para crear/obtener conversación
 */
export interface CreateConversationRequest {
  receptorId: number;
}

export interface CreateConversationResponse {
  success: boolean;
  mensaje: string;
  data: {
    id: number;
    emisorId: number;
    receptorId: number;
    silenciado: boolean;
    estado: string;
    creadoEn: string;
    actualizadoEn: string | null;
    esNueva?: boolean;
  };
}

/**
 * Payload para enviar mensaje de texto
 */
export interface SendTextMessageRequest {
  conversacionId: number;
  contenido: string;
}

/**
 * Payload para enviar mensaje con media
 */
export interface SendMediaMessageRequest {
  conversacionId: number;
  mediaId: number;
  tipo: MessageType;
  contenido?: string;
}

/**
 * Payload para editar mensaje
 */
export interface EditMessageRequest {
  mensajeId: number;
  nuevoContenido: string;
}

/**
 * Payload para marcar mensajes como leídos
 */
export interface MarkAsReadRequest {
  conversacionId: number;
}

/**
 * Respuesta de contador de no leídos
 */
export interface UnreadCountResponse {
  conversacionId: number;
  contador: number;
}

/**
 * Query params para obtener mensajes
 */
export interface GetMessagesParams {
  limite?: number;
  antesDeId?: number; // mensajeId para paginación cursor-based
  pagina?: number; // número de página (1-indexed)
  buscar?: string;
}

/**
 * Respuesta paginada de mensajes
 */
export interface GetMessagesResponse {
  mensajes: MessageWithSender[];
  tieneMas: boolean;
  siguienteCursor?: number;
}

// ============================================
// UPLOAD TYPES
// ============================================

/**
 * Respuesta de subida de archivo
 */
export interface UploadMediaResponse {
  id: number;
  archivo: string;
  nombre: string;
  esAudio?: boolean;
  esDocumento?: boolean;
  esImagen?: boolean;
  esVideo?: boolean;
  estado: string;
  fechaSubida: string;
  tamanioBytes: string;
  tamanioFormateado: string;
  tipoMime: string;
}

/**
 * Tipos de archivo permitidos
 */
export const AllowedMediaTypes = {
  IMAGE: "image",
  AUDIO: "audio",
  VIDEO: "video",
  FILE: "file",
} as const;

export type AllowedMediaTypes = typeof AllowedMediaTypes[keyof typeof AllowedMediaTypes];

// ============================================
// UI STATE TYPES
// ============================================

/**
 * Usuario escribiendo en tiempo real
 */
export interface TypingUser {
  usuarioId: number;
  nombre: string;
  conversacionId: number;
  timestamp: number; // para timeout
}

/**
 * Estado de envío de mensaje (para optimistic updates)
 */
export const MessageSendingStatus = {
  SENDING: "sending",
  SENT: "sent",
  ERROR: "error",
} as const;

export type MessageSendingStatus = typeof MessageSendingStatus[keyof typeof MessageSendingStatus];

/**
 * Mensaje temporal antes de confirmar con servidor
 */
export interface OptimisticMessage extends Omit<Message, "id"> {
  id: string; // temporal ID como string
  sendingStatus: MessageSendingStatus;
  tempFile?: File | Blob; // para preview local
}

// ============================================
// ATTACHMENT QUEUE TYPES (Multi-file upload)
// ============================================

/**
 * Estados posibles de un attachment en la queue
 */
export const AttachmentStatus = {
  PENDING: "pending",
  COMPRESSING: "compressing",
  UPLOADING: "uploading",
  SUCCESS: "success",
  ERROR: "error",
} as const;

export type AttachmentStatus = typeof AttachmentStatus[keyof typeof AttachmentStatus];

/**
 * Item en la queue de archivos a enviar
 */
export interface AttachmentQueueItem {
  id: string; // UUID para identificación única
  file: File; // Archivo original
  type: AllowedMediaTypes; // Tipo detectado (image, audio, video, file)
  preview: string; // URL del blob para preview
  status: AttachmentStatus; // Estado actual del attachment
  progress?: number; // Progreso de upload (0-100)
  error?: string; // Mensaje de error si status === 'error'
  mediaId?: number; // ID retornado por la API después de subir
  originalSize?: number; // Tamaño original en bytes (antes de compresión)
  compressedSize?: number; // Tamaño después de compresión
}

/**
 * Error personalizado para validación de archivos
 */
export class MediaValidationError extends Error {
  type: string;
  maxSize?: number;
  allowedTypes?: string[];

  constructor(
    message: string,
    type: string,
    options?: { maxSize?: number; allowedTypes?: string[] }
  ) {
    super(message);
    this.name = "MediaValidationError";
    this.type = type;
    this.maxSize = options?.maxSize;
    this.allowedTypes = options?.allowedTypes;
    
    // Mantener el stack trace correcto en V8 (Node/V8)
    if (typeof (Error as any).captureStackTrace === "function") {
      (Error as any).captureStackTrace(this, MediaValidationError);
    }
  }
}
