/**
 * Tipos para el servicio de especialidades médicas
 */

export interface Especialidad {
  id: number;
  nombre: string;
  descripcion?: string;
  estado: 'Activo' | 'Inactivo' | 'Eliminado';
  fecha_creacion: string;
  fecha_actualizacion: string;
}

export interface EspecialidadesResponse {
  success: boolean;
  data: Especialidad[];
  paginacion: {
    total: number;
    pagina: number;
    limite: number;
    totalPaginas: number;
  };
}

export interface EspecialidadesParams {
  /** Idioma destino para traducción automática */
  target?: string;
  /** Idioma origen para traducción automática (por defecto 'es') */
  source?: string;
  /** Campos a traducir separados por coma (ej: 'nombre,descripcion') */
  translate_fields?: string;
  /** Filtrar por nombre (búsqueda parcial) */
  nombre?: string;
  /** Filtrar por estado */
  estado?: 'Activo' | 'Inactivo' | 'Eliminado';
  /** Página actual */
  pagina?: number;
  /** Límite de resultados por página */
  limite?: number;
}

export interface SelectOption {
  value: string;
  label: string;
}
