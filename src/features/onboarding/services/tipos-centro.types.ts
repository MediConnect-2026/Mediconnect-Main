export interface TiposCentro {
  id: number;
  nombre: string;
  estado: 'Activo' | 'Inactivo' | 'Eliminado';
  creadoEn: string;
}

export interface TiposCentroCreateRequest {
  nombre: string;
  estado: 'Activo';
}

export interface TiposCentroCreateResponse {
  success: boolean;
  message: string;
  data: TiposCentro;
}

export interface TiposCentroUpdateRequest {
  id: number;
  nombre?: string;
  estado?: 'Activo' | 'Inactivo' | 'Eliminado';
}

export interface TiposCentroUpdateResponse {
  success: boolean;
  message: string;
  data: TiposCentro;
}

export interface TipoCentroResponse {
  success: boolean;
  data: TiposCentro[];
  paginacion: {
    total: number;
    pagina: number;
    limite: number;
    totalPaginas: number;
  };
}

export interface TipoCentroParams {
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
