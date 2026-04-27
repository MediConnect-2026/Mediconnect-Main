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


export interface User {
  id: number;
  email: string;
  rol: ApiUserRole | string;
  fotoPerfil?: string | null;
  paciente: Paciente | null;
  banner?: string | null;
  doctor: Doctor | null;
  telefono?: string | null;
  centroSalud: CentroSalud | null;
}

export interface DoctorDocument {
  id: number;
  doctorId: number;
  tipoDocumento: string;
  urlArchivo: string;
  nombreOriginal: string;
  tipoMime: string;
  estadoRevision: string;
  tamanio_bytes: number | null;
  descripcion: string | null;
  estado: string;
  creadoEn: string;
  actualizadoEn: string | null;
}

export interface DoctorEspecialidad {
  id_doctor: number;
  id_especialidad: number;
  es_principal: boolean;
  estado: string;
  creado_en: string;
  actualizado_en: string | null;
  especialidades: {
    id: number;
    nombre: string;
    descripcion: string;
    estado: string;
    creadoEn: string;
  };
}

export interface Doctor {
  usuarioId: number;
  nombre: string;
  apellido: string;
  numeroDocumentoIdentificacion: string;
  fotoDocumento: string | null;
  fotoPerfil: string | null;
  banner?: string | null;
  fechaNacimiento: string; // ISO Date string
  genero: string;
  telefono: string | null;
  nacionalidad: string;
  exequatur: string;
  biografia: string;
  anosExperiencia: number;
  estadoVerificacion: string;
  comentarioVerificacion?: string | null;
  calificacionPromedio: string;
  estado: string;
  creadoEn: string; // ISO Date string
  actualizadoEn: string; // ISO Date string
  certificacionesAdicionales: string[] | null;
  tituloAcademico: string | null;
  tipoDocIdentificacion: string;
  ubicacionId: number | null;
  duracionCitaPromedio: number;
  tarifas: any | null; // Puedes definir una interfaz Tarifa si conoces la estructura
  ubicacion: any | null; // Puedes definir una interfaz Ubicacion si conoces la estructura
  formaciones: any[]; // Array de formaciones
  especialidades?: DoctorEspecialidad[];
  documentos?: DoctorDocument[];
  usuario?: User; // Para acceder a datos comunes del usuario como email, fotoPerfil, etc.
}


export interface Paciente {
  usuarioId: number;
  nombre: string;
  apellido: string;
  numero_documento_identificacion: string;
  tipoDocIdentificacion: string;
  foto_documento: string | null;
  fotoPerfil?: string | null; // Alias para compatibilidad
  banner?: string | null;
  fechaNacimiento: string; // ISO Date string
  genero: string;
  altura: number | null;
  peso: number | null;
  tipoSangre: string | null;
  estado: string;
  telefono: string | null;
  ubicacionId: number | null;
  creadoEn: string; // ISO Date string
  actualizadoEn: string | null; // ISO Date string
  // Aliases para compatibilidad con código existente
  createdAt?: string;
  fechaCreacion?: string;
  usuario?: User; // Para acceder a datos comunes del usuario como email, fotoPerfil, etc.
}

export interface CentroSalud {
  // Define las propiedades del centro de salud aquí
  [key: string]: any;
}
// --- LOGIN CON EMAIL/PASSWORD ---
export interface LoginRequest {
  email: string;
  password: string;
}

export interface LoginResponse {
  success: boolean;
  accessToken: string;
  refreshToken: string;
  usuario: User;
}

// --- LOGIN CON GOOGLE ---
export interface GoogleLoginRequest {
  idToken: string;
}

// Respuesta cuando el usuario ya está registrado (login)
export interface GoogleLoginSuccessResponse {
  success: true;
  estado: 'login';
  accessToken: string;
  refreshToken: string;
  user?: User;
  usuario?: User; // El backend puede devolver 'usuario' en lugar de 'user'
}

// Respuesta cuando el usuario necesita completar registro
export interface GoogleRegistrationResponse {
  success: true;
  estado: 'registro';
  message: string;
  registroToken: string;
  email?: string;
  nombre?: string;
  apellido?: string;
  foto?: string;
  banner?: string;
}

// Unión de ambas respuestas posibles
export type GoogleLoginResponse = GoogleLoginSuccessResponse | GoogleRegistrationResponse;

// --- SOLICITAR CÓDIGO OTP ---
export interface SolicitarCodigoRequest {
  email: string;
}

export interface SolicitarCodigoResponse {
  success: boolean;
  message: string;
}

// --- SOLICITAR CÓDIGO OTP PARA RECUPERACIÓN DE CONTRASEÑA ---
export interface SolicitarCodigoPasswordRequest {
  email: string;
}

