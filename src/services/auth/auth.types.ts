// --- ROLES DE USUARIO ---
export type ApiUserRole = 'Paciente' | 'Doctor' | 'Centro' | 'Administrador';
export type AppUserRole = 'PATIENT' | 'DOCTOR' | 'CENTER' | 'ADMINISTRATOR';

// Mapeo de roles de API a roles de aplicación
export const roleMapping: Record<ApiUserRole, AppUserRole> = {
  'Paciente': 'PATIENT',
  'Doctor': 'DOCTOR',
  'Centro': 'CENTER',
  'Administrador': 'ADMINISTRATOR',
};

// Mapeo inverso
export const reverseRoleMapping: Record<AppUserRole, ApiUserRole> = {
  'PATIENT': 'Paciente',
  'DOCTOR': 'Doctor',
  'CENTER': 'Centro',
  'ADMINISTRATOR': 'Administrador',
};

// --- LOGIN CON EMAIL/PASSWORD ---
export interface LoginRequest {
  email: string;
  password: string;
}

export interface LoginResponse {
  success: boolean;
  token: string;
  usuario: {
    id: number;
    email: string;
    rol: ApiUserRole;
    fotoPerfil: string | null;
  };
}

// --- LOGIN CON GOOGLE ---
export interface GoogleLoginRequest {
  idToken: string;
}

export interface GoogleLoginResponse {
  success: boolean;
  token: string;
  user: {
    id: number;
    email: string;
    rol: ApiUserRole;
    fotoPerfil: string | null;
  };
}

// --- SOLICITAR CÓDIGO OTP ---
export interface SolicitarCodigoRequest {
  email: string;
}

export interface SolicitarCodigoResponse {
  success: boolean;
  message: string;
}

// --- VALIDAR CÓDIGO OTP ---
export interface ValidarCodigoRequest {
  email: string;
  codigo: string;
}

export interface ValidarCodigoResponse {
  success: boolean;
  message: string;
  data: {
    token: string;
  };
}

// --- USUARIO NORMALIZADO (para el store) ---
export interface NormalizedUser {
  id: string;
  name: string;
  email: string;
  role: AppUserRole;
  avatar?: string;
  banner?: string;
}

// --- UTILIDADES DE TRANSFORMACIÓN ---
/**
 * Transforma la respuesta del login a un usuario normalizado
 */
export function normalizeLoginResponse(response: LoginResponse): {
  token: string;
  user: NormalizedUser;
} {
  return {
    token: response.token,
    user: {
      id: response.usuario.id.toString(),
      name: '', // Se puede obtener del perfil posteriormente
      email: response.usuario.email,
      role: roleMapping[response.usuario.rol],
      avatar: response.usuario.fotoPerfil || undefined,
    },
  };
}

/**
 * Transforma la respuesta del login con Google a un usuario normalizado
 */
export function normalizeGoogleLoginResponse(response: GoogleLoginResponse): {
  token: string;
  user: NormalizedUser;
} {
  return {
    token: response.token,
    user: {
      id: response.user.id.toString(),
      name: '', // Se puede obtener del perfil posteriormente
      email: response.user.email,
      role: roleMapping[response.user.rol],
      avatar: response.user.fotoPerfil || undefined,
    },
  };
}

// --- ERRORES DE AUTENTICACIÓN ---
export interface AuthError {
  success: false;
  message: string;
  error?: string;
  statusCode?: number;
}

export const AUTH_ERROR_MESSAGES = {
  INVALID_CREDENTIALS: 'Credenciales inválidas',
  USER_INACTIVE: 'Usuario inactivo o bloqueado',
  EMAIL_ALREADY_EXISTS: 'El correo ya está registrado',
  INVALID_OTP: 'Código OTP inválido o expirado',
  INVALID_TOKEN: 'Token inválido o expirado',
  NETWORK_ERROR: 'Error de conexión. Verifica tu internet',
  SERVER_ERROR: 'Error del servidor. Intenta más tarde',
} as const;
