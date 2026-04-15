import type { AxiosError } from 'axios';
import type { ApiErrorResponse } from '@/services/api/client';
import type { TFunction } from 'i18next';

/**
 * Obtiene un mensaje de error amigable basado en el error de autenticación
 */
export function getAuthErrorMessage(
  error: AxiosError<ApiErrorResponse>,
  t: TFunction<'auth', undefined>
): string {
  // Si hay respuesta del servidor
  if (error.response) {
    const { status, data } = error.response;

    // Mensajes por código de estado
    switch (status) {
      case 400:
        return t('errors.invalidData');
      case 401:
        return t('errors.invalidCredentials');
      case 403:
        return t('errors.userInactive');
      case 409:
        return t('errors.emailAlreadyExists');
      case 500:
        return t('errors.serverError');
      default:
        return data.message;
    }
  }

  // Error de red
  if (error.request) {
    return t('errors.networkError');
  }

  // Error desconocido
  return t('errors.unexpectedError');
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
