/**
 * notifications.service.ts
 * Servicio para gestionar notificaciones
 */
import apiClient from './client';
import API_ENDPOINTS from './endpoints';

/**
 * Interfaz para notificación
 */
export interface Notificacion {
  id: number;
  titulo: string;
  mensaje: string;
  tipoAlerta?: string;
  tipoEntidad?: string;
  entidadId?: number;
  leida: boolean;
  creadoEn: string;
}

/**
 * Respuesta de lista de notificaciones
 */
export interface NotificacionesListResponse {
  success?: boolean;
  data: {
    notificaciones: Notificacion[];
    noLeidas?: number;
    total?: number;
  } | Notificacion[];
  total?: number;
  pagina?: number;
  limite?: number;
}

/**
 * Respuesta del contador de no leídas
 */
export interface ContadorNotificacionesResponse {
  success?: boolean;
  data?: {
    contador?: number;
    noLeidas?: number;
  };
  contador?: number;
}

/**
 * Obtiene todas las notificaciones del usuario autenticado
 * @param pagina - Número de página (opcional)
 * @param limite - Límite de registros por página (opcional)
 * @returns Promise con la lista de notificaciones
 */
export const getNotificaciones = async (
  pagina?: number,
  limite?: number,
  targetLanguage?: string
): Promise<NotificacionesListResponse> => {
  const params = new URLSearchParams();

  if (pagina !== undefined) {
    params.append('pagina', pagina.toString());
  }
  if (limite !== undefined) {
    params.append('limite', limite.toString());
  }
  if (targetLanguage) {
    params.append('target', targetLanguage);
    params.append('source', 'es'); // Asumiendo que las notificaciones del backend original son en español
    params.append('translate_fields', 'titulo,mensaje'); // Solicitar traducción de ambos campos
  }

  const queryString = params.toString();
  const url = queryString
    ? `${API_ENDPOINTS.NOTIFICATIONS.BASE}?${queryString}`
    : API_ENDPOINTS.NOTIFICATIONS.BASE;

  const { data } = await apiClient.get<NotificacionesListResponse>(url);
  return data;
};

/**
 * Obtiene el contador de notificaciones no leídas
 * @returns Promise con el contador de notificaciones no leídas
 */
export const getUnreadNotificationsCount = async (
  targetLanguage?: string
): Promise<
  ContadorNotificacionesResponse
> => {
  const params = new URLSearchParams();
  if (targetLanguage) {
    params.append('target', targetLanguage);
    params.append('source', 'es');
  }

  const queryString = params.toString();
  const url = queryString
    ? `${API_ENDPOINTS.NOTIFICATIONS.UNREAD_COUNT}?${queryString}`
    : API_ENDPOINTS.NOTIFICATIONS.UNREAD_COUNT;

  const { data } = await apiClient.get<ContadorNotificacionesResponse>(url);
  return data;
};

/**
 * Marca una notificación específica como leída
 * @param id - ID de la notificación
 * @returns Promise con la notificación actualizada
 */
export const markNotificationAsRead = async (id: number): Promise<Notificacion> => {
  const { data } = await apiClient.patch<Notificacion>(
    API_ENDPOINTS.NOTIFICATIONS.MARK_AS_READ(id)
  );
  return data;
};

/**
 * Marca todas las notificaciones como leídas
 * @returns Promise con el resultado de la operación
 */
export const markAllNotificationsAsRead = async (): Promise<{
  success: boolean;
  mensaje: string;
}> => {
  const { data } = await apiClient.patch<{
    success: boolean;
    mensaje: string;
  }>(API_ENDPOINTS.NOTIFICATIONS.MARK_ALL_AS_READ);
  return data;
};

/**
 * Obtiene una notificación específica por ID
 * @param id - ID de la notificación
 * @returns Promise con los detalles de la notificación
 */
export const getNotificacionById = async (id: number, targetLanguage?: string): Promise<Notificacion> => {
  const params = new URLSearchParams();
  if (targetLanguage) {
    params.append('target', targetLanguage);
    params.append('source', 'es');
    params.append('translate_fields', 'titulo,mensaje');
  }

  const queryString = params.toString();
  const url = queryString
    ? `${API_ENDPOINTS.NOTIFICATIONS.BY_ID(id)}?${queryString}`
    : API_ENDPOINTS.NOTIFICATIONS.BY_ID(id);

  const { data } = await apiClient.get<Notificacion>(url);
  return data;
};

/**
 * Elimina una notificación
 * @param id - ID de la notificación
 * @returns Promise con el resultado de la operación
 */
export const deleteNotificacion = async (id: number): Promise<{
  success: boolean;
  mensaje: string;
}> => {
  const { data } = await apiClient.delete<{
    success: boolean;
    mensaje: string;
  }>(API_ENDPOINTS.NOTIFICATIONS.BY_ID(id));
  return data;
};
