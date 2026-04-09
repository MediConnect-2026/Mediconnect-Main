export interface GeneralParams {
    /** Idioma destino para traducción automática */
    target?: string;
    /** Idioma origen para traducción automática (por defecto 'es') */
    source?: string;
    /** Campos a traducir separados por coma (ej: 'nombre,descripcion') */
    translate_fields?: string;
    /** Página actual */
    pagina?: number;
    /** Límite de resultados por página */
    limite?: number;
}


export interface SelectOption {
    value: string;
    label: string;
}


export interface Provincias {
    id: number;
    nombre: string;
    estado: 'Activo' | 'Inactivo' | 'Eliminado';
    creadoEn: string;
}


export interface Municipios {
    id: number;
    nombre: string;
    provinciaId: number;
    estado: 'Activo' | 'Inactivo' | 'Eliminado';
    creadoEn: string;
}

export interface DistritoMunicipal {
    id: number;
    nombre: string;
    municipioId: number;
    estado: 'Activo' | 'Inactivo' | 'Eliminado';
    creadoEn: string;
}

export interface Seccion {
    id: number;
    nombre: string;
    distritoMunicipalId: number | null;
    estado: 'Activo' | 'Inactivo' | 'Eliminado';
    creadoEn: string;
}

export interface Barrio {
    id: number;
    nombre: string;
    seccionId: number;
    estado: 'Activo' | 'Inactivo' | 'Eliminado';
    creadoEn: string;
}

export interface SubBarrio {
    id: number;
    nombre: string;
    barrioId: number;
    estado: 'Activo' | 'Inactivo' | 'Eliminado';
    creadoEn: string;
}

export interface ProvinciasResponse {
    success: boolean;
    data: Provincias[];
    count: number;
    message: string;
}

export interface MunicipiosResponse {
    success: boolean;
    data: Municipios[];
    count: number;
    message: string;
}

export interface DistritoMunicipalResponse {
    success: boolean;
    data: DistritoMunicipal[];
    count: number;
    message: string;
}

export interface SeccionResponse {
    success: boolean;
    data: Seccion[];
    count: number;
    message: string;
}

export interface BarrioResponse {
    success: boolean;
    data: Barrio[];
    count: number;
    message: string;
}

export interface SubBarrioResponse {
    success: boolean;
    data: SubBarrio[];
    count: number;
    message: string;
}

export interface createLocationRequest {
    barrioId: number;
    direccion: string;
    nombre: string;
    codigoPostal?: string;
    puntoGeografico: {
        type: 'Point';
        coordinates: [number, number];
    };
}

export interface UpdateLocationRequest {
    barrioId: number;
    direccion: string;
    codigoPostal?: string;
    estado?: 'Activo' | 'Inactivo' | 'Eliminado';
    puntoGeografico: {
        type: 'Point';
        coordinates: [number, number];
    };
}

export interface LocationResponse {
    id: number;
    barrioId: number;
    direccion: string;
    nombre: string;
    codigoPostal: string;
    estado: 'Activo' | 'Inactivo' | 'Eliminado';
    puntoGeografico: {
        type: 'Point';
        coordinates: [number, number];
    };
    creadoEn: string;
}

export interface CreateLocationResponse {
    success: boolean;
    data: LocationResponse;
    count: number;
}

export interface UpdateLocationResponse {
    success: boolean;
    data: LocationResponse;
    count: number;
}

export interface DoctorLocation {
  id: number;
  nombre: string;
  direccion: string;
  puntoGeografico: {
    type: string;
    coordinates: [number, number]; // [longitude, latitude]
  };
  barrio?: {
    id: number;
    nombre: string;
  };
  estado?: string;
}