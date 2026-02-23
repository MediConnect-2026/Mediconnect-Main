import type { Doctor as DoctorAuth, DoctorEspecialidad, DoctorDocument } from '@/services/auth/auth.types';

// --- TIPOS BASE DEL DOCTOR ---

/**
 * Respuesta del endpoint GET /doctores/me
 * Obtiene el perfil completo del doctor autenticado
 */
export interface GetDoctorProfileResponse {
  success: boolean;
  data: DoctorAuth;
}

/**
 * Request para actualizar el perfil del doctor autenticado
 * PATCH /doctores/me
 */
export interface UpdateDoctorProfileRequest {
  nombre?: string;
  apellido?: string;
  telefono?: string;
  biografia?: string;
  anosExperiencia?: number;
  tarifas?: number;
  fechaNacimiento?: string; // ISO Date string
  duracionCitaPromedio?: number;
  nacionalidad?: string;
  estado?: 'Activo' | 'Inactivo';
}

/**
 * Respuesta al actualizar el perfil del doctor
 */
export interface UpdateDoctorProfileResponse {
  success: boolean;
  message: string;
  data: DoctorAuth;
}

/**
 * Error al actualizar el perfil del doctor
 */
export interface UpdateDoctorProfileError {
  success: boolean;
  message: string;
  error?: string;
  detalles?: string[] | string;
}

/**
 * Request para actualizar la foto de perfil
 * PATCH /auth/foto-perfil
 */
export interface UpdateProfilePhotoRequest {
  fotoPerfil: File;
}

/**
 * Respuesta al actualizar la foto de perfil
 */
export interface UpdateProfilePhotoResponse {
  success: boolean;
  message: string;
  data: {
    fotoPerfil: string;
  };
}

/**
 * Error al actualizar la foto de perfil
 */
export interface UpdateProfilePhotoError {
  success: boolean;
  message: string;
  error?: string;
  detalles?: string[] | string;
}

/**
 * Request para actualizar el banner
 * PATCH /auth/banner
 */
export interface UpdateBannerRequest {
  banner: File;
}

/**
 * Respuesta al actualizar el banner
 */
export interface UpdateBannerResponse {
  success: boolean;
  message: string;
  data: {
    bannerUrl: string;
  };
}

/**
 * Error al actualizar el banner
 */
export interface UpdateBannerError {
  success: boolean;
  message: string;
  error?: string;
  detalles?: string[] | string;
}

/**
 * Request para actualizar un documento rechazado
 * PUT /doctores/documentos/{id}
 */
export interface UpdateRejectedDocumentRequest {
  archivo: File;
  descripcion?: string;
}

/**
 * Respuesta al actualizar un documento rechazado
 */
export interface UpdateRejectedDocumentResponse {
  success: boolean;
  message: string;
}

/**
 * Error al actualizar documento
 */
export interface UpdateDocumentError {
  success: boolean;
  message: string;
  error?: string;
  detalles?: string[] | string;
}

/**
 * Error genérico del servicio de doctores
 */
export interface DoctorServiceError {
  error?: string;
  message?: string;
  detalles?: string[] | string;
  statusCode?: number;
}

// Utilidades para trabajar con los doctores
// --- EXPERIENCIAS LABORALES ---

/**
 * Estructura de una experiencia laboral del doctor
 */
export interface ExperienciaLaboral {
  id: number;
  doctorId: number;
  posicion: string;
  institucion: string;
  ubicacion?: string | null;
  fechaInicio: string; // ISO Date string
  fechaFinalizacion: string | null; // ISO Date string
  trabajaActualmente: boolean;
  descripcion?: string | null;
  estado: string;
  creadoEn: string;
  actualizadoEn: string | null;
}

/**
 * Respuesta del endpoint GET /experiencias-laborales/doctor/{doctorId}
 * Obtiene las experiencias laborales del doctor
 */
export interface GetExperienciasLaboralesResponse {
  success: boolean;
  message: string;
  data: {
    experiencias: ExperienciaLaboral[];
    total: number;
  };
}

/**
 * Parámetros opcionales para obtener experiencias laborales
 */
export interface GetExperienciasLaboralesParams {
  target?: string; // Código de idioma para traducción
  translate_fields?: string; // Campos a traducir
}

/**
 * Request para crear una nueva experiencia laboral
 * POST /experiencias-laborales
 */
