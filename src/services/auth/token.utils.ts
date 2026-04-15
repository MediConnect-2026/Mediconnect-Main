/**
 * Utilidades para el manejo de tokens JWT
 */

export interface DecodedToken {
  exp: number; // Tiempo de expiración en segundos (Unix timestamp)
  iat: number; // Tiempo de emisión en segundos (Unix timestamp)
  [key: string]: any;
}

/**
 * Decodifica un token JWT sin verificar la firma
 * @param token - Token JWT a decodificar
 * @returns Payload del token decodificado o null si el token es inválido
 */
export function decodeToken(token: string): DecodedToken | null {
  try {
    // Los JWT tienen tres partes separadas por puntos: header.payload.signature
    const parts = token.split('.');
    
    if (parts.length !== 3) {
      console.error('🔐 [Token Utils] Token inválido: formato incorrecto');
      return null;
    }
    
    // Decodificar la segunda parte (payload)
    const payload = parts[1];
    const decodedPayload = atob(payload.replace(/-/g, '+').replace(/_/g, '/'));
    
    return JSON.parse(decodedPayload);
  } catch (error) {
    console.error('🔐 [Token Utils] Error al decodificar token:', error);
    return null;
  }
}

/**
 * Verifica si un token ha expirado
 * @param token - Token JWT a verificar
 * @returns true si el token está expirado, false en caso contrario
 */
export function isTokenExpired(token: string): boolean {
  const decoded = decodeToken(token);
  
  if (!decoded || !decoded.exp) {
    console.warn('🔐 [Token Utils] Token sin tiempo de expiración');
    return true;
  }
  
  // exp está en segundos, Date.now() está en milisegundos
  const currentTime = Date.now() / 1000;
  const isExpired = decoded.exp < currentTime;
  
  if (isExpired) {
    console.log('🔐 [Token Utils] Token expirado');
  }
  
  return isExpired;
}

/**
 * Verifica si un token expirará pronto (dentro de los próximos N minutos)
 * @param token - Token JWT a verificar
 * @param minutesBeforeExpiry - Número de minutos antes de la expiración (default: 5)
 * @returns true si el token expirará pronto, false en caso contrario
 */
export function willTokenExpireSoon(token: string, minutesBeforeExpiry: number = 5): boolean {
  const decoded = decodeToken(token);
  
  if (!decoded || !decoded.exp) {
    console.warn('🔐 [Token Utils] Token sin tiempo de expiración');
    return true;
  }
  
  // Calcular el tiempo de expiración con el margen
  const currentTime = Date.now() / 1000;
  const expiryThreshold = decoded.exp - (minutesBeforeExpiry * 60);
  
  return currentTime >= expiryThreshold;
}

/**
 * Obtiene el tiempo restante hasta la expiración del token
 * @param token - Token JWT a verificar
 * @returns Tiempo restante en segundos, o 0 si el token está expirado o es inválido
 */
export function getTokenTimeRemaining(token: string): number {
  const decoded = decodeToken(token);
  
  if (!decoded || !decoded.exp) {
    return 0;
  }
  
  const currentTime = Date.now() / 1000;
  const timeRemaining = decoded.exp - currentTime;
  
  return Math.max(0, timeRemaining);
}

/**
 * Formatea el tiempo restante en un formato legible
 * @param seconds - Tiempo en segundos
 * @returns String formateado (ej: "5m 30s", "2h 15m")
 */
export function formatTimeRemaining(seconds: number): string {
  if (seconds <= 0) {
    return 'Expirado';
  }
  
  const hours = Math.floor(seconds / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);
  const secs = Math.floor(seconds % 60);
  
  if (hours > 0) {
    return `${hours}h ${minutes}m`;
  } else if (minutes > 0) {
    return `${minutes}m ${secs}s`;
  } else {
    return `${secs}s`;
  }
}
