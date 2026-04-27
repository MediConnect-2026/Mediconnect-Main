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
    fotoPerfil?: string;
    fotoPerfilUrl?: string;
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
  urlImage?: string | null;
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

export interface DoctorServices{
  id: number;
  doctorId: number;
  especialidadId: number;
  nombre: string;
  descripcion: string;
  precio: number;
  duracionMinutos: number;
  maxPacientesDia: number;
  calificacionPromedio: number;
  modalidad: string;
  estado: string;
  sesiones: number;
}

export interface CreateDoctorServiceRequest{
  especialidadId: number;
  nombre: string;
  descripcion?: string;
  precio: number;
  duracionMinutos: number;
  sesiones: number;
  maxPacientesDia?: number;
  modalidad: string;
  centroSaludIds?: number[];
  ubicacionIds?: number[];
  horariosIds?: number[];
  imagenes?: (File | Blob)[];
}

export interface CreateDoctorServiceResponse{
  success: boolean;
  message: string;
  data: any;
}

export interface ServicioImagen {
  id: number;
  servicioId: number;
  url: string;
  orden: number;
  estado: string;
  creadoEn: string;
}

export interface ServicioEspecialidad {
  id: number;
  nombre: string;
}

export interface HorarioDia {
  dia_semana: number;
}

export interface HorarioDetalle {
  id: number;
  nombre: string;
  horaInicio: string; // Formato "HH:mm"
  horaFin: string;    // Formato "HH:mm"
  centroSaludId: number | null;
  centroSalud: any | null; // Considera tiparlo si tienes la entidad CentroSalud
  ubicacion: any | null;   // Considera tiparlo si tienes la entidad Ubicacion extendida
  horarios_dias: HorarioDia[];
}

export interface ServicioHorario {
  servicioId: number;
  horarioId: number;
  estado: string;
  creadoEn: string;
  horario: HorarioDetalle;
}

export interface ServicioUbicacionSeccion {
  id: number;
  nombre: string;
  id_municipio: number;
  distritoMunicipal: any | null;
  municipio: ServicioUbicacionMunicipio;
}

export interface ServicioUbicacionMunicipio {
  id: number;
  nombre: string;
  provincia: ServicioUbicacionProvincia;
}

export interface ServicioUbicacionProvincia {
  id: number;
  nombre: string;
}

export interface ServicioUbicacionBarrio {
  id: number;
  nombre: string;
  seccion: ServicioUbicacionSeccion;
}



export interface ServicioUbicacion {
  id: number;
  direccion: string;
  nombre: string;
  codigoPostal: string | null;
  latitud?: number;
  longitud?: number;
  barrio: ServicioUbicacionBarrio;
}

export interface GetServicesOfDoctor {
  id: number;
  doctorId: number;
  especialidadId: number;
  nombre: string;
  descripcion: string;
  precio: number;
  duracionMinutos: number;
  maxPacientesDia: number | null;
  calificacionPromedio: number;
  modalidad: string; // ej. "Presencial" | "Teleconsulta" | "Mixta"
  estado: string;    // ej. "Activo" | "Inactivo"
  creadoEn: string;  // Fecha ISO
  actualizadoEn: string | null;
  imagenes: ServicioImagen[];
  especialidad: ServicioEspecialidad;
  horarios: ServicioHorario[];
  centros: any[]; // Tipar según la estructura de centros que maneje tu backend
  ubicacionId: number | null;
  ubicacion: ServicioUbicacion[];
}

export interface GetSlotsAvailableForServiceResponse {
  success: boolean;
  servicioId: number;
  fecha: string; // Fecha ISO
  total: number;
  data: {
    horaInicio: string; // Formato "HH:mm"
    horaFin: string;    // Formato "HH:mm"
    horaInicioFormateada: string; // Formato "hh:mm A"
    horarioId: number;
    horarioNombre: string;
  }[]
}

export interface GetServicesOfDoctorResponse {
  success: boolean;
  message?: string;
  data: GetServicesOfDoctor[];
}

// --- TIPOS PARA BÚSQUEDA DE DOCTORES POR DISTANCIA ---

/**
 * Servicio simplificado dentro de un doctor (usado en búsqueda por distancia)
 */
