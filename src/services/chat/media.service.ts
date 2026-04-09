import apiClient from "../api/client";
import API_ENDPOINTS from "../api/endpoints";
import type { UploadMediaResponse } from "@/types/ChatTypes";
import { AllowedMediaTypes } from "@/types/ChatTypes";

/**
 * Límites de tamaño de archivo (en bytes)
 */
const FILE_SIZE_LIMITS = {
  IMAGE: 10 * 1024 * 1024, // 10 MB
  AUDIO: 5 * 1024 * 1024, // 5 MB
  VIDEO: 50 * 1024 * 1024, // 50 MB
  FILE: 20 * 1024 * 1024, // 20 MB
} as const;

/**
 * Tipos MIME permitidos por categoría
 */
const ALLOWED_MIME_TYPES = {
  IMAGE: ["image/jpeg", "image/jpg", "image/png", "image/gif", "image/webp"],
  AUDIO: ["audio/mpeg", "audio/mp3", "audio/wav", "audio/ogg", "audio/webm"],
  VIDEO: ["video/mp4", "video/webm", "video/ogg"],
  FILE: [
    "application/pdf",
    "application/msword",
    "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
    "application/vnd.ms-excel",
    "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
    "text/plain",
    "application/zip",
    "application/x-zip-compressed",
  ],
} as const;

/**
 * Errores de validación
 */
export class MediaValidationError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "MediaValidationError";
  }
}

/**
 * Caché en memoria para URLs de media
 * TTL: 1 hora para signed URLs
 */
class MediaCache {
  private cache: Map<
    number,
    { url: string; expiresAt: number }
  > = new Map();
  private readonly TTL = 60 * 60 * 1000; // 1 hora

  set(mediaId: number, url: string): void {
    const expiresAt = Date.now() + this.TTL;
    this.cache.set(mediaId, { url, expiresAt });
  }

  get(mediaId: number): string | null {
    const cached = this.cache.get(mediaId);
    if (!cached) {
      return null;
    }

    // Verificar si expiró
    if (Date.now() > cached.expiresAt) {
      this.cache.delete(mediaId);
      return null;
    }

    return cached.url;
  }

  clear(): void {
    this.cache.clear();
  }

  // Método de debug
  getStats(): { size: number; entries: Array<{ mediaId: number; expiresIn: number }> } {
    const now = Date.now();
    const entries = Array.from(this.cache.entries()).map(([mediaId, data]) => ({
      mediaId,
      expiresIn: Math.max(0, Math.floor((data.expiresAt - now) / 1000)), // segundos
    }));
    return {
      size: this.cache.size,
      entries,
    };
  }
}

const mediaCache = new MediaCache();

/**
 * Servicio de Media - Manejo de archivos multimedia
 * Upload/download de imágenes, audio, video y archivos genéricos
 */
