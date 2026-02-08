import type { AxiosError } from 'axios';
import type { ApiErrorResponse } from '@/services/api/client';
import { AUTH_ERROR_MESSAGES } from '@/services/auth/auth.types';

/**
 * Obtiene un mensaje de error amigable basado en el error de autenticación
 */
export function getAuthErrorMessage(error: AxiosError<ApiErrorResponse>): string {
  // Si hay respuesta del servidor
  if (error.response) {
    const { status, data } = error.response;

    // Usar el mensaje del backend si está disponible
    if (data?.message) {
      return data.message;
    }

    // Mensajes por código de estado
    switch (status) {
      case 400:
        return 'Datos inválidos. Verifica tu email y contraseña';
      case 401:
        return AUTH_ERROR_MESSAGES.INVALID_CREDENTIALS;
      case 403:
        return AUTH_ERROR_MESSAGES.USER_INACTIVE;
      case 409:
        return AUTH_ERROR_MESSAGES.EMAIL_ALREADY_EXISTS;
      case 500:
        return AUTH_ERROR_MESSAGES.SERVER_ERROR;
      default:
        return 'Error al procesar tu solicitud';
    }
  }

  // Error de red
  if (error.request) {
    return AUTH_ERROR_MESSAGES.NETWORK_ERROR;
  }

  // Error desconocido
  return 'Ocurrió un error inesperado';
}

/**
 * Verifica si un error es de credenciales inválidas
 */
export function isInvalidCredentialsError(error: AxiosError<ApiErrorResponse>): boolean {
  return error.response?.status === 401;
}

/**
 * Verifica si un error es de usuario inactivo
 */
export function isUserInactiveError(error: AxiosError<ApiErrorResponse>): boolean {
  return error.response?.status === 403;
}

/**
 * Verifica si un error es de email ya registrado
 */
export function isEmailAlreadyExistsError(error: AxiosError<ApiErrorResponse>): boolean {
  return error.response?.status === 409;
}

/**
 * Verifica si un error es de red
 */
export function isNetworkError(error: AxiosError<ApiErrorResponse>): boolean {
  return !error.response && !!error.request;
}