export interface CreateExperienciaLaboralRequest {
  posicion: string;
  institucion: string;
  ubicacion?: string | null;
  fechaInicio: string; // YYYY-MM format o ISO Date
  fechaFinalizacion?: string | null; // YYYY-MM format o ISO Date
  trabajaActualmente?: boolean;
  descripcion?: string | null;
}

/**
 * Respuesta al crear una experiencia laboral
 */
export interface CreateExperienciaLaboralResponse {
  success: boolean;
  message: string;
  data: ExperienciaLaboral;
}

/**
 * Request para actualizar una experiencia laboral
 * PUT /experiencias-laborales/{id}
 */
export interface UpdateExperienciaLaboralRequest {
  posicion?: string;
  institucion?: string;
  ubicacion?: string | null;
  fechaInicio?: string; // YYYY-MM format o ISO Date
  fechaFinalizacion?: string | null; // YYYY-MM format o ISO Date
  trabajaActualmente?: boolean;
  descripcion?: string | null;
  estado?: string;
}

/**
 * Respuesta al actualizar una experiencia laboral
 */
export interface UpdateExperienciaLaboralResponse {
  success: boolean;
  message: string;
  data: ExperienciaLaboral;
}

/**
 * Respuesta al eliminar una experiencia laboral
 * DELETE /experiencias-laborales/{id}
 */
export interface DeleteExperienciaLaboralResponse {
  success: boolean;
  message: string;
}

/**
 * Error al gestionar experiencias laborales
 */
export interface ExperienciaLaboralError {
  success: false;
  message: string;
  error?: string;
  detalles?: string[] | string;
  statusCode?: number;
}

// --- RE-EXPORTAR TIPOS RELACIONADOS ---

// --- TIPOS PARA SEGUROS MÉDICOS ---

export interface TipoSeguro {
  id: number;
  nombre: string;
  descripcion: string;
  estado?: string;
  creadoEn?: string;
}

export interface GetAvailableInsuranceTypesResponse {
  success: boolean;
  message?: string;
  data: TipoSeguro[];
}

export interface Seguro {
  id: number;
  nombre: string;
  descripcion?: string;
  idTipoSeguro?: number;
  tipoSeguro?: TipoSeguro | string;
}

export interface GetAvailableInsurancesResponse {
  success: boolean;
  data: Seguro[];
}

export interface GetAcceptedInsurancesResponse {
  success: boolean;
  data: Array<{
    creadoEn: string;
    estado: string;
    seguro: {
      id: number;
      nombre: string;
      descripcion?: string;
      urlImage?: string | null;
      creadoEn: string;
      estado: string;
    };
    tipoSeguro: TipoSeguro;
  }>;
}

export interface AddAcceptedInsuranceRequest {
  idSeguro: number;
  idTipoSeguro: number;
}

export interface AddAcceptedInsuranceResponse {
  success: boolean;
  message: string;
  data: {
    creadoEn: string;
    estado: string;
    seguro: {
      id: number;
      nombre: string;
      descripcion?: string;
      urlImage?: string | null;
      creadoEn: string;
      estado: string;
    };
    tipoSeguro: TipoSeguro;
  };
}

export interface RemoveAcceptedInsuranceResponse {
  success: boolean;
  message: string;
}

export interface InsuranceError {
  success: false;
  message: string;
  error?: string;
  statusCode?: number;
}

// --- TIPOS PARA IDIOMAS DEL DOCTOR ---

export interface Idioma {
  id: number;
  doctorId: number;
  nombre: string;
  nivel: string;
  estado: string;
  creadoEn: string;
  actualizadoEn: string | null;
}


export interface GetDoctorLanguagesResponse {
  success: boolean;
  message?: string;
  data: Idioma[];
}

export interface AddDoctorLanguageRequest {
  nombre: string;
  nivel: string;
}

export interface AddDoctorLanguageResponse {
  success: boolean;
  message: string;
  data: Idioma;
}

export interface UpdateDoctorLanguageRequest {
  nombre?: string;
  nivel?: string;
}

export interface UpdateDoctorLanguageResponse {
  success: boolean;
  message: string;
  data: Idioma;
}

export interface DeleteDoctorLanguageResponse {
  success: boolean;
  message: string;
}

export interface LanguageError {
  success: false;
  message: string;
  error?: string;
  statusCode?: number;
}

// --- RE-EXPORTAR TIPOS RELACIONADOS ---

/**
 * Re-exportar tipos de autenticación para facilitar el uso
 */
export type { DoctorAuth as Doctor, DoctorEspecialidad, DoctorDocument };