export interface DoctorNearbyService {
  id: number;
  nombre: string;
  precio: number;
  duracionMinutos: number;
  modalidad: string; // "Present", "Virtual", "Mixed"
  servicios_ubicaciones: any[];
}

/**
 * Especialidad del doctor
 */
export interface DoctorNearbyEspecialidad {
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

/**
 * Ubicación del doctor
 */
export interface DoctorNearbyUbicacion {
  id: number;
  barrioId: number;
  direccion: string;
  codigoPostal: string | null;
  estado: string;
  creadoEn: string;
  id_doctor: number;
  nombre: string;
}

/**
 * Seguro aceptado por el doctor
 */
export interface DoctorNearbySeguro {
  doctorId: number;
  seguroId: number;
  tipoSeguroId: number;
  estado: string;
  creadoEn: string;
  actualizadoEn: string;
  seguro: {
    id: number;
    nombre: string;
    urlImage: string | null;
  };
  tipoSeguro: {
    id: number;
    nombre: string;
  };
}

/**
 * Doctor con información completa (usado en búsqueda por distancia)
 */
export interface DoctorNearby {
  usuarioId: number;
  estaConectado?: boolean;
  estadoAlianza?: string;
  solicitudAlianzaId?: number;
  nombre: string;
  apellido: string;
  tipoDocIdentificacion: string;
  cantidadResenas: number;
  numeroDocumentoIdentificacion: string;
  fechaNacimiento: string;
  genero: string;
  nacionalidad: string;
  exequatur: string;
  biografia: string;
  anosExperiencia: number;
  estadoVerificacion: string;
  calificacionPromedio: number;
  estado: string;
  creadoEn: string;
  actualizadoEn: string;
  duracionCitaPromedio: number;
  esFavorito: boolean;
  tarifas: number | null;
  usuario: {
    email: string;
    telefono: string;
    fotoPerfil: string;
  };
  especialidades: DoctorNearbyEspecialidad[];
  ubicaciones: DoctorNearbyUbicacion[];
  servicios: DoctorNearbyService[];
  segurosAceptados: DoctorNearbySeguro[];
  distanciaMetros: number;
  idiomas: {
    id: number;
    nombre: string;
  }[];
}

/**
 * Respuesta del endpoint GET /doctores/cercanos
 * Obtiene doctores dentro de un radio de distancia
 */
export interface GetDoctoresByDistanceResponse {
  success: boolean;
  total: number;
  doctores: DoctorNearby[];
  centros: CenterNearby[]; // Tipado para centros cercanos
  _translation?: {
    source: string;
    target: string;
    fields: string[];
    timestamp: string;
  };
}

/**
 * Tipo para representar centros de salud en respuestas de búsqueda por distancia
 */
export interface CenterNearby {
  usuarioId: number;
  estaConectado?: boolean;
  estadoAlianza?: string;
  solicitudAlianzaId?: number;
  nombreComercial?: string;
  rnc?: string;
  foto_perfil?: string | null;
  tipoCentro?: {
    id?: number;
    nombre?: string;
  };
  ubicacion?: {
    direccion?: string;
    codigoPostal?: string;
    nombre?: string;
    barrio?: {
      id?: number;
      nombre?: string;
    };
    direccionCompleta?: string;
    latitud?: number;
    longitud?: number;
    provincia?: string;
    municipio?: string;
  };
  usuario?: {
    id?: number;
    email?: string;
    telefono?: string;
    fotoPerfil?: string;
  };
  telefono?: string;
  descripcion?: string;
  sitio_web?: string;
  sitioWeb?: string;
  idiomas?: Array<{
    id?: number;
    nombre?: string;
    nivel?: string;
  }>;
  seguros?: Array<{
    id?: number;
    nombre?: string;
    urlImage?: string | null;
    tipoSeguro?: {
      id?: number;
      nombre?: string;
    };
  }>;
  servicios?: any[];
  distanciaMetros?: number;
  estado?: string;
  creadoEn?: string;
  actualizadoEn?: string | null;
}

export interface DoctorMyCenterRecord {
  solicitudId: number;
  aliadoDesde: string;
  centroSalud: {
    usuarioId: number;
    nombreComercial: string;
    tipoCentro?: {
      id: number;
      nombre: string;
    } | null;
    usuario?: {
      email?: string;
      telefono?: string;
      fotoPerfil?: string;
    } | null;
    ubicacion?: {
      id: number;
      direccion?: string;
      latitud?: number;
      longitud?: number;
      direccionCompleta?: string;
    } | null;
  };
}

export interface GetDoctorMyCentersResponse {
  success: boolean;
  data: DoctorMyCenterRecord[];
}

export interface DeleteDoctorAllianceResponse {
  success: boolean;
  message: string;
}

export interface UpdateStatusDoctorServiceRequest {
  estado: string; // "Activo" | "Inactivo"
}

export interface UpdateStatusDoctorServiceResponse {
  success: boolean;
  message: string;
  data: GetServicesOfDoctor;
}

export interface DeleteDoctorServiceResponse {
  success: boolean;
  message: string;
}

export type AddImageToServiceRequest = {
  id: number;
  imagenes : (File | Blob)[];
}

export interface AddImageToServiceResponse {
  success: boolean;
  message: string;
  data: {
    id: number;
    servicioId: number;
    url: string;
    orden: number;
    estado: string;
    creadoEn: string;
  }[];
}

export interface RemoveImageFromServiceResponse {
  success: boolean;
  message: string;
}

export interface RemoveServiceImageRequest {
  id: number;
  imagenId: number;
}

export interface UpdateDoctorServiceRequest {
  especialidadId?: number;
  nombre?: string;
  descripcion?: string;
  precio?: number;
  duracionMinutos?: number;
  sesiones?: number;
  maxPacientesDia?: number;
  modalidad?: string;
  estado?: string;
  centroSaludIds?: number[];
  ubicacionIds?: number[];
  horarioIds?: number[];
}

// --- TIPOS PARA DETALLE DEL SERVICIO ---

export interface ServiceDetailDoctor {
  usuarioId: number;
  nombre: string;
  apellido: string;
  tipoDocIdentificacion: string;
  numeroDocumentoIdentificacion: string;
  fechaNacimiento: string;
  genero: string;
  nacionalidad: string;
  exequatur: string;
  biografia: string;
  anosExperiencia: number;
  estadoVerificacion: string;
  calificacionPromedio: number;
  estado: string;
  creadoEn: string;
  actualizadoEn: string;
  duracionCitaPromedio: number;
  tarifas: number | null;
  usuario: {
    id: number;
    email: string;
    fotoPerfil: string;
  };
}

export interface ServiceDetailUbicacionBarrio {
  id: number;
  nombre: string;
  seccion: {
    id: number;
    nombre: string;
    id_municipio: number;
    distritoMunicipal: any | null;
    municipio: {
      id: number;
      nombre: string;
      provincia: {
        id: number;
        nombre: string;
      };
    };
  };
}

export interface ServiceDetailUbicacion {
  id: number;
  direccion: string;
  nombre: string;
  codigoPostal: string | null;
  barrio: ServiceDetailUbicacionBarrio;
  latitud: number;
  longitud: number;
}

export interface ServiceDetailResena {
  id: number;
  servicioId: number;
  pacienteId: number;
  calificacion: number;
  comentario: string;
  estado: string;
  creadoEn: string;
  paciente?: {
    id: number;
    nombre: string;
    apellido: string;
    fotoPerfil?: string;
    usuario?: {
      fotoPerfil?: string;
    };
  };
} 

export interface ServiceDetail {
  id: number;
  doctorId: number;
  especialidadId: number;
  nombre: string;
  descripcion: string;
  precio: number;
  duracionMinutos: number;
  maxPacientesDia: number | null;
  calificacionPromedio: number;
  modalidad: string;
  estado: string;
  creadoEn: string;
  actualizadoEn: string;
  imagenes: ServicioImagen[];
  doctor: ServiceDetailDoctor;
  especialidad: ServicioEspecialidad;
  horarios: ServicioHorario[];
  centros: any[];
  ubicacionId: number | null;
  ubicacion: ServiceDetailUbicacion[];
  resenas: ServiceDetailResena[];
}

export interface GetServiceByIdResponse {
  success: boolean;
  data: ServiceDetail;
}

// --- RE-EXPORTAR TIPOS RELACIONADOS ---

/**
 * Re-exportar tipos de autenticación para facilitar el uso
 */
export type { DoctorAuth as Doctor, DoctorEspecialidad, DoctorDocument };