export interface SolicitarCodigoPasswordResponse {
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

// --- VALIDAR CÓDIGO RECUPERACIÓN DE CONTRASEÑA ---
export interface ValidarCodigoPasswordRequest {
  email: string;
  codigo: string;
}

export interface ValidarCodigoPasswordResponse {
  success: boolean;
  message: string;
  data: {
    token: string;
  };
}

// --- CAMBIAR CONTRASEÑA ---
export interface CambiarPasswordRequest {
  nuevaPassword: string;
  confirmarPassword: string;
}

export interface CambiarPasswordResponse {
  success: boolean;
  message: string;
}

// --- SOLICITAR CÓDIGO OTP PARA CAMBIO DE EMAIL ---
export interface SolicitarCodigoEmailRequest {
  email: string;
}

export interface SolicitarCodigoEmailResponse {
  success: boolean;
  message: string;
}

// --- VALIDAR CÓDIGO OTP PARA CAMBIO DE EMAIL ---
export interface ValidarCodigoEmailRequest {
  email: string;
  codigo: string;
}

export interface ValidarCodigoEmailResponse {
  success: boolean;
  message: string;
  data: {
    token: string;
  };
}

// --- CAMBIAR EMAIL ---
export interface CambiarEmailRequest {
  nuevoEmail: string;
  password: string;
}

export interface CambiarEmailResponse {
  success: boolean;
  message: string;
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
 * Transforma la respuesta del login retornando el usuario completo del API
 */
export function normalizeLoginResponse(response: LoginResponse): {
  accessToken: string;
  refreshToken: string;
  user: User;
} {
  return {
    accessToken: response.accessToken,
    refreshToken: response.refreshToken,
    user: {
      id: response.usuario.id,
      email: response.usuario.email,
      fotoPerfil: getUserAvatar(response.usuario) || undefined,
      banner: getUserBanner(response.usuario) || undefined,
      rol: getUserAppRole(response.usuario) || response.usuario.rol,
      telefono: getUserPhone(response.usuario) || undefined,
      paciente: response.usuario.paciente || null,
      doctor: response.usuario.doctor || null,
      centroSalud: response.usuario.centroSalud || null,
    },
  };
}

/**
 * Type guard para verificar si la respuesta de Google es un login exitoso
 */
export function isGoogleLoginSuccess(response: GoogleLoginResponse): response is GoogleLoginSuccessResponse {
  return response.estado === 'login';
}

/**
 * Type guard para verificar si la respuesta de Google requiere registro
 */
export function isGoogleRegistration(response: GoogleLoginResponse): response is GoogleRegistrationResponse {
  return response.estado === 'registro';
}

/**
 * Transforma la respuesta del login con Google retornando un objeto User completo
 * Solo funciona con respuestas de tipo login exitoso
 */
export function normalizeGoogleLoginResponse(response: GoogleLoginSuccessResponse): {
  accessToken: string;
  refreshToken: string;
  user: User;
} {
  // El backend puede devolver 'usuario' o 'user', manejamos ambos casos
  const userData = response.user || response.usuario;
  
  if (!userData) {
    console.error('❌ No se encontró información del usuario en la respuesta:', response);
    throw new Error('Respuesta de Google inválida: falta información del usuario');
  }
  
  return {
    accessToken: response.accessToken,
    refreshToken: response.refreshToken,
    user: {
      id: userData.id,
      email: userData.email,
      fotoPerfil: getUserAvatar(userData) || undefined,
      banner: getUserBanner(userData) || undefined,
      rol: getUserAppRole(userData) || userData.rol,
      telefono: getUserPhone(userData) || undefined,
      paciente: userData.paciente || null,
      doctor: userData.doctor || null,
      centroSalud: userData.centroSalud || null,
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

// --- REFRESH TOKEN ---
export interface RefreshTokenRequest {
  refreshToken: string;
}

export interface RefreshTokenResponse {
  success: boolean;
  accessToken: string;
  refreshToken: string;
}

// --- UTILIDADES PARA TRABAJAR CON EL USUARIO ---
/**
 * Obtiene el nombre completo del usuario según su rol
 */
export function getUserFullName(user: User | any | null): string {
  if (!user) return '';

  if (user.doctor) {
    return `${user.doctor.nombre} ${user.doctor.apellido}`;
  } else if (user.paciente && user.paciente.nombre) {
    return `${user.paciente.nombre} ${user.paciente.apellido || ''}`.trim();
  } else if (user.centroSalud && user.centroSalud.nombreComercial) {
    return user.centroSalud.nombreComercial;
  } else if(user.nombre && user.apellido){
    return `${user.nombre} ${user.apellido}`;
  }
  
  // Fallback: usar el email
  return user.email.split('@')[0];
}

export function getUserName(user: User | any | null): string {
  if (!user) return '';

  if (user.doctor) {
    return user.doctor.nombre;
  } else if (user.paciente && user.paciente.nombre) {
    return user.paciente.nombre;
  } else if (user.centroSalud && user.centroSalud.nombreComercial) {
    return user.centroSalud.nombreComercial;
  } else if(user.nombre){
    return user.nombre;
  }
  // Fallback: usar el email
  return user.email.split('@')[0];
}

export function getUserLastName(user: User | any | null): string {
  if (!user) return '';
  if (user.doctor) {
    return user.doctor.apellido;
  }
  if (user.paciente && user.paciente.apellido) {
    return user.paciente.apellido;
  }

  if(user.apellido){
    return user.apellido;
  }

  // Para centros de salud o si no hay apellido, retornar cadena vacía
  return '';
}



/**
 * Obtener el telefono del usuario según su rol
 */
export function getUserPhone(user: User | any | null): string {
  if (!user) return '';
  
  // Primero verificar si hay teléfono directo en el usuario
  if (user.telefono) {
    return user.telefono;
  }
  
  // Para doctores, buscar primero en doctor.usuario.telefono
  if (user.doctor) {
    if (user.doctor.usuario?.telefono) {
      return user.doctor.usuario.telefono;
    }
    if (user.doctor.telefono) {
      return user.doctor.telefono;
    }
  }
  
  // Para pacientes
  if(user.paciente){
    if (user.paciente.usuario?.telefono) {
      return user.paciente.usuario.telefono;
    }

    if (user.paciente.telefono) {
      return user.paciente.telefono;
    }
  }
  
  
  // Para centros de salud
  if (user.centroSalud && user.centroSalud.telefono) {
    return user.centroSalud.telefono;
  }
  
  if(user.usuario?.telefono){
    return user.usuario.telefono;
  }

  return '';
}

/**
 * Obtiene las iniciales del usuario para el avatar
 */
export function getUserInitials(user: User | any | null): string {
  if (!user) return '';
  const fullName = getUserFullName(user);
  const names = fullName.split(' ');
  if (names.length === 1) {
    return names[0].charAt(0).toUpperCase();
  } else {
    return (names[0].charAt(0) + names[names.length - 1].charAt(0)).toUpperCase();
  }
}

/**
 * Obtener el rating del doctor en formato de estrellas (1-5) a partir de calificacionPromedio
 */
export function getDoctorRating(calificacionPromedio: string | null): number {
  if (!calificacionPromedio) return 0;
  const rating = parseFloat(calificacionPromedio);
  if (isNaN(rating)) return 0;
  return Math.min(5, Math.max(1, rating));
}


/**
 * Obtiene el rol de la aplicación a partir del usuario
 * Maneja tanto roles en formato API ('Doctor', 'Paciente') como roles ya normalizados ('DOCTOR', 'PATIENT')
 */
export function getUserAppRole(user: User | null): AppUserRole | null {
  if (!user) return null;
  
  const rol = user.rol;
  
  // Si el rol ya está en formato AppUserRole, retornarlo directamente
  if (rol === 'PATIENT' || rol === 'DOCTOR' || rol === 'CENTER' || rol === 'ADMINISTRATOR') {
    return rol as AppUserRole;
  }
  
  // Si no, intentar mapearlo desde ApiUserRole
  return roleMapping[rol as ApiUserRole] || null;
}

/**
 * Obtiene el avatar del usuario según su rol
 * Busca primero en user.fotoPerfil (para usuarios de Google u otros con foto directa)
 * Luego busca en el objeto específico del rol (doctor, paciente, centroSalud)
 */
export function getUserAvatar(user: User | any | null): string | undefined {
  if (!user) return undefined;
  
  // Primero verificar si hay foto de perfil directa en el usuario
  if (user.fotoPerfil) {
    return user.fotoPerfil;
  }
  
  // Luego buscar en el objeto específico del rol
  if (user.doctor?.fotoPerfil) {
    return user.doctor.fotoPerfil;
  }
  
  if (user.paciente?.fotoPerfil || user.paciente?.foto_documento) {
    return user.paciente.fotoPerfil || undefined;
  }
  
  if (user.centroSalud?.fotoPerfil) {
    return user.centroSalud.fotoPerfil;
  }

  if(user.usuario?.fotoPerfil){
    return user.usuario.fotoPerfil;
  }
  
  // Si no hay foto de perfil, retornar undefined para que se muestre el avatar generado
  return undefined;
}


/*
  * Funcion para obtener el banner del usuario según su rol
  * Busca primero en user.banner (para usuarios de Google u otros con banner directo)
  * Luego busca en el objeto específico del rol (doctor, paciente, centroSalud)
  */
export function getUserBanner(user: User | null): string | undefined {
  if (!user) return undefined;
  // Primero verificar si hay banner directo en el usuario
  if (user.banner) {
    return user.banner;
  }
  // Luego buscar en el objeto específico del rol
  if (user.doctor?.banner) {
    return user.doctor.banner;
  }
  if (user.paciente?.banner) {
    return user.paciente.banner || undefined;
  }
  if (user.centroSalud?.banner) {
    return user.centroSalud.banner;
  }
  // Si no hay banner, retornar undefined para que se muestre el fondo predeterminado
  return undefined;
}


/**
 * Función para obtener la fecha en la que se creó el usuario, formateada como texto
 * Español: "día 10 del mes de enero del año 2020"
 * Inglés: "January 10, 2020"
 */
export function getUserCreationDate(paciente: Paciente | null, locale: string = 'es'): string {
  if (!paciente) return '';
  const date = new Date(paciente.creadoEn || paciente.createdAt || paciente.fechaCreacion || '');
  if (isNaN(date.getTime())) return '';
  
  if (locale === 'en') {
    // Formato en inglés: "January 10, 2020"
    return date.toLocaleDateString('en-US', { 
      month: 'long', 
      day: 'numeric', 
      year: 'numeric' 
    });
  } else {
    // Formato en español: "día 10 del mes de enero del año 2020"
    const day = date.getDate();
    const month = date.toLocaleDateString('es-ES', { month: 'long' });
    const year = date.getFullYear();
    return `día ${day} del mes de ${month} del año ${year}`;
  }
}

/**
 * Función para obtener la edad del paciente a partir de su fecha de nacimiento
 */
export function getPatientAge(paciente: Paciente | null): number | null {
  if (!paciente || !paciente.fechaNacimiento) return null;
  const birthDate = new Date(paciente.fechaNacimiento);
  if (isNaN(birthDate.getTime())) return null;
  const today = new Date();
  let age = today.getFullYear() - birthDate.getFullYear();
  const m = today.getMonth() - birthDate.getMonth();
  if (m < 0 || (m === 0 && today.getDate() < birthDate.getDate())) {
    age--;
  }
  return age;
}


/** 
 * Función para obtener el tipo de sangre del paciente
*/
export function getPatientBloodType(paciente: Paciente | null): string {
  if (!paciente || !paciente.tipoSangre) return '';
  return paciente.tipoSangre;
}

/**
 * Función para obtener la altura del paciente
 */
export function getPatientHeight(paciente: Paciente | null): number | null {
  if (!paciente || paciente.altura === null) return null;
  return paciente.altura;
}

/**
 * Función para obtener el peso del paciente
 */
export function getPatientWeight(paciente: Paciente | null): number | null {
  if (!paciente || paciente.peso === null) return null;
  return paciente.peso;
}

/**
 * Fuincion para calcular el indice de masa corporal (IMC) del paciente
 * IMC = peso (kg) / (altura (m))^2
 */
export function calculatePatientBMI(paciente: Paciente | null): number | null {
  const height = getPatientHeight(paciente);
  const weight = getPatientWeight(paciente);
  if (height === null || weight === null || height === 0) return null;
  const heightInMeters = height / 100;
  const bmi = weight / (heightInMeters * heightInMeters);
  return parseFloat(bmi.toFixed(2));
}


/**
 * Función para obtener el género del paciente
 */
export function getPatientGender(paciente: Paciente | null): string {
  if (!paciente || !paciente.genero) return '';
  return paciente.genero;
}

/**
 * Verifica si un usuario tiene estado "Eliminado"
 * Revisa el estado en el objeto del rol correspondiente (paciente, doctor o centroSalud)
 */
export function isUserDeleted(user: User | null): boolean {
  if (!user) return false;
  
  // Verificar estado en paciente
  if (user.paciente && user.paciente.estado) {
    return user.paciente.estado.toLowerCase() === 'eliminado';
  }
  
  // Verificar estado en doctor
  if (user.doctor && user.doctor.estado) {
    return user.doctor.estado.toLowerCase() === 'eliminado';
  }
  
  // Verificar estado en centro de salud
  if (user.centroSalud && user.centroSalud.estado) {
    return user.centroSalud.estado.toLowerCase() === 'eliminado';
  }
  
  return false;
}

// --- VERIFICAR DOCUMENTO ---
export interface VerificarDocumentoRequest {
  numero: string;
}

export interface VerificarDocumentoResponse {
  success: boolean;
  disponible: boolean;
  message: string;
  tipoUsuario?: 'Doctor' | 'Paciente';
}

// --- ELIMINAR CUENTA ---
export interface DeleteAccountRequest {
  password: string;
  confirmacion: string; // Debe ser exactamente "ELIMINAR CUENTA"
}

export interface DeleteAccountResponse {
  mensaje: string;
  nota?: string;
}

export interface DeleteAccountError {
  error: string;
  detalles?: string[] | string;
  mensaje?: string;
}