export const mediaService = {
  /**
   * Validar tipo y tamaño de archivo
   * @param file - Archivo a validar
   * @param mediaType - Tipo de media esperado
   * @throws MediaValidationError si el archivo no es válido
   */
  validateFile(file: File | Blob, mediaType: AllowedMediaTypes): void {
    const fileSize = file.size;
    const mimeType = file.type;

    // Validar tamaño según tipo
    const sizeLimit = FILE_SIZE_LIMITS[mediaType.toUpperCase() as keyof typeof FILE_SIZE_LIMITS];
    if (fileSize > sizeLimit) {
      const limitMB = (sizeLimit / (1024 * 1024)).toFixed(0);
      throw new MediaValidationError(
        `El archivo excede el tamaño máximo permitido de ${limitMB}MB para ${mediaType}`
      );
    }

    // Validar MIME type
    const allowedTypes = ALLOWED_MIME_TYPES[mediaType.toUpperCase() as keyof typeof ALLOWED_MIME_TYPES] as readonly string[];
    if (!allowedTypes.includes(mimeType)) {
      throw new MediaValidationError(
        `Tipo de archivo no permitido: ${mimeType}. Tipos permitidos: ${allowedTypes.join(", ")}`
      );
    }
  },

  /**
   * Subir imagen
   * POST /media/upload
   * @param file - Archivo de imagen
   * @param conversacionId - ID de la conversación (opcional, para contexto)
   * @returns Información del archivo subido (mediaId, URL, etc.)
   */
  uploadImage: async (
    file: File
  ): Promise<UploadMediaResponse> => {
    try {
      // Validar archivo
      mediaService.validateFile(file, AllowedMediaTypes.IMAGE);

      // Crear FormData
      const formData = new FormData();
      formData.append("archivo", file);
      

      // Subir archivo
      const resp = await apiClient.post(API_ENDPOINTS.MEDIA.UPLOAD, formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });

      // Normalizar payload: algunos endpoints devuelven { success, message, data: { ... } }
      const returnedData: any = resp?.data?.data ?? resp?.data;

      // Cachear URL si está presente
      if (returnedData?.id && returnedData?.archivo) {
        mediaCache.set(returnedData.id, returnedData.archivo);
      }

      return returnedData as UploadMediaResponse;
    } catch (error) {
      console.error("[mediaService.uploadImage] Error:", error);
      throw error;
    }
  },

  /**
   * Subir audio (desde grabación o archivo)
   * POST /media/upload
   * @param audioBlob - Blob de audio grabado
   * @param conversacionId - ID de la conversación (opcional)
   * @param duration - Duración del audio en segundos
   * @returns Información del archivo subido
   */
  uploadAudio: async (
    audioBlob: Blob
  ): Promise<UploadMediaResponse> => {
    try {
      // Validar blob
      mediaService.validateFile(audioBlob, AllowedMediaTypes.AUDIO);

      // Convertir Blob a File con nombre
      const fileName = `audio_${Date.now()}.webm`;
      const audioFile = new File([audioBlob], fileName, {
        type: audioBlob.type || "audio/webm",
      });

      // Crear FormData
      const formData = new FormData();
      formData.append("archivo", audioFile);

      // Subir archivo
      const resp = await apiClient.post(API_ENDPOINTS.MEDIA.UPLOAD, formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });

      const returnedData: any = resp?.data?.data ?? resp?.data;

      if (returnedData?.id && returnedData?.archivo) {
        mediaCache.set(returnedData.id, returnedData.archivo);
      }

      return returnedData as UploadMediaResponse;
    } catch (error) {
      console.error("[mediaService.uploadAudio] Error:", error);
      throw error;
    }
  },

  /**
   * Subir archivo genérico
   * POST /media/upload
   * @param file - Archivo a subir
   * @param conversacionId - ID de la conversación (opcional)
   * @returns Información del archivo subido
   */
  uploadFile: async (
    file: File,
  ): Promise<UploadMediaResponse> => {
    try {
      // Validar archivo
      mediaService.validateFile(file, AllowedMediaTypes.FILE);

      // Crear FormData
      const formData = new FormData();
      formData.append("archivo", file);

      // Subir archivo
      const resp = await apiClient.post(API_ENDPOINTS.MEDIA.UPLOAD, formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });

      const returnedData: any = resp?.data?.data ?? resp?.data;

      if (returnedData?.id && returnedData?.archivo) {
        mediaCache.set(returnedData.id, returnedData.archivo);
      } 

      return returnedData as UploadMediaResponse;
    } catch (error) {
      console.error("[mediaService.uploadFile] Error:", error);
      throw error;
    }
  },

  /**
   * Subir video
   * POST /media/upload
   * @param file - Archivo de video
   * @param conversacionId - ID de la conversación (opcional)
   * @returns Información del archivo subido
   */
  uploadVideo: async (
    file: File,

  ): Promise<UploadMediaResponse> => {
    try {
      // Validar archivo
      mediaService.validateFile(file, AllowedMediaTypes.VIDEO);

      // Crear FormData
      const formData = new FormData();
      formData.append("archivo", file);

      // Subir archivo
      const resp = await apiClient.post(API_ENDPOINTS.MEDIA.UPLOAD, formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });

      const returnedData: any = resp?.data?.data ?? resp?.data;

      if (returnedData?.id && returnedData?.archivo) {
        mediaCache.set(returnedData.id, returnedData.archivo);
      }

      return returnedData as UploadMediaResponse;
    } catch (error) {
      console.error("[mediaService.uploadVideo] Error:", error);
      throw error;
    }
  },

  /**
   * Obtener URL de descarga de un archivo (con caché)
   * GET /media/:id
   * @param mediaId - ID del archivo multimedia
   * @returns URL de descarga (signed URL si es privado)
   */
  getMediaUrl: async (mediaId: number): Promise<string> => {
    try {
      // Verificar caché primero
      const cachedUrl = mediaCache.get(mediaId);
      if (cachedUrl) {
        return cachedUrl;
      }
      
      // Obtener URL del servidor
      const response = await apiClient.get(
        API_ENDPOINTS.MEDIA.DOWNLOAD(mediaId)
      );
      
      // Normalizar respuesta: puede venir como { data: { archivo: "url" } } o { archivo: "url" }
      const mediaUrl = response?.data?.data?.archivo || response?.data?.archivo;
      
      if (!mediaUrl) {
        console.error(`[mediaService.getMediaUrl] ❌ URL no encontrada en respuesta:`, response.data);
        throw new Error("URL de media no encontrada en la respuesta del servidor");
      }
      
      // Cachear URL
      mediaCache.set(mediaId, mediaUrl);

      return mediaUrl;
    } catch (error) {
      console.error("[mediaService.getMediaUrl] Error:", error);
      throw error;
    }
  },

  /**
   * Eliminar archivo multimedia
   * DELETE /media/:id
   * @param mediaId - ID del archivo a eliminar
   */
  deleteMedia: async (mediaId: number): Promise<void> => {
    try {
      await apiClient.delete(API_ENDPOINTS.MEDIA.DELETE(mediaId));
      // Limpiar caché
      mediaCache.clear();
    } catch (error) {
      console.error("[mediaService.deleteMedia] Error:", error);
      throw error;
    }
  },

  /**
   * Limpiar caché de URLs
   * Útil al hacer logout
   */
  clearCache: (): void => {
    mediaCache.clear();
  },

  /**
   * Obtener información de límites de archivo
   * @returns Objecto con límites de tamaño por tipo
   */
  getFileSizeLimits: () => {
    return {
      image: FILE_SIZE_LIMITS.IMAGE / (1024 * 1024), // MB
      audio: FILE_SIZE_LIMITS.AUDIO / (1024 * 1024),
      video: FILE_SIZE_LIMITS.VIDEO / (1024 * 1024),
      file: FILE_SIZE_LIMITS.FILE / (1024 * 1024),
    };
  },

  /**
   * Verificar si un tipo MIME es permitido
   * @param mimeType - Tipo MIME a verificar
   * @param mediaType - Categoría de media
   * @returns true si es permitido
   */
  isAllowedMimeType: (
    mimeType: string,
    mediaType: AllowedMediaTypes
  ): boolean => {
    const allowedTypes = ALLOWED_MIME_TYPES[mediaType.toUpperCase() as keyof typeof ALLOWED_MIME_TYPES] as readonly string[];
    return allowedTypes.includes(mimeType);
  },

  /**
   * Obtener estadísticas del caché (para debugging)
   * @returns Información sobre el estado del caché
   */
  getCacheStats: () => {
    const stats = mediaCache.getStats();
    return stats;
  },

  /**
   * Verificar si un mediaId está en caché
   * @param mediaId - ID del media a verificar
   * @returns true si está en caché y no ha expirado
   */
  isCached: (mediaId: number): boolean => {
    return mediaCache.get(mediaId) !== null;
  },
};

export default mediaService;

// Exponer caché en modo desarrollo para debugging
if (import.meta.env.DEV) {
  (window as any).__mediaService = mediaService;
}
