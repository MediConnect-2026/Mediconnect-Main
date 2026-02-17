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

// --- FORMACIONES ACADÉMICAS ---

/**
 * Estructura de una formación académica del doctor
 */
export interface FormacionAcademica {
  id: number;
  doctorId: number;
  titulo: string;
  institucion: string;
  ubicacion: string | null;
  fechaInicio: string; // ISO Date string
  fechaFin: string | null; // ISO Date string
  enCurso: boolean;
  descripcion: string | null;
  estado: string;
  creadoEn: string;
  actualizadoEn: string | null;
}

/**
 * Respuesta del endpoint GET /doctores/formaciones-academicas
 * Obtiene las formaciones académicas del doctor autenticado
 */
export interface GetFormacionesAcademicasResponse {
  success: boolean;
  message: string;
  data: FormacionAcademica[];
}

/**
 * Parámetros opcionales para obtener formaciones académicas
 */
export interface GetFormacionesAcademicasParams {
  target?: string; // Código de idioma para traducción
  translate_fields?: string; // Campos a traducir
}

// --- EXPERIENCIAS LABORALES ---

/**
 * Estructura de una experiencia laboral del doctor
 */
export interface ExperienciaLaboral {
  id: number;
  doctorId: number;
  cargo: string;
  institucion: string;
  ubicacion: string | null;
  fechaInicio: string; // ISO Date string
  fechaFin: string | null; // ISO Date string
  actualmenteAqui: boolean;
  descripcion: string | null;
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
  data: ExperienciaLaboral[];
}

/**
 * Parámetros opcionales para obtener experiencias laborales
 */
export interface GetExperienciasLaboralesParams {
  target?: string; // Código de idioma para traducción
  translate_fields?: string; // Campos a traducir
}

// --- RE-EXPORTAR TIPOS RELACIONADOS ---

/**
 * Re-exportar tipos de autenticación para facilitar el uso
 */
export type { DoctorAuth as Doctor, DoctorEspecialidad, DoctorDocument };
